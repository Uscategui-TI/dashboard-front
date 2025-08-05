"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/ui/modal";
import Button from "@/components/shared/ui/button/Button";
import Input from "@/components/form/input/Input";
import TextAreaValidate from "@/components/form/input/TextAreaValidate";
import Label from "@/components/form/Label";
import { ImageUpload } from "@/components/form/form-elements/ImageUpload";
import { EmailTemplate } from "@/components/campaigns/email/EmailTempleate";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  recipients: string[];
  onSend: (payload: {
    subject: string;
    htmlContent: string;
    recipients: string[];
  }) => void;
};

export default function EmailModal({ isOpen, onClose, recipients, onSend }: Props) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!subject || !message) {
      alert("Debes completar el asunto y el mensaje.");
      return;
    }

    const htmlContent = EmailTemplate({
      content: message,
      imageUrl: imageUrl || undefined,
      buttonUrl1: secondaryButtonUrl || undefined,
    });

    onSend({ subject, htmlContent, recipients });
    onClose();

    // Limpia campos después del envío
    setSubject("");
    setMessage("");
    setSecondaryButtonUrl("");
    setImageUrl(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 lg:p-10">
      <div className="flex flex-col px-4 py-5 gap-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Enviar correo a prospectos
        </h2>

        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Destinatarios:
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 break-words">
            {recipients.join(", ")}
          </p>
        </div>

        <div>
          <Label>Asunto del correo</Label>
          <Input
            type="text"
            placeholder="Asunto del correo"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div>
            <label className="text-sm font-medium text-gray-300 dark:text-gray-300">Mensaje</label>
                <textarea
                    name="message"
                    rows={6}
                    placeholder="Escribe el contenido"
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                    required
                    className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm text-amber-50 focus:ring focus:ring-blue-200"
                />
        </div>

        <div>
          <Label>URL del botón (opcional)</Label>
          <Input
            type="url"
            placeholder="https://tusitio.com/info"
            value={secondaryButtonUrl}
            onChange={(e) => setSecondaryButtonUrl(e.target.value)}
          />
        </div>

        <div>
          <Label>Imagen (opcional)</Label>
          <ImageUpload
            onChange={(value) => setImageUrl(value)}
            value={imageUrl || undefined}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>Enviar</Button>
        </div>
      </div>
    </Modal>
  );
}
