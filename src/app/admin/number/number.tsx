import { useState } from "react";


const apiWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_URL;

export default function PhoneNumberForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkToken, setLinkToken] = useState(""); // Estado para el token

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiWhatsApp}/set-phone-number`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber }),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      if (data.message) alert(data.message);
      if (data.token) {
        setLinkToken(data.token);
        console.log("Token recibido:", data.token);
      }
      
    } catch (error) {
      console.error("Error al enviar el número:", error);
      alert("Hubo un error al guardar el número.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Ingrese su número de teléfono:
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </label>
        <button type="submit">Guardar número</button>
      </form>

      {linkToken && (
        <div>
          <h3>Token de vinculación:</h3>
          <p>{linkToken}</p>
        </div>
      )}
    </div>
  );
}