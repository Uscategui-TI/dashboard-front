"use client";

import { useEffect, useState } from "react";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import Button from "@/components/shared/ui/button/Button";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Modal } from "@/components/shared/ui/modal"; 
import { useModal } from "@/hooks/useModal"; 
import TemplateEditorModal from "@/components/campaigns/what-bot-meta/what-editar"; 
import TemplateCreator from "@/components/campaigns/what-bot-meta/what-crear";
import BroadcastUploaderModal from "@/components/campaigns/what-bot-meta/what-enviar";


const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v23.0";
const PAGE_SIZE = 10;

const templateColumns = [
  {
    key: "name",
    header: "Nombre",
    render: (row: any) => row.name?.replace(/_/g, " ") || "-",
  },
  {
    key: "category",
    header: "Categoría",
  },
  {
    key: "language",
    header: "Idioma",
    render: (row: any) => {
        const languageMap: Record<string, string> = {
        es_CO: "Español",
        en_US: "Inglés",
        };
        return languageMap[row.language] || row.language;
    },
  },
  {
    key: "status",
    header: "Estado",
  },
];

export default function ListarPlantillas() {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [selectedBroadcastTemplate, setSelectedBroadcastTemplate] = useState<any | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch(
          `https://graph.facebook.com/${version}/${whatsappId}/message_templates?access_token=${token}`
        );
        const json = await response.json();

        let templates = json.data || [];

        // Filtro local por búsqueda
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          templates = templates.filter((t: any) =>
            `${t.name} ${t.category} ${t.language}`.toLowerCase().includes(term)
          );
        }

        setData(templates);
        setTotalPages(Math.ceil(templates.length / PAGE_SIZE));
      } catch (error) {
        console.error("Error al obtener las plantillas:", error);
      }
    };

    fetchTemplates();
  }, [searchTerm]);

  const paginatedData = data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    openModal();
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Plantillas de WhatsApp" />

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Lista de Plantillas</h2>
            <Button variant="primary" onClick={() => setIsCreatorOpen(true)}>
                Crear Nueva Plantilla
            </Button>

        </div>
        
        <div className="max-w-full overflow-x-auto">
          <GenericTable
            columns={templateColumns}
            data={paginatedData}
            searchableColumns={["name", "category", "language"]}
            onSearchChange={(value) => {
              setPage(0);
              setSearchTerm(value);
            }}
            actions={(row) => (
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={() => handleEdit(row)}>
                  Editar
                </Button>  
                <span title={row.status === "PENDING" ? "La plantilla aún está pendiente de aprobación" : ""}>
                  <Button
                    variant="outline"
                    disabled={row.status === "PENDING"}
                    onClick={() => {
                      setSelectedBroadcastTemplate(row);
                      setIsBroadcastOpen(true);
                    }}
                  >
                    📤 Envío Masivo
                  </Button>
                </span>
              </div>
            )}
          />
        </div>

        <Pagination
          key={page}
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      </div>

      {/* Modal con TemplateEditor */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-5xl p-5 lg:p-10">
        <TemplateEditorModal template={selectedTemplate} onClose={closeModal} />
      </Modal>
        <Modal isOpen={isCreatorOpen} onClose={() => setIsCreatorOpen(false)} className="max-w-5xl p-5 lg:p-10">
            <TemplateCreator onClose={() => setIsCreatorOpen(false)} />

        </Modal>
        <Modal
  isOpen={isBroadcastOpen}
  onClose={() => setIsBroadcastOpen(false)}
  className="max-w-3xl p-5 lg:p-10"
>
  {selectedBroadcastTemplate && (
    <BroadcastUploaderModal
      onClose={() => setIsBroadcastOpen(false)}
      templateName={selectedBroadcastTemplate.name}
      mediaUrl={selectedBroadcastTemplate?.components?.[0]?.example?.header_handle?.[0] || ""}
    />
  )}
</Modal>

    </>
  );
}
