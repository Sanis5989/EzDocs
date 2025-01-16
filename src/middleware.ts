import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from 'jose';

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


export async function middleware(req : any) {

  // Convert secret to Uint8Array for jose
  const secret = new TextEncoder().encode(
    process.env.NEXT_PUBLIC_FILE_TOKEN
  );

  const token = req.cookies.get("next-auth.session-token") || req.cookies.get("__Secure-next-auth.session-token");

  const isLoggedIn = !!token;
  const isOnLoginPage = req.nextUrl.pathname === "/login" ;

  const isOnRegisterPage = req.nextUrl.pathname === "/Signup";
  const isOnFilePage =  req.nextUrl.pathname.includes("/file");
  const tokenURL =req.nextUrl.pathname.split("/file/")[1];
  

  //redirecting if signed in user tries to got login or rgister page
  if (isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
    console.log("Redirecting logged-in user to dashboard");
    return NextResponse.redirect(new URL("/", req.url));
  } 
  
  // Allow unauthenticated access to login and signup pages
  if (!isLoggedIn && (isOnLoginPage || isOnRegisterPage)) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users trying to access protected pages to the login page
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  //checking file access privelages before access
  // if(isOnFilePage){
  //     console.log("this is file page")

  //     const {payload}=  await jwtVerify(tokenURL, secret);

  //     const response = await fetch(`${process.env.NEXTAUTH_URL_INTERNAL}/api/update?id=${payload.user_id}`,{
  //         method:"GET",
  //     })
  //     const data = await response.json();
  //     const files = data.files.fileOwned;

  //     if(files?.includes(tokenURL)){
  //       console.log("rejected")
  //       return NextResponse.redirect(new URL("/dashboard",process.env.NEXT_PUBLIC_APP_URL))
  //     }
  //     console.log("result arr fetched",files)
  // }

  console.log("Allowing request to proceed");
  return NextResponse.next();
}


export const config = {
  matcher: ["/dashboard", "/", "/file/:path*", "/login", "/Signup" ], // Protect these routes
};
