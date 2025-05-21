"use client"

import { useEffect, useState } from "react";
import { endPointBackend } from "@/api";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";
import Badge from "@/components/shared/ui/badge/Badge";
import { BasicCard } from "@/components/shared/ui/cards";
import ReactApexChart from "react-apexcharts";
import { getChartOptionsLines } from "@/util";
import GenderChart from "./GenderChart";
import CanalChart from "./CanalChart";
import Image from "next/image";
import dynamic from "next/dynamic";
import CardBirthdays from "@/components/prospect/panel/CardBirthdays";


const CountryMap = dynamic(() => import("@/components/dashboard/CountryMap"), { ssr: false });
const MapLocalities = dynamic(() => import("./MapBogota"), { ssr: false });

const columnsProspect = [
    { key: "name", header: "Nombres" },
    { key: "lastName", header: "Apellidos" },
    { key: "phone", header: "Celular" },
    { key: "document", header: "Documento" },
    { key: "cargo", header: "Cargo / Ocupación" },
    {
        key: "gender",
        header: "Género",
        render: (row: any) => row.gender?.name || "-",
    }
];

export default function PanelProspectComponent() {

    const [data, setData] = useState<any[]>([]);
    const [prospects, setProspects] = useState(0);
    const [prevProspects, setPrevProspects] = useState(0);

    const [pointsByDepartments, setPointsByDepartments] = useState<any[]>([]);
    const [pointsByLocalities, setPointsByLocalities] = useState<any[]>([]);


    // CHART PROSPECTS
    const [seriesProspects, setSeriesProspects] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<"month" | "year">("month");

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [categoriesProspects, setCategoriesProspects] = useState<string[]>(months);

    useEffect(() => {

        endPointBackend({ accionBD: "List-Prospects", params: { size: 5 } })
        .then((resp) => {
            setData(resp.data.content);
        })

        endPointBackend({ accionBD: "Total-Prospects" })
        .then((resp) => {
            setProspects(resp.data);
            setPrevProspects(resp.data - 1);
        })

        endPointBackend({ accionBD: "Prospects-By-Departments" })
        .then((resp) => {
            setPointsByDepartments(resp.data.points)
        })  

        endPointBackend({ accionBD: "Prospects-By-Localities" })
        .then((resp) => {
            setPointsByLocalities(resp.data)
        })  
        
    }, []);

    useEffect(() => {
        endPointBackend({ accionBD: "Historico-Prospects-Chart", params: { viewMode: viewMode } })
        .then((resp) => {
            setCategoriesProspects( resp.data.categories);
            setSeriesProspects([{ name: "Prospectos", data: resp.data.series }]);
        })  
    }, [viewMode])

    const calcCambio = (prev: number, actual: number) => {
    if (prev === 0) return 0;
    return parseFloat((((actual - prev) / prev) * 100).toFixed(2));
    };

    const cambioProspectos = calcCambio(prevProspects, prospects);

return (
    <div className="grid grid-cols-12 gap-6 p-4">

        {/* SECTION: TOTAL PROSPECTOS */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full flex flex-col justify-between h-[466px]">
                <div className="flex flex-col justify-between h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Prospectos
                        </h3>
                        <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
                            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                            <div
                            role="tooltip"
                            className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                Los datos representados corresponden al total de prospectos registrados.
                                <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-1/2 -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
                            </div>
                        </div>
                    </div>
            
                    {/* Centro (cifra principal) */}
                    <div className="flex flex-col items-center justify-center mt-10 mb-6">
                        <h4 className="text-5xl font-bold text-gray-800 dark:text-white/90">{prospects.toLocaleString()}</h4>
                        <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Total acumulado</span>
                    </div>
            
                    {/* Pie de tarjeta */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer">
                            <div
                            role="tooltip"
                            className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                            Con base en los datos registrados del mes anterior,<br/>
                            se calcula el incremento en comparación con el mes actual.
                            <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-1/2 -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
                            </div>
                            <Badge color={cambioProspectos >= 0 ? "success" : "error"}>
                                {cambioProspectos >= 0 ? <ArrowUpIcon/> : <ArrowDownIcon/>}
                                {Math.abs(cambioProspectos)}%
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION: CHART GENEROS */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <GenderChart/>
        </div>

        {/* SECTION: CHART CANALES */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-4">
            <CanalChart />
        </div>

        {/* SECTION: CHART HISTORICO PROSPECTOS */}
        <div className="col-span-12">
            <BasicCard>
                <div className="flex justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Histórico Prospectos</h3>
                        <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">Trayectoria de vinculación</p>
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
                        <ReactApexChart
                        options={getChartOptionsLines(categoriesProspects, viewMode)}
                        series={seriesProspects}
                        type="area"
                        height={310}
                        />
                    </div>
                </div>
            </BasicCard>
        </div>

        {/* SECTION: CHART DEMOGRAFICA DEPARTAMENTOS */}
        <div className="col-span-12 xl:col-span-6">
            <BasicCard>
                <div className="flex justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Datos demográficos de los prospectos</h3>
                </div>
        
                <div className="mt-4 mb-2 flex items-center gap-3">
                    <Image
                        width={48}
                        height={48}
                        src="/images/country/colombia_5922036.png"
                        alt="colombia"
                        className="w-full max-w-8"
                    />
                    <div>
                        <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Colombia</p>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">{prospects} Prospectos</span>
                    </div>
                </div>
        
                <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
                    <div className="h-[400px] w-full">
                        <CountryMap key={pointsByDepartments.length} points={pointsByDepartments} />
                    </div>
                </div>
            </BasicCard>
        </div>
        
        {/* SECTION: CHART DEMOGRAFICA BOGOTA */}
        <div className="col-span-12 xl:col-span-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
                <div className="flex justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Datos demográficos de los prospectos en Bogotá</h3>
                    </div>
                </div>
        
                <div className="mt-4 mb-2 flex items-center gap-3">
                <Image
                    width={48}
                    height={48}
                    src="/images/country/bogota.png"
                    alt="colombia"
                    className="w-full max-w-8"
                />
                <div>
                    <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Bogotá D.C.</p>
                    <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                    { prospects } Prospectos
                    </span>
                </div>
                </div>
        
                <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
                    <div className="h-[400px] w-full">
                        <MapLocalities key={pointsByLocalities.length} points={pointsByLocalities} />
                    </div>
                </div>
            </div>
        </div>

        {/* SECTION: TABLA PROSPECTOS RECIENTES */}
        <div className="col-span-8">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Prospectos Registrados Recientemente</h3>
                </div>
                <div className="max-w-full overflow-x-auto">
                    <GenericTable<any> columns={columnsProspect} data={data} />
                </div>
            </div>
        </div>

        {/* SECTION: CARD CUMPLEAÑOS */}
        <div className="col-span-4">
            <CardBirthdays/>
        </div>
    </div>
);
}