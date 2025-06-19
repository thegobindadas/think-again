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
            max: [5, "Ratine cannot be more than 5"],
        },
        comment: {
            type: String,
            trim: true,
        },
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


// Static method to calculate and update average rating
reviewSchema.statics.calculateAverageRating = async function (courseId) {

    const result = await this.aggregate([
        { $match: { course: courseId } },
        {
            $group: {
                _id: "$course",
                averageRating: { $avg: "$rating" },
                numOfRatings: { $sum: 1 }
            }
        }
    ]);

    if (result.length > 0) {
        await mongoose.model("Course").findByIdAndUpdate(courseId, {
            averageRating: result[0].averageRating,
            numOfRatings: result[0].numOfRatings
        });
    } else {
        await mongoose.model("Course").findByIdAndUpdate(courseId, {
            averageRating: 0,
            numOfRatings: 0
        });
    }
};


// Recalculate after save
reviewSchema.post("save", async function () {
  await this.constructor.calculateAverageRating(this.course);
});


// Recalculate after update
reviewSchema.post("findOneAndUpdate", async function (doc) {
    if (doc) {
        await doc.constructor.calculateAverageRating(doc.course);
    }
});


// Recalculate after delete
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.course);
  }
});



export const Review = mongoose.model("Review", reviewSchema)