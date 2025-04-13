"use client";

import { useState } from "react";
import PersonFormPage from "@/components/Prospectos-Listar/Prospectos";
import PersonTabla from "@/components/Prospectos-Listar/TablaProspectos";
import Button from "@/components/ui/button/Button";

export default function ProspectosPanel() {
  const [showForm, setShowForm] = useState(false);

  const toggleForm = () => {
    setShowForm((prev) => !prev);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <Button onClick={toggleForm}>
          {showForm ? "Ocultar formulario" : "Agregar prospecto"}
        </Button>
      </div>

      {showForm && <PersonFormPage />}
      <PersonTabla />
    </div>
  );
}