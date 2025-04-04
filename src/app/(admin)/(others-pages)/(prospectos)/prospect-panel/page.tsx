"use client";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/Input";
import Button from "@/components/ui/button/Button";
import Select from "@/components/form/Select";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

export default function PersonFormPage() {
    const [selectedGender, setSelectedGender] = useState<{ value: string; label: string } | null>(null);
    const [selectedCountry, setSelectedCountry] = useState<{ value: string; label: string } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      await axios.post(`${authUrl}/api/person-form/submit`, data);
      setSuccessMessage("Formulario enviado exitosamente ✅");
      reset();
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };
  const watchedFields = watch();
    const isFormValid =
    watchedFields.name &&
    watchedFields.lastname &&
    watchedFields.gender &&
    watchedFields.phone &&
    watchedFields.email &&
    watchedFields.city &&
    watchedFields.country &&
    watchedFields.address;

  return (
    <>
      <PageBreadcrumb pageTitle="Formulario de Prospecto" />
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      <div className="min-h-screen rounded-2xl border flex flex-col gap-6 border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-6 gap-6">
          <div className="col-span-6 sm:col-span-3">
            <Label>Nombre</Label>
            <Input {...register("name", { required: true })} placeholder="Nombre" />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>Apellido</Label>
            <Input {...register("lastname", { required: true })} placeholder="Apellido" />
          </div>
            <div className="col-span-6 sm:col-span-3">
            <Label>Género</Label>
            <Select
                value={selectedGender?.value || ""}
                options={[
                { value: "masculino", label: "Masculino" },
                { value: "femenino", label: "Femenino" },
                { value: "otro", label: "Otro" },
                ]}
                placeholder="Selecciona género"
                onChange={(value: string) => {
                setSelectedGender({ value, label: value });
                setValue("gender", value); // <- Esto viene de useForm()
                }}
            />
            </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>Teléfono</Label>
            <Input {...register("phone", { required: true })} placeholder="Teléfono" />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>Email</Label>
            <Input type="email" {...register("email", { required: true })} placeholder="Correo electrónico" />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>Ciudad</Label>
            <Input {...register("city", { required: true })} placeholder="Ciudad" />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>País</Label>
            <Select
                value={selectedCountry?.value || ""}
                options={[
                { value: "Colombia", label: "Colombia" },
                { value: "Estados Unidos", label: "Estados Unidos" },
                { value: "México", label: "México" },
                { value: "Argentina", label: "Argentina" },
                { value: "Chile", label: "Chile" },
                ]}
                placeholder="Selecciona un país"
                onChange={(value: string) => {
                const option = { value, label: value };
                setSelectedCountry(option);
                setValue("country", value); // react-hook-form
                }}
            />
            </div>
          <div className="col-span-6 sm:col-span-3">
            <Label>Dirección</Label>
            <Input {...register("address", { required: true })} placeholder="Dirección" />
          </div>
          <div className="col-span-6">
            <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? "Enviando..." : "Enviar Formulario"}
            </Button>
            </div>
        </form>
      </div>
    </>
  );
}
