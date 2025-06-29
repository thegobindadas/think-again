import { Router } from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import {
  createNewCourse,
  toggleCoursePublishStatus,
  updateCourseDetails,
  getMyCreatedCourses,
  getPublishedCourses,
  getCourseDetails,
  searchCourses,
  addLectureToCourse,
  getCourseLectures,
} from "../controllers/course.controller.js";
import { 
  validateCreateNewCourse,
  validateCoursePublishStatus,
  validateUpdateCourseDetails,
  validateToGetPublishedCourses,
  validateToGetCourseDetails,
} from "../middleware/validation.middleware.js";
import upload from "../utils/multer.js";



const router = Router();



// Public routes
router.get("/published", validateToGetPublishedCourses, getPublishedCourses);
router.get("/search", searchCourses);


// Protected routes
router.use(isAuthenticated);


// Course management
router
  .route("/")
  .post(restrictTo("instructor"), upload.single("thumbnail"), validateCreateNewCourse, createNewCourse)
  .get(restrictTo("instructor"), getMyCreatedCourses);


// Course details and updates
router.route("/c/:courseId/publish").patch(restrictTo("instructor"), validateCoursePublishStatus, toggleCoursePublishStatus);
router
  .route("/c/:courseId")
  .get(validateToGetCourseDetails, getCourseDetails)
  .patch(
    restrictTo("instructor"),
    upload.single("thumbnail"),
    validateUpdateCourseDetails,
    updateCourseDetails
  );


// Lecture management
router
  .route("/c/:courseId/lectures")
  .get(getCourseLectures)
  .post(restrictTo("instructor"), upload.single("video"), addLectureToCourse);





export default router;