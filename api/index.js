// Serverless Express entry for Vercel
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from '../server/config/database.js';

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config();

// Reuse connection across invocations
let dbReady = null;
async function ensureDB() {
  if (!dbReady) {
    dbReady = connectDB();
  }
  return dbReady;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

// Mount routes (relative to /api)
import authRoutes from '../server/routes/auth.js';
import userRoutes from '../server/routes/user.js';
import medicalRecordRoutes from '../server/routes/medicalRecord.js';
import reminderRoutes from '../server/routes/reminder.js';
import healthTipRoutes from '../server/routes/healthTip.js';
import chatbotRoutes from '../server/routes/chatbot.js';
import aiRoutes from '../server/routes/ai.js';

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/medicalRecord', medicalRecordRoutes);
app.use('/reminder', reminderRoutes);
app.use('/healthTip', healthTipRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/ai', aiRoutes);

// Warmup route
app.get('/__health', (_req, res) => res.json({ ok: true }));

const handler = async (req, res) => {
  await ensureDB();
  const wrapped = serverless(app);
  return wrapped(req, res);
};

export default handler;
