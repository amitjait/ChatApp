import { UserModel } from "../models/userModel.js";

export class UserController {
  async createUser(req, res) {
    try {
      const userRes = await UserModel.createUser(req.body);
      return res.send({
        statusCode: 201,
        message: "User created successfully",
        data: userRes?.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
  async getUserById(req, res) {
    try {
      const userRes = await UserModel.getUserById(req.params.id);
      return res.send({
        statusCode: 200,
        message: "User fetched successfully",
        data: userRes?.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const usersRes = await UserModel.getUsers();
      return res.send({
        statusCode: 200,
        message: "Users fetched successfully",
        data: usersRes?.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(404).json({ message: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const userRes = await UserModel.updateUser(req.body);
      return res.send({
        statusCode: 200,
        message: "User updated successfully",
        data: userRes?.data,
      });
    } catch (error) {
      console.error(error);
      return res.status(400).json({ message: error.message });
    }
  }
}
