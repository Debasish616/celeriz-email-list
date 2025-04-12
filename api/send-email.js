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

// Function to get base64 image
const getBase64Image = () => {
  try {
    const imagePath = path.join(process.cwd(), 'public', 'images', 'logo.png')
    console.log('Attempting to read image from:', imagePath)
    
    if (!fs.existsSync(imagePath)) {
      console.error('Image file does not exist at path:', imagePath)
      return null
    }
    
    const imageBuffer = fs.readFileSync(imagePath)
    const base64String = `data:image/png;base64,${imageBuffer.toString('base64')}`
    console.log('Successfully loaded image')
    return base64String
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5; padding: 40px 0;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 20px; text-align: center; background-color: #ffffff; border-bottom: 1px solid #e5e5e5;">
              <img src="${logoBase64}" alt="Celeriz Logo" style="width: 140px; height: auto; margin-bottom: 24px; display: block; margin-left: auto; margin-right: auto;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #000000; letter-spacing: -0.5px;">Welcome to Celeriz</h1>
              <p style="margin: 12px 0 0; font-size: 18px; font-weight: 500; color: #333333;">You're officially on the list!</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 30px;">
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 24px;">
                Thanks for joining the Celeriz waitlist — we're building a better way to move money globally.
              </p>
              
              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 24px;">
                Celeriz is a stablecoin-powered neobank designed for the modern world. We help individuals, students, and businesses send and receive funds across borders instantly, affordably, and transparently — no middlemen, no hidden fees.
              </p>

              <div style="background-color: #f8f8f8; border-radius: 8px; padding: 24px; margin: 32px 0; border: 1px solid #e5e5e5;">
                <h2 style="font-size: 20px; font-weight: 600; color: #000000; margin: 0 0 16px;">As a waitlist member, you'll get:</h2>
                <ul style="margin: 0; padding-left: 20px; color: #333333;">
                  <li style="margin-bottom: 12px; font-size: 16px; line-height: 1.5;">🚀 Early access to our beta launch</li>
                  <li style="margin-bottom: 12px; font-size: 16px; line-height: 1.5;">💡 Sneak peeks at features we're rolling out</li>
                  <li style="margin-bottom: 12px; font-size: 16px; line-height: 1.5;">🎁 Exclusive rewards for our earliest users</li>
                </ul>
              </div>

              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 24px;">
                We believe financial freedom should be borderless, and you're now part of the movement that's making that real.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 0 0 24px;">
                Got questions or want to say hi? Reach us any time at <a href="mailto:team@celeriz.com" style="color: #000000; text-decoration: underline; font-weight: 500;">team@celeriz.com</a>.
              </p>

              <p style="font-size: 16px; line-height: 1.6; color: #333333; margin: 32px 0 0;">
                Welcome aboard,<br>
                <strong style="color: #000000;">— The Celeriz Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="text-align: center; font-size: 14px; color: #666666; padding: 24px; background-color: #f8f8f8; border-top: 1px solid #e5e5e5;">
              © 2025 Celeriz Inc. All rights reserved.<br/>
              <span style="color: #888888;">You're receiving this email because you signed up for early access.</span>
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