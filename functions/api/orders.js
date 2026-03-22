export async function onRequestPost({ request, env }) {
  try {
    const data = await request.json();
    const orderId = 'NM' + Date.now().toString().slice(-8);

    // SQL statement to insert order
    const stmt = env.DB.prepare(`
        INSERT INTO Orders (
          id, type, branch, sender_name, sender_phone, sender_address, 
          item_category, item_quantity, receiver_name, receiver_phone, receiver_address
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      orderId, data.type, data.branch, 
      data.sender.name, data.sender.phone, data.sender.address,
      data.item.category, data.item.quantity, 
      data.receiver.name, data.receiver.phone, data.receiver.address
    );

    await stmt.run();

    // Insert initial tracking log
    await env.DB.prepare(`
        INSERT INTO TrackingLogs (order_id, status, location, description) 
        VALUES (?, '주문 접수', '웹사이트', '고객님이 주문을 완료했습니다.')
    `).bind(orderId).run();

    return Response.json({ success: true, orderId: orderId });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
