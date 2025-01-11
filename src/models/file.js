import mongoose, { Schema, model, models } from 'mongoose';
import { type } from 'os';

const FileSchema = new Schema({
    content: {
        type: String,
        
    },
    id: {
        type: String,
        
    },
    title:{
        type:String
    }
});

// Fix: Check if mongoose.models exists first
const File = mongoose.models.File  || model("File", FileSchema)

export default File;