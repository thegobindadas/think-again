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