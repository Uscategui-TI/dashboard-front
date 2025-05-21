"use client";

import { useEffect, useState } from "react";
import Button from "@/components/shared/ui/button/Button";
import { GenericTable } from "@/components/shared/tables/GenericTable";
import Pagination from "@/components/shared/tables/Pagination";
import { Modal } from "@/components/shared/ui/modal";
import ConfirmModal from "@/components/shared/ui/modal/ConfirmModal";
import { useModal } from "@/hooks/useModal";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Badge from "@/components/shared/ui/badge/Badge";
import { endPointBackend } from "@/api";
import { CreateUserForm } from "../forms/CreateUser.form";
import { UpdateUserForm } from "../forms/UpdateUser.form";

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

const getEstadoVariant = ( estado: boolean ): "success" | "error" => {
  switch (estado) {
    case true:
      return "success"; 
    case false:
      return "error";
  }
};

export default function UsuariosRegistrados() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // DATA API
  const [data, setData] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // MODALS
  const createUserModal = useModal();
  const updateUserModal = useModal();
  const deleteUserModal = useModal();

  useEffect(() => {
    endPointBackend({ accionBD: "List-Users", params: { page, size, search: searchTerm } })
    .then((resp) => {
      setData(resp.data.users ?? []);
      setTotalPages(resp.data.totalPages ?? 1);
    })
  }, [page, size, searchTerm]);


  const handleEdit = (user: User) => {
    const parsedDate = user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "";
    setSelectedUser({ ...user, birthDate: parsedDate });
    updateUserModal.openModal();
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    endPointBackend({ accionBD: "Delete-User", id: selectedUser.id })
    .then((resp) => {
      setSelectedUser(null);
      deleteUserModal.closeModal()
    })
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
        return ( <Badge color="primary">{rol}</Badge> );
      },
    },
    {
      key: "active",
      header: "Estado",
      render: (row: User) => (
        <Badge color={getEstadoVariant(row.active)}> {row.active ? "Activo" : "Inactivo"}</Badge>
      ),
    },
  ];

  return (
    <>
      <PageBreadcrumb pageTitle="Listar Usarios"/>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div></div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button size="sm" onClick={createUserModal.openModal} className="bg-blue-500 text-white hover:bg-blue-700">Agregar Usuario</Button>
          </div>
        </div>

        <div className="max-w-full overflow-x-auto">
        <GenericTable<User>
          columns={columns}
          data={data}
          searchableColumns={["name", "idNumber", "email"]}
          onSearchChange={(value) => {
            setPage(0); 
            setSearchTerm(value); 
          }}
          actions={(row) => (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>Editar</Button>
              <Button
                size="sm"
                onClick={() => { setSelectedUser(row); deleteUserModal.openModal() }}
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

        {/* MODAL CREAR USUARIo */}
        <Modal isOpen={createUserModal.isOpen} onClose={createUserModal.closeModal} className="max-w-[1100px] p-6 lg:p-10">
          <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
            <div className="mb-3">
              <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">Registro de Usuario</h5>
              <CreateUserForm onClose={createUserModal.closeModal}onSuccess={createUserModal.closeModal}/>
            </div>
          </div>
        </Modal>

        {/* MODAL EDITAR USUARIO */}
        {selectedUser && (
          <Modal isOpen={updateUserModal.isOpen} onClose={updateUserModal.closeModal} className="max-w-[1100px] p-6 lg:p-10">
            <div className="flex flex-col px-2 overflow-y-auto custom-scrollbar">
              <div className="mb-3">
                <h5 className="mb-2 font-semibold text-gray-800 modal-title text-theme-xl dark:text-white/90 lg:text-2xl">Editar Usuario</h5>
                <UpdateUserForm user={selectedUser} onClose={updateUserModal.closeModal} onSuccess={updateUserModal.closeModal}/>
              </div>
            </div>
          </Modal>
        )}

        {/* MODAL CONFIRMAR INACTIVIDAD */}
        <ConfirmModal 
          isOpen={deleteUserModal.isOpen}
          message={<>¿Estás seguro que deseas bloquear al usuario <strong>{selectedUser?.name} {selectedUser?.lastName}</strong>? Esto bloqueará el usuario.</>}
          onClose={deleteUserModal.closeModal}
          onConfirm={confirmDelete}
        />

      </div>
    </>
  );
}
