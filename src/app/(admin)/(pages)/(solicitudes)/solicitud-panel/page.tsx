import { Metadata } from "next";
import Solicitudrecent from "@/components/solicitud/panel/Solicitudes";

export const metadata: Metadata = {
    title:
      "Uscategui Panel-Solicitudes",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function SolicitudListarPage() {
    return (
      <Solicitudrecent />
    );
  }