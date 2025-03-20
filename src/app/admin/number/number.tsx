import { useState } from "react";
import axios from "axios";

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export default function PhoneNumberForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkToken, setLinkToken] = useState(""); // Estado para el token
  const [isRestartDisabled, setIsRestartDisabled] = useState(true); // Estado para deshabilitar el botón
  const [countdown, setCountdown] = useState(30); // Estado para el temporizador

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${apiWhatsApp}/set-phone-number`, 
        { phoneNumber }, 
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("Respuesta del servidor:", response.data);

      if (response.data.message) alert(response.data.message);
      if (response.data.token) {
        setLinkToken(response.data.token);
        console.log("Token recibido:", response.data.token);
      }

      // Iniciar el temporizador de 30 segundos para habilitar el botón
      setIsRestartDisabled(true);
      setCountdown(30);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsRestartDisabled(false);
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error al enviar el número:", error);
      alert("Hubo un error al guardar el número.");
    }
  };

  const handleRestart = async () => {
    try {
      const response = await axios.post(`${apiWhatsApp}/restart-bot`, {}, {
        headers: { "Content-Type": "application/json" }
      });
      console.log("Reinicio solicitado:", response.data);
      alert("El bot se está reiniciando...");
    } catch (error) {
      console.error("Error al reiniciar el bot:", error);
      alert("Error al intentar reiniciar el bot.");
    }
  };
  
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <div className="bg-blue-300 dark:bg-blue-600 p-6 rounded-lg shadow-lg text-black dark:text-white w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Ingrese su número</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-lg">Número de teléfono:</span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="w-full p-3 mt-2 border border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            />
          </label>
          <button
            type="submit"
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Guardar número
          </button>
        </form>

        {linkToken && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Token de vinculación:</h3>
            <div className="mt-2 p-3 border border-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg text-center select-all">
              {linkToken}
            </div>
          </div>
        )}

        <button
          onClick={handleRestart}
          disabled={isRestartDisabled}
          className={`w-full p-3 mt-4 rounded-lg transition ${isRestartDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
        >
          {isRestartDisabled ? `Actualizar provedor (${countdown}s)` : "Actualizar provedor"}
        </button>
      </div>
    </div>
  );
}