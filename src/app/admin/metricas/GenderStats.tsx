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

const COLORS = ["#0088FE", "#FF6384"]; // Azul y rojo para el gráfico de torta

const GenderStats = () => {
  const [genderData, setGenderData] = useState<{ name: string; value: number }[]>([]);
  const [cityData, setCityData] = useState<{ city: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${authUrl}/api/person-form/list`);
        const persons = response.data;

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
      } catch (error) {
        console.error("Error obteniendo datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4 py-10 space-y-12">
      <h1 className="text-2xl font-semibold">Estadísticas de Género y Ciudad</h1>

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
        </>
      )}
    </div>
  );
};

export default GenderStats;