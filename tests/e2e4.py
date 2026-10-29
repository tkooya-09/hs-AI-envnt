import json
from playwright.sync_api import sync_playwright
f='file:///home/claude/MARS2026_개막식_내빈운영_플랫폼.html'
srv={'pin':'1234','data':None,'updated_at':'t0','n':0}
def handler(route):
    req=route.request; u=req.url; pin=req.headers.get('x-event-pin')
    if req.method=='GET':
        body=json.dumps([{'updated_at':srv['updated_at']}]) if ('select=updated_at' in u and 'data' not in u) else json.dumps([{'data':srv['data'],'updated_at':srv['updated_at']}] if srv['data'] else [])
        route.fulfill(status=200, content_type='application/json', body=body); return
    if req.method=='PATCH':
        if pin!=srv['pin']: route.fulfill(status=200, content_type='application/json', body='[]'); return
        b=json.loads(req.post_data)
        if 'data' in b: srv['data']=b['data']; srv['n']+=1; srv['updated_at']='t%d'%srv['n']
        route.fulfill(status=200, content_type='application/json', body=json.dumps([{'updated_at':srv['updated_at']}])); return
    route.fulfill(status=404, body='{}')
R=[]
def ck(n,c): R.append(('PASS' if c else 'FAIL', n))
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    c=b.new_context(viewport={'width':1280,'height':850}); c.route('**/rest/v1/**', handler)
    pg=c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(1500)
    st=lambda: pg.evaluate("JSON.parse(localStorage.getItem('mars-vip-platform-v2'))")
    s0=st()
    ck('1 예정명단 182명(주최 포함)', len(s0['attendees'])==182)
    ck('2 rosterVer=8', s0.get('rosterVer')==8)
    # login
    pg.get_by_role('button', name='운영진(관리자) 입장').click(); pg.locator('input[type=password]').fill('1234'); pg.get_by_role('button', name='입장', exact=True).click(); pg.wait_for_timeout(900)
    # 의전순 적용
    pg.get_by_text('내빈 관리').first.click(); pg.get_by_role('button', name='의전순 적용').click(); pg.get_by_role('button', name='확인').click(); pg.wait_for_timeout(1200)
    s1=st()
    sm=s1['seatMap']
    byid={a['id']:a for a in s1['attendees']}
    ck('3 지정석 42석 자동 배정', len(sm)==42)
    ck('4 R1-1(통로쪽)=정명근', byid.get(sm.get('R:1:1'),{}).get('name')=='정명근')
    ck('5 L1-6(통로쪽)=의전2순위 이계철', byid.get(sm.get('L:1:6'),{}).get('name')=='이계철')
    # 추가 검색: 사전불참(X) 인물 — roster에서 X인 사람 하나: 김민석(당대표, X)
    pg.get_by_role('button', name='추가').first.click(); pg.wait_for_timeout(200)
    pg.locator('.fixed input').first.fill('김민석'); pg.wait_for_timeout(300)
    pg.screenshot(path='/home/claude/tkooya-09/q_add.png')
    hit=pg.locator('.fixed button', has_text='김민석').first; hit.click(); pg.wait_for_timeout(1000)
    s2=st(); kim=[a for a in s2['attendees'] if a['name']=='김민석']
    ck('6 X회신 인사 추가 → 도착 등록', len(kim)==1 and kim[0]['status']=='도착' and kim[0]['rsvp']=='X')
    ck('7 추가 인원 id 결정적(1000+idx)', 1000 <= kim[0]['id'] <= 2100)
    # 같은 사람 또 추가 → 중복 없이 도착 유지
    pg.get_by_role('button', name='추가').first.click(); pg.locator('.fixed input').first.fill('김민석'); pg.wait_for_timeout(300)
    pg.locator('.fixed button', has_text='김민석').first.click(); pg.wait_for_timeout(800)
    s3=st(); ck('8 중복 추가 안 됨', len([a for a in s3['attendees'] if a['name']=='김민석'])==1)
    # 새로 입력
    pg.get_by_role('button', name='추가').first.click(); pg.locator('.fixed input').first.fill('존재하지않는이름'); pg.wait_for_timeout(300)
    pg.get_by_role('button', name='명단에 없는 분 → 새로 입력').click(); pg.wait_for_timeout(200)
    pg.locator('.fixed form input').nth(0).fill('홍길동'); pg.get_by_role('button', name='도착으로 추가').click(); pg.wait_for_timeout(800)
    ck('9 수기 추가 도착', any(a['name']=='홍길동' and a['status']=='도착' for a in st()['attendees']))
    # 좌석 탭: 빈좌석 배정 + 상세
    pg.get_by_text('좌석 현황').first.click(); pg.wait_for_timeout(400)
    pg.screenshot(path='/home/claude/tkooya-09/q_seat.png')
    # occupied seat → sheet → 도착
    pg.locator('button', has_text='정명근').first.click(); pg.wait_for_timeout(300)
    pg.locator('.fixed.inset-0 button', has_text='도착').first.click(); pg.wait_for_timeout(300)
    pg.locator('.fixed.inset-0').get_by_role('button', name='닫기').click(); pg.wait_for_timeout(800)
    s4=st(); ck('10 좌석에서 도착 체크', [a for a in s4['attendees'] if a['name']=='정명근'][0]['status']=='도착')
    # 자리 비우기
    pg.locator('button', has_text='이계철').first.click(); pg.wait_for_timeout(200)
    pg.locator('.fixed.inset-0').get_by_role('button', name='자리 비우기').click(); pg.wait_for_timeout(600)
    s5=st(); ck('11 자리 비우기', 'L:1:6' not in s5['seatMap'] and [a for a in s5['attendees'] if a['name']=='이계철'][0]['seat']=='')
    # 빈 좌석 눌러 재배정
    empty=pg.locator('[title="좌1-6"]'); empty.click(); pg.wait_for_timeout(300)
    pg.locator('.fixed input').first.fill('이계철'); pg.wait_for_timeout(200)
    pg.locator('.fixed button', has_text='이계철').first.click(); pg.wait_for_timeout(600)
    ck('12 수동 배정', st()['seatMap'].get('L:1:6') and True)
    # 열 구성 변경
    pg.get_by_role('button', name='열 구성').click(); pg.locator('input[value="6, 7, 8"]').first.fill('6, 7'); pg.locator('input[value="6, 7, 8"]').first.blur(); pg.wait_for_timeout(500)
    ck('13 열 구성 변경 반영', len(st()['seatZones'][0]['rows'])==2)
    # server sync
    pg.wait_for_timeout(2000)
    ck('14 서버 반영(비번 숨김)', srv['data'] and 'adminPin' not in srv['data'] and len(srv['data']['attendees'])>=182)
    ck('15 화면 오류 없음', not errs)
    for r in R: print(*r)
    if errs: print(errs[:4])
    b.close()
