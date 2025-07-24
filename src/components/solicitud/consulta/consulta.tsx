"use client";

import { endPointBackend } from "@/api";
import Avatar from "@/components/shared/ui/avatar/Avatar";
import { useEffect, useRef, useState } from "react";
import { FaYoutube, FaFacebookF, FaWhatsapp, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";


const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "EN_PROCESO":
      return "bg-green-100 text-green-700";
    case "FINALIZADOS":
      return "bg-green-400 text-green-700";
    case "PENDIENTE":
      return "bg-yellow-100 text-yellow-700";
    case "RECHAZADA":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

type ComentarioItem = {
  fecha: Date;
  fechaFormateada: string;
  texto: string;
};

export const formatearComentarios = (comentario: string): ComentarioItem[] => {
  if (!comentario) return [];

  // Este regex extrae bloques como: [fecha] texto
const regex = /\[(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?)\]([^\[]*)/g;

  const resultado: ComentarioItem[] = [];
  let match;

  while ((match = regex.exec(comentario)) !== null) {
    const fechaStr = match[1];
    const texto = match[2].trim();

    const fechaRecortada = fechaStr.replace(/\.(\d{3})\d+/, ".$1");
    const fechaObj = new Date(fechaRecortada);

    if (!isNaN(fechaObj.getTime())) {
      const fechaFormateada = fechaObj.toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      resultado.push({
        fecha: fechaObj,
        fechaFormateada,
        texto,
      });
    }
  }

  return resultado;
};

export default function ConsultaSolicitudPage() {
  const [codigo, setCodigo] = useState("");
  const [solicitud, setSolicitud] = useState<any>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleConsultar = async () => {
    setError("");
    setSolicitud(null);

    if (!codigo.trim()) {
      setError("Ingrese un código de solicitud.");
      return;
    }

    endPointBackend({ accionBD: "Get-Solicitud", id: codigo })
    .then((resp) => {
      setSolicitud(resp.data);
    })
  };

  useEffect(() => {
    if (solicitud && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [solicitud]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl p-8 space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Consulta tu Solicitud
        </h1>
        <p className="text-center text-gray-500 text-sm">
          Ingresa el código de seguimiento para ver el estado de tu solicitud.
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="Ej: USCA00000"
            className="flex-1 border rounded-lg px-4 py-2 text-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-400"
          />
          <button
            onClick={handleConsultar}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-all"
          >
            Consultar
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-100 p-2 rounded text-center">
            {error}
          </p>
        )}

        {solicitud && (
          <div className="border rounded-xl p-5 bg-gray-50 space-y-3 shadow-inner">
            <h2 className="text-xl font-semibold text-gray-800">
              Detalles de la Solicitud
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><span className="font-medium">Código:</span> {solicitud.publicCode}</p>
              <p><span className="font-medium">Solicitante: </span>{solicitud.prospecto?.name} {solicitud.prospecto?.lastName}</p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEstadoColor(solicitud.estado)}`}>
                  {solicitud.estado}
                </span>
              </p>
              <p><span className="font-medium">Categoria :</span> {solicitud.categoria} </p>
              <p><span className="font-medium">Fecha Radicación:</span> {new Date(solicitud.fechaCreacion).toLocaleDateString("es-ES")} </p>
              {solicitud.fechaActualizacion && (
                <p>
                  <span className="font-medium">Última Actualización:</span>{" "}
                  {new Date(solicitud.fechaActualizacion).toLocaleDateString("es-ES")}
                </p>
              )}
              <p><span className="font-medium">Asignado a: </span>{ solicitud.usuarioAsignado.name} {solicitud.usuarioAsignado.lastName}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">Asunto:</p>
              <p className="text-gray-600">{solicitud.asunto}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium">Descripción:</p>
              <p className="text-gray-600">{solicitud.mensaje}</p>
            </div>

            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Observaciones:</p>
              <div className="max-h-64 overflow-y-auto pr-2">
                {formatearComentarios(solicitud.comentario)
                .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                .map((comentario, index) => (
                  <div key={index} className="flex items-start space-x-3 my-4">
                    {/* Avatar */}
                    <Avatar src="/images/user/user-01.jpg" size="small" status="online"/>
                    {/* Comentario */}
                    <div>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Fecha:</span> {comentario.fechaFormateada}
                      </p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">
                        {comentario.texto}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botones de redes sociales */}
      <div className="fixed bottom-5 right-5 flex flex-col space-y-4 z-50">
        {/* YouTube */}
        <a
          href="https://youtube.com/tu_canal"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="YouTube"
        >
          <FaYoutube size={24} />
        </a>

        {/* Facebook */}
        <a
          href="https://facebook.com/tu_pagina"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Facebook"
        >
          <FaFacebookF size={24} />
        </a>

        {/* X (antes Twitter) */}
        <a
          href="https://x.com/tu_usuario"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="X"
          className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white text-2xl font-bold hover:bg-gray-900 transition"
          style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-0.1em" }}
        >
          <FaXTwitter size={24} />
        </a>

        {/* WhatsApp */}
        <a
          href="https://wa.me/1234567890"  // Cambia por tu número en formato internacional sin signos
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="WhatsApp"
        >
          <FaWhatsapp size={24} />
        </a>

        {/* Página web */}
        <a
          href="https://tusitio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="Página web"
        >
          <FaGlobe size={24} />
        </a>
      </div>

    </div>
  );
}