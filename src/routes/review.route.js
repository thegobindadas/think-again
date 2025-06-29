import { Router } from "express";
import {
    createReview,
    getCourseReviews,
    getUserReviews,
    updateReview,
    deleteReview,
    getAverageRating,
} from "../controllers/review.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { 
    validateCreateReviewInput,
    validateCourseReviewsQuery,
    validateUserReviewsQuery,
    validateReviewUpdateInput,
    validateReviewDeletion,
    validateAverageRatingQuery,
} from "../middleware/validation.middleware.js";



const router = Router();
router.use(isAuthenticated);





router.route("/c/:courseId")
    .post(validateCreateReviewInput, createReview)
    .get(validateCourseReviewsQuery, getCourseReviews);


router.route("/c/:courseId/average")
    .get(validateAverageRatingQuery, getAverageRating);


router.route("/u/:userId")
    .get(validateUserReviewsQuery, getUserReviews);


router.route("/:reviewId")
    .patch(validateReviewUpdateInput, updateReview)
    .delete(validateReviewDeletion, deleteReview);










export default router;