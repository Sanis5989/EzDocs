import { title } from "process";
import { connectToDB, disconnectToDB } from "../../../Utils/database";
import File from "../../../models/file";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken"

export async function POST (req){
    try {
       await connectToDB();
       
       const body = await req.json();
       const { content , _id ,title } = body;
       let existingFile;

       //need to check if the file exists first
       if(_id){
        existingFile = await File.findById(_id);
       }
       

       if(existingFile){
        await existingFile.updateOne({content: content});
        console.log("file updated succes fully");
        return NextResponse.json(
                { 
                  message: "File updated"
                }, 
                { status: 200 }
              );
       }
       else{ 
        //create a file in database
        const response = await File.create({title: title});
        if(response){
            return NextResponse.json({
                  message: "New File created successfully",
                  id: response._id
                }, { status: 201 });
        }
       }

    } catch (error) {
        console.log("error while saving file",error);
        return NextResponse.json(
            { 
              message: error._message,
              details: error.message
            },
            { status: 500}
          );
    }
}

export async function GET(req) {
    try {
      await connectToDB();
  
      // Extract query parameters from the request URL
      const { searchParams } = new URL(req.url);
      const token = searchParams.get('id'); // Get 'id' from the query strin

      const decoded = await jwt.verify(token,process.env.NEXT_PUBLIC_FILE_TOKEN);
      const {id} = decoded;
  
      if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
      }
  

      console.log("received",id)
      const response = await File.findById(id); // Fetch the document by ID

  
      if (!response) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
  
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error fetching file:', error);
      await disconnectToDB();
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  