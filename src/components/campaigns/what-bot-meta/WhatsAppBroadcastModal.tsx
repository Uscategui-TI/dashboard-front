"use client";

import { useState, useEffect } from "react";
import Button from "@/components/shared/ui/button/Button";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import { Modal } from "@/components/shared/ui/modal";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: string[];
};

type Template = {
  name: string;
  components: any[];
};

const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v23.0";
const urlMeta = process.env.NEXT_PUBLIC_WHATSAPP_URL_META

const WhatsAppBroadcastModal = ({ isOpen, onClose, phoneNumbers }: Props) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await fetch(
          `https://graph.facebook.com/${version}/${whatsappId}/message_templates?access_token=${token}`
        );
        const data = await res.json();
        setTemplates(data.data || []);
      } catch (err) {
        setError("No se pudieron cargar las plantillas.");
        setShowAlert(true);
      }
    };

    if (isOpen) fetchTemplates();
  }, [isOpen]);

  const handleSend = async () => {
    if (!selectedTemplate) {
      setError("Debes seleccionar una plantilla.");
      setShowAlert(true);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${urlMeta}/send-list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numbers: phoneNumbers,
          messageTemplate: selectedTemplate,
          mediaUrl: imageUrl,
        }),
      });

      const result = await res.json();

      if (result.success) {
        setSuccess(true);
      } else {
        throw new Error("No se pudo enviar el mensaje.");
      }
    } catch (err) {
      setError("Error al enviar los mensajes.");
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6 lg:p-10">
      <div className="space-y-4 text-gray-800 dark:text-white">
        <h2 className="text-xl font-bold">📤 Difusión por WhatsApp</h2>

        <div>
          <label className="block text-sm font-medium mb-1">📑 Selecciona una plantilla</label>
          <select
            value={selectedTemplate}
            onChange={(e) => setSelectedTemplate(e.target.value)}
            className="w-full border px-3 py-2 rounded dark:bg-gray-800"
          >
            <option value="">-- Elige una plantilla --</option>
            {templates.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">🖼️ Imagen (opcional)</label>
          <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url)} />
        </div>

        <Button
          onClick={handleSend}
          disabled={loading}
          variant="primary"
          className="w-full"
        >
          {loading ? "Enviando..." : "Enviar Mensajes"}
        </Button>

        {success && (
          <div className="mt-4 p-3 text-green-700 bg-green-100 rounded-lg">
            ✅ Mensajes enviados correctamente a {phoneNumbers.length} prospectos.
          </div>
        )}

        {showAlert && (
          <AlertModal
            isOpen={showAlert}
            onClose={() => setShowAlert(false)}
            title="Error"
            description={error || "Ocurrió un error inesperado."}
            colorClass="error"
            buttonText="Cerrar"
          />
        )}
      </div>
    </Modal>
  );
};

export default WhatsAppBroadcastModal;
