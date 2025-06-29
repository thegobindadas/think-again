import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { Review } from "../models/review.model.js";
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";



/**
 * Create a new course
 * @route POST /api/v1/course/
 */
export const createNewCourse = catchAsync(async (req, res) => {
  
  const { title, subtitle, description, category, level="beginner", price=0 } = req.body

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


  // Add course to instructor's created courses
  await User.findByIdAndUpdate(req.id, {
    $push: { createdCourses: course._id },
  });

  

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

  if (!req.user || course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError("You are not authorized to update the publish status", 403)
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
 * Update course details
 * @route PATCH /api/v1/courses/:courseId
 */
export const updateCourseDetails = catchAsync(async (req, res) => {
  
  const { courseId } = req.params
  const { title, subtitle, description, category, level, price } = req.body;
  
  const updatedData = {}

  const course = await Course.findById(courseId)

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (!req.user || course.instructor.toString() !== req.user?._id.toString()) {
    throw new AppError("You are not authorized to update this course", 403)
  }



  if (req.file) {
    const uploadResponse = await uploadMediaToCloudinary(req.file.path)

    if (!uploadResponse) {
      throw new AppError("Failed to upload thumbnail", 500);
    }

    if (course.thumbnail && course.thumbnailPublicId) {
      await deleteMediaFromCloudinary(course.thumbnailPublicId)
    }


    updatedData.thumbnail = uploadResponse.secure_url
    updatedData.thumbnailPublicId = uploadResponse.public_id
  }


  if (title) updatedData.title = title.trim();
  if (subtitle !== undefined) updatedData.subtitle = subtitle.trim();
  if (description !== undefined) updatedData.description = description.trim();

  if (category !== undefined) updatedData.category = category
  if (level !== undefined) updatedData.level = level
  if (price !== undefined) updatedData.price = price


  const updatedCourse = await Course.findByIdAndUpdate(courseId, updatedData, { new: true, runValidators: true })



  return res.status(200).json({
    data: updatedCourse,
    message: "Course updated successfully",
    success: true
  })
});


/**
 * Get courses created by the current user
 * @route GET /api/v1/courses/my-courses
 */
export const getMyCreatedCourses = catchAsync(async (req, res) => {
  
  const courses = await Course.find({ instructor: req.id }).select(
    "title subtitle description category level price thumbnail isPublished totalLectures totalDuration averageRating numOfRatings"
  )



  return res.status(200).json({
    data: courses.length > 0 ? courses : [],
    message: courses.length > 0 ? "Courses fetched successfully" : "You have not created any course yet",
    success: true
  })

});


/**
 * Get all published courses
 * @route GET /api/v1/courses/published
 */
export const getPublishedCourses = catchAsync(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [courses, totalCourses] = await Promise.all([
    Course.find({ isPublished: true })
    .populate({
      path: "instructor",
      select: "name avatar"
    })
    .sort({ createdAt: -1})
    .skip(skip)
    .limit(limit),
    Course.countDocuments({ isPublished: true })
  ])



  return res.status(200).json({
    data: courses.length > 0 ? courses : [],
    pagination: {
      page,
      limit,
      total: totalCourses,
      pages: Math.ceil(totalCourses / limit)
    },
    message: courses.length > 0 ? "Courses fetched successfully" : "No published courses found",
    success: true
  })
});


/**
 * Get course by ID
 * @route GET /api/v1/courses/:courseId
 */
export const getCourseDetails = catchAsync(async (req, res) => {

  const { courseId } = req.params

  const course = await Course.findById(courseId)
    .populate({
      path: "instructor",
      select: "name avatar bio"
    })
    .populate({
      path: "lectures",
      select: "title videoUrl duration isPreview order"
    })

  if (!course) {
    throw new AppError("Course not found", 404);
  }


  const reviews = await Review.find({ course: courseId })
    .populate({
      path: "user",
      select: "name avatar"
    })

  

  return res.status(200).json({
    data: {
      ...course.toJSON(),
      reviews
    },
    message: "Course fetched successfully",
    success: true
  })
});


/**
 * Search courses with filters
 * @route GET /api/v1/courses/c/:courseId/students
 */
export const getCourseEnrolledStudents = catchAsync(async (req, res) => {
  
  const { courseId } = req.params

  const course = await Course.findById(courseId)
    .populate({
      path: "enrolledStudents",
      select: "name avatar"
    })

  if (!course) {
    throw new AppError("Course not found", 404);
  }

  if (course.instructor.toString() !== req.user._id.toString()) {
    throw new AppError("You are not authorized to fetch enrolled students", 403)
  }



  return res.status(200).json({
    data: {
      enrolledStudents: course.enrolledStudents.length > 0 ? course.enrolledStudents : [],
      totalEnrolledStudents: course?.enrolledStudents?.length
    },
    message: course.enrolledStudents.length > 0 ? "Students fetched successfully" : "No enrolled students found",
    success: true
  })
});


/**
 * Search courses with filters
 * @route GET /api/v1/courses/instructor/:instructorId
 */
export const getCoursesByInstructor = catchAsync(async (req, res) => {
  
  const { instructorId } = req.params

   const courses = await Course.find({ instructor: instructorId })
    .populate({
      path: "instructor",
      select: "name avatar"
    })



  return res.status(200).json({
    data: courses.length > 0 ? courses : [],
    message: courses.length > 0 ? "Courses fetched successfully" : "No courses associated with the instructor",
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
