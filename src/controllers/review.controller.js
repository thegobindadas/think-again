import { Review } from "../models/review.model.js";
import { Course } from "../models/course.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";



/**
 * Create a new review for a course
 * @route POST /api/v1/review/c/:courseId
 */
export const createReview = catchAsync(async (req, res) => {

    const { courseId } = req.params
    const { rating, comment } = req.body


    const course = await Course.findById(courseId)

    if (!course) {
        throw new AppError("Course not found", 404);
    }


    const isEnrolled = course.enrolledStudents.includes(req.id)

    if (!isEnrolled) {
        throw new AppError("You are not authorized to review this course", 403);
    }


    const existingReview = await Review.findOne({ course: courseId, user: req.id })

    if (existingReview) {
        throw new AppError("You have already reviewed this course", 400);
    }


    const review = await Review.create({
        course: courseId,
        user: req.user._id,
        rating,
        comment: comment || ""
    })



    return res.status(201).json({
        data: review,
        message: "Review created successfully",
        success: true
    })
});


/**
 * Get course reviews
 * @route GET /api/v1/review/c/:courseId
 */
export const getCourseReviews = catchAsync(async (req, res) => {
    
    const { courseId } = req.params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const [reviews, totalReviews] = await Promise.all([
        Review.find({ course: courseId })
            .populate({
                path: "user",
                select: "name avatar"
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Review.countDocuments({ course: courseId })
    ])



    return res.status(200).json({
        data: reviews.length > 0 ? reviews : [],
        pagination: {
            page,
            limit,
            totalReviews,
            pages: Math.ceil(totalReviews / limit)
        },
        message: reviews.length > 0 ? "Reviews fetched successfully" : "No reviews found",
        success: true
    })
});


/**
 * Get user reviews
 * @route GET /api/v1/review/u/:userId
 */
export const getUserReviews = catchAsync(async (req, res) => {

    const { userId } = req.params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;


    const [reviews, totalReviews] = await Promise.all([
        Review.find({ user: userId })
            .populate({
                path: "course",
                select: "title subtitle category thumbnail"
            })
            .sort({ createdAt: -1})
            .skip(skip)
            .limit(limit),
        Review.countDocuments({ user: userId })
    ])



    return res.status(200).json({
        data: reviews.length > 0 ? reviews : [],
        pagination: {
            page,
            limit,
            totalReviews,
            pages: Math.ceil(totalReviews / limit)
        },
        message: reviews.length > 0 ? "Reviews fetched successfully" : "No reviews found",
        success: true
    })
});


/**
 * Update a review
 * @route PATCH /api/v1/review/:reviewId
 */
export const updateReview = catchAsync(async (req, res) => {

    const { reviewId } = req.params
    const { rating, comment } = req.body


    const review = await Review.findById(reviewId)

    if (!review) {
        throw new AppError("Review not found", 404);
    }

    if (review.user.toString() !== req.id) {
        throw new AppError("You are not authorized to update this review", 403);
    }


    if (rating !== undefined && rating !== null) review.rating = rating

    if (comment !== undefined) review.comment = comment

    await review.save()



    return res.status(200).json({
        data: review,
        message: "Review updated successfully",
        success: true
    })
});


/**
 * Delete a review
 * @route DELETE /api/v1/review/:reviewId
 */
export const deleteReview = catchAsync(async (req, res) => {

    const { reviewId } = req.params


    const review = await Review.findById(reviewId)

    if (!review) {
        throw new AppError("Review not found", 404);
    }

    if (review.user.toString() !== req.id) {
        throw new AppError("You are not authorized to delete this review", 403);
    }


    await review.deleteOne()



    return res.status(200).json({
        message: "Review deleted successfully",
        success: true
    })
});


/**
 * Get average rating
 * @route GET /api/v1/review/c/:courseId/average
 */
export const getAverageRating = catchAsync(async (req, res) => {

    const { courseId } = req.params

    const result = await Review.aggregate([
      { $match: { course: new mongoose.Types.ObjectId(courseId) } },
      {
        $group: {
            _id: "$course",
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
        },
      },
    ]);

    

    return res.status(200).json({
        data: result[0] || { averageRating: 0, totalReviews: 0 },
        message: "Average rating fetched successfully",
        success: true
    })
});