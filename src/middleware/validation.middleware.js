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

