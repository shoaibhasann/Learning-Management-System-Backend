import dotenv from "dotenv"
import app from "./app.js";
import connectDatabase from "./config/db.js";
import cloudinary from "cloudinary";
import Razorpay from "razorpay";

// Load enviroment variables
dotenv.config();

const port = process.env.PORT || 8001;

// cloudinary configuration 
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Razorpay gateway configuration
export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET
});

// start the server
app.listen(port, async() => {
    await connectDatabase();
    console.log(`Server is running at http://localhost:${port}`);
});