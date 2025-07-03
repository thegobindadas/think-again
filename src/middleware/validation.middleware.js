import { body, param, query, validationResult } from "express-validator";
import { AppError } from "./error.middleware.js";



export const validate = (validations) => {
    return async (req, res, next) => {

        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const extractedErrors = errors.array().map(err => ({
            field: err.path,
            message: err.msg
        }));

        
        throw new AppError("Validation failed", 400, extractedErrors);
    };
};



// Common validation chains
export const commonValidations = {
    pagination: [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100")
    ],
    
    objectId: (field) => 
        param(field)
            .isMongoId()
            .withMessage(`Invalid ${field} ID format`),

    email: 
        body("email")
            .isEmail()
            .normalizeEmail()
            .withMessage("Please provide a valid email"),

    password: 
        body("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage("Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character"),

    name:
        body("name")
            .trim()
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be between 2 and 50 characters")
            .matches(/^[a-zA-Z\s]*$/)
            .withMessage("Name can only contain letters and spaces"),

    price:
        body("price")
            .isFloat({ min: 0 })
            .withMessage("Price must be a positive number"),

    url:
        body("url")
            .isURL()
            .withMessage("Please provide a valid URL")
};



// User validations
export const validateSignup = validate([
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
]);

export const validateSignin = validate([
    commonValidations.email,
    body("password")
        .notEmpty()
        .withMessage("Password is required")
]);

export const validateEmailVerification = validate([
    param("verificationToken")
        .notEmpty()
        .withMessage("Verification token is required"),
]);

export const validatePasswordChange = validate([
    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required"),
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error("New password must be different from current password");
            }
            return true;
        })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage("Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character"),
    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New password & confirm password should be same");
            }
            return true;
        })
]);


export const validateForgotPassword = validate([
    commonValidations.email
]);


export const validateResetPassword = validate([
    param("resetToken")
        .notEmpty()
        .withMessage("Reset token is required"),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
        .withMessage("Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character"),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("New password & confirm password should be same");
            }
            return true;
        })
]);



// Course Validations
export const validateCreateNewCourse = validate([
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Title must be between 2 and 50 characters")
        .matches(/^[a-zA-Z0-9.,!?'"()\-:; ]{5,100}$/)
        .withMessage("Title can only contain alphanumeric characters, punctuation marks, and spaces"),

    body("subtitle")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Subtitle must be between 2 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage("Description must be between 2 and 1000 characters"),
        
    body("category")
        .notEmpty()
        .withMessage("Category is required"),

    body("level")
        .isIn(["beginner", "intermediate", "advanced"])
        .withMessage("Invalid level"),

    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),  
]);


export const validateCoursePublishStatus = validate([
    param("courseId")
        .notEmpty()
        .withMessage("Course ID is required")
        .isMongoId()
        .withMessage("Invalid course ID format"),
]);


export const validateUpdateCourseDetails = validate([
    param("courseId")
        .notEmpty()
        .withMessage("Course ID is required")
        .isMongoId()
        .withMessage("Invalid course ID format"),
    
    body("title")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage("Title must be between 2 and 50 characters")
        .matches(/^[a-zA-Z0-9.,!?'"()\-:; ]{5,100}$/)
        .withMessage("Title can only contain alphanumeric characters, punctuation marks, and spaces"),

    body("subtitle")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Subtitle must be between 2 and 100 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 2, max: 1000 })
        .withMessage("Description must be between 2 and 1000 characters"),
        
    body("category")
        .optional()
        .isString()
        .withMessage("Category must be a string")
        .notEmpty()
        .withMessage("Category cannot be empty"),

    body("level")
        .optional()
        .isIn(["beginner", "intermediate", "advanced"])
        .withMessage("Invalid level"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a positive number"),  
]);


export const validateToGetPublishedCourses = validate([
    commonValidations.pagination
]);


export const validateToGetCourseDetails = validate([
    commonValidations.objectId("courseId")
])


export const validateToGetCourseEnrolledStudents = validate([
    commonValidations.objectId("courseId")
])


export const validateGetCoursesByInstructor = validate([
    commonValidations.objectId("instructorId")
])



// Lecturer Validations
export const validateCreateLectureInput = validate([
    commonValidations.objectId("courseId"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Title must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9.,!?'"()\-:; ]{5,100}$/)
        .withMessage("Title can only contain alphanumeric characters, punctuation marks, and spaces"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ min: 2, max: 500 })
        .withMessage("Description must be between 2 and 500 characters"),
    
    body("isPreview")
        .optional()
        .isBoolean()
        .withMessage("isPreview must be a boolean value"),

    body("order")
        .optional()
        .isInt()
        .withMessage("Order must be an integer")
])


export const validateGetCourseLecturesParams = validate([
    commonValidations.objectId("courseId")
])


export const validateLectureParam = validate([
    commonValidations.objectId("courseId"),
    commonValidations.objectId("lectureId")
])


export const validateUpdateLectureInput = validate([
    commonValidations.objectId("courseId"),
    commonValidations.objectId("lectureId"),

    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Title is required")
        .isLength({ min: 2, max: 100 })
        .withMessage("Title must be between 2 and 100 characters")
        .matches(/^[a-zA-Z0-9.,!?'"()\-:; ]{5,100}$/)
        .withMessage("Title can only contain alphanumeric characters, punctuation marks, and spaces"),
    
    body("description")
        .optional()
        .trim()
        .isLength({ min: 2, max: 500 })
        .withMessage("Description must be between 2 and 500 characters"),
    
    body("order")
        .optional()
        .isInt()
        .withMessage("Order must be an integer"),
])



// Review Validations 
export const validateCreateReviewInput = validate([
    commonValidations.objectId("courseId"),

    body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("comment")
        .optional()
        .trim()
        .isLength({ min: 2, max: 500 })
        .withMessage("Comment must be between 2 and 500 characters")
])


export const validateCourseReviewsQuery = validate([
    commonValidations.objectId("courseId"),
    commonValidations.pagination 
])


export const validateUserReviewsQuery = validate([
    commonValidations.objectId("userId"),
    commonValidations.pagination 
])


export const validateReviewUpdateInput = validate([
    commonValidations.objectId("reviewId"),
    
    body("rating")
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),

    body("comment")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Comment must be at most 500 characters")
])


export const validateAverageRatingQuery = validate([
    commonValidations.objectId("courseId")
])


export const validateReviewDeletion = validate([
    commonValidations.objectId("reviewId")
])



// Payment (stripe) Validations
export const validateCreatePaymentIntent = validate([
    body("courseId")
        .isMongoId()
        .withMessage(`Invalid courseId ID format`),
])


export const validateCoursePurchaseStatus = validate([
    commonValidations.objectId("courseId")
])



// Payment (razorpay) Validations
export const validateRazorpayPaymentOrder = validate([
    body("courseId")
        .isMongoId()
        .withMessage(`Invalid courseId ID format`),
])


export const validateRazorpaySignature = validate([
    body("razorpay_order_id")
        .isString()
        .withMessage("Razorpay order ID is required"),

    body("razorpay_payment_id")
        .isString()
        .withMessage("Razorpay payment id is required"),

    body("razorpay_signature")
        .isString()
        .withMessage("Razorpay signature is required"),
])


export const validateRazorpayRefundRequest = validate([
    body("purchaseId")
        .isMongoId()
        .withMessage(`Invalid purchaseId ID format`),

    body("refundReason")
        .isString()
        .withMessage("Refund reason is required")
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage("Comment must be between 2 and 100 characters"),
])
