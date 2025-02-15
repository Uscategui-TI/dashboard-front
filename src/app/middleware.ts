import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token"); // Obtener el token desde las cookies
  console.log("Token recibido:", token);

  // Si no hay un token, redirige al login
  if (!token) {
    console.log("Redirigiendo a login...");
    return NextResponse.redirect(new URL("/login", req.url)); // Redirige a la página de login
  }

  // Si el token existe, permite la navegación
  console.log("Token válido, acceso permitido");
  return NextResponse.next();
}

// Aquí defines las rutas que quieres proteger
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/profile/:path*"], // Protege estas rutas
};
