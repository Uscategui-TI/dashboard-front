"use client";

import { useState } from "react";
import axios from "axios";
import Button from "../../ui/button/Button";

const initialForm = {
  documento: "",
  asunto: "",
  mensaje: "",
  categoria: "",
  prioridad: "PENDIENTE",
  comentario: "",
};
export default function CrearSolicitudModal({ ionClose, onSuccess }: any) {
  const [form, setForm] = useState(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/crear-solicitud`, form);

      setForm(initialForm);
      onSuccess();
    } catch (error) {
      console.error("Error creando solicitud:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Documento del Prospecto</label>
        <input
          name="documento"
          value={form.documento}
          onChange={handleChange}
          placeholder="Número de documento"
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Asunto</label>
        <input
          name="asunto"
          value={form.asunto}
          onChange={handleChange}
          placeholder="Título o asunto de la solicitud"
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Mensaje</label>
        <textarea
          name="mensaje"
          value={form.mensaje}
          onChange={handleChange}
          rows={3}
          placeholder="Descripción detallada"
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Categoría</label>
        <select
          name="categoria"
          value={form.categoria}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">Selecciona una categoría</option>
          <option value="INFORMATIVA">Informativa</option>
          <option value="PETICION">Petición</option>
          <option value="CONSTRUCCION">Construcción</option>
          <option value="PROPUESTA">Propuesta</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 text-gray-700 dark:text-gray-300">Prioridad</label>
        <select
          name="prioridad"
          value={form.prioridad}
          onChange={handleChange}
          className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        >
          <option value="">Selecciona una prioridad</option>
          <option value="ALTA">Alta</option>
          <option value="MEDIA">Media</option>
          <option value="BAJA">Baja</option>
        </select>
      </div>
    </div>
  );
}
