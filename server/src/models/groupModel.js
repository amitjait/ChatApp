import bcrypt from "bcryptjs";
import { readDB, writeDB } from "../database/db.js";

const db = readDB();

export class GroupModel {
  static async createGroup(body) {
    try {
      const { groupName, members = [], user } = body;
      const userId = user?.id;

      if (!userId) {
        throw new Error("userId is required");
      }
      if (!groupName) throw new Error("groupName is required");
      if (!Array.isArray(members)) throw new Error("Members must be an array");

      db.groups ||= [];

      // Ensure unique members including creator
      const uniqueMembers = Array.from(new Set([...members, userId]));

      const group = {
        id: Date.now().toString(),
        name: groupName,
        members: uniqueMembers,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      };

      // Update users' groups
      db.users ||= [];
      const userMap = Object.fromEntries(db.users.map((u) => [u.id, u]));

      uniqueMembers.forEach((memberId) => {
        const user = userMap[memberId];
        if (!user) return;

        user.groups ||= [];
        if (!user.groups.includes(group.id)) user.groups.push(group.id);
      });

      db.groups.push(group);
      writeDB(db);

      return {
        statusCode: 201,
        message: "Group created successfully",
        data: group,
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        message: "Internal server error: Failed to create group",
      };
    }
  }

  static async getGroups(body) {
    try {
      const { user } = body;
      const userId = user?.id;

      const db = readDB();
      db.groups ||= [];

      const groups = db.groups.filter((g) => g.members.includes(user.id));

      return {
        statusCode: 200,
        message: "Groups fetched successfully",
        data: groups,
      };
    } catch (err) {
      console.error(err);
      throw new Error(`${err.message}`);
    }
  }

  static async getMembersByGroupId(body) {
    try {
      const { groupId, user } = body;
      const userId = user?.id;

      const db = readDB();
      db.groups ||= [];
      db.users ||= [];

      const group = db.groups.find((g) => g.id === groupId);

      if (!group) throw new Error("Group not found");
      if (!group.members.includes(userId))
        throw new Error("You are not a member of this group");

      const members = db.users.filter((u) => group.members.includes(u.id));

      return {
        statusCode: 200,
        message: "Members fetched successfully",
        data: members,
      };
    } catch (err) {
      console.error(err);
      throw new Error(`${err.message}`);
    }
  }
}
