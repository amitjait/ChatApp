import { GroupModel } from "../models/groupModel.js";

export class GroupController {
  async createGroup(req, res) {
    try {
      const { groupName, members = [] } = req.body;
      const userId = req.user?.id;

      if (!userId) throw new Error("Unauthorized");
      if (!groupName) throw new Error("Group name is required");
      if (!Array.isArray(members)) throw new Error("Members must be an array");

      const group = await GroupModel.createGroup({
        groupName,
        members,
        user: req.user,
      });

      res.send({
        statusCode: 201,
        message: "Group created successfully",
        data: group,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: "Internal server error: Failed to create group",
      });
    }
  }

  async getGroups(req, res) {
    try {
      if (!req.user?.id) {
        throw new Error("Unauthorized");
      }

      const groups = await GroupModel.getGroups({
        user: req.user,
      });

      res.send({
        statusCode: 200,
        message: "Groups fetched successfully",
        data: groups?.data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: `Internal server error: Failed to get groups : ${err.message}`,
      });
    }
  }

  async getMembersByGroupId(req, res) {
    try {
      const { groupId } = req.params;
      if (!req.user?.id) {
        throw new Error("Unauthorized");
      }

      const members = await GroupModel.getMembersByGroupId({
        groupId,
        user: req.user,
      });

      res.send({
        statusCode: 200,
        message: "Members fetched successfully",
        data: members?.data,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        msg: `Internal server error: Failed to get members by groupId : ${err.message}`,
      });
    }
  }
}
