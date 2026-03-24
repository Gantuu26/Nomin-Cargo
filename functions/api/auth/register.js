export async function onRequestPost({ request, env }) {
  try {
    // === AUTO SETUP DATABASE ===
    // This safely ensures the tables exist without dropping data or failing on Windows wrangler execute
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS banners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_url TEXT NOT NULL,
          link_url TEXT,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { name, email, phone, password } = await request.json();

    if (!name || !email || !phone || !password) {
      return new Response(JSON.stringify({ success: false, error: 'Код/мэдээлэл дутуу байна.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 1. Hash the password using Web Crypto API (SHA-256)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // 2. Check if email already exists
    const existingUser = await env.DB.prepare(
      `SELECT id FROM users WHERE email = ?`
    ).bind(email).first();

    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: 'Энэ и-мэйл хаягаар бүртгэлтэй хэрэглэгч байна.' }), {
        status: 409, // Conflict
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 3. Insert into database
    const result = await env.DB.prepare(
      `INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`
    ).bind(name, email, phone, passwordHash).run();

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Бүртгэл амжилттай үүслээ',
        user: { name, email, phone }
      }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error("Failed to insert user");
    }

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
