// export const onRequest = async (context) => { ... }
export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // for operations on a specific container

    try {
        if (request.method === 'GET') {
            const { results } = await env.DB.prepare('SELECT * FROM containers ORDER BY created_at DESC').all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }
        
        if (request.method === 'POST') {
            const body = await request.json();
            const { id: containerId, name, status } = body;
            
            const stmt = env.DB.prepare('INSERT INTO containers (id, name, status) VALUES (?, ?, ?)')
                               .bind(containerId, name, status);
            await stmt.run();
            
            return new Response(JSON.stringify({ success: true, id: containerId }), { status: 201, headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'PUT') {
            const body = await request.json();
            const { id: containerId, status } = body; // Typically we just update status
            
            if (!containerId || !status) {
                return new Response(JSON.stringify({ error: "Missing id or status" }), { status: 400 });
            }

            const stmt = env.DB.prepare('UPDATE containers SET status = ? WHERE id = ?')
                               .bind(status, containerId);
            await stmt.run();
            
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        if (request.method === 'DELETE') {
            if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

            // delete orders inside the container first or set container_id to null
            await env.DB.prepare('UPDATE orders SET container_id = NULL WHERE container_id = ?').bind(id).run();
            await env.DB.prepare('DELETE FROM containers WHERE id = ?').bind(id).run();
            
            return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
        }

        return new Response("Method not allowed", { status: 405 });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}
