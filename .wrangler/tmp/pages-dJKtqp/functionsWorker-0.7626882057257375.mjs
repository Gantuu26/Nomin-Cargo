var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../.wrangler/tmp/bundle-DoQHyB/checked-fetch.js
var require_checked_fetch = __commonJS({
  "../.wrangler/tmp/bundle-DoQHyB/checked-fetch.js"() {
    var urls = /* @__PURE__ */ new Set();
    function checkURL(request, init) {
      const url = request instanceof URL ? request : new URL(
        (typeof request === "string" ? new Request(request, init) : request).url
      );
      if (url.port && url.port !== "443" && url.protocol === "https:") {
        if (!urls.has(url.toString())) {
          urls.add(url.toString());
          console.warn(
            `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
          );
        }
      }
    }
    __name(checkURL, "checkURL");
    globalThis.fetch = new Proxy(globalThis.fetch, {
      apply(target, thisArg, argArray) {
        const [request, init] = argArray;
        checkURL(request, init);
        return Reflect.apply(target, thisArg, argArray);
      }
    });
  }
});

// api/admin/login.js
var import_checked_fetch = __toESM(require_checked_fetch());
async function onRequestPost({ request, env }) {
  try {
    const { id, password } = await request.json();
    if (!id || !password) {
      return new Response(JSON.stringify({ success: false, error: "ID \u0431\u043E\u043B\u043E\u043D \u043D\u0443\u0443\u0446 \u04AF\u0433\u044D\u044D \u043E\u0440\u0443\u0443\u043B\u043D\u0430 \u0443\u0443." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const correctId = env.ADMIN_ID || "admin";
    const correctPass = env.ADMIN_PASSWORD || "nominadmin123";
    if (id === correctId && password === correctPass) {
      return new Response(JSON.stringify({
        success: true,
        token: "admin_auth_token_" + Date.now(),
        message: "\u0410\u043C\u0436\u0438\u043B\u0442\u0442\u0430\u0439 \u043D\u044D\u0432\u0442\u044D\u0440\u043B\u044D\u044D"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: false, error: "ID \u044D\u0441\u0432\u044D\u043B \u043D\u0443\u0443\u0446 \u04AF\u0433 \u0431\u0443\u0440\u0443\u0443 \u0431\u0430\u0439\u043D\u0430." }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost, "onRequestPost");

// api/auth/login.js
var import_checked_fetch2 = __toESM(require_checked_fetch());
async function onRequestPost2({ request, env }) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return new Response(JSON.stringify({ success: false, error: "\u0418-\u043C\u044D\u0439\u043B \u0431\u043E\u043B\u043E\u043D \u043D\u0443\u0443\u0446 \u04AF\u0433\u044D\u044D \u043E\u0440\u0443\u0443\u043B\u043D\u0430 \u0443\u0443." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const user = await env.DB.prepare(
      `SELECT id, name, email, phone, password_hash FROM users WHERE email = ?`
    ).bind(email).first();
    if (!user) {
      return new Response(JSON.stringify({ success: false, error: "\u0425\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447\u0438\u0439\u043D \u043C\u044D\u0434\u044D\u044D\u043B\u044D\u043B \u043E\u043B\u0434\u0441\u043E\u043D\u0433\u04AF\u0439." }), {
        status: 401,
        // Unauthorized
        headers: { "Content-Type": "application/json" }
      });
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const incomingPasswordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    if (incomingPasswordHash !== user.password_hash) {
      return new Response(JSON.stringify({ success: false, error: "\u041D\u0443\u0443\u0446 \u04AF\u0433 \u0431\u0443\u0440\u0443\u0443 \u0431\u0430\u0439\u043D\u0430." }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    return new Response(JSON.stringify({
      success: true,
      message: "\u0410\u043C\u0436\u0438\u043B\u0442\u0442\u0430\u0439 \u043D\u044D\u0432\u0442\u044D\u0440\u043B\u044D\u044D.",
      user: safeUser
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost2, "onRequestPost");

// api/auth/register.js
var import_checked_fetch3 = __toESM(require_checked_fetch());
async function onRequestPost3({ request, env }) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS banners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          image_url TEXT NOT NULL,
          link_url TEXT,
          active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
    const { name, email, phone, password } = await request.json();
    if (!name || !email || !phone || !password) {
      return new Response(JSON.stringify({ success: false, error: "\u041A\u043E\u0434/\u043C\u044D\u0434\u044D\u044D\u043B\u044D\u043B \u0434\u0443\u0442\u0443\u0443 \u0431\u0430\u0439\u043D\u0430." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const existingUser = await env.DB.prepare(
      `SELECT id FROM users WHERE email = ?`
    ).bind(email).first();
    if (existingUser) {
      return new Response(JSON.stringify({ success: false, error: "\u042D\u043D\u044D \u0438-\u043C\u044D\u0439\u043B \u0445\u0430\u044F\u0433\u0430\u0430\u0440 \u0431\u04AF\u0440\u0442\u0433\u044D\u043B\u0442\u044D\u0439 \u0445\u044D\u0440\u044D\u0433\u043B\u044D\u0433\u0447 \u0431\u0430\u0439\u043D\u0430." }), {
        status: 409,
        // Conflict
        headers: { "Content-Type": "application/json" }
      });
    }
    const result = await env.DB.prepare(
      `INSERT INTO users (name, email, phone, password_hash) VALUES (?, ?, ?, ?)`
    ).bind(name, email, phone, passwordHash).run();
    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: "\u0411\u04AF\u0440\u0442\u0433\u044D\u043B \u0430\u043C\u0436\u0438\u043B\u0442\u0442\u0430\u0439 \u04AF\u04AF\u0441\u043B\u044D\u044D",
        user: { name, email, phone }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      throw new Error("Failed to insert user");
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequestPost3, "onRequestPost");

// api/upload.js
var import_checked_fetch4 = __toESM(require_checked_fetch());
async function onRequestPost4({ request, env }) {
  try {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("filename") || `img_${Date.now()}.webp`;
    const imageBuffer = await request.arrayBuffer();
    if (imageBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: "Empty file" }), { status: 400 });
    }
    await env.BUCKET.put(fileName, imageBuffer, {
      httpMetadata: { contentType: "image/webp" }
    });
    const imageUrl = `/api/upload?file=${fileName}`;
    return new Response(JSON.stringify({ success: true, url: imageUrl }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequestPost4, "onRequestPost");
async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const fileName = url.searchParams.get("file");
    if (!fileName) {
      return new Response("Missing file parameter", { status: 400 });
    }
    const object = await env.BUCKET.get(fileName);
    if (object === null) {
      return new Response("Object Not Found", { status: 404 });
    }
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=31536000");
    return new Response(object.body, { headers });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
__name(onRequestGet, "onRequestGet");

// api/banners.js
var import_checked_fetch5 = __toESM(require_checked_fetch());
async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM banners ORDER BY created_at DESC").all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare("INSERT INTO banners (title, subtitle, type, imageUrl, linkUrl, active) VALUES (?, ?, ?, ?, ?, ?)").bind(body.title || "", body.subtitle || "", body.type || "standard", body.imageUrl, body.linkUrl || "", body.active !== void 0 ? body.active : 1).run();
      return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "PUT") {
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      if (Object.keys(body).length === 2 && body.active !== void 0) {
        await env.DB.prepare("UPDATE banners SET active = ? WHERE id = ?").bind(body.active, body.id).run();
      } else {
        await env.DB.prepare("UPDATE banners SET title = ?, subtitle = ?, type = ?, imageUrl = ?, linkUrl = ?, active = ? WHERE id = ?").bind(body.title || "", body.subtitle || "", body.type || "standard", body.imageUrl || "", body.linkUrl || "", body.active !== void 0 ? body.active : 1, body.id).run();
      }
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "DELETE") {
      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      await env.DB.prepare("DELETE FROM banners WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest, "onRequest");

// api/containers.js
var import_checked_fetch6 = __toESM(require_checked_fetch());
async function onRequest2(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM containers ORDER BY created_at DESC").all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const { id: containerId, name, status } = body;
      const stmt = env.DB.prepare("INSERT INTO containers (id, name, status) VALUES (?, ?, ?)").bind(containerId, name, status);
      await stmt.run();
      return new Response(JSON.stringify({ success: true, id: containerId }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "PUT") {
      const body = await request.json();
      const { id: containerId, status } = body;
      if (!containerId || !status) {
        return new Response(JSON.stringify({ error: "Missing id or status" }), { status: 400 });
      }
      const stmt = env.DB.prepare("UPDATE containers SET status = ? WHERE id = ?").bind(status, containerId);
      await stmt.run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "DELETE") {
      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      await env.DB.prepare("UPDATE orders SET container_id = NULL WHERE container_id = ?").bind(id).run();
      await env.DB.prepare("DELETE FROM containers WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest2, "onRequest");

// api/init-db.js
var import_checked_fetch7 = __toESM(require_checked_fetch());
async function onRequest3(context) {
  const schema = `
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS containers;
    DROP TABLE IF EXISTS notifications;
    DROP TABLE IF EXISTS banners;
    DROP TABLE IF EXISTS users;

    CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE containers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE orders (
        order_id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        branch TEXT,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        container_id TEXT,
        
        sender_name TEXT,
        sender_phone TEXT,
        sender_address TEXT,
        
        receiver_name TEXT,
        receiver_phone TEXT,
        receiver_address TEXT,
        
        item_category TEXT,
        item_quantity TEXT
    );

    CREATE TABLE notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        subtitle TEXT,
        type TEXT,
        imageUrl TEXT NOT NULL,
        linkUrl TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    const statements = schema.split(";").map((s) => s.trim()).filter((s) => s.length > 0);
    const batch = statements.map((s) => context.env.DB.prepare(s));
    await context.env.DB.batch(batch);
    return new Response(JSON.stringify({ success: true, message: "Database tables initialized successfully" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
__name(onRequest3, "onRequest");

// api/notifications.js
var import_checked_fetch8 = __toESM(require_checked_fetch());
async function onRequest4(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT * FROM notifications ORDER BY date DESC").all();
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const body = await request.json();
      await env.DB.prepare("INSERT INTO notifications (title, content) VALUES (?, ?)").bind(body.title, body.content || "").run();
      return new Response(JSON.stringify({ success: true }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "PUT") {
      const body = await request.json();
      if (!body.id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      await env.DB.prepare("UPDATE notifications SET title = ?, content = ? WHERE id = ?").bind(body.title, body.content || "", body.id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "DELETE") {
      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      await env.DB.prepare("DELETE FROM notifications WHERE id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest4, "onRequest");

// api/orders.js
var import_checked_fetch9 = __toESM(require_checked_fetch());
async function onRequest5(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  try {
    if (request.method === "GET") {
      const email = url.searchParams.get("user_email");
      let results;
      if (email && email !== "none") {
        try {
          await env.DB.prepare("ALTER TABLE orders ADD COLUMN user_email TEXT").run();
        } catch (e) {
        }
        const stmt = env.DB.prepare("SELECT * FROM orders WHERE user_email = ? ORDER BY date DESC").bind(email);
        results = (await stmt.all()).results;
      } else if (email === "none") {
        results = [];
      } else {
        const stmt = env.DB.prepare("SELECT * FROM orders ORDER BY date DESC");
        results = (await stmt.all()).results;
      }
      return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "POST") {
      const body = await request.json();
      const countStmt = env.DB.prepare("SELECT order_id FROM orders WHERE order_id LIKE 'MN%'");
      const allMNs = await countStmt.all();
      let maxNum = 0;
      if (allMNs.results && allMNs.results.length > 0) {
        allMNs.results.forEach((row) => {
          const num = parseInt(row.order_id.substring(2), 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        });
      }
      let finalOrderId = "MN" + String(maxNum + 1).padStart(2, "0");
      try {
        await env.DB.prepare("ALTER TABLE orders ADD COLUMN user_email TEXT").run();
      } catch (e) {
      }
      const stmt = env.DB.prepare(`
                INSERT INTO orders (
                    order_id, type, branch, date, status, container_id,
                    sender_name, sender_phone, sender_address,
                    receiver_name, receiver_phone, receiver_address,
                    item_category, item_quantity, user_email
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).bind(
        finalOrderId,
        body.type,
        body.branch || "",
        body.date || (/* @__PURE__ */ new Date()).toISOString(),
        body.status || "pending",
        body.containerId || null,
        body.sender?.name || "",
        body.sender?.phone || "",
        body.sender?.address || "",
        body.receiver?.name || "",
        body.receiver?.phone || "",
        body.receiver?.address || "",
        body.item?.category || body.items?.[0]?.category || "",
        body.item?.quantity || body.items?.[0]?.quantity || "",
        body.user_email || ""
      );
      await stmt.run();
      return new Response(JSON.stringify({ success: true, orderId: finalOrderId }), { status: 201, headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "PUT") {
      const body = await request.json();
      if (!body.orderId) return new Response(JSON.stringify({ error: "Missing orderId" }), { status: 400 });
      let stmt;
      if (body.hasOwnProperty("containerId")) {
        stmt = env.DB.prepare("UPDATE orders SET container_id = ? WHERE order_id = ?").bind(body.containerId, body.orderId);
      } else if (body.hasOwnProperty("status")) {
        stmt = env.DB.prepare("UPDATE orders SET status = ? WHERE order_id = ?").bind(body.status, body.orderId);
      } else {
        return new Response(JSON.stringify({ error: "Invalid update payload" }), { status: 400 });
      }
      await stmt.run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    if (request.method === "DELETE") {
      if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
      await env.DB.prepare("DELETE FROM orders WHERE order_id = ?").bind(id).run();
      return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } });
    }
    return new Response("Method not allowed", { status: 405 });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
__name(onRequest5, "onRequest");

// ../.wrangler/tmp/pages-dJKtqp/functionsRoutes-0.9697179299672739.mjs
var routes = [
  {
    routePath: "/api/admin/login",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/auth/login",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/auth/register",
    mountPath: "/api/auth",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/upload",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost4]
  },
  {
    routePath: "/api/banners",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/containers",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/init-db",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/notifications",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/orders",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  }
];

// ../.wrangler/tmp/bundle-DoQHyB/middleware-loader.entry.ts
var import_checked_fetch16 = __toESM(require_checked_fetch());

// ../.wrangler/tmp/bundle-DoQHyB/middleware-insertion-facade.js
var import_checked_fetch14 = __toESM(require_checked_fetch());

// ../node_modules/wrangler/templates/pages-template-worker.ts
var import_checked_fetch11 = __toESM(require_checked_fetch());

// ../node_modules/path-to-regexp/dist.es2015/index.js
var import_checked_fetch10 = __toESM(require_checked_fetch());
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var import_checked_fetch12 = __toESM(require_checked_fetch());
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
var import_checked_fetch13 = __toESM(require_checked_fetch());
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-DoQHyB/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var import_checked_fetch15 = __toESM(require_checked_fetch());
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-DoQHyB/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.7626882057257375.mjs.map
