"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";

const apiUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export const EcommerceMetrics = () => {
  const [prospects, setProspects] = useState(0);
  const [prevProspects, setPrevProspects] = useState(0);
  const [events, setEvents] = useState(0);
  const [prevEvents, setPrevEvents] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener prospectos
        const prospectosRes = await axios.get(`${apiUrl}/api/person-form/list`);
        const prospectosTotal = prospectosRes.data.length;
        setProspects(prospectosTotal);

        // Simular anteriores (aqui puedes cambiar por endpoint real si existe)
        setPrevProspects(prospectosTotal - 1); // simula que antes eran 30 menos

        // Obtener total de eventos
        const eventosRes = await axios.get(`${apiUrl}/api/messages/count`);
        const eventosTotal = eventosRes.data;
        setEvents(eventosTotal);

        // Simular anteriores
        setPrevEvents(eventosTotal - 5);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      }
    };

    fetchData();
  }, []);

  const calcCambio = (anterior: number, actual: number) => {
    if (anterior === 0) return 0;
    return parseFloat(((actual - anterior) / anterior * 100).toFixed(2));
  };

  const cambioProspectos = calcCambio(prevProspects, prospects);
  const cambioEventos = calcCambio(prevEvents, events);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
      {/* Prospectos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
          <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
        </div>

        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Prospectos
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {prospects.toLocaleString()}
            </h4>
          </div>
          <Badge color={cambioProspectos >= 0 ? "success" : "error"}>
            {cambioProspectos >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(cambioProspectos)}%
          </Badge>
        </div>
      </div>

      {/* Eventos */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
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

          <Badge color={cambioEventos >= 0 ? "success" : "error"}>
            {cambioEventos >= 0 ? <ArrowUpIcon /> : <ArrowDownIcon />}
            {Math.abs(cambioEventos)}%
          </Badge>
        </div>
      </div>
    </div>
  );
};
