export async function onRequestPost({ request, env }) {
  try {
    const formData = await request.formData();
    const orderId = formData.get('orderId');
    const files = formData.getAll('images');

    if (!orderId || !files || files.length === 0) {
      return Response.json({ success: false, error: 'orderId and images are required' }, { status: 400 });
    }

    const uploadedUrls = [];

    // Process each uploaded file
    for (const file of files) {
      const fileName = `${orderId}/${Date.now()}-${file.name}`;
      
      // Upload to Cloudflare R2 bucket
      await env.BUCKET.put(fileName, file.stream(), {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream',
        }
      });

      uploadedUrls.push(fileName);
    }

    return Response.json({ success: true, uploadedImages: uploadedUrls });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
