import { JWT_SECRET } from "../config/auth.js";
import { AuthModel } from "../models/authModel.js";
import { readDB, writeDB } from "../database/db.js";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export class AuthController {
  async signup(req, res) {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      const db = await readDB();

      if (db.users.some((u) => u.email === email)) {
        throw new Error("Email already exists");
      }

      const response = await AuthModel.signup({
        name,
        email,
        password,
      });

      res.send({
        statusCode: 201,
        message: "Signup successful",
        data: response?.data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: "Internal server error" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new Error("Email and password required");
      }

      const response = await AuthModel.login({
        email,
        password,
      });

      res.send({
        statusCode: 200,
        message: "Login successful",
        data: response?.data,
      });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: `Internal server error: ${err.message}` });
    }
  }
}
