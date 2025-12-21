import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../database/db.js";
import { JWT_SECRET } from "../config/auth.js";
import jwt from "jsonwebtoken";
import { UserModel } from "./userModel.js";

const db = readDB();

export class AuthModel {
  static async signup(body) {
    try {
      const { name, email, password } = body;

      const db = readDB();
      const hashedPassword = await bcrypt.hash(password, 10);

      const res = await UserModel.createUser({
        name,
        email,
        password,
      });

      const user = res?.data;

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email, groups: [] },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return {
        statusCode: 201,
        data: { token, user },
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }

  static async login(body) {
    try {
      const { email, password } = body;

      if (!email || !password) {
        throw new Error("Email and password required");
      }

      const db = readDB();
      const user = db.users.find((u) => u.email === email);

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      const token = jwt.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          groups: user.groups,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return {
        statusCode: 200,
        data: { token, user },
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }
}
