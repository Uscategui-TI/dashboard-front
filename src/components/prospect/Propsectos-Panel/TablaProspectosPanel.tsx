"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import { GenericTable } from "@/components/tables/GenericTable";

interface Gender {
  name: string;
}

interface Location {
  name: string;
}

interface Prospect {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  document: string;
  cargo: string;
  gender?: Gender;
  department?: Location;
  municipality?: Location;
}

interface PaginatedResponse {
  content: Prospect[];
  totalPages: number;
}

const columns = [
  { key: "name", header: "Nombres" },
  { key: "lastName", header: "Apellidos" },
  { key: "phone", header: "Celular" },
  { key: "document", header: "Documento" },
  { key: "cargo", header: "Cargo / Ocupación" },
  {
    key: "gender",
    header: "Género",
    render: (row: Prospect) => row.gender?.name || "-",
  }
];

export default function ProspectTable() {
  const [data, setData] = useState<Prospect[]>([]);
  const [page, setPage] = useState(0);
  const size = 5;

  useEffect(() => {
    const fetchProspects = async () => {
      try {
        const response = await axios.get<PaginatedResponse>(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/list-latest`,
          { params: { page, size } }
        );
        setData(response.data.content);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };

    fetchProspects();
  }, [page]);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Prospectos Registrados Recientemente
        </h3>
      </div>
      <div className="max-w-full overflow-x-auto">
        <GenericTable<Prospect> columns={columns} data={data} />
      </div>
    </div>
  );
}
