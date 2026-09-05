import { neon } from '@neondatabase/serverless';

const MAX_MEDIA_BYTES = 4 * 1024 * 1024;

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not configured on Vercel.');
  return neon(url);
}

async function ensureSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS book_media (
      media_key VARCHAR(200) PRIMARY KEY,
      content BYTEA NOT NULL,
      mime_type VARCHAR(255) NOT NULL DEFAULT 'application/octet-stream',
      size_bytes INTEGER NOT NULL,
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

function getKey(request) {
  return new URL(request.url).searchParams.get('key')?.trim() || '';
}

function validKey(key) {
  return /^[A-Za-z0-9._-]{1,200}$/.test(key);
}

export default async function handler(request) {
  try {
    const key = getKey(request);
    if (!validKey(key)) return json({ error: 'Invalid or missing media key.' }, 400);

    const sql = getSql();
    await ensureSchema(sql);

    if (request.method === 'GET') {
      const rows = await sql`
        SELECT content, mime_type, size_bytes
        FROM book_media
        WHERE media_key = ${key}
        LIMIT 1
      `;

      if (!rows.length) return json({ error: 'Media not found.' }, 404);

      return new Response(rows[0].content, {
        status: 200,
        headers: {
          'content-type': rows[0].mime_type || 'application/octet-stream',
          'content-length': String(rows[0].size_bytes),
          'cache-control': 'public, max-age=31536000, immutable',
        },
      });
    }

    if (request.method === 'POST' || request.method === 'PUT') {
      const contentType = request.headers.get('content-type') || 'application/octet-stream';
      const raw = new Uint8Array(await request.arrayBuffer());

      if (!raw.byteLength) return json({ error: 'Empty media payload.' }, 400);
      if (raw.byteLength > MAX_MEDIA_BYTES) {
        return json({ error: 'Media is too large. Maximum size is 4 MB.' }, 413);
      }

      await sql`
        INSERT INTO book_media (media_key, content, mime_type, size_bytes, updated_at)
        VALUES (${key}, ${raw}, ${contentType.slice(0, 255)}, ${raw.byteLength}, NOW())
        ON CONFLICT (media_key)
        DO UPDATE SET
          content = EXCLUDED.content,
          mime_type = EXCLUDED.mime_type,
          size_bytes = EXCLUDED.size_bytes,
          updated_at = NOW()
      `;

      return json({ success: true, key, size: raw.byteLength });
    }

    if (request.method === 'DELETE') {
      await sql`DELETE FROM book_media WHERE media_key = ${key}`;
      return json({ success: true, key });
    }

    return json({ error: 'Method not allowed.' }, 405);
  } catch (error) {
    console.error('media API error:', error);
    return json({
      error: error instanceof Error ? error.message : 'Unknown media storage error.',
    }, 500);
  }
}
