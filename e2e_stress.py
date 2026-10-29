import json, threading, sys, functools
print=functools.partial(print, flush=True)
def jsonbify(v):
    if isinstance(v,list): return [jsonbify(x) for x in v]
    if isinstance(v,dict): return {k:jsonbify(v[k]) for k in sorted(v, key=lambda k:(len(k.encode()),k.encode()))}
    return v
from playwright.sync_api import sync_playwright
f='file:///home/claude/MARS2026_개막식_내빈운영_플랫폼.html'
srv={'pin':'1234','data':None,'updated_at':'t0','n':0,'gets':0,'patches':0}
lock=threading.Lock()
OFF={'ctx':None}
def handler(route):
    req=route.request; u=req.url; pin=req.headers.get('x-event-pin')
    if OFF['ctx'] is not None and route.request.frame.page.context is OFF['ctx']: route.abort('internetdisconnected'); return
    with lock:
        if req.method=='GET':
            srv['gets']+=1
            body=json.dumps([{'updated_at':srv['updated_at']}]) if ('select=updated_at' in u and 'data' not in u) else json.dumps([{'data':jsonbify(srv['data']),'updated_at':srv['updated_at']}] if srv['data'] else [])
            route.fulfill(status=200, content_type='application/json', body=body); return
        if req.method=='PATCH':
            if pin!=srv['pin']: route.fulfill(status=200, content_type='application/json', body='[]'); return
            b=json.loads(req.post_data)
            if 'data' in b: srv['data']=b['data']; srv['n']+=1; srv['patches']+=1; srv['updated_at']='t%d'%srv['n']
            route.fulfill(status=200, content_type='application/json', body=json.dumps([{'updated_at':srv['updated_at']}])); return
        route.fulfill(status=404, body='{}')
