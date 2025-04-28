"use client";

import { useState } from "react";
import axios from "axios";
import Button from "../ui/button/Button";

interface CrearSolicitudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CrearSolicitudModal({ isOpen, onClose, onSuccess }: CrearSolicitudModalProps) {
  const [documento, setDocumento] = useState("");
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [categoria, setCategoria] = useState("");
  const [prioridad, setPrioridad] = useState("PENDIENTE");
  const [comentario, setComentario] = useState("");

  const handleCreate = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/crear-solicitud`, {
        documento,
        asunto,
        mensaje,
        categoria,
        prioridad,
        comentario,
      });

        setDocumento("");
        setAsunto("");
        setMensaje("");
        setCategoria("");
        setPrioridad("PENDIENTE");
        setComentario("");



      onSuccess(); // Actualizar lista
      onClose();   // Cerrar modal
    } catch (error) {
      console.error("Error creando solicitud:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div
          className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-lg shadow-lg relative transform transition-all duration-300 scale-95 hover:scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
          >
            ✕
          </button>

          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Crear Nueva Solicitud
          </h2>

          {/* Formulario */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Documento del Prospecto</label>
              <input
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                placeholder="Número de documento"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Asunto</label>
              <input
                value={asunto}
                onChange={(e) => setAsunto(e.target.value)}
                placeholder="Título o asunto de la solicitud"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block mb-1 text-gray-700 dark:text-gray-300">Mensaje</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                rows={3}
                placeholder="Descripción detallada"
                className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

           <div>
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Categoría</label>
                <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
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
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                    className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                    <option value="">Selecciona una prioridad</option>
                    <option value="ALTA">Alta</option>
                    <option value="MEDIA">Media</option>
                    <option value="BAJA">Baja</option>
                </select>
                </div>

          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreate}>
              Crear
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
