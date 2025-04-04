"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import axios from "axios";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "@/icons";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function MonthlyTarget() {
  const [series, setSeries] = useState<number[]>([0, 0]);
  const [mesAnterior, setMesAnterior] = useState(0);
  const [actual, setActual] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const objetivo = 1000;

  const options: ApexOptions = {
    colors: ["#465FFF", "#6F7DFF"],
    labels: ["Femenino", "Masculino"],
    chart: { type: "donut", height: 330 },
    fill: { type: "solid" },
    plotOptions: { pie: { donut: { size: "70%" } } },
    legend: { position: "bottom" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${authUrl}/api/person-form/list`);
        const data = res.data;

        // Conteo por género
        const mujeres = data.filter((p: any) => p.gender?.toLowerCase() === "femenino").length;
        const hombres = data.filter((p: any) => p.gender?.toLowerCase() === "masculino").length;
        setSeries([mujeres, hombres]);

        // Fechas actuales
        const now = new Date();
        const currentMonth = now.getMonth(); // 0 = enero
        const currentYear = now.getFullYear();
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        // Convertir fechas y contar por mes
        let thisMonthCount = 0;
        let prevMonthCount = 0;

        data.forEach((p: any) => {
          const d = new Date(p.date);
          const m = d.getMonth();
          const y = d.getFullYear();
          if (m === currentMonth && y === currentYear) {
            thisMonthCount++;
          } else if (m === previousMonth && y === previousYear) {
            prevMonthCount++;
          }
        });

        setActual(thisMonthCount);
        setMesAnterior(prevMonthCount);
      } catch (err) {
        console.error("Error al cargar datos:", err);
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
          {
            label: "Objetivo",
            value: objetivo,
            compareTo: actual,
            isInverted: true, // Queremos flecha roja si no se alcanza
          },
          {
            label: "Mes anterior",
            value: mesAnterior,
            compareTo: actual,
          },
          {
            label: "Actual",
            value: actual,
            compareTo: mesAnterior,
          },
        ].map((item, idx) => {
          const isUp = item.value > item.compareTo;
          const isDown = item.value < item.compareTo;

          // Si esInverted, invertimos el color lógico
          const isNegative = item.isInverted ? isDown : isUp === false && isDown;
          const color = isNegative ? "#D92D20" : "#039855";

          const iconPath = isNegative
            ? // Flecha abajo
              "M7.26816 13.6632L12.3635 9.70076L11.3032 8.63973L8.5811 11.36L8.5811 2.5L7.0811 2.5L7.0811 11.3556L4.36354 8.63975L3.30321 9.70075L7.26816 13.6632Z"
            : // Flecha arriba
              "M7.60141 2.33683L12.6968 6.29924L11.6365 7.36027L8.91435 4.64004L8.91435 13.5L7.41435 13.5L7.41435 4.64442L4.69679 7.36025L3.63646 6.29926L7.60141 2.33683Z";

          return (
            <div key={idx}>
              <p className="mb-1 text-center text-gray-500 text-sm dark:text-gray-400">
                {item.label}
              </p>
              <p className="flex items-center justify-center gap-1 text-lg font-semibold text-gray-800 dark:text-white/90">
                {item.value.toLocaleString()}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d={iconPath} fill={color} />
                </svg>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}