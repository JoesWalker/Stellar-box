import { Router, Request, Response } from 'express';
import { query } from '../db/client';

const router = Router();

// GET /lands?owner=&page=&limit=
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const owner = req.query.owner as string | undefined;

    const params: unknown[] = [limit, offset];
    let where = '';
    if (owner) {
      params.push(owner);
      where = `WHERE owner = $${params.length}`;
    }

    const [data, count] = await Promise.all([
      query(`SELECT * FROM lands ${where} ORDER BY minted_at DESC LIMIT $1 OFFSET $2`, params),
      query(`SELECT COUNT(*) FROM lands ${where}`, owner ? [owner] : []),
    ]);

    res.json({ data: data.rows, total: parseInt(count.rows[0].count), page, limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /lands/coords/:x/:y — must be before /:tokenId
router.get('/coords/:x/:y', async (req: Request, res: Response) => {
  try {
    const { x, y } = req.params;
    const result = await query('SELECT * FROM lands WHERE x = $1 AND y = $2', [parseInt(x), parseInt(y)]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' }) as unknown as void;
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /lands/:tokenId
router.get('/:tokenId', async (req: Request, res: Response) => {
  try {
    const result = await query('SELECT * FROM lands WHERE token_id = $1', [req.params.tokenId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' }) as unknown as void;
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
