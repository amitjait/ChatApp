import { getPool } from "../config/azureDb.js";

export class GroupModel {
  /* ============ CREATE GROUP ============ */
  static async createGroup(body) {
    try {
      const { groupName, members = [], user } = body;
      const userId = user?.id;

      if (!userId) throw new Error("userId is required");
      if (!groupName) throw new Error("groupName is required");

      const pool = await getPool();

      // Ensure creator is part of group
      const uniqueMembers = Array.from(new Set([...members, userId]));

      // 1️⃣ Insert group
      const groupResult = await pool
        .request()
        .input("name", groupName)
        .input("createdBy", userId).query(`
          INSERT INTO groups (name, createdBy)
          OUTPUT INSERTED.*
          VALUES (@name, @createdBy)
        `);

      const group = groupResult.recordset[0];

      // 2️⃣ Insert members into join table
      for (const memberId of uniqueMembers) {
        await pool
          .request()
          .input("groupId", group.id)
          .input("userId", memberId).query(`
            INSERT INTO group_members (groupId, userId)
            VALUES (@groupId, @userId)
          `);
      }

      // 3️⃣ Fetch member IDs only
      const membersResult = await pool.request().input("groupId", group.id)
        .query(`
          SELECT userId
          FROM group_members
          WHERE groupId = @groupId
        `);

      group.members = membersResult.recordset.map((r) => r.userId);

      return {
        statusCode: 201,
        message: "Group created successfully",
        data: group,
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        message: err.message,
      };
    }
  }

  /* ============ GET MY GROUPS ============ */
  static async getGroups(body) {
    try {
      const { user } = body;
      const userId = user?.id;

      const pool = await getPool();

      // Get groups the user belongs to
      const result = await pool.request().input("userId", userId).query(`
          SELECT g.*
          FROM groups g
          INNER JOIN group_members gm
            ON g.id = gm.groupId
          WHERE gm.userId = @userId
          ORDER BY g.createdAt DESC
        `);

      // For each group, fetch members (IDs only)
      const groupsWithMembers = [];
      for (const group of result.recordset) {
        const membersResult = await pool.request().input("groupId", group.id)
          .query(`
            SELECT userId
            FROM group_members
            WHERE groupId = @groupId
          `);

        groupsWithMembers.push({
          ...group,
          members: membersResult.recordset.map((r) => r.userId),
        });
      }

      return {
        statusCode: 200,
        data: groupsWithMembers,
      };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  }

  /* ============ GET GROUP MEMBERS ============ */
  static async getMembersByGroupId(body) {
    try {
      const { groupId, user } = body;
      const userId = user?.id;

      const pool = await getPool();

      // Check if requesting user is a member
      const check = await pool
        .request()
        .input("groupId", groupId)
        .input("userId", userId).query(`
          SELECT 1
          FROM group_members
          WHERE groupId = @groupId AND userId = @userId
        `);

      if (!check.recordset.length) {
        throw new Error("You are not a member of this group");
      }

      // Fetch member IDs only
      const membersResult = await pool.request().input("groupId", groupId)
        .query(`
          SELECT userId
          FROM group_members
          WHERE groupId = @groupId
        `);

      return {
        statusCode: 200,
        data: membersResult.recordset.map((r) => r.userId),
      };
    } catch (err) {
      console.error(err);
      throw new Error(err.message);
    }
  }
}
