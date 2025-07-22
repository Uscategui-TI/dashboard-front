"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import Textarea from "@/components/form/input/TextArea";

const CATEGORIES = ["MARKETING", "AUTHENTICATION", "UTILITY"];
const LANGUAGE_OPTIONS = [
  { label: "Español", value: "es_CO" },
  { label: "Inglés", value: "en_US" },
];

const TemplateEditor = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("es_CO");
  const [category, setCategory] = useState("MARKETING");
  const [bodyText, setBodyText] = useState(""); 
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<any[]>([]);

  const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
  const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
  const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v23.0";

  const fetchTemplates = async () => {
    const res = await fetch(
      `https://graph.facebook.com/${version}/${whatsappId}/message_templates?access_token=${token}`
    );
    const data = await res.json();
    setTemplates(data?.data || []);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleTemplateSelect = (templateName: string) => {
    const selected = templates.find((tpl) => tpl.name === templateName);
    if (!selected) return;

    setSelectedTemplate(selected);
    setName(selected.name);

    const body = selected.components?.find((c: any) => c.type === "BODY")?.text;
    const footer = selected.components?.find((c: any) => c.type === "FOOTER")?.text;
    const buttonsComponent = selected.components?.find((c: any) => c.type === "BUTTONS");

    setBodyText(body || "");
    setFooterText(footer || "");
    setButtons(buttonsComponent?.buttons || []);
  };

  const handleButtonChange = (index: number, key: "type" | "text", value: string) => {
    const updated = [...buttons];
    updated[index][key] = value;
    setButtons(updated);
  };

  const handleUpdate = async () => {
    if (!selectedTemplate) return alert("Selecciona una plantilla para editar");

    const updatedComponents: any[] = [
      { type: "BODY", text: bodyText },
      { type: "FOOTER", text: footerText },
    ];

    if (buttons.length > 0) {
        updatedComponents.push({
          type: "BUTTONS",
          buttons: buttons.map((btn) => {
            const base = {
              type: btn.type,
              text: btn.text,
            };
            if (btn.type === "PHONE_NUMBER") {
              return { ...base, phone_number: btn.phone_number };
            }
            if (btn.type === "URL") {
              return { ...base, url: btn.url };
            }
            return base;
          }),
        });
    }


    const updatedJson = {
      name: selectedTemplate.name,
      language,
      components: updatedComponents,
    };

    try {
      const res = await fetch(
        `https://graph.facebook.com/${version}/${selectedTemplate.id}`,
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
      alert("✅ Plantilla actualizada: " + JSON.stringify(result, null, 2));
    } catch (err: any) {
      alert("❌ Error al actualizar plantilla: " + err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow max-w-3xl mx-auto space-y-4">
      <Label>Seleccionar plantilla existente</Label>
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
        onChange={(e) => handleTemplateSelect(e.target.value)}
        value={selectedTemplate?.name || ""}
      >
        <option value="">-- Selecciona una plantilla --</option>
          {templates.map((tpl) => (
            <option key={tpl.name} value={tpl.name}>
              {tpl.name.replace(/_/g, " ")}
            </option>
          ))}
      </select>

      <Label>Idioma</Label>
      <select
        className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
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
      <Input
        value={selectedTemplate?.category || category}
        disabled
        className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
      />


      <Label>Texto del cuerpo</Label>
      <Textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} />

      <Label>Texto del footer</Label>
      <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} />

      {buttons.length > 0 && (
        <div className="space-y-4">
          <Label>Botones</Label>
          {buttons.map((btn, idx) => (
            <div key={idx} className="space-y-2 border p-3 rounded bg-gray-100">
              <Label>Botón {idx + 1}</Label>

              <Label>Tipo</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={btn.type}
                onChange={(e) => handleButtonChange(idx, "type", e.target.value)}
              >
                {btn.type === "QUICK_REPLY" && (
                  <option value="QUICK_REPLY">QUICK_REPLY</option>
                )}
                {btn.type === "PHONE_NUMBER" && (
                  <option value="PHONE_NUMBER">PHONE_NUMBER</option>
                )}
                {btn.type === "URL" && <option value="URL">URL</option>}
              </select>

              <Label>Texto del botón</Label>
              <Input
                value={btn.text}
                onChange={(e) => handleButtonChange(idx, "text", e.target.value)}
              />

              {btn.type === "PHONE_NUMBER" && (
                <>
                  <Label>Número de teléfono</Label>
                  <Input
                    value={btn.phone_number || ""}
                    onChange={(e) =>
                      setButtons((prev) => {
                        const updated = [...prev];
                        updated[idx].phone_number = e.target.value;
                        return updated;
                      })
                    }
                  />
                </>
              )}

              {btn.type === "URL" && (
                <>
                  <Label>URL</Label>
                  <Input
                    value={btn.url || ""}
                    onChange={(e) =>
                      setButtons((prev) => {
                        const updated = [...prev];
                        updated[idx].url = e.target.value;
                        return updated;
                      })
                    }
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Button type="button" onClick={handleUpdate} className="w-full mt-4">
        Guardar Cambios en Plantilla
      </Button>

      {selectedTemplate && (
        <div>
          <Label>Plantilla original:</Label>
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
            {JSON.stringify(selectedTemplate, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TemplateEditor;
