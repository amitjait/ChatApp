import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/auth.js";
import { getPool } from "../config/azureDb.js";
import { UserModel } from "./userModel.js";

export class AuthModel {
  /* ================= SIGNUP ================= */
  static async signup(body) {
    try {
      const { name, email, password } = body;

      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      // Create user in DB
      const res = await UserModel.createUser({ name, email, password });
      const user = res.data;

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      return {
        statusCode: 201,
        data: { token, user },
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }

  /* ================= LOGIN ================= */
  static async login(body) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        throw new Error("Email and password required");
      }

      const pool = await getPool();

      // Fetch user by email
      const result = await pool.request().input("email", email).query(`
          SELECT id, name, email, password
          FROM users
          WHERE email = @email
        `);

      if (!result.recordset.length) {
        throw new Error("Invalid credentials");
      }

      const user = result.recordset[0];

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Remove password before returning
      delete user.password;

      return {
        statusCode: 200,
        data: { token, user },
      };
    } catch (error) {
      console.error(error);
      throw new Error(error.message);
    }
  }
}
