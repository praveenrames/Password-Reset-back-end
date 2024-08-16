import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
  
    try {
        const connection = await mongoose.connect(process.env.mongodbContion);
        console.log("Connected to DB");

        return connection;
    } catch (error) {
      console.log(error);
    }
}

export default connectDB;