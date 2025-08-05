import { useState } from "react";
import { Modal } from "@/components/shared/ui/modal";
import Button from "@/components/shared/ui/button/Button";

type SmsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  phoneNumbers: string[];
  onSend: (message: string) => void;
};

// Solo permite letras, números, espacios y puntuación básica
const isValidMessage = (text: string) => {
  const allowedPattern = /^[a-zA-Z0-9\s.,!?¡¿()'"-]*$/;
  return allowedPattern.test(text);
};

const SmsModal = ({ isOpen, onClose, phoneNumbers, onSend }: SmsModalProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && trimmed.length <= 160 && isValidMessage(trimmed)) {
      onSend(trimmed);
      onClose();
    }
  };

  const invalidChars = !isValidMessage(message);
  const overLimit = message.length > 160;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 lg:p-10">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Enviar SMS a Prospectos</h2>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Se enviará un mensaje a <strong>{phoneNumbers.length}</strong> prospectos.
        </p>

        <textarea
          rows={5}
          placeholder="Escribe tu mensaje aquí..."
          maxLength={200} // extra protección, aunque validamos manualmente
          className="w-full rounded-md border border-gray-300 p-3 text-sm dark:bg-gray-800 dark:text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="text-sm text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>{message.length}/160 caracteres</span>
          {invalidChars && <span className="text-red-500">⚠️ Caracteres inválidos detectados</span>}
          {overLimit && <span className="text-red-500">⚠️ Superaste el límite de 160 caracteres</span>}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSend}
            disabled={invalidChars || overLimit || message.trim().length === 0}
          >
            Enviar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SmsModal;
