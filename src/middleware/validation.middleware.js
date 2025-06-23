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



// User validation chains
export const validateSignup = validate([
    commonValidations.name,
    commonValidations.email,
    commonValidations.password
]);

