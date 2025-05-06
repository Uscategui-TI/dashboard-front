"use client";

import { useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

export function useUserActivityTracker() {
  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const ping = () => {
      axios.post(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/activate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      ).catch(err => {
        console.warn("⚠️ Falló el ping de actividad:", err);
      });
    };

    ping(); // Al iniciar
    const interval = setInterval(ping, 60 * 1000); // Cada minuto

    return () => clearInterval(interval);
  }, []);
}
