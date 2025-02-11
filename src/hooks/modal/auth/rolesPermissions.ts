export const rolePermissions: { [role: string]: string[] } = {
    Admin: ["Dashboard", "Campañas", "Bot", "Prospectos", "Publicaciones", "Multimedia", "Usuarios", "Configuraciones", "Centro de ayuda"],
    Secretario: ["Dashboard", "Campañas", "Prospectos", "Usuarios"],
    Periodista: ["Dashboard", "Campañas", "Publicaciones", "Multimedia"],
    Coordinador: ["Dashboard", "Campañas", "Bot", "Prospectos", "Usuarios"],
    Pasante: ["Dashboard", "Publicaciones", "Multimedia"],
};
