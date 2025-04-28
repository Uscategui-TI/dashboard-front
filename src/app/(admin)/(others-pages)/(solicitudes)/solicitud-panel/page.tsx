import { Metadata } from "next";
import MonthlyTargetCanales from "@/components/solicitud-panel/MonthlyTargetCanales";
import Solicitudrecent from "@/components/solicitud-panel/Solicitudes";
import { EcommerceMetrics } from "@/components/solicitud-panel/EcommerceMetrics";
import { Metrics1} from "@/components/solicitud-panel/EcommerceMetrics 1";
import { Metrics2} from "@/components/solicitud-panel/EcommerceMetrics 2";
import { Metrics3} from "@/components/solicitud-panel/EcommerceMetrics 3";
import { Metrics4 } from "@/components/solicitud-panel/EcommerceMetrics 4";
import { Metrics5 } from "@/components/solicitud-panel/EcommerceMetrics 5";
import { Metrics6 } from "@/components/solicitud-panel/EcommerceMetrics 6";


export const metadata: Metadata = {
    title:
      "Uscategui Panel-Solicitudes",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function SolicitudListarPage() {
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <EcommerceMetrics />
          <Metrics1 />
          <Metrics2 />
        </div>
  

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Metrics3 />
          <Metrics4 />
          <Metrics5 />
        </div>
  

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Metrics6 />
          <MonthlyTargetCanales />
        </div>
  
        <div className="grid grid-cols-1">
          <Solicitudrecent />
        </div>
      </div>
    );
  }