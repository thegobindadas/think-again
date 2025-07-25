# ThinkAgain LMS - Scalable Learning Management System Backend

ThinkAgain is an industrial-grade, scalable, and secure Learning Management System (LMS) backend designed to deliver robust, feature-rich online learning experiences for educators and learners alike. Built with Node.js, Express, and MongoDB, ThinkAgain enables seamless course creation, management, enrollment, and interactive learning.

---

## Features

* **User Management:** Secure registration, authentication, email verification, password reset, and profile management.
* **Course Management:** Instructors can create, update, publish, and manage their courses with multimedia support.
* **Lecture Management:** Add, edit, delete, and organize course lectures with video hosting and preview capabilities.
* **Review & Ratings:** Students can review and rate courses, enhancing community feedback and course quality.
* **Payment & Checkout:** Integrated with Razorpay and Stripe for secure payment processing, refunds, and order tracking.
* **Course Progress Tracking:** Users can track progress, mark lectures as complete, and reset progress.
* **Robust Security:** Protection against XSS, NoSQL injection, rate-limiting, HTTP headers hardening, and sanitization.
* **Media Management:** Secure file uploads using Cloudinary for images and videos.
* **Scalable Architecture:** Modular design with clean route separation and middleware layers.
* **Extensive Validation:** Input validation with express-validator ensures data integrity.

---

## Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB & Mongoose**
* **Cloudinary** (Media hosting)
* **Razorpay & Stripe** (Payments)
* **Multer** (File uploads)
* **Nodemailer & Mailgen** (Emails)
* **Helmet, HPP, express-mongo-sanitize, xss-clean** (Security)

---

## Installation

1. **Clone the repository:**

```bash
git clone https://github.com/thegobindadas/think-again.git
cd think-again
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set environment variables:**

Create a `.env` file based on `.env.example` and fill in the required values:

```bash
PORT=8000
NODE_ENV=development
MONGODB_URI=your_mongo_db_connection_string/database_name
MAX_FILE_SIZE=5242880 # 5MB in bytes
UPLOAD_PATH=./uploads
BCRYPT_SALT_ROUNDS=10
RATE_LIMIT_WINDOW=15 # in minutes
RATE_LIMIT_MAX=100 # max requests per window
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:3000
FORGOT_PASSWORD_REDIRECT_URL=your_forgot_password_redirect_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_MAIL_HOST=your_mailtrap_host
SMTP_MAIL_PORT=your_mailtrap_port
SMTP_MAIL_USERNAME=your_mailtrap_username
SMTP_MAIL_PASSWORD=your_mailtrap_password
SMTP_SENDER_EMAIL=your_mailtrap_sender_email
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
```

4. **Run the application:**

```bash
npm run dev
```

---

## API Overview

### User Routes (`/api/v1/user`)

* `POST /signup` — Register new users
* `POST /signin` — Authenticate users
* `POST /signout` — Logout users
* `GET /profile` — Get current user's profile
* `PATCH /profile` — Update user profile (avatar upload supported)
* `PATCH /change-password` — Change password
* `POST /forgot-password` — Initiate password reset
* `POST /reset-password/:resetToken` — Complete password reset
* `DELETE /account` — Delete user account
* `GET /verify-email/:verificationToken` — Verify email
* `POST /resend-email-verification` — Resend email verification

### Course Routes (`/api/v1/course`)

* `POST /` — Create new course (Instructor only)
* `GET /` — Get instructor's created courses
* `PATCH /:courseId/publish` — Toggle course publish status
* `GET /:courseId` — Get course details
* `PATCH /:courseId` — Update course details
* `GET /:courseId/students` — Get enrolled students
* `GET /instructor/:instructorId` — Get courses by instructor
* `GET /published` — Get published courses
* `GET /search` — Search courses

### Lecture Routes (`/api/v1/course/:courseId/lecture`)

* `POST /` — Create lecture (Instructor only)
* `GET /` — Get course lectures
* `PATCH /:lectureId/toggle-preview` — Toggle lecture preview status
* `GET /:lectureId` — Get single lecture
* `PATCH /:lectureId` — Update lecture
* `DELETE /:lectureId` — Delete lecture

### Review Routes (`/api/v1/review`)

* `POST /c/:courseId` — Create course review
* `GET /c/:courseId` — Get course reviews
* `GET /c/:courseId/average` — Get average rating
* `GET /u/:userId` — Get reviews by user
* `PATCH /:reviewId` — Update review
* `DELETE /:reviewId` — Delete review

### Course Progress Routes (`/api/v1/progress`)

* `GET /:courseId` — Get course progress
* `PATCH /:courseId/lecture/:lectureId` — Update lecture progress
* `PATCH /:courseId/complete` — Mark course as completed
* `PATCH /:courseId/reset` — Reset course progress

### Purchase & Payment Routes (`/api/v1/purchase` & `/api/v1/razorpay`)

* `POST /checkout/create-checkout-session` — Initiate Stripe checkout
* `POST /webhook` — Handle Stripe webhook
* `GET /course/:courseId/detail-with-status` — Get course purchase status
* `GET /purchased-courses` — Get purchased courses
* `POST /create-order` — Create Razorpay order
* `POST /verify-payment` — Verify Razorpay payment
* `POST /refund-payment` — Process Razorpay refund

### Health Check (`/health`)

* `GET /` — Check API health status

---


## Security Best Practices Implemented

* **Helmet:** Sets secure HTTP headers.
* **HPP:** Prevents HTTP Parameter Pollution.
* **express-mongo-sanitize:** Protects against NoSQL injection.
* **xss-clean:** Sanitizes input to prevent XSS.
* **CORS:** Strict cross-origin policies.
* **Rate Limiting:** Global IP-based request limiting.

---

## License

This project is licensed under the MIT License.

---

## Contact & Support

For any queries, feature requests, or bug reports, please open an issue or contact the maintainers.

---

**Note:** ThinkAgain is a custom-built LMS backend and is not affiliated with any existing online learning platforms. It is designed to provide a flexible, secure, and production-grade solution for managing online courses and digital learning experiences.
