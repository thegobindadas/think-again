import Razorpay from "razorpay";
import { User } from "../models/user.model";
import { Course } from "../models/course.model";
import { CoursePurchase } from "../models/coursePurchase.model";
import { AppError } from "../middleware/error.middleware";


const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});



export const createRazorpayOrder = async (req, res) => {
  try {
    
    const userId = req.id
    const { courseId } = req.body


    const user = await User.findById(userId)

    if (!user) {
      throw new AppError("User not found", 404);
    }


    const course = await Course.findById(courseId)

    if (!course) {
      throw new AppError("Course not found", 404);
    }


    const existingPurchase = await CoursePurchase.findOne({ user: userId, course: courseId, status: "completed" });

    if (existingPurchase) {
      throw new AppError("You have already purchased this course", 400);
    }


    const newPurchase = new CoursePurchase({
      course: course._id,
      user: user._id,
      amount: course.price,
      currency: "INR",
      status: "pending"
    })


    const amountInPaise = course.price * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `course_${courseId}`,
      notes: {
        user: userId,
        course: courseId
      }
    };


    const order = await razorpay.orders.create(options);

    if (!order || !order.id) {
      throw new AppError(500, "Invalid order response from Razorpay");
    }

    if (order.amount !== amountInPaise) {
      throw new AppError("Mismatch in order amount. Please try again", 400);
    }


    newPurchase.paymentId = order.id
    await newPurchase.save()



    return res.status(200).json({
      order,
      course: {
        title: course.title,
        description: course.description,
      },
      message: "",
      success: true,
    })
    
  } catch (error) {
    throw new AppError(error?.description || "Failed to create Razorpay order", 400);
  }
};
