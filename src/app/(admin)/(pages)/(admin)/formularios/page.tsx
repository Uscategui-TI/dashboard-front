"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useNavigation } from "@/util";
import Button from "@/components/shared/ui/button/Button";

type Form = {
    id: number;
    title: string;
    description: string;
    slug: string;
};

export default function FormulariosPage() {

    const { redirectTo } = useNavigation();
    
    const [formularios, setFormularios] = useState<Form[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchForms = async () => {
        try {
            const response = await fetch("https://dashboardqa.uscateguicol.com/api/forms/all");
            if (!response.ok) throw new Error("Error al obtener formularios");
            const data = await response.json();
            setFormularios(data);
        } catch (err: any) {
            setError(err.message || "Error desconocido");
        } finally {
            setLoading(false);
        }
        };

        fetchForms();
    }, []);

    return (
        <div className="p-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">Selecciona un formulario</h1>
            <Button onClick={() => redirectTo(`/formularios/create`)}>Crear Formulario</Button>
        </div>

        {loading && <p className="text-gray-600">Cargando formularios...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}


        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-9">
            {formularios.map((form) => (
            <div
                key={form.id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition"
            >
                <h2 className="text-xl font-semibold mb-2">{form.title}</h2>
                <p className="text-gray-600 mb-4">{form.description}</p>
                <div className="flex gap-2">
                    <Button
                        onClick={() => redirectTo(`/formularios/${form.slug}/create`)}
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Editar
                    </Button>
                    <Button
                        onClick={() => redirectTo(`/formularios/${form.slug}/results`)}
                        className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
                    >
                        Estadisticas
                    </Button>
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}
