"use client";

import { useEffect } from "react";
import axios from "axios";

export function useUserActivityTracker() {
  useEffect(() => {
    const hasToken = document.cookie.includes("token=");
    if (!hasToken) return;
    const ping = () => {
      axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/activate`, {}, { withCredentials: true })
        .catch(err => console.warn("⚠️ Falló el ping de actividad:", err));
    };

    ping(); // al iniciar
    const interval = setInterval(ping, 60 * 1000); // cada minuto

    return () => clearInterval(interval);
  }, []);
}
