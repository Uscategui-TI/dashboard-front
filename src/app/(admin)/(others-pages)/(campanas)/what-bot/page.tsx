
import BotConnection from "@/components/campaigns/what-bot/what-botconection";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
      "Uscategui What-Panel",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function whatbot() {
    return <BotConnection />;
  }
  