import { sessionCookie } from '../../_auth.js';
export async function onRequestPost({ request, env }) {
  const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
  try {
    const { credential } = await request.json();
    if (typeof credential !== 'string' || credential.length > 8192) return json({ error: 'Invalid credential' }, 400);
    const response = await fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(credential));
    if (!response.ok) return json({ error: 'Invalid Google login' }, 401);
    const user = await response.json();
    const client = env.GOOGLE_CLIENT_ID || '729057953866-odme24trj9dudep2g8qop97l61ss1fsv.apps.googleusercontent.com';
    if (user.aud !== client || !['accounts.google.com', 'https://accounts.google.com'].includes(user.iss) || user.email_verified !== 'true' || Number(user.exp) * 1000 <= Date.now()) return json({ error: 'Invalid Google login' }, 401);
    return json({ success: true, user: { id: 'google_' + user.sub, name: user.name || user.email, email: user.email, phone: '', picture: user.picture } }, 200, { 'Set-Cookie': await sessionCookie(user.email, env) });
  } catch { return json({ error: 'Login unavailable' }, 503); }
}
