"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "@/lib/axiosInstance";

import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/Input";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

type ProspectForm = {
  name: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  document: string;
  cargo: string;
  birthDate: string;
  genderId: number | null;
  departmentId: number | null;
  municipalityId: number | null;
  communeId: number | null;
  localidad: number | null;
  idEvento: number | null;
  canalId: number | null;
};

export default function PersonFormPage({ closeModal }: any) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProspectForm>({
    defaultValues: {
      name: "",
      lastName: "",
      phone: "",
      email: "",
      address: "",
      document: "",
      cargo: "",
      birthDate: "",
      genderId: null,
      departmentId: null,
      municipalityId: null,
      communeId: null,
      localidad: null,
      idEvento: null,
      canalId: null,
    },
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [events, setEvents] = useState([]);
  const [showCommune, setShowCommune] = useState(false);
  const [showLocality, setShowLocality] = useState(false);
  const [formResetKey, setFormResetKey] = useState(0);
  const [canales, setCanales] = useState([]);

  const selectedDepartment = watch("departmentId");
  const selectedMunicipality = watch("municipalityId");

  useEffect(() => {
    const fetchData = async () => {
      const [genderRes, deptRes, muniRes, localRes, comRes, eventsRes, canalesRes] = await Promise.all([
        axios.get(`${authUrl}/gender/all`),
        axios.get(`${authUrl}/api/departments/all`),
        axios.get(`${authUrl}/api/municipalities/all`),
        axios.get(`${authUrl}/api/localities/all`),
        axios.get(`${authUrl}/api/communes/all`),
        axios.get(`${authUrl}/api/messages/events`),
        axios.get(`${authUrl}/canales/all`),
      ]);

      setGenders(genderRes.data);
      setDepartments(deptRes.data);
      setMunicipalities(muniRes.data);
      setLocalities(localRes.data);
      setCommunes(comRes.data);
      setEvents(eventsRes.data);
      setCanales(canalesRes.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const filtered = municipalities.filter(
        (m) => m.department.id === selectedDepartment
      );
      setFilteredMunicipalities(filtered);
    }
  }, [selectedDepartment, municipalities]);

  useEffect(() => {
    const selected = municipalities.find((m) => m.id === selectedMunicipality);
    if (selected) {
      if (selected.name.toLowerCase() === "bogotá") {
        setShowCommune(false);
        setShowLocality(true);
      } else {
        setShowCommune(true);
        setShowLocality(false);
      }
    } else {
      setShowCommune(false);
      setShowLocality(false);
    }
  }, [selectedMunicipality, municipalities]);

  const onSubmit = async (data: ProspectForm) => {
    console.log("📦 Datos enviados:", data);
    try {
      setLoading(true);
      await axios.post(`${authUrl}/api/person-form/submit`, data);
      setSuccessMessage("Formulario enviado exitosamente ✅");

      reset({
        name: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        document: "",
        cargo: "",
        birthDate: "",
        genderId: null,
        departmentId: null,
        municipalityId: null,
        communeId: null,
        localidad: null,
        idEvento: null,
        canalId: null,
      });
      setFormResetKey(prev => prev + 1);
      setFilteredMunicipalities([]);
      setShowCommune(false);
      setShowLocality(false);
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      closeModal()
    }
  };

  return (
    <>
      {successMessage && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-6 gap-6">
        <div className="col-span-3">
          <Label>Nombre</Label>
          <Input {...register("name", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Apellido</Label>
          <Input {...register("lastName", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Género</Label>
          <Controller
            name="genderId"
            control={control}
            render={({ field }) => (
              <Select
                key={formResetKey}
                options={genders}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string) => field.onChange(Number(val))}
                placeholder="Selecciona género"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Label>Teléfono</Label>
          <Input {...register("phone", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Email</Label>
          <Input type="email" {...register("email", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Dirección</Label>
          <Input {...register("address", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Departamento</Label>
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
                key={formResetKey}
                options={departments.map((d: any) => ({ value: d.value, label: d.label }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string) => field.onChange(Number(val))}
                placeholder="Selecciona un departamento"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Label>Municipio</Label>
          <Controller
            name="municipalityId"
            control={control}
            render={({ field }) => (
              <Select
                key={formResetKey}
                options={filteredMunicipalities.map((m: any) => ({ value: m.id, label: m.name }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string) => field.onChange(Number(val))}
                placeholder="Selecciona un municipio"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Label>Documento</Label>
          <Input {...register("document", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Cargo</Label>
          <Input {...register("cargo", { required: true })} />
        </div>
        <div className="col-span-3">
          <Label>Evento</Label>
          <Controller
            name="idEvento"
            control={control}
            render={({ field }) => (
              <Select
                key={formResetKey}
                options={events.map((e: any) => ({ value: e.id, label: e.eventName }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string) => field.onChange(Number(val))}
                placeholder="Selecciona un evento"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Label>Canal</Label>
          <Controller
            name="canalId"
            control={control}
            render={({ field }) => (
              <Select
                key={formResetKey}
                options={canales.map((c: any) => ({ value: c.id, label: c.nombre }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string) => field.onChange(Number(val))}
                placeholder="Selecciona un canal"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <Label>Fecha de Nacimiento</Label>
          <Input
            type="date"
            {...register("birthDate", {
              required: true,
              validate: (value) => {
                const year = new Date(value).getFullYear();
                return year > 1900 && year < 2100 || "Año inválido";
              }
            })}
/>
        </div>
        {showCommune && (
          <div className="col-span-3">
            <Label>Comuna</Label>
            <Controller
              name="communeId"
              control={control}
              render={({ field }) => (
                <Select
                  key={formResetKey}
                  options={communes.map((c: any) => ({ value: c.id, label: c.nameco }))}
                  value={field.value !== null ? String(field.value) : undefined}
                  onChange={(val: string) => field.onChange(Number(val))}
                  placeholder="Selecciona una comuna"
                />
              )}
            />
          </div>
        )}
        {showLocality && (
          <div className="col-span-3">
            <Label>Localidad</Label>
            <Controller
              name="localidad"
              control={control}
              render={({ field }) => (
                <Select
                key={formResetKey}
                options={localities.map((l: any) => ({ value: l.id, label: l.name }))} // ✅ ahora value es el ID
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val: string | null) => field.onChange(val ? Number(val) : null)}
                placeholder="Selecciona una localidad"
              />
              )}
            />
          </div>
        )}
        <div className="col-span-6">
          <Button type="submit" disabled={loading}>
            {loading ? "Enviando..." : "Enviar Formulario"}
          </Button>
        </div>
      </form>
    </>
  );
}