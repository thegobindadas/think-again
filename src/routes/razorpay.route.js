import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  refundPayment,
  getCoursePurchaseStatus,
  getPurchasedCourses,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { 
  validateRazorpayPaymentOrder,
  validateRazorpaySignature,
  validateRazorpayRefundRequest,
  validateCoursePurchaseStatus,
} from "../middleware/validation.middleware.js";



const router = Router();
router.use(isAuthenticated);





router.route("/create-order").post(validateRazorpayPaymentOrder, createRazorpayOrder);

router.route("/verify-payment").post(validateRazorpaySignature, verifyPayment);

router.route("/refund-payment").post(validateRazorpayRefundRequest, refundPayment);

router
  .route("/course/:courseId/detail-with-status")
  .get(validateCoursePurchaseStatus, getCoursePurchaseStatus);

router.route("/purchased-courses").get(getPurchasedCourses);





export default router;