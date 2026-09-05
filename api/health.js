import { neon } from '@neondatabase/serverless';

export default async function handler() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return new Response(JSON.stringify({ ok: false, error: 'DATABASE_URL is missing.' }), {
        status: 500,
        headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
      });
    }

    const sql = neon(url);
    const [row] = await sql`SELECT NOW() AS now`;

    return new Response(JSON.stringify({ ok: true, database: 'connected', now: row.now }), {
      status: 200,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      error: error instanceof Error ? error.message : 'Database check failed.',
    }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    });
  }
}
