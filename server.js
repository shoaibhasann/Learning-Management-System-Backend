import dotenv from "dotenv"
import app from "./app.js";
import connectDatabase from "./config/db.js";

// Load enviroment variables
dotenv.config();

const port = process.env.PORT || 8001;

// start the server
app.listen(port, async() => {
    await connectDatabase();
    console.log(`Server is running at http://localhost:${port}`);
});