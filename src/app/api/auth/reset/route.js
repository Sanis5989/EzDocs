import jwt from "jsonwebtoken";
import { connectToDB } from "../../../../Utils/database.js";
import User from "../../../../models/user.js";
import { NextResponse } from "next/server";

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
      return NextResponse.json({ message: "Email does not exist" }, { status: 400 });
    }

    // Generate a JWT token for the user
    const userToken = jwt.sign({ id: user._id }, process.env.RESET_TOKEN_SECRET, {
      expiresIn: "1h",
    });


    //generating url to reset password
    const url = `${process.env.BASE_URL}/reset/${user_id}`;

    // Log the token to the console
    console.log("Generated JWT Token:", userToken);
    console.log("email sent")

    // Respond with success
    return NextResponse.json({
      message: "An email has been sent to you to reset your password.",
      token: userToken, // Optional: Include the token in the response for debugging
    });
  } catch (error) {
    console.error("Error in generating JWT token:", error);
    return NextResponse.json({
      message: "Internal server error",
      error: error.message,
    }, { status: 500 });
  }
}
