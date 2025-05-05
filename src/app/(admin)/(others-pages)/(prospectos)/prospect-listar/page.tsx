import { Metadata } from "next";
import ProspectosListar from "@/components/prospect/Prospectos-Listar/ProspectosListar";

export const metadata: Metadata = {
    title:
      "Uscategui Listar-Prospectos",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function ProspectosPanel() {
    return <ProspectosListar />;
    
  }
  