import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { corsMiddleware } from './middleware/cors';
import landsRouter from './routes/lands';
import assetsRouter from './routes/assets';
import listingsRouter from './routes/listings';
import statsRouter from './routes/stats';

const app = express();
const PORT = parseInt(process.env.INDEXER_PORT ?? '3001', 10);

app.use(corsMiddleware);
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

app.use('/lands', landsRouter);
app.use('/assets', assetsRouter);
app.use('/listings', listingsRouter);
app.use('/stats', statsRouter);

app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function main(): Promise<void> {
  // Attempt DB connection — non-fatal in dev without PostgreSQL
  if (process.env.DATABASE_URL) {
    try {
      const { connectDB } = await import('./db/client');
      await connectDB();
      console.log('Database connected');

      // Apply schema
      const fs = await import('fs');
      const path = await import('path');
      const schemaPath = path.join(__dirname, 'db/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const { query } = await import('./db/client');
        await query(fs.readFileSync(schemaPath, 'utf8'));
        console.log('Schema applied');
      }

      // Start Stellar event indexer
      const { startIndexer } = await import('./indexer/stellarIndexer');
      startIndexer();
    } catch (err) {
      console.warn('DB unavailable — running without persistence:', (err as Error).message);
    }
  } else {
    console.warn('DATABASE_URL not set — running without persistence');
  }

  app.listen(PORT, () => console.log(`Indexer listening on :${PORT}`));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
