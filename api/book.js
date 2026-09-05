import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const result = await sql`SELECT state FROM book_data WHERE id = 1`;
      if (result.length > 0 && result[0].state && Object.keys(result[0].state).length > 0) {
        return res.status(200).json(result[0].state);
      }
      return res.status(200).json(null);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { state } = req.body;
      if (!state) {
        return res.status(400).json({ error: 'Missing state payload' });
      }

      await sql`
        INSERT INTO book_data (id, state, updated_at)
        VALUES (1, ${JSON.stringify(state)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE
        SET state = EXCLUDED.state, updated_at = NOW()
      `;
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}