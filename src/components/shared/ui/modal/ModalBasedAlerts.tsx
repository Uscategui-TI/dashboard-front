"use client"

import { useModal } from "@/hooks/useModal";
import ComponentCard from "@/components/common/ComponentCard";
import AlertModal from "./AlertModal";

export default function ModalBasedAlerts() {
  const successModal = useModal();
  const infoModal = useModal();
  const warningModal = useModal();
  const errorModal = useModal();

  return (
    <ComponentCard title="Modal Based Alerts">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={successModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-success-500 shadow-theme-xs hover:bg-success-600"
        >
          Success Alert
        </button>
        <button
          onClick={infoModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-blue-light-500 shadow-theme-xs hover:bg-blue-light-600"
        >
          Info Alert
        </button>
        <button
          onClick={warningModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-warning-500 shadow-theme-xs hover:bg-warning-600"
        >
          Warning Alert
        </button>
        <button
          onClick={errorModal.openModal}
          className="px-4 py-3 text-sm font-medium text-white rounded-lg bg-error-500 shadow-theme-xs hover:bg-error-600"
        >
          Danger Alert
        </button>
      </div>

      <AlertModal
        isOpen={successModal.isOpen}
        onClose={successModal.closeModal}
        title="Well Done!"
        description="Lorem ipsum dolor sit amet consectetur. Feugiat ipsum libero tempor felis risus nisi non. Quisque eu ut tempor curabitur."
        colorClass="success"// reemplaza con tu ícono SVG
      />

      <AlertModal
        isOpen={infoModal.isOpen}
        onClose={infoModal.closeModal}
        title="Heads Up!"
        description="Esto es un mensaje informativo para el usuario."
        colorClass="info"
      />

      <AlertModal
        isOpen={warningModal.isOpen}
        onClose={warningModal.closeModal}
        title="Warning!"
        description="Ten cuidado con esta acción."
        colorClass="warning"
      />

      <AlertModal
        isOpen={errorModal.isOpen}
        onClose={errorModal.closeModal}
        title="Something Went Wrong!"
        description="Ocurrió un error inesperado."
        colorClass="error"
      />
    </ComponentCard>
  );
}
