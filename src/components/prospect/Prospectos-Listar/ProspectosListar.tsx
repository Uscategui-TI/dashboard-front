"use client";

import PersonFormPage from "@/components/prospect/Prospectos-Listar/Prospectos";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useEffect, useState } from "react";
import axios from "axios";
import Button from "@/components/ui/button/Button";
import { GenericTable } from "@/components/tables/GenericTable";

const columns = [
  { key: "name", header: "Nombres" },
  { key: "lastName", header: "Apellidos" },
  { key: "phone", header: "Celular" },
  { key: "email", header: "Correo" },
  { key: "document", header: "Documento" },
  { key: "cargo", header: "Cargo / Ocupación" },
  {
    key: "gender",
    header: "Genero",
    render: (row: any) => row.gender?.name || "-",
  },
  {
    key: "department",
    header: "Departamento",
    render: (row: any) => row.department?.name || "-",
  },
  {
    key: "municipality",
    header: "Municipio",
    render: (row: any) => row.municipality?.name || "-",
  },
];

export default function ProspectosPanel() {

  const { isOpen, openModal, closeModal } = useModal();

  const {
    isOpen: isCampaingModalOpen,
    openModal: openCampaingModal,
    closeModal: closeCampaingModal
  } = useModal();

  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(100);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedRows, setSelectedRows] = useState<any[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prospectsRes] =
          await Promise.all([
            axios.get<any>(
              `${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/list`,
              { params: { page, size } }
            ),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/gender/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/departments/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/municipalities/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/communes/all`),
          ]);

        setData(prospectsRes.data.content);
        setTotalPages(prospectsRes.data.totalPages);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    fetchData();
  }, [page, size]);

  const filteredData = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.document.toLowerCase().includes(search.toLowerCase())
  );

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const start = Math.max(0, page - delta);
    const end = Math.min(totalPages - 1, page + delta);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  

  return (
    <>
      <PageBreadcrumb pageTitle="Listar Prospectos"/>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">

            <Button onClick={() => openModal()}>
                Registar
            </Button>
            
            {selectedRows && selectedRows.length != 0? (
              <Button onClick={() => openCampaingModal()}>
                Crear Campaña
              </Button>
            ) : null}
          </div>
        </div>
  
        <div className="max-w-full overflow-x-auto">
            <GenericTable<any>
              columns={columns}
              data={filteredData}
              selectable={true}
              searchableColumns={["nombre", "cargo"]}
              // filterableColumns={["estado"]}
              onSelectionChange={(rows) => {
                console.log("Registros seleccionados:", rows);
                // Aquí puedes ejecutar procesos con los registros seleccionados
                setSelectedRows(rows); // Asegúrate de guardar el estado si lo necesitas
              }}
              // actions={(row) => (
              //   <button onClick={() => alert(row.id)} className="text-blue-500 hover:underline">
              //     Ver
              //   </button>
              // )}
            />
        </div>
  
        <div className="flex justify-center mt-4 gap-2 flex-wrap">
          <button onClick={() => setPage(0)} disabled={page === 0}
            className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&laquo;</button>
          <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}
            className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&lt;</button>
          {getVisiblePages().map((pNum) => (
            <button key={pNum} onClick={() => setPage(pNum)}
              className={`px-3 py-1 border rounded text-sm ${pNum === page ? "bg-blue-500 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}>{pNum + 1}</button>
          ))}
          <button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1}
            className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&gt;</button>
          <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}
            className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&raquo;</button>
        </div>

        <div className="flex justify-center mt-3">
          <span className="text-sm text-gray-500 dark:text-gray-300">
            Página {page + 1} de {totalPages}
          </span>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[1100px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div className="mb-3">
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Creación de Prospectos
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agrega tus prospectos es importante que puedas adjuntar toda la infromación para mejorar las metricas
            </p>
          </div>

          <PersonFormPage closeModal={closeModal} />

          {/* <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cerrar
            </button>
            <button
              // onClick={handleUploadCsv}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Cargar Prospectos
            </button>
          </div>  */}
        </div>
      </Modal>

      <Modal
        isOpen={isCampaingModalOpen} 
        onClose={closeCampaingModal}
        className="max-w-[750px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div className="mb-3">
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Seleciona la Campaña a Difundir
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Puedes selccionar estos proveedores para difundir tus mensajes, inivitaciones, eventos y mucho mas
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4 p-4 w-full mt-2 rounded-xl shadow-md">
            <div className="cursor-pointer flex items-center justify-center h-16 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600 transition-colors">
              SMS
            </div>
            <div className="cursor-pointer flex items-center justify-center h-16 rounded-lg font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-colors">
              Correo
            </div>
            <div className="cursor-pointer flex items-center justify-center h-16 rounded-lg font-semibold text-white bg-green-500 hover:bg-green-600 transition-colors">
              WhatsApp
            </div>
            <div className="cursor-pointer flex items-center justify-center h-16 rounded-lg font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors">
              Telegram
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}