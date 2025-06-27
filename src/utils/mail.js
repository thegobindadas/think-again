import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { AppError } from "../middleware/error.middleware.js";



export const sendEmail = async (options) => {
    try {

        if (!options?.email || !options?.subject || !options?.mailgenContent) {
            throw new AppError("Missing required email options", 400);
        }


        const mailGenerator = new Mailgen({
            theme: "default",
            product: {
                name: "ThinkAgain",
                link: "https://thinkagain.app",
                copyright: "© 2025 ThinkAgain",
            },
        });

    
        const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
        const emailHtml = mailGenerator.generate(options.mailgenContent);


        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_MAIL_HOST,
            port: process.env.SMTP_MAIL_PORT,
            auth: {
                user: process.env.SMTP_MAIL_USERNAME,
                pass: process.env.SMTP_MAIL_PASSWORD,
            },
        });

        const mail = {
            from: "ThinkAgain <mail.thinkagain@gmail.com>",
            to: options.email,
            subject: options.subject,
            text: emailTextual,
            html: emailHtml,
        };



        await transporter.sendMail(mail);

    } catch (error) {
        throw new AppError(error?.message || "Failed to send reset-password link", 500)
    }
}



export const forgotPasswordMailgenContent = (name, passwordResetUrl, options = {}) => {
    // Extract optional parameters with defaults
    const {
        brandName = "ThinkAgain",
        supportEmail = "support@thinkagain.app",
        helpCenterUrl = "https://help.thinkagain.app",
        securityEmail = "security@thinkagain.app",
        dashboardUrl = "https://thinkagain.app/dashboard",
        expirationMinutes = 15,
        userAgent = null,
        requestTime = new Date().toLocaleString("en-US", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        })
    } = options;


    return {
        body: {
            name: name,
            intro: `We received a secure request to reset the password for your ${brandName} learning account. Your educational journey is important to us, and we're here to help you regain access quickly and safely.`,
            
            action: {
                instructions: `To create a new password and continue your learning experience, click the secure button below. This verification link is valid for ${expirationMinutes} minutes and can only be used once:`,
                button: {
                    color: "#6366F1", // Modern indigo - professional, trustworthy, and accessible
                    text: "Reset Password Securely",
                    link: passwordResetUrl,
                },
            },

            table: {
                data: [
                    {
                        item: "🔐 Security Level:",
                        description: "Enterprise-grade encryption applied"
                    },
                    {
                        item: "⏰ Link Expires:",
                        description: `${expirationMinutes} minutes from request time`
                    },
                    {
                        item: "📅 Request Time:",
                        description: requestTime
                    },
                    {
                        item: "🛡️ Account Status:",
                        description: "Remains secure until password is reset"
                    },
                    {
                        item: "📚 Course Access:",
                        description: "All learning progress and certificates preserved"
                    }
                ],
                columns: {
                    customWidth: {
                        item: "35%",
                        description: "65%"
                    },
                    // Add custom styling for enterprise look
                    customStyle: {
                        item: "font-weight: 600; color: #374151;",
                        description: "color: #6B7280;"
                    }
                }
            },

            // Alternative access method
            dictionary: {
                "Alternative Access": "If the button doesn't work, copy and paste this secure link into your browser:",
                "Reset Link": passwordResetUrl,
                "Link Format": "This link is uniquely generated for your account and cannot be shared"
            },

            outro: [
                `🚨 **Security Alert**: If you didn't request this password reset, your account remains secure. However, please contact our security team at ${securityEmail} immediately to report this incident.`,
                
                `🔒 **Privacy Commitment**: ${brandName} will never ask for your password, payment information, or personal details via email. This reset link is the only secure method we use.`,
                
                `💡 **Security Best Practices**: After resetting your password, we recommend:
                • Enable two-factor authentication in your account settings
                • Use a unique, strong password with mixed characters
                • Avoid using the same password across multiple platforms`,
                
                `📞 **Need Immediate Help?** Our learner success team is available 24/7:
                • Email: ${supportEmail}
                • Help Center: ${helpCenterUrl}
                • Emergency Security: ${securityEmail}`,
                
                `🎓 **Continue Learning**: Once your password is reset, access your dashboard at ${dashboardUrl} to continue your educational journey where you left off.`
            ],

            signature: `Empowering Your Learning Journey,<br/>The ${brandName} Security & Support Team`,

            // Call-to-action for post-reset
            goToAction: {
                text: "Visit Learning Dashboard",
                link: dashboardUrl,
                description: "Access your courses, track progress, and manage your learning path"
            }
        }
    };
};


export const passwordResetConfirmationMailgenContent = (name, resetTimestamp, userAgent, ipAddress) => {

    const resetDate = new Date(resetTimestamp).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });

    return {
        body: {
            name: name,
            intro: "Your password has been successfully reset! Your learning account is now secure with your new password.",
            table: {
                data: [
                    {
                        item: "✅ Password Reset:",
                        description: "Completed successfully"
                    },
                    {
                        item: "📅 Date & Time:",
                        description: resetDate
                    },
                    {
                        item: "🌐 Device Info:",
                        description: userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" || "Not available"
                    },
                    {
                        item: "📍 Location:",
                        description: ipAddress ? `IP: ${ipAddress}` : "Secure connection verified"
                    }
                ],
                columns: {
                    customWidth: {
                        item: "30%",
                        description: "70%"
                    }
                }
            },
            action: {
                instructions: "Ready to continue your learning journey? Access your dashboard now:",
                button: {
                    color: "#10B981", // Success green color
                    text: "Go to Learning Dashboard",
                    link: "https://thinkagain.app/dashboard",
                },
            },
            outro: [
                "🔐 **Security Reminder**: Your old password is no longer valid. Keep your new password secure and don't share it with anyone.",
                "🚨 **Didn't make this change?** If you didn't reset your password, please contact our security team immediately at security@yourlms.com",
                "💡 **Stay Secure**: Consider enabling two-factor authentication in your account settings for enhanced protection.",
                "📚 **What's Next?** All your courses, progress, and certificates remain intact. Continue learning where you left off!"
            ],
            signature: "Welcome back to your learning journey!"
        }
    };
};


export const verifyEmailMailgenContent = (name, verificationUrl, options = {}) => {
    // Extract optional parameters with modern defaults
    const {
        brandName = "ThinkAgain",
        brandColor = "#6366F1", // Modern indigo
        accentColor = "#EC4899", // Modern pink accent
        supportEmail = "support@thinkagain.app",
        dashboardUrl = "https://thinkagain.app/dashboard",
        courseCatalogUrl = "https://thinkagain.app/courses",
        mobileAppUrl = "https://thinkagain.app/mobile",
        socialLinks = {
            twitter: "https://twitter.com/thinkagain",
            linkedin: "https://linkedin.com/company/thinkagain",
            instagram: "https://instagram.com/thinkagain"
        },
        welcomeBonus = "7-day free premium trial",
        featuredCourses = [
            "AI & Machine Learning Fundamentals",
            "Modern Web Development",
            "Data Science Essentials"
        ],
        communitySize = "50,000+",
        verificationExpiryHours = 24
    } = options;

    return {
        body: {
            name: name,
            intro: `🎉 Welcome to ${brandName}, ${name}! You're just one click away from joining ${communitySize} learners worldwide. Let's verify your email and unlock your learning potential.`,
            
            action: {
                instructions: `Ready to start your learning journey? Click the button below to verify your email address and activate your account. Your verification link expires in ${verificationExpiryHours} hours:`,
                button: {
                    color: brandColor,
                    text: "✨ Verify Email & Start Learning",
                    link: verificationUrl,
                },
            },

            // Modern hero section with benefits
            table: {
                data: [
                    {
                        item: "🚀 Instant Access:",
                        description: `Unlock ${welcomeBonus} immediately after verification`
                    },
                    {
                        item: "📱 Multi-Device:",
                        description: "Learn seamlessly across web, mobile, and tablet"
                    },
                    {
                        item: "🎓 Course Library:",
                        description: "Access to 1000+ courses in tech, business, and creative skills"
                    },
                    {
                        item: "🏆 Certification:",
                        description: "Earn industry-recognized certificates upon completion"
                    },
                    {
                        item: "👥 Community:",
                        description: `Join ${communitySize} active learners and mentors`
                    },
                    {
                        item: "💡 AI-Powered:",
                        description: "Personalized learning paths based on your goals"
                    }
                ],
                columns: {
                    customWidth: {
                        item: "30%",
                        description: "70%"
                    },
                    customStyle: {
                        item: "font-weight: 700; color: #1F2937; font-size: 14px;",
                        description: "color: #4B5563; font-size: 14px; line-height: 1.5;"
                    }
                }
            },

            // Featured content section
            dictionary: {
                "🔥 Trending Now": "Most popular courses this week:",
                "Course 1": featuredCourses[0] || "Advanced JavaScript",
                "Course 2": featuredCourses[1] || "UI/UX Design Mastery",
                "Course 3": featuredCourses[2] || "Digital Marketing Strategy",
                "Quick Start": `Can't wait to begin? Copy this link: ${verificationUrl}`,
                "Mobile Ready": `Download our app for learning on-the-go: ${mobileAppUrl}`
            },

            outro: [
                `🎯 **What's Next?** After verification, you'll get:
                • Instant access to your personalized dashboard
                • ${welcomeBonus} to explore premium features
                • AI-curated course recommendations based on your interests
                • Welcome email with your learning roadmap`,
                
                `📱 **Learn Everywhere**: Download our mobile app and learn during your commute, lunch breaks, or anywhere inspiration strikes. Sync progress across all devices automatically.`,
                
                `🤝 **Join the Community**: Connect with fellow learners, participate in discussions, and get help from our community of experts and mentors.`,
                
                `⚡ **Pro Tip**: Complete your profile after verification to unlock personalized course recommendations and connect with learners who share your interests.`,
                
                `🛡️ **Secure & Private**: Your data is protected with enterprise-grade security. We'll never share your information or spam you with irrelevant content.`,
                
                `💬 **Need Help?** Our friendly support team at ${supportEmail} is here 24/7. We typically respond within 2 hours!`
            ],

            signature: `Ready to transform your skills? Let's learn together! 🚀<br/>The ${brandName} Welcome Team`,

            // Multiple call-to-actions for engagement
            goToAction: {
                text: "🎯 Explore Course Catalog",
                link: courseCatalogUrl,
                description: "Browse 1000+ courses across technology, business, and creative skills"
            }
        }
    };
};


