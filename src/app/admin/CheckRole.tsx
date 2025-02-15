'use client';
import axios from 'axios';
import { useState, useEffect } from 'react';

const CheckRole = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          localStorage.removeItem('roles'); // Limpiamos si no hay token
          return;
        }

        const response = await axios.get('http://localhost:8080/api/auth/role', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true, 
        });

        const data = response.data;
        if (data?.roles) {
          setRoles(data.roles); // Guardamos los roles en el estado
          localStorage.setItem('roles', JSON.stringify(data.roles)); // Actualizamos localStorage
        } else {
          setRoles([]); // En caso de error, limpiamos el estado
          localStorage.removeItem('roles');
        }
      } catch (error) {
        console.error('Error al obtener los roles:', error);
        setRoles([]); // Si hay error, eliminamos los roles
        localStorage.removeItem('roles');
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();

    // Monitorear cambios en el localStorage
    const handleStorageChange = () => {
      fetchRoles(); // Si alguien cambia localStorage, se vuelve a obtener desde el backend
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return <div>Loading sidebar...</div>;
  }

  return <>{children}</>;
};

export default CheckRole;
