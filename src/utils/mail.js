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