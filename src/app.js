import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import { safeSanitize, xssSanitize} from "./middleware/sanitize.middleware.js"
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";

// import routes
import mediaRoute from "./routes/media.route.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import reviewRoute from "./routes/review.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import razorpayRoute from "./routes/razorpay.route.js";
import healthRoute from "./routes/health.route.js";





const app = express();



const windowMinutes = Number(process.env.RATE_LIMIT_WINDOW) || 15;
const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 100;

// Global rate limiter
const limiter = rateLimit({
	windowMs: windowMinutes * 60 * 1000, // 15 * 60 * 1000 = 15 minutes
	limit: maxRequests, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    message: "Too many requests from this IP, please try again later"
})



// Security middleware
app.use(helmet());
app.use(safeSanitize);
app.use(hpp());
app.use(xssSanitize);
app.use("/api", limiter); // Apply rate limiter to all API requests


// logging middleware (development mode)
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}


// Body parser middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());


// CORS middleware configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
        allowedHeaders: [
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "device-remember-token",
            "Access-Control-Allow-Origin",
            "Origin",
            "Accept",
        ],
    })
);





// use routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/review", reviewRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/razorpay", razorpayRoute);
app.use("/health", healthRoute);





// 404 error handler
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route Not Found"
    })
})


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.statusCode ||  500).json({
        status: "error",
        message: err.message || "Internal Server Error",
        errors: err.errors || [],
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
    
});





export { app };