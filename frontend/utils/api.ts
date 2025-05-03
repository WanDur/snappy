import { BASE_URL } from "@/constants/server";
import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

export default api;
