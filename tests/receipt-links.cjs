const fs=require('fs'),path=require('path'),assert=require('assert/strict'),vm=require('vm');
const root=path.resolve(__dirname,'..');const cache=new Map();
async function load(p){p=path.resolve(root,p);if(cache.has(p))return cache.get(p);let source=fs.readFileSync(p,'utf8');for(const m of [...source.matchAll(/from '([^']+)'/g)]){const dep=await load(path.resolve(path.dirname(p),m[1]));source=source.replace(m[0],"from '"+dep.url+"'");}const url='data:text/javascript;base64,'+Buffer.from(source).toString('base64');const result={url,exports:await import(url)};cache.set(p,result);return result;}
(async()=>{
 const env={ADMIN_PASSWORD:'test-only-receipt-secret'};
 const auth=(await load('functions/_auth.js')).exports;
 const access=await auth.receiptToken('MK01',env);
 assert(await auth.canReadReceipt('MK01',access,env));
 assert.equal(await auth.canReadReceipt('MK02',access,env),false);
 assert.equal(await auth.canReadReceipt('MK01',access+'x',env),false);
 assert.equal(await auth.canReadReceipt('MK01',await auth.receiptToken('MK01',env,Date.now()-1),env),false);
 assert.equal(await auth.canReadReceipt('MK01',access,{ADMIN_PASSWORD:'changed'}),false);
 const order={order_id:'MK01',user_email:'owner@example.com',sender_name:'Full Sender',sender_phone:'01012345678',sender_address:'Sender address',receiver_name:'Full Receiver',receiver_phone:'99112233',receiver_address:'Receiver address',item_category:'Parcel',total_price:'15000'};
 let queries=0;env.DB={prepare(sql){queries++;return {bind(){return this},first:async()=>order}}};
 const mint=(await load('functions/api/receipt-link.js')).exports.onRequestGet;
 assert.equal((await mint({request:new Request('https://local/api/receipt-link?id=MK01'),env,data:{}})).status,401);assert.equal(queries,0);
 const result=await mint({request:new Request('https://local/api/receipt-link?id=MK01'),env,data:{isAdmin:true}});const link=new URL((await result.json()).url);assert.equal(link.searchParams.get('id'),'MK01');assert(!link.searchParams.has('access'));assert(link.hash.startsWith('#access='));assert(!link.href.includes('Full'));
 const orders=(await load('functions/api/orders.js')).exports.onRequest;
 async function get(id,token){return orders({request:new Request('https://local/api/orders?id='+id,{headers:token?{'X-Receipt-Token':token}:{}}),env,data:{}});}
 const shared=(await(await get('MK01',access)).json())[0];assert.equal(shared.sender_name,'Full Sender');assert.equal(shared.sender_phone,'01012345678');assert.equal(shared.receiver_address,'Receiver address');assert.equal(shared.total_price,'15000');assert(!('user_email'in shared));
 const masked=(await(await get('MK01')).json())[0];assert.equal(masked.sender_name,'F***');assert(!('sender_address'in masked));
 assert.equal((await get('MK02',access)).status,403);assert.equal((await get('MK01',access+'x')).status,403);
 const html=fs.readFileSync(path.join(root,'admin-order-detail.html'),'utf8');const send=html.match(/    function sendTemplateSms\(message\) \{[\s\S]*?\n    \}/)[0];
 for(const [ua,separator]of [['Android','?'],['iPhone','&']]){const ctx=vm.createContext({currentSmsPhone:'+821012345678',navigator:{userAgent:ua},window:{location:{}},encodeURIComponent});vm.runInContext(send,ctx);ctx.message='Line 1\n'+link.href;vm.runInContext('sendTemplateSms(message)',ctx);assert.equal(ctx.window.location.href,'sms:+821012345678'+separator+'body='+encodeURIComponent(ctx.message));}
 const receipt=fs.readFileSync(path.join(root,'receipt.html'),'utf8');assert(receipt.includes('name="referrer" content="no-referrer"'));assert(receipt.includes("'X-Receipt-Token': access"));for(const match of receipt.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
 console.log('PASS: protected receipt minting, full customer details, public masking, order-bound/tampered/expired tokens, secret rotation, private URL fragments and Android/iPhone SMS drafts.');
})().catch(e=>{console.error(e);process.exitCode=1;});
