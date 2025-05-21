"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useModal } from "../../hooks/useModal";
import Image from "next/image";

interface User {
  name: string;
  lastName: string;
  roles: string[];
  city: string;
  country: string;
}

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [user, setUser] = useState<User | null>(null);
  const [totalMessages, setTotalMessages] = useState<number | null>(null);

  const handleSave = () => {
    console.log("Saving changes...");
    closeModal();
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get("token"); // ✅ Token desde cookie
      if (!token) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/me`, {
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
        const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/message-stats/my-stats`, {
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
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
          <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
            <Image width={80} height={80} src="/images/user/logo-uscate-icon.jpg" alt="user" />
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
      </div>
    </div>
  );
}