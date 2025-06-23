// Custom error class
export class AppError extends Error {
    constructor(
        message = "Something went wrong", 
        statusCode = 500,
        errors = [], // for field-level errors
        stack = null,
    ) {
        super(message);

        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        this.success = false;
        this.data = null;

        
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}


// Error handler for async functions
export const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};



// Handle JWT errors
export const handleJWTError = () => 
    new AppError("Invalid token. Please log in again!", 401);

export const handleJWTExpiredError = () => 
    new AppError("Your token has expired! Please log in again.", 401);
