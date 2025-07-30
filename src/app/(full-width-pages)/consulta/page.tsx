import { Metadata } from "next";
import { Suspense } from "react";
import ConsultaSolicitudPage from "@/components/solicitud/consulta/consulta";

export const metadata: Metadata = {
  title: "Uscategui consulta de solicitud",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function ConsultaPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando solicitud...</div>}>
      <ConsultaSolicitudPage />
    </Suspense>
  );
}
