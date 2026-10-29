import json, time
from playwright.sync_api import sync_playwright
f='file:///home/claude/MARS2026_개막식_내빈운영_플랫폼.html'
# ---- 옛 서버 자료(v3.9, 43명 체계, 어제 체크 기록) 재현
old_t=int(time.time()*1000)-3*3600*1000
old=[{'id':i,'name':n,'position':'직위','organization':'소속','category':'구분','grade':'VVIP','seat':f'A-{i:02d}','status':st,'arrivalTime':'20:36' if st!='미도착' else None,'seatedTime':None,'intro':True,'speech':i in(1,2),'speechType':'축사','rank':i,'u':old_t} for i,(n,st) in enumerate([('김종민','착석'),('하정우','도착'),('하용호','불참'),('김동환','미도착')]+[(f'옛사람{k}','미도착') for k in range(5,45)],1)]
srv={'pin':'1234','n':0,'updated_at':'t0','data':{'event':{'name':'AI EXPO 「MARS 2026」 개막식','date':'x','place':'y','host':'z','mc':'m'},'program':[],'attendees':old,'speechOrder':[1,2],'introOrder':[a['id'] for a in old],'nextId':45,'metaAt':old_t,'tombstones':{},'appVersion':'3.9.1'}}
def handler(route):
    req=route.request; u=req.url; pin=req.headers.get('x-event-pin')
    if req.method=='GET':
        body=json.dumps([{'updated_at':srv['updated_at']}]) if ('select=updated_at' in u and 'data' not in u) else json.dumps([{'data':srv['data'],'updated_at':srv['updated_at']}])
        route.fulfill(status=200, content_type='application/json', body=body); return
    if req.method=='PATCH':
        if pin!=srv['pin']: route.fulfill(status=200, content_type='application/json', body='[]'); return
        b=json.loads(req.post_data)
        if 'data' in b: srv['data']=b['data']; srv['n']+=1; srv['updated_at']='t%d'%srv['n']
        route.fulfill(status=200, content_type='application/json', body=json.dumps([{'updated_at':srv['updated_at']}])); return
    route.fulfill(status=404, body='{}')
R=[]; ck=lambda n,c: R.append(('PASS' if c else 'FAIL', n))
old_cache=json.dumps({**srv['data'],'seatLayout':{},'adminPin':'1234'})
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    def dev(w, cache=None, viewer=True):
        c=b.new_context(viewport={'width':w,'height':800}); c.route('**/rest/v1/**', handler)
        pg=c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        if cache: c.add_init_script(f"try{{if(!sessionStorage.getItem('seeded')){{localStorage.setItem('mars-vip-platform-v2', {json.dumps(cache)}); sessionStorage.setItem('seeded','1');}}}}catch(e){{}}")
        pg.goto(f); pg.wait_for_timeout(1500); return pg
    st=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('mars-vip-platform-v2'))")
    # 1) 참관인(옛 캐시 보유) 먼저 접속
    v=dev(390, cache=old_cache)
    v.get_by_role('button', name='참관인으로 보기').click(); v.wait_for_timeout(600)
    s=st(v); names=[a['name'] for a in s['attendees']]
    ck('1 옛 캐시 참관인: 새 명단 182명으로 교체', len(s['attendees'])==182 and s.get('rosterVer')==8)
    ck('2 옛 사람 기록 제거', not any(n.startswith('옛사람') for n in names))
    ck('3 서버 옛 자료(43명)는 아직 그대로(참관인은 쓰기 없음)', len(srv['data']['attendees'])==44)
    # 2) 관리자 접속 → 서버가 새 명단으로 바뀌어야
    a=dev(1280)
    a.get_by_role('button', name='운영진(관리자) 입장').click(); a.locator('input[type=password]').fill('1234'); a.get_by_role('button', name='입장', exact=True).click(); a.wait_for_timeout(2500)
    d=srv['data']
    ck('4 서버 새 명단 182명·rosterVer 8', len(d['attendees'])==182 and d.get('rosterVer')==8 and d.get('appVersion','').startswith('4.'))
    ck('5 서버에 옛 id(1~44) 없음', all(x['id']>=901 for x in d['attendees']))
    ck('6 좌석 구성 서버 저장', d.get('seatZones') and len(d['seatZones'])==2)
    # 3) 관리자 체크 → 참관인 반영
    a.get_by_text('김종민', exact=True).first.click(); a.locator('.fixed.inset-0 .rounded-2xl button', has_text='도착').first.click(); a.locator('.fixed.inset-0 .rounded-2xl').get_by_role('button', name='닫기').click(); a.wait_for_timeout(1500); v.wait_for_timeout(5000)
    kj=[x for x in st(v)['attendees'] if x['name']=='김종민'][0]
    ck('7 참관인에게 도착 반영(새 id)', kj['status']=='도착' and kj['id']>=1000)
    # 4) 옛 판 클라이언트가 뒤늦게 서버를 덮어쓰려는 상황: 서버에 옛 metaAt 더 큰 자료 주입 시도 → 새 클라 merge에서 무시되는지
    srv['data']={**srv['data'],'attendees':srv['data']['attendees']+[{'id':7,'name':'유령','status':'도착','u':int(time.time()*1000)+10}],'metaAt':int(time.time()*1000)+10}
    srv['n']+=1; srv['updated_at']='t%d'%srv['n']; a.wait_for_timeout(5500)
    ck('8 옛 id 유령 기록 무시(묘비)', not any(x['name']=='유령' for x in st(a)['attendees']))
    # 5) 두 관리자 동시 추가(같은 사람) → 하나로
    a2=dev(1280); a2.get_by_role('button', name='운영진(관리자) 입장').click(); a2.locator('input[type=password]').fill('1234'); a2.get_by_role('button', name='입장', exact=True).click(); a2.wait_for_timeout(1200)
    for pg in (a,a2):
        pg.get_by_role('button', name='추가').first.click(); pg.locator('.fixed input').first.fill('이준석'); pg.wait_for_timeout(300); pg.locator('.fixed button', has_text='이준석').first.click()
    a.wait_for_timeout(6000); a2.wait_for_timeout(1000)
    ck('9 두 기기 동시 추가 → 중복 없음', len([x for x in srv['data']['attendees'] if x['name']=='이준석'])==1)
    # 6) 자동 배정 후 불참 처리 시 좌석 유지(수동 비우기 전) & 보고문
    a.get_by_text('좌석 현황').first.click(); a.get_by_role('button', name='의전순 자동 배정').click(); a.get_by_role('button', name='확인').click(); a.wait_for_timeout(1500)
    ck('10 자동 배정 42석', len(st(a)['seatMap'])==42)
    a.locator('header').get_by_role('button', name='보고').click(); a.wait_for_timeout(300)
    txt=a.locator('#kakao-text').input_value()
    ck('11 카톡 보고 예정 182·참석 수 반영', '예정 182명' in txt or '예정 183명' in txt)
    ck('12 화면 오류 없음', not errs)
    for r in R: print(*r)
    if errs: print(errs[:3])
    b.close()
