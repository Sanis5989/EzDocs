import { NextResponse } from "next/server";
import { connectToDB } from "@/Utils/database";
import jwt from "jsonwebtoken"
import User from "@/models/user";

export async function POST(req){
            const updateData = await req.json();
            const { newFile, email} = updateData;

            // // Generate a JWT token for the user
            // const userFileToken = await jwt.sign({ user_id: id , id: newFile },  process.env.NEXT_PUBLIC_FILE_TOKEN);

            try {
                //connect to db first 
                await connectToDB();
                console.log("email si thi",email)
                // Check for existing user
                const existingUser = await User.findOne({ email });
                if(!existingUser){
                    return NextResponse.json({message:"User not found; File access not created", responseBody: existingUser}, {status:400})
                }
                const id = existingUser._id;
                const updatedUser = await User.findByIdAndUpdate(id,
                    {$push: {fileAccess: newFile}},
                    {new: true});
                console.log("user updated",updatedUser)
                if(!updatedUser){
                    return NextResponse.json({message:"User not found; File not created"}, {status:400})
                }
                return NextResponse.json({message:"Added new file",addedFile:id}, {status:200})
            } catch (error) {
                console.log(error);
                return NextResponse.json({message: error}, {status:500})
            }
}

export async function GET(req) {
    try {
      await connectToDB();
  
      // Extract query parameters from the request URL
      const { searchParams } = new URL(req.url);
      const id = searchParams.get("id"); // Get 'id' from the query string

      if (!id) {
        return NextResponse.json(
          { message: "User ID is required" },
          { status: 400 }
        );
      }
  
      // Fetch only the `fileAccesslist` field for the given user
      const filesAccess = await User.findById(id, { fileAccess: 1, _id: 0 });
  
      if (!filesAccess) {
        return NextResponse.json(
          { message: "No files found for this user" },
          { status: 404 }
        );
      }
  
      // Return the fetched files
      return NextResponse.json({ message: "Files fetched successfully", filesAccess }, { status: 200 });
    } catch (error) {
      console.error("Error fetching files:", error);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  }