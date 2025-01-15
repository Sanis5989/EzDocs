import { NextResponse } from "next/server";
import { connectToDB } from "@/Utils/database";
import jwt from "jsonwebtoken"
import User from "@/models/user";

export async function POST(req){
            const updateData = await req.json();
            const { id, newFile, email} = updateData;

            // Generate a JWT token for the user
            const userFileToken = await jwt.sign({ user_id: id , id: newFile },  process.env.NEXT_PUBLIC_FILE_TOKEN);

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
                    {$push: {fileAccess: userFileToken}},
                    {new: true});
                console.log("user updated",updatedUser)
                if(!updatedUser){
                    return NextResponse.json({message:"User not found; File not created"}, {status:400})
                }
                return NextResponse.json({message:"Added new file",token:userFileToken}, {status:200})
            } catch (error) {
                console.log(error);
                return NextResponse.json({message: error}, {status:500})
            }
}