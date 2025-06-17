import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";





const app = express();




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




// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    res.status(err.status ||  500).json({
        status: "error",
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
    
});





// import routes





// 404 error handler
app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route Not Found"
    })
})





export { app };