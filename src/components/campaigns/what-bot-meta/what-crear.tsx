"use client";
import React, { useState, ChangeEvent } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import Textarea from "@/components/form/input/TextArea";

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
  type: "QUICK_REPLY" | "PHONE_NUMBER";
  text: string;
  phone_number?: string;
}

const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onClose }) => {
  const [name, setName] = useState("");
  const [language, setLanguage] = useState("es_CO");
  const [category, setCategory] = useState("MARKETING");
  const [headerImageHandle, setHeaderImageHandle] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [footerText, setFooterText] = useState("");
  const [buttons, setButtons] = useState<ButtonType[]>([]);
  const [newButtonText, setNewButtonText] = useState("");
  const [newButtonType, setNewButtonType] = useState<"QUICK_REPLY" | "PHONE_NUMBER">("QUICK_REPLY");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const token = process.env.NEXT_PUBLIC_YOUR_ACCESS_TOKEN!;
  const whatsappId = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID!;
  const version = process.env.NEXT_PUBLIC_GRAPH_API_VERSION || "v23.0";
  const botId = process.env.NEXT_PUBLIC_ID_APP;

  const addButton = () => {
    if (newButtonType === "PHONE_NUMBER" && !phoneNumber) return;
    setButtons((prev) => [
      ...prev,
      {
        type: newButtonType,
        text: newButtonText,
        ...(newButtonType === "PHONE_NUMBER" ? { phone_number: phoneNumber } : {}),
      },
    ]);
    setNewButtonText("");
    setPhoneNumber("");
  };

  const formatTemplateName = (text: string) =>
    text.trim().toLowerCase().replace(/\s+/g, "_");

  const json = {
    name: formatTemplateName(name),
    language,
    category,
    components: [
      {
        type: "HEADER",
        format: "IMAGE",
        example: {
          header_handle: ["4:a2FwYXguanBn:aW1hZ2UvanBn:ARb1KoYZaHq0xpHwDQtY5hg3kpHT56Ye4qxoo2Bqp8FHrhhIS_6dtDAAb4M68G6oQtWXIcXW8b1huMi2vB-vA7zIjb5t_I70YgonEFf14thOyg:e:1753546560:684218694480053:100009114744154:ARbLOD1wa8TeTxAe7GE"],
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

  const handleSubmit = async () => {
    try {
      const res = await fetch(`https://graph.facebook.com/${version}/${whatsappId}/message_templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(json),
      });

      const result = await res.json();
      alert(JSON.stringify(result, null, 2));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert("Error al enviar la plantilla: " + err.message);
      } else {
        alert("Error desconocido al enviar la plantilla.");
      }
    }
  };

  // const handleImageUpload = async () => {
  //   if (!imageFile) return alert("Primero selecciona una imagen");

  //   const formData = new FormData();
  //   formData.append("file", imageFile);

  //   try {
  //     const res = await fetch("/api/uploadBinary", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     const json = await res.json();
  //     if (!json.h) throw new Error("No se recibió el handle de imagen");

  //     setHeaderImageHandle(json.h);
  //     alert("✅ Imagen subida correctamente. Handle: " + json.h);
  //   } catch (err: any) {
  //     alert("❌ Error al subir imagen: " + err.message);
  //     console.error("Error al subir imagen:", err);
  //   }
  // };

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

        {/* <Label>Imagen del Header</Label> */}
        {/* <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer dark:bg-gray-800 dark:text-white"
        /> */}
        {/* <Button type="button" onClick={handleImageUpload} className="mt-2">
          Subir Imagen a Meta
        </Button> */}
        {headerImageHandle && (
          <p className="text-green-600 text-sm mt-1">
            Imagen subida. Handle: <code>{headerImageHandle}</code>
          </p>
        )}

        <Label>Texto del cuerpo</Label>
        <Textarea
          value={bodyText}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setBodyText(e.target.value)}
        />

        <Label>Texto del footer</Label>
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
            <option value="QUICK_REPLY">Quick Reply</option>
            <option value="PHONE_NUMBER">Phone Number</option>
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

          <Button type="button" onClick={addButton}>
            Agregar
          </Button>
        </div>

        <div>
          <Label>Botones agregados:</Label>
          <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(buttons, null, 2)}
          </pre>
        </div>

        <Button type="button" onClick={handleSubmit} className="w-full mt-4">
          Crear Plantilla en Meta
        </Button>
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>


        <div>
          <Label>JSON generado:</Label>
          <pre className="bg-gray-100 p-2 rounded text-sm max-h-96 overflow-y-auto">
            {JSON.stringify(json, null, 2)}
          </pre>
        </div>
      </form>
    </div>
  );
};

export default TemplateCreator;
