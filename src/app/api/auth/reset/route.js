import jwt from "jsonwebtoken";
import { connectToDB } from "../../../../Utils/database.js";
import User from "../../../../models/user.js";
import { NextResponse } from "next/server";
import { hash } from "bcrypt";

export async function POST(req) {
  try {
    // Connect to the database
    await connectToDB();

    // Parse the request body
    const body = await req.json();
    const { email } = body;

    // Find the user in the database
    const user = await User.findOne({ email }); // Await the result

    // Throw an error if the user does not exist
    if (!user) {
      console.log("usernot found")
      return NextResponse.json({ message: "Email does not exist" }, { status: 400 });
    }

    

    // Generate a JWT token for the user
    const userToken = await jwt.sign({ id: user._id}, process.env.RESET_TOKEN_SECRET, {
      expiresIn: "5m",
    });


    //generating url to reset password
    const url = `${process.env.NEXTAUTH_URL}/reset/${userToken}`;

    // Log the token to the console
    console.log("Generated JWT Token:", userToken);
    console.log("email sent")
    console.log("url",url)

    // Respond with success
    return NextResponse.json({
      message: "An email has been sent to you to reset your password.",
      token: userToken, // Optional: Include the token for debugging
      resetUrl: url, // Optional: Include the URL for debugging
    });
  } catch (error) {
    console.error("Error in generating JWT token:", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}

export async function PUT (req,res) {
  try {
    await connectToDB();
    const body = await req.json();
    const { token, password } = body;

    console.log("token",token)

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.RESET_TOKEN_SECRET);
    const { id: user_id } = decoded;
    const user = await User.findById(user_id);
    if (!user) {
      return NextResponse.json({ message: "Account does not exist." }, { status: 400 });
    
    }
    // const hashedPassword = await hash(password, 12);
    // await user.updateOne({
    //   password: hashedPassword,
    // });
    console.log(user);
    console.log("password changed")
    return NextResponse.json({ email: user.email, message: "Password changed." }, { status: 200 });
    // res.status(200).json({ email: user.email });
    // you should disconnect the db 
  } catch (error) {
    console.log(error.message)
    return NextResponse.json({ message: error.message }, { status: 500 });
    // res.status(500).json({ message: error.message });
  }
};
