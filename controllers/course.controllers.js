import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import fs from "fs/promises";
import cloudinary from "cloudinary";

// Controller to get all courses
const getAllCourses = async (req, res, next) => {
  try {
    // Get all information about courses excluding lectures
    const courses = await Course.find({}).select("-lectures");

    // Respond with success and course data
    res.status(200).json({
      success: true,
      message: "All courses",
      courses,
    });
  } catch (error) {
    // If an error occurs during the database operation, handle it and pass to error middleware
    return next(new AppError(500, error.message || "Internal Server Error"));
  }
};

// Controller to get lectures by course ID
const getLecturesByCourseId = async (req, res, next) => {
  try {
    // Extract ID from request parameters
    const { id } = req.params;

    // Find the course by ID
    const course = await Course.findById(id);

    // Check if the course with the given ID exists
    if (!course) {
      return next(new AppError(400, "Invalid course ID"));
    }

    // Respond with success and the lectures of the course
    res.status(200).json({
      success: true,
      message: "Course lectures fetched successfully",
      lectures: course.lectures,
    });
  } catch (error) {
    // If an error occurs during the database operation, handle it and pass to error middleware
    return next(new AppError(500, error.message || "Internal Server Error"));
  }
};

// controller to create course
const createCourse = async (req,res,next) => {
    try {
      // extract information from request body
      const { title, description, category, createdBy } = req.body;
      console.log(req.body);

      if (!title || !description || !category || !createdBy) {
        return next(new AppError(400, "All fields are required"));
      }

      // create new course instance
      const course = await Course.create({
        title,
        description,
        category,
        createdBy,
        thumbnail: {
          public_id: "dummy",
          secure_url: "http://dummy.com",
        },
      });

      // thumbnail file upload
      if (req.file) {
        try {
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms",
          });

          if (result) {
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
          }

          // remove file from the upload folder
          fs.rm(`uploads/${req.file.filename}`);

        } catch (error) {
          return next(
            new AppError(400, "file not uploaded, please try again" || error)
          );
        }
      }

      // save course to the database
      await course.save();

      // respond with success message and course details
      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        course
      });
    } catch (error) {
        return next(new AppError(500, error.message || "Internal Server Error"));
    }
}

// controller to update course 
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the course by its ID and update its fields with the data from req.body
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body,
      },
      {
        runValidators: true, // Run model validators during update
        new: true, // Return the updated document after update
      }
    );

    // Check if the course exists
    if (!course) {
      // If the course with the given ID does not exist, return an error
      return next(new AppError(400, "Course with the given ID does not exist"));
    }

    // Respond with success message and the updated course
    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      course,
    });
  } catch (error) {
    // If an error occurs during the database operation or response handling, pass it to the error middleware
    return next(new AppError(500, error.message || "Internal Server Error"));
  }
};

// controller to delete course
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find the course by its ID in the database
    const course = await Course.findById(id);

    // Check if the course exists
    if (!course) {
      // If the course with the given ID does not exist, return an error
      return next(new AppError(400, "Course with the given ID does not exist"));
    }

    // Delete the course from the database
    await Course.findByIdAndDelete(id);

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    // If an error occurs during the database operation or response handling, pass it to the error middleware
    return next(new AppError(500, error.message || "Internal Server Error"));
  }
};

// controller function add lectures in existing course
const addLectureToCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    // Check all fields provided or not
    if (!title || !description) {
      return next(new AppError(400, "All fields are required"));
    }

    // Find the course by ID
    const course = await Course.findById(id);

    // Check if the course exists
    if (!course) {
      // If the course with the given ID does not exist, return an error
      return next(new AppError(400, "Course with the given ID does not exist"));
    }

    // Create a new lecture object
    const lectureData = {
      title,
      description,
      lecture: {},
    };

    // Upload thumbnail file
    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });

        if (result) {
          // Update the course with the thumbnail details
          lectureData.lecture.public_id = result.public_id;
          lectureData.lecture.secure_url = result.secure_url;
        }

        // Remove file from the upload folder
        fs.rmSync(`uploads/${req.file.filename}`);

      } catch (error) {
        return next(
          new AppError(400, "File not uploaded, please try again" || error)
        );
      }
    }

    // Add the new lecture to the course's lectures array
    course.lectures.push(lectureData);

    // Increase the numberOfLectures field by 1
    course.numberOfLectures = course.lectures.length;

    // Save the updated course in the database
    await course.save();

    // Respond with success message and updated course details
    res.status(200).json({
      success: true,
      message: "Lecture added to the course successfully",
      course,
    });
  } catch (error) {
    // If an error occurs during the database operation or response handling, pass it to the error middleware
    return next(new AppError(500, error.message || "Internal Server Error"));
  }
};



export { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, deleteCourse, addLectureToCourseById };
