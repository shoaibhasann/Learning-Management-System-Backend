import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // Valid for 7 days
  httpOnly: true,
  secure: true,
};

// User registration controller
const register = async (req, res, next) => {
  try {
    // Extract information from request body
    const { fullName, email, password } = req.body;

    // Check if all fields are provided
    if (!fullName || !email || !password) {
      return next(new AppError(400, "All fields are required"));
    }

    // Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError(400, "Email already exists"));
    }

    // Create a new user
    const user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url: "http://dummyurl.com",
      },
    });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = await user.generateToken();

    user.password = undefined;

    // Set the JWT token in the cookie
    res.cookie("token", token, cookieOptions);

    // Respond with success message and user details
    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};

// User login controller
const login = async (req, res, next) => {
  try {
    // Extract information
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
      return next(new AppError(400, "All fields are required"));
    }

    // Find the user in the database
    const user = await User.findOne({ email }).select("+password");

    // Check if the user exists
    if (!user) {
      return next(new AppError(400, "User not found"));
    }

    // Compare passwords using the comparePassword method
    const isPasswordMatch = await user.comparePassword(password);

    // Check if the password matches
    if (!isPasswordMatch) {
      return next(new AppError(400, "Password is incorrect"));
    }

    // Generate JWT token
    const token = await user.generateToken();

    user.password = undefined;

    // Set the JWT token in the cookie
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Login successful'
    });
    
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};


// User logout controller
const logout = (req, res) => {
  try {
    // Clear the JWT token in the cookie
    res.cookie("token", null, {
      secure: true,
      maxAge: 0,
      httpOnly: true,
    });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return next(new AppError(500, error.message));
  }
};

// Get user profile controller
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Respond with user details
    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    return next(new AppError(500, "Failed to fetch profile details"));
  }
};

export { register, login, logout, getProfile };
