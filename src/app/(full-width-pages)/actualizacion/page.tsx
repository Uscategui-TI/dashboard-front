import { Metadata } from "next";
import { Suspense } from "react";
import ActualizacionDatosPage from "@/components/actualizacion/ActualizacionDatos";

export const metadata: Metadata = {
  title: "Uscategui actualizacion de datos",
  description: "Gestiona, organiza y parametriza actividades",
};

export default function ActualizacionPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Cargando solicitud...</div>}>
      <ActualizacionDatosPage />
    </Suspense>
  );
}
