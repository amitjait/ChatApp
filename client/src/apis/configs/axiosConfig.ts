import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
const API_URL = import.meta.env.VITE_API_URL || "";

export let axiosInstance = axios.create({ baseURL: API_URL });

let accessToken: string | null = null;

let accessTokenLastUpdatedTimeStamp: number | null = null;
let initiateSessionExpiredFunction: (() => void) | null = null;
let isSessionExpiring = false;

export const setAccessToken = (
  token: string,
  accessTokenLastGeneratedAt: number,
  initiateSessionExpiredFunc: () => void
): Promise<void> => {
  accessToken = token;
  accessTokenLastUpdatedTimeStamp = accessTokenLastGeneratedAt;
  initiateSessionExpiredFunction = initiateSessionExpiredFunc;
  isSessionExpiring = false;

  return Promise.resolve();
};

const setupInterceptors = (instance: AxiosInstance): void => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );
};

setupInterceptors(axiosInstance);
