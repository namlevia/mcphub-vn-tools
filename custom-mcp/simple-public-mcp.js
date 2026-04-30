#!/usr/bin/env node
const JSONRPC='2.0'; let buffer='';
const serverName = process.argv[2] || 'public';
function send(o){process.stdout.write(JSON.stringify(o)+'\n')}
function result(id,v){send({jsonrpc:JSONRPC,id,result:v})}
function err(id,c,m){send({jsonrpc:JSONRPC,id,error:{code:c,message:m}})}
async function j(url){const r=await fetch(url,{headers:{'user-agent':'MCPHub VN public tools/0.2'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return await r.json()}
async function t(url){const r=await fetch(url,{headers:{'user-agent':'MCPHub VN public tools/0.2','accept-language':'vi,en;q=0.8'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return await r.text()}
function strip(s){return String(s||'').replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
function pick(obj, keys){const out={}; for(const k of keys){ if(obj && obj[k] != null) out[k]=obj[k]; } return out}
const tools={
 weather:[
  {name:'current',description:'Thời tiết hiện tại theo địa điểm. Không cần API key, dùng Open-Meteo.',inputSchema:{type:'object',properties:{location:{type:'string',description:'Tên địa điểm, ví dụ Hà Nội, Đà Nẵng, TP Hồ Chí Minh'}},required:['location']}},
  {name:'forecast',description:'Dự báo thời tiết 1-7 ngày theo địa điểm. Không cần API key.',inputSchema:{type:'object',properties:{location:{type:'string',description:'Tên địa điểm'},days:{type:'number',description:'Số ngày dự báo, 1-7',default:3}},required:['location']}}
 ],
 exchange:[
  {name:'rates',description:'Tra tỷ giá tiền tệ, hỗ trợ VND. Không cần API key.',inputSchema:{type:'object',properties:{base:{type:'string',description:'Mã tiền tệ gốc, ví dụ USD',default:'USD'},symbols:{type:'string',description:'Danh sách mã tiền tệ, ví dụ VND,EUR,JPY,CNY',default:'VND,EUR,JPY,CNY'}}}},
  {name:'convert',description:'Đổi tiền tệ, hỗ trợ VND. Không cần API key.',inputSchema:{type:'object',properties:{amount:{type:'number',description:'Số tiền'},from:{type:'string',description:'Từ tiền tệ, ví dụ USD'},to:{type:'string',description:'Sang tiền tệ, ví dụ VND'}},required:['amount','from','to']}}
 ],
 crypto:[
  {name:'price',description:'Tra giá crypto bằng CoinGecko public API. Không cần API key.',inputSchema:{type:'object',properties:{ids:{type:'string',description:'CoinGecko ids, ví dụ bitcoin,ethereum,tether',default:'bitcoin,ethereum,tether'},vs:{type:'string',description:'Tiền quy đổi, ví dụ usd,vnd',default:'usd,vnd'}}}}
 ],
 news:[
  {name:'latest',description:'Đọc tin mới từ RSS công khai VnExpress/Tuổi Trẻ. Không cần API key.',inputSchema:{type:'object',properties:{source:{type:'string',description:'Nguồn tin: vnexpress hoặc tuoitre',enum:['vnexpress','tuoitre'],default:'vnexpress'},limit:{type:'number',description:'Số tin muốn lấy, 1-20',default:8}}}}
 ],
 lottery:[
  {name:'north-latest',description:'Kết quả xổ số miền Bắc mới nhất. Không cần API key.',inputSchema:{type:'object',properties:{}}},
  {name:'by-region',description:'Kết quả xổ số theo miền: bac/trung/nam. Không cần API key.',inputSchema:{type:'object',properties:{region:{type:'string',enum:['bac','trung','nam'],default:'bac'}},required:['region']}}
 ]
};
async function geocode(location){const data=await j(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=vi&format=json`); if(!data.results?.length) throw new Error('Không tìm thấy địa điểm'); return data.results[0]}
function weatherText(code){const map={0:'Trời quang',1:'Ít mây',2:'Mây rải rác',3:'Nhiều mây',45:'Sương mù',48:'Sương mù đóng băng',51:'Mưa phùn nhẹ',53:'Mưa phùn vừa',55:'Mưa phùn dày',61:'Mưa nhỏ',63:'Mưa vừa',65:'Mưa to',80:'Mưa rào nhẹ',81:'Mưa rào vừa',82:'Mưa rào mạnh',95:'Dông'}; return map[code]||`Mã thời tiết ${code}`}
async function parseLottery(region='bac'){
  const map={bac:'https://www.minhngoc.net.vn/xo-so-mien-bac.html',trung:'https://www.minhngoc.net.vn/xo-so-mien-trung.html',nam:'https://www.minhngoc.net.vn/xo-so-mien-nam.html'};
  const url=map[region]||map.bac; const html=await t(url);
  // Minh Ngọc có cấu trúc nhiều thẻ td. Cách này ưu tiên bắt block gần chữ giải, rồi lọc số đúng độ dài theo từng giải.
  let text=strip(html);
  const date=(text.match(/(\d{1,2}[-\/]\d{1,2}[-\/]\d{4})/i)||[])[1]||null;
  const labels=['Đặc biệt','Giải nhất','Giải nhì','Giải ba','Giải tư','Giải năm','Giải sáu','Giải bảy'];
  const expected={'Đặc biệt':[5,1],'Giải nhất':[5,1],'Giải nhì':[5,2],'Giải ba':[5,6],'Giải tư':[4,4],'Giải năm':[4,6],'Giải sáu':[3,3],'Giải bảy':[2,4]};
  const results={};
  for(let i=0;i<labels.length;i++){
    const label=labels[i]; const a=text.indexOf(label); if(a<0) continue;
    let b=text.length; for(let j=i+1;j<labels.length;j++){ const k=text.indexOf(labels[j], a+label.length); if(k>0){b=k; break;} }
    const seg=text.slice(a+label.length,b);
    const [digits,count]=expected[label];
    let nums=[...seg.matchAll(new RegExp(`\\b\\d{${digits}}\\b`,'g'))].map(m=>m[0]);
    nums=nums.filter(x=>!/^20\d{2}$/.test(x)).slice(0,count);
    if(nums.length) results[label]=nums;
  }
  // fallback bắt giải đặc biệt từ class/keyword nếu text tuyến tính bỏ sót
  if(!results['Đặc biệt']){
    const m=html.match(/giai.?db[\s\S]{0,800}?(\d{5})/i)||html.match(/Đặc biệt[\s\S]{0,800}?(\d{5})/i);
    if(m) results['Đặc biệt']=[m[1]];
  }
  const ok=Object.keys(results).length>=4;
  return {nguon:'minhngoc.net.vn', mien:region, ngay:date, ket_qua:results, thoi_gian_lay:new Date().toISOString(), thanh_cong:ok, ghi_chu: ok?'Đã lọc theo cấu trúc giải cơ bản; nên đối chiếu nguồn khi dùng chính thức.':'Không parse đủ bảng, nguồn có thể đổi cấu trúc.'};
}
async function callTool(name,args={}){
 if(serverName==='weather'){
  const loc=await geocode(args.location); const base=`latitude=${loc.latitude}&longitude=${loc.longitude}&timezone=auto`;
  if(name==='current'){const data=await j(`https://api.open-meteo.com/v1/forecast?${base}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m`); const c=data.current; return {dia_diem:{ten:loc.name,quoc_gia:loc.country,vi_do:loc.latitude,kinh_do:loc.longitude,mui_gio:loc.timezone},hien_tai:{thoi_gian:c.time,nhiet_do_c:c.temperature_2m,cam_giac_c:c.apparent_temperature,do_am_percent:c.relative_humidity_2m,gio_km_h:c.wind_speed_10m,thoi_tiet:weatherText(c.weather_code),ma_thoi_tiet:c.weather_code},don_vi:data.current_units,nguon:'open-meteo.com',thoi_gian_lay:new Date().toISOString()}}
  if(name==='forecast'){const days=Math.min(Math.max(Number(args.days||3),1),7); const data=await j(`https://api.open-meteo.com/v1/forecast?${base}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&forecast_days=${days}`); const daily=data.daily.time.map((d,i)=>({ngay:d,nhiet_do_cao_nhat_c:data.daily.temperature_2m_max[i],nhiet_do_thap_nhat_c:data.daily.temperature_2m_min[i],mua_mm:data.daily.precipitation_sum[i],gio_manh_nhat_km_h:data.daily.wind_speed_10m_max[i],thoi_tiet:weatherText(data.daily.weather_code[i]),ma_thoi_tiet:data.daily.weather_code[i]})); return {dia_diem:{ten:loc.name,quoc_gia:loc.country,vi_do:loc.latitude,kinh_do:loc.longitude,mui_gio:loc.timezone},du_bao:daily,don_vi:data.daily_units,nguon:'open-meteo.com',thoi_gian_lay:new Date().toISOString()}}
 }
 if(serverName==='exchange'){
  if(name==='rates'){const base=(args.base||'USD').toUpperCase(); const symbols=(args.symbols||'VND,EUR,JPY,CNY').toUpperCase().split(',').map(x=>x.trim()).filter(Boolean); const data=await j(`https://open.er-api.com/v6/latest/${base}`); const rates={}; for(const sym of symbols){ if(data.rates && data.rates[sym] != null) rates[sym]=data.rates[sym]; } return {tien_goc:base, ngay_cap_nhat:data.time_last_update_utc, ty_gia:rates, nguon:'open.er-api.com', thoi_gian_lay:new Date().toISOString()} }
  if(name==='convert'){const amount=Number(args.amount); const from=args.from.toUpperCase(), to=args.to.toUpperCase(); const data=await j(`https://open.er-api.com/v6/latest/${from}`); if(!data.rates || data.rates[to] == null) throw new Error(`Không có tỷ giá ${from}->${to}`); return {so_tien:amount, tu:from, sang:to, ty_gia:data.rates[to], ket_qua:amount*data.rates[to], ngay_cap_nhat:data.time_last_update_utc, nguon:'open.er-api.com', thoi_gian_lay:new Date().toISOString()} }
 }
 if(serverName==='crypto'){
  const ids=args.ids||'bitcoin,ethereum,tether'; const vs=args.vs||'usd,vnd'; const data=await j(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}&include_24hr_change=true&include_last_updated_at=true`); return {nguon:'coingecko.com', gia:data, thoi_gian_lay:new Date().toISOString()}
 }
 if(serverName==='news'){
  const source=args.source||'vnexpress'; const limit=Math.min(Math.max(Number(args.limit||8),1),20); const url=source==='tuoitre'?'https://tuoitre.vn/rss/tin-moi-nhat.rss':'https://vnexpress.net/rss/tin-moi-nhat.rss'; const xml=await t(url); const items=[...xml.matchAll(/<item>[\s\S]*?<\/item>/g)].slice(0,limit).map(m=>({tieu_de:strip((m[0].match(/<title>([\s\S]*?)<\/title>/)||[])[1]),link:strip((m[0].match(/<link>([\s\S]*?)<\/link>/)||[])[1]),ngay_dang:strip((m[0].match(/<pubDate>([\s\S]*?)<\/pubDate>/)||[])[1]),tom_tat:strip((m[0].match(/<description>([\s\S]*?)<\/description>/)||[])[1]).slice(0,300)})); return {nguon:source,url,tin:items,thoi_gian_lay:new Date().toISOString()}
 }
 if(serverName==='lottery'){
  if(name==='north-latest') return await parseLottery('bac');
  if(name==='by-region') return await parseLottery(args.region||'bac');
 }
 throw new Error(`Không biết tool ${name} cho server ${serverName}`)
}
async function handle(msg){const {id,method,params}=msg; if(method==='initialize') return result(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:`${serverName}-mcp-vn`,version:'0.2.0'}}); if(method==='notifications/initialized') return; if(method==='tools/list') return result(id,{tools:(tools[serverName]||[]).map(x=>({...x,name:x.name}))}); if(method==='tools/call'){try{const data=await callTool(params?.name,params?.arguments||{}); return result(id,{content:[{type:'text',text:JSON.stringify(data,null,2)}],isError:false})}catch(e){return result(id,{content:[{type:'text',text:`Lỗi: ${e.message||e}`}],isError:true})}} if(id!==undefined) return err(id,-32601,`Unknown method ${method}`)}
process.stdin.on('data',c=>{buffer+=c.toString(); let i; while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i).trim(); buffer=buffer.slice(i+1); if(!line) continue; try{handle(JSON.parse(line))}catch(e){send({jsonrpc:JSONRPC,error:{code:-32700,message:e.message}})}}});
