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

// Register routes
app.use('/api/auth', authRouter);
app.use('/api/donations', donationRouter);
app.use('/api/requests', requestRouter);
app.use('/api/donor', donorRouter);
app.use('/api/ngo', ngoRouter);
app.use('/api/volunteer', volunteerRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});

export default app;
