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
import SmsModal from "@/components/campaigns/sms/SmsModal";
import EmailModal from "@/components/campaigns/email/EmailModal";
import WhatsAppBroadcastModal from "@/components/campaigns/what-bot-meta/WhatsAppBroadcastModal"
import WhatsAppModal from "@/components/campaigns/what-panel/WhatsAppModal";



const columns: ColumnConfig<any>[] = [
  { key: "name", header: "Nombres", filterType: "text" },
  { key: "lastName", header: "Apellidos", filterType: "text" },
  { key: "phone", header: "Celular", filterType: "text" },
  { key: "email", header: "Correo", filterType: "text" },
  { key: "document", header: "Documento", filterType: "text" },
  { key: "messageEvent", header: "Eventos", filterType: "text", render: (row) => row.messageEvent?.eventName ?? "" },
  { key: "cargo", header: "Cargo / Ocupación", filterType: "text" },
  {
    key: "database",
    header: "Base Datos",
    filterType: "select",
    filterOptions: [
      "Principal",
      "Propiedad Horizontal",
      "SLP Retirados",
      "Organizaciones",
      "UAN",
      "TELEFONO JJ",
    ],
  },
];

const softProvider = process.env.NEXT_PUBLIC_PROVIDER_SERVER;
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export default function ProspectosPanel() {
  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: isCampaingModalOpen,
    openModal: openCampaingModal,
    closeModal: closeCampaingModal,
  } = useModal();
  const [campaignModal, setCampaignModal] = useState<{
    open: boolean;
    type: "SMS" | "Correo" | "WhatsApp✔️" | "WhatsApp" | null;
  }>({ open: false, type: null });

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
  const handleOpenCampaignType = (type: "SMS" | "Correo" | "WhatsApp✔️" | "WhatsApp") => {
    setCampaignModal({ open: true, type });
  };


  
  const handleSelectionChange = (pageSelectedProspects: any[]) => {
    const newSelectedIds = pageSelectedProspects.map((p) => p.id);
    const currentIds = new Set(selectedRowIds);

    const isSame =
      newSelectedIds.length === selectedRowIds.length &&
      newSelectedIds.every((id) => currentIds.has(id));

    if (isSame) return; 

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


  const handleSendSms = (message: string) => {
    const phoneNumbers = selectedRows.map((p) => p.phone);
    
    fetch(`${softProvider}/api/sms/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ numbers: phoneNumbers, message }),
    })
    .then(res => res.json())
    .then(data => {
      console.log("✅ SMS enviados:", data);
    })
    .catch(err => {
      console.error("❌ Error enviando SMS:", err);
    });
  };

  const handleSendEmail = async (payload: {
    subject: string;
    htmlContent: string;
    recipients: string[];
  }) => {
    try {
      const response = await fetch(`${softProvider}/api/email/send-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("✅ Correos enviados:", data);
    } catch (error) {
      console.error("❌ Error al enviar correos:", error);
    }
  };

  const handleSendWhatsApp = (message: string, urlMedia: string) => {
    const phoneNumbers = selectedRows.map((p) => p.phone);

    fetch(`${apiWhatsApp}/broadcast-direct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers: phoneNumbers, message, urlMedia }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ WhatsApp enviados:", data);
      })
      .catch((err) => {
        console.error("❌ Error enviando WhatsApp:", err);
      });
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
              const transformedFilters: Record<string, string> = { ...filters };

              // 👇 si el filtro es por evento, usa el campo correcto
              if (filters.messageEvent) {
                transformedFilters["eventName"] = filters.messageEvent;
                delete transformedFilters.messageEvent;
              }

              setColumnFilters(transformedFilters);
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
              { label: "WhatsApp✔️", color: "green" },
              { label: "WhatsApp", color: "green" },
            ].map(({ label, color }) => (
              <button
                key={label}
                onClick={() => handleOpenCampaignType(label as "SMS" | "Correo" | "WhatsApp✔️" | "WhatsApp")}
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

      {/*aqui hiba el modal general*/}


      {campaignModal.open && campaignModal.type === "SMS" && (
        <SmsModal
          isOpen
          onClose={() => setCampaignModal({ open: false, type: null })}
          phoneNumbers={selectedRows.map((p) => p.phone)}
          onSend={handleSendSms}
        />
      )}

      {campaignModal.open && campaignModal.type === "Correo" && (
        <EmailModal
          isOpen
          onClose={() => setCampaignModal({ open: false, type: null })}
          recipients={selectedRows.map((p) => p.email)}
          onSend={handleSendEmail}
        />
      )}

      {campaignModal.open && campaignModal.type === "WhatsApp✔️" && (
        <WhatsAppBroadcastModal
          isOpen
          onClose={() => setCampaignModal({ open: false, type: null })}
          phoneNumbers={selectedRows.map((p) => p.phone)}
        />
      )}

      {campaignModal.open && campaignModal.type === "WhatsApp" && (
        <WhatsAppModal
          isOpen={campaignModal.open}
          onClose={() => setCampaignModal({ open: false, type: null })}
          phoneNumbers={selectedRows.map((p) => p.phone)}
          onSend={handleSendWhatsApp}
        />
      )}
    </>
  );
}
