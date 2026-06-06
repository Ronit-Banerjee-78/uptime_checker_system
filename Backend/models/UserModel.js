import { query } from "../db/pool.js";

import Hashing from "../services/hash.js";
import logger from "../services/logger_serv.js";

class UserModel {
  static async createUser(data) {
    const { name, email, password } = data;

    const hashedPassword = await Hashing.hashingData(password);
    try {
      const result = await query(
        "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id",
        [name, email, hashedPassword],
      );
      logger.info("User Created Succesfully", result);
      return {
        success: true,
        id: result.rows[0].id,
        name,
        email,
      };
    } catch (error) {
      logger.warn("Unexpected error", error);
      logger.error(error.message);
    }
  }

  static async updateUser(userId, updateData) {
    if (!userId) {
      logger.error("User ID is required");
      return "User ID missing";
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      logger.warn("No fields provided for update");
      return "No data to update";
    }

    try {
      const existingUser = await query("SELECT id FROM users WHERE id = $1", [
        userId,
      ]);

      if (existingUser.rows.length === 0) {
        logger.warn("User not found");
        return "User not found";
      }

      const fields = Object.keys(updateData);
      const values = Object.values(updateData);

      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(", ");

      const sql = `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1}`;

      await query(sql, [...values, userId]);

      logger.info("User updated successfully");

      return true;
    } catch (error) {
      logger.error("Update error:", error.message);
      return "Unexpected error";
    }
  }

  static async getUser(userId) {
    try {
      const result = await query(
        "SELECT id, name, email, created_at FROM users WHERE id= $1",
        [userId],
      );
      if (result.rows.length == 0) {
        logger.warn("No user found");
        return "No User Found";
      }
      const user = result.rows[0];
      logger.info("User Details Shared", user);
      return user;
    } catch (error) {
      logger.warn("Unexpected error", error);
      logger.error(error.message);
    }
  }
  static async getAllUser() {
    try {
      const result = await query(
        "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC",
      );
      if (result.rows.length == 0) {
        logger.warn("No user found");
        return "No User Found";
      }

      logger.info("User Details Shared", result.rows[0]);
      return result.rows;
    } catch (error) {
      logger.warn("Unexpected error", error);
      logger.error(error.message);
    }
  }
  static async getUserByEmail(email_id) {
    try {
      const result = await query("SELECT * FROM users WHERE email = $1", [
        email_id,
      ]);
      return result.rows[0];
    } catch (error) {
      logger.warn(error.message);
    }
  }

  static async deleteUser(userId) {
    try {
      const result = await query("DELETE FROM users WHERE id = $1", [userId]);
      return result.rowCount > 0;
    } catch (error) {
      logger.warn("Unexpected error", error);
    }
  }
}
export default UserModel;
