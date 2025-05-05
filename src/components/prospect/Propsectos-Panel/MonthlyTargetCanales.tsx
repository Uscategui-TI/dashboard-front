"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import axios from "@/lib/axiosInstance";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

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
        const res = await axios.get(`${authUrl}/api/person-form/canales/all`);
        const data = res.data;
  
        const labelsFromApi = data.map((item: any) => item.nombre || "Sin canal");
        const seriesFromApi = data.map((item: any) => item.total || 0);
  
        setLabels(labelsFromApi);
        setSeries(seriesFromApi);
        setTotal(seriesFromApi.reduce((acc: number, val: number) => acc + val, 0));
      } catch (err) {
        console.error("Error al cargar datos de canales:", err);
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
              Canales de Registro
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Distribución de prospectos por canal
            </p>
          </div>
          <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
              <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
            </button>
            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
              <DropdownItem tag="a" onItemClick={() => setIsOpen(false)}>
                Ver más
              </DropdownItem>
            </Dropdown>
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