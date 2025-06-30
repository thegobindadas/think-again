import { Lecture } from "../models/lecture.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { uploadMediaToCloudinary, deleteVideoFromCloudinary } from "../utils/cloudinary.js";



/**
 * Create a new lecture and add it to a course
 * @route POST /api/v1/course/:courseId/lecture/
 */
export const createLecture = catchAsync(async (req, res) => {

    const { courseId } = req.params
    const { title, description, isPreview=false, order } = req.body


    const course = await Course.findById(courseId)

    if (!course) {
        throw new AppError("Course not found", 404);
    }

    if (!req.user || course.instructor.toString() !== req.id.toString()) {
        throw new AppError("You are not authorized to create a lecture", 403)
    }


    if (!req.file) {
        throw new AppError("Video is required", 400);
    }

    if (!req.file?.path) {
        throw new AppError("Video file path is missing", 400);   
    }


    const uploadResponse = await uploadMediaToCloudinary(req.file.path)

    if (!uploadResponse) {
        throw new AppError("Failed to upload video", 500);
    }


    const lecture = await Lecture.create({
        title,
        description: description || "",
        videoUrl: uploadResponse?.secure_url,
        videoPublicId: uploadResponse?.public_id,
        duration: uploadResponse?.duration || 0,
        isPreview,
        order: order || course.lectures.length + 1,
        instructor: req.id,
    })

    if (!lecture) {
        throw new AppError("Failed to create lecture", 500);
    }
        
    
    // Add lecture to course
    course.lectures.push(lecture._id)
    course.totalDuration += lecture.duration || 0;
    await course.save()



    return res.status(201).json({
        data: lecture,
        message: "Lecture created and added to course successfully",
        status: "success",
    })
});


/**
 * Get course lectures
 * @route GET /api/v1/course/:courseId/lecture/
 */
export const getCourseLectures = catchAsync(async (req, res) => {

    const { courseId } = req.params


    const course = await Course.findById(courseId).populate({
        path: "lectures",
        select: "title description videoUrl duration isPreview order instructor",
        options: { sort: { order: 1 } },
    })

    if (!course) {
        throw new AppError("Course not found", 404);
    }


    // Check if user has access to full course content
    const isEnrolled = course.isStudentEnrolled(req.id);
    const isInstructor = course.instructor.toString() === req.id.toString();

    let lectures = course.lectures;
    if (!isEnrolled && !isInstructor) {
        // Only return preview lectures for non-enrolled users
        lectures = lectures.filter((lecture) => lecture.isPreview);
    }



    return res.status(200).json({
        data: {
            lectures,
            isEnrolled,
            isInstructor,
        },
        message: "Lectures fetched successfully",
        status: "success",
    })
});


/**
 * Get single lecture
 * @route GET /api/v1/course/:courseId/lecture/:lectureId
 */
export const getSingleLecture = catchAsync(async (req, res) => {

    const { courseId, lectureId } = req.params


    const course = await Course.findById(courseId)
        .populate({
            path: "lectures",
            match: { _id: lectureId },
            select: "title description videoUrl duration isPreview order instructor",
        })

    if (!course || course?.lectures?.length === 0) {
        throw new AppError("Lecture not found in this course", 404);
    }


    let lecture = course.lectures[0];

    // Check if user has access to this lecture
    const isEnrolled = course.isStudentEnrolled(req.id);
    const isInstructor = course.instructor.toString() === req.id.toString() && lecture.instructor.toString() === req.id.toString();


    if (!isEnrolled && !isInstructor) {
        lecture = lecture.isPreview ? lecture : null;
    }



    return res.status(200).json({
        data: {
            lecture,
            isEnrolled,
            isInstructor
        },
        message: "Lecture fetched successfully",
        status: "success",
    })
});


/**
 * Update lecture
 * @route PATCH /api/v1/course/:courseId/lecture/:lectureId
 */
export const updateLecture = catchAsync(async (req, res) => {

    const userId = req.id.toString();
    const { courseId, lectureId } = req.params;
    const { title, description, order } = req.body;


    const course = await Course.findById(courseId)
    
    if (!course) {
        throw new AppError("Course not found", 404);
    }

    
    const lecture = await Lecture.findById(lectureId)

    if (!lecture) {
        throw new AppError("Lecture not found in this course", 404);
    }

   
    if (course.instructor.toString() !== userId || lecture.instructor.toString() !== userId) {
        throw new AppError("You are not authorized to update this lecture", 403)
    }
    

    if (req.file) {

        const uploadResponse = await uploadMediaToCloudinary(req.file.path)

        if (!uploadResponse) {
            throw new AppError("Failed to upload video", 500);
        }

        if (lecture.videoUrl && lecture.videoPublicId) {
            await deleteVideoFromCloudinary(lecture.videoPublicId)
        }

        lecture.videoUrl = uploadResponse?.secure_url;
        lecture.videoPublicId = uploadResponse?.public_id;
        lecture.duration = uploadResponse?.duration || 0;
    }


    if (title) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (order !== undefined) lecture.order = order;

    await lecture.save()



    return res.status(200).json({
        data: lecture,
        message: "Lecture updated successfully",
        status: "success",
    })
});


/**
 * Update lecture
 * @route PATCH /api/v1/course/:courseId/lectures/:lectureId/toggle-preview
 */
export const toggleLecturePreviewStatus = catchAsync(async (req, res) => {

    const userId = req.id.toString();
    const { courseId, lectureId } = req.params;


    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      throw new AppError("Lecture not found", 404);
    }

    if (lecture.instructor.toString() !== userId) {
        throw new AppError("You are not authorized to update this lecture", 403)
    }


    lecture.isPreview = !lecture.isPreview;
    await lecture.save();



    res.status(200).json({
      success: true,
      message: `Lecture preview status updated to ${lecture.isPreview}`,
      data: lecture
    });
});


/**
 * Delete lecture
 * @route DELETE /api/v1/course/:courseId/lecture/:lectureId
 */
export const deleteLecture = catchAsync(async (req, res) => {

    const userId = req.id.toString();
    const { courseId, lectureId } = req.params;


    const course = await Course.findById(courseId)
    
    if (!course) {
        throw new AppError("Course not found", 404);
    }


    const lecture = await Lecture.findById(lectureId)

    if (!lecture) {
        throw new AppError("Lecture not found", 404);
    }


    const isCourseInstructor = course.instructor.toString() === userId;
    const isLectureInstructor = lecture.instructor.toString() === userId;

    if (!isCourseInstructor || !isLectureInstructor) {
        throw new AppError("You are not authorized to delete this lecture", 403)
    }


    if (lecture.videoUrl && lecture.videoPublicId) {
        await deleteVideoFromCloudinary(lecture.videoPublicId)
    }


    const lectureExistsInCourse = course.lectures.some(
      (lecId) => lecId.toString() === lectureId
    );

    if (lectureExistsInCourse) {
        // Remove lecture from course
        course.lectures = course.lectures.filter(
            lecId => lecId.toString() !== lectureId
        );
        course.totalLectures = course.lectures.length;
        course.totalDuration -= lecture.duration || 0;
    }
    
    await course.save();


    // Delete lecture
    await lecture.deleteOne();



    return res.status(200).json({
        message: "Lecture deleted successfully",
        status: "success",
    })
});