import withAuth from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

// Pages protégées : il faut être connecté pour y accéder
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/recipes/:path*",
    "/impact/:path*",
    "/profil/:path*",
    "/discover/:path*",
  ],
};
