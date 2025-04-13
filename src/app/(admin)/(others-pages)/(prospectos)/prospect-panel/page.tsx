import type { Metadata } from "next";
import { EcommerceMetrics } from "@/components/Propsectos-Panel/EcommerceMetrics";
import MonthlyTarget from "@/components/Propsectos-Panel/MonthlyTarget";
import MonthlyTargetCanales from "@/components/Propsectos-Panel/MonthlyTargetCanales";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import DemographicCardBogota from "@/components/Propsectos-Panel/DemographicCardBogota";
import TablaProspectosPanel from "@/components/Propsectos-Panel/TablaProspectosPanel";

export const metadata: Metadata = {
  title: "Uscategui Panel-Prospectos",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function Ecommerce() {
  return (
    <div className="grid grid-cols-12 gap-6 p-4">
      {/* Fila 1: Métricas + Donuts */}
      <div className="col-span-12 sm:col-span-6 xl:col-span-4">
        <EcommerceMetrics />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-4">
        <MonthlyTarget />
      </div>
      <div className="col-span-12 sm:col-span-6 xl:col-span-4">
        <MonthlyTargetCanales />
      </div>

      {/* Fila 2: Gráfica histórica */}
      <div className="col-span-12">
        <StatisticsChart />
      </div>

      {/* Fila 3: Mapa demográfico */}
      <div className="col-span-12 xl:col-span-6">
        <DemographicCard />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <DemographicCardBogota />
      </div>
      <div className="col-span-12">
        <TablaProspectosPanel />
      </div>
    </div>
  );
}