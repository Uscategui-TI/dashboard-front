"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";

const apiUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const EcommerceMetrics = () => {
  const [prospects, setProspects] = useState(0);
  const [prevProspects, setPrevProspects] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/prospecto/estadisticas`);
        const total = response.data.totalSolicitudes; 
        setProspects(total);
        setPrevProspects(total - 1); // Simulamos un valor anterior
      } catch (error) {
        console.error("Error cargando métricas:", error);
      }
    };

    fetchData();
  }, []);

  const calcCambio = (prev: number, actual: number) => {
    if (prev === 0) return 0;
    return parseFloat((((actual - prev) / prev) * 100).toFixed(2));
  };

  const cambioProspectos = calcCambio(prevProspects, prospects);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full sm:max-w-[380px] flex flex-col justify-between h-[360px]">
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Solicitudes
          </h3>
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-5 dark:text-white/90" />
          </div>
        </div>

        {/* Centro (cifra principal) */}
        <div className="flex flex-col items-center justify-center mt-10 mb-6">
          <h4 className="text-5xl font-bold text-gray-800 dark:text-white/90">
            {prospects.toLocaleString()}
          </h4>
          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total acumulado
          </span>
        </div>

        {/* Pie de tarjeta */}
        <div className="flex justify-center">
          <Badge color={cambioProspectos >= 0 ? "success" : "error"}>
            {cambioProspectos >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(cambioProspectos)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};