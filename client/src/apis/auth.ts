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
    const response = await axios.post(`/auth/register`, {
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
    const response = await axios.post(`/auth/login`, {
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
