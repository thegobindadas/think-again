import { Router } from "express";
import {
  createRazorpayOrder,
  verifyPayment,
  refundPayment,
} from "../controllers/razorpay.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";



const router = Router();





router.route("/create-order").post(isAuthenticated, createRazorpayOrder);

router.route("/verify-payment").post(isAuthenticated, verifyPayment);

router.route("/refund-payment").post(isAuthenticated, refundPayment);





export default router;