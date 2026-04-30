const db = require('../config/database');

class Restaurant {
  static async create(restaurantData) {
    const { name, address, latitude, longitude, cuisine_type, phone, website } = restaurantData;
    
    const query = `
      INSERT INTO restaurants (name, address, latitude, longitude, cuisine_type, phone, website, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [name, address, latitude, longitude, cuisine_type, phone, website]);
    return result.rows[0];
  }

  static async findNearby(latitude, longitude, radiusKm = 5) {
    const query = `
      SELECT 
        r.*,
        COUNT(DISTINCT rev.id) as total_reviews,
        AVG(rev.food_rating) as avg_food_rating,
        AVG(rev.service_rating) as avg_service_rating,
        AVG(rev.ambiance_rating) as avg_ambiance_rating,
        (6371 * acos(cos(radians($1)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians($2)) + sin(radians($1)) * sin(radians(r.latitude)))) AS distance
      FROM restaurants r
      LEFT JOIN reviews rev ON r.id = rev.restaurant_id
      WHERE (6371 * acos(cos(radians($1)) * cos(radians(r.latitude)) * cos(radians(r.longitude) - radians($2)) + sin(radians($1)) * sin(radians(r.latitude)))) <= $3
      GROUP BY r.id
      ORDER BY distance
      LIMIT 50
    `;
    
    const result = await db.query(query, [latitude, longitude, radiusKm]);
    return result.rows;
  }

  static async findById(restaurantId) {
    const query = `
      SELECT 
        r.*,
        COUNT(DISTINCT rev.id) as total_reviews,
        AVG(rev.food_rating) as avg_food_rating,
        AVG(rev.service_rating) as avg_service_rating,
        AVG(rev.ambiance_rating) as avg_ambiance_rating,
        COUNT(DISTINCT ci.id) as current_occupancy
      FROM restaurants r
      LEFT JOIN reviews rev ON r.id = rev.restaurant_id
      LEFT JOIN check_ins ci ON r.id = ci.restaurant_id AND ci.created_at > NOW() - INTERVAL '1 hour'
      WHERE r.id = $1
      GROUP BY r.id
    `;
    
    const result = await db.query(query, [restaurantId]);
    return result.rows[0];
  }

  static async search(keyword) {
    const query = `
      SELECT * FROM restaurants 
      WHERE name ILIKE $1 OR cuisine_type ILIKE $1 OR address ILIKE $1
      LIMIT 20
    `;
    
    const result = await db.query(query, [`%${keyword}%`]);
    return result.rows;
  }
}

module.exports = Restaurant;