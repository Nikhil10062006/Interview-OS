import mongoose from "mongoose";
import {DB_NAME} from "../constants.js";
const connectDB = async () => {
    try {;
        const connection = await mongoose.connect(`${process.env.DB_URL}/${DB_NAME}`);
        console.log("Mongo DB connected Successfully");
    } catch (error) {
        console.log("MongoDB connection failed:", error.message); 
        process.exit(1);
    }
}

export default connectDB;