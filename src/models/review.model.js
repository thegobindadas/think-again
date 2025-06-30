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
                    totalReviews: { $sum: 1 }
                }
            }
        ]);
    
    
        const averageRating = result.length > 0 ? parseFloat(result[0].averageRating.toFixed(1)) : 0
        const totalReviews = result.length > 0 ? result[0].totalReviews : 0


        await mongoose.model("Course").findByIdAndUpdate(courseId, {
            averageRating,
            totalReviews
        });

    } catch (error) {
        console.error("Error updating course rating stats: ", error);
        throw new Error("Failed to update course rating stats");
    }
};


reviewSchema.post("save", async function () {
    try {
        await this.constructor.calculateAverageRating(this.course);
    } catch (error) {
        console.error("Error in review post-save middleware:", error);
    }
});


reviewSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        try {
            await doc.constructor.calculateAverageRating(doc.course);
        } catch (error) {
            console.error("Error in review post-delete middleware:", error);
        }
    }
});


reviewSchema.post("findOneAndUpdate", async function (doc) {
    if (doc) {
        try {
            await doc.constructor.calculateAverageRating(doc.course);
        } catch (error) {
            console.error("Error in review post-update middleware:", error);
        }
    }
});

reviewSchema.post("remove", async function () {
    try {
        await this.constructor.calculateAverageRating(this.course);
    } catch (error) {
        console.error("Error in review post-remove middleware:", error);
    }
});



export const Review = mongoose.model("Review", reviewSchema)