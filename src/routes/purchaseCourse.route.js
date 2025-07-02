import { Router } from "express";
import {
  getCoursePurchaseStatus,
  getPurchasedCourses,
  handleStripeWebhook,
  initiateStripeCheckout,
} from "../controllers/coursePurchase.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { 
    validateCreatePaymentIntent, 
    validateCoursePurchaseStatus
} from "../middleware/validation.middleware.js";



const router = Router();





router
  .route("/checkout/create-checkout-session")
  .post(isAuthenticated, validateCreatePaymentIntent, initiateStripeCheckout);

router
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), handleStripeWebhook);

router
  .route("/course/:courseId/detail-with-status")
  .get(isAuthenticated, validateCoursePurchaseStatus, getCoursePurchaseStatus);

router.route("/purchased-courses").get(isAuthenticated, getPurchasedCourses);










export default router;