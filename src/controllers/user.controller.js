import { catchAsync } from "../middleware/error.middleware.js";
import { AppError } from "../middleware/error.middleware.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/generateToken.js";
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from "../utils/cloudinary.js";
import { 
  sendEmail, 
  forgotPasswordMailgenContent, 
  passwordResetConfirmationMailgenContent, 
  verifyEmailMailgenContent,
  emailVerificationSuccessMailgenContent,
} from "../utils/mail.js";
import crypto from "crypto";



/**
 * Create a new user account
 * @route POST /api/v1/user/signup
 */
export const createUserAccount = catchAsync(async (req, res) => {

  const { name, email, password, role="student" } = req.body;


  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    throw new AppError("User already exists", 400);
  }


  const user = await User.create({ 
    name, 
    email: email.toLowerCase(), 
    password, 
    role
  });

  if (!user) {
    throw new AppError("Failed to register user. Please try again later", 500);
  }


  const verificationToken = await user.getEmailVerificationToken();

  await user.updateLastActiveAt();

  await user.save({ validateBeforeSave: false });


  const verificationUrl =  `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${verificationToken}`

  try {
    
    await sendEmail({
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: verifyEmailMailgenContent(user.name, verificationUrl),
    });


    const createdUser = await User.findById(user._id)

    generateToken(res, createdUser, "Users registered successfully and verification email has been sent on your email.");

  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(error.message || "Failed to send verification email. Please try again later", 500);
  }
});


/**
 * Authenticate user and get token
 * @route POST /api/v1/user/signin
 */
export const authenticateUser = catchAsync(async (req, res) => {

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new AppError("User not found", 404);
  }


  const isPasswordCorrect =   await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new AppError("Invalid password", 401);
  }


  await user.updateLastActiveAt();

  generateToken(res, user, "User logged in successfully");

});


/**
 * Sign out user and clear cookie
 * @route POST /api/v1/user/signout
 */
export const signOutUser = catchAsync(async (_, res) => {
  
  res.cookie("token", "", 
    {
      maxAge: 0,
    }
  )



  return res.status(200).json({
    message: "User signed out successfully",
    success: true,
  });
});


/**
 * Verify user email
 * @route POST /api/v1/user/verify-email/:verificationToken
 */
export const verifyEmail = catchAsync(async (req, res) => {

  const { verificationToken } = req.params;

  const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex");


  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token is invalid or expired", 489)
  }


  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });


  // send email to user that email has been verified
  await sendEmail({
    email: user?.email,
    subject: "Email verification successful",
    mailgenContent: emailVerificationSuccessMailgenContent(user.name),
  });

  

  return res.status(200).json({
    message: "Email verified successfully",
    success: true
  })

});


/**
 * Resend verify user email
 * @route POST /api/v1/user/resend-email-verification
 */
export const resendEmailVerification = catchAsync(async (req, res) => {

  const user = await User.findById(req.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.isEmailVerified) {
    throw new AppError("Email is already verified. You can login now", 400);
  }


  const verificationToken = await user.getEmailVerificationToken()

  await user.save({ validateBeforeSave: false });


  const verificationUrl =  `${req.protocol}://${req.get("host")}/api/v1/user/verify-email/${verificationToken}`

  try {
    
    await sendEmail({
      email: user?.email,
      subject: "Please verify your email",
      mailgenContent: verifyEmailMailgenContent(user.name, verificationUrl),
    });


    
    return res.status(200).json({
      message: "Verification mail has been sent on your mail id",
      success: true
    })

  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(error.message || "Failed to send verification email. Please try again later", 500);
  }
});