export const emailVerificationSuccessMailgenContent = (name, options = {}) => {
    // Extract optional parameters with defaults
    const {
        brandName = "ThinkAgain",
        supportEmail = "support@thinkagain.app",
        helpCenterUrl = "https://help.thinkagain.app",
        dashboardUrl = "https://thinkagain.app/dashboard",
        coursesUrl = "https://thinkagain.app/courses",
        profileUrl = "https://thinkagain.app/profile",
        communityUrl = "https://thinkagain.app/community",
        accountTier = "Free",
        welcomeBonus = null,
        verificationTime = new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        }),
        isNewUser = true
    } = options;

    const welcomeMessage = isNewUser ? 
        `Welcome to ${brandName}! 🎉 Your email has been successfully verified and your learning account is now fully activated. You're all set to begin your educational journey with us.` :
        `Great news! Your email verification for ${brandName} has been completed successfully. Your account security has been enhanced and you now have full access to all features.`;

    const nextStepsTitle = isNewUser ? "Start Your Learning Journey" : "Enhanced Account Access";

    return {
        body: {
            name: name,
            intro: welcomeMessage,
            
            action: {
                instructions: isNewUser ? 
                    "Ready to explore thousands of courses and start learning? Click below to access your personalized dashboard:" :
                    "Your account is now fully verified. Access your enhanced dashboard with all premium features:",
                button: {
                    color: "#10B981", // Success green - modern and positive
                    text: isNewUser ? "Start Learning Now" : "Access Dashboard",
                    link: dashboardUrl,
                },
            },

            table: {
                data: [
                    {
                        item: "✅ Verification Status:",
                        description: "Successfully completed"
                    },
                    {
                        item: "📅 Verified On:",
                        description: verificationTime
                    },
                    {
                        item: "🔐 Account Security:",
                        description: "Enhanced with verified email protection"
                    },
                    {
                        item: "🎯 Account Level:",
                        description: `${accountTier} Account - Full Access Granted`
                    },
                    {
                        item: "📚 Learning Access:",
                        description: isNewUser ? "Unlimited course browsing and enrollment" : "All courses and premium features unlocked"
                    },
                    ...(welcomeBonus ? [{
                        item: "🎁 Welcome Bonus:",
                        description: welcomeBonus
                    }] : [])
                ],
                columns: {
                    customWidth: {
                        item: "35%",
                        description: "65%"
                    },
                    customStyle: {
                        item: "font-weight: 600; color: #065F46;",
                        description: "color: #047857;"
                    }
                }
            },

            // Quick access links
            dictionary: {
                [nextStepsTitle]: "Here's what you can do next:",
                "Browse Courses": `Explore our course catalog: ${coursesUrl}`,
                "Complete Profile": `Add your details and preferences: ${profileUrl}`,
                "Join Community": `Connect with fellow learners: ${communityUrl}`,
                "Mobile Access": "Download our mobile app for learning on-the-go"
            },

            outro: [
                `🌟 **Welcome to the Community**: You're now part of a global learning community. ${isNewUser ? 'As a new member, you have access to our beginner-friendly courses and learning paths.' : 'Your verified status gives you access to exclusive content and community features.'}`,
                
                `🎓 **Learning Tips for Success**:
                • Set learning goals and track your progress
                • Join course discussions and connect with peers  
                • Take advantage of our mobile app for flexible learning
                • Complete your profile to get personalized course recommendations`,
                
                `🔔 **Stay Updated**: With your verified email, you'll receive:
                • Course completion certificates
                • New course announcements in your areas of interest
                • Learning streak notifications and achievements
                • Important account and security updates`,
                
                `💪 **Need Help Getting Started?** Our learner success team is here to help:
                • Email: ${supportEmail}
                • Help Center: ${helpCenterUrl}
                • Live Chat: Available 24/7 in your dashboard`,
                
                `🚀 **Pro Tip**: Complete your profile setup within the next 7 days to unlock personalized course recommendations based on your interests and career goals.`
            ],

            signature: `Welcome to Your Learning Adventure,<br/>The ${brandName} Success Team`,

            goToAction: {
                text: "Explore Course Library",
                link: coursesUrl,
                description: "Discover courses tailored to your interests and career goals"
            }
        }
    };
};