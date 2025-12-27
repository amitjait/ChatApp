import bcrypt from "bcryptjs";
import { getPool } from "../config/azureDb.js";

export class UserModel {
  // ✅ CREATE USER
  static async createUser(body) {
    const { name, email, password } = body;

    if (!name || !email || !password) {
      throw new Error("All fields are required");
    }

    const pool = await getPool();

    // check if user exists
    const existing = await pool
      .request()
      .input("email", email)
      .query("SELECT id FROM users WHERE email = @email");

    if (existing.recordset.length > 0) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool
      .request()
      .input("name", name)
      .input("email", email)
      .input("pass", password) // plain password
      .input("password", hashedPassword) // hashed password
      .query(`
    INSERT INTO users (name, email, password, pass)
    OUTPUT INSERTED.id, INSERTED.name, INSERTED.email, INSERTED.createdAt
    VALUES (@name, @email, @password, @pass)
  `);

    return {
      statusCode: 201,
      data: result.recordset[0],
    };
  }

  // ✅ GET USER BY ID
  static async getUserById(id) {
    const pool = await getPool();

    // 1️⃣ Fetch basic user info
    const userResult = await pool.request().input("id", id).query(`
      SELECT id, name, email, createdAt
      FROM users
      WHERE id = @id
    `);

    if (!userResult.recordset.length) {
      throw new Error("User not found");
    }

    const user = userResult.recordset[0];

    // 2️⃣ Fetch only group IDs the user belongs to
    const groupsResult = await pool.request().input("userId", id).query(`
      SELECT groupId
      FROM group_members
      WHERE userId = @userId
    `);

    // Attach array of group IDs
    user.groups = groupsResult.recordset.map((g) => g.groupId);

    return {
      statusCode: 200,
      data: user,
    };
  }

  // ✅ GET ALL USERS
  static async getUsers() {
    const pool = await getPool();

    const result = await pool.query(`
      SELECT id, name, email, createdAt
      FROM users
      ORDER BY createdAt DESC
    `);

    return {
      statusCode: 200,
      data: result.recordset,
    };
  }

  // ✅ UPDATE USER
  static async updateUser(body) {
    const { id, name, email, password } = body;

    if (!id) {
      throw new Error("User ID is required");
    }

    const pool = await getPool();

    if (password) {
      const hashed = await bcrypt.hash(password, 10);

      await pool.request().input("id", id).input("password", hashed).query(`
          UPDATE users SET password = @password WHERE id = @id
        `);
    }

    if (name || email) {
      await pool
        .request()
        .input("id", id)
        .input("name", name)
        .input("email", email).query(`
          UPDATE users
          SET
            name = COALESCE(@name, name),
            email = COALESCE(@email, email)
          WHERE id = @id
        `);
    }

    const updated = await pool.request().input("id", id).query(`
        SELECT id, name, email, createdAt
        FROM users
        WHERE id = @id
      `);

    return {
      statusCode: 200,
      data: updated.recordset[0],
    };
  }
}