/**
 * Get current user profile
 * @route GET /api/v1/user/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  
  const user = await User.findById(req.id).populate({
    path: "enrolledCourses.course",
    select: "title description price thumbnail"
  })

  if (!user) {
    throw new AppError("User not found", 404);
  }


  
  return res.status(200).json({
    data: {
      ...user.toJSON(),
      totalEnrolledCourses: user.totalEnrolledCourses
    },
    message: "User profile fetched successfully",
    success: true,
  });
});


/**
 * Update user profile
 * @route PATCH /api/v1/user/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  
  const { name, bio } = req.body
  const updatedData = { bio }

  if (name) {
    updatedData.name = name
  }


  const user = await User.findById(req.id);

  if (!user) {
    throw new AppError("User not found", 404);
  }


  if (req.file) {
    const uploadResponse = await uploadMediaToCloudinary(req.file.path);

    if (!uploadResponse) {
      throw new AppError("Failed to upload profile picture", 500);
    }

    updatedData.avatar = uploadResponse.secure_url;
    updatedData.avatarPublicId = uploadResponse.public_id;


    if (user.avatar && user.avatar !== "default-avatar.png" ) {
      await deleteMediaFromCloudinary(user.avatarPublicId)
    }
  }


  const updatedUser = await User.findByIdAndUpdate(
    req.id,
    updatedData,
    { 
      new: true, 
      runValidators: true
    }
  )

  if (!updatedUser) {
    throw new AppError("Failed to update user profile", 500);
  }



  return res.status(200).json({
    data: updatedUser,
    message: "Profile updated successfully",
    success: true,
  });

});


/**
 * Change user password
 * @route PATCH /api/v1/user/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {

  const userId = req.id
  const { currentPassword, newPassword, confirmPassword } = req.body


  const user = await User.findById(userId).select("+password")

  if (!user) {
    throw new AppError("User not found", 404);
  }


  const isPasswordCorrect = await user.comparePassword(currentPassword)

  if (!isPasswordCorrect) {
    throw new AppError("Current password is incorrect", 401);
  }


  if (newPassword !== confirmPassword) {
    throw new AppError("New password and confirm password should be same", 400);
  }


  user.password = newPassword
  await user.save()



  return res.status(200).json({
    message: "Password changed successfully",
    success: true,
  });
});


/**
 * Request password reset
 * @route POST /api/v1/user/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {

  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() })

  if (!user) {
    throw new AppError("User not found, Please provide a valid email address.", 404);
  }


  const resetToken = await user.getResetPasswordToken()

  await user.save({ validateBeforeSave: false })



  const resetPasswordUrl = `${process.env.FORGOT_PASSWORD_REDIRECT_URL}?token=${resetToken}`

  try {
    await sendEmail({
      email: user?.email,
      subject: "Password reset request",
      mailgenContent: forgotPasswordMailgenContent(user.name, resetPasswordUrl),
    });
 
 
    return res.status(200).json({
      message: "Password reset mail has been sent on your mail id",
      success: true
    })

  } catch (error) {

    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError("Failed to send email. Try again later.", 500);
  }
});


/**
 * Reset password
 * @route POST /api/v1/user/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {

  const { resetToken } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    throw new AppError("New password and confirm password should be same", 400);
  }


  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");


  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError("Token is invalid or expired", 489)
  }


  user.resetPasswordToken = undefined;
  user.resetPasswordExpiry = undefined;

  user.password = newPassword;
  await user.save();


  await sendEmail({
    email: user?.email,
    subject: "Password reset successful",
    mailgenContent: passwordResetConfirmationMailgenContent(user.name, Date.now()),
  });



  return res.status(200).json({
    message: "Password reset successfully",
    success: true
  })

});


/**
 * Delete user account
 * @route DELETE /api/v1/user/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
 
  const user = await User.findById(req.id)

  if (!user) {
    throw new AppError("User not found", 404);
  }

  
  if (user.avatar && user.avatar !== "default-avatar.png" ) {
    await deleteMediaFromCloudinary(user.avatarPublicId)
  }


  const deleteUser = await user.deleteOne();

  if (!deleteUser.acknowledged || deleteUser.deletedCount === 0) {
    throw new AppError("Failed to delete user account", 500);
  }
 


  return res.status(200).json({
    message: "User account deleted successfully",
    success: true
  })
});