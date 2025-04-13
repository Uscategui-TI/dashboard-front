"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { MoreDotIcon } from "@/icons";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import Image from "next/image";

const CountryMap = dynamic(() => import("./CountryMapBogota"), { ssr: false });

export default function DemographicCard() {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos de localidades de Bogotá
        const res = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/localities/all`);
        const localities = await res.json();

        // Calcular total de prospectos
        const totalCount = localities.reduce((acc: number, loc: any) => acc + loc.total, 0);

        // Convertir cada localidad en un punto para el mapa
        const mappedPoints = localities.map((loc: any) => ({
          name: loc.name,
          count: loc.total,
          latLng: [loc.latitude, loc.longitude],
        }));

        setPoints(mappedPoints);
        setTotal(totalCount);
      } catch (error) {
        console.error("Error al cargar datos de localidades:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <div className="flex justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Datos demográficos de los prospectos en Bogotá
          </h3>
        </div>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown isOpen={isOpen} onClose={closeDropdown} className="w-40 p-2">
            <DropdownItem onItemClick={closeDropdown}>Ver más</DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="mt-4 mb-2 flex items-center gap-3">
        <Image
          width={48}
          height={48}
          src="/images/country/bogota.png"
          alt="colombia"
          className="w-full max-w-8"
        />
        <div>
          <p className="font-semibold text-gray-800 text-theme-sm dark:text-white/90">Bogotá D.C.</p>
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
