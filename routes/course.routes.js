import { Router } from "express";
import {createCourse, deleteCourse, getAllCourses, getLecturesByCourseId, updateCourse} from "../controllers/course.controllers.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Route to get all courses
router.get("/", getAllCourses);

// Route to create a new course
router.post("/", isLoggedIn, authorizedRoles('ADMIN'), upload.single("thumbnail"), createCourse);

// Route to get lectures by course ID
router.get("/:id", isLoggedIn,  getLecturesByCourseId);

// Route to update an existing course
router.put("/:id", isLoggedIn, authorizedRoles('ADMIN'), updateCourse);

// Route to delete an existing course
router.delete("/:id", isLoggedIn, authorizedRoles('ADMIN'), deleteCourse);

export default router;
