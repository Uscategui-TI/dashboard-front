"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const options: ApexOptions = {
    chart: { type: "area", height: 310, toolbar: { show: false } },
    xaxis: {
      categories: months,
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: ["#6B7280"] } } },
    stroke: { curve: "straight", width: [2] },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.55, opacityTo: 0 },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    markers: { size: 0 },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: ["#465FFF"],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/list`);
        const data = res.data;

        // Contar prospectos por mes
        const countsByMonth = Array(12).fill(0);
        data.forEach((person: any) => {
          const date = new Date(person.date);
          const monthIndex = date.getMonth();
          countsByMonth[monthIndex]++;
        });

        setSeries([{ name: "Prospectos", data: countsByMonth }]);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos del backend:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Histórico Prospectos
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Trayectoria de vinculación
          </p>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {!loading && (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          )}
        </div>
      </div>
    </div>
  );
}