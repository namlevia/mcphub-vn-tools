#!/usr/bin/env python3
import json, os, urllib.request, urllib.error, time
BASE=os.environ.get('MCPHUB_URL','http://127.0.0.1:33000').rstrip('/')+'/api'
USER=os.environ.get('MCPHUB_USER','admin'); PASS=os.environ.get('MCPHUB_PASS','admin123')
def req(method,path,token=None,body=None,timeout=180):
    data=None if body is None else json.dumps(body).encode(); h={'Accept':'application/json'}
    if body is not None: h['Content-Type']='application/json'
    if token: h['x-auth-token']=token
    r=urllib.request.Request(BASE+path,data=data,headers=h,method=method)
    try:
        with urllib.request.urlopen(r,timeout=timeout) as resp: return resp.status, resp.read().decode('utf-8','replace')
    except urllib.error.HTTPError as e: return e.code,e.read().decode('utf-8','replace')
st,raw=req('POST','/auth/login',body={'username':USER,'password':PASS}); token=json.loads(raw)['token']
servers = {
 'vn-public-mcp.js':['thoi-tiet','ty-gia','crypto','tin-tuc','xo-so','lich','gio-the-gioi','ma-qr','tien-ich','mau-sac'],
 'vn-role-mcp.js':['gia-vang-do-la','bach-khoa','day-nau-an','ke-chuyen-cho-be','gia-su','du-lich','suc-khoe'],
 'vn-life-mcp.js':['xem-boi','than-so-hoc','phong-thuy','nau-an','hoc-ngoai-ngu','tu-van-nghe-nghiep','tu-van-luat','ly-thuyet-lai-xe','ma-so-thue','phat-nguoi'],
 'vn-photo-complete-mcp.js':['gia-su-tieng-anh','gia-su-tieng-y','gia-su-tieng-nhat','gia-su-tieng-thai','gia-su-tieng-indo','gia-su-tieng-phap','gia-su-tieng-tbn','gia-su-tieng-han','gia-su-tieng-viet','gia-su-tieng-ma-lai','gia-su-tieng-duc','gia-su-tieng-nga','gia-su-tieng-trung','gia-su-tieng-an-do','gia-su-tieng-bdn','gia-su-mon-toan','gia-su-mon-van','gia-su-vat-ly','gia-su-mon-sinh','gia-su-mon-hoa','bai-thuoc-dan-gian','tieu-lam-viet-nam','than-thoai-hy-lap','tuyen-sinh-2026','thong-tin-chung-khoan','tim-kiem-google','tu-van-luat-dat-dai','tu-van-luat-dan-su','tu-van-luat-doanh-nghiep','600-cau-ly-thuyet-o-to','250-cau-ly-thuyet-xe-may']
}
for script,names in servers.items():
    for name in names:
        config={'type':'stdio','command':'node','args':[f'/app/custom-mcp/{script}',name],'env':{},'enabled':True}
        st,raw=req('GET',f'/servers/{name}',token=token)
        if st==200: st,raw=req('PUT',f'/servers/{name}',token=token,body={'config':config})
        else: st,raw=req('POST','/servers',token=token,body={'name':name,'config':config})
        print(name, st)
