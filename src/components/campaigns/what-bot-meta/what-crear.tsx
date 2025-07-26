"use client";
import React, { useState, ChangeEvent } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import Textarea from "@/components/form/input/TextArea";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import SuccessModal from "@/components/shared/ui/modal/SuccessModal";



const CATEGORIES = ["MARKETING", "AUTHENTICATION", "UTILITY"];
const LANGUAGES = [
  { label: "Español", value: "es_CO" },
  { label: "Inglés", value: "en_US" },
  { label: "Portugués", value: "pt_BR" },
];

interface TemplateCreatorProps {
  onClose: () => void;
}

interface ButtonType {
  type: "QUICK_REPLY" | "PHONE_NUMBER" | "URL";
  text: string;
  phone_number?: string;
  url?: string;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("es_CO");
  const [category, setCategory] = useState("MARKETING");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<ButtonType[]>([]);
  const [newButtonText, setNewButtonText] = useState("");
  const [newButtonType, setNewButtonType] = useState<ButtonType["type"]>("QUICK_REPLY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [url, setUrl] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);




  const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
  const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
  const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v19.0";
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    description: "",
  });


  const addButton = () => {
    if (
      (newButtonType === "PHONE_NUMBER" && !phoneNumber) ||
      (newButtonType === "URL" && !url)
    )
      return;

    if (buttons.length >= 5) {
      alert("No puedes agregar más de 5 botones.");
      return;
    }

    if (buttons.some((btn) => btn.type === "URL") && newButtonType === "URL") {
      alert("Ya has agregado un botón de tipo URL.");
      return;
    }

    const newButton: ButtonType = {
      type: newButtonType,
      text: newButtonText,
      ...(newButtonType === "PHONE_NUMBER" ? { phone_number: phoneNumber } : {}),
      ...(newButtonType === "URL" ? { url } : {}),
    };

    setButtons((prev) => [...prev, newButton]);
    setNewButtonText("");
    setPhoneNumber("");
    setUrl("");
  };

  const formatTemplateName = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "_");

  const handleSubmit = async () => {
    // Validación
    if (!name.trim() || !bodyText.trim() || !footerText.trim()) {
      showError("Campos obligatorios", "Los campos Nombre, Cuerpo y Pie del mensaje son obligatorios.");
      return;
    }


    if (buttons.length === 0) {
      showError("Botón requerido", "Debes agregar al menos un botón.");
      return;
    }

    const json = {
      name: formatTemplateName(name),
      language,
      category,
      components: [
        {
          type: "HEADER",
          format: "IMAGE",
          example: {
            header_handle: [
              "4:a2FwYXguanBn:aW1hZ2UvanBn:ARbugtm4wmVcaPWEHVJPWnc_D96u6kYgmFrcsWffDDdC__QWGGSLKrbXhDtSbz-QPn2SxzG6_ZvlLXnsMs59orZUawNcxOzt5yrN0n3Sei65vQ:e:1753771644:684218694480053:61578886730891:ARbmCVOgiO7VS6-PGK4",
            ],
          },
        },
        {
          type: "BODY",
          text: bodyText,
        },
        {
          type: "FOOTER",
          text: footerText,
        },
        {
          type: "BUTTONS",
          buttons,
        },
      ],
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/${version}/${whatsappId}/message_templates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(json),
        }
      );

      const result = await res.json();

      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        alert("Error: " + JSON.stringify(result, null, 2));
      }
    } catch (err: unknown) {
      showError("Error", "Error al enviar la plantilla.");
    }
  };
  const showError = (title: string, description: string) => {
    setErrorModal({ open: true, title, description });
  };
 
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto shadow-lg">
      <form className="space-y-4" autoComplete="off">
        <Label>Nombre Plantilla</Label>
        <Input
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="plantilla prueba"
        />

        <Label>Idioma</Label>
        <select
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
          value={language}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>

        <Label>Categoría</Label>
        <select
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
          value={category}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <Label>Cuerpo Del Mensaje</Label>
        <Textarea
          value={bodyText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyText(e.target.value)}
        />

        <Label>Pie Del Mensaje</Label>
        <Input
          value={footerText}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setFooterText(e.target.value)}
        />

        <Label>Añadir Botón</Label>
        <div className="flex flex-wrap gap-2">
          <select
            value={newButtonType}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setNewButtonType(e.target.value as ButtonType["type"])
            }
            className="border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
          >
            <option value="QUICK_REPLY">Respuesta Rápida</option>
            <option value="PHONE_NUMBER">Número Telefónico</option>
            <option value="URL">URL</option>
          </select>

          <Input
            value={newButtonText}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewButtonText(e.target.value)}
            placeholder="Texto del botón"
          />

          {newButtonType === "PHONE_NUMBER" && (
            <Input
              value={phoneNumber}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(e.target.value)}
              placeholder="+573058221777"
            />
          )}

          {newButtonType === "URL" && (
            <Input
              value={url}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)}
              placeholder="https://tusitio.com"
            />
          )}

          <Button type="button" onClick={addButton}>
            Agregar
          </Button>
        </div>

        {buttons.length > 0 && (
          <div>
            <Label>Botones agregados:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {buttons.map((btn, idx) => (
                <div
                  key={idx}
                  className="flex items-center bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm shadow-sm dark:bg-gray-700 dark:text-white"
                >
                  <span className="mr-2 font-medium">{btn.text}</span>
                  <span className="text-xs text-gray-500">
                    ({btn.type === "PHONE_NUMBER"
                      ? `📞 ${btn.phone_number}`
                      : btn.type === "URL"
                      ? `🔗 ${btn.url}`
                      : "⚡ Respuesta rápida"})
                  </span>
                  <button
                    type="button"
                    onClick={() => setButtons((prev) => prev.filter((_, i) => i !== idx))}
                    className="ml-2 text-red-500 hover:text-red-700 text-xs"
                    title="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button type="button" onClick={handleSubmit} className="mt-4">
          Crear Plantilla en Meta
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={onClose}
          className="ml-2.5 mt-4"
        >
          Cancelar
        </Button>
      </form>

      <AlertModal
        isOpen={errorModal.open}
        onClose={() => setErrorModal((prev) => ({ ...prev, open: false }))}
        title={errorModal.title}
        description={errorModal.description}
        colorClass="error"
      />
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose(); // cerrar el modal principal
        }}
        title="¡Plantilla creada!"
        description="Tu plantilla fue creada exitosamente."
      />

    </div>
  );
};

export default TemplateCreator;
