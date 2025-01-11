import { NextResponse } from "next/server";
import User from "../../../models/user";
import { connectToDB } from "@/Utils/database";

export async function POST(req){

    // const { pathname } = new URL(req.url);
  
    // try {
    //     switch (pathname) {

    //     case '/api/update/file-owned':
            const updateData = await req.json();
            const { id, newFile} = updateData;

            try {
                const updatedUser = await User.findByIdAndUpdate(id,
                    {$push: {fileOwned: newFile}},
                    {new: true});
                console.log("user updated",updatedUser)
                if(!updatedUser){
                    return NextResponse.json({message:"User not found; File not created"}, {status:400})
                }
                return NextResponse.json({message:"Added new file"}, {status:200})
            } catch (error) {
                console.log(error);
                return NextResponse.json({message: error}, {status:500})
            }
            
        // case '/api/users/delete':
        //     const deleteData = await req.json();
        //     return Response.json(await deleteUser(deleteData));
            
        // default:
        //     return Response.json({ error: 'Invalid endpoint' }, { status: 404 });
        // }
    // } 
    // catch (error) {
    //     return Response.json({ error: error.message }, { status: 500 });
    // }

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