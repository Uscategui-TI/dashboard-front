"use client"

import { useState } from "react";
import { createForm } from "@/api/services/formService";
import { useRouter } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/shared/ui/button/Button";

export default function CreateFormPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const form = await createForm({ title, description });
        router.push(`/formularios`);
    };

return (
    <>
        <PageBreadcrumb pageTitle="Formularios"/>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">
                Crear Formulario
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
                    placeholder="Título" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)} 
                />
                <textarea 
                    rows={6}
                    className="shadow-sm border bg-gray-50 dark:border-gray-700 dark:bg-gray-900 border-gray-300 text-gray-900 sm:text-sm rounded-lg block w-full p-2.5 dark:text-white"
                    placeholder="Descripción" 
                    value={description} onChange={(e) => setDescription(e.target.value)} 
                />
                <div className="flex justify-end">
                    <Button type="submit" size="md">Crear</Button>
                </div>
            </form>
        </div>
    </>
    );
}
