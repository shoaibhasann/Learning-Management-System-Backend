import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create the user schema
const userSchema = new Schema(
  {
    // User's full name
    fullName: {
      type: String,
      required: [true, "Name is required"],
      minLength: [5, "Name must be at least 5 characters"],
      maxLength: [30, "Name should be less than 30 characters"],
      trim: true,
      lowercase: true,
    },

    // User's email
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      unique: true,
      match: [
        // Email validation regular expression
        // This regex pattern is used to validate email addresses.
        // It checks for a valid email format.
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
        "Please enter a valid email address",
      ],
    },

    // User's password
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false, // Password won't be returned when fetching user data
    },

    // User's avatar information
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },

    // User's role, can be 'User' or 'Admin'
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },

    // Fields related to the forgot password feature
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt timestamps
  }
);

// Pre-save middleware for password hashing
userSchema.pre("save", async function (next) {
  // Ensure we only hash the password if it's being modified
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Hash the password using bcrypt with a salt of 10 rounds
    const hashedPassword = await bcrypt.hash(this.password, 10);

    // Replace the original password with the hashed one
    this.password = hashedPassword;

    next();
  } catch (error) {
    return next(error);
  }
});

// generic methods
userSchema.methods.generateToken = async function(){
    try {
            return await jwt.sign(
                   {
                     id: this._id,
                     email: this.email,
                     subscription: this.subscription,
                   },
                   process.env.JWT_SECRET,
                   {
                     expiresIn: process.env.JWT_EXPIRY,
                   }
                 );
    } catch (error) {
        throw error
    }
   
};

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    // Compare the entered password with the stored hashed password
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Create the User model based on the userSchema
const User = model("User", userSchema);

export default User;
