"use client";
import React, { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import Badge from "../../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, InfoIcon } from "@/icons";

const apiUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const Metrics5 = () => {
  const [enProceso, setEnProceso] = useState(0);
  const [prevEnProceso, setPrevEnProceso] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/prospecto/estadisticas`);
        const enProcesoCount = response.data.conteoPorEstado.APROBADO|| 0; 
        setEnProceso(enProcesoCount);
        setPrevEnProceso(enProcesoCount - 1);
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

  const cambioEnProceso = calcCambio(prevEnProceso, enProceso);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full sm:max-w-[380px] flex flex-col justify-between h-[360px]">
      <div className="flex flex-col justify-between h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Aprovado
          </h3>
          <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
              <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
              <div
                role="tooltip"
                className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12  left-3/2 -translate-x-2/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
              >
                Calcula el porcentaje de cambio entre un valor anterior y uno actual.
                
              </div>
            </div>
        </div>

        {/* Centro (cifra principal) */}
        <div className="flex flex-col items-center justify-center mt-10 mb-6">
          <h4 className="text-5xl font-bold text-gray-800 dark:text-white/90">
            {enProceso.toLocaleString()}
          </h4>
          <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Total en aprobados
          </span>
        </div>

        {/* Pie de tarjeta */}
        <div className="flex justify-center">
          <Badge color={cambioEnProceso >= 0 ? "success" : "error"}>
            {cambioEnProceso >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(cambioEnProceso)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};