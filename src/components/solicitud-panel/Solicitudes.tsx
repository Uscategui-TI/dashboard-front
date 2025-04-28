"use client";

import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import axios from "axios";
import GenericTable from "../tables/GenericTable";
import Button from "../ui/button/Button";

type EventStat = {
    id: string | number;
    asunto: string;
    fechaCreacion: string;
    estado: string;
    prospecto?: {
      document: string;
    };
  };

export default function RecentOrders() {
    const [data, setData] = useState<EventStat[]>([]);
    const [search, setSearch] = useState("");
  
    // 3. Llamada a la API
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/ultimas`
          );
          setData(response.data);
        } catch (error) {
          console.error("Error al cargar las estadísticas:", error);
        }
      };
      fetchData();
    }, []);
  
    // 4. Filtro por "asunto"
    const filteredData = data.filter((event) =>
      event.asunto.toLowerCase().includes(search.toLowerCase())
    );
  
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
      
    // 5. Columnas configuradas con render personalizado
    const columns = [
      { key: "codigoSolicitud", header: "Código Solicitud" },
      { key: "asunto", header: "Asunto" },
      {
        key: "Prospecto",
        header: "Prospecto",
        render: (row: EventStat) => row.prospecto?.document || "-",
      },
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
  
    // 6. Colores del estado

  
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Lista de Solicitudes
          </h3>
  
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por nombre de solicitud"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              onClick={() => setSearch("")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Limpiar
            </button>
          </div>
        </div>
  
        <div className="max-w-full overflow-x-auto">
          <GenericTable<EventStat>
            columns={columns}
            data={filteredData}
          />
        </div>
      </div>
    );
  };