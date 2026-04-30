#!/usr/bin/env python3
import json, os, urllib.request, urllib.error
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
tests=[('thoi-tiet','thoi-tiet-hien-tai',{'dia_diem':'Hà Nội'}),('gia-vang-do-la','gia-vang-do-la-hom-nay',{}),('xem-boi','xem-boi-cung-hoang-dao',{'ngay_sinh':'12/04'}),('gia-su-tieng-nhat','gia-su-tieng-nhat-day-hoc',{'yeu_cau':'chào hỏi'}),('tim-kiem-google','tim-kiem-google-goi-y-truy-van',{'tu_khoa':'MCPHub Việt Nam'})]
for server,tool,args in tests:
    st,raw=req('POST',f'/tools/{server}/{tool}',token=token,body=args)
    print(server, tool, st, raw[:500].replace('\n',' '))
