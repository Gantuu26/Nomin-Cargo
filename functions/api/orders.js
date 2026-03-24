export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    try {
        if (request.method === 'GET') {
            const email = url.searchParams.get('user_email');
            let results;
            if (email && email !== 'none') {
                 // Try adding the column just in case it's an old DB
                 try { await env.DB.prepare('ALTER TABLE orders ADD COLUMN user_email TEXT').run(); } catch(e){}
                 
                 const stmt = env.DB.prepare('SELECT * FROM orders WHERE user_email = ? ORDER BY date DESC').bind(email);
                 results = (await stmt.all()).results;
            } else if (email === 'none') {
                 // Explicitly requested no orders
                 results = [];
            } else {
                 // Admin panel without user filter
                 const stmt = env.DB.prepare('SELECT * FROM orders ORDER BY date DESC');
                 results = (await stmt.all()).results;
            }
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            
            // Generate auto-incrementing ID
            const countStmt = env.DB.prepare("SELECT order_id FROM orders WHERE order_id LIKE 'MN%'");
            const allMNs = await countStmt.all();
            let maxNum = 0;
            if (allMNs.results && allMNs.results.length > 0) {
                 allMNs.results.forEach(row => {
                      const num = parseInt(row.order_id.substring(2), 10);
                      if (!isNaN(num) && num > maxNum) maxNum = num;
                 });
            }
            let finalOrderId = 'MN' + String(maxNum + 1).padStart(2, '0');

            // Auto-migrate schema to include user_email if it doesn't exist
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN user_email TEXT').run(); 
            } catch(e) { /* ignore */ }
            
            const stmt = env.DB.prepare(`
                INSERT INTO orders (
                    order_id, type, branch, date, status, container_id,
                    sender_name, sender_phone, sender_address,
                    receiver_name, receiver_phone, receiver_address,
                    item_category, item_quantity, user_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                finalOrderId, body.type, body.branch || '', body.date || new Date().toISOString(), body.status || 'pending', body.containerId || null,
                body.sender?.name || '', body.sender?.phone || '', body.sender?.address || '',
                body.receiver?.name || '', body.receiver?.phone || '', body.receiver?.address || '',
                body.item?.category || body.items?.[0]?.category || '', body.item?.quantity || body.items?.[0]?.quantity || '', body.user_email || ''
            );
            await stmt.run();
            
            return new Response(JSON.stringify({ success: true, orderId: finalOrderId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
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
