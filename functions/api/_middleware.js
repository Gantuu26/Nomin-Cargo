import { isAdmin, userEmail } from '../_auth.js';
export async function onRequest(context) {
  const { request, env, data } = context;
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  if (path === '/api/init-db') return new Response('Not found', { status: 404 });
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    const origin = request.headers.get('Origin');
    if (origin && origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  }
  data.isAdmin = await isAdmin(request, env);
  data.userEmail = await userEmail(request, env);
  const publicAuth = path.startsWith('/api/auth/') || path === '/api/admin/login';
  const customerWrite = request.method === 'POST' && ['/api/orders', '/api/upload'].includes(path);
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !publicAuth && !data.isAdmin && !(customerWrite && data.userEmail)) {
    return new Response(JSON.stringify({ error: 'Нэвтрэх шаардлагатай.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  const response = await context.next();
  const result = new Response(response.body, response);
  result.headers.set('Cache-Control', 'no-store');
  return result;
}
