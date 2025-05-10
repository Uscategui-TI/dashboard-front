"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axiosInstance";
import Button from "@/components/shared/ui/button/Button";
import EditarUsuarioModal from "./EditarUsuarioModal";
import ConfirmacionModal from "./ConfirmacionModal";
import CrearUsuarioModal from "./CrearUsuarioModal";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import { Modal } from "@/components/shared/ui/modal";


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
  active: boolean;
  idNumber: number;
};

export default function UsuariosRegistrados() {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [emailError, setEmailError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData(searchTerm);
  }, [page, size, searchTerm]);

  const fetchData = async (query = "") => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/users`, {
        params: { page, size, search: query },
      });
      setData(response.data.users ?? []);
      setTotalPages(response.data.totalPages ?? 1);
    } catch (error) {
      console.error("Error al cargar los usuarios:", error);
    }
  };

  

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
    { key: "idNumber", header: "Documento" },
    { key: "name", header: "Nombre" },
    { key: "lastName", header: "Apellido" },
    { key: "phone", header: "Teléfono" },
    { key: "email", header: "Correo" },
    { key: "address", header: "Dirección" },
    { key: "city", header: "Ciudad" },
    {
      key: "birth_date",
      header: "Nacimiento",
      render: (row: User) => new Date(row.birthDate).toLocaleDateString(),
    },
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
    {
      key: "active",
      header: "Estado",
      render: (row: User) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium 
          ${row.active ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                       : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`}>
          {row.active ? "Activo" : "Inactivo"}
        </span>
      ),
    },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Usuarios Registrados</h3>

        <div className="flex items-center gap-3 flex-wrap">
          <Button size="sm" onClick={() => setShowCreateModal(true)} className="bg-blue-500 text-white hover:bg-blue-700">
            Agregar Usuario
          </Button>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
      <GenericTable<User>
        columns={columns}
        data={data}
        searchableColumns={["name", "idNumber", "email"]}
        onSearchChange={(value) => {
          setPage(0); // vuelve a la primera página al buscar
          setSearchTerm(value); // dispara useEffect con nueva búsqueda
        }}
        actions={(row) => (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Editar</Button>
            <Button
              size="sm"
              onClick={() => handleDelete(row)}
              disabled={!row.active}
              className={`${!row.active ? "opacity-50 cursor-not-allowed" : ""}`}
              variant="outline"
            >
              Bloquear
            </Button>
          </div>
        )}
      />
      </div>

      <Pagination key={page} currentPage={page} onPageChange={setPage} totalPages={totalPages}/>

      {showModal && selectedUser && (
          <Modal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            className="max-w-[1100px] p-6 lg:p-10"
          >
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div className="mb-3">
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
                  Editar Usuario
                </h5>
                <EditarUsuarioModal
                  user={selectedUser}
                  onClose={() => setShowModal(false)}
                  onSuccess={() => {
                    fetchData();
                    setShowModal(false);
                  }}
                />
              </div>
            </div>
          </Modal>
        )}

        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          className="max-w-md p-6 lg:p-8"
        >
          <div className="flex flex-col gap-4 text-center">
            <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Confirmar Acción
            </h5>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              ¿Estás seguro que deseas bloquear al usuario <strong>{userToDelete?.name} {userToDelete?.lastName}</strong>? Esto bloqueará el usuario.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
                Bloquear
              </Button>
            </div>
          </div>
        </Modal>

      {showCreateModal && (
      <Modal
      isOpen={showCreateModal}
      onClose={() => setShowCreateModal(false)}
      className="max-w-[1100px] p-6 lg:p-10"
      >
      <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
      <div className="mb-3">
        <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">
          Registro de Usuario
        </h5>
        <CrearUsuarioModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchData();
            setShowCreateModal(false);
          }}
        />
      </div>
      </div>
      </Modal>
      )}

    </div>
  );
}
