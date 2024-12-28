// app/api/auth/register/route.ts
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import User from "../../../../models/user.js"
import AuthUser from "../../../../models/authUser.js"
import { connectToDB } from "../../../../Utils/database.js";

export async function POST(request) {
  //connect to db first 
  await connectToDB();

  try {
    // Properly parse the ReadableStream
    const body = await request.json();
    console.log("Parsed request body:", body);

    const { email, username, password } = body;

    // Validate all required fields
    if (!email || !username || !password) {
      return NextResponse.json(
        { 
          message: "Missing required fields",
          received: { email, username, password: password ? "[REDACTED]" : undefined }
        }, 
        { status: 400 }
      );
    }

    // Now that we know password exists, we can safely hash it
    const hashedPassword = await hash(password, 10);
   

    // Check for existing user
    const existingUser = await AuthUser.findOne({ email });
     console.log("yehaw",existingUser)
    if (existingUser) {
      console.log("user alreafy exists");
      throw {status: 409, message: "User already exsits"}
    }

    //create user in dtatabase 
    const user = await User.create({
      email,
      username
    });
    // Create the user records for authentication if doesnot exits in db
    let authUser;
    if(user) {
      authUser = await AuthUser.create({
      email: email,
      password: hashedPassword
    });
    }
    
    

    if(authUser && user){
       return NextResponse.json({
      message: "User registered successfully",
      user: {
        email,
        username
      }
    }, { status: 201 });

    }



   
  } catch (error) {
    let errMsg;
    console.error("Registration error is this :", error);
    if(error.MongoServerError){
      errMsg = error.MongoServerError;
      console.log("mong err", errMsg);
    }
 
    if(error.message){
      console.log("thh")
      console.log(error)
      return NextResponse.json(
        { 
          message: error.message,
          details: error.message
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { 
        message: error._message,
        details: error.message
      },
      { status: 500}
    );
    
  }
}