import mongoose from "mongoose";



const courseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Course title is required"],
            trim: true,
            maxLength: [50, "Course title cannot exceed 50 characters"]
        },
        subtitle: {
            type: String,
            trim: true,
            maxLength: [100, "Course subtitle cannot exceed 200 characters"]
        },
        description: {
            type: String,
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Course category is required"],
            trim: true,
        },
        level: {
            type: String,
            enum: {
                values: ["beginner", "intermediate", "advanced"],
                message: "Please select a valid course level"
            },
            default: "beginner"
        },
        price: {
            type: Number,
            required: [true, "Course price is required"],
            min: [0, "Course price must be a non-negative number"]
        },
        thumbnail:{
            type: String,
            required:[true, "Course thumbnail is required"]
        },
        thumbnailPublicId: {
            type: String,
            required: [true, "Public id is required for video management"]
        },
        enrolledStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        lectures: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Lecture"
            }
        ],
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Course instructor is required"]
        },
        isPublished: {
            type: Boolean,
            default: false
        },
        totalLectures: {
            type: Number,
            default: 0
        },
        totalDuration: {
            type: Number,
            default: 0
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        numOfRatings: {
            type: Number,
            default: 0
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)


courseSchema.pre("save", function(next) {

    if (this.lectures) {
        this.totalLectures = this.lectures.length;
    }

    next();
});


courseSchema.methods.addLectureAndTotalDuration = async function (lectureId, duration) {
    
    if (!mongoose.Types.ObjectId.isValid(lectureId)) {
        throw new Error("Invalid lecture ID");
    }

    this.lectures.push(lectureId);
    this.totalDuration += duration || 0;
    if (this.lectures) {
        this.totalLectures = this.lectures.length;
    }

    return this.save();
}


courseSchema.methods.isStudentEnrolled = function (userId) {
    return this.enrolledStudents.some(studentId =>
        studentId.toString() === userId.toString()
    );
};



export const Course = mongoose.model("Course", courseSchema)