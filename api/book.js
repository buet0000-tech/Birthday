import { neon } from '@neondatabase/serverless';

const MAX_STATE_BYTES = 900_000;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured on Vercel.');
  return neon(url);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS book_data (
      id INTEGER PRIMARY KEY,
      state JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store, max-age=0',
    },
  });
}

export default async function handler(request) {
  try {
    const sql = getSql();
    await ensureSchema(sql);

    if (request.method === 'GET') {
      const rows = await sql`
        SELECT state, updated_at
        FROM book_data
        WHERE id = 1
        LIMIT 1
      `;

      if (!rows.length) return json({ state: null, updatedAt: null });
      return json({ state: rows[0].state, updatedAt: rows[0].updated_at });
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      const body = await request.json().catch(() => null);
      const state = body?.state;

      if (!state || typeof state !== 'object' || Array.isArray(state)) {
        return json({ error: 'Invalid state payload.' }, 400);
      }

      const encoded = JSON.stringify(state);
      if (new TextEncoder().encode(encoded).byteLength > MAX_STATE_BYTES) {
        return json({ error: 'State payload is too large.' }, 413);
      }

      await sql`
        INSERT INTO book_data (id, state, updated_at)
        VALUES (1, ${encoded}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET state = EXCLUDED.state, updated_at = NOW()
      `;

      return json({
        success: true,
        updatedAt: new Date().toISOString(),
      });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (error) {
    console.error('book API error:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown database error.',
    }, 500);
  }
}
