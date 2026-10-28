export function onRequestPost() {
  return new Response('{}', { headers: { 'Content-Type': 'application/json', 'Set-Cookie': 'nomin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } });
}
