import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";



const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: ["true", "Name is required"],
            trim: true,
            maxLength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Please provide a valid email address"]
        },
        password: {
            type: String,
            required: ["true", "Password is required"],
            trim: true,
            minLength: [6, "Password must be at least 6 characters long"],
            select: false,
        },
        role: {
            type: String,
            enum: {
                values: ["student", "instructor", "admin"],
                message: "Please provide a valid role"
            },
            default: "student"
        }, 
        avatar: {
            type: String,
            default: "default-avatar.png"
        },
        bio: {
            type: String,
            maxLength: [400, "Bio cannot exceed 400 characters"]
        },
        enrolledCourses: [{
            course: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Course"
            },
            enrolledAt: {
                type: Date,
                default: Date.now
            }
        }],
        createdCourses: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }],
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        lastActiveAt: {
            type: Date,
            default: Date.now
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


// Encrypt password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next()
    }

    this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_SALT_ROUNDS));
    next();
})


// Compare password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


// Generate reset password token
userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes


    return resetToken;
}


// Update last active
userSchema.methods.updateLastActiveAt = function () {
    this.lastActiveAt = Date.now();
    return this.save({ validateBeforeSave: false });
}


// Virtual fields for total enrolled courses
userSchema.virtual("totalEnrolledCourses").get(function () {
    return this.enrolledCourses.length;
})



export const User = mongoose.model("User", userSchema)