"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import axios from "@/lib/axiosInstance";
import { Dropdown } from "../../ui/dropdown/Dropdown";
import { DropdownItem } from "../../ui/dropdown/DropdownItem";
import { InfoIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function MonthlyTarget() {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const options: ApexOptions = {
    labels,
    colors: ["#465FFF", "#6F7DFF", "#22C55E", "#EAB308", "#EF4444"],
    chart: { type: "donut", height: 330 },
    fill: { type: "solid" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${authUrl}/api/prospecto/estadisticas`);
        const data = res.data.conteoPorEstado;
    
        const labelsFromApi = Object.keys(data);
        const seriesFromApi = Object.values(data) as number[]; // 👈 casteo correcto aquí
    
        setLabels(labelsFromApi);
        setSeries(seriesFromApi);
        setTotal(seriesFromApi.reduce((acc, val) => acc + val, 0));
      } catch (err) {
        console.error("Error al cargar datos de estados:", err);
      }
    };
    fetchData();
  }, []);
  
  return (
    <div className="rounded-2xl border bg-gray-100 dark:bg-white/[0.03] dark:border-gray-800">
      <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Estados de Solicitudes
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Distribución de solicitudes por estado
            </p>
          </div>
          <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
            <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
            <div
              role="tooltip"
              className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12 left-[0px] -translate-x-[260px] whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              Este diagrama de torta muestra el porcentaje de <br/>
              solicitudes según el estado en el que se encuentran.
              <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-[278px] -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
            </div>
        </div>
        </div>
        <div className="max-h-[330px]">
          <ReactApexChart options={options} series={series} type="donut" height={252} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-8 px-6 py-5">
        <div>
          <p className="mb-1 text-center text-gray-500 text-sm dark:text-gray-400">Total</p>
          <p className="text-lg font-semibold text-center text-gray-800 dark:text-white/90">
            {total.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}