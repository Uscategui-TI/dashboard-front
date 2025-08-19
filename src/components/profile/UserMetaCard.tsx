"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useModal } from "../../hooks/useModal";
import Image from "next/image";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import Label from "../form/Label";
import { Modal } from "../shared/ui/modal";
import Button from "../shared/ui/button/Button";
import axios from "@/lib/axiosInstance";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;


interface User {
  id: number;
  name: string;
  lastName: string;
  roles: string[];
  city: string;
  country: string;
  imageUrl: string;
  UrlImage:string;
}
type UserFormData = Partial<User> & { id: number };

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [user, setUser] = useState<User | null>(null);

  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!formData) return;
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  

  const handleSave = async () => {
    const token = Cookies.get("token");
    if (!formData || !token) return;

    try {
      await axios.put(`${authUrl}/api/v1.0/auth/update/${formData.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setUser(formData as User); // 👈 ya sabemos que es un User válido
      closeModal();
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
    }
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token"); // ✅ Token desde cookie
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1.0/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Error al obtener usuario:", response.status);
        }
      } catch (err) {
        console.error("Error al conectar con el backend", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchUserStats = async () => {
      const token = Cookies.get("token");
      if (!token) return;
  
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/v1.0/broadcasts/my-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.ok) {
          const data = await response.json();
          setTotalMessages(data.totalMessagesSent);
        } else {
          console.error("Error al obtener stats del usuario:", response.status);
        }
      } catch (err) {
        console.error("Error al conectar stats del usuario:", err);
      }
    };
  
    fetchUserStats();
  }, []);

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image
              width={80}
              height={80}
              src={user?.UrlImage|| "/images/user/logo-uscate-icon.jpg"} 
              alt="user"
            />
          </div>
          <div className="order-3 xl:order-2">
            <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
              {user ? `${user.name} ${user.lastName}` : "Cargando..."}
            </h4>
            <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? user.roles.join(", ") : "-"}
              </p>
              <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user ? `${user.city}, ${user.country}` : "-"}
              </p>
              {totalMessages !== null && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  📬 Mensajes enviados: <strong>{totalMessages}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
          <Button onClick={() => { 
                if (user) setFormData(user); 
                openModal(); 
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
              >
                ✏️Editar
          </Button>
      </div>
          {/* Modal */}
          <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
            <div className="w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
              <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">Editar información personal</h4>
              <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">Actualiza tus datos para mantener tu perfil actualizado.</p>
              <form className="flex flex-col">
                <div className="h-[450px] overflow-y-auto px-2 pb-3">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-6 sm:col-span-3">
                      <Label>Foto de perfil</Label>
                      <ImageUpload
                        onChange={(value) => setFormData({ ...formData!, imageUrl: value })}
                        value={formData?.imageUrl || ""}
                      />
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