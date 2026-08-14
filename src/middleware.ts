// Protección de rutas (Middleware)
// Esta es la estructura esperada para Next.js App Router.
// En Vite/React SPA, la protección se maneja en los componentes o mediante React Router.

export function middleware(request: any) {
  // Ejemplo conceptual de cómo se vería en Next.js
  const user = request.cookies.get('user');
  
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
