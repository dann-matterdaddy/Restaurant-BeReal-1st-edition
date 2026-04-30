const db = require('../config/database');

class Review {
  static async create(reviewData) {
    const { restaurant_id, user_id, food_rating, service_rating, ambiance_rating, overall_rating, title, comment } = reviewData;
    
    const query = `
      INSERT INTO reviews (restaurant_id, user_id, food_rating, service_rating, ambiance_rating, overall_rating, title, comment, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [restaurant_id, user_id, food_rating, service_rating, ambiance_rating, overall_rating, title, comment]);
    return result.rows[0];
  }

  static async findByRestaurant(restaurantId, limit = 20, offset = 0) {
    const query = `
      SELECT 
        rev.*,
        u.username,
        u.avatar_url
      FROM reviews rev
      JOIN users u ON rev.user_id = u.id
      WHERE rev.restaurant_id = $1
      ORDER BY rev.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [restaurantId, limit, offset]);
    return result.rows;
  }

  static async findById(reviewId) {
    const query = `
      SELECT rev.*, u.username, u.avatar_url
      FROM reviews rev
      JOIN users u ON rev.user_id = u.id
      WHERE rev.id = $1
    `;
    
    const result = await db.query(query, [reviewId]);
    return result.rows[0];
  }

  static async update(reviewId, updates) {
    const { title, comment, food_rating, service_rating, ambiance_rating, overall_rating } = updates;
    
    const query = `
      UPDATE reviews 
      SET title = $1, comment = $2, food_rating = $3, service_rating = $4, ambiance_rating = $5, overall_rating = $6, updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const result = await db.query(query, [title, comment, food_rating, service_rating, ambiance_rating, overall_rating, reviewId]);
    return result.rows[0];
  }

  static async delete(reviewId) {
    const query = 'DELETE FROM reviews WHERE id = $1 RETURNING id';
    const result = await db.query(query, [reviewId]);
    return result.rows[0];
  }

  static async helpful(reviewId, userId) {
    const query = `
      INSERT INTO review_helpful (review_id, user_id) VALUES ($1, $2)
      ON CONFLICT DO NOTHING
      RETURNING *
    `;
    
    const result = await db.query(query, [reviewId, userId]);
    return result.rows[0];
  }
}

module.exports = Review;