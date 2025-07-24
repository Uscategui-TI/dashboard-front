"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../shared/ui/table";
import Badge from "../shared/ui/badge/Badge";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { endPointBackend } from "@/api";

interface EventStat {
  id: number;
  eventName: string;
  type: string;
  status: "Finalizado" | "En proceso" | "Error";
  totalBroadcasts: number;
  totalMessagesSent: number;
  endDate: string;
  imageUrl: string;
}

export default function TableEvents() {
  const [data, setData] = useState<EventStat[]>([]);
  const [search, setSearch] = useState(""); // ← estado para filtro

  useEffect(() => {
    endPointBackend({ accionBD: "Recent-Broadcast" })
    .then((resp) => {
      setData(resp.data);
    })   
  }, []);

  const filteredData = data.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Difusiones Recientes
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* <input
            type="text"
            placeholder="Buscar por nombre de evento"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Limpiar
          </button> */}
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Eventos
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Total difusiones
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Total Mensajes
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Fecha fin
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Estado
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <Image
                        width={50}
                        height={50}
                        src={event.imageUrl || "/images/logo/logo-uscate-icon.jpg"}
                        className="h-[50px] w-[50px]"
                        alt={event.eventName}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {event.eventName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {event.totalBroadcasts || "-"}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {event.totalMessagesSent}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {event.endDate || "-"}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={
                      event.status === "Finalizado"
                        ? "success"
                        : event.status === "En proceso"
                        ? "warning"
                        : "error"
                    }
                  >
                    {event.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}