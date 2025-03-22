"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Bar,
  ResponsiveContainer,
} from "recharts";

const authUrl = process.env.NEXT_PUBLIC_AUTH_URL;
const COLORS = ["#0088FE", "#FF6384"];

const GenderStats = () => {
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [cityData, setCityData] = useState<{ city: string; count: number }[]>([]);
  const [eventStats, setEventStats] = useState<{ eventName: string; totalMessagesSent: number }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [peopleRes, eventsRes] = await Promise.all([
          axios.get(`${authUrl}/api/person-form/list`),
          axios.get(`${authUrl}/api/message-stats/list`)
        ]);

        const persons = peopleRes.data;

        // 👉 Género
        const maleCount = persons.filter((p: any) => p.gender.toLowerCase() === "masculino").length;
        const femaleCount = persons.filter((p: any) => p.gender.toLowerCase() === "femenino").length;
        const total = maleCount + femaleCount;
        const malePercentage = ((maleCount / total) * 100).toFixed(2);
        const femalePercentage = ((femaleCount / total) * 100).toFixed(2);

        setGenderData([
          { name: `Masculino (${malePercentage}%)`, value: maleCount },
          { name: `Femenino (${femalePercentage}%)`, value: femaleCount }
        ]);

        // 👉 Ciudad
        const cityCountMap: Record<string, number> = {};
        persons.forEach((p: any) => {
          const city = p.city?.toLowerCase() || "desconocido";
          cityCountMap[city] = (cityCountMap[city] || 0) + 1;
        });

        const cityStats = Object.entries(cityCountMap).map(([city, count]) => ({
          city: city.charAt(0).toUpperCase() + city.slice(1),
          count,
        }));

        setCityData(cityStats);

        // 👉 Eventos
        setEventStats(eventsRes.data || []);
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const filteredEventStats = eventStats.filter(event =>
    event.eventName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-10 space-y-12">
      <h1 className="text-2xl font-semibold">Estadísticas de Género, Ciudad y Eventos</h1>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          {/* Gráfico de torta */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <h2 className="text-xl mb-2 text-center">Distribución por Género</h2>
            <PieChart width={400} height={300}>
              <Pie data={genderData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          {/* Gráfico de barras */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-3xl">
            <h2 className="text-xl mb-4 text-center">Cantidad de personas por ciudad</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="city" stroke="#ffffff" />
                <YAxis stroke="#ffffff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#00C49F" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de eventos */}
          <div className="bg-gray-800 p-4 rounded-lg shadow-md w-full max-w-3xl">
            <h2 className="text-xl mb-4 text-center">Mensajes por Evento</h2>

            {/* Campo de búsqueda */}
            <input
              type="text"
              placeholder="Filtrar por nombre del evento..."
              className="mb-4 w-full p-2 rounded text-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="w-full table-auto text-left text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b border-gray-600">Nombre del Evento</th>
                  <th className="px-4 py-2 border-b border-gray-600">Total de Mensajes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEventStats.length > 0 ? (
                  filteredEventStats.map((event, idx) => (
                    <tr key={idx} className="hover:bg-gray-700">
                      <td className="px-4 py-2 border-b border-gray-700">{event.eventName}</td>
                      <td className="px-4 py-2 border-b border-gray-700">{event.totalMessagesSent}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center py-4 text-gray-400">
                      No se encontraron eventos con ese nombre.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default GenderStats;