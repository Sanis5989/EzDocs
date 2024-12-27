import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDB } from "../../../../Utils/database.js"
import User from "../../../../models/user.js"
import CredentialsProvider from "next-auth/providers/credentials";
import AuthUser from "../../../../models/authUser.js"
import {compare} from "bcrypt"

const handler = NextAuth({
  session:{
    strategy:"jwt"
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. 'Sign in with...')
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
       let realSessionUser= ""
        console.log(credentials)
        try {
          const sessionUser = await AuthUser.findOne({
            email: credentials.email
          });
          if(sessionUser){
            realSessionUser = await User.findOne({
              email: credentials.email
            });
          }
          console.log("session",sessionUser)
          const isValidPassword = await compare(credentials.password, sessionUser.password);
          console.log(isValidPassword)
          if (realSessionUser &&  isValidPassword) {
            return {
              id: realSessionUser._id.toString(),
              email: realSessionUser.email,
              name: realSessionUser.username,
              image: realSessionUser.image
            };
          }
        }
        catch(err){
          console.log("error with email regi", err);
        }

        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          await connectToDB();
          
          const userExists = await User.findOne({ email: profile.email });
          
          if (!userExists) {
            await User.create({
              email: profile.email,
              username: profile.name.replace(" ", "").toLowerCase(),
              image: profile.picture
            });
          }
          return true;
        } catch (error) {
          console.log("SignIn error: ", error);
          return false;
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id; // Add user ID
        session.user.name = token.name; // Add username
        session.user.image = token.image; // Add image
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id; // Include user ID
        token.email = user.email; // Include email
        token.name = user.name; // Include username
        token.image = user.image; // Include image
      }
      return token;
    }
    
  }
});

export { handler as GET, handler as POST }