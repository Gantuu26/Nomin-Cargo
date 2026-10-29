import { receiptToken } from '../_auth.js';
export async function onRequestGet({ request, env, data }) {
  const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  if (!data?.isAdmin) return json({ error: 'Админ эрх шаардлагатай.' }, 401);
  const id = new URL(request.url).searchParams.get('id');
  if (!id || id.length > 100) return json({ error: 'Invalid order ID' }, 400);
  const order = await env.DB.prepare('SELECT order_id FROM orders WHERE order_id = ?').bind(id).first();
  if (!order) return json({ error: 'Order not found' }, 404);
  const expires = Date.now() + 90 * 24 * 60 * 60 * 1000;
  const url = new URL('/receipt', request.url);
  url.searchParams.set('id', id);
  url.hash = 'access=' + await receiptToken(id, env, expires);
  return json({ url: url.toString(), expiresAt: new Date(expires).toISOString() });
}
