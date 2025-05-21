import { Metadata } from "next";
import SolicitudComponent from "@/components/solicitud/list/Solicitudes";

export const metadata: Metadata = {
    title:
      "Uscategui Listar-Prospectos",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function SolicitudListarPage() {
    return <SolicitudComponent />;
    
  }
  