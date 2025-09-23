"use client";

import { useState } from "react";
import { endPointBackend } from "@/api";
import EditProspectForm from "@/components/prospect/forms/editProspectorm";
import PersonFormPage from "@/components/prospect/forms/CreateProspect.form";
import { FaYoutube, FaFacebookF, FaWhatsapp, FaGlobe, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ConsultaProspecto() {
  const [documento, setDocumento] = useState("");
  const [prospect, setProspect] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nuevo, setNuevo] = useState(false); // 👈 Para diferenciar si es nuevo registro

  const handleConsultar = async () => {
    if (!documento.trim()) {
      setError("⚠️ Debes ingresar un número de documento.");
      return;
    }

    setLoading(true);
    setError("");
    setNuevo(false);

    try {
      const resp = await endPointBackend({
        accionBD: "List-Prospects",
        params: { document: documento, page: 0, size: 1 },
      });

      const encontrado = resp?.data?.content?.[0];

      if (encontrado) {
        setProspect(encontrado); // ✅ Prospecto encontrado
      } else {
        setProspect(null);
        setNuevo(true); // ❌ No existe → modo registro
      }
    } catch (err) {
      console.error("Error consultando prospecto:", err);
      setError("❌ Error consultando el prospecto. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProspect(null);
    setNuevo(false);
    setDocumento("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      {!prospect && !nuevo ? (
        <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-gray-800 text-center">
            Actualiza tu Información
          </h2>
          <input
            type="text"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Ingresa tu número de documento"
            className="w-full border rounded-lg px-4 py-2 text-gray-700 focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleConsultar}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Consultando..." : "Consultar"}
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {prospect ? "Actualizar tus Datos" : "Registro de Datos"}
          </h2>

          {prospect ? (
            <EditProspectForm
              prospect={prospect}
              onClose={handleClose}
              onUpdate={() => console.log("✅ Prospecto actualizado")}
            />
          ) : (
            <PersonFormPage closeModal={handleClose} />
          )}
        </div>
      )}
            <div className="fixed bottom-5 right-5 flex flex-col space-y-4 z-50">
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@Boletinmes"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                aria-label="YouTube"
              >
                <FaYoutube size={24} />
              </a>
      
              {/* Facebook */}
              <a
                href="https://www.facebook.com/jjuscategui/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                aria-label="Facebook"
              >
                <FaFacebookF size={24} />
              </a>
      
              {/* X (antes Twitter) */}
              <a
                href="https://x.com/jjUscategui"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-black text-white text-2xl font-bold hover:bg-gray-900 transition"
                style={{ fontFamily: "Arial, sans-serif", letterSpacing: "-0.1em" }}
              >
                <FaXTwitter size={24} />
              </a>
      
               {/* Instagram */}
                <a
                  href="https://www.instagram.com/jjuscategui/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <FaInstagram size={24} />
                </a>
      
              {/* WhatsApp */}
              <a
                href="https://wa.me/+573102782407"  // Cambia por tu número en formato internacional sin signos
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={24} />
              </a>
      
              {/* Página web */}
              <a
                href="https://uscateguicol.com/"
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
