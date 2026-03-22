export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const orderId = url.searchParams.get('id');

  if (!orderId) {
    return Response.json({ success: false, error: 'Order ID is required' }, { status: 400 });
  }

  try {
    // 1. Fetch Order Info
    const order = await env.DB.prepare(`SELECT * FROM Orders WHERE id = ?`).bind(orderId).first();

    if (!order) {
      return Response.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch Tracking Logs
    const result = await env.DB.prepare(`SELECT * FROM TrackingLogs WHERE order_id = ? ORDER BY logged_at DESC`).bind(orderId).all();

    return Response.json({
      success: true,
      order: order,
      trackingLogs: result.results
    });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
