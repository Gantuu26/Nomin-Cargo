export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    try {
        if (request.method === 'GET') {
            const { results } = await env.DB.prepare('SELECT * FROM notifications ORDER BY date DESC').all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            await env.DB.prepare('INSERT INTO notifications (title, content) VALUES (?, ?)')
                      .bind(body.title, body.content || '').run();
            return new Response(JSON.stringify({ success: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'DELETE') {
            if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
            await env.DB.prepare('DELETE FROM notifications WHERE id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response("Method not allowed", { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
