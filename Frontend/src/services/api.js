import axios from "../config/axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`,
  withCredentials: true,
});

API.interceptors.request.use(
  (req) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

    if (userInfo.token) {
      req.headers.Authorization = `Bearer ${userInfo.token}`;
    }

    return req;
  },
  (error) => Promise.reject(error)
);

export default API;