"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation"; 
import axios from "axios";
import '@/app/page.module.css';

interface LoginData {
  username: string;
  password: string;
}

export default function LoginForm() {
  const [loginData, setLoginData] = useState<LoginData>({
    username: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false); 
  const [roles, setRoles] = useState<string[]>([]); 

  const router = useRouter(); 

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);  
    setLoading(true); 

    try {
      const { data } = await axios.post("http://localhost:8080/api/auth/login", loginData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, 
      });

      if (data.token && data.roles) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("roles", JSON.stringify(data.roles)); 
        setRoles(data.roles);
        router.push("/admin/what-panel");
      } else {
        throw new Error("No se recibió un token o roles en la respuesta");
      }

    } catch (error: any) {
      console.error("Error en la autenticación:", error);
      
      if (error.response) {
        setError(error.response.data.message || "Error en la autenticación");
      } else {
        setError("Error de conexión con el servidor");
      }

      localStorage.removeItem("authToken"); // Limpia en caso de error
      localStorage.removeItem("roles");

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-blue-500">
      <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl text-black">
        <h2 className="text-3xl font-bold text-center text-gray-700">Iniciar sesión</h2>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="username"
            placeholder="Correo electrónico"
            value={loginData.username}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            required
            autoComplete="email"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={loginData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            disabled={loading} 
          >
            {loading ? "Cargando..." : "Iniciar sesión"} 
          </button>
        </form>
      </div>
    </div>
  );
}
