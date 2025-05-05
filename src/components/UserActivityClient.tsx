
"use client";

import { useUserActivityTracker } from "@/hooks/useUserActivityTracker";

export default function UserActivityClient() {
  useUserActivityTracker();
  return null; 
}
