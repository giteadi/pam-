const nodemailer = require("nodemailer")
require("dotenv").config()

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email, // Use actual recipient email
    subject: "Your OTP Code - Property Inspector",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Property Inspector - OTP Verification</h2>
                <p>Your OTP code is:</p>
                <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
                    ${otp}
                </div>
                <p style="color: #6b7280;">This OTP is valid for 15 minutes.</p>
                <p style="color: #6b7280;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        `,
    text: `Your OTP code is: ${otp}. It is valid for 15 minutes.`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("OTP sent to:", email)
  } catch (error) {
    console.error("Error sending OTP email:", error)
    throw error
  }
}

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset - Property Inspector",
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">Property Inspector - Password Reset</h2>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <div style="margin: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #6b7280;">This link is valid for 1 hour.</p>
                <p style="color: #6b7280;">If you didn't request this reset, please ignore this email.</p>
            </div>
        `,
    text: `Reset your password by visiting: ${resetUrl}`,
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log("Password reset email sent to:", email)
  } catch (error) {
    console.error("Error sending password reset email:", error)
    throw error
  }
}

module.exports = { sendOtpEmail, sendPasswordResetEmail }
