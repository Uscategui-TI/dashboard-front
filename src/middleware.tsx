import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // Rutas públicas permitidas sin token
  const publicPaths = ["/signin", "/signup", "/reset-password", "/public", "/consulta","/actualizacion"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    
    "/((?!_next/static|_next/image|favicon.ico|api|images|fonts).*)",
  ],
};