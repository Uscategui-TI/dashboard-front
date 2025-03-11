import { useState } from "react";
import axios from "axios";

const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export default function PhoneNumberForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkToken, setLinkToken] = useState(""); // Estado para el token

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

    } catch (error) {
      console.error("Error al enviar el número:", error);
      alert("Hubo un error al guardar el número.");
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
      </div>
    </div>
  );
}