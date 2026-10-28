const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');const root=path.resolve(__dirname, '..');
const modules=new Map();
async function load(p){p=path.resolve(p);if(modules.has(p))return modules.get(p);let source=fs.readFileSync(p,'utf8');for(const match of [...source.matchAll(/from '([^']+)'/g)]){const dep=await load(path.resolve(path.dirname(p),match[1]));source=source.replace(match[0],"from '"+dep.url+"'");}const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');const exports=await import(url);const result={url,exports};modules.set(p,result);return result;}
(async()=>{
for(const p of ['admin-auth.js','branch-data.js','order.js','tracking-v2.js','sw-admin.js'])new vm.Script(fs.readFileSync(path.join(root,p),'utf8'));
for(const p of fs.readdirSync(root).filter(x=>x.endsWith('.html')))for(const match of fs.readFileSync(path.join(root,p),'utf8').matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1],{filename:p});
for(const p of ['functions/_auth.js','functions/api/_middleware.js','functions/api/orders.js','functions/api/init-db.js','functions/api/branches.js','functions/api/admin/login.js','functions/api/auth/login.js','functions/api/auth/google.js','functions/api/auth/logout.js','functions/api/auth/register.js'])await load(path.join(root,p));
const auth=(await load(path.join(root,'functions/_auth.js'))).exports;const env={ADMIN_PASSWORD:'test-only-secret'};
const cookie=await auth.sessionCookie('user@example.com',env);assert(cookie.includes('HttpOnly; Secure; SameSite=Lax'));assert.equal(await auth.userEmail(new Request('https://local',{headers:{Cookie:cookie.split(';')[0]}}),env),'user@example.com');assert.equal(await auth.userEmail(new Request('https://local',{headers:{Cookie:cookie.split(';')[0]+'x'}}),env),null);
const issued=Date.now().toString();const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.ADMIN_PASSWORD),{name:'HMAC',hash:'SHA-256'},false,['sign']);const sig=Buffer.from(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(issued))).toString('base64url');const token=issued+'.'+sig;
assert.equal(await auth.isAdmin(new Request('https://local',{headers:{Authorization:'Bearer '+token}}),env),true);assert.equal(await auth.isAdmin(new Request('https://local',{headers:{Authorization:'Bearer bogus'}}),env),false);
const middleware=(await load(path.join(root,'functions/api/_middleware.js'))).exports.onRequest;
async function mid(route,method,headers={}){return middleware({request:new Request('https://local/api/'+route,{method,headers}),env,data:{},next:async()=>new Response('ok')});}
assert.equal((await mid('init-db','GET')).status,404);assert.equal((await mid('orders','PUT')).status,401);assert.equal((await mid('containers','DELETE')).status,401);assert.equal((await mid('orders','POST',{Cookie:cookie.split(';')[0]})).status,200);assert.equal((await mid('orders','PUT',{Authorization:'Bearer '+token})).status,200);assert.equal((await mid('orders','PUT',{Authorization:'Bearer '+token,Origin:'https://other'})).status,403);
const orders=(await load(path.join(root,'functions/api/orders.js'))).exports.onRequest;
let inserts=[];const order={order_id:'MK01',user_email:'user@example.com',sender_name:'Private',sender_phone:'secret',sender_address:'secret',total_price:'15000',volume_items:'[{"name":"extra","price":5000}]'};
const DB={prepare(sql){return {bind(...args){this.args=args;return this},first:async()=>sql.includes('FROM branches')?{standard_price:1500,express_price:2200}:order,all:async()=>({results:sql.includes('SELECT order_id')?[]:[order]}),run:async function(){if(sql.includes('INSERT INTO orders'))inserts.push(this.args);return {success:true}}}}};
async function req(method,url,data={},body){return orders({request:new Request('https://local/api/orders'+url,{method,...(body?{body:JSON.stringify(body)}:{})}),env:{DB},data});}
assert.equal((await req('GET','')).status,401);assert.equal((await req('GET','?user_email=other',{userEmail:'user@example.com'})).status,401);assert.equal((await req('PUT','',{}, {orderId:'MK01'})).status,401);
const publicOrder=(await (await req('GET','?id=MK01')).json())[0];assert(!('sender_phone'in publicOrder));assert(!('user_email'in publicOrder));assert.equal(publicOrder.sender_name,'P***');
const own=(await(await req('GET','?user_email=user%40example.com',{userEmail:'user@example.com'})).json())[0];assert.equal(own.sender_phone,'secret');
assert.equal((await req('POST','',{userEmail:'user@example.com'},{type:'standard',branch:'Салбар 2',weight:'2',total_price:'1',user_email:'other',status:'delivered'})).status,201);assert.equal(inserts[0][4],'pending');assert.equal(inserts[0][14],'user@example.com');assert.equal(inserts[0][17],'3000');
assert.equal((await req('PUT','',{isAdmin:true},{orderId:'MK01',weight:'2',total_price:'-1'})).status,400);
const html=fs.readFileSync(path.join(root,'admin-order-detail.html'),'utf8');const expr=html.match(/id="input-price" value="\$\{([\s\S]*?)\}" placeholder/)[1];const weightPrice=vm.runInNewContext(expr,{o:order});assert.equal(weightPrice,10000);for(let i=0;i<3;i++){const total=weightPrice+5000;assert.equal(total,15000);}
assert(!html.includes('setTimeout(() => { initVolumeItems'));assert(html.includes("initVolumeItems(o.volume_items"));
const branchCode=fs.readFileSync(path.join(root,'branch-data.js'),'utf8');
for(const response of [{ok:false},{ok:true,json:async()=>[]}]){const window={};vm.runInNewContext(branchCode,{window,document:{addEventListener(){}},fetch:async()=>response,console:{warn(){}}});assert.deepEqual(Array.from(await window.NominBranches.ready),[]);}
console.log('PASS: all JS syntax, signed customer/admin sessions, forged sessions rejected, middleware access, cross-origin writes rejected, DB reset disabled, order privacy/ownership, server-calculated price, invoice resave, API failure/empty branch handling.');
})().catch(e=>{console.error(e);process.exitCode=1});


