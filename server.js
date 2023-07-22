import dotenv from "dotenv"
import app from "./app.js";
import connectDatabase from "./config/db.js";
import cloudinary from "cloudinary";

// Load enviroment variables
dotenv.config();

const port = process.env.PORT || 8001;

// cloudinary configuration 
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// start the server
app.listen(port, async() => {
    await connectDatabase();
    console.log(`Server is running at http://localhost:${port}`);
});