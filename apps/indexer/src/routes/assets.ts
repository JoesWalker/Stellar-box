import { Router, Request, Response } from 'express';
import { query } from '../db/client';

const router = Router();

// GET /assets?owner=&asset_type=&page=&limit=
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const { owner, asset_type } = req.query as Record<string, string | undefined>;

    const conditions: string[] = [];
    const params: unknown[] = [limit, offset];

    if (owner) { params.push(owner); conditions.push(`owner = $${params.length}`); }
    if (asset_type) { params.push(asset_type); conditions.push(`asset_type = $${params.length}`); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const filterParams = params.slice(2);

    const [data, count] = await Promise.all([
      query(`SELECT * FROM assets ${where} ORDER BY minted_at DESC LIMIT $1 OFFSET $2`, params),
      query(`SELECT COUNT(*) FROM assets ${where}`, filterParams),
    ]);

    res.json({ data: data.rows, total: parseInt(count.rows[0].count), page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /assets/:tokenId
router.get('/:tokenId', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM assets WHERE token_id = $1', [req.params.tokenId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' }) as unknown as void;
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
