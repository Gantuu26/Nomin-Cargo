export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    try {
        if (request.method === 'GET') {
            // Include basic selection
            const { results } = await env.DB.prepare('SELECT * FROM orders ORDER BY date DESC').all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            
            const stmt = env.DB.prepare(`
                INSERT INTO orders (
                    order_id, type, branch, date, status, container_id,
                    sender_name, sender_phone, sender_address,
                    receiver_name, receiver_phone, receiver_address,
                    item_category, item_quantity
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                body.orderId, body.type, body.branch || '', body.date || new Date().toISOString(), body.status || 'pending', body.containerId || null,
                body.sender?.name || '', body.sender?.phone || '', body.sender?.address || '',
                body.receiver?.name || '', body.receiver?.phone || '', body.receiver?.address || '',
                body.items?.[0]?.category || '', body.items?.[0]?.quantity || ''
            );
            await stmt.run();
            
            return new Response(JSON.stringify({ success: true, orderId: body.orderId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'PUT') {
            // typically PUT is for updating container assignments or statuses individually
            const body = await request.json();
            if (!body.orderId) return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });

            // If updating container assignment only:
            let stmt;
            if (body.hasOwnProperty('containerId')) {
                 stmt = env.DB.prepare('UPDATE orders SET container_id = ? WHERE order_id = ?')
                             .bind(body.containerId, body.orderId);
            } else if (body.hasOwnProperty('status')) {
                 stmt = env.DB.prepare('UPDATE orders SET status = ? WHERE order_id = ?')
                             .bind(body.status, body.orderId);
            } else {
                 return new Response(JSON.stringify({ error: "Invalid update payload" }), { status: 400 });
            }
            
            await stmt.run();
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'DELETE') {
            if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
            await env.DB.prepare('DELETE FROM orders WHERE order_id = ?').bind(id).run();
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response("Method not allowed", { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
