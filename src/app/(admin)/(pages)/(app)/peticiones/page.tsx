import RecentOrdersApp from "@/components/app/list/Solicitudes";
import { Metadata } from "next";
;

export const metadata: Metadata = {
    title:
      "Uscategui Listar-Prospectos",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function AppSolicitudListarPage() {
    return <RecentOrdersApp />;
    
  }
  