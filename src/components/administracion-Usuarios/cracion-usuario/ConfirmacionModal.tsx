"use client";

import { ReactNode } from "react";
import Button from "@/components/ui/button/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
};

export default function ConfirmacionModal({  onClose, onConfirm, message }: Props) {
  
  return (
    <>
      <div className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-900 p-6 rounded-xl w-full max-w-md shadow-lg space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Confirmación</h2>
          <p className="text-gray-700 dark:text-gray-300">{message}</p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>
              Confirmar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
