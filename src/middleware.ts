import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  pages: {
    signIn: "/login", // Redirect unauthenticated users to the login page
  },
  callbacks: {
    authorized({ token, req }) {
      const isLoggedIn = !!token;
      const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard");
      const isOnLogin = req.nextUrl.pathname.startsWith("/login")
      // Redirect logic for protected routes
      if (isOnDashboard && !isLoggedIn) {
        return false; // Deny access
      }

      if(!isLoggedIn){
        return false;
      }

      console.log(" not refirected")
      return true;
    },
  },
});


export function middleware(req : any) {

  const token = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");
  console.log("Token:", token);

  const isLoggedIn = !!token;
  const isOnLoginPage = req.nextUrl.pathname === "/login";
  
  if (isOnLoginPage && isLoggedIn) {
    console.log("Redirecting logged-in user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  //redirecting non logged in user to login page
  if (!isOnLoginPage && !isLoggedIn) {
    console.log("Redirecting non logged-in user to login page");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}


export const config = {
  matcher: ["/dashboard", "/", "/file/:path*", "/login"], // Protect these routes
};
