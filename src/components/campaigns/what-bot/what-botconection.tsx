"use client";

import { useEffect, useState, useRef } from "react";
import PhoneInput from "@/components/form/group-input/PhoneInput";
import Button from "@/components/shared/ui/button/Button";
import Label from "@/components/form/Label";
import axios from "axios";


const apiBotUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL_BOT;

const countries = [
  { code: "CO", label: "57" },
  { code: "US", label: "1" }
];

export default function BotConnection() {
  const hasNotifiedRef = useRef(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkToken, setLinkToken] = useState("");
  const [isRequestDisabled, setIsRequestDisabled] = useState(false);
  const [requestCountdown, setRequestCountdown] = useState(0);
  const [isRestartDisabled, setIsRestartDisabled] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isBotConnected, setIsBotConnected] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRequestToken = async () => {
    if (isRequestDisabled) return;
  
    try {
      const res = await axios.post(`${apiBotUrl}/set-phone-number`, { phoneNumber });
  
      if (res.data.token) {
        setLinkToken(res.data.token);
        setErrorMessage(""); // limpiar error si sale bien
      }
  
      setIsRequestDisabled(true);
      setRequestCountdown(5);
      const interval = setInterval(() => {
        setRequestCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRequestDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
  
      setIsRestartDisabled(true);
      setCountdown(30);
      const restartInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(restartInterval);
            setIsRestartDisabled(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      console.error("❌ Error al solicitar token:", err);
      
      if (err.response && err.response.data?.message) {
        setErrorMessage(err.response.data.message); // mostrar mensaje del backend
      } else {
        setErrorMessage("❌ Error desconocido al conectar.");
      }
    }
  };
  const handleRestart = async () => {
    try {
      await axios.post(`${apiBotUrl}/restart-bot`);
      alert("🔄 Reiniciando bot...");
    } catch (err) {
      console.error("❌ Error al reiniciar:", err);
    }
  };

  // Polling para saber si el bot está conectado
  useEffect(() => {
    const interval = setInterval(async () => {
      if (hasNotifiedRef.current) return;
      try {
        const res = await axios.get(`/api/bot-connected-agente`);
        if (res.data.connected) {
          setIsBotConnected(true);
          hasNotifiedRef.current = true;
          clearInterval(interval);
        }
      } catch (err) {
        console.error("❌ Error verificando conexión del bot:", err);
      }
    }, 3000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto mt-10 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
      {errorMessage && (
  <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 text-sm font-semibold border border-red-300 shadow">
    {errorMessage}
  </div>
)}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
         Conexión con el Bot de WhatsApp
      </h2>
      

      {isBotConnected && (
        <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 text-sm font-semibold border border-green-300 shadow">
          ✅ Bot conectado exitosamente, Actualiza tu provedor
        </div>
      )}

      <Label className="mb-1">📱 Número de teléfono</Label>
      <PhoneInput
        selectPosition="start"
        countries={countries}
        placeholder="573200000000"
        onChange={(value) => setPhoneNumber(value)}
      />

      <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="outline"
          onClick={handleRequestToken}
          disabled={isRequestDisabled}
          className="w-full"
        >
          {isRequestDisabled ? `Espera ${requestCountdown}s...` : "📨 Solicitar Token"}
        </Button>

        <Button
          variant="primary"
          onClick={handleRestart}
          disabled={isRestartDisabled}
          className="w-full"
        >
          {isRestartDisabled ? `⏳ (${countdown}s)` : "🔁 Actualizar Proveedor"}
        </Button>
      </div>

      {linkToken && (
        <div className="mt-6">
          <Label>🔑 Token de vinculación</Label>
          <div
            className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 text-center text-gray-800 dark:text-white border border-dashed border-gray-300 dark:border-gray-600 rounded-lg select-all cursor-pointer"
            title="Haz clic para copiar"
            onClick={() => navigator.clipboard.writeText(linkToken)}
          >
            {linkToken}
          </div>
        </div>
      )}
    </div>
  );
}