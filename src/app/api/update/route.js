import { NextResponse } from "next/server";
import User from "../../../models/user";
import { connectToDB } from "@/Utils/database";
import jwt from "jsonwebtoken"

export async function POST(req){
            const updateData = await req.json();
            const { id, newFile} = updateData;

            // Generate a JWT token for the user
          const userFileToken = await jwt.sign({ user_id: id , id: newFile },  process.env.NEXT_PUBLIC_FILE_TOKEN);

            try {
                const updatedUser = await User.findByIdAndUpdate(id,
                    {$push: {fileOwned: userFileToken}},
                    {new: true});
                console.log("user updated",userFileToken)
                if(!updatedUser){
                    return NextResponse.json({message:"User not found; File not created"}, {status:400})
                }
                return NextResponse.json({message:"Added new file",token:userFileToken}, {status:200})
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
      console.log("id is" , id)
  
      if (!id) {
        return NextResponse.json(
          { message: "User ID is required" },
          { status: 400 }
        );
      }
  
      // Fetch only the `fileOwned` field for the given user
      const files = await User.findById(id, { fileOwned: 1, _id: 0 });
  
      if (!files) {
        return NextResponse.json(
          { message: "No files found for this user" },
          { status: 404 }
        );
      }
  
      // Return the fetched files
      return NextResponse.json({ message: "Files fetched successfully", files }, { status: 200 });
    } catch (error) {
      console.error("Error fetching files:", error);
      return NextResponse.json(
        { message: "Internal server error", error: error.message },
        { status: 500 }
      );
    }
  }