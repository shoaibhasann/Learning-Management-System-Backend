import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000, // Valid for 7 days
  httpOnly: true,
  secure: true,
};

// controller function to register user
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
    // avatar file upload
    if(req.file){
      
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: 'lms',
              width: 250,
              height: 250,
              gravity: 'faces',
              crop: 'fill'
        });

        if(result){
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
        }

        // remove file from the upload folder
        fs.rm(`uploads/${req.file.filename}`);

      } catch (error) {
            return next(new AppError(400, 'file not uploaded, please try again' || error));
      }
    }

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

// controller function to login user
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


// controller function to user logout process
const logout = (req, res, next) => {
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

// controller function to initiate forgot password process
const forgotPassword = async (req, res, next) => {
  try {
    // Extract the email from the request body
    const { email } = req.body;

    // Check if the email is provided or not
    if (!email) {
      return next(new AppError(400, "Email is required"));
    }

    // Check if the email exists in the database
    const emailExists = await User.findOne({ email });

    if (!emailExists) {
      return next(new AppError(400, "Email not registered"));
    }

    // Generate the forgot password token for the user
    const forgotPasswordToken = await emailExists.generateForgotPasswordToken();

    // Save the user with the updated forgot password token and expiry
    await emailExists.save();

    // Create the forgot password URL for the email
    const forgotPasswordURL = `${process.env.CLIENT_URL}/reset/${forgotPasswordToken}`;
    const subject = "Reset Password";

    // Create the content of the reset password email as an HTML link
    const message = `
      <h1>Dear ${emailExists.fullName},</h1>
      <p>You have requested to reset your password. Please click on the following link to reset your password:</p>
      <a href="${forgotPasswordURL}">${forgotPasswordURL}</a>
      <p>If you did not request this password reset, you can ignore this email.</p>
      <p>Best regards,</p>
      <p>Shoaib Hasan</p>
    `;

    try {
      // Send the reset password email to the user
      await sendEmail(email, subject, message);

      // Respond with success message
      res.status(200).json({
        success: true,
        message: "Reset password email sent successfully",
      });
    } catch (error) {
      // If an error occurs while sending the email, handle the error
      // and reset the forgot password token and expiry for the user
      emailExists.forgotPasswordToken = undefined;
      emailExists.forgotPasswordExpiry = undefined;

      await emailExists.save();

      return next(new AppError(500, "Error sending reset password email"));
    }
  } catch (error) {
    // If an error occurs in the try block, handle the error
    return next(new AppError(500, error.message));
  }
};

// controller function to reset password process
const resetPassword = async (req,res,next) => {
      try{
         // extract token from request parameters
         const { resetToken } = req.params;

         // extract new password 
         const { password } = req.body;

         // check new password is provided or not
         if(!password){
            return next(new AppError(400,'Password is required'));
         }

         const forgotPasswordToken = crypto
               .createHash('sha256')
               .update(resetToken)
               .digest('hex');

          const user = await User.findOne({
                forgotPasswordToken,
                forgotPasswordExpiry: { $gt: Date.now() }
          });
          
          if(!user){
             return next(new AppError(400,'Token is invalid or expired, please try again'));
          }

          // update user new password with old password
          user.password = password;
          user.forgotPasswordToken = undefined;
          user.forgotPasswordExpiry = undefined;

          await user.save();

          res.status(200).json({
             success: true,
             message: 'Password changed successfully'
          });

      } catch(error){
          return next(new AppError(500,error.message));
      }
}

// controller function to change password 
const changePassword = async (req,res,next) => {
      try {
        // extract info from request body
        const { oldPassword, newPassword } = req.body;

        // extract user id
        const { id } = req.user;

        // check all fields are provided or not 
        if(!oldPassword || !newPassword){
           return next(new AppError(400,'All fields are required'));
        }

        // find user
        const user = await User.findById(id).select('+password');

        // check user exists or not
        if(!user){
           return next(new AppError(400,'User does not exists'));
        }

        // check old password match with stored password
        const isPasswordValid = await user.comparePassword(oldPassword);

        if(!isPasswordValid){
           return next(new AppError(400,'Old password is incorrect'));
        }

        user.password = newPassword;

        await user.save();

        user.password = undefined;

        res.status(200).json({
           success: true,
           message: 'Password changed successfully'
        });
       
      } catch (error) {
         return next(new AppError(500,error.message));
      }
}

// controller function to update user profile information 
const updateProfile = async (req, res, next) => {
  try {
    // Extract full name from request body
    const { fullName } = req.body;

    // Extract user id from token
    const { id } = req.user;

    // Find the user in the database
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
      return next(new AppError(400, "User does not exist"));
    }

    // Update user full name
    if (fullName) {
      user.fullName = fullName;
    }

    // Delete and update user profile image
    if (req.file) {
      // Remove the existing profile image from Cloudinary
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);

      try {
        // Upload the new profile image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
        }

        // Remove the file from the upload folder after uploading to Cloudinary
        fs.rm(`uploads/${req.file.filename}`);
      
      } catch (error) {
        return next(
          new AppError(400, "File not uploaded, please try again" || error)
        );
      }
    }

    // Save the updated user profile to the database
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
    });

  } catch (error) {
    return next(new AppError(500, error.message));
  }
};

export { register, login, logout, getProfile, forgotPassword, resetPassword, changePassword, updateProfile };
