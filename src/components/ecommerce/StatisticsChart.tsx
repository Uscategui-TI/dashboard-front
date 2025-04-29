"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function StatisticsChart() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"month" | "year">("month");

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [categories, setCategories] = useState<string[]>(months);

  const getChartOptions = (): ApexOptions => ({
    chart: { type: "area", height: 310, toolbar: { show: false } },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: { colors: ["#6B7280"] },
      },
    },
    yaxis: {
      labels: { style: { colors: ["#6B7280"] } },
    },
    stroke: {
      curve: "smooth",
      width: [2],
    },
    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0.1,
      },
    },
    dataLabels: { enabled: false },
    tooltip: { enabled: true },
    markers: {
      size: viewMode === "month" ? 4 : 6,
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    colors: ["#465FFF"],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const getTokenFromCookie = () => {
          const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
          return match ? match[2] : null;
        };
  
        const token = getTokenFromCookie();
        if (!token) {
          console.error("Token no encontrado en cookies");
          return;
        }
  
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
  
        const res = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/dates/all`);
        const dates: string[] = res.data;

        if (viewMode === "month") {
          const countsByMonth = Array(12).fill(0);
          dates.forEach((dateStr) => {
            const date = new Date(dateStr);
            const month = date.getMonth();
            countsByMonth[month]++;
          });
          setCategories(months);
          setSeries([{ name: "Prospectos", data: countsByMonth }]);
        } else {
          const countsByYear: Record<string, number> = {};
          dates.forEach((dateStr) => {
            const year = new Date(dateStr).getFullYear();
            countsByYear[year] = (countsByYear[year] || 0) + 1;
          });
          const years = Object.keys(countsByYear).sort();
          const counts = years.map((year) => countsByYear[year]);
          setCategories(years);
          setSeries([{ name: "Prospectos", data: counts }]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar fechas de creación:", error);
      }
    };

    fetchData();
  }, [viewMode]);

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
        <div className="space-x-2">
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1 rounded-md border text-sm ${
              viewMode === "month" ? "bg-blue-600 text-white" : "border-gray-300 dark:text-white"
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setViewMode("year")}
            className={`px-3 py-1 rounded-md border text-sm ${
              viewMode === "year" ? "bg-blue-600 text-white" : "border-gray-300 dark:text-white"
            }`}
          >
            Año
          </button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {!loading && (
            <ReactApexChart
              options={getChartOptions()}
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
