import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const data = await sql`SELECT * FROM memories ORDER BY created_at DESC`;
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    await sql`INSERT INTO memories (content) VALUES (${content})`;
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}