export async function onRequestPost({ request, env }) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return new Response(JSON.stringify({ success: false, error: 'ID болон нууц үгээ оруулна уу.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Default fallbacks in case env vars aren't set yet during transition
    const correctId = env.ADMIN_ID || 'admin';
    const correctPass = env.ADMIN_PASSWORD || 'nominadmin123';

    if (id === correctId && password === correctPass) {
       return new Response(JSON.stringify({ 
           success: true, 
           token: 'admin_auth_token_' + Date.now(), 
           message: 'Амжилттай нэвтэрлээ' 
       }), {
           status: 200,
           headers: { 'Content-Type': 'application/json' },
       });
    }

    return new Response(JSON.stringify({ success: false, error: 'ID эсвэл нууц үг буруу байна.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
