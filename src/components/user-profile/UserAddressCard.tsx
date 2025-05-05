"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import axios from "@/lib/axiosInstance";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

interface User {
  id: number;
  country: string;
  city: string;
  address: string;
}

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const response = await axios.get(`${authUrl}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { id, country, city, address } = response.data;
        const userData = { id, country, city, address };
        setUser(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Error al obtener dirección del usuario:", error);
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
      const { data } = await axios.put(`${authUrl}/api/auth/update/${formData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      // ✅ Usar los datos que devuelve el backend
      setUser(data);
      setFormData(data);
      closeModal();
    } catch (error) {
      console.error("Error al actualizar dirección:", error);
    }
  };
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
              Dirección
            </h4>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">País</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.country || "-"}</p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Ciudad</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.city || "-"}</p>
              </div>

              <div>
                <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Dirección</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">{user?.address || "-"}</p>
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
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Editar dirección</h4>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Actualiza tus datos de ubicación.</p>
          <form className="flex flex-col">
            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2 px-2">
              <div>
                <Label>País</Label>
                <Input name="country" value={formData?.country || ""} onChange={handleChange} />
              </div>

              <div>
                <Label>Ciudad</Label>
                <Input name="city" value={formData?.city || ""} onChange={handleChange} />
              </div>

              <div className="lg:col-span-2">
                <Label>Dirección</Label>
                <Input name="address" value={formData?.address || ""} onChange={handleChange} />
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
    </>
  );
}
