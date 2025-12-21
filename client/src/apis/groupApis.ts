import { axiosInstance } from "./configs/axiosConfig";

const createGroup = async (groupName: string, members: string[]) => {
  try {
    const response = await axiosInstance.post("/group/create", {
      groupName,
      members,
    });

    return {
      status: 201,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to create group");
  }
};

const getGroups = async () => {
  try {
    const response = await axiosInstance.get("/group/get");

    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get groups");
  }
};

const getMembersByGroupId = async (groupId: string) => {
  try {
    const response = await axiosInstance.get(`/group/getMembers/${groupId}`);

    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get members by groupId");
  }
};

export { createGroup, getGroups, getMembersByGroupId };
