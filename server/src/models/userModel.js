import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../database/db.js";

export class UserModel {
  static async createUser(body) {
    try {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        throw new Error("All fields are required");
      }

      const db = readDB();
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = {
        id: Date.now().toString(),
        name,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        pass: password,
        groups: [],
      };

      db.users.push(user);
      writeDB(db);

      return {
        statusCode: 201,
        data: user,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }

  static async getUserById(id) {
    try {
      const db = readDB();
      const user = db.users.find((u) => u.id === id);

      if (!user) {
        throw new Error("User not found");
      }

      const { password, pass, ...safeUser } = user;
      return {
        statusCode: 200,
        data: safeUser,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }

  static async getUsers() {
    try {
      const db = readDB();
      const users = db.users;
      const safeUsers = users.map(({ password, pass, ...u }) => u);

      return {
        statusCode: 200,
        data: safeUsers,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }

  static async updateUser(body) {
    try {
      const db = readDB();
      const userIndex = db.users.findIndex((u) => u.id === body.id);

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const { name, email, password } = body;

      if (name) db.users[userIndex].name = name;
      if (email) db.users[userIndex].email = email;

      if (password) {
        db.users[userIndex].password = await bcrypt.hash(password, 10);
      }

      writeDB(db);

      const { password: _, ...safeUser } = db.users[userIndex];
      return {
        statusCode: 200,
        data: safeUser,
      };
    } catch (error) {
      console.error(error);
      throw new Error(`${error.message}`);
    }
  }
}
