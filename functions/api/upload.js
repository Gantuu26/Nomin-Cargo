export async function onRequestPost({ request, env }) {
    try {
        const url = new URL(request.url);
        const fileName = url.searchParams.get('filename') || `img_${Date.now()}.webp`;
        
        // Read the binary data (the WEBP image sent from the frontend)
        const imageBuffer = await request.arrayBuffer();

        if (imageBuffer.byteLength === 0) {
            return new Response(JSON.stringify({ error: "Empty file" }), { status: 400 });
        }

        // Save to R2 Bucket
        await env.BUCKET.put(fileName, imageBuffer, {
            httpMetadata: { contentType: 'image/webp' }
        });

        // The URL to access the image will be our GET endpoint
        const imageUrl = `/api/upload?file=${fileName}`;

        return new Response(JSON.stringify({ success: true, url: imageUrl }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const fileName = url.searchParams.get('file');

        if (!fileName) {
            return new Response("Missing file parameter", { status: 400 });
        }

        const object = await env.BUCKET.get(fileName);

        if (object === null) {
            return new Response("Object Not Found", { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        // Cache heavily for images
        headers.set('Cache-Control', 'public, max-age=31536000'); 

        return new Response(object.body, { headers });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
