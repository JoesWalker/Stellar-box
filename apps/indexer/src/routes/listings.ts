import { Router, Request, Response } from 'express';
import { query } from '../db/client';

const router = Router();

// GET /listings?active=&min_price=&max_price=&page=&limit=
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const { active, min_price, max_price } = req.query as Record<string, string | undefined>;

    const conditions: string[] = [];
    const params: unknown[] = [limit, offset];

    if (active !== undefined) { params.push(active === 'true'); conditions.push(`active = $${params.length}`); }
    if (min_price) { params.push(parseFloat(min_price)); conditions.push(`price >= $${params.length}`); }
    if (max_price) { params.push(parseFloat(max_price)); conditions.push(`price <= $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const filterParams = params.slice(2);

    const [data, count] = await Promise.all([
      query(`SELECT * FROM listings ${where} ORDER BY created_at DESC LIMIT $1 OFFSET $2`, params),
      query(`SELECT COUNT(*) FROM listings ${where}`, filterParams),
    ]);

    res.json({ data: data.rows, total: parseInt(count.rows[0].count), page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /listings/:listingId
router.get('/:listingId', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM listings WHERE listing_id = $1', [req.params.listingId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' }) as unknown as void;
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
