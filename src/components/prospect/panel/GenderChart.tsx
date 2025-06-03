"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApexOptions } from "apexcharts";
import { InfoIcon } from "@/icons";
import { endPointBackend } from "@/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GenderChart() {
  const [series, setSeries] = useState<number[]>([0, 0]);
  const [mesAnterior, setMesAnterior] = useState(0);
  const [actual, setActual] = useState(0);

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

    endPointBackend({ accionBD: "Genders-Chart" })
    .then((resp) => {
        setSeries([resp.data.femenino, resp.data.masculino]);
        setActual(resp.data.femenino + resp.data.masculino);
        setMesAnterior(1000); // valor de ejemplo

        setTimeout(() => {
          window.dispatchEvent(new Event("resize"));
        }, 100); // Pequeña demora para asegurar el render
      
    })  

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
          <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
            <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
            <div
              role="tooltip"
              className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
            >
              Los datos representados en el diagrama de torta se<br/>
              basan en los registros de género de cada prospecto.
              <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-1/2 -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
            </div>
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