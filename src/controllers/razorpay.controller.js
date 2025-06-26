import Razorpay from "razorpay";
import { User } from "../models/user.model.js";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { AppError } from "../middleware/error.middleware.js";
import crypto from "crypto";


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
      throw new AppError("Invalid order response from Razorpay", 500);
    }

    if (order.amount !== amountInPaise) {
      throw new AppError("Mismatch in order amount. Please try again", 400);
    }


    newPurchase.orderId = order.id
    await newPurchase.save()



    return res.status(200).json({
      order,
      course: {
        title: course.title,
        description: course.description,
      },
      message: "Order created successfully",
      success: true,
    })
    
  } catch (error) {
    throw new AppError(error?.description || "Failed to create Razorpay order", 500);
  }
};


export const verifyPayment = async (req, res) => {
  try {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing payment details", 400);
    }


    const body = razorpay_order_id + "|" + razorpay_payment_id

    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      throw new AppError("Payment verification failed", 400);
    }


    const purchase = await CoursePurchase.findOne({ orderId: razorpay_order_id })

    if (!purchase) {
      throw new AppError("Purchase record not found", 404);
    }


    const payment = await razorpay.payments.fetch(razorpay_payment_id)


    purchase.status = "completed"
    purchase.paymentMethod = payment.method;
    purchase.paymentId = razorpay_payment_id;
    await purchase.save()



    return res.status(200).json({
      purchase,
      message: "Payment verified successfully",
      success: true,
    })

  } catch (error) {
    throw new AppError(error?.description || "Failed to verify payment", 500);
  }
};


export const refundPayment = async (req, res) => {
  try {
    
    const userId = req.id;
    const { purchaseId, refundReason } = req.body;

    if (!purchaseId || !refundReason) {
      throw new AppError("Missing refund details", 400);
    }


    const purchaseDetails = await CoursePurchase.findOne({_id: purchaseId, user: userId})

    if (!purchaseDetails) {
      throw new AppError("Purchase record not found", 404);
    }

    if (purchaseDetails.status === "refunded") {
      throw new AppError("This purchase has already been refunded", 400);
    }


    const isRefundable = purchaseDetails.isRefundable

    if (!isRefundable) {
      throw new AppError("Refund is not available for this purchase", 400);
    }
    
    
    const refundAmount = purchaseDetails.amount
    const RazorpayPaymentId = purchaseDetails.paymentId

    const options = {
      "amount": Math.round(refundAmount * 100),
      "speed": "normal",
      "notes": {
        purchaseId: String(purchaseDetails._id),
        userId: String(purchaseDetails.user),
        courseId: String(purchaseDetails.course),
        reason: refundReason
      },
      "receipt": `course_${purchaseDetails.course}`
    }

    const refund = await razorpay.payments.refund(RazorpayPaymentId, options)

    if (!refund || !refund.id) {
      throw new AppError("Invalid refund response from Razorpay", 500);
    }


    await purchaseDetails.processRefund(refund.id, refundAmount, refundReason)
    await purchaseDetails.save()



    return res.status(200).json({
      data: {
        refundId: refund.id,
        refundStatus: refund.status,
        refundedAt: purchaseDetails.refundedAt,
      },
      message: "Payment refund initiated successfully",
      success: true,
    })

  } catch (error) {
    const errMsg = error?.error?.description || error?.description || error?.message || "Failed to refund payment";
    throw new AppError(errMsg, 500);
  }
};