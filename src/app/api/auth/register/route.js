// app/api/auth/register/route.ts
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import User from "../../../../models/user.js"
import AuthUser from "../../../../models/authUser.js"

export async function POST(request) {
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
      
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Create the user records
    const user = await User.create({
      email,
      username
    });

    const authUser = await AuthUser.create({
      email: email,
      password: hashedPassword
    });

    return NextResponse.json({
      message: "User registered successfully",
      user: {
        email,
        username
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        message: "Internal server error",
        details: error.message
      },
      { status: 500 }
    );
  }
}