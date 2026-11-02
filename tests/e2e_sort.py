import json
from playwright.sync_api import sync_playwright
exec(open('/tmp/claude-0/-home-claude/eec641b3-3070-5540-a033-075e60456b1a/scratchpad/photo_test.py').read().split('with sync_playwright')[0])
R=[]
def ck(n,c): R.append(('PASS' if c else 'FAIL', n)); print('PASS' if c else 'FAIL', n)
with sync_playwright() as p:
    b=p.chromium.launch(); errs=[]
    c=b.new_context(viewport={'width':420,'height':900}); c.route('**/rest/v1/**', handler)
    pg=c.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(f); pg.wait_for_timeout(1500)
    pg.get_by_role('button', name='운영진(관리자) 입장').click(); pg.locator('input[type=password]').fill('1234'); pg.get_by_role('button', name='입장', exact=True).click(); pg.wait_for_timeout(900)
    pg.get_by_text('내빈 관리').first.click(); pg.wait_for_timeout(400)
    cards=lambda: pg.locator('.md\\:hidden > div.border-l-4')
    names=lambda n=12: [cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(min(n,cards().count()))]
    def act(name, btn):
        pg.locator('input[placeholder*="검색"]').last.fill(name); pg.wait_for_timeout(250)
        pg.locator(f'.md\\:hidden button:has-text("{btn}")').first.click(); pg.wait_for_timeout(150)
        pg.locator('input[placeholder*="검색"]').last.fill(''); pg.wait_for_timeout(250)
    st=lambda: pg.evaluate("JSON.parse(localStorage.getItem('mars-vip-platform-v2'))")
    # 의전순
    pg.get_by_role('button', name='의전순', exact=True).click(); pg.wait_for_timeout(300)
    n=names(6); ck('1 의전순: 정명근→이계철→김종민→문정복→김승원→염태영 (%s)'%n, n==['정명근','이계철','김종민','문정복','김승원','염태영'])
    s=st(); ranks=[a['rank'] for a in sorted(s['attendees'], key=lambda a:a['rank'])]
    ck('1b 의전순 번호 중복 없음·1부터 연속', ranks[:66]==list(range(1,67)))
    # 도착 먼저: 염태영·양재수 도착, 김종민 불참
    act('양재수','도착'); act('염태영','도착'); act('김종민','불참')
    pg.get_by_role('button', name='도착 먼저').click(); pg.wait_for_timeout(300)
    n=names(5); ck('2 도착 먼저: 도착자(의전순) → 미도착(의전순) (%s)'%n, n[:2]==['염태영','양재수'] and n[2:4]==['정명근','이계철'])
    allnames=[cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(cards().count())]
    ck('2b 불참(김종민)은 맨 끝', allnames[-1]=='김종민')
    # 사전참석 먼저: 장동혁(VIP, 회신 없음)은 ○ 뒤로
    pg.get_by_role('button', name='사전참석(○) 먼저').click(); pg.wait_for_timeout(300)
    allnames=[cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(cards().count())]
    s=st(); byn={a['name']:a for a in s['attendees']}
    firstO=[x for x in allnames if byn[x]['rsvp']=='O']; lastidxO=max(allnames.index(x) for x in firstO); firstT=min([allnames.index(x) for x in allnames if byn[x]['rsvp']=='T'] or [10**9]); firstBlank=min([allnames.index(x) for x in allnames if byn[x]['rsvp']==''] or [10**9])
    ck('3 사전참석 먼저: ○ 전원 → △ → 미확인 순', lastidxO < firstT < firstBlank)
    ck('3b ○ 그룹 안은 의전순(정명근 첫째)', allnames[0]=='정명근')
    # 차담회 먼저 / 차담회만
    pg.get_by_role('button', name='차담회 먼저').click(); pg.wait_for_timeout(300)
    allnames=[cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(cards().count())]
    s=st(); al=[a['name'] for a in sorted([a for a in s['attendees'] if a.get('alliance')], key=lambda a:a['rank'])]
    ck('3c 차담회 먼저: 17명이 의전순으로 맨 앞 (%s…)'%allnames[:3], allnames[:17]==al and len(al)==17)
    pg.get_by_role('button', name='차담회만', exact=False).click(); pg.wait_for_timeout(300)
    ck('3d 차담회만 보기: 17명만 표시', cards().count()==17)
    pg.get_by_role('button', name='차담회만', exact=False).click(); pg.wait_for_timeout(200)
    # 가나다
    pg.get_by_role('button', name='가나다').click(); pg.wait_for_timeout(300)
    allnames=[cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(cards().count())]
    ck('4 가나다순 정렬', allnames==sorted(allnames, key=lambda x:(x,)) or allnames==sorted(allnames))
    # 좌석순: 의전순 적용 뒤 좌1-1.. 순
    pg.get_by_role('button', name='의전순 적용').click(); pg.get_by_role('button', name='확인').click(); pg.wait_for_timeout(800)
    pg.get_by_role('button', name='좌석순').click(); pg.wait_for_timeout(300)
    s=st(); seated=[a for a in s['attendees'] if a['seat']]
    allnames=[cards().nth(i).locator('span.text-\\[16px\\]').inner_text() for i in range(cards().count())]
    seats=[byn2['seat'] for byn2 in [next(a for a in s['attendees'] if a['name']==x) for x in allnames[:len(seated)]]]
    ck('5 좌석순: 좌석 있는 %d명이 앞에, 좌석표기 오름차순'%len(seated), all(seats[i]<=seats[i+1] for i in range(len(seats)-1)) and len(seated)>=40)
    ck('5b 불참(김종민)은 좌석 미배정', not byn['김종민']['seat'] or not next(a for a in s['attendees'] if a['name']=='김종민')['seat'])
    # 정렬 기억(새로고침 뒤 유지)
    pg.reload(); pg.wait_for_timeout(1500); pg.get_by_text('내빈 관리').first.click(); pg.wait_for_timeout(300)
    ck('6 정렬 선택 새로고침 뒤 유지(좌석순)', 'bg-slate-900' in pg.get_by_role('button', name='좌석순').get_attribute('class'))
    ck('7 JS 오류 없음 %s'%errs[:1], not errs)
