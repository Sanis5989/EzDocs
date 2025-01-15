import { match } from 'assert';
import { Schema, model, models } from 'mongoose';
import { type } from 'os';
import { string } from 'zod';

const UserSchema = new Schema({
    email:{
        type: String,
        unique:[true, 'Email already exists'],
        require:[true, 'Email is requires']
    },
    username: {
        type: String,
        required:[true, 'Username is required'],
        match: [/^(?=.{8,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/, "Username invalid, it should contain 8-20 alphanumeric letters and be unique!"]
    },
    image: {
        type: String,
      },
    fileOwned:[String],
    fileAccess:[String]
});

const User = models.User || model("User", UserSchema);

export default User;