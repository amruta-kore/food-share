import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import donationRouter from './routes/donations';
import requestRouter from './routes/requests';
import donorRouter from './routes/donor';
import ngoRouter from './routes/ngo';
import volunteerRouter from './routes/volunteer';
import adminRouter from './routes/admin';
import feedbackRouter from './routes/feedback';

import fs from 'fs';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Ensure uploads folder and subdirectories exist
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
const docsDir = path.join(uploadsDir, 'documents');
const foodDir = path.join(uploadsDir, 'food');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(foodDir)) fs.mkdirSync(foodDir, { recursive: true });

// Serve uploaded documents and food images as static files
app.use('/uploads', express.static(uploadsDir));
if (path.resolve(process.cwd(), 'uploads') !== uploadsDir && fs.existsSync(path.resolve(process.cwd(), 'uploads'))) {
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FoodShare API', timestamp: new Date().toISOString() });
});

// Diagnostic check for email configuration
app.get('/api/health/email', async (req, res) => {
  const emailUser = process.env.EMAIL_USER;
  const brevoApiKey = process.env.BREVO_API_KEY;
  const hasPass = Boolean(process.env.EMAIL_PASS);
  const targetEmail: string = (req.query.to as string) || emailUser || 'amrutakore2006@gmail.com';

  const diagnostics = {
    emailUser: emailUser || 'not set',
    hasEmailPass: hasPass,
    hasBrevoApiKey: Boolean(brevoApiKey),
    targetEmail,
  };

  try {
    const { sendMail } = await import('./utils/mailer');
    const result = await sendMail({
      to: targetEmail,
      subject: 'FoodShare Email Delivery Confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #059669;">FoodShare Email Delivery Confirmed!</h2>
          <p>Your email system on <strong>FoodShare Backend</strong> is working and delivering messages successfully.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });
    return res.json({
      status: result ? 'ok' : 'notice',
      message: result ? `Test email dispatched to ${targetEmail}` : 'Email dispatch attempted (check logs)',
      diagnostics,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err?.message || 'Failed to send test email',
      diagnostics,
    });
  }
});

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/donations', donationRouter);
app.use('/api/requests', requestRouter);
app.use('/api/donor', donorRouter);
app.use('/api/ngo', ngoRouter);
app.use('/api/volunteer', volunteerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/feedback', feedbackRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

export default app;
