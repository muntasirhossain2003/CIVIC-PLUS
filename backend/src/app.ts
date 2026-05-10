import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { initSocket } from './socket/events';

import authRoutes from './routes/auth.routes';
import issueRoutes from './routes/issue.routes';
import uploadRoutes from './routes/upload.routes';
import analyticsRoutes from './routes/analytics.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const httpServer = http.createServer(app);

initSocket(httpServer);

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

app.get('/health', (_, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  await connectDB();
  httpServer.listen(env.PORT, () => {
    logger.info(`CivicPulse API running on port ${env.PORT} [${env.NODE_ENV}]`);
  });
}

start();

export default app;
