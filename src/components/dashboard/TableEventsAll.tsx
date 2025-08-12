"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Badge from "@/components/shared/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/shared/ui/table";
import { endPointBackend } from "@/api";

interface EventStat {
  id: number;
  eventName: string;
  type: string;
  status: "Finalizado" | "En proceso" | "Error";
  totalBroadcasts: number;
  totalMessagesSent: number;
  provedor: string;
  endDate: string;
  imageUrl: string;
}

export default function EventsPage() {
  const [dataAll, setDataAll] = useState<EventStat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    endPointBackend({ accionBD: "Recent-Broadcast" }).then((resp) => {
        const sortedData = [...resp.data.allEvents].sort((a: EventStat, b: EventStat) => {
        const dateA = new Date(a.endDate).getTime();
        const dateB = new Date(b.endDate).getTime();
        return dateB - dateA; // más reciente primero
        });
        setDataAll(sortedData);
        setLoading(false);
    });
    }, []);

  const filtered = dataAll.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <p className="text-center py-10 text-gray-500 dark:text-gray-400">
        Cargando...
      </p>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* Encabezado */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Todos los Eventos
          </h1>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              onClick={() => setSearch("")}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
              <TableRow>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Eventos
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Total Mensajes
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Proveedor
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Fecha fin
                </TableCell>
                <TableCell
                  isHeader
                  className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Estado
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filtered.map((event) => (
                <TableRow key={event.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                        <Image
                          width={50}
                          height={50}
                          src={event.imageUrl || "/images/logo/logo-uscate-icon.jpg"}
                          className="h-[50px] w-[50px] object-cover"
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
                    {event.totalMessagesSent}
                  </TableCell>
                  <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {event.provedor}
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
    </>
  );
}
