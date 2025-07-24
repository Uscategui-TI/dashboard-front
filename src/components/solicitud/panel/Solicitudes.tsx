"use client";

import Badge from "../../shared/ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import { EcommerceMetrics } from "./EcommerceMetrics";
import SolicitudesChart from "./SolicitudesChart";

  type EventStat = {
    id: string | number;
    asunto: string;
    fechaCreacion: string;
    estado: string;
    prospecto?: {
      document: string;
    };
    codigoSolicitud?: string | number;
  };

  type ConteoPorEstado = {
    [key: string]: number;
  };

  const getEstadoVariant = (
    estado: string
  ): "success" | "warning" | "error"  => {
    switch (estado) {
      case "EN_PROCESO":
        return "success";
      case "PENDIENTE":
        return "warning";
      case "RECHAZADA":
        return "error";
      default:
        return "error";
    }
  };
  
  const columns = [
    { key: "publicCode", header: "Código Solicitud" },
    { key: "asunto", header: "Asunto" },
    {
      key: "Prospecto",
      header: "Prospecto",
      render: (row: EventStat) => row.prospecto?.document || "-",
    },
    { key: "categoria", header: "Categoria" },
    {
      key: "fechaCreacion",
      header: "Fecha",
      render: (row: EventStat) =>
        new Date(row.fechaCreacion).toLocaleDateString(),
    },
    {
      key: "estado",
      header: "Estado",
      render: (row: EventStat) => (
        <Badge color={getEstadoVariant(row.estado)}>{row.estado}</Badge>
      ),
    },
  ];

  
export default function RecentOrders() {
  const [data, setData] = useState<EventStat[]>([]);
  const [prospects, setProspects] = useState(0);
  const [prevProspects, setPrevProspects] = useState(0);
  const [conteoPorEstado, setConteoPorEstado] = useState<ConteoPorEstado>({});

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 1. Llamada a `/ultimas`
        const ultimasResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1.0/solicitud/ultimas`
        );
        setData(ultimasResponse.data);

        // 2. Llamada a `/estadisticas`
        const estadisticasResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1.0/solicitud/estadisticas`
        );
        const { totalSolicitudes, conteoPorEstado } = estadisticasResponse.data;

        setProspects(totalSolicitudes);
        setPrevProspects(totalSolicitudes - 1); // Simulación de valor anterior
        setConteoPorEstado(conteoPorEstado);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchAllData();
  }, []);
  
    return (
      <div className="p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <SolicitudesChart/>
          <EcommerceMetrics 
            title="Solicitudes"
            text="Todas las Solicitudes"
            toltip="El total de solicitudes se calcula a partir de todas las solicitudes registradas."
            value={prospects}
            prospects={prospects}
            prevProspects={prevProspects}
          />
          <EcommerceMetrics
            title="Pendientes"
            text="Total Pendientes"
            toltip="El total de solicitudes aprovadas se calcula según el estado actual de cada proceso."
            value={conteoPorEstado?.PENDIENTE}
            prospects={prospects}
            prevProspects={prevProspects}
          />

        </div>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* <EcommerceMetrics
            title="Rechazados"
            text="Total Rechazadas"
            toltip="El total de solicitudes rechazadas se calcula según el estado actual de cada proceso."
            value={conteoPorEstado?.RECHAZADA}
            prospects={prospects}
            prevProspects={prevProspects}
          /> */}
          <EcommerceMetrics 
            title="En Proceso"
            text="Total en proceso"
            toltip="El total de solicitudes en proceso se calcula según el estado actual de cada proceso."
            value={conteoPorEstado?.EN_PROCESO}
            prospects={prospects}
            prevProspects={prevProspects}
          />
          <EcommerceMetrics 
            title="Pausadas"
            text="Total en Pausa"
            toltip="El total de solicitudes pausadas se calcula según el estado actual de cada proceso."
            value={conteoPorEstado?.PAUSADOS}
            prospects={prospects}
            prevProspects={prevProspects}
          />
          <EcommerceMetrics 
            title="Finalizadas"
            text="Total Finalizadas"
            toltip='El total de solicitudes finalizadas se calcula según el estado actual de cada proceso.'
            value={conteoPorEstado?.FINALIZADOS}
            prospects={prospects}
            prevProspects={prevProspects}
          />
        </div>
  
        <div className="gap-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Solicitudes Creadas Recientemente</h3>
            <div className="max-w-full overflow-x-auto">
              <GenericTable<EventStat>
                columns={columns}
                data={data}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };