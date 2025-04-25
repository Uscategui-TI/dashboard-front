import { Metadata } from "next";
import SolicitudComponent from "@/components/solicitudes-listar/Solicitudes";
import MonthlyTargetCanales from "@/components/solicitud-panel/MonthlyTargetCanales";
import TablaProspectosPanel from "@/components/solicitud-panel/TablaProspectosPanel";
import { EcommerceMetrics } from "@/components/solicitud-panel/EcommerceMetrics";
import { Metrics1} from "@/components/solicitud-panel/EcommerceMetrics 1";
import { Metrics2} from "@/components/solicitud-panel/EcommerceMetrics 2";
import { Metrics3} from "@/components/solicitud-panel/EcommerceMetrics 3";
import { Metrics4 } from "@/components/solicitud-panel/EcommerceMetrics 4";


export const metadata: Metadata = {
    title:
      "Uscategui Panel-Solicitudes",
    description: "Gestiona, organiza y parametriza actividades",
  };
  
  export default function SolicitudListarPage() {
    return (
        <div className="grid grid-cols-12 gap-6 p-4">
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <EcommerceMetrics />
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <Metrics1 />
          </div>  
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <Metrics4 />
          </div>         
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <Metrics2 />
          </div>
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <Metrics3 />
          </div>   
          <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <MonthlyTargetCanales />
          </div>
          <div className="col-span-12">
            <TablaProspectosPanel />
          </div>
          
        </div>
      );
    
  }
  