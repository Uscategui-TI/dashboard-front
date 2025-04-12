import { Metadata } from "next";
import PersonFormPage from "@/components/Prospectos-Panel/Prospectos";

export const metadata: Metadata = {
    title:
      "Uscategui Prospectos-Panel",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function ProspectosPanel() {
    return <PersonFormPage />;
  }
  