"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Button from "@/components/shared/ui/button/Button";
import { endPointBackend } from "@/api";
import Label from "@/components/form/Label";
import Select from "@/components/form/Select";
import { COUNTRIES, ROLES } from "@/util";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import Input from "@/components/form/input/InputField";
import { CalenderIcon } from "@/icons";

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

const INPUT_FIELDS = [
  { label: "Nombre", name: "name" },
  { label: "Apellido", name: "lastName" },
  { label: "Identificación", name: "idNumber" },
  { label: "Email", name: "email", type: "email" },
  { label: "Teléfono", name: "phone" },
  { label: "Ciudad", name: "city" },
  { label: "Dirección", name: "address" },
];

export const UpdateUserForm = ({ user, onClose, onSuccess }: Readonly<Props>) => {
  const [selectedUser, setSelectedUser] = useState<User>(user);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const parsedDate = user.birthDate
      ? new Date(user.birthDate).toISOString().split("T")[0]
      : "";
    setSelectedUser({ ...user, birthDate: parsedDate });
  }, [user]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof User
  ) => {
    const value = e.target.value;
    setSelectedUser((prev) => ({ ...prev, [field]: value }));
    if (field === "email") setEmailError("");
  };

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedUser((prev) => ({
      ...prev,
      [name]: name === "roles" ? [value] : value,
    }));
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const date = selectedDates[0];
    if (date) {
      setSelectedUser((prev) => ({
        ...prev,
        birthDate: date.toISOString().split("T")[0],
      }));
    }
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isEmailValid(selectedUser.email)) {
      setEmailError("Correo no válido");
      return;
    }

    try {
      await endPointBackend({
        accionBD: "Update-User",
        id: selectedUser.id,
        body: selectedUser,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al actualizar usuario", error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {INPUT_FIELDS.map(({ label, name }) => (
          <div key={name}>
            <Label>{label} *</Label>
            <Input
              name={name}
              type="text"
              placeholder={`Digite ${label}`}
              value={selectedUser[name as keyof User] || ""}
              onChange={(e) => handleInputChange(e, name as keyof User)}
              required
            />
            {name === "email" && emailError && (
              <p className="text-red-500 text-sm">{emailError}</p>
            )}
          </div>
        ))}


          <div>
            <Label>Fecha de nacimiento</Label>
            <div className="relative">
              <Flatpickr
                value={selectedUser.birthDate}
                onChange={handleDateChange}
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Selecciona una fecha"
                className="w-full py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md h-11 focus:ring-2 focus:ring-blue-500  dark:border-gray-700 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                <CalenderIcon/>
              </span>
            </div>
          </div>

          <div>
            <Label>País *</Label>
            <Select name="country" options={COUNTRIES} value={selectedUser.country} onChange={handleChange}/>
          </div>

          <div>
            <Label>Rol</Label>
            <Select name="roles" options={ROLES} value={selectedUser.roles?.[0] || ""} onChange={handleChange}/>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Guardar</Button>
        </div>
      </form>
    </div>
  );
};
