export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    try {
        if (request.method === 'GET') {
            const { results } = await env.DB.prepare('SELECT * FROM banners ORDER BY created_at DESC').all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            await env.DB.prepare('INSERT INTO banners (imageUrl, linkUrl, active) VALUES (?, ?, ?)')
                      .bind(body.imageUrl, body.linkUrl || '', body.active !== undefined ? body.active : 1).run();
            return new Response(JSON.stringify({ success: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'PUT') {
            const body = await request.json();
            if (!body.id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
            await env.DB.prepare('UPDATE banners SET active = ? WHERE id = ?')
                      .bind(body.active, body.id).run();
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'DELETE') {
            if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
            await env.DB.prepare('DELETE FROM banners WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response("Method not allowed", { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
