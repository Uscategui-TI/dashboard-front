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
    <div className="h-screen flex">
      
        {/* Columna Izquierda - Formulario */}
        <div className="w-1/2 flex items-center justify-center bg-blue-600 p-10">
          <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-300">
            <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Iniciar sesión</h2>

            {error && <div className="text-red-500 text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="idNumber"
                placeholder="Número de identificación"
                value={loginData.idNumber}
                onChange={handleChange}
                className="w-full p-3 border border-black rounded-lg focus:ring-2 focus:ring-blue-400 text-black text-center"
                required
                autoComplete="off"
              />
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={loginData.password}
                onChange={handleChange}
                className="w-full p-3 border border-black rounded-lg focus:ring-2 focus:ring-blue-400 text-black text-center"
                required
              />
              <button
                type="submit"
                className="w-full p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Cargando..." : "Iniciar sesión"}
              </button>
            </form>
          </div>
        </div>
      {/* Columna Derecha - Imagen */}
      <div className="w-1/2 h-screen bg-white flex">
      <img
        src="/images/ImgLogin.jpg" // Ruta de tu imagen
        alt="Login"
        className="w-full h-full object-cover"
      />
    </div>
      
    </div>
  );
}