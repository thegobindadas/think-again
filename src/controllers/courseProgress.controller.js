import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";



/**
 * Get user's progress for a specific course
 * @route GET /api/v1/progress/:courseId
 */
export const getUserCourseProgress = catchAsync(async (req, res) => {
  
    const { courseId } = req.params;

    // Get course details with lectures
    const courseDetails = await Course.findById(courseId)
        .populate("lectures")
        .select("title subtitle thumbnail lectures");

    if (!courseDetails) {
        throw new AppError("Course not found", 404);
    }


    // Get user's progress for the course
    const courseProgress = await CourseProgress.findOne({
        course: courseId,
        user: req.id,
    }).populate("course");

    // If no progress found, return course details with empty progress
    if (!courseProgress) {
        return res.status(200).json({
            data: {
                courseDetails,
                progress: [],
                isCompleted: false,
                completionPercentage: 0,
            },
            message: "Course progress not found",
            success: true,
        });
    }

    // Calculate completion percentage
    const totalLectures = courseDetails.lectures.length;
    const completedLectures = courseProgress.lectureProgress.filter(
        (lp) => lp.isCompleted
    ).length;
    const completionPercentage = Math.round(
        (completedLectures / totalLectures) * 100
    );



    res.status(200).json({
        data: {
            courseDetails,
            progress: courseProgress.lectureProgress,
            isCompleted: courseProgress.isCompleted,
            completionPercentage,
        },
        message: "Course progress fetched successfully",
        success: true,
    });
});


/**
 * Update progress for a specific lecture
 * @route PATCH /api/v1/progress/:courseId/lecture/:lectureId
 */
export const updateLectureProgress = catchAsync(async (req, res) => {
    
    const { courseId, lectureId } = req.params;


    const course = await Course.findById(courseId);

    if (!course) {
        throw new AppError("Course not found", 404);
    }


    // Find or create course progress
    let courseProgress = await CourseProgress.findOne({
        course: courseId,
        user: req.id,
    });

    if (!courseProgress) {
        courseProgress = await CourseProgress.create({
            user: req.id,
            course: courseId,
            isCompleted: false,
            lectureProgress: [],
        });
    }


    // Update lecture progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
        (lecture) => lecture.lecture.toString() === lectureId
    );

    if (lectureIndex !== -1) {
        courseProgress.lectureProgress[lectureIndex].isCompleted = true;
    } else {
        courseProgress.lectureProgress.push({
            lecture: lectureId,
            isCompleted: true,
        });
    }


    // Check if course is completed
    
    const completedLectures = courseProgress.lectureProgress.filter(
        (lp) => lp.isCompleted
    ).length;

    courseProgress.isCompleted = course.lectures.length === completedLectures;

    courseProgress.completionPercentage = Math.round((completedLectures / course.lectures.length) * 100);

    await courseProgress.save();



    res.status(200).json({
        data: {
            lectureProgress: courseProgress.lectureProgress,
            isCompleted: courseProgress.isCompleted,
        },
        message: "Lecture progress updated successfully",
        success: true,
    });
});


/**
 * Mark entire course as completed
 * @route PATCH /api/v1/progress/:courseId/complete
 */
export const markCourseAsCompleted = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    // Find course progress
    const courseProgress = await CourseProgress.findOne({
        course: courseId,
        user: req.id,
    });

    if (!courseProgress) {
        throw new AppError("Course progress not found", 404);
    }


    // Mark all lectures as isCompleted
    courseProgress.lectureProgress.forEach((progress) => {
        progress.isCompleted = true;
    });
    
    courseProgress.isCompleted = true;
    courseProgress.completionPercentage = 100;
    courseProgress.lastWatchedAt = Date.now();

    await courseProgress.save();



    res.status(200).json({
        data: courseProgress,
        message: "Course marked as completed",
        success: true,
    });
});


/**
 * Reset course progress
 * @route PATCH /api/v1/progress/:courseId/reset
 */
export const resetCourseProgress = catchAsync(async (req, res) => {
    const { courseId } = req.params;

    // Find course progress
    const courseProgress = await CourseProgress.findOne({
        course: courseId,
        user: req.id,
    });

    if (!courseProgress) {
        throw new AppError("Course progress not found", 404);
    }


    // Reset all progress
    courseProgress.lectureProgress.forEach((progress) => {
        progress.isCompleted = false;
    });

    courseProgress.isCompleted = false;
    courseProgress.completionPercentage = 0;

    await courseProgress.save();



    res.status(200).json({
        data: courseProgress,
        message: "Course progress reset successfully",
        success: true,
    });
});