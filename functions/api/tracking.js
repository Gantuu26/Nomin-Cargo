export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const orderId = url.searchParams.get('order_id');

    try {
        if (request.method === 'GET') {
            if (!orderId) return new Response(JSON.stringify({ error: "Missing order_id" }), { status: 400 });
            const { results } = await env.DB.prepare('SELECT * FROM tracking_logs WHERE order_id = ? ORDER BY created_at DESC').bind(orderId).all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            if (!body.order_id || !body.status) return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
            
            const stmt = env.DB.prepare('INSERT INTO tracking_logs (order_id, status, description, images) VALUES (?, ?, ?, ?)')
                               .bind(body.order_id, body.status, body.description || '', body.images || '[]');
            await stmt.run();
            
            return new Response(JSON.stringify({ success: true }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        return new Response("Method not allowed", { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
