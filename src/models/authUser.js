import { match } from 'assert';
import { Schema, model, models } from 'mongoose';
import { type } from 'os';

const AuthUserSchema = new Schema({
    email:{
        type: String,
        unique:[true, 'Email already exists'],
        require:[true, 'Email is requires']
    },
    password: {
        type: String,
        required:[true, 'password is required'],
    },
    
});

const AuthUser = models.AuthUser || model("AuthUser", AuthUserSchema);

export default AuthUser;