import WhatPanelPage from "@/components/campaigns/what-panel/What-PanelForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title:
      "Uscategui What-Panel",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function WhatPanel() {
    return <WhatPanelPage />;
  }
  