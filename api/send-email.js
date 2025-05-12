import { Resend } from 'resend';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const resend = new Resend(process.env.RESEND_API_KEY);

app.post('/api/send-email', async (req, res) => {
  const { to, kycLink } = req.body;

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return res.status(400).json({ success: false, error: "Invalid email" });
  }

  try {
    await resend.emails.send({
      from: 'noreply@celeriz.com',
      to,
      subject: 'Complete your KYC',
      html: `
        <p>Hi,</p>
        <p>Please complete your KYC using the following link:</p>
        <a href="${kycLink}">${kycLink}</a>
      `,
    });
    res.status(200).json({ success: true, message: "Email sent" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ success: false, error: "Email failed to send" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
