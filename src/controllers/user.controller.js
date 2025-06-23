import { catchAsync } from "../middleware/error.middleware";
import { AppError } from "../middleware/error.middleware";
import { User } from "../models/user.model";
import { generateToken } from "../utils/generateToken";



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
  // TODO: Implement sign out functionality
});

/**
 * Get current user profile
 * @route GET /api/v1/users/profile
 */
export const getCurrentUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement get current user profile functionality
});

/**
 * Update user profile
 * @route PATCH /api/v1/users/profile
 */
export const updateUserProfile = catchAsync(async (req, res) => {
  // TODO: Implement update user profile functionality
});

/**
 * Change user password
 * @route PATCH /api/v1/users/password
 */
export const changeUserPassword = catchAsync(async (req, res) => {
  // TODO: Implement change user password functionality
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