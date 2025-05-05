"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";

const ROLES = ["Admin", "Secretario", "Periodista", "Coordinador", "Pasante"];

type User = {
  id: number;
  name: string;
  lastName: string;
  email: string;
  birthDate: string;
  phone: string;
  address: string;
  city: string;
  country?: string;
  roles: string[];
};

type Props = {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
};

export default function EditarUsuarioModal({ user, onClose, onSuccess }: Props) {
  const [selectedUser, setSelectedUser] = useState<User>(user);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const parsedDate = user.birthDate
      ? new Date(user.birthDate).toISOString().split("T")[0]
      : "";
    setSelectedUser({ ...user, birthDate: parsedDate });
  }, [user]);

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid(selectedUser.email)) {
      setEmailError("Correo no válido");
      return;
    }

    try {
      await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/update/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selectedUser),
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Error al actualizar el usuario:", err);
    }
  };

  return (
    <>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Editar Usuario
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nombre", field: "name" },
                  { label: "Apellido", field: "lastName" },
                  { label: "Correo", field: "email" },
                  { label: "Teléfono", field: "phone" },
                  { label: "Nacimiento", field: "birthDate", type: "date" },
                  { label: "Dirección", field: "address" },
                  { label: "Ciudad", field: "city" },
                  { label: "País", field: "country" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {label}
                    </label>
                    <input
                      type={type || "text"}
                      value={selectedUser[field as keyof User] || ""}
                      onChange={(e) =>
                        setSelectedUser({ ...selectedUser, [field]: e.target.value })
                      }
                      className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    />
                    {field === "email" && emailError && (
                      <p className="text-red-500 text-sm">{emailError}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rol
                  </label>
                  <select
                    value={selectedUser.roles?.[0] || ""}
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, roles: [e.target.value] })
                    }
                    className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  >
                    <option value="" disabled>
                      Seleccionar rol
                    </option>
                    {ROLES.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  Guardar
                </Button>
              </div>
            </form>
          </div>
    </>
  );
}