import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { representativesRouter } from './routes/representatives';
import { issuesRouter } from './routes/issues';
import { scriptsRouter } from './routes/scripts';
import { personasRouter } from './routes/personas';
import { callsRouter } from './routes/calls';
import { errorHandler } from './middleware/errorHandler';

export const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/representatives', representativesRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/scripts', scriptsRouter);
app.use('/api/personas', personasRouter);
app.use('/api/calls', callsRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler (must be last)
app.use(errorHandler);
