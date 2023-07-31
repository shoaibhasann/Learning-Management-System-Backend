import subscriptions from "razorpay/dist/types/subscriptions.js";
import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async (req,res,next) => {
    const { token } = req.cookies;

    if(!token){
        return next(new AppError(400,'Unauthenticaed, please log in again'));
    }

    const userDetails = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = userDetails;

    next();
}

// Middleware to check user or admin 
const authorizedRoles = (...roles) => async (req,res,next) => {

    const currentUserRole = req.user.role;
    
    if(!roles.includes(currentUserRole)){
        return next(
            new AppError(403, 'You do not have permission to acess this route.')
        ) 
    };

    next();
}

// Middleware to check user subscribed or not
const authorizeSubscriber = async(req,res,next) => {
    const subscription = req.user.subscription;
    const currentUserRole = req.user.role;

    if(currentUserRole === 'Admin' && subscription.status !== 'active'){
        return next(new AppError(403, 'Please subscribe to saw the lecture details.'))
    }

    next();
}

export{
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}