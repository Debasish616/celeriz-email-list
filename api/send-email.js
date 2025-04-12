import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Resend } from "resend"

dotenv.config()
const app = express()
const resend = new Resend(process.env.RESEND_API_KEY)

app.use(cors())
app.use(express.json())

app.post("/send-email", async (req, res) => {
  const { to } = req.body

  try {
    const data = await resend.emails.send({
      from: "Celeriz <team@celeriz.com>",
      to,
      subject: "You're subscribed! 🎉",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Celeriz</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color:#ffffff; border-radius: 8px; overflow: hidden;">
          <tr>
            <td align="center" bgcolor="#05FFDE" style="padding: 40px 30px;">
              <h1 style="font-family: Arial, sans-serif; font-size: 26px; color: #000000; margin: 0;">
                🎉 Welcome to Celeriz!
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; font-family: Arial, sans-serif; font-size: 16px; color: #333333;">
              <p>Hi there,</p>
              <p>Thanks for subscribing to <strong>Celeriz</strong>! You’re officially on the inside 🎉</p>
              <p>Here's what you can expect:</p>
              <ul style="padding-left: 20px;">
                <li>🚀 Product updates and sneak peeks</li>
                <li>💡 Insider tips on global payments</li>
                <li>🤝 First access to beta features</li>
              </ul>
              <p>If you have any questions, drop us a message at 
                <a href="mailto:team@celeriz.com" style="color: #05FFDE;">team@celeriz.com</a>
              </p>
              <p style="margin-top: 30px;">— The Celeriz Team 💚</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 20px; font-family: Arial, sans-serif; font-size: 12px; color: #888888;">
              © 2025 Celeriz, Inc. All rights reserved.
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

    res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("Email send failed:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
