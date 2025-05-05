"use client";

import { useEffect, useRef, useState } from "react";

export default function ConsultaSolicitudPage() {
  const [codigo, setCodigo] = useState("");
  const [solicitud, setSolicitud] = useState<any>(null);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement | null>(null);

  const handleBuscar = async () => {
    setError("");
    setSolicitud(null);

    if (!codigo.trim()) {
      setError("Ingrese un código de solicitud.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/api/prospecto/${codigo}/consulta`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        if (res.status === 404) {
          setError("Solicitud no encontrada.");
        } else {
          setError("Error al consultar la solicitud.");
        }
        return;
      }

      const data = await res.json();
      setSolicitud(data);
    } catch (e) {
      console.error(e);
      setError("Error de conexión con el servidor.");
    }
  };

  // Scroll al resultado cuando se carga una solicitud
  useEffect(() => {
    if (solicitud && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [solicitud]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 4000); // 4 segundos
  
      return () => clearTimeout(timer); // Limpia en caso de cambio rápido
    }
  }, [error]);

  return (
    <div
      className="relative flex flex-col items-center justify-start min-h-screen t">
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0 bg-cover bg-center bg-no-repeat" 
      style={{
        backgroundImage: "url('/images/login/FotoLogin.jpg')",
      }}
      />
      <div className="relative z-10 w-full max-w-7xl px-6 py-10">

        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Consultar tu Solicitud
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Código de solicitud"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleBuscar}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition"
          >
            Buscar
          </button>
        </div>

        {error && (
        <div className="bg-blue-100 border border-blue-600 text-black px-4 py-3 rounded relative mb-4 text-sm text-center max-w-md mx-auto">
            {error}
        </div>
        )}

        {solicitud && (
          <div
            ref={resultRef}
            className="w-full max-w-7xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mt-6"
          >
            <h4 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white border-b pb-2">
              Datos de la Solicitud
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 dark:text-gray-200">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Asunto
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.asunto}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Mensaje
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.mensaje}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Categoría
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.categoria}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Estado
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.estado}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Prioridad
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.prioridad}
                </div>
              </div>

              <div className="flex flex-col md:col-span-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Comentario
                </span>

                {solicitud.comentario
                  ? solicitud.comentario
                      .split(/\n+/)
                      .map((linea: string, index: number) => {
                        const texto = linea.split("]").slice(1).join("]").trim();
                        if (!texto) return null;
                        return (
                          <div
                            key={index}
                            className="mb-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm max-w-xl self-start"
                          >
                            {texto}
                          </div>
                        );
                      })
                  : (
                    <div className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-white max-w-xl self-start">
                      Sin comentario
                    </div>
                  )}
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Código de Solicitud
                </span>
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                  {solicitud.codigoSolicitud}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}