import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // Rutas públicas permitidas sin token
  const publicPaths = ["/signin", "/signup", "/reset-password", "/public"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  // Si no hay token y la ruta no es pública, redirigir al login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
      Aplica el middleware a todas las rutas excepto recursos estáticos y API.
      Esto cubre páginas protegidas como /dashboard, /what-panel, etc.
    */
    "/((?!_next/static|_next/image|favicon.ico|api|images|fonts).*)",
  ],
};