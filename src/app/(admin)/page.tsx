import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title:
    "Uscategui Panel",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function Ecommerce() {
  return (
    <Dashboard/>
  );
}
