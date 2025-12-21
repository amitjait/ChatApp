import { axiosInstance } from "./configs/axiosConfig.js";

export interface ApiResponse<T> {
  status: number;
  data: T;
}

export const fetchUsersApi = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get("/users");

    return {
      status: 200,
      data: res?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch users");
  }
};

export const fetchGroupsApi = async (): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get("/group");

    return {
      status: 200,
      data: res?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch groups");
  }
};
