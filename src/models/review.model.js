import mongoose from "mongoose";



const reviewSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: [true, "Course id is required"],
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Student id is required"],
            index: true
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot be more than 5"],
        },
        comment: {
            type: String,
            trim: true,
            maxlength: [500, "Comment cannot exceed 500 characters"]
        },
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

reviewSchema.index({ course: 1, user: 1 }, { unique: true });


// Static method to calculate and update average rating
reviewSchema.statics.calculateAverageRating = async function (courseId) {
    try {
        const result = await this.aggregate([
            { $match: { course: new mongoose.Types.ObjectId(courseId) } },
            {
                $group: {
                    _id: "$course",
                    averageRating: { $avg: "$rating" },
                    numOfRatings: { $sum: 1 }
                }
            }
        ]);
    
    
        return {
            averageRating: result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0,
            numOfRatings: result.length > 0 ? result[0].numOfRatings : 0
        }
        
    } catch (error) {
        console.error(error);
        return { averageRating: 0, numOfRatings: 0 }
    }
};



export const Review = mongoose.model("Review", reviewSchema)