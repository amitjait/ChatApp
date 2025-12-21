const API_URL = import.meta.env.VITE_API_URL as string;
import axios from "axios";

export const signUp = async (
  name: string,
  email: string,
  password: string
): Promise<{
  status: number;
  data: any;
}> => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password,
    });

    return {
      status: 201,
      data: response?.data,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Registration failed");
  }
};

export const signIn = async (
  email: string,
  password: string
): Promise<{
  status: number;
  data: any;
}> => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: email?.toLowerCase(),
      password,
    });

    return {
      status: 200,
      data: response?.data,
    };
  } catch (error: any) {
    console.error({ error });
    return { status: 500, data: { message: error?.response?.data?.msg } };
  }
};
