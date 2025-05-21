"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../shared/ui/modal";
import Button from "../shared/ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "@/lib/axiosInstance";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  roles: string[];
}

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const response = await axios.get(`${authUrl}/api/v1.0/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
        setFormData(response.data); // rellenar formulario
      } catch (error) {
        console.error("Error al obtener el usuario:", error);
      }
    };

    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = Cookies.get("token");
    if (!formData || !token) return;
  
    try {
      await axios.put(`${authUrl}/api/auth/update/${formData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // 🔥 Actualizamos el estado para reflejar los cambios en la UI
      setUser(formData);
      closeModal();
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información Personal
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Nombres</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.name || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Apellidos</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.lastName || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Correo</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.email || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.phone || "-"}</p>
            </div>
            <div>
              <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Rol</p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.roles?.join(", ") || "-"}</p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          ✏️ Editar
        </button>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Editar información personal</h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Actualiza tus datos para mantener tu perfil actualizado.</p>
          <form className="flex flex-col">
            <div className="h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Nombres</Label>
                  <Input name="name" value={formData?.name || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Apellidos</Label>
                  <Input name="lastName" value={formData?.lastName || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Correo</Label>
                  <Input name="email" value={formData?.email || ""} onChange={handleChange} />
                </div>
                <div>
                  <Label>Teléfono</Label>
                  <Input name="phone" value={formData?.phone || ""} onChange={handleChange} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-2 mt-6">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                Guardar Cambios
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}