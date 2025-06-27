import { Router } from "express";
import {
    createUserAccount,
    authenticateUser,
    signOutUser,
    verifyEmail,
    resendEmailVerification,
    getCurrentUserProfile,
    updateUserProfile,
    changeUserPassword,
    forgotPassword,
    resetPassword,
    deleteUserAccount
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { 
    validateSignup, 
    validateSignin,
    validateEmailVerification,
    validatePasswordChange,
    validateForgotPassword,
    validateResetPassword,
} from "../middleware/validation.middleware.js";
import upload from "../utils/multer.js";



const router = Router();



// Auth routes
router.route("/signup").post(validateSignup, createUserAccount);
router.route("/signin").post(validateSignin, authenticateUser);
router.route("/signout").post(signOutUser);


// Email verification
router.route("/verify-email/:verificationToken").get(validateEmailVerification, verifyEmail);
router.route("/resend-email-verification").post(isAuthenticated, resendEmailVerification);


// Profile routes
router.route("/profile").get(isAuthenticated, getCurrentUserProfile);
router.route("/profile").patch( 
    isAuthenticated,
    upload.single("avatar"),
    updateUserProfile
);


// Password management
router.route("/change-password").patch(
    isAuthenticated,
    validatePasswordChange,
    changeUserPassword
);


// Account management
router.route("/forgot-password").post(validateForgotPassword, forgotPassword);
router.route("/reset-password/:resetToken").post(validateResetPassword, resetPassword);


// Account management
router.route("/account").delete(isAuthenticated, deleteUserAccount);





export default router;