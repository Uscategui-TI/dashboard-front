"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "@/lib/axiosInstance";
import { InfoIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { defaultBarChartOptions, useNavigation } from "@/util";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const apiUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function MonthlySalesChart() {
  const [isOpen, setIsOpen] = useState(false);
  const [series, setSeries] = useState([{ name: "Eventos", data: [] as number[] }]);
  const [categories, setCategories] = useState<string[]>([]);

  const { redirectTo } = useNavigation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/message-stats/list`);
        const stats = res.data;

        // Agrupar por año
        const counts: Record<string, number> = {};
        stats.forEach((stat: any) => {
          const year = new Date(stat.createdAt).getFullYear();
          counts[year] = (counts[year] || 0) + 1;
        });

        const sortedYears = Object.keys(counts).sort();
        const data = sortedYears.map((year) => counts[year]);

        setCategories(sortedYears);
        setSeries([{ name: "Eventos", data }]);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    fetchStats();
  }, []);

  const options = defaultBarChartOptions(categories);
  
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Histórico de Eventos por Año
        </h3>
        <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
          <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
          <div
            role="tooltip"
            className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-6  left-3/2 -translate-x-2/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            Esta gráfica de barras presenta un historial general de los eventos realizados por año.
            <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-[438px] -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
          </div>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart options={options} series={series} type="bar" height={180} />
        </div>
      </div>
    </div>
  );
}