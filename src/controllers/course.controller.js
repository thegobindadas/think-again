import { Course } from "../models/course.model.js";
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";



/**
 * Create a new course
 * @route POST /api/v1/course/
 */
export const createNewCourse = catchAsync(async (req, res) => {
  
  const { title, subtitle, description, category, level="beginner", price=0} = req.body

  const newCourse = { 
    title, 
    category, 
    level, 
    price,
    instructor: req.user._id
  }

  if (subtitle) newCourse.subtitle = subtitle

  if (description) newCourse.description = description


  if (!req.file) {
    throw new AppError("Thumbnail is required", 400);
  }

  if (!req.file?.path) {
    throw new AppError("Thumbnail file path is missing", 400);
  }

  const uploadResponse = await uploadMediaToCloudinary(req.file.path)

  if (!uploadResponse) {
    throw new AppError("Failed to upload thumbnail", 500);
  }

  newCourse.thumbnail = uploadResponse.secure_url
  newCourse.thumbnailPublicId = uploadResponse.public_id



  const course = await Course.create(newCourse)

  if (!course) {
    throw new AppError("Failed to create a new course", 500);
  }

  

  return res.status(201).json({
    data: course,
    message: "Course created successfully",
    success: true
  })
});


/**
 * Toggle course publish status
 * @route PATCH /api/v1/course/c/:courseId/publish
 */
export const toggleCoursePublishStatus = catchAsync(async (req, res) => {

  const { courseId } = req.params

  const course = await Course.findById(courseId)

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  course.isPublished = !course.isPublished

  await course.save()



  return res.status(200).json({
    data: course,
    message: `Course has been ${course.isPublished ? "published" : "unpublished"} successfully`,
    success: true
  })
});











/**
 * Search courses with filters
 * @route GET /api/v1/courses/search
 */
export const searchCourses = catchAsync(async (req, res) => {
  // TODO: Implement search courses functionality
});


/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get published courses functionality
});


/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get my created courses functionality
});


/**
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement update course details functionality
});


/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {
  // TODO: Implement get course details functionality
});


/**
 * Add lecture to course
 * @route POST /api/v1/courses/:courseId/lectures
 */
export const addLectureToCourse = catchAsync(async (req, res) => {
  // TODO: Implement add lecture to course functionality
});


/**
 * Get course lectures
 * @route GET /api/v1/courses/:courseId/lectures
 */
export const getCourseLectures = catchAsync(async (req, res) => {
  // TODO: Implement get course lectures functionality
});
