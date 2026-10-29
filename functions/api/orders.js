import { canReadReceipt } from '../_auth.js';
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const admin = context.data?.isAdmin === true;
    const emailSession = context.data?.userEmail;
    const deny = () => new Response(JSON.stringify({ error: 'Нэвтрэх шаардлагатай.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    if (['PUT', 'DELETE'].includes(request.method) && !admin) return deny();
    if (request.method === 'POST' && !admin && !emailSession) return deny();

    try {
        if (request.method === 'GET') {
            const email = url.searchParams.get('user_email');
            const targetId = url.searchParams.get('id');
            if (!admin && !targetId && (!emailSession || email !== emailSession)) return deny();
            const receiptAccess = request.headers.get('X-Receipt-Token');
            const shared = Boolean(targetId && receiptAccess && await canReadReceipt(targetId, receiptAccess, env));
            if (receiptAccess && !shared) return new Response(JSON.stringify({ error: 'Холбоос хүчингүй эсвэл хугацаа дууссан байна. Шинэ холбоос авна уу.' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
            let results;
            
            if (targetId) {
                 const stmt = env.DB.prepare('SELECT * FROM orders WHERE order_id = ?').bind(targetId);
                 const res = await stmt.first();
                 results = res ? [res] : [];
            } else if (email && email !== 'none') {
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
            if (!admin && targetId) {
                results = results.map(order => {
                    if (emailSession && order.user_email === emailSession) return order;
                    if (shared) {
                        const fields = ['order_id', 'type', 'branch', 'date', 'status', 'container_id', 'sender_name', 'sender_phone', 'sender_address', 'receiver_name', 'receiver_phone', 'receiver_address', 'item_category', 'item_quantity', 'large_items', 'volume_items', 'weight', 'total_price', 'images'];
                        return Object.fromEntries(fields.map(field => [field, order[field]]));
                    }
                    const mask = value => value ? String(value).slice(0, 1) + '***' : '';
                    return { order_id: order.order_id, type: order.type, branch: order.branch, date: order.date,
                        status: order.status, container_id: order.container_id, weight: order.weight,
                        total_price: order.total_price, sender_name: mask(order.sender_name), receiver_name: mask(order.receiver_name) };
                });
            }
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            
            if (!admin) { body.user_email = emailSession; body.status = 'pending'; body.containerId = null; }
            if (!['standard', 'express'].includes(body.type)) return new Response('Invalid cargo type', { status: 400 });
            const branch = await env.DB.prepare('SELECT * FROM branches WHERE name = ? AND active = 1').bind(body.branch).first();
            if (!branch) return new Response('Branch unavailable', { status: 400 });
            if (body.weight !== null && body.weight !== undefined && body.weight !== '') {
                const weight = Number(body.weight);
                const rate = Number(branch[body.type === 'express' ? 'express_price' : 'standard_price']);
                if (!Number.isFinite(weight) || weight <= 0 || !Number.isFinite(rate) || rate < 0) return new Response('Invalid pricing', { status: 400 });
                body.total_price = String(Math.round(weight * rate));
            } else { body.weight = null; body.total_price = null; }
            // Generate auto-incrementing ID with branch prefix
            let prefix = 'MN';
            if (body.branch === 'Салбар 2') prefix = 'MK';
            else if (body.branch === 'Салбар 3') prefix = 'TG';
            else if (body.branch === 'Салбар 4') prefix = 'UL';

            const countStmt = env.DB.prepare(`SELECT order_id FROM orders WHERE order_id LIKE '${prefix}%'`);
            const allMatch = await countStmt.all();
            let maxNum = 0;
            if (allMatch.results && allMatch.results.length > 0) {
                 allMatch.results.forEach(row => {
                      const num = parseInt(row.order_id.substring(2), 10);
                      if (!isNaN(num) && num > maxNum) maxNum = num;
                 });
            }
            let finalOrderId = prefix + String(maxNum + 1).padStart(2, '0');

            // Auto-migrate schema to include user_email if it doesn't exist
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN user_email TEXT').run(); 
            } catch(e) { /* ignore */ }
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN images TEXT').run(); 
            } catch(e) { /* ignore */ }
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN weight TEXT').run(); 
            } catch(e) { /* ignore */ }
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN total_price TEXT').run(); 
            } catch(e) { /* ignore */ }
            try { 
                await env.DB.prepare('ALTER TABLE orders ADD COLUMN large_items TEXT').run(); 
            } catch(e) { /* ignore */ }
            
            const stmt = env.DB.prepare(`
                INSERT INTO orders (
                    order_id, type, branch, date, status, container_id,
                    sender_name, sender_phone, sender_address,
                    receiver_name, receiver_phone, receiver_address,
                    item_category, item_quantity, user_email, images, weight, total_price, large_items
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
                finalOrderId, body.type, body.branch || '', body.date || new Date().toISOString(), body.status || 'pending', body.containerId || null,
                body.sender?.name || '', body.sender?.phone || '', body.sender?.address || '',
                body.receiver?.name || '', body.receiver?.phone || '', body.receiver?.address || '',
                body.item?.category || body.items?.[0]?.category || '', body.item?.quantity || body.items?.[0]?.quantity || '', body.user_email || '', JSON.stringify(body.images || []),
                body.weight || null, body.total_price || null, JSON.stringify(body.large_items || [])
            );
            await stmt.run();
            
            try {
                // Ensure tracking_logs exists (failsafe)
                await env.DB.prepare('CREATE TABLE IF NOT EXISTS tracking_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL, status TEXT NOT NULL, description TEXT, images TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)').run();
                await env.DB.prepare("INSERT INTO tracking_logs (order_id, status, description) VALUES (?, 'pending', 'Захиалга бүртгэгдлээ')").bind(finalOrderId).run();
            } catch(e) {}
            
            return new Response(JSON.stringify({ success: true, orderId: finalOrderId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'PUT') {
            // typically PUT is for updating container assignments or statuses individually
            const body = await request.json();
            if (!body.orderId) return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });

            // Ensure columns exist on the fly during PUT
            try { await env.DB.prepare('ALTER TABLE orders ADD COLUMN weight TEXT').run(); } catch(e){}
            try { await env.DB.prepare('ALTER TABLE orders ADD COLUMN total_price TEXT').run(); } catch(e){}
            try { await env.DB.prepare('ALTER TABLE orders ADD COLUMN volume_items TEXT').run(); } catch(e){}

            // If updating container assignment only:
            let stmt;
            let logStatus = null;
            let logDesc = '';

            if (body.hasOwnProperty('containerId')) {
                 stmt = env.DB.prepare('UPDATE orders SET container_id = ? WHERE order_id = ?')
                             .bind(body.containerId, body.orderId);
                 logDesc = 'Контейнерт нэмэгдлээ';
            } else if (body.hasOwnProperty('status')) {
                 stmt = env.DB.prepare('UPDATE orders SET status = ? WHERE order_id = ?')
                             .bind(body.status, body.orderId);
                 logStatus = body.status;
            } else if (body.hasOwnProperty('weight') && body.hasOwnProperty('total_price')) {
                 const total = Number(body.total_price);
                 const weight = body.weight === null || body.weight === '' ? null : Number(body.weight);
                 let items;
                 try { items = typeof body.volume_items === 'string' ? JSON.parse(body.volume_items) : (body.volume_items || []); } catch { return new Response('Invalid items', { status: 400 }); }
                 if (!Number.isFinite(total) || total < 0 || weight !== null && (!Number.isFinite(weight) || weight <= 0) || !Array.isArray(items) || items.some(x => !x || typeof x.name !== 'string' || !Number.isFinite(x.price) || x.price < 0) || items.reduce((sum, x) => sum + x.price, 0) > total) return new Response('Invalid invoice', { status: 400 });
                 body.volume_items = JSON.stringify(items);
                 stmt = env.DB.prepare('UPDATE orders SET weight = ?, total_price = ?, volume_items = ? WHERE order_id = ?')
                             .bind(body.weight || null, body.total_price, body.volume_items || '[]', body.orderId);
                 logDesc = 'Үнэ тооцогдлоо';
            } else {
                 return new Response(JSON.stringify({ error: "Invalid update payload" }), { status: 400 });
            }
            
            await stmt.run();

            try {
                 if (logStatus) { 
                     await env.DB.prepare("INSERT INTO tracking_logs (order_id, status, description) VALUES (?, ?, 'Төлөв өөрчлөгдлөө')").bind(body.orderId, logStatus).run();
                 } else if (logDesc) {
                     const curr = await env.DB.prepare("SELECT status FROM orders WHERE order_id = ?").bind(body.orderId).first();
                     if (curr) {
                         await env.DB.prepare("INSERT INTO tracking_logs (order_id, status, description) VALUES (?, ?, ?)").bind(body.orderId, curr.status, logDesc).run();
                     }
                 }
            } catch(e) {}

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
