"use client";

import { useEffect, useRef } from "react";
import axios from "@/lib/axiosInstance";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";


export function useUserActivityTracker() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastInteractionRef = useRef<number>(0);
  const isRequesting = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const updateUserActivity = async () => {
      if (isRequesting.current) return;

      isRequesting.current = true;

      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/activate`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data.token) {
          Cookies.set("token", res.data.token);
        }
      } catch (err) {
      } finally {
        isRequesting.current = false;
      }
    };

    const handleActivity = () => {
      const now = Date.now();
      const timeSinceLast = now - lastInteractionRef.current;

      if (timeSinceLast > 60000) {
        lastInteractionRef.current = now;
        updateUserActivity();
      }

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        lastInteractionRef.current = 0;
      }, 60000);
    };

    window.addEventListener("click", handleActivity);
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);

    updateUserActivity(); // inicial

    return () => {
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);
}

