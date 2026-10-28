const encoder = new TextEncoder();
const MAX_AGE = 12 * 60 * 60;
const encode = bytes => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
async function key(env) {
  return crypto.subtle.importKey('raw', encoder.encode(env.ADMIN_PASSWORD), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}
async function verify(payload, signature, env) {
  if (!env.ADMIN_PASSWORD || !signature) return false;
  try {
    const text = signature.replace(/-/g, '+').replace(/_/g, '/');
    return await crypto.subtle.verify('HMAC', await key(env), Uint8Array.from(atob(text + '='.repeat((4 - text.length % 4) % 4)), c => c.charCodeAt(0)), encoder.encode(payload));
  } catch { return false; }
}
export async function isAdmin(request, env) {
  const token = (request.headers.get('Authorization') || '').replace(/^Bearer /, '');
  const [issuedAt, signature, extra] = token.split('.');
  const age = Date.now() - Number(issuedAt);
  return !extra && Number.isFinite(age) && age >= 0 && age <= MAX_AGE * 1000 && await verify(issuedAt, signature, env);
}
export async function userEmail(request, env) {
  try {
    const token = (request.headers.get('Cookie') || '').split(';').map(x => x.trim()).find(x => x.startsWith('nomin_session='))?.slice(14);
    if (!token) return null;
    const [payload, signature, extra] = token.split('.');
    if (extra || !await verify('user:' + payload, signature, env)) return null;
    const text = payload.replace(/-/g, '+').replace(/_/g, '/');
    const session = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(text + '='.repeat((4 - text.length % 4) % 4)), c => c.charCodeAt(0))));
    return session.exp > Date.now() && typeof session.email === 'string' ? session.email : null;
  } catch { return null; }
}
export async function sessionCookie(email, env) {
  if (!env.ADMIN_PASSWORD) throw new Error('Session configuration unavailable');
  const payload = encode(encoder.encode(JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 })));
  const signature = encode(new Uint8Array(await crypto.subtle.sign('HMAC', await key(env), encoder.encode('user:' + payload))));
  return 'nomin_session=' + payload + '.' + signature + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=' + MAX_AGE;
}
