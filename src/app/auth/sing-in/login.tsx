import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;

interface LoginData {
  idNumber: string;
  password: string;
}

export default function LoginForm() {
  const [loginData, setLoginData] = useState<LoginData>({
    idNumber: "",
    password: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post(`${authUrl}/api/auth/login`, loginData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (data.token && data.roles) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("roles", JSON.stringify(data.roles));
        router.push("/admin/what-panel");
      } else {
        throw new Error("No se recibió un token o roles en la respuesta");
      }
    } catch (error: any) {
      console.error("Error en la autenticación:", error);
      setError(error.response?.data?.message || "Error de conexión con el servidor");
      localStorage.removeItem("authToken");
      localStorage.removeItem("roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 flex justify-center h-screen">
      {/* Columna Izquierda - Imagen */}
      <div
        className="hidden bg-cover lg:block lg:w-2/3"
        style={{ backgroundImage: "url(/images/FotoLogin.jpg)" }}
      >
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex items-center w-full max-w-md px-6 mx-auto lg:w-2/6">
        <div className="flex-1">
          <div className="text-center">
            <p className="mt-3 text-black dark:text-gray-300">
              Inicia sesión para acceder a tu cuenta
            </p>
          </div>

          <div className="mt-8">
            {error && <div className="text-red-500 text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Número de identificación
                </label>
                <input
                  type="text"
                  name="idNumber"
                  placeholder="Número de identificación"
                  value={loginData.idNumber}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  required
                  autoComplete="off"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={loginData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-500 rounded-md hover:bg-blue-400 focus:outline-none focus:bg-blue-400 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
