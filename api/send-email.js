import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Resend } from "resend"
import fs from 'fs'
import path from 'path'

dotenv.config()
const app = express()
const resend = new Resend(process.env.RESEND_API_KEY)

// Middleware
app.use(cors())
app.use(express.json())

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Function to get base64 encoded image
const getBase64Image = () => {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'logo.png')
    const imageBuffer = fs.readFileSync(imagePath)
    return `data:image/png;base64,${imageBuffer.toString('base64')}`
  } catch (error) {
    console.error('Error reading image:', error)
    return null
  }
}

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  try {
    const { to } = req.body

    // Input validation
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        error: "Email address is required" 
      })
    }

    if (!isValidEmail(to)) {
      return res.status(400).json({ 
        success: false, 
        error: "Invalid email format" 
      })
    }

    const logoBase64 = getBase64Image()
    if (!logoBase64) {
      return res.status(500).json({
        success: false,
        error: "Failed to load logo image"
      })
    }

    // Send email
    const data = await resend.emails.send({
      from: "Celeriz <team@celeriz.com>",
      to,
      subject: "Welcome to Celeriz 💸",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Celeriz</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4; padding: 40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; font-family: Arial, sans-serif;">
          <tr>
            <td style="padding: 30px 20px; text-align: center; background-color: #05FFDE;">
              <img src="${logoBase64}" alt="Celeriz Logo" style="max-width: 120px; height: auto; margin-bottom: 15px;">
              <h1 style="margin: 0; font-size: 28px; color: #000;">Welcome to Celeriz 💸</h1>
              <p style="margin: 8px 0 0; font-size: 16px; color: #333;">You're officially on the list!</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 30px 10px; color: #444;">
              <p style="font-size: 16px; line-height: 1.6;">Thanks for joining the Celeriz waitlist — we're building a better way to move money globally.</p>
              <p style="font-size: 16px; line-height: 1.6;">Celeriz is a stablecoin-powered neobank designed for the modern world. We help individuals, students, and businesses send and receive funds across borders instantly, affordably, and transparently — no middlemen, no hidden fees.</p>

              <p style="font-size: 16px; line-height: 1.6;">As a waitlist member, you'll get:</p>
              <ul style="padding-left: 20px; font-size: 16px; line-height: 1.6; color: #333;">
                <li>🚀 Early access to our beta launch</li>
                <li>💡 Sneak peeks at features we're rolling out</li>
                <li>🎁 Exclusive rewards for our earliest users</li>
              </ul>

              <p style="font-size: 16px; line-height: 1.6;">We believe financial freedom should be borderless, and you're now part of the movement that's making that real.</p>

              <p style="font-size: 16px; line-height: 1.6;">Got questions or want to say hi? Reach us any time at <a href="mailto:team@celeriz.com" style="color: #05FFDE;">team@celeriz.com</a>.</p>

              <p style="font-size: 16px; line-height: 1.6; margin-top: 30px;">Welcome aboard,<br><strong>— The Celeriz Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="text-align: center; font-size: 12px; color: #888; padding: 20px; background-color: #f8f9fa;">
              © 2025 Celeriz Inc. All rights reserved.<br/>
              You're receiving this email because you signed up for early access.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `
    })

    res.status(200).json({ 
      success: true, 
      message: "Email sent successfully",
      data 
    })
  } catch (error) {
    console.error("Email send failed:", error)
    
    // Handle specific error cases
    if (error.name === 'validation_error') {
      return res.status(422).json({ 
        success: false, 
        error: "Invalid email address or domain" 
      })
    }
    
    if (error.name === 'authentication_error') {
      return res.status(401).json({ 
        success: false, 
        error: "Authentication failed. Please check your API key." 
      })
    }

    res.status(500).json({ 
      success: false, 
      error: "Failed to send email. Please try again later." 
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    success: false, 
    error: "Something went wrong!" 
  })
})

// Export the Express API
export default app 