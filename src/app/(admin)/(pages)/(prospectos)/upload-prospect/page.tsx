import { Metadata } from "next";
import Uploadmasiva from "@/components/prospect/upload/Upload-Masiva";

export const metadata: Metadata = {
    title:
      "Uscategui Listar-Prospectos",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function CargaMasivaPage() {
    return <>
      <Uploadmasiva />;
    </> 
  }
  