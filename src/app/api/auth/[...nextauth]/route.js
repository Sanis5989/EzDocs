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
        await connectToDB();
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
          let isValidPassword ;
          
          if(sessionUser){
            isValidPassword = await compare(credentials.password, sessionUser.password);
          }
          if (!isValidPassword) {
            console.log("Incorrect password");
            throw new Error("Invalid email or password");
            
          }
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
          throw new Error(err.message);
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
            const newUser = await User.create({
              email: profile.email,
              username: profile.name.replace(" ", "").toLowerCase(),
              image: profile.picture
            });
            
            // Add the MongoDB _id to the user object
            user.id = newUser._id.toString();  // Ensure it's in string format
          } else {
            // If user exists, get the existing user's _id
            user.id = userExists._id.toString();  // Ensure it's in string format
          }
          
        } catch (error) {
          console.log("SignIn error: ", error);
          return false;
        }
      }
  
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token._id; // MongoDB _id
        // session.user.id = token.id; // You can still keep the token id if you want
        session.user.name = token.name; // Add username
        session.user.image = token.image; // Add image
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // Store the MongoDB _id in the JWT token
        token._id = user.id; // Store MongoDB _id (already in string format)
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    }
  }
  
    
  
});

export { handler as GET, handler as POST }