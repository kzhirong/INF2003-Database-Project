import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/", // Redirect to login page if not authenticated
  },
});

export const config = {
  // Protect all routes except the login page
  matcher: [
    "/dashboard/:path*",  // Dashboard and all sub-pages
    "/news/:path*",       // News pages and news detail pages
    "/ccas/:path*",       // CCAs pages
    "/landing",           // Landing page
  ],
};
