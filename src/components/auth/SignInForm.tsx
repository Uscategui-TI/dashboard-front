"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/shared/ui/button/Button";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Cookies from "js-cookie";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [loginData, setLoginData] = useState({
    idNumber: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post(`${authUrl}/api/auth/login`, loginData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (data.token && data.roles) {
        Cookies.set("token", data.token);
        localStorage.setItem("roles", JSON.stringify(data.roles));
        router.push("/what-panel");
      } else {
        throw new Error("No se recibió un token o roles en la respuesta");
      }
    } catch (error: any) {
      console.error("Error en la autenticación:", error);
      setError(error.response?.data?.message || "Credenciales inválidas");
      localStorage.removeItem("authToken");
      localStorage.removeItem("roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Iniciar Session
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ingresa tu documento y Contraseña
            </p>
          </div>

          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <Label>
                  Número de identificación <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="idNumber"
                  placeholder="Número de identificación"
                  value={loginData.idNumber}
                  onChange={handleChange}
                  type="text"
                />
              </div>
              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Contraseña"
                    value={loginData.password}
                    onChange={handleChange}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>
              <div>
                <Button className="w-full" size="sm" type="submit" disabled={loading}>
                  {loading ? "Cargando..." : "Iniciar sesión"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}