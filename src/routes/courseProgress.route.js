import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
    getUserCourseProgress,
    updateLectureProgress,
    markCourseAsCompleted,
    resetCourseProgress
} from "../controllers/courseProgress.controller.js";



const router = express.Router();
router.use(isAuthenticated);





// Get course progress
router.get("/:courseId", getUserCourseProgress);

// Update lecture progress
router.patch("/:courseId/lecture/:lectureId", updateLectureProgress);

// Mark course as completed
router.patch("/:courseId/complete", markCourseAsCompleted);

// Reset course progress
router.patch("/:courseId/reset", resetCourseProgress);





export default router;