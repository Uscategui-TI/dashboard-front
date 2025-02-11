"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation"; 
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
  
    const url = "http://localhost:8080/api/auth/login";
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Error al iniciar sesión"); 
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(data);
  
      if (data.token && data.roles) {
        localStorage.setItem("authToken", data.token); 
        localStorage.setItem("roles", JSON.stringify(data.roles)); // Guardamos los roles
        setRoles(data.roles);
        router.push("/admin/what-panel");
      } else {
        setError("No se recibió un token o roles en la respuesta");
      }
      
    } catch (error) {
      console.error("Error en la autenticación:", error);
      setError("Hubo un problema al intentar iniciar sesión");
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
