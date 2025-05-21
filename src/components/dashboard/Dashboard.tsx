"use client";

import React, { useEffect, useState } from "react";
import { defaultBarChartOptions, getChartOptionsLines, getGenderDonutChartOptions, useNavigation } from "@/util";
import dynamic from "next/dynamic";
import { BasicCard } from "../shared/ui/cards";
import Badge from "../shared/ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon, InfoIcon, MoreDotIcon } from "@/icons";
import { getStatInfo, StatItem } from "@/util/getStatInfo";
import Image from "next/image";
import { Dropdown } from "../shared/ui/dropdown/Dropdown";
import { DropdownItem } from "../shared/ui/dropdown/DropdownItem";
import TableEvents from "@/components/dashboard/TableEvents";
import { endPointBackend } from "@/api";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const CountryMap = dynamic(() => import("./CountryMap"), { ssr: false });

export const Dashboard = () => {

    const { redirectTo } = useNavigation();
    
    // CARDS TOTALS
    const [prospects, setProspects] = useState(0);
    const [prevProspects, setPrevProspects] = useState(0);
    const [events, setEvents] = useState(0);
    const [prevEvents, setPrevEvents] = useState(0);

    // CHART EVENTS
    const [series, setSeries] = useState([{ name: "Eventos", data: [] as number[] }]);
    const [categories, setCategories] = useState<string[]>([]);

    // CHART TORTA GENDERS
    const [seriesGender, setSeriesGender] = useState<number[]>([0, 0]);
    const [mesAnterior, setMesAnterior] = useState(0);
    const [actual, setActual] = useState(0);

    // CHART PROSPECTS
    const [seriesProspects, setSeriesProspects] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<"month" | "year">("month");

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const [categoriesProspects, setCategoriesProspects] = useState<string[]>(months);

    // DEMOGRAFICA COLOMBIA
    const [isOpen, setIsOpen] = useState(false);
    const [points, setPoints] = useState<any[]>([]);
    
    useEffect(() => {

        endPointBackend({ accionBD: "Total-Prospects" })
        .then((resp) => {
            setProspects(resp.data);
            setPrevProspects(resp.data - 1);
        })
        
        endPointBackend({ accionBD: "Total-Events" })
        .then((resp) => {
            setEvents(resp.data);
            setPrevEvents(resp.data - 5);
        })  
        
        endPointBackend({ accionBD: "Recent-Broadcast" })
        .then((resp) => {
                const stats = resp.data;
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
        })   

        endPointBackend({ accionBD: "Genders-Chart" })
        .then((resp) => {
            setSeriesGender([resp.data.femenino, resp.data.masculino]);
            setActual(resp.data.femenino + resp.data.masculino);
            setMesAnterior(1000); // valor de ejemplo
        })  

        endPointBackend({ accionBD: "Prospects-By-Departments" })
        .then((resp) => {
            setPoints(resp.data.points)
        })  

    }, []); 

    useEffect(() => {
        endPointBackend({ accionBD: "Historico-Prospects-Chart", params: { viewMode: viewMode } })
        .then((resp) => {
            setCategoriesProspects( resp.data.categories);
            setSeriesProspects([{ name: "Prospectos", data: resp.data.series }]);
        })  
    }, [viewMode])

    const objetivo = 1000;

    const options = defaultBarChartOptions(categories);
    const chartOptionsGenders = getGenderDonutChartOptions(["Femenino", "Masculino"], ["#465FFF", "#6F7DFF"]);

    const calcCambio = (anterior: number, actual: number) => {
        if (anterior === 0) return 0;
        return parseFloat(((actual - anterior) / anterior * 100).toFixed(2));
    };
    
    const cambioProspectos = calcCambio(prevProspects, prospects);
    const cambioEventos = calcCambio(prevEvents, events);

    const cardStats: StatItem[] = [
        {
            label: "Objetivo",
            value: objetivo,
            compareTo: actual,
            isInverted: true,
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
    ];

    return (
        <div className="grid grid-cols-12 gap-4 md:gap-6">
            
            {/* SECTION 1 */}
            <div className="col-span-12 space-y-6 xl:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                    {/* CARD TOTAL PROSPECTOS  */}
                    <BasicCard>
                        <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
                        </div>
                        <div className="flex items-end justify-between my-6">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Prospectos</span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {prospects.toLocaleString()}
                            </h4>
                        </div>
                        <div className="relative group cursor-pointer">
                            <div
                            role="tooltip"
                            className="absolute z-10 px-3 py-1.5 text-xs text-center text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-13 left-8 -translate-x-1/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                            Comparación mensual anual: muestra el cambio porcentual <br/>
                            en prospectos frente al mismo mes del año anterior.
                            </div>
                            <Badge  color={cambioProspectos >= 0 ? "success" : "error"}>
                            {cambioProspectos >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            {Math.abs(cambioProspectos)}%
                            </Badge>
                        </div>
                        </div>
                    </BasicCard>
                    
                    {/* CARD TOTAL EVENTOS */}
                    <BasicCard>
                        <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800">
                            <BoxIconLine className="text-gray-800 dark:text-white/90" />
                        </div>
                        <div className="flex items-end justify-between mt-5">
                        <div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                            Eventos
                            </span>
                            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                            {events.toLocaleString()}
                            </h4>
                        </div>

                        <div className="relative group cursor-pointer">
                            <div
                            role="tooltip"
                            className="absolute z-10 px-3 py-1.5 text-xs text-center text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-13 left-8 -translate-x-1/2 whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                            Comparación mensual anual: muestra el cambio porcentual <br/>
                            en eventos frente al mismo mes del año anterior.
                            </div>
                            <Badge color={cambioEventos >= 0 ? "success" : "error"}>
                            {cambioEventos >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
                            {Math.abs(cambioEventos)}%
                            </Badge>
                        </div>
                        </div>
                    </BasicCard>
                </div>

                {/* GRAFICA BARRAS  */}
                <BasicCard>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Histórico de Eventos por Año</h3>
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
                </BasicCard>
            </div>

            {/* SECTION 2 */}
            <div className="col-span-12 xl:col-span-5">
                {/* GRAFICA TORTA GERENOS */}
                <BasicCard noPadding>
                    <div className="px-5 pt-5 bg-white shadow-default rounded-2xl pb-11 dark:bg-gray-900 sm:px-6 sm:pt-6">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Géneros</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Categorización por género</p>
                            </div>
                            <div className="relative group flex items-center justify-center w-10 h-10 bg-gray-100 rounded-xl dark:bg-gray-800 cursor-pointer">
                                <InfoIcon className="text-gray-800 size-6 dark:text-white/90" />
                            <div
                                role="tooltip"
                                className="absolute z-10 px-3 py-1.5 text-xs text-gray-800 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -top-12 left-[0px] -translate-x-[357px] whitespace-nowrap dark:bg-gray-700 dark:text-white dark:border-gray-600"
                            >
                                Esta gráfica muestra la proporción de prospectos clasificados por género,<br/> 
                                destacando los porcentajes correspondientes a femenino y masculino.
                                <div className="absolute w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 -bottom-1 left-[375px] -translate-x-1/2 dark:bg-gray-700 dark:border-gray-600"></div>
                            </div>
                        </div>
                        </div>
                        <div className="max-h-[330px]">
                            <ReactApexChart options={chartOptionsGenders} series={seriesGender} type="donut" height={252} />
                        </div>
                    </div>
            
                    <div className="flex items-center justify-center gap-8 px-6 py-5">
                        {cardStats.map((item, idx) => {
                        const { color, iconPath } = getStatInfo(item);
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
                </BasicCard>
            </div>

            {/* SECTION 3 */}
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

            {/* SECTION 4 */}
            <div className="col-span-12 xl:col-span-5">
                <BasicCard>
                    <div className="flex justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                            Datos demográficos de los prospectos
                            </h3>
                        </div>
                        <div className="relative inline-block">
                            <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
                                <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
                            </button>
                            <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
                                <DropdownItem onItemClick={ () => redirectTo("/prospect-panel") }>Ver más</DropdownItem>
                            </Dropdown>
                        </div>
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
                            <CountryMap key={points.length} points={points} />
                        </div>
                    </div>
                </BasicCard>
            </div>

            {/* SECTIOn 5 */}
            <div className="col-span-12 xl:col-span-7">
                <TableEvents />
            </div>
        </div>
    );
}
