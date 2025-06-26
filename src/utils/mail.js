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
