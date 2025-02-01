
"use client"

import React, { useEffect, useState } from 'react';

const AdminPage = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Para mostrar el "Cargando..." mientras verificas el rol

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      window.location.href = '/login'; // Redirige si no hay token
    } else {
      const roles = JSON.parse(localStorage.getItem('roles') || '[]');
      if (roles.includes('Admin')) {
        setUserRole('Admin');
      } else {
        window.location.href = '/login'; // Redirige si el rol no es Admin
      }
    }
    setLoading(false); // Una vez verificado, ya no está cargando
  }, []);

  if (loading) return <div>Cargando...</div>; // Mostrar "Cargando..." mientras se verifica el rol

  if (!userRole) return <div>No tienes acceso a esta página</div>; // Si no hay rol, muestra un mensaje

  return (
    <div>
      <h1>Bienvenido a la página de Admin</h1>
      <p>Este es el contenido exclusivo para administradores.</p>
    </div>
  );
};

export default AdminPage;
