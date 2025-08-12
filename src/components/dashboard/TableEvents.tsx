"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Badge from "../shared/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../shared/ui/table";
import { Modal } from "../shared/ui/modal";
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

export default function TableEvents() {
  const [dataRecent, setDataRecent] = useState<EventStat[]>([]);
  const [dataAll, setDataAll] = useState<EventStat[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  // Solo cargar recientes al inicio
  useEffect(() => {
    endPointBackend({ accionBD: "Recent-Broadcast" }).then((resp) => {
      setDataRecent(resp.data.recentEvents);
    });
  }, []);

  // Cargar todos los eventos cuando se abre el modal
  const handleOpenModal = async () => {
    setIsOpen(true);
    if (dataAll.length === 0) {
      setLoadingModal(true);
      try {
        const resp = await endPointBackend({ accionBD: "Recent-Broadcast" });
        setDataAll(resp.data.allEvents);
      } catch (err) {
        console.error("Error cargando todos los eventos", err);
      } finally {
        setLoadingModal(false);
      }
    }
  };

  const filteredRecent = dataRecent.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAll = dataAll.filter((event) =>
    event.eventName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Difusiones Recientes
        </h3>
        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
        >
          Ver más
        </button>
      </div>

      {/* Tabla recientes */}
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Eventos
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Total Mensajes
              </TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Proveedor
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
            {filteredRecent.map((event) => (
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

      {/* Modal con todos los eventos */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-6xl p-6"
        isFullscreen={false}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white/90">
          Difusiones Recientes
        </h3>

        {/* Buscador */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre de evento"
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

        {/* Tabla completa */}
        {loadingModal ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">
            Cargando...
          </p>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                <TableRow>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Eventos
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Total Mensajes
                  </TableCell>
                  <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    Proveedor
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
                {filteredAll.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                          <Image
                            width={50}
                            height={50}
                            src={event.imageUrl || "/images/logo/logo-uscate-icon.jpg"}
                            alt={event.eventName}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {event.eventName}
                          </p>
                          <span className="text-gray-500 text-xs">
                            {event.type}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm">
                      {event.totalMessagesSent}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm">
                      {event.provedor}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm">
                      {event.endDate || "-"}
                    </TableCell>
                    <TableCell className="py-3 text-gray-500 text-sm">
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
        )}
      </Modal>
    </div>
  );
}
