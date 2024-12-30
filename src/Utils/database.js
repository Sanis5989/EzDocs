import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);
  
  if(isConnected) {
    console.log('MongoDB is already connected');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'ez_docs'
    });
    
    isConnected = true;
    console.log("DB connected.");
    return isConnected;
  } catch (error) {
    console.log(error);
    return isConnected;
  }
};

export const disconnectToDB = async () => {
  mongoose.set("strictQuery", true);
  
  if(!isConnected) {
    console.log('MongoDB is already disconnected');
    return;
  }

  try {
    await mongoose.disconnect(process.env.MONGODB_URI, {
      dbName: 'ez_docs'
    });
    
    isConnected = false;
    console.log("DB disconnected.");
    return isConnected;
  } catch (error) {
    console.log(error);
    return isConnected;
  }
};