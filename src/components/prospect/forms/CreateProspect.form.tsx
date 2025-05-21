"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";

import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/Input";
import Select from "@/components/form/Select";
import Button from "@/components/shared/ui/button/Button";
import { endPointBackend } from "@/api";

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
  const [errorMessage, setErrorMessage] = useState("");

  const selectedDepartment = watch("departmentId");
  const selectedMunicipality = watch("municipalityId");

  useEffect(() => {

    endPointBackend({ accionBD: "List-Genders" })
    .then((resp) => {
      setGenders(resp.data);
    })

    endPointBackend({ accionBD: "List-Departments" })
    .then((resp) => {
      setDepartments(resp.data);
    })
    
    endPointBackend({ accionBD: "List-Municipalities" })
    .then((resp) => {
      setMunicipalities(resp.data);
    })

    endPointBackend({ accionBD: "List-Comunness" })
    .then((resp) => {
      setCommunes(resp.data);
    })

    endPointBackend({ accionBD: "List-Caneles-Comunication" })
    .then((resp) => {
      setCanales(resp.data);
    })

    endPointBackend({ accionBD: "List-Localities" })
    .then((resp) => {
      setLocalities(resp.data);
    })

    endPointBackend({ accionBD: "List-Events" })
    .then((resp) => {
      setEvents(resp.data.active);
    })

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
    endPointBackend({ accionBD: "Create-Prospect", body: data})
    .then((resp) => {
      switch (resp.status) {
        case 'OK': {   
          setLoading(true);
          setErrorMessage("");
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
          closeModal();
          break
        }
        case 400: { 
          setErrorMessage("Ya existe una persona registrada con este número de documento.");
          setTimeout(() => setErrorMessage(""), 5000);
          break
        }
      }
      
    })
    .finally(() => {
      setLoading(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    })
  };

  return (
    <>
      {successMessage && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded mb-4">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-6 gap-6">
        <div className="col-span-3">
          <FormInput
            label="Nombre*"
            registration={register("name", { required: "Este campo es obligatorio" })}
            error={errors.name}
          />
        </div>
        <div className="col-span-3">
          <FormInput
            label="Apellido*"
            registration={register("lastName", { required: "Este campo es obligatorio" })}
            error={errors.lastName}
          />
        </div>
        <div className="col-span-3">
          <FormSelect
            name="genderId"
            label="Género*"
            control={control}
            options={genders ?? []}
            placeholder="Selecciona género"
            error={errors.genderId}
            keyReset={formResetKey}
          />
        </div>
        <div className="col-span-3">
          <FormInput
          label="Telefono*"
          registration={register("phone", { required: "Este campo es obligatorio" })}
          error={errors.phone}
        />
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
                options={departments.map((d: any) => ({ value: d.id, label: d.name }))}
                value={field.value !== null ? String(field.value) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Selecciona un municipio"
              />
            )}
          />
        </div>
        <div className="col-span-3">
          <FormInput
          label="Documento"
          registration={register("document", { required: "Este campo es obligatorio" })}
          error={errors.document}
        />
        </div>
        <div className="col-span-3">
          <FormInput
          label="Cargo"
          registration={register("cargo", { required: "Este campo es obligatorio" })}
          error={errors.cargo}
        />
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
                onChange={(e) => field.onChange(Number(e.target.value))}
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
                onChange={(e) => field.onChange(Number(e.target.value))}
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
                  options={communes.map((c: any) => ({ value: c.id, label: c.name }))}
                  value={field.value !== null ? String(field.value) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                options={localities.map((l: any) => ({ value: l.id, label: l.name }))} 
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(e) => field.onChange(e ? Number(e) : null)}
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