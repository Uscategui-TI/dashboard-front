import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");

  // Permitir acceso libre a estas rutas
  const publicPaths = ["/signin", "/signup", "/api", "/_next", "/favicon.ico"];
  const isPublic = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};