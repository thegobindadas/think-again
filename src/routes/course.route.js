import { Router } from "express";
import { isAuthenticated, restrictTo } from "../middleware/auth.middleware.js";
import {
  createNewCourse,
  toggleCoursePublishStatus,
  updateCourseDetails,
  getMyCreatedCourses,
  getPublishedCourses,
  getCourseDetails,
  getCourseEnrolledStudents,
  getCoursesByInstructor,
  searchCourses,
} from "../controllers/course.controller.js";
import { 
  validateCreateNewCourse,
  validateCoursePublishStatus,
  validateToGetCourseDetails,
  validateUpdateCourseDetails,
  validateToGetPublishedCourses,
  validateToGetCourseEnrolledStudents,
  validateGetCoursesByInstructor,
} from "../middleware/validation.middleware.js";
import upload from "../utils/multer.js";
import lectureRoute from "./lecture.route.js";



const router = Router();

router.use("/:courseId/lecture", lectureRoute);



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
router.route("/:courseId/publish")
  .patch(
    restrictTo("instructor"), 
    validateCoursePublishStatus, 
    toggleCoursePublishStatus
  )

router
  .route("/:courseId")
  .get(validateToGetCourseDetails, getCourseDetails)
  .patch(
    restrictTo("instructor"),
    upload.single("thumbnail"),
    validateUpdateCourseDetails,
    updateCourseDetails
  );

router.route("/:courseId/students").get(restrictTo("instructor"), validateToGetCourseEnrolledStudents, getCourseEnrolledStudents)

router.route("/instructor/:instructorId").get(validateGetCoursesByInstructor, getCoursesByInstructor)





export default router;