import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeIcon, EyeCloseIcon, CalenderIcon } from "@/icons";
import Button from "@/components/shared/ui/button/Button";
import { endPointBackend } from "@/api";
import Select from "@/components/form/Select";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import { COUNTRIES, ROLES } from "@/util";

const INPUT_FIELDS = [
  { label: "Nombre", name: "name" },
  { label: "Apellido", name: "lastName" },
  { label: "Identificación", name: "idNumber" },
  { label: "Email", name: "email", type: "email" },
  { label: "Teléfono", name: "phone" },
  { label: "Ciudad", name: "city" },
  { label: "Dirección", name: "address" },
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  lastName: string;
  birthDate: string;
  idNumber: string;
  roles: string;
  address: string;
  city: string;
  country: string;
  phone: string;
}

export const CreateUserForm = ({ onClose, onSuccess }: Props) => {
  const [form, setForm] = useState<RegisterData>({
    email: "",
    password: "",
    name: "",
    lastName: "",
    birthDate: "",
    idNumber: "",
    roles: "",
    address: "",
    city: "",
    country: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (selectedDates: Date[]) => {
    const date = selectedDates[0];
    if (date) {
      setForm((prev) => ({
        ...prev,
        birthDate: date.toISOString().split("T")[0],
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    endPointBackend({ accionBD: "Create-User", body: { ...form, roles: [form.roles] } })
    .then((resp) => {
        setMessage({ text: "Usuario registrado exitosamente", type: "success" });
        setTimeout(() => {
          onSuccess();
          setMessage(null);
        }, 1000);
    })
    .catch((error) => {
      const errorMsg = error?.response?.data?.error || error?.message || "Error al registrar usuario";
      setMessage({ text: errorMsg, type: "error" });
    });
    // setMessage({ text: "Error al registrar usuario", type: "error" });
    
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto shadow-lg">
      {message && (
        <p className={`text-sm mb-4 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {message.text}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INPUT_FIELDS.map(({ label, name }) => (
            <div key={name}>
              <Label>{label} *</Label>
              <Input
                name={name}
                type={"text"}
                placeholder={`Digite ${label}`}
                value={form[name as keyof RegisterData]}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div>
            <Label>Fecha de nacimiento</Label>
            <div className="relative">
              <Flatpickr
                value={form.birthDate}
                onChange={handleDateChange}
                options={{ dateFormat: "Y-m-d" }}
                placeholder="Selecciona una fecha"
                className="w-full py-2 pl-3 pr-10 text-sm border border-gray-300 rounded-md h-11 focus:ring-2 focus:ring-blue-500  dark:border-gray-700 dark:text-white"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                <CalenderIcon />
              </span>
            </div>
          </div>

          <div>
            <Label>País *</Label>
            <Select name="country" options={COUNTRIES} value={form.country} onChange={handleChange} />
          </div>

          <div>
            <Label>Rol *</Label>
            <Select name="roles" options={ROLES} value={form.roles} onChange={handleChange} />
          </div>

          <div className="sm:col-span-2">
            <Label>Contraseña *</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <span onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer">
                {showPassword ? <EyeIcon className="fill-gray-500" /> : <EyeCloseIcon className="fill-gray-500" />}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
          <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">Registrar</Button>
        </div>
      </form>
    </div>
  );
};
