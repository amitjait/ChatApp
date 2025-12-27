import { axiosInstance } from "./configs/axiosConfig";
import { ApiResponse } from "./fetchApis";

export const getPrivateMessages = async (
  userId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.get(`message/private/${userId}`);

    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get private messages");
  }
};

/* ---------------- GET GROUP MESSAGES ---------------- */

export const getGroupMessages = async (
  groupId: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.get(`message/group/${groupId}`);

    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get group messages");
  }
};

/* ---------------- GET ALL MY MESSAGES ---------------- */

export const getAllMyMessages = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.get("message/me");
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get all my messages");
  }
};

/* ---------------- SAVE PRIVATE MESSAGE ---------------- */

export interface SavePrivateMessagePayload {
  receiverId: string;
  content: string;
}

export const savePrivateMessage = async (
  payload: SavePrivateMessagePayload
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("message/private", payload); // TODO: FIX THIS
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save private message");
  }
};

/* ---------------- SAVE GROUP MESSAGE ---------------- */

export interface SaveGroupMessagePayload {
  groupId: string;
  content: string;
}

export const saveGroupMessage = async (
  payload: SaveGroupMessagePayload
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("message/group", payload);
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save group message");
  }
};

export interface SavePrivateFilePayload {
  receiverId: string;
  fileUrl: string;
  fileName: string;
  blobName: string;
}

export const savePrivateFile = async (
  payload: SavePrivateFilePayload
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("message/private", payload);
    console.log({ response });
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save private message");
  }
};

export interface SaveGroupFilePayload {
  groupId: string;
  fileUrl: string;
  fileName: string;
  blobName: string;
}

export const saveGroupFile = async (
  payload: SaveGroupFilePayload
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("message/group", payload);
    console.log({ response });
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save group message");
  }
};

export const uploadFile = async (
  file: File,
  blobName: string
): Promise<ApiResponse<any>> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    console.log({ blobName });
    formData.append("blobName", blobName);

    const response = await axiosInstance.post("file/upload", formData);
    console.log({ response });
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file");
  }
};

export const generateSasUrl = async (
  fileName: string
): Promise<ApiResponse<any>> => {
  try {
    const response = await axiosInstance.post("file/generateSasUrl", {
      fileName,
    });
    console.log({ response });
    return {
      status: 200,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate SAS URL");
  }
};
