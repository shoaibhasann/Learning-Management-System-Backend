import { Router } from "express";
import {addLectureToCourseById, createCourse, deleteCourse, deleteLectureById, getAllCourses, getLecturesByCourseId, updateCourse} from "../controllers/course.controllers.js";
import { authorizedRoles, isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Route to get all courses
router.get("/", getAllCourses);

// Route to create a new course
router.post("/", isLoggedIn, authorizedRoles('Admin'), upload.single("thumbnail"), createCourse);

// Route to get lectures by course ID
router.get("/:id", isLoggedIn,  getLecturesByCourseId);

// Route to update an existing course
router.put("/:id", isLoggedIn, authorizedRoles('Admin'), updateCourse);

// Route to create lectures in an existing course
router.post("/:id", isLoggedIn, authorizedRoles("Admin"), upload.single("lecture"), addLectureToCourseById);

// Route to delete lecture in an existing courese
router.delete("/:courseId/lecture/:lectureId", isLoggedIn, authorizedRoles("Admin"), deleteLectureById);

// Route to delete an existing course
router.delete("/:id", isLoggedIn, authorizedRoles('Admin'), upload.single("thumbnail"), deleteCourse);

export default router;
