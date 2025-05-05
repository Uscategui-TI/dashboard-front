"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Image from "next/image";
import { useNavigation } from "@/util";

const CountryMap = dynamic(() => import("./CountryMap"), { ssr: false });

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  const { redirectTo } = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Leer token desde cookie
        const getTokenFromCookie = () => {
          const match = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
          return match ? match[2] : null;
        };
  
        const token = getTokenFromCookie();
        if (!token) {
          console.error("Token no encontrado en cookies");
          return;
        }
  
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        };
  
        // Total de prospectos
        const totalRes = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/count`, {
          headers,
        });
        const totalData = await totalRes.json();
  
        // Obtener departamentos
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/departments/all`, {
          headers,
        });
        const departments = await res.json();
  
        // Agrupar departamentos por ID
        const grouped = departments.reduce((acc: Record<number, any>, dept: any) => {
          if (!acc[dept.id]) {
            acc[dept.id] = {
              latLng: [parseFloat(dept.latitude), parseFloat(dept.longitude)],
              name: dept.name,
              count: 1,
            };
          } else {
            acc[dept.id].count++;
          }
          return acc;
        }, {});
  
        const uniquePoints = Object.values(grouped);
  
        setPoints(uniquePoints);
        setTotal(totalData);
      } catch (error) {
        console.error("Error al cargar datos demográficos:", error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Datos demográficos de los prospectos
          </h3>
        </div>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-40 p-2">
            <DropdownItem onItemClick={ () => redirectTo("/prospect-panel") }>Ver más</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="mt-4 mb-2 flex items-center gap-3">
        <Image
          width={48}
          height={48}
          src="/images/country/colombia_5922036.png"
          alt="colombia"
          className="w-full max-w-8"
        />
        <div>
          <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Colombia</p>
          <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
            {total} Prospectos
          </span>
        </div>
      </div>

      <div className="px-4 py-6 my-6 overflow-hidden border border-gray-200 rounded-2xl bg-gray-50 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="h-[400px] w-full">
          <CountryMap key={points.length} points={points} />
        </div>
      </div>
    </div>
  );
}