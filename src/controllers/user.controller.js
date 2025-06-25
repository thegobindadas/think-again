import { catchAsync } from "../middleware/error.middleware";
import { AppError } from "../middleware/error.middleware";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";
import { uploadMediaToCloudinary, deleteMediaFromCloudinary } from "../utils/cloudinary";



/**
 * Create a new user account
 * @route POST /api/v1/users/signup
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
    throw new AppError("Failed to create user. Please try again later", 500);
  }

  await user.updateLastActiveAt();
  generateToken(res, user, "User created successfully");
});


/**
 * Authenticate user and get token
 * @route POST /api/v1/users/signin
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
 * @route POST /api/v1/users/signout
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
 * Get current user profile
 * @route GET /api/v1/users/profile
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
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  
  const { name, bio } = req.body
  const updatedData = { name, bio }


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


    let deleteResponse;
    if (user.avatar && user.avatar !== "default-avatar.png" ) {
      deleteResponse = await deleteMediaFromCloudinary(user.avatarPublicId)
    }
    
    if (deleteResponse.result !== "ok") {
      throw new AppError("Failed to delete old profile picture", 500);
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
 * @route PATCH /api/v1/users/password
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
 * @route POST /api/v1/users/forgot-password
 */
export const forgotPassword = catchAsync(async (req, res) => {
  // TODO: Implement forgot password functionality
});

/**
 * Reset password
 * @route POST /api/v1/users/reset-password/:token
 */
export const resetPassword = catchAsync(async (req, res) => {
  // TODO: Implement reset password functionality
});

/**
 * Delete user account
 * @route DELETE /api/v1/users/account
 */
export const deleteUserAccount = catchAsync(async (req, res) => {
  // TODO: Implement delete user account functionality
});