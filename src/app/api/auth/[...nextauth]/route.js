import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDB } from "../../../../Utils/database.js"
import User from "../../../../models/user.js"

const handler = NextAuth({
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  ],
  callbacks: {  

    //checking user session and returning
    async session({ session }) {
      try {
        const sessionUser = await User.findOne({
          email: session.user.email
        });
        
        if (sessionUser) {
          session.user.id = sessionUser._id.toString();
        }
        
        return session;
      } catch (error) {
        console.log("Session error: ", error);
        return session;
      }
    },
    async signIn({ profile }) {
      try {
        await connectToDB();
        
        // check if user exists
        const userExists = await User.findOne({
          email: profile.email
        });
        
        // if not, create new user
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image:profile.picture
          });
        }
        
        return true;  // Important: return true to allow sign in
      } catch (error) {
        console.log("SignIn error: ", error);
        return false;  // Return false if there was an error
      }
    }
  }
});

export { handler as GET, handler as POST }