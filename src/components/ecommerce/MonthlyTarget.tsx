"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function MonthlyTarget() {
  const [series, setSeries] = useState<number[]>([0, 0]);
  const [isOpen, setIsOpen] = useState(false);

  // Simulación de valores adicionales
  const objetivo = 19000;
  const mesAnterior = 17500;
  const actual = 18000;

  const options: ApexOptions = {
    colors: ["#465FFF", "#6F7DFF"],
    labels: ["Mujeres", "Hombres"],
    chart: { type: "donut", height: 330 },
    fill: { type: "solid" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" },
  };

  // Cargar datos reales al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${authUrl}/list`);
        const data = response.data;

        const mujeres = data.filter((item: any) => item.genero?.toLowerCase() === "mujer").length;
        const hombres = data.filter((item: any) => item.genero?.toLowerCase() === "hombre").length;

        setSeries([mujeres, hombres]);
      } catch (error) {
        console.error("Error al obtener datos de género:", error);
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
              Géneros
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Categorización por género
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
        {[
          { label: "Objetivo", value: objetivo, color: "#D92D20" },
          { label: "Mes anterior", value: mesAnterior, color: "#039855" },
          { label: "Actual", value: actual, color: "#039855" },
        ].map((item, idx) => (
          <div key={idx}>
            <p className="mb-1 text-center text-gray-500 text-sm dark:text-gray-400">{item.label}</p>
            <p className="flex items-center justify-center gap-1 text-lg font-semibold text-gray-800 dark:text-white/90">
              {item.value.toLocaleString()}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d={item.color === "#D92D20"
                    ? "M7.26816 13.6632L12.3635 9.70076L11.3032 8.63973L8.5811 11.36L8.5811 2.5L7.0811 2.5L7.0811 11.3556L4.36354 8.63975L3.30321 9.70075L7.26816 13.6632Z"
                    : "M7.60141 2.33683L12.6968 6.29924L11.6365 7.36027L8.91435 4.64004L8.91435 13.5L7.41435 13.5L7.41435 4.64442L4.69679 7.36025L3.63646 6.29926L7.60141 2.33683Z"}
                  fill={item.color}
                />
              </svg>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}