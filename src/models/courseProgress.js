import mongoose, { Schema } from "mongoose";


const lectureProgressSchema = new Schema({
    lecture: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
        required: [true, "Lecture reference is required"],
        index: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    watchedDuration: {
        type: Number,
        default: 0
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now
    }
});


const courseProgressSchema = new Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User reference is required"],
            index: true
        },
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course reference is required"],
            index: true
        },
        isCompleted: {
            type: Boolean,
            default: false
        },
        completionPercentage: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },
        lectureProgress: [lectureProgressSchema],
        lastWatchedAt: {
            type: Date,
            default: Date.now
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);


// Calculate completion percentage before saving
courseProgressSchema.pre("save", async function(next) {

    if (this.lectureProgress.length > 0) {

        const completedLectures = this.lectureProgress.filter(lp => lp.isCompleted).length;

        this.completionPercentage = Math.round((completedLectures / this.lectureProgress.length) * 100);

        this.isCompleted = this.completionPercentage === 100;
    }

    
    next();
});


// Update last watched at
courseProgressSchema.methods.updateLastWatchedAt = function () {

    this.lastWatchedAt = Date.now();


    return this.save({ validateBeforeSave: false });
}



export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);