import { useState } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeIcon, EyeCloseIcon } from "@/icons";
import Button from "@/components/ui/button/Button";

const ROLES = ["Admin", "Secretario", "Periodista", "Coordinador", "Pasante"];

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

const CrearUsuarioModal = ({ onClose, onSuccess }: Props) => {
  const [registerData, setRegisterData] = useState<RegisterData>({
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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const mappedData = {
        ...registerData,
        roles: [registerData.roles],
      };
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mappedData),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || data.error || "Error al registrar usuario.");
        return;
      }
      setSuccess("Usuario registrado exitosamente");
      setTimeout(() => {
        onSuccess();
        setSuccess(null);
      }, 1000);
    } catch (err) {
      setError("Error al conectar con el servidor");
    }
  };


  return (
    <>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl max-h-[90vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Registrar Usuario
            </h2>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            {success && <p className="text-sm text-green-500 mb-4">{success}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Nombre", field: "name" },
                  { label: "Apellido", field: "lastName" },
                  { label: "Fecha de nacimiento", field: "birthDate", type: "date" },
                  { label: "Identificación", field: "idNumber" },
                  { label: "Email", field: "email", type: "email" },
                  { label: "Teléfono", field: "phone" },
                  { label: "Ciudad", field: "city" },
                  { label: "Dirección", field: "address" },
                ].map(({ label, field, type }) => (
                  <div key={field}>
                    <Label>{label} *</Label>
                    <Input
                      type={type || "text"}
                      name={field}
                      value={registerData[field as keyof RegisterData]}
                      onChange={handleChange}
                      required
                    />
                  </div>
                ))}

                <div>
                  <Label>País *</Label>
                  <select
                    name="country"
                    value={registerData.country}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un país
                    </option>
                    <option value="Colombia">Colombia</option>
                  </select>
                </div>

                <div>
                  <Label>Rol *</Label>
                  <select
                    name="roles"
                    value={registerData.roles}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                  >
                    <option value="" disabled>
                      Selecciona un rol
                    </option>
                    {ROLES.map((rol) => (
                      <option key={rol} value={rol}>
                        {rol}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Label>Contraseña *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={registerData.password}
                      onChange={handleChange}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500" />
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                  Registrar
                </Button>
              </div>
            </form>
          </div>
    </>
  );
};

export default CrearUsuarioModal;