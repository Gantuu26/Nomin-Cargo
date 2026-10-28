// Database initialization is only allowed through reviewed offline migrations.
export function onRequest() { return new Response('Not found', { status: 404 }); }
