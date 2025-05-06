
import axios from "axios";

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // if (error.response?.status === 401) {
    //   if (typeof window !== "undefined") {
    //     // Token expirado: redirigir
    //     window.location.href = "/signin";
    //   }
    // }
    // return Promise.reject(error);
  }
);

export default axiosInstance;
