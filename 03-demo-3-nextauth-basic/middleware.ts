export { default } from "next-auth/middleware"

// Protection des routes
// Toutes les routes matchées nécessitent une authentification
export const config = {
  matcher: [
    // Protéger toutes les routes sauf auth et api/auth
    '/((?!api/auth|signin|signup|_next/static|_next/image|favicon.ico).*)',
  ]
}

