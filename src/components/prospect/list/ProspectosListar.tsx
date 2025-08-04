"use client";

import PersonFormPage from "@/components/prospect/forms/CreateProspect.form";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/shared/ui/modal";
import { useModal } from "@/hooks/useModal";
import { useEffect, useState } from "react";
import Button from "@/components/shared/ui/button/Button";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import EditProspectForm from "@/components/prospect/forms/editProspectorm";
import ConfirmacionModal from "@/components/shared/ui/modal/ConfirmModal";
import { endPointBackend } from "@/api";
import type { ColumnConfig } from "@/components/shared/tables/GenericTable";

const columns: ColumnConfig<any>[] = [
  { key: "name", header: "Nombres", filterType: "text" },
  { key: "lastName", header: "Apellidos", filterType: "text" },
  { key: "phone", header: "Celular", filterType: "text" },
  { key: "email", header: "Correo", filterType: "text" },
  { key: "document", header: "Documento", filterType: "text" },
  { key: "cargo", header: "Cargo / Ocupación", filterType: "text" },
  { key: "database", header: "Base Datos", filterType: "text" },
];

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function ProspectosPanel() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isCampaingModalOpen,
    openModal: openCampaingModal,
    closeModal: closeCampaingModal,
  } = useModal();
  const {
    isOpen: isDifusionModalOpen,
    openModal: openDifusionModal,
    closeModal: closeDifusionModal,
  } = useModal();

  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProspect, setEditingProspect] = useState<any | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState<any | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  const confirmDelete = async () => {
    if (!prospectToDelete) return;
    endPointBackend({ accionBD: "Delete-Prospect", id: prospectToDelete.document }).then(() => {
      setData((prev) => prev.filter((p) => p.document !== prospectToDelete.document));
      setShowConfirmDelete(false);
      setProspectToDelete(null);
    });
  };

  useEffect(() => {
    endPointBackend({
      accionBD: "List-Prospects",
      params: {
        page,
        size,
        search: searchTerm,
        ...columnFilters,
      },
    }).then((resp) => {
      setData(resp.data.content);
      setTotalPages(resp.data.totalPages);
    });
  }, [page, size, searchTerm, columnFilters]);

  const handleSelectAll = async (select: boolean) => {
    if (select) {
      const response = await fetch(
        `${authUrl}/api/v1.0/prospects/ids?` +
          new URLSearchParams({
            search: searchTerm,
            ...columnFilters,
          })
      );
      const json = await response.json();

      const fullProspects = json.data;
      setSelectedRowIds(fullProspects.map((p: any) => p.id));
      setSelectedRows(fullProspects);
    } else {
      setSelectedRowIds([]);
      setSelectedRows([]);
    }
  };

  // ✅ Maneja selección individual sin romper la selección global
  const handleSelectionChange = (pageSelectedProspects: any[]) => {
    const newSelectedIds = pageSelectedProspects.map((p) => p.id);
    const currentIds = new Set(selectedRowIds);

    const isSame =
      newSelectedIds.length === selectedRowIds.length &&
      newSelectedIds.every((id) => currentIds.has(id));

    if (isSame) return; // ❗Previene update infinito

    const updatedMap = new Map(selectedRows.map((p) => [p.id, p]));

    pageSelectedProspects.forEach((p) => {
      updatedMap.set(p.id, p);
    });

    const visibleIds = data.map((p) => p.id);
    for (let id of visibleIds) {
      if (!newSelectedIds.includes(id)) {
        updatedMap.delete(id);
      }
    }

    setSelectedRows(Array.from(updatedMap.values()));
    setSelectedRowIds(Array.from(updatedMap.keys()));
  };


  return (
    <>
      <PageBreadcrumb pageTitle="Listar Prospectos" />
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700 dark:text-gray-300">
          </div>
          <div className="flex gap-3">
            <Button onClick={openModal}>Registrar</Button>
            {selectedRows.length !== 0 && (
              <Button onClick={openCampaingModal}>Crear Campaña</Button>
            )}
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
          <GenericTable<any>
            columns={columns}
            data={data}
            selectable
            searchableColumns={["name", "cargo", "document"]}
            onSearchChange={(value) => {
              setPage(0);
              setSearchTerm(value);
            }}
            onFilterChange={(filters: Record<string, string>) => {
              setColumnFilters(filters);
              setPage(0);
            }}
            actions={(row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditingProspect(row)}>
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setProspectToDelete(row);
                    setShowConfirmDelete(true);
                  }}
                >
                  Eliminar
                </Button>
              </div>
            )}
            onSelectionChange={handleSelectionChange}
            onSelectAll={handleSelectAll}
            selectedIds={selectedRowIds}
          />
        </div>

        <Pagination
          key={page}
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      </div>

      {/* Modal Crear Prospecto */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[1100px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <div className="mb-3">
            <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
              Creación de Prospectos
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Agrega tus prospectos. Es importante que puedas adjuntar toda la información para mejorar las métricas.
            </p>
          </div>
          <PersonFormPage closeModal={closeModal} />
        </div>
      </Modal>

      {showConfirmDelete && prospectToDelete && (
        <ConfirmacionModal
          isOpen={showConfirmDelete}
          onClose={() => {
            setShowConfirmDelete(false);
            setProspectToDelete(null);
          }}
          onConfirm={confirmDelete}
          message={`¿Estás seguro de eliminar este registro?`}
        />
      )}

      {/* Modal Elegir Campaña */}
      <Modal isOpen={isCampaingModalOpen} onClose={closeCampaingModal} className="max-w-[750px] p-6 lg:p-10">
        <div className="flex flex-col px-4 py-5 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h5 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">Selecciona la Campaña a Difundir</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Puedes seleccionar estos proveedores para difundir tus mensajes, invitaciones, eventos y mucho más.
            </p>
          </div>

          <p className="mb-5 text-sm text-gray-700 dark:text-gray-300">
            Cuentas con <span className="font-semibold">{selectedRows.length}</span> prospectos seleccionados.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {[
              { label: "SMS", color: "yellow" },
              { label: "Correo", color: "blue" },
              { label: "WhatsApp", color: "green" },
              { label: "Telegram", color: "indigo" },
            ].map(({ label, color }) => (
              <button
                key={label}
                onClick={openDifusionModal}
                className={`flex items-center justify-center h-16 rounded-xl font-semibold text-white bg-${color}-500 hover:bg-${color}-600 shadow-md transition-all duration-200`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Modal Editar Prospecto */}
      <Modal isOpen={!!editingProspect} onClose={() => setEditingProspect(null)} className="max-w-[800px] p-6 lg:p-10">
        <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
          <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
            Editar Prospecto
          </h5>
          {editingProspect && (
            <EditProspectForm
              prospect={editingProspect}
              onClose={() => setEditingProspect(null)}
              onUpdate={() => setPage(0)}
            />
          )}
        </div>
      </Modal>

      {/* Modal Difundir Campaña */}
      <Modal isOpen={isDifusionModalOpen} onClose={closeDifusionModal} className="max-w-[950px] p-6 lg:p-10">
        <div className="flex flex-col px-4 py-5 overflow-y-auto custom-scrollbar">
          <div className="mb-6">
            <h5 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">Parametriza tu Campaña</h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Puedes seleccionar estos proveedores para difundir tus mensajes, invitaciones, eventos y mucho más.
            </p>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <label className="block text-sm text-gray-600 dark:text-gray-300">Personaliza tu Mensaje</label>
            <textarea
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
            />

            <div className="mb-4">
              <label className="block mb-2 text-sm text-gray-600 dark:text-gray-300">Adjunta tu archivo multimedia (opcional)</label>
              {/* <ImageUpload onChange={(url) => setImageUrl(url)} value={imageUrl ?? ""} /> */}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6 modal-footer sm:justify-end">
            <button
              onClick={closeModal}
              type="button"
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Volver
            </button>
            <button
              type="button"
              className="btn btn-success btn-update-event flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              Enviar Mensajes
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
