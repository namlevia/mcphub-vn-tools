#!/usr/bin/env node
import fs from 'node:fs';
const JSONRPC='2.0'; let buffer=''; const serverName=process.argv[2]||'tool';
function send(o){process.stdout.write(JSON.stringify(o)+'\n')} function result(id,v){send({jsonrpc:JSONRPC,id,result:v})}
async function j(url){const r=await fetch(url,{headers:{'user-agent':'MCPHub VN complete tools/0.1'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.json()}
async function t(url){const r=await fetch(url,{headers:{'user-agent':'MCPHub VN complete tools/0.1','accept-language':'vi,en;q=0.8'}}); if(!r.ok) throw new Error(`HTTP ${r.status} ${url}`); return r.text()}

function loadData(name){
 const paths=[`/app/custom-mcp-data/${name}`, new URL(`../data/${name}`, import.meta.url).pathname, `/app/custom-mcp/${name}`];
 for(const p of paths){try{if(fs.existsSync(p)) return JSON.parse(fs.readFileSync(p,'utf8'))}catch(e){}}
 return null;
}
function pickItems(data, key, topic, n){
 const arr=Array.isArray(data?.[key])?data[key]:(Array.isArray(data?.items)?data.items:[]);
 const q=String(topic||'').toLowerCase();
 let out=arr.filter(x=>!q || JSON.stringify(x).toLowerCase().includes(q));
 if(!out.length) out=arr;
 return out.slice(0,n);
}

function strip(s){return String(s||'').replace(/<!\[CDATA\[/g,'').replace(/\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim()}
const langs=['tieng-anh','tieng-y','tieng-nhat','tieng-thai','tieng-indo','tieng-phap','tieng-tbn','tieng-han','tieng-viet','tieng-ma-lai','tieng-duc','tieng-nga','tieng-trung','tieng-an-do','tieng-bdn'];
const subjects=['mon-toan','mon-van','vat-ly','mon-sinh','mon-hoa'];
const tools={};
for(const l of langs) tools[`gia-su-${l}`]=[{name:'day-hoc',description:`Gia sư ${l.replaceAll('-',' ')} theo yêu cầu.`,inputSchema:{type:'object',properties:{yeu_cau:{type:'string'},trinh_do:{type:'string',default:'cơ bản'}},required:['yeu_cau']}}];
for(const s of subjects) tools[`gia-su-${s}`]=[{name:'giai-bai',description:`Gia sư ${s.replaceAll('-',' ')} giải bài/hướng dẫn học.`,inputSchema:{type:'object',properties:{cau_hoi:{type:'string'},lop:{type:'string'}},required:['cau_hoi']}}];
Object.assign(tools,{
 'bai-thuoc-dan-gian':[{name:'tra-cuu',description:'Gợi ý bài thuốc dân gian tham khảo, không thay thế bác sĩ.',inputSchema:{type:'object',properties:{van_de:{type:'string'}},required:['van_de']}}],
 'tieu-lam-viet-nam':[{name:'ke-chuyen',description:'Kể chuyện tiếu lâm Việt Nam vui, sạch.',inputSchema:{type:'object',properties:{chu_de:{type:'string'},so_chuyen:{type:'number',default:1}}}}],
 'than-thoai-hy-lap':[{name:'ke-chuyen',description:'Kể/tóm tắt thần thoại Hy Lạp theo nhân vật/chủ đề.',inputSchema:{type:'object',properties:{nhan_vat:{type:'string'},chu_de:{type:'string'}},required:['nhan_vat']}}],
 'tuyen-sinh-2026':[{name:'tu-van',description:'Tư vấn tuyển sinh 2026 dạng khung tham khảo.',inputSchema:{type:'object',properties:{nganh:{type:'string'},khu_vuc:{type:'string'},diem_du_kien:{type:'number'}},required:['nganh']}}],
 'thong-tin-chung-khoan':[{name:'xem',description:'Tra thông tin chứng khoán cơ bản. Hỗ trợ mã quốc tế qua Stooq public.',inputSchema:{type:'object',properties:{ma:{type:'string',description:'Ví dụ AAPL.US, MSFT.US; mã VN có thể cần nguồn riêng'}},required:['ma']}}],
 'tim-kiem-google':[{name:'goi-y-truy-van',description:'Tạo truy vấn Google/link tìm kiếm. Không scrape Google.',inputSchema:{type:'object',properties:{tu_khoa:{type:'string'}},required:['tu_khoa']}}],
 'tu-van-luat-dat-dai':[{name:'thong-tin-co-ban',description:'Thông tin luật đất đai cơ bản, không thay thế luật sư.',inputSchema:{type:'object',properties:{cau_hoi:{type:'string'}},required:['cau_hoi']}}],
 'tu-van-luat-dan-su':[{name:'thong-tin-co-ban',description:'Thông tin luật dân sự cơ bản, không thay thế luật sư.',inputSchema:{type:'object',properties:{cau_hoi:{type:'string'}},required:['cau_hoi']}}],
 'tu-van-luat-doanh-nghiep':[{name:'thong-tin-co-ban',description:'Thông tin luật doanh nghiệp cơ bản, không thay thế luật sư.',inputSchema:{type:'object',properties:{cau_hoi:{type:'string'}},required:['cau_hoi']}}],
 '600-cau-ly-thuyet-o-to':[{name:'luyen-tap',description:'Luyện lý thuyết ô tô mẫu. Muốn chuẩn cần nạp dataset 600 câu.',inputSchema:{type:'object',properties:{chu_de:{type:'string',default:'tổng hợp'},so_cau:{type:'number',default:5}}}}],
 '250-cau-ly-thuyet-xe-may':[{name:'luyen-tap',description:'Luyện lý thuyết xe máy mẫu. Muốn chuẩn cần nạp dataset 250 câu.',inputSchema:{type:'object',properties:{chu_de:{type:'string',default:'tổng hợp'},so_cau:{type:'number',default:5}}}}]
});
async function call(name,args={}){
 if(serverName.startsWith('gia-su-tieng-')) return {ngon_ngu:serverName.replace('gia-su-','').replaceAll('-',' '),trinh_do:args.trinh_do||'cơ bản',yeu_cau:args.yeu_cau,phuong_phap:['Giải thích dễ hiểu bằng tiếng Việt.','Cho ví dụ ngắn.','Tạo bài luyện tập và đáp án.']}
 if(serverName.startsWith('gia-su-')) return {mon:serverName.replace('gia-su-','').replaceAll('-',' '),lop:args.lop||null,cau_hoi:args.cau_hoi,cach_giai:['Tóm tắt đề bài.','Nêu kiến thức cần dùng.','Giải từng bước.','Kiểm tra kết quả.']}
 if(serverName==='bai-thuoc-dan-gian'){const data=loadData('folk-remedies-samples.json'); const items=pickItems(data,'items',args.van_de,3); return {van_de:args.van_de,luu_y:'Tham khảo dân gian, không thay thế bác sĩ; không dùng thay thuốc điều trị.',ket_qua:items,nguon:'data/folk-remedies-samples.json'}}
 if(serverName==='tieu-lam-viet-nam'){const n=Math.min(Math.max(Number(args.so_chuyen||1),1),5); const data=loadData('jokes-samples.json'); const items=pickItems(data,'items',args.chu_de,n); return {chu_de:args.chu_de||'đời thường',chuyen:items.map(x=>x.text),nguon:'data/jokes-samples.json'}}
 if(serverName==='than-thoai-hy-lap'){const data=loadData('myths-samples.json'); const item=pickItems(data,'items',args.nhan_vat,1)[0]; return {nhan_vat:args.nhan_vat,chu_de:args.chu_de||'',tom_tat:item?.summary||`${args.nhan_vat} là nhân vật trong thần thoại Hy Lạp.`,chu_de_lien_quan:item?.themes||[],nguon:'data/myths-samples.json'}}
 if(serverName==='tuyen-sinh-2026') return {nganh:args.nganh,khu_vuc:args.khu_vuc||null,diem_du_kien:args.diem_du_kien||null,goi_y:['Xác định tổ hợp xét tuyển phù hợp.','So sánh điểm chuẩn 3 năm gần nhất nếu có dữ liệu.','Chuẩn bị nguyện vọng an toàn-vừa sức-mơ ước.'],ghi_chu:'Cần nối nguồn tuyển sinh chính thức để cập nhật chuẩn.'}
 if(serverName==='thong-tin-chung-khoan'){const ma=args.ma.toUpperCase(); try{const csv=await t(`https://stooq.com/q/l/?s=${encodeURIComponent(ma.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`); const lines=csv.trim().split(/\r?\n/); const vals=(lines[1]||'').split(','); return {ma,nguon:'stooq.com',du_lieu:{symbol:vals[0],date:vals[1],time:vals[2],open:vals[3],high:vals[4],low:vals[5],close:vals[6],volume:vals[7]},ghi_chu:'Mã VN có thể cần nguồn riêng.'}}catch(e){return {ma,loi:String(e),goi_y:'Thử mã dạng AAPL.US/MSFT.US hoặc thêm nguồn VN sau.'}}}
 if(serverName==='tim-kiem-google') return {tu_khoa:args.tu_khoa,link:`https://www.google.com/search?q=${encodeURIComponent(args.tu_khoa)}`,goi_y_truy_van:[args.tu_khoa,`${args.tu_khoa} site:.vn`,`${args.tu_khoa} filetype:pdf`]}
 if(serverName.startsWith('tu-van-luat-')) return {linh_vuc:serverName.replace('tu-van-luat-','').replaceAll('-',' '),cau_hoi:args.cau_hoi,luu_y:'Thông tin tham khảo, không thay thế luật sư.',goi_y:['Xác định sự kiện pháp lý chính.','Tìm văn bản/quy định liên quan.','Chuẩn bị hồ sơ và hỏi chuyên gia nếu cần.']}
 if(serverName==='600-cau-ly-thuyet-o-to'||serverName==='250-cau-ly-thuyet-xe-may'){const n=Math.min(Math.max(Number(args.so_cau||5),1),20); const data=loadData('driving-samples.json'); const key=serverName==='600-cau-ly-thuyet-o-to'?'oto':'xe_may'; const qs=pickItems(data,key,args.chu_de,n); return {bo_de:serverName,chu_de:args.chu_de||'tổng hợp',cau_hoi:qs,nguon:'data/driving-samples.json',ghi_chu:data?.note||'Dataset mẫu.'}}
 throw new Error(`Không biết tool ${serverName}/${name}`)
}
async function handle(msg){const {id,method,params}=msg; if(method==='initialize')return result(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:`${serverName}-mcp-vn-complete`,version:'0.1.0'}}); if(method==='notifications/initialized')return; if(method==='tools/list')return result(id,{tools:tools[serverName]||[]}); if(method==='tools/call'){try{return result(id,{content:[{type:'text',text:JSON.stringify(await call(params?.name,params?.arguments||{}),null,2)}],isError:false})}catch(e){return result(id,{content:[{type:'text',text:`Lỗi: ${e.message||e}`}],isError:true})}} if(id!==undefined)send({jsonrpc:JSONRPC,id,error:{code:-32601,message:`Unknown method ${method}`}})}
process.stdin.on('data',c=>{buffer+=c.toString(); let i; while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i).trim(); buffer=buffer.slice(i+1); if(!line)continue; try{handle(JSON.parse(line))}catch(e){send({jsonrpc:JSONRPC,error:{code:-32700,message:e.message}})}}});
