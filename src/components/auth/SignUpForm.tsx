"use client";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

interface RegisterData {
  email: string;
  password: string;
  name: string;
  lastName: string;
  birthDate: string;
  idNumber: string;
  roles: string;
  address: string;
  city: string;
  country: string;
  phone: string;
}

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    lastName: "",
    birthDate: "",
    idNumber: "",
    roles: "",
    address: "",
    city: "",
    country: "",
    phone: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const roles = ["Admin", "Secretario", "Periodista", "Coordinador", "Pasante"];

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const mappedData = {
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        lastName: registerData.lastName,
        birthDate: registerData.birthDate,
        idNumber: registerData.idNumber,
        address: registerData.address,
        city: registerData.city,
        country: registerData.country,
        phone: registerData.phone,
        roles: [registerData.roles], // backend espera Set<Role>
      };

      const response = await fetch(`${authUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || data.error || "Error al registrar usuario.");
        setMessage(null);
        return;
      }

      setMessage("¡Registro exitoso! Redirigiendo al login...");
      setError(null);
      setTimeout(() => router.push("/signin"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
      setMessage(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign Up
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your details to create an account
            </p>
          </div>

          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-sm text-green-500 text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>Nombre<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="name"
                    placeholder="Nombre"
                    value={registerData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Apellido<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="Apellido"
                    value={registerData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Fecha de nacimiento<span className="text-error-500">*</span></Label>
                  <Input
                    type="date"
                    name="birthDate"
                    value={registerData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Número de identificación<span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  name="idNumber"
                  placeholder="Identificación"
                  value={registerData.idNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Correo electrónico<span className="text-error-500">*</span></Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={registerData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <Label>País<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="country"
                    placeholder="País"
                    value={registerData.country}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label>Ciudad<span className="text-error-500">*</span></Label>
                  <Input
                    type="text"
                    name="city"
                    placeholder="Ciudad"
                    value={registerData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Dirección<span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  name="address"
                  placeholder="Dirección"
                  value={registerData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Teléfono<span className="text-error-500">*</span></Label>
                <Input
                  type="text"
                  name="phone"
                  placeholder="Teléfono"
                  value={registerData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label>Contraseña<span className="text-error-500">*</span></Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={registerData.password}
                    onChange={handleChange}
                    required
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
                <Label>Rol<span className="text-error-500">*</span></Label>
                <select
                  name="roles"
                  value={registerData.roles}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
                  required
                >
                  <option value="" disabled>
                    Selecciona un rol
                  </option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  className="w-5 h-5"
                  checked={isChecked}
                  onChange={setIsChecked}
                />
                <p className="inline-block font-normal text-gray-500 dark:text-gray-400">
                  Al crear una cuenta aceptas los{" "}
                  <span className="text-gray-800 dark:text-white/90">Términos y condiciones,</span>{" "}
                  y nuestra{" "}
                  <span className="text-gray-800 dark:text-white">Política de privacidad.</span>
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600"
                >
                  Registrarse
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}