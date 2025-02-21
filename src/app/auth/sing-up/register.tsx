"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent } from "react";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  birthDate: string;
  idNumber: string;
  role: string;
}

export default function RegisterForm() {
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: "",
    password: "",
    fullName: "",
    birthDate: "",
    idNumber: "",
    role: "",
  });

  const router = useRouter();
  const roles = ["Admin", "Secretario", "Periodista", "Coordinador", "Pasante"];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const url = `https://auth-service-production-40be.up.railway.app/api/auth/register`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (!response.ok) {
        if (response.status === 400 && data.message?.includes("Username already exists")) {
          toast.error("❌ El usuario ya existe.");
          console.log("Mostrando toast de error...");
        } else {
          toast.error(`❌ Error: ${data.message || "Error al registrar usuario."}`);
          console.log("Mostrando toast de otro error...");
        }
        return;
      }

      toast.success("✅ ¡Registro exitoso! Redirigiendo al login...");
      console.log("Mostrando toast de éxito...");
      setTimeout(() => {
        router.push("https://dashboard-front-production.up.railway.app/auth/sing-in");
      }, 2000);

    } catch (error) {
      console.error("Error durante la petición:", error);
      toast.error("❌ Error al conectar con el servidor.");
      console.log("Mostrando toast de error de conexión...");
    }
  };
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-blue-500">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl text-black ">
        <ToastContainer position="top-right" autoClose={3000} />
          <h2 className="text-3xl font-bold text-center text-black">
            Registrarse
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Nombre completo"
              value={registerData.fullName}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="date"
              name="birthDate"
              value={registerData.birthDate}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="text"
              name="idNumber"
              placeholder="Número de identificación"
              value={registerData.idNumber}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            <input
              type="email"
              name="username"
              placeholder="Correo electrónico"
              value={registerData.username}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
              autoComplete="email"
            />
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={registerData.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
              required
            />
            
            
            <select
              name="role"
              value={registerData.role}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 bg-black-400"
              required
            >
              <option value="" disabled>Selecciona un rol</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
  
            <button
              type="submit"
              className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Registrarse
            </button>
          </form>
        </div>
      </div>
    );
  }