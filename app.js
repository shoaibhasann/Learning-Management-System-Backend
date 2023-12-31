import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js"
import errorMiddleware from "./middlewares/error.middleware.js";
import PaymentRoutes from "./routes/payment.routes.js"

// Create an instance of express
const app = express();

// Middleware for Parsing request body 
app.use(express.json());

// Middleware for url decode
app.use(express.urlencoded({
    extended: true,
   
}));

// Middleware for loggers activity
app.use(morgan("dev"));

// Middleware for cross origin request
app.use(cors({
    origin: [process.env.CLIENT_URL],
    credentials: true
}));

// Middleware for parsing cookies
app.use(cookieParser());

// Handling user routes
app.use('/api/v1/user', userRoutes);

// Handling course routes
app.use('/api/v1/courses', courseRoutes);

// Handling payment routes
app.use('/api/v1/payment', PaymentRoutes);

// Default route
app.use('/backend', (req,res) => {
    res.send("Backend server is running perfectly")
});

// Handling not defined routes
app.use("*", (req,res) => {
    res.send("Oops: 404 Page Not Found!")
});

// Middleware for error handling
app.use(errorMiddleware);


export default app;