import json
from playwright.sync_api import sync_playwright
f='file:///home/claude/MARS2026_개막식_내빈운영_플랫폼.html'
old=json.load(open('/home/claude/final/server_rv8.json',encoding='utf-8'))
srv={'pin':'1234','n':0,'updated_at':'t0','data':old}
def handler(route):
    req=route.request; u=req.url; pin=req.headers.get('x-event-pin')
    if req.method=='GET':
        body=json.dumps([{'updated_at':srv['updated_at']}]) if ('select=updated_at' in u and 'data' not in u) else json.dumps([{'data':srv['data'],'updated_at':srv['updated_at']}])
        route.fulfill(status=200, content_type='application/json', body=body); return
    if req.method=='PATCH':
        if pin!=srv['pin']: route.fulfill(status=200, content_type='application/json', body='[]'); return
        b=json.loads(req.post_data or '{}')
        if 'data' in b: srv['data']=b['data']; srv['n']+=1; srv['updated_at']='t%d'%srv['n']
        route.fulfill(status=200, content_type='application/json', body=json.dumps([{'updated_at':srv['updated_at']}])); return
    route.fulfill(status=404, body='{}')
R=[]; ck=lambda n,c: (R.append(('PASS' if c else 'FAIL', n)), print('PASS' if c else 'FAIL', n))
old_cache=json.dumps({**old,'seatLayout':{},'adminPin':'1234'})
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    def dev(w, cache=None):
        c=b.new_context(viewport={'width':w,'height':800}); c.route('**/rest/v1/**', handler)
        pg=c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        if cache: c.add_init_script(f"try{{if(!sessionStorage.getItem('seeded')){{localStorage.setItem('mars-vip-platform-v2', {json.dumps(cache)}); sessionStorage.setItem('seeded','1');}}}}catch(e){{}}")
        pg.goto(f); pg.wait_for_timeout(1500); return pg
    st=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('mars-vip-platform-v2'))")
    v=dev(390, cache=old_cache); v.get_by_role('button', name='참관인으로 보기').click(); v.wait_for_timeout(800)
    s=st(v); names=[a['name'] for a in s['attendees']]
    ck('1 옛 캐시(실서버 rv8 자료) 참관인 → 209명·rv9', len(s['attendees'])==209 and s['rosterVer']==9)
    ck('2 VVIP 53명이 의전순 2~54', [a['name'] for a in sorted(s['attendees'], key=lambda a:a['rank'])][:4]==['정명근','이계철','김종민','문정복'])
    ck('3 옛 도착 기록 미반영(초기화 상태)', sum(1 for a in s['attendees'] if a['status']=='도착')==0)
    ck('4 동명이인 정리: 김미영(동탄) 1명·김승원 1명·중복 없음', names.count('김미영')==1 and names.count('김승원')==1 and len(names)==len(set(names)))
    a=dev(1280); a.get_by_role('button', name='운영진(관리자) 입장').click(); a.locator('input[type=password]').fill('1234'); a.get_by_role('button', name='입장', exact=True).click(); a.wait_for_timeout(3000)
    d=srv['data']
    ck('5 관리자 접속 → 서버가 rv9·209명으로 전환', d['rosterVer']==9 and len(d['attendees'])==209 and d['appVersion']=='4.5.0')
    ck('6 서버 좌석 배정 비움(옛 번호 매핑 제거)', not d.get('seatMap'))
    ck('7 인사말씀 기본(정명근·이계철·김종민·하정우)', [next(x['name'] for x in d['attendees'] if x['id']==i) for i in d['speechOrder']]==['정명근','이계철','김종민','하정우'])
    v.wait_for_timeout(5000); s2=st(v)
    ck('8 참관인도 서버 전환 자료와 일치', len(s2['attendees'])==209 and s2['rosterVer']==9)
    a.get_by_text('내빈 관리').first.click(); a.wait_for_timeout(300)
    imgs=a.locator('img').count(); ck('9 내빈 관리에 사진 표시(≥60): %d'%imgs, imgs>=60)
    ck('10 JS 오류 없음 %s'%errs[:1], not errs)
