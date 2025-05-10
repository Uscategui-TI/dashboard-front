import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");

      if (typeof window !== "undefined" && window.location.pathname !== "/signin") {
        window.location.href = "/signin";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;