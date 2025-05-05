"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";

interface Prospect {
  id: number;
  name: string;
  lastName: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  cargo: string;
  birthDate: string;
  gender: {
    id: number;
    name: string;
  };
  department: {
    id: number;
    name: string;
  };
  municipality: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
    };
  };
  comune: {
    id: number;
    nameco: string;
  } | null;
  localidad: string | null;
  idEvento: number;
}

interface PaginatedResponse {
  content: Prospect[];
  totalPages: number;
}

export default function ProspectTable() {
  const [data, setData] = useState<Prospect[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [genders, setGenders] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prospectsRes, gendersRes, deptRes, muniRes, communesRes] =
          await Promise.all([
            axios.get<PaginatedResponse>(
              `${process.env.NEXT_PUBLIC_AUTH_URL}/api/person-form/list-latest`,
              { params: { page, size } }
            ),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/gender/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/departments/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/municipalities/all`),
            axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/communes/all`),
          ]);

        setData(prospectsRes.data.content);
        setTotalPages(prospectsRes.data.totalPages);
        setGenders(gendersRes.data);
        setDepartments(deptRes.data);
        setMunicipalities(muniRes.data);
        setCommunes(communesRes.data);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
      }
    };
    fetchData();
  }, [page, size]);

  const filteredData = data.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.document.toLowerCase().includes(search.toLowerCase())
  );

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const start = Math.max(0, page - delta);
    const end = Math.min(totalPages - 1, page + delta);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  };

  const getName = (list: any[], id: number | null) => {
    const found = list.find((item) => item.id === id);
    return found?.name || found?.label || "-";
  };

  return (
    <div className="w-full overflow-x-auto p-4">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Lista de Prospectos
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <button
            onClick={() => setSearch("")}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="min-w-[1000px]">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
          {/* "Dirección","Fecha Nac.", */}
            <TableRow>
              {["Nombre", "Apellido", "Teléfono", "Email", "Documento", 
                "Cargo",  "Género", "Departamento", "Municipio",
                "Comuna", "Localidad"].map((header, idx) => (
                  <TableCell key={idx} isHeader className="py-3 px-2 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                    {header}
                  </TableCell>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredData.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="py-3 px-2 text-gray-700 text-theme-sm dark:text-white/90">{p.name}</TableCell>
                <TableCell className="py-3 px-2 text-gray-700 text-theme-sm dark:text-white/90">{p.lastName}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.phone}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 max-w-[200px] text-theme-sm truncate dark:text-gray-400">{p.email}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.document}</TableCell>
                {/* <TableCell className="py-3 px-2 text-gray-500 max-w-[200px] truncate text-theme-sm dark:text-gray-400">{p.address}</TableCell> */}
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.cargo}</TableCell>
                {/* <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">
                  {p.birthDate ? new Date(p.birthDate).toISOString().split("T")[0] : "-"}
                </TableCell> */}
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.gender?.name ?? "-"}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.department?.name ?? "-"}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.municipality?.name ?? "-"}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.comune?.nameco ?? "-"}</TableCell>
                <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.localidad ?? "-"}</TableCell>
                {/* <TableCell className="py-3 px-2 text-gray-500 text-theme-sm dark:text-gray-400">{p.idEvento}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}