import type { Metadata } from "next";
import PanelProspectComponent from "@/components/prospect/panel/Panel";

export const metadata: Metadata = {
  title: "Uscategui Panel-Prospectos",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function PanelProspectosPage() {
  return (
    <PanelProspectComponent/>
  );
}