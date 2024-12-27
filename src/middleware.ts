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

  const isLoggedIn = !!token;
  const isOnLoginPage = req.nextUrl.pathname === "/login" ;

  const isOnRegisterPage = req.nextUrl.pathname === "/Signup";
  
  if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
    console.log("Redirecting logged-in user to dashboard");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  } 
  
  // Allow unauthenticated access to login and signup pages
  if (!isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected pages to the login page
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}


export const config = {
  matcher: ["/dashboard", "/", "/file/:path*", "/login", "/Signup" ], // Protect these routes
};
