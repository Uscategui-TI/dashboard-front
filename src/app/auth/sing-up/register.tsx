"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import '@/app/page.module.css'

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
  
    const roles = ["Admin", "Secretario", "Periodista", "Coordinador", "Pasante"];
  
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setRegisterData({ ...registerData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const url = "https://login-production-d568.up.railway.app/api/auth/register";
  
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(registerData),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error:", errorData);
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log(data);
        if (data.token) {
          localStorage.setItem("authToken", data.token);
          console.log("Token guardado:", data.token);
        } else {
          console.error("No token received in the response");
        }
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    };
  
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-blue-500">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-xl text-black ">
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
