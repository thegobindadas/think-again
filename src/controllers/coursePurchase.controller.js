import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



/**
 * Create a Stripe checkout session for course purchase
 * @route POST /api/v1/payments/create-checkout-session
 */
export const initiateStripeCheckout = catchAsync(async (req, res) => {
  
  const { courseId } = req.body;

  // Find course and validate
  const course = await Course.findById(courseId);

  if (!course) {
    throw new AppError("Course not found", 404);
  }


  // Create a new course purchase record
  const newPurchase = new CoursePurchase({
    course: courseId,
    user: req.id,
    amount: course.price,
    currency: "INR",
    status: "pending",
    paymentMethod: "stripe",
  });


  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: course.title,
            images: [],
          },
          unit_amount: course.price * 100, // Amount in paise
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/course-progress/${courseId}`,
    cancel_url: `${process.env.CLIENT_URL}/course-detail/${courseId}`,
    metadata: {
      courseId: courseId,
      userId: req.id,
    },
    shipping_address_collection: {
      allowed_countries: ["IN"],
    },
  });

  if (!session.url) {
    throw new AppError("Failed to create checkout session", 400);
  }


  // Save purchase record with session ID
  newPurchase.paymentId = session.id;
  await newPurchase.save();



  res.status(200).json({
    data: {
      checkoutUrl: session.url,
    },
    message: "Checkout session created successfully",
    success: true,
  });
});


/**
 * Handle Stripe webhook events
 * @route POST /api/v1/payments/webhook
 */



/**
 * Get course details with purchase status
 * @route GET /api/v1/payments/courses/:courseId/purchase-status
 */
export const getCoursePurchaseStatus = catchAsync(async (req, res) => {
  // TODO: Implement get course purchase status functionality
});

/**
 * Get all purchased courses
 * @route GET /api/v1/payments/purchased-courses
 */
export const getPurchasedCourses = catchAsync(async (req, res) => {
  // TODO: Implement get purchased courses functionality
});
