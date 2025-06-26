import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { AppError } from "../middleware/error.middleware";



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



        const sendEM = await transporter.sendMail(mail);
        console.log(sendEM)

    } catch (error) {
        throw new AppError(error?.message || "Failed to send reset-password link", 500)
    }
}


export const forgotPasswordMailgenContent = (name, passwordResetUrl) => {
    return {
        body: {
            name: name,
            intro: "We received a request to reset your password for your learning account.",
            action: {
                instructions: "Click the button below to create a new password. This link will expire in 24 hours for security reasons:",
                button: {
                    color: "#4F46E5", // Modern indigo color - professional and trustworthy
                    text: "Reset Your Password",
                    link: passwordResetUrl,
                },
            },
            table: {
                data: [
                    {
                        item: "Reset Link Valid For:",
                        description: "24 hours from now"
                    },
                    {
                        item: "Account Security:",
                        description: "Your current password remains active until reset"
                    }
                ],
                columns: {
                    // Optionally, customize the column widths
                    customWidth: {
                        item: "30%",
                        description: "70%"
                    }
                }
            },
            outro: [
                "If you didn't request this password reset, please ignore this email or contact our support team if you have concerns about your account security.",
                "For your security, never share your login credentials with anyone. Our team will never ask for your password via email.",
                "Need help? Visit our Help Center or reply to this email - our support team is here to assist you with your learning journey."
            ],
            signature: "Happy Learning!"
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
                    link: "https://yourlms.com/dashboard",
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