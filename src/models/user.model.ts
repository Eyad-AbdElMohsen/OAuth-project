import mongoose, { Schema, Document, Model } from "mongoose"
import dotenv from 'dotenv'


dotenv.config()

const userSchema: Schema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    picture: {type: String, required: true}
})

export interface IUser extends Document { 
    name: string,
    email: string,
    picture: string
}


export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);