#!/usr/bin/env node
import crypto from 'node:crypto';
const JSONRPC='2.0'; let buffer=''; const serverName=process.argv[2]||'cong-cu';
function send(o){process.stdout.write(JSON.stringify(o)+'\n')} function result(id,v){send({jsonrpc:JSONRPC,id,result:v})}
async function j(url){let last; for(let i=0;i<3;i++){try{const r=await fetch(url,{headers:{'user-agent':'MCPHub VN tools/0.3'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return await r.json()}catch(e){last=e; await new Promise(r=>setTimeout(r,500*(i+1)))}} throw last}
async function t(url){const r=await fetch(url,{headers:{'user-agent':'MCPHub VN tools/0.3','accept-language':'vi,en;q=0.8'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.text()}
function strip(s){return String(s||'').replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function b64enc(s){return Buffer.from(String(s),'utf8').toString('base64')} function b64dec(s){return Buffer.from(String(s),'base64').toString('utf8')}
function randPass(len=16){const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*_-+='; let out=''; const a=new Uint32Array(len); crypto.webcrypto.getRandomValues(a); for(const x of a) out+=chars[x%chars.length]; return out}
function hexToRgb(hex){hex=String(hex).replace('#','').trim(); if(hex.length===3) hex=hex.split('').map(c=>c+c).join(''); const n=parseInt(hex,16); return {r:(n>>16)&255,g:(n>>8)&255,b:n&255}}
function rgbToHex(r,g,b){return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Number(x)|0)).toString(16).padStart(2,'0')).join('')}
const tools={
 'thoi-tiet':[
  {name:'hien-tai',description:'Thời tiết hiện tại theo địa điểm. Không cần API key.',inputSchema:{type:'object',properties:{dia_diem:{type:'string',description:'Ví dụ Hà Nội, Đà Nẵng, TP Hồ Chí Minh'}},required:['dia_diem']}},
  {name:'du-bao',description:'Dự báo thời tiết 1-7 ngày theo địa điểm.',inputSchema:{type:'object',properties:{dia_diem:{type:'string'},so_ngay:{type:'number',default:3}},required:['dia_diem']}}
 ],
 'ty-gia':[
  {name:'xem',description:'Tra tỷ giá, có VND.',inputSchema:{type:'object',properties:{tien_goc:{type:'string',default:'USD'},danh_sach:{type:'string',default:'VND,EUR,JPY,CNY'}}}},
  {name:'doi-tien',description:'Đổi tiền tệ.',inputSchema:{type:'object',properties:{so_tien:{type:'number'},tu:{type:'string'},sang:{type:'string'}},required:['so_tien','tu','sang']}}
 ],
 'crypto':[{name:'gia',description:'Tra giá crypto CoinGecko public.',inputSchema:{type:'object',properties:{coin:{type:'string',default:'bitcoin,ethereum,tether'},tien:{type:'string',default:'usd,vnd'}}}}],
 'tin-tuc':[{name:'moi-nhat',description:'Tin mới từ RSS VnExpress/Tuổi Trẻ.',inputSchema:{type:'object',properties:{nguon:{type:'string',enum:['vnexpress','tuoitre'],default:'vnexpress'},so_tin:{type:'number',default:8}}}}],
 'xo-so':[
  {name:'mien-bac',description:'Kết quả xổ số miền Bắc mới nhất.',inputSchema:{type:'object',properties:{}}},
  {name:'theo-mien',description:'Kết quả xổ số theo miền bac/trung/nam.',inputSchema:{type:'object',properties:{mien:{type:'string',enum:['bac','trung','nam'],default:'bac'}},required:['mien']}}
 ],
 'lich':[
  {name:'hom-nay',description:'Ngày giờ hiện tại, múi giờ Việt Nam.',inputSchema:{type:'object',properties:{}}},
  {name:'ngay-le-viet-nam',description:'Danh sách ngày lễ phổ biến Việt Nam theo năm.',inputSchema:{type:'object',properties:{nam:{type:'number'}}}}
 ],
 'gio-the-gioi':[{name:'xem',description:'Xem giờ hiện tại theo timezone IANA.',inputSchema:{type:'object',properties:{timezone:{type:'string',default:'Asia/Ho_Chi_Minh'}},required:['timezone']}}],
 'ma-qr':[{name:'tao-link',description:'Tạo link ảnh QR miễn phí cho nội dung văn bản/URL.',inputSchema:{type:'object',properties:{noi_dung:{type:'string'},kich_thuoc:{type:'string',default:'300x300'}},required:['noi_dung']}}],
 'tien-ich':[
  {name:'uuid',description:'Tạo UUID v4.',inputSchema:{type:'object',properties:{so_luong:{type:'number',default:1}}}},
  {name:'mat-khau',description:'Tạo mật khẩu ngẫu nhiên.',inputSchema:{type:'object',properties:{do_dai:{type:'number',default:16},so_luong:{type:'number',default:1}}}},
  {name:'base64-ma-hoa',description:'Mã hóa văn bản sang Base64.',inputSchema:{type:'object',properties:{van_ban:{type:'string'}},required:['van_ban']}},
  {name:'base64-giai-ma',description:'Giải mã Base64 sang văn bản.',inputSchema:{type:'object',properties:{base64:{type:'string'}},required:['base64']}},
  {name:'hash',description:'Tạo hash sha256/md5 cho văn bản.',inputSchema:{type:'object',properties:{van_ban:{type:'string'},kieu:{type:'string',enum:['sha256','md5'],default:'sha256'}},required:['van_ban']}}
 ],
 'mau-sac':[
  {name:'hex-sang-rgb',description:'Đổi màu HEX sang RGB.',inputSchema:{type:'object',properties:{hex:{type:'string'}},required:['hex']}},
  {name:'rgb-sang-hex',description:'Đổi RGB sang HEX.',inputSchema:{type:'object',properties:{r:{type:'number'},g:{type:'number'},b:{type:'number'}},required:['r','g','b']}}
 ]
};
async function geocode(q){
 const key=String(q||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 const preset={
  'ha noi':{name:'Hà Nội',country:'Việt Nam',latitude:21.0245,longitude:105.84117},'hanoi':{name:'Hà Nội',country:'Việt Nam',latitude:21.0245,longitude:105.84117},
  'ho chi minh':{name:'TP Hồ Chí Minh',country:'Việt Nam',latitude:10.8231,longitude:106.6297},'sai gon':{name:'TP Hồ Chí Minh',country:'Việt Nam',latitude:10.8231,longitude:106.6297},'tp ho chi minh':{name:'TP Hồ Chí Minh',country:'Việt Nam',latitude:10.8231,longitude:106.6297},
  'da nang':{name:'Đà Nẵng',country:'Việt Nam',latitude:16.0471,longitude:108.2068},'hue':{name:'Huế',country:'Việt Nam',latitude:16.4637,longitude:107.5909},'can tho':{name:'Cần Thơ',country:'Việt Nam',latitude:10.0452,longitude:105.7469},
  'hai phong':{name:'Hải Phòng',country:'Việt Nam',latitude:20.8449,longitude:106.6881},'nha trang':{name:'Nha Trang',country:'Việt Nam',latitude:12.2388,longitude:109.1967},'da lat':{name:'Đà Lạt',country:'Việt Nam',latitude:11.9404,longitude:108.4583}
 };
 if(preset[key]) return preset[key];
 try{const d=await j(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=vi&format=json`); if(d.results?.length) return d.results[0]}catch(e){}
 throw new Error('Không tìm thấy địa điểm')
}
function wt(c){return ({0:'Trời quang',1:'Ít mây',2:'Mây rải rác',3:'Nhiều mây',45:'Sương mù',61:'Mưa nhỏ',63:'Mưa vừa',65:'Mưa to',80:'Mưa rào nhẹ',81:'Mưa rào vừa',82:'Mưa rào mạnh',95:'Dông'})[c]||`Mã ${c}`}
async function lottery(mien='bac'){const url={bac:'https://www.minhngoc.net.vn/xo-so-mien-bac.html',trung:'https://www.minhngoc.net.vn/xo-so-mien-trung.html',nam:'https://www.minhngoc.net.vn/xo-so-mien-nam.html'}[mien]||'https://www.minhngoc.net.vn/xo-so-mien-bac.html'; const html=await t(url); const text=strip(html); const labels=['Đặc biệt','Giải nhất','Giải nhì','Giải ba','Giải tư','Giải năm','Giải sáu','Giải bảy']; const exp={'Đặc biệt':[5,1],'Giải nhất':[5,1],'Giải nhì':[5,2],'Giải ba':[5,6],'Giải tư':[4,4],'Giải năm':[4,6],'Giải sáu':[3,3],'Giải bảy':[2,4]}; const kq={}; for(let i=0;i<labels.length;i++){const lab=labels[i], a=text.indexOf(lab); if(a<0) continue; let b=text.length; for(let j2=i+1;j2<labels.length;j2++){const k=text.indexOf(labels[j2],a+lab.length); if(k>0){b=k;break}} const [digits,count]=exp[lab]; const nums=[...text.slice(a+lab.length,b).matchAll(new RegExp(`\\b\\d{${digits}}\\b`,'g'))].map(m=>m[0]).filter(x=>!/^20\\d{2}$/.test(x)).slice(0,count); if(nums.length) kq[lab]=nums} if(!kq['Đặc biệt']){const m=html.match(/giai.?db[\s\S]{0,800}?(\d{5})/i)||html.match(/Đặc biệt[\s\S]{0,800}?(\d{5})/i); if(m) kq['Đặc biệt']=[m[1]]} return {nguon:'minhngoc.net.vn',mien,ngay:(text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/)||[])[1]||null,ket_qua:kq,thoi_gian_lay:new Date().toISOString(),ghi_chu:'Dữ liệu scrape public, nên đối chiếu nguồn khi dùng chính thức.'}}
async function call(name,args={}){
 if(serverName==='thoi-tiet'){const loc=await geocode(args.dia_diem); const base=`latitude=${loc.latitude}&longitude=${loc.longitude}&timezone=auto`; if(name==='hien-tai'){const d=await j(`https://api.open-meteo.com/v1/forecast?${base}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`); const c=d.current; return {dia_diem:{ten:loc.name,quoc_gia:loc.country,vi_do:loc.latitude,kinh_do:loc.longitude},hien_tai:{thoi_gian:c.time,nhiet_do_c:c.temperature_2m,cam_giac_c:c.apparent_temperature,do_am_percent:c.relative_humidity_2m,gio_km_h:c.wind_speed_10m,thoi_tiet:wt(c.weather_code)},nguon:'open-meteo.com'}} if(name==='du-bao'){const days=Math.min(Math.max(Number(args.so_ngay||3),1),7); const d=await j(`https://api.open-meteo.com/v1/forecast?${base}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=${days}`); return {dia_diem:{ten:loc.name,quoc_gia:loc.country},du_bao:d.daily.time.map((ngay,i)=>({ngay,nhiet_do_cao_nhat_c:d.daily.temperature_2m_max[i],nhiet_do_thap_nhat_c:d.daily.temperature_2m_min[i],mua_mm:d.daily.precipitation_sum[i],thoi_tiet:wt(d.daily.weather_code[i])})),nguon:'open-meteo.com'}}}
 if(serverName==='ty-gia'){if(name==='xem'){const base=(args.tien_goc||'USD').toUpperCase(); const sy=(args.danh_sach||'VND,EUR,JPY,CNY').toUpperCase().split(',').map(x=>x.trim()).filter(Boolean); const d=await j(`https://open.er-api.com/v6/latest/${base}`); const out={}; for(const s of sy) if(d.rates?.[s]!=null) out[s]=d.rates[s]; return {tien_goc:base,ty_gia:out,ngay_cap_nhat:d.time_last_update_utc,nguon:'open.er-api.com'}} if(name==='doi-tien'){const from=args.tu.toUpperCase(), to=args.sang.toUpperCase(), amount=Number(args.so_tien); const d=await j(`https://open.er-api.com/v6/latest/${from}`); return {so_tien:amount,tu:from,sang:to,ty_gia:d.rates[to],ket_qua:amount*d.rates[to],nguon:'open.er-api.com'}}}
 if(serverName==='crypto'){return {nguon:'coingecko.com',gia:await j(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(args.coin||'bitcoin,ethereum,tether')}&vs_currencies=${encodeURIComponent(args.tien||'usd,vnd')}&include_24hr_change=true&include_last_updated_at=true`)}}
 if(serverName==='tin-tuc'){const src=args.nguon||'vnexpress', limit=Math.min(Math.max(Number(args.so_tin||8),1),20); const url=src==='tuoitre'?'https://tuoitre.vn/rss/tin-moi-nhat.rss':'https://vnexpress.net/rss/tin-moi-nhat.rss'; const xml=await t(url); return {nguon:src,url,tin:[...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0,limit).map(m=>({tieu_de:strip((m[0].match(/<title>([\s\S]*?)<\/title>/)||[])[1]),link:strip((m[0].match(/<link>([\s\S]*?)<\/link>/)||[])[1]),ngay_dang:strip((m[0].match(/<pubDate>([\s\S]*?)<\/pubDate>/)||[])[1]),tom_tat:strip((m[0].match(/<description>([\s\S]*?)<\/description>/)||[])[1]).slice(0,300)}))}}
 if(serverName==='xo-so'){if(name==='mien-bac') return lottery('bac'); if(name==='theo-mien') return lottery(args.mien||'bac')}
 if(serverName==='lich'){if(name==='hom-nay'){const now=new Date(); return {timezone:'Asia/Ho_Chi_Minh',iso:now.toISOString(),viet_nam:new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',dateStyle:'full',timeStyle:'medium'}).format(now)}} if(name==='ngay-le-viet-nam'){const y=Number(args.nam||new Date().getFullYear()); return {nam:y,ngay_le:[{ngay:`${y}-01-01`,ten:'Tết Dương lịch'},{ngay:`${y}-04-30`,ten:'Ngày Giải phóng miền Nam'},{ngay:`${y}-05-01`,ten:'Quốc tế Lao động'},{ngay:`${y}-09-02`,ten:'Quốc khánh Việt Nam'}],ghi_chu:'Chưa gồm Tết Âm lịch/Giỗ Tổ vì cần lịch âm.'}}}
 if(serverName==='gio-the-gioi'){const z=args.timezone||'Asia/Ho_Chi_Minh'; return {timezone:z,thoi_gian:new Intl.DateTimeFormat('vi-VN',{timeZone:z,dateStyle:'full',timeStyle:'medium'}).format(new Date()),iso:new Date().toISOString()}}
 if(serverName==='ma-qr'){const size=args.kich_thuoc||'300x300'; const url=`https://api.qrserver.com/v1/create-qr-code/?size=${encodeURIComponent(size)}&data=${encodeURIComponent(args.noi_dung)}`; return {noi_dung:args.noi_dung,kich_thuoc:size,link_anh_qr:url,nguon:'goqr.me/api'}}
 if(serverName==='tien-ich'){if(name==='uuid'){const n=Math.min(Math.max(Number(args.so_luong||1),1),50); return {uuid:Array.from({length:n},()=>crypto.randomUUID())}} if(name==='mat-khau'){const n=Math.min(Math.max(Number(args.so_luong||1),1),50), len=Math.min(Math.max(Number(args.do_dai||16),8),128); return {mat_khau:Array.from({length:n},()=>randPass(len)),do_dai:len}} if(name==='base64-ma-hoa') return {base64:b64enc(args.van_ban)}; if(name==='base64-giai-ma') return {van_ban:b64dec(args.base64)}; if(name==='hash'){const k=args.kieu||'sha256'; return {kieu:k,hash:crypto.createHash(k).update(String(args.van_ban),'utf8').digest('hex')}}}
 if(serverName==='mau-sac'){if(name==='hex-sang-rgb') return {hex:args.hex,rgb:hexToRgb(args.hex)}; if(name==='rgb-sang-hex') return {rgb:{r:args.r,g:args.g,b:args.b},hex:rgbToHex(args.r,args.g,args.b)}}
 throw new Error(`Không biết tool ${serverName}/${name}`)}
async function handle(msg){const {id,method,params}=msg; if(method==='initialize') return result(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:`${serverName}-mcp-vn`,version:'0.3.0'}}); if(method==='notifications/initialized') return; if(method==='tools/list') return result(id,{tools:tools[serverName]||[]}); if(method==='tools/call'){try{return result(id,{content:[{type:'text',text:JSON.stringify(await call(params?.name,params?.arguments||{}),null,2)}],isError:false})}catch(e){return result(id,{content:[{type:'text',text:`Lỗi: ${e.message||e}`}],isError:true})}} if(id!==undefined) send({jsonrpc:JSONRPC,id,error:{code:-32601,message:`Unknown method ${method}`}})}
process.stdin.on('data',c=>{buffer+=c.toString(); let i; while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i).trim(); buffer=buffer.slice(i+1); if(!line) continue; try{handle(JSON.parse(line))}catch(e){send({jsonrpc:JSONRPC,error:{code:-32700,message:e.message}})}}});
