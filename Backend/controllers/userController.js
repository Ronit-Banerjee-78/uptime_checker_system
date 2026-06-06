import UserModel from "../models/UserModel.js";
import Tokens from "../services/token.js";
import Hashing from "../services/hash.js";
import logger from "../services/logger_serv.js";
import { tryCatch } from "bullmq";

class UserController {
  static async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }
      const checkUser = await UserModel.getUserByEmail(email);
      if (checkUser)
        return res
          .status(401)
          .json({ message: "Allready a register user,Login Please" });
      const newUser = await UserModel.createUser({ name, email, password });
      return res.status(201).json({
        success: true,
        message: "User created successfully",
        newUser,
      });
    } catch (error) {
      next(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }
      const user = await UserModel.getUserByEmail(email);
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found, Please Register" });
      }
      const pass_user = user.password;

      const isMatched = await Hashing.compareData(password, pass_user);
      if (!isMatched) {
        return res.status(401).json({
          message: "Invalid credentials",
        });
      }
      const token = await Tokens.generatesToken({ user });
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user,
      });
    } catch (error) {
      next(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user_id = req.params.id;
      const user = await UserModel.getUserById(user_id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(200).json({
        success: true,
        message: "Profile retrieved successfully",
        user,
      });
    } catch (error) {
      next(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
  static async updateProfile(req, res, next) {
    try {
      const user_id = req.params.id;
      const updateData = req.body;
      const updatedUser = await UserModel.updateUser(user_id, updateData);
      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        updatedUser,
      });
    } catch (error) {
      next(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
  static async deleteProfile(req, res, next) {
    try {
      const user_id = req.params.id;
      const isDeleted = await UserModel.deleteUser(user_id);
      if (!isDeleted) {
        return res.status(404).json({ message: "User not found" });
      } else {
        return res.status(200).json({
          success: true,
          message: "Profile deleted successfully",
        });
      }
    } catch (error) {
      next(error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
  static async getAlluser(req, res, next) {
    try {
    } catch (error) {}
  }
}

export default UserController;
