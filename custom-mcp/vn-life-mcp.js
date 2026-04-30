#!/usr/bin/env node
const JSONRPC='2.0'; let buffer=''; const serverName=process.argv[2]||'doi-song';
function send(o){process.stdout.write(JSON.stringify(o)+'\n')} function result(id,v){send({jsonrpc:JSONRPC,id,result:v})}
const tools={
 'xem-boi':[
  {name:'tong-quan',description:'Xem bói vui tổng quan theo tên/năm sinh. Giải trí, không mê tín.',inputSchema:{type:'object',properties:{ho_ten:{type:'string'},nam_sinh:{type:'number'},gioi_tinh:{type:'string'}},required:['ho_ten']}},
  {name:'cung-hoang-dao',description:'Xem cung hoàng đạo theo ngày sinh.',inputSchema:{type:'object',properties:{ngay_sinh:{type:'string',description:'DD/MM hoặc YYYY-MM-DD'}},required:['ngay_sinh']}}
 ],
 'than-so-hoc':[{name:'xem',description:'Thần số học cơ bản theo ngày sinh. Giải trí/tham khảo.',inputSchema:{type:'object',properties:{ngay_sinh:{type:'string',description:'DD/MM/YYYY'}},required:['ngay_sinh']}}],
 'phong-thuy':[
  {name:'mau-hop-menh',description:'Gợi ý màu hợp mệnh theo năm sinh.',inputSchema:{type:'object',properties:{nam_sinh:{type:'number'}},required:['nam_sinh']}},
  {name:'huong-nha',description:'Gợi ý hướng nhà cơ bản theo năm sinh/giới tính. Tham khảo.',inputSchema:{type:'object',properties:{nam_sinh:{type:'number'},gioi_tinh:{type:'string'}},required:['nam_sinh']}}
 ],
 'nau-an':[
  {name:'cong-thuc',description:'Tạo công thức món ăn theo nguyên liệu/phong cách.',inputSchema:{type:'object',properties:{nguyen_lieu:{type:'string'},phong_cach:{type:'string',default:'món Việt'},thoi_gian_phut:{type:'number',default:30}},required:['nguyen_lieu']}},
  {name:'thuc-don-gia-dinh',description:'Gợi ý thực đơn gia đình theo số người/ngân sách.',inputSchema:{type:'object',properties:{so_nguoi:{type:'number',default:4},ngan_sach:{type:'string',default:'vừa phải'},bua:{type:'string',default:'bữa tối'}}}}
 ],
 'hoc-ngoai-ngu':[
  {name:'gia-su-tieng-anh',description:'Gia sư tiếng Anh: giải thích/tạo hội thoại/từ vựng.',inputSchema:{type:'object',properties:{yeu_cau:{type:'string'},trinh_do:{type:'string',default:'A2'}},required:['yeu_cau']}},
  {name:'dich-va-giai-thich',description:'Dịch câu và giải thích ngữ pháp/từ vựng.',inputSchema:{type:'object',properties:{van_ban:{type:'string'},sang_ngon_ngu:{type:'string',default:'tiếng Việt'}},required:['van_ban']}}
 ],
 'tu-van-nghe-nghiep':[{name:'dinh-huong',description:'Gợi ý định hướng nghề nghiệp theo sở thích/kỹ năng.',inputSchema:{type:'object',properties:{so_thich:{type:'string'},ky_nang:{type:'string'},muc_tieu:{type:'string'}},required:['so_thich']}}],
 'tu-van-luat':[{name:'thong-tin-co-ban',description:'Thông tin pháp luật cơ bản, không thay thế luật sư.',inputSchema:{type:'object',properties:{linh_vuc:{type:'string',description:'dân sự, đất đai, doanh nghiệp, lao động...'},cau_hoi:{type:'string'}},required:['cau_hoi']}}],
 'ly-thuyet-lai-xe':[
  {name:'meo-hoc',description:'Mẹo học lý thuyết lái xe ô tô/xe máy.',inputSchema:{type:'object',properties:{loai:{type:'string',default:'oto'}}}},
  {name:'tao-cau-hoi',description:'Tạo câu hỏi luyện tập lý thuyết lái xe mẫu.',inputSchema:{type:'object',properties:{chu_de:{type:'string',default:'biển báo'},so_cau:{type:'number',default:5}}}}
 ],
 'ma-so-thue':[{name:'huong-dan-tra-cuu',description:'Hướng dẫn tra cứu mã số thuế trên nguồn chính thức/public.',inputSchema:{type:'object',properties:{ten_hoac_mst:{type:'string'}},required:['ten_hoac_mst']}}],
 'phat-nguoi':[{name:'huong-dan-tra-cuu',description:'Hướng dẫn tra cứu phạt nguội trên cổng CSGT/Đăng kiểm.',inputSchema:{type:'object',properties:{bien_so:{type:'string'},loai_xe:{type:'string',default:'oto'}},required:['bien_so']}}]
};
function digits(s){return String(s||'').replace(/\D/g,'').split('').map(Number)}
function sumDigital(n){while(n>9)n=String(n).split('').reduce((a,b)=>a+Number(b),0); return n}
function zodiac(input){const m=String(input).match(/(\d{1,2})[\/\-](\d{1,2})/)||String(input).match(/\d{4}-(\d{1,2})-(\d{1,2})/); let d,mo; if(!m)return null; if(m[0].includes('-')&&m[0].length>=8){mo=+m[1];d=+m[2]}else{d=+m[1];mo=+m[2]} const z=[['Ma Kết',1,19],['Bảo Bình',2,18],['Song Ngư',3,20],['Bạch Dương',4,19],['Kim Ngưu',5,20],['Song Tử',6,21],['Cự Giải',7,22],['Sư Tử',8,22],['Xử Nữ',9,22],['Thiên Bình',10,23],['Bọ Cạp',11,22],['Nhân Mã',12,21],['Ma Kết',12,31]]; for(const [name,mon,last] of z){if(mo===mon&&d<=last)return name} return z.find(x=>x[1]===mo+1)?.[0]||'Ma Kết'}
function menh(n){return ['Kim','Thủy','Hỏa','Thổ','Mộc'][Number(n)%5]}
async function call(name,args={}){
 if(serverName==='xem-boi'){if(name==='cung-hoang-dao')return {ngay_sinh:args.ngay_sinh,cung:zodiac(args.ngay_sinh),ghi_chu:'Giải trí/tham khảo.'}; return {ho_ten:args.ho_ten,nam_sinh:args.nam_sinh||null,tong_quan:['Tính cách có xu hướng kiên trì, thích sự rõ ràng.','Năm nay nên tập trung sức khỏe, tài chính và kỹ năng mới.','Các nhận xét chỉ mang tính giải trí, không dùng để quyết định việc quan trọng.']}}
 if(serverName==='than-so-hoc'){const nums=digits(args.ngay_sinh); const n=sumDigital(nums.reduce((a,b)=>a+b,0)); return {ngay_sinh:args.ngay_sinh,con_so_chu_dao:n,y_nghia:`Số ${n}: tham khảo vui về xu hướng tính cách và động lực cá nhân.`,ghi_chu:'Giải trí/tham khảo.'}}
 if(serverName==='phong-thuy'){const m=menh(args.nam_sinh); if(name==='mau-hop-menh'){const map={Kim:['trắng','xám','vàng nhạt'],Mộc:['xanh lá','xanh dương'],Thủy:['đen','xanh dương','trắng'],Hỏa:['đỏ','cam','tím','xanh lá'],Thổ:['vàng','nâu','đỏ']}; return {nam_sinh:args.nam_sinh,menh:m,mau_goi_y:map[m],ghi_chu:'Phong thủy tham khảo.'}} return {nam_sinh:args.nam_sinh,gioi_tinh:args.gioi_tinh||null,menh:m,goi_y:['Ưu tiên nhà thoáng, đủ sáng, thông gió tốt.','Hướng cụ thể nên kiểm tra thêm bát trạch/cung phi nếu cần.'],ghi_chu:'Tham khảo, không tuyệt đối hóa.'}}
 if(serverName==='nau-an'){if(name==='cong-thuc')return {nguyen_lieu:args.nguyen_lieu,phong_cach:args.phong_cach||'món Việt',thoi_gian_phut:args.thoi_gian_phut||30,cong_thuc:{so_che:'Rửa sạch, cắt vừa ăn.',uop:'Nêm muối/nước mắm/tiêu/tỏi tùy khẩu vị.',nau:['Làm nóng chảo/nồi.','Cho nguyên liệu chính vào nấu chín.','Nêm lại và tắt bếp.'],meo:'Thêm rau thơm hoặc chanh/ớt để dậy vị.'}}; return {so_nguoi:args.so_nguoi||4,bua:args.bua||'bữa tối',thuc_don:['Món mặn: thịt/cá kho hoặc rim','Món rau: rau luộc/xào tỏi','Món canh: canh chua/canh rau','Tráng miệng: trái cây'],ghi_chu:'Có thể chỉnh theo ngân sách và khẩu vị.'}}
 if(serverName==='hoc-ngoai-ngu'){if(name==='dich-va-giai-thich')return {van_ban:args.van_ban,sang_ngon_ngu:args.sang_ngon_ngu||'tiếng Việt',huong_dan:'Dịch sát nghĩa trước, sau đó giải thích từ vựng/cấu trúc chính.',ghi_chu:'Tool tạo khung; LLM sẽ diễn giải chi tiết.'}; return {trinh_do:args.trinh_do||'A2',yeu_cau:args.yeu_cau,phuong_phap:['Giải thích bằng ví dụ ngắn.','Cho 5 từ vựng/cấu trúc liên quan.','Tạo 3 câu luyện tập và đáp án.']}}
 if(serverName==='tu-van-nghe-nghiep')return {so_thich:args.so_thich,ky_nang:args.ky_nang||'',muc_tieu:args.muc_tieu||'',goi_y:['Liệt kê 3 nhóm nghề phù hợp.','Đánh giá kỹ năng còn thiếu.','Đề xuất lộ trình học 30-60-90 ngày.']}
 if(serverName==='tu-van-luat')return {linh_vuc:args.linh_vuc||'chung',cau_hoi:args.cau_hoi,luu_y:'Thông tin tham khảo, không thay thế luật sư.',goi_y:['Xác định văn bản/quy định liên quan.','Tóm tắt quyền/nghĩa vụ chính.','Gợi ý chuẩn bị giấy tờ/câu hỏi khi gặp chuyên gia.']}
 if(serverName==='ly-thuyet-lai-xe'){if(name==='meo-hoc')return {loai:args.loai||'oto',meo:['Học biển báo theo nhóm màu/hình dạng.','Ghi nhớ câu điểm liệt trước.','Luyện đề theo chủ đề rồi mới luyện đề tổng hợp.']}; const n=Math.min(Math.max(Number(args.so_cau||5),1),20); return {chu_de:args.chu_de||'biển báo',cau_hoi:Array.from({length:n},(_,i)=>({cau:i+1,noi_dung:`Câu hỏi mẫu về ${args.chu_de||'biển báo'} số ${i+1}`,dap_an:'Cần nối bộ dữ liệu câu hỏi thật nếu muốn chính xác.'}))}}
 if(serverName==='ma-so-thue')return {ten_hoac_mst:args.ten_hoac_mst,huong_dan:['Vào trang Tổng cục Thuế hoặc cổng thông tin doanh nghiệp.','Nhập mã số thuế/tên doanh nghiệp/cá nhân.','Đối chiếu tên, địa chỉ, trạng thái hoạt động.'],ghi_chu:'Bản public chưa scrape tự động để tránh phụ thuộc captcha/điều khoản.'}
 if(serverName==='phat-nguoi')return {bien_so:args.bien_so,loai_xe:args.loai_xe||'oto',huong_dan:['Tra cứu trên cổng Cục CSGT hoặc Đăng kiểm.','Nhập biển số đúng định dạng và loại phương tiện.','Đối chiếu thời gian/địa điểm vi phạm nếu có.'],ghi_chu:'Bản public chưa tự scrape nếu nguồn có captcha.'}
 throw new Error(`Không biết tool ${serverName}/${name}`)
}
async function handle(msg){const {id,method,params}=msg; if(method==='initialize')return result(id,{protocolVersion:'2024-11-05',capabilities:{tools:{}},serverInfo:{name:`${serverName}-mcp-vn-life`,version:'0.1.0'}}); if(method==='notifications/initialized')return; if(method==='tools/list')return result(id,{tools:tools[serverName]||[]}); if(method==='tools/call'){try{return result(id,{content:[{type:'text',text:JSON.stringify(await call(params?.name,params?.arguments||{}),null,2)}],isError:false})}catch(e){return result(id,{content:[{type:'text',text:`Lỗi: ${e.message||e}`}],isError:true})}} if(id!==undefined)send({jsonrpc:JSONRPC,id,error:{code:-32601,message:`Unknown method ${method}`}})}
process.stdin.on('data',c=>{buffer+=c.toString(); let i; while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i).trim(); buffer=buffer.slice(i+1); if(!line)continue; try{handle(JSON.parse(line))}catch(e){send({jsonrpc:JSONRPC,error:{code:-32700,message:e.message}})}}});
