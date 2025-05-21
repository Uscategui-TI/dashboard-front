"use client";

import Button from "@/components/shared/ui/button/Button";
import { Modal } from ".";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string | React.ReactNode;
};

export default function ConfirmModal({ isOpen, onClose, onConfirm, message }: Props) {
  
  return (
  <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md p-6 lg:p-8"
    >
      <div className="flex flex-col gap-4 text-center">
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Confirmar Acción
        </h5>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {message}
        </p>
        <div className="flex justify-center gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>Bloquear</Button>
        </div>
      </div>
    </Modal> 
  );
}
