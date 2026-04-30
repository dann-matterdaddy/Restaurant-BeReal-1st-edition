const db = require('../config/database');

class CheckIn {
  static async create(checkInData) {
    const { restaurant_id, user_id, photo_url, caption, latitude, longitude } = checkInData;
    
    const query = `
      INSERT INTO check_ins (restaurant_id, user_id, photo_url, caption, latitude, longitude, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING *
    `;
    
    const result = await db.query(query, [restaurant_id, user_id, photo_url, caption, latitude, longitude]);
    return result.rows[0];
  }

  static async findByRestaurant(restaurantId, limit = 50) {
    const query = `
      SELECT 
        ci.*,
        u.username,
        u.avatar_url,
        r.name as restaurant_name
      FROM check_ins ci
      JOIN users u ON ci.user_id = u.id
      JOIN restaurants r ON ci.restaurant_id = r.id
      WHERE ci.restaurant_id = $1
      ORDER BY ci.created_at DESC
      LIMIT $2
    `;
    
    const result = await db.query(query, [restaurantId, limit]);
    return result.rows;
  }

  static async findFeed(userId, limit = 50, offset = 0) {
    const query = `
      SELECT 
        ci.*,
        u.username,
        u.avatar_url,
        r.name as restaurant_name,
        COUNT(DISTINCT l.id) as likes_count,
        EXISTS(SELECT 1 FROM likes l WHERE l.check_in_id = ci.id AND l.user_id = $1) as user_liked
      FROM check_ins ci
      JOIN users u ON ci.user_id = u.id
      JOIN restaurants r ON ci.restaurant_id = r.id
      LEFT JOIN likes l ON ci.id = l.check_in_id
      WHERE u.id IN (SELECT following_id FROM follows WHERE follower_id = $1) OR u.id = $1
      GROUP BY ci.id, u.id, r.id
      ORDER BY ci.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await db.query(query, [userId, limit, offset]);
    return result.rows;
  }

  static async delete(checkInId) {
    const query = 'DELETE FROM check_ins WHERE id = $1 RETURNING id';
    const result = await db.query(query, [checkInId]);
    return result.rows[0];
  }

  static async getRandomPromptTime() {
    const randomHour = Math.floor(Math.random() * 24);
    const randomMinute = Math.floor(Math.random() * 60);
    return { hour: randomHour, minute: randomMinute };
  }
}

module.exports = CheckIn;