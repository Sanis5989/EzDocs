import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  }
})

export async function sendResetEmail(email, resetToken) {
  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset/${resetToken}`
  
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password. This link will expire in 5 minutes.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>

        <p>Ez Docs</>
      `
    })
    return { success: true }
  } catch (error) {
    console.error('Send email error:', error)
    return { success: false, error: error.message }
  }
}