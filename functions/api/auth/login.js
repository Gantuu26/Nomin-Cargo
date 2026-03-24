export async function onRequestPost({ request, env }) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: 'И-мэйл болон нууц үгээ оруулна уу.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Fetch user from database
    const user = await env.DB.prepare(
      `SELECT id, name, email, phone, password_hash FROM users WHERE email = ?`
    ).bind(email).first();

    if (!user) {
      return new Response(JSON.stringify({ success: false, error: 'Хэрэглэгчийн мэдээлэл олдсонгүй.' }), {
        status: 401, // Unauthorized
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 2. Hash incoming password to compare
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const incomingPasswordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 3. Verify password
    if (incomingPasswordHash !== user.password_hash) {
      return new Response(JSON.stringify({ success: false, error: 'Нууц үг буруу байна.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 4. Return successful generic session representation
    // Normally you'd generate a JWT here. For simplicity in this D1 setup, we return user details 
    // to be stored in the frontend's localStorage securely.
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Амжилттай нэвтэрлээ.',
      user: safeUser
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
