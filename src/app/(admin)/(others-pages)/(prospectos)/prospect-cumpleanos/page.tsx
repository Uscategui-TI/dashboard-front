import ProspectTablecumpleanos from "@/components/prospectos-cumpleaños/TablaProspectosPanel";
import { Metadata } from "next";


export const metadata: Metadata = {
    title:
      "Uscategui Cumpleaños-Prospectos",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function ProspectosPanelcumple() {
    return <ProspectTablecumpleanos />;
    
}
  