import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  // Vercel Settings-এ DATABASE_URL ঠিকমতো দেওয়া থাকতে হবে
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT state FROM book_data WHERE id = 1`;
      if (data.length > 0 && data[0].state) {
        return res.status(200).json(data[0].state);
      }
      return res.status(200).json(null);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { state } = req.body;
      await sql`
        INSERT INTO book_data (id, state) 
        VALUES (1, ${state}) 
        ON CONFLICT (id) 
        DO UPDATE SET state = EXCLUDED.state, updated_at = CURRENT_TIMESTAMP
      `;
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}