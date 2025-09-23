"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "@/lib/axiosInstance";
import { endPointBackend } from "@/api";
import FormInput from "@/components/form/FormInput";
import FormSelect from "@/components/form/FormSelect";
import FormSelectNumber from "@/components/form/FormSelectNumber";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/Input";
import Button from "@/components/shared/ui/button/Button";
import { FieldError } from "react-hook-form";
import Select from "@/components/form/Select";

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
  comuneId: number | null;
  localidad: number | null;
  idEvento: number | null;
  canalId: number | null;
  messageEvent?: number | null;
};

const transformProspect = (p: any): ProspectForm => ({
  name: p.name,
  lastName: p.lastName,
  phone: p.phone,
  email: p.email,
  address: p.address,
  document: p.document,
  cargo: p.cargo,
  birthDate: p.birthDate,
  genderId: p.gender?.id ?? null,
  departmentId: p.department?.id ?? null,
  municipalityId: p.municipality?.id ?? null,
  comuneId: p.comune?.id ?? null,
  localidad: p.locality?.id ?? null,
  idEvento: p.idEvento ?? null,
  canalId: p.canal?.id ?? null,
});

export default function EditProspectForm({
  prospect,
  onClose,
  onUpdate,
}: {
  prospect: any;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const transformedProspect = transformProspect(prospect);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<ProspectForm>({
    defaultValues: transformedProspect,
  });

  const [genders, setGenders] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [filteredMunicipalities, setFilteredMunicipalities] = useState<any[]>([]);
  const [communes, setCommunes] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [events, setEvents] = useState([]);
  const [canales, setCanales] = useState([]);
  const [showCommune, setShowCommune] = useState(false);
  const [showLocality, setShowLocality] = useState(false);

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

  }, [prospect, reset]);

  useEffect(() => {
    const departmentId = selectedDepartment ?? transformedProspect.departmentId;

    if (municipalities.length > 0 && departmentId) {
      const filtered = municipalities.filter(
        (m) => m.department?.id === departmentId
      );
      setFilteredMunicipalities(filtered);
    }
  }, [selectedDepartment, municipalities, transformedProspect.departmentId]);

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

  const onSubmit = async (formData: ProspectForm) => {
    // Construimos los campos modificados comparando con el prospecto original
    const modifiedFields = Object.entries(formData).reduce((acc, [key, value]) => {
      const typedKey = key as keyof ProspectForm;
      const originalValue = transformedProspect[typedKey];

      // Solo agregamos si hay un cambio
      if (
        value !== null &&
        value !== "" &&
        (originalValue === null || String(value) !== String(originalValue))
      ) {
        (acc as any)[typedKey] = value;
      }
      return acc;
    }, {} as Partial<ProspectForm>);

    // Siempre aseguramos mapear idEvento a messageEvent para el backend
    if (formData.idEvento !== undefined) {
      modifiedFields.messageEvent = formData.idEvento;
      delete modifiedFields.idEvento; // opcional, ya no se necesita
    }

    if (Object.keys(modifiedFields).length === 0) {
      console.log("⛔ Nada fue modificado.");
      return;
    }

    try {
      await axios.put(
        `${authUrl}/api/v1.0/prospects/update/${prospect.document}`,
        modifiedFields
      );
      console.log("✅ Prospecto actualizado correctamente");
      onUpdate();
      onClose();
    } catch (error) {
      console.error("❌ Error actualizando prospecto:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-6 gap-6">
      <div className="col-span-3">
        <FormInput label="Nombre" registration={register("name")} error={errors.name as FieldError} />
      </div>
      <div className="col-span-3">
        <FormInput label="Apellido" registration={register("lastName")} error={errors.lastName as FieldError} />
      </div>
      <div className="col-span-3">
        <FormSelectNumber
          name="genderId"
          label="Género*"
          control={control}
          options={genders}
          placeholder="Selecciona género"
          error={errors.genderId}
        />
      </div>
      <div className="col-span-3">
        <FormInput label="Teléfono" registration={register("phone")} error={errors.phone as FieldError} />
      </div>
      <div className="col-span-3">
        <Label>Email</Label>
        <Input type="email" {...register("email")} />
      </div>
      <div className="col-span-3">
        <Label>Dirección</Label>
        <Input {...register("address")} />
      </div>
      <div className="col-span-3">
        <Label>Departamento</Label>
        <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <Select
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
                options={filteredMunicipalities.map((m: any) => ({ value: m.id, label: m.name }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(e) => field.onChange(Number(e.target.value))}
                placeholder="Selecciona un municipio"
              />
          )}
        />
      </div>
      <div className="col-span-3">
        <FormInput label="Cargo" registration={register("cargo")} error={errors.cargo as FieldError} />
      </div>
      <div className="col-span-3">
        <Label>Evento</Label>
        <Controller
            name="idEvento"
            control={control}
            render={({ field }) => (
              <Select
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
                  options={canales.map((c: any) => ({ value: c.id, label: c.nombre }))}
                  value={field.value !== null ? String(field.value) : undefined}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="Selecciona un canal"
                />
              )}
            />
      </div>
      <div className="col-span-3">
        <Label>Fecha de nacimiento</Label>
        <Input type="date" {...register("birthDate")} />
      </div>
      {showCommune && (
        <div className="col-span-3">
          <Label>Comuna</Label>
          <Controller
            name="comuneId"
            control={control}
            render={({ field }) => (
              <Select
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
                options={localities.map((l: any) => ({ value: l.id, label: l.name }))}
                value={field.value !== null ? String(field.value) : undefined}
                onChange={(val) => field.onChange(val ? Number(val) : null)}
                placeholder="Selecciona una localidad"
              />
            )}
          />
        </div>
      )}
      <div className="col-span-6 flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit">Actualizar</Button>
      </div>
    </form>
  );
}
