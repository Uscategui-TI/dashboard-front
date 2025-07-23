// TemplateEditorModal.tsx
"use client";
import React, { useEffect, useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import Textarea from "@/components/form/input/TextArea";

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

  const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
  const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v20.0";

  useEffect(() => {
    if (!template) return;

    setLanguage(template.language || "es_CO");
    setCategory(template.category || "MARKETING");

    const body = template.components?.find((c: any) => c.type === "BODY")?.text;
    const footer = template.components?.find((c: any) => c.type === "FOOTER")?.text;
    const buttonsComponent = template.components?.find((c: any) => c.type === "BUTTONS");

    setBodyText(body || "");
    setFooterText(footer || "");
    setButtons(buttonsComponent?.buttons || []);
  }, [template]);

  const handleButtonChange = (index: number, key: string, value: string) => {
    const updated = [...buttons];
    updated[index][key] = value;
    setButtons(updated);
  };

  const handleUpdate = async () => {
    const updatedComponents: any[] = [
      { type: "BODY", text: bodyText },
      { type: "FOOTER", text: footerText },
    ];

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
      alert("✅ Plantilla actualizada");
      onClose();
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="space-y-4 max-h-[80vh] overflow-y-auto">
      <Label>Idioma</Label>
      <select
        className="w-full border rounded px-3 py-2"
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
                <option value={btn.type}>{btn.type}</option>
              </select>

              <Label>Texto</Label>
              <Input
                value={btn.text}
                onChange={(e) => handleButtonChange(idx, "text", e.target.value)}
              />

              {btn.type === "PHONE_NUMBER" && (
                <>
                  <Label>Teléfono</Label>
                  <Input
                    value={btn.phone_number || ""}
                    onChange={(e) => handleButtonChange(idx, "phone_number", e.target.value)}
                  />
                </>
              )}

              {btn.type === "URL" && (
                <>
                  <Label>URL</Label>
                  <Input
                    value={btn.url || ""}
                    onChange={(e) => handleButtonChange(idx, "url", e.target.value)}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button size="sm" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" variant="primary" onClick={handleUpdate}>
          Guardar
        </Button>
      </div>
    </div>
  );
}
