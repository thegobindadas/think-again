import jwt from "jsonwebtoken";



export const generateToken = (res, user, message) => {

  const token = jwt.sign(
    { 
      userId: user._id 
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: String(process.env.JWT_EXPIRES_IN),
    }
  );



  return res
    .status(200)
    .cookie("token", token, 
      {
        httpOnly: true,
        sameSite: "strict",
        maxAge: Number(process.env.JWT_COOKIE_EXPIRES_IN) * 60 * 60 * 1000,
      }
    )
    .json(
      {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          avatarPublicId: user.avatar && user.avatar !== "default-avatar.png" ? user.avatarPublicId : undefined,
          bio: user.bio || "",
          createdCourses: user.createdCourses || [],
          enrolledCourses: user.enrolledCourses || [],
          totalEnrolledCourses: user.totalEnrolledCourses ?? 0,
          lastActiveAt: user.lastActiveAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
        message,
        success: true,
      }
    );
};