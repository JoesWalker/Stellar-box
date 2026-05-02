import { Router, Request, Response } from 'express';
import { query } from '../db/client';

const router = Router();

// GET /stats
router.get('/', async (_req: Request, res: Response) => {
  try {
    const [lands, assets, listings, volume, recent] = await Promise.all([
      query('SELECT COUNT(*) FROM lands'),
      query('SELECT COUNT(*) FROM assets'),
      query('SELECT COUNT(*) FROM listings WHERE active = TRUE'),
      query('SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE type = $1', ['asset_sold']),
      query('SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10'),
    ]);

    res.json({
      totalLands: parseInt(lands.rows[0].count),
      totalAssets: parseInt(assets.rows[0].count),
      activeListings: parseInt(listings.rows[0].count),
      totalVolume: parseFloat(volume.rows[0].total),
      recentTransactions: recent.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
