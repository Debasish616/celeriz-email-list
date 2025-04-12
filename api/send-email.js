import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Resend } from "resend"

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

    // Send email
    const data = await resend.emails.send({
      from: "Celeriz <team@celeriz.com>",
      to,
      subject: "Welcome to Celeriz! 🎉",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px; padding: 20px; background-color: #f8f9fa;">
            <h1 style="color: #333; margin: 0; font-size: 24px;">Celeriz</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2 style="color: #333; text-align: center;">Welcome to Celeriz!</h2>
            <p style="color: #666; line-height: 1.6;">Thank you for joining our community. We're thrilled to have you on board!</p>
            
            <p style="color: #666; line-height: 1.6;">As a subscriber, you'll be the first to know about:</p>
            <ul style="color: #666; line-height: 1.6;">
              <li>Latest updates and announcements</li>
              <li>Exclusive offers and promotions</li>
              <li>Industry insights and best practices</li>
            </ul>

            <p style="color: #666; line-height: 1.6;">We're committed to providing you with valuable content and keeping you informed about everything happening at Celeriz.</p>

            <p style="color: #666; line-height: 1.6;">If you have any questions or need assistance, feel free to reach out to us at <a href="mailto:team@celeriz.com" style="color: #007bff;">team@celeriz.com</a>.</p>

            <p style="color: #666; line-height: 1.6;">Best regards,<br>The Celeriz Team</p>
          </div>

          <div style="text-align: center; margin-top: 20px; padding: 20px; background-color: #f8f9fa; font-size: 12px; color: #666;">
            <p>© 2024 Celeriz. All rights reserved.</p>
          </div>
        </div>
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