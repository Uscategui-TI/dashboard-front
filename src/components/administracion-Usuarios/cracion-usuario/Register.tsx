"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import GenericTable from "@/components/tables/GenericTable";
import Button from "@/components/ui/button/Button";
import EditarUsuarioModal from "./EditarUsuarioModal";
import ConfirmacionModal from "./ConfirmacionModal";
import CrearUsuarioModal from "./CrearUsuarioModal";

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

export default function UsuariosRegistrados() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, size]);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/users`, {
        params: { page, size },
      });
      setData((response.data.users ?? []));
      setTotalPages(response.data.totalPages ?? 1);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    }
  };

  const filteredData = data.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.lastName.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (user: User) => {
    const parsedDate = user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "";
    setSelectedUser({ ...user, birthDate: parsedDate });
    setEmailError("");
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/${userToDelete.id}`);
      setUserToDelete(null);
      setShowConfirmModal(false);
      fetchData();
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const columns = [
    { key: "name", header: "Nombre" },
    { key: "lastName", header: "Apellido" },
    { key: "email", header: "Correo" },
    {
      key: "birth_date",
      header: "Nacimiento",
      render: (row: User) => new Date(row.birthDate).toLocaleDateString(),
    },
    { key: "phone", header: "Teléfono" },
    { key: "address", header: "Dirección" },
    { key: "city", header: "Ciudad" },
    { key: "idNumber", header: "Documento" },
    { key: "active", header: "Estado" },
    {
      key: "roles",
      header: "Rol",
      render: (row: User) => {
        const rol = row.roles?.[0] ?? "Sin rol";
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {rol}
          </span>
        );
      },
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Usuarios Registrados</h3>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nombre, apellido o correo"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
          />
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white hover:bg-blue-700">
            Agregar Usuario
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <GenericTable<User>
          columns={columns}
          data={filteredData}
          actions={(row) => (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => handleEdit(row)}>Editar</Button>
              <Button size="sm" onClick={() => handleDelete(row)}>bloquear</Button>
            </div>
          )}
        />
      </div>

      <div className="flex justify-center mt-4 gap-2 flex-wrap">
        <button onClick={() => setPage(0)} disabled={page === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&laquo;</button>
        <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&lt;</button>

        {Array.from({ length: totalPages }).map((_, index) => (
          <button key={index} onClick={() => setPage(index)}
            className={`px-3 py-1 border rounded text-sm ${page === index ? "bg-blue-500 text-white" : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-200"}`}>
            {index + 1}
          </button>
        ))}

        <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={page === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&gt;</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}
          className="px-3 py-1 border rounded text-sm bg-white text-gray-700 disabled:opacity-50 dark:bg-gray-700 dark:text-white">&raquo;</button>
      </div>

      {showModal && selectedUser && (
        <EditarUsuarioModal
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            fetchData();
            setShowModal(false);
          }}
        />
      )}

      <ConfirmacionModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        message={`¿Estás seguro que deseas bloquear al usuario "${userToDelete?.name} ${userToDelete?.lastName}"? Esto bloqueara el usuario.`}
      />

      {showCreateModal && (
        <CrearUsuarioModal
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        onSuccess={() => {
          fetchData();
          setShowCreateModal(false); 
        }}
      />
      )}
    </div>
  );
}
