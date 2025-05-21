// components/common/AlertModal.tsx
import { Icons } from "@/util";
import { Modal } from "./";
import { ReactNode, useEffect } from "react";

type AlertVariant = "success" | "info" | "warning" | "error";

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    icon?: ReactNode;
    title: string;
    description: string;
    buttonText?: string;
    colorClass: AlertVariant;
    time?: number;
}

const colorMap = {
    success: {
        bg: "bg-green-500",
        hover: "hover:bg-green-600",
        fill: "fill-green-50 dark:fill-green-500/15",
        icon: Icons.SUCCESS,
        backIcon: Icons.SUCCESS_BACK
    },
    info: {
        bg: "bg-blue-500",
        hover: "hover:bg-blue-600",
        fill: "fill-blue-50 dark:fill-blue-500/15",
        icon: Icons.INFO,
        backIcon: Icons.INFO_BACK

    },
    warning: {
        bg: "bg-yellow-500",
        hover: "hover:bg-yellow-600",
        fill: "fill-yellow-50 dark:fill-yellow-500/15",
        icon: Icons.WARNING,
        backIcon: Icons.WARNING_BACK

    },
    error: {
        bg: "bg-red-500",
        hover: "hover:bg-red-600",
        fill: "fill-red-50 dark:fill-red-500/15",
        icon: Icons.DANGER,
        backIcon: Icons.DANGER_BACK
    },
};

export default function AlertModal({
    isOpen,
    onClose,
    title,
    description,
    buttonText = "Cerrar",
    colorClass,
    time
}: Readonly<AlertModalProps>) {

const colors = colorMap[colorClass];

useEffect(() => {
    if (!isOpen || !time) return;

    const timer = setTimeout(() => {
        onClose();
    }, time);

    return () => clearTimeout(timer);
}, [isOpen, time, onClose]);


return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-5 lg:p-10">
        <div className="text-center">
            <div className="relative flex items-center justify-center z-1 mb-7">
                {colors.backIcon}
                <span className="absolute -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2">{colors.icon}</span>
            </div>
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">{title}</h4>
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">{description}</p>
            <div className="flex items-center justify-center w-full gap-3 mt-7">
                <button
                    type="button"
                    onClick={onClose}
                    className={`flex justify-center w-full px-4 py-3 text-sm font-medium text-white rounded-lg ${colors.bg} shadow-theme-xs ${colors.hover} sm:w-auto`}
                >
                    {buttonText}
                </button>
            </div>
        </div>
    </Modal>
);
}