R=[]
def ck(n,c): R.append(('PASS' if c else 'FAIL', n)); print('PASS' if c else 'FAIL', n)
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    def dev(w=420, admin=True):
        c=b.new_context(viewport={'width':w,'height':860}); c.route('**/rest/v1/**', handler)
        pg=c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(f); pg.wait_for_timeout(1200)
        if admin:
            pg.get_by_role('button', name='운영진(관리자) 입장').click(); pg.locator('input[type=password]').fill('1234'); pg.get_by_role('button', name='입장', exact=True).click(); pg.wait_for_timeout(800)
        else:
            pg.get_by_role('button', name='참관인으로 보기').click(); pg.wait_for_timeout(500)
        return c,pg
    st=lambda pg: pg.evaluate("JSON.parse(localStorage.getItem('mars-vip-platform-v2'))")
    def arrive(pg, name):
        pg.get_by_text('내빈 관리').first.click(); pg.wait_for_timeout(200)
        pg.locator('input[placeholder*="검색"]').last.fill(name); pg.wait_for_timeout(250)
        pg.locator('.md\\:hidden button:has-text("도착")').first.click(); pg.wait_for_timeout(150)
        pg.locator('input[placeholder*="검색"]').last.fill('')
    def status_of(pg,name):
        s=st(pg); return next((a['status'] for a in s['attendees'] if a['name']==name), None)
    A1=dev(); A2=dev(); A3=dev(); V1=dev(admin=False); V2=dev(390,admin=False)
    pg1,pg2,pg3,pv1,pv2=A1[1],A2[1],A3[1],V1[1],V2[1]
    # 1) 세 관리자가 거의 동시에 서로 다른 사람 도착
    arrive(pg1,'이계철'); arrive(pg2,'장동혁'); arrive(pg3,'박선원')
    pg1.wait_for_timeout(9000)
    ok=all(status_of(pg,n)=='도착' for pg in (pg1,pg2,pg3,pv1,pv2) for n in ('이계철','장동혁','박선원'))
    ck('1 동시 체크 3건 → 5개 기기 모두 반영', ok)
    p0=srv['patches']; pg1.wait_for_timeout(20000); ck('1b 관리자 3대 유휴 20초 동안 서버 재기록 없음(핑퐁 없음): %d회'%(srv['patches']-p0), srv['patches']-p0==0)
    # 2) 같은 사람을 두 관리자가 엇갈리게(도착 vs 불참) → 마지막 조작이 이김, 기기 간 일치
    arrive(pg1,'권미경'); pg1.wait_for_timeout(300)
    pg2.get_by_text('내빈 관리').first.click(); pg2.locator('input[placeholder*="검색"]').last.fill('권미경'); pg2.wait_for_timeout(250)
    pg2.locator('.md\\:hidden button:has-text("불참")').first.click(); pg2.locator('input[placeholder*="검색"]').last.fill('')
    pg1.wait_for_timeout(9000)
    vals={status_of(pg,'권미경') for pg in (pg1,pg2,pg3,pv1,pv2)}
    ck('2 같은 사람 충돌 → 모든 기기 동일 상태(%s)'%vals, len(vals)==1)
    # 3) 연결 끊긴 관리자: 오프라인 중 체크 → 복구 후 반영
    OFF['ctx']=A3[0]; arrive(pg3,'김민수'); pg3.wait_for_timeout(5000)
    ck('3a 오프라인 중 서버 미반영', not any(a['name']=='김민수' and a['status']=='도착' for a in srv['data']['attendees']))
    OFF['ctx']=None; pg3.wait_for_timeout(10000)
    ck('3b 복구 후 서버·다른 기기 반영', status_of(pv1,'김민수')=='도착' and status_of(pg1,'김민수')=='도착')
    # 4) 전체 초기화 vs 동시 도착: A1이 초기화, 직후 A2가 새 체크 → 새 체크만 살아남고 옛 기록은 부활 안 함
    pg1.get_by_text('내빈 관리').first.click(); pg1.get_by_role('button', name='전체초기화').click(); pg1.get_by_role('button', name='확인').click(); pg1.wait_for_timeout(400)
    arrive(pg2,'정명근')  # 초기화 직후(아직 pull 전일 수 있음)
    pg1.wait_for_timeout(10000)
    s=st(pv1); present=[a['name'] for a in s['attendees'] if a['status']=='도착']
    ck('4 초기화 후 새 체크(정명근)만 도착, 옛 기록 부활 없음 (%s)'%present, present==['정명근'])
    ck('4b 소개·말씀 해제(동시 수정된 정명근 제외), 인사말씀 순서 비움', not any((a.get('intro') or a.get('speech')) and a['name']!='정명근' for a in s['attendees']) and s['speechOrder']==[]); print('  정명근:', next((a.get('intro'),a.get('speech')) for a in s['attendees'] if a['name']=='정명근'))
    # 5) 말씀 재지정 → 인쇄 화면·카톡 보고 오류 없음
    pg2.locator('input[placeholder*="검색"]').last.fill('이계철'); pg2.wait_for_timeout(200); pg2.locator('.md\\:hidden button:has-text("말씀")').first.click(); pg2.locator('input[placeholder*="검색"]').last.fill(''); pg2.wait_for_timeout(5000)
    pg2.get_by_text('현황판').first.click(); pg2.wait_for_timeout(200)
    pg2.get_by_role('button', name='보고').first.click(); pg2.wait_for_timeout(300); pg2.locator('.fixed button', has_text='인사말씀').first.click(); pg2.wait_for_timeout(300); pg2.screenshot(path='/home/claude/tkooya-09/p_kakao.png')
    pg2.keyboard.press('Escape'); pg2.wait_for_timeout(200)
    ck('5 인사말씀 1명 재지정 → 전 기기 반영', any(a['name']=='이계철' and a.get('speech') for a in st(pv2)['attendees']))
    # 6) 잘못된 비밀번호 기기 → 쓰기 거부돼도 다른 기기 자료 손상 없음
    srv['pin']='9999'; arrive(pg3,'이계철'); pg3.wait_for_timeout(6000); srv['pin']='1234'
    ck('6 PIN 불일치 기기의 쓰기 → 서버 미반영', not any(a['name']=='이계철' and a['status']=='도착' for a in srv['data']['attendees']))
    # 7) 통신량: 5기기 ~60초 동안 GET 수 (head 확인 방식) 
    ck('7 GET 요청 수 합리적(<400): %d, PATCH %d'%(srv['gets'],srv['patches']), srv['gets']<400)
    ck('8 자바스크립트 오류 없음: %s'%errs[:2], not errs)
    # 8) 서버 자료 크기
    size=len(json.dumps(srv['data'],ensure_ascii=False).encode()); ck('9 서버 자료 크기 %dKB (<300KB)'%(size//1024), size<300*1024)
    print('done')
