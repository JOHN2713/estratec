import { NextResponse, type NextRequest } from "next/server";

const COOKIE = process.env.NODE_ENV === "production" ? "__Host-estratec_session" : "estratec_session";
const PUBLIC_ADMIN = ["/admin/login", "/admin/recuperar", "/admin/restablecer"];

/**
 * Primera barrera: sin cookie de sesión no se entra al panel. La validación real de la sesión
 * y de los permisos se hace en el servidor en cada página y cada acción (denegación por defecto).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (!req.cookies.get(COOKIE)?.value) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/admin", "/admin/:path*"] };
