import { Router } from "express";
import {
    authenticateUser,
    changeUserPassword,
    createUserAccount,
    deleteUserAccount,
    getCurrentUserProfile,
    signOutUser,
    updateUserProfile
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { validateSignup, validateSignin, validatePasswordChange } from "../middleware/validation.middleware.js";
import upload from "../utils/multer.js";



const router = Router();



// Auth routes
router.route("/signup").post(validateSignup, createUserAccount);
router.route("/signin").post(validateSignin, authenticateUser);
router.route("/signout").post(signOutUser);


// Profile routes
router.route("/profile").get(isAuthenticated, getCurrentUserProfile);
router.route("/profile").patch( 
    isAuthenticated,
    upload.single("avatar"),
    updateUserProfile
);


// Password management
router.patch("/change-password",
    isAuthenticated,
    validatePasswordChange,
    changeUserPassword
);






export default router;