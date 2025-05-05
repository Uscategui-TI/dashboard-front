"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";

import { IUploadFile } from "@/interfaces/upload-file.interface";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import Button from "@/components/ui/button/Button";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import Pagination from "@/components/tables/Pagination";
import { GenericTable } from "@/components/tables/GenericTable";


const columns = [
  { key: "id", header: "Número de Cargue" },
  { 
    key: "idUserCreate",
    header: "Usuario Creación",  
    render: (row: IUploadFile) => row.idUserCreate?.idNumber || "-"
  },
  {
    key: "totalRecords",
    header: "Total de Registros",
  },
  {
    key: "successfulRecords",
    header: "Registros Exitosos",
  },
  {
    key: "failedRecords",
    header: "Registros Fallidos",
  },
  {
    key: "type",
    header: "Tipo de Cargue",
  },
  {
    key: "createdDate",
    header: "Fecha de Cargue",
    render: (row: IUploadFile) => new Date(row.createdDate).toLocaleDateString(),
  }
  
];

export default function PersonFormPage() {

  const [data, setData] = useState([]);
  const [page, setPage] = useState(0); 
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0); 
  const { isOpen, openModal, closeModal } = useModal();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async (currentPage = page, pageSize = size) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/uploads`,
        {
          params: {
            page: currentPage,
            size: pageSize,
            sort: "createdDate,desc", 
          },
        }
      );
  
      setData(response.data.content); 
      setTotalPages(response.data.totalPages); 
      setPage(response.data.number); 
  
    } catch (error) {
      console.error("Error al cargar las solicitudes:", error);
    }
  };
    

  const handleUploadCsv = async () => {
    
    if (!file) return alert("Por favor selecciona un archivo CSV.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const response = await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccessMessage(response.data || "Archivo subido exitosamente ✅");
      setFile(null);
    } catch (error) {
      console.error("Error al subir el archivo:", error);
      setSuccessMessage("❌ Error al subir el archivo");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Cargue Masivo de Prospectos" />
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por documento"
              // value={search}
              // onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            />
            <button
              // onClick={() => setSearch("")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
            >
              Limpiar
            </button>
          </div>

          <div>
            <Button onClick={() => openModal()}>
                Cargar
            </Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <GenericTable<IUploadFile>
            columns={columns}
            data={data}
          />

          <div className="flex justify-between items-center mt-5">
            <Pagination key={page} currentPage={page} onPageChange={setPage} totalPages={totalPages}/>

            <div className="flex items-center justify-between mb-4">
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Registros por página:
                <select
                  className="ml-2 border border-gray-300 rounded p-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={size}
                  onChange={(e) => {
                    setSize(Number(e.target.value));
                    setPage(0);
                  }}
                >
                  {[5, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] p-6 lg:p-10"
      >
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div>
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Realiza el cargue de tus prospectos
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Puedes cargar masivamente registros de prospectos por medio de un CSV con la siguinete estructura
            </p>
          </div>

          <div className="mt-6">
            <Label className="block mb-4 text-sm font-medium text-gray-700 dark:text-gray-400">
              Adjunta CSV
            </Label>
            <div className="flex flex-wrap items-center gap-4 sm:gap-5">
              <DropzoneComponent onFileSelected={setFile} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Cerrar
            </button>
            <button
              onClick={handleUploadCsv}
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Cargar Prospectos
            </button>
          </div> 
        </div>
      </Modal>
    </>
  )
}
