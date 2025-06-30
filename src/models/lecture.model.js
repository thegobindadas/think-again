import mongoose from "mongoose";



const lectureSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Lecture title is required"],
            trim: true,
            maxLength: [100, "Lecture title cannot exceed 100 characters"]
        },
        description: {
            type: String,
            trim: true,
            maxLength: [500, "Lecture description cannot exceed 500 characters"]
        },
        videoUrl: {
            type: String,
            required: [true, "Video url is required"]
        },
        videoPublicId: {
            type: String,
            required: [true, "Public id is required for video management"]
        },
        duration: {
            type: Number,
            default: 0
        },
        isPreview: {
            type: Boolean,
            default: false
        },
        order: {
            type: Number,
            required: [true, "Lecture order is required"]
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Course instructor is required"]
        },
        isPublished: {
            type: Boolean,
            default: false
        },
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

lectureSchema.index({ order: 1 });

/*
// Format duration before saving
lectureSchema.pre('save', function(next) {
    if (this.duration) {
        // Round duration to 2 decimal places
        this.duration = Math.round(this.duration * 100) / 100;
    }
    next();
});
*/



export const Lecture = mongoose.model("Lecture", lectureSchema)