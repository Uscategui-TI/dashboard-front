// components/shared/ui/modal/SuccessModal.tsx
import { Icons } from "@/util";
import { Modal } from "./";
import { useEffect } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  autoCloseTime?: number;
}

export default function SuccessModal({
  isOpen,
  onClose,
  title = "¡Éxito!",
  description = "La operación se completó exitosamente.",
  buttonText = "Cerrar",
  autoCloseTime = 3000,
}: Readonly<SuccessModalProps>) {
  useEffect(() => {
    if (!isOpen || !autoCloseTime) return;

    const timer = setTimeout(() => {
      onClose();
    }, autoCloseTime);

    return () => clearTimeout(timer);
  }, [isOpen, autoCloseTime, onClose]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5 lg:p-10">
      <div className="text-center">
        <div className="relative flex items-center justify-center z-1 mb-7">
          {Icons.SUCCESS_BACK}
          <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">{Icons.SUCCESS}</span>
        </div>
        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
        <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
        <div className="flex items-center justify-center w-full gap-3 mt-7">
          <button
            type="button"
            onClick={onClose}
            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg bg-green-500 shadow-theme-xs hover:bg-green-600 sm:w-auto"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
