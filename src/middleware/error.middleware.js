// Custom error class
export class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
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
