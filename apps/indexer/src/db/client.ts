import { Pool, QueryResult, QueryResultRow } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB pool error:', err);
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  const res = await pool.query<T>(text, params);
  console.debug(`query [${Date.now() - start}ms]: ${text.slice(0, 80)}`);
  return res;
}

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  client.release();
  console.log('PostgreSQL connected');
}

export default pool;
