"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import Textarea from "@/components/form/input/TextArea";
import AlertModal from "@/components/shared/ui/modal/AlertModal";
import SuccessModal from "@/components/shared/ui/modal/SuccessModal";


const LANGUAGE_OPTIONS = [
  { label: "Español", value: "es_CO" },
  { label: "Inglés", value: "en_US" },
];

type TemplateEditorModalProps = {
  template: any;
  onClose: () => void;
};

export default function TemplateEditorModal({ template, onClose }: TemplateEditorModalProps) {
  const [language, setLanguage] = useState("es_CO");
  const [category, setCategory] = useState("MARKETING");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<any[]>([]);
  const [header, setHeader] = useState<any | null>(null); 
  const [initialState, setInitialState] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    description: "",
  });



  const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
  const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v20.0";

  useEffect(() => {
    if (!template) return;

    setLanguage(template.language || "es_CO");
    setCategory(template.category || "MARKETING");

    const body = template.components?.find((c: any) => c.type === "BODY")?.text;
    const footer = template.components?.find((c: any) => c.type === "FOOTER")?.text;
    const buttonsComponent = template.components?.find((c: any) => c.type === "BUTTONS");
    const headerComponent = template.components?.find((c: any) => c.type === "HEADER");

    setBodyText(body || "");
    setFooterText(footer || "");
    setButtons(buttonsComponent?.buttons || []);
    setHeader(headerComponent || null);

    setInitialState({
      language: template.language || "es_CO",
      body: body || "",
      footer: footer || "",
      buttons: JSON.stringify(buttonsComponent?.buttons || []),
    });
  }, [template]);

  const showError = (title: string, description: string) => {
    setErrorModal({ open: true, title, description });
  };


  const handleButtonChange = (index: number, key: string, value: string) => {
    const updated = [...buttons];
    updated[index][key] = value;
    setButtons(updated);
  };

  const handleUpdate = async () => {
    const updatedComponents: any[] = [];

   
    if (header) {
      updatedComponents.push(header);
    }

    
    updatedComponents.push({ type: "BODY", text: bodyText });

    if (footerText) {
      updatedComponents.push({ type: "FOOTER", text: footerText });
    }

    if (buttons.length > 0) {
      updatedComponents.push({
        type: "BUTTONS",
        buttons: buttons.map((btn) => {
          const base = { type: btn.type, text: btn.text };
          if (btn.type === "PHONE_NUMBER") return { ...base, phone_number: btn.phone_number };
          if (btn.type === "URL") return { ...base, url: btn.url };
          return base;
        }),
      });
    }
    
    const updatedJson = {
      name: template.name,
      language,
      components: updatedComponents,
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/${version}/${template.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedJson),
        }
      );

      const result = await res.json();
      if (res.ok) {
        setShowSuccessModal(true);
      } else {
        showError("Error en actualización", result.error?.message || "Ocurrió un error al actualizar la plantilla.");
      }
    } catch (err: any) {
      showError("Error inesperado", err.message || "Ocurrió un error desconocido.");
    }
  };

  const hasChanges = () => {
      if (!initialState) return false;

      const buttonsString = JSON.stringify(
        buttons.map((btn) => ({
          type: btn.type,
          text: btn.text,
          ...(btn.type === "PHONE_NUMBER" ? { phone_number: btn.phone_number } : {}),
          ...(btn.type === "URL" ? { url: btn.url } : {}),
        }))
      );

      return (
        language !== initialState.language ||
        bodyText !== initialState.body ||
        footerText !== initialState.footer ||
        buttonsString !== initialState.buttons
      );
    };

    const hasEmptyRequiredFields = () => {
      if (!bodyText.trim() || !footerText.trim()) return true;

      return buttons.some((btn) => {
        if (!btn.text.trim()) return true;
        if (btn.type === "PHONE_NUMBER" && !btn.phone_number?.trim()) return true;
        if (btn.type === "URL" && !btn.url?.trim()) return true;
        return false;
      });
    };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto text-gray-500">
      <Label>Idioma</Label>
      <select
        className="w-full border rounded px-3 py-2 "
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {LANGUAGE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <Label>Categoría</Label>
      <Input value={category} disabled />

      <Label>Texto del cuerpo</Label>
      <Textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} />

      <Label>Texto del footer</Label>
      <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />

      {buttons.length > 0 && (
        <div className="space-y-4 ">
          <Label className="text-lg font-semibold text-gray-100 ">Botones</Label>
          {buttons.map((btn, idx) => (
            <div
              key={idx}
              className="space-y-3 rounded-2xl border border-gray-300 dark:bg-gray-800 shadow-sm p-4  dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium text-gray-600">Botón {idx + 1}</Label>
                {/* <span className="text-sm text-gray-400 italic">{btn.type}</span> */}
              </div>

              <div className="text-amber-50">
                <Label className="text-sm">Tipo</Label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={btn.type}
                  onChange={(e) => handleButtonChange(idx, "type", e.target.value)}
                >
                  <option value={btn.type}>{btn.type}</option>
                </select>
              </div>

              <div>
                <Label className="text-sm">Texto</Label>
                <Input
                  value={btn.text}
                  onChange={(e) => handleButtonChange(idx, "text", e.target.value)}
                />
              </div>

              {btn.type === "PHONE_NUMBER" && (
                <div>
                  <Label className="text-sm">Teléfono</Label>
                  <Input
                    value={btn.phone_number || ""}
                    onChange={(e) => handleButtonChange(idx, "phone_number", e.target.value)}
                  />
                </div>
              )}

              {btn.type === "URL" && (
                <div>
                  <Label className="text-sm">URL</Label>
                  <Input
                    value={btn.url || ""}
                    onChange={(e) => handleButtonChange(idx, "url", e.target.value)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleUpdate}
          disabled={!(hasChanges() && !hasEmptyRequiredFields())}
        >
          Guardar
        </Button>
      </div>
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
          onClose(); // También cierra el modal principal
        }}
        title="¡Plantilla actualizada!"
        description="La plantilla se actualizó exitosamente."
      />
    </div>
  );
}