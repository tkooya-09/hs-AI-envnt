import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Crown, MapPin, Clock, BarChart3, Mic2, FileText, Bell, X, Lock, Unlock, Settings, Copy, Plus, Trash2, GripVertical, Download, Upload, RotateCcw, ListOrdered, Eye, LogIn, Printer, UserPlus } from 'lucide-react';

// =====================================================================
// 공공행사 내빈 소개·인사말씀 운영 플랫폼 (AI EXPO 「MARS 2026」 개막식)
// 단일 파일 React 앱 · 모든 자료는 브라우저(localStorage)에 저장
// =====================================================================

const STORE_KEY = 'mars-vip-platform-v2';
const APP_VERSION = '2.1.0';

// ---------- 초기 자료 ----------
const DEFAULT_EVENT = {
  name: 'AI EXPO 「MARS 2026」 개막식',
  date: '2026. 11. 3.(화) 11:00',
  place: '코엑스 3층 오디토리움',
  host: '화성특례시',
  mc: '사회자',
};

const DEFAULT_PROGRAM = [
  { id: 'p1', time: '11:00', dur: 10, title: '주제영상 상영 및 오프닝 공연', note: '휴머노이드 퍼포먼스' },
  { id: 'p2', time: '11:10', dur: 5, title: '단체 기념 촬영', note: '' },
  { id: 'p3', time: '11:15', dur: 1, title: '개회', note: '사회자' },
  { id: 'p4', time: '11:16', dur: 1, title: '국민의례', note: '국기에 대한 맹세' },
  { id: 'p5', time: '11:17', dur: 3, title: '내빈 소개', note: '' },
  { id: 'p6', time: '11:20', dur: 10, title: '개회사·환영사·축사', note: '화성특례시장, 시의회 의장 등' },
  { id: 'p7', time: '11:30', dur: 25, title: '기조연설', note: '샘 리처드 교수' },
  { id: 'p8', time: '11:55', dur: 8, title: 'MARS 얼라이언스 출정식', note: '주요 참여 기업' },
  { id: 'p9', time: '12:03', dur: 2, title: 'VIP 이동', note: '오디토리움 → D홀' },
  { id: 'p10', time: '12:05', dur: 25, title: 'VIP 전시 투어', note: '코엑스 3층 D홀' },
];

// 2차 RSVP(10.23.) 참석 회신 내빈 43명
const SEED = [
  ['국회', '국회', '국회의원', '김종민', ''],
  ['정부부처', '국가인공지능전략위원회', '상근부위원장', '하정우', '가급적 참석 예정'],
  ['정부부처', '국가인공지능전략위원회', '공공AX 분과위원', '하용호', ''],
  ['정부부처', '국가인공지능전략위원회', '공공AX 분과위원', '김동환', ''],
  ['정부부처', '국가인공지능전략위원회', '데이터 분과위원', '조성배', ''],
  ['정부부처', '국가인공지능전략위원회', '글로벌협력 분과위원', '전종홍', ''],
  ['정부 산하기관', '한국데이터산업진흥원', '원장', '양재수', ''],
  ['유관기관', '한국피지컬AI협회', '협회장', '유태준', ''],
  ['유관기관', '한국항공우주학회', '회장', '구남서', ''],
  ['유관기관', '한국천문학회', '회장', '채종철', ''],
  ['지자체·기관', '과천시의회', '의장', '황선희', ''],
  ['산업 관련 기관', '경기지역FTA통상진흥센터', '센터장', '한상선', ''],
  ['관내 유관기관', '화성상공회의소', '회장', '안상교', ''],
  ['산업진흥원', '군포산업진흥원', '원장', '유병직', ''],
  ['산업진흥원', '성남산업진흥원', '원장', '이주연', ''],
  ['산업진흥원', '시흥산업진흥원', '원장', '임창주', ''],
  ['산업진흥원', '부천산업진흥원', '원장', '신동학', ''],
  ['대학교', '협성대학교', '총장', '서명수', ''],
  ['대학교', '장안대학교', '총장', '이종진', ''],
  ['대학교', '화성의과학대학교', '총장', '김진영', ''],
  ['투자사', '캡스톤파트너스', '부사장', '황태칠', ''],
  ['투자사', '앨엔에스벤처캐피탈', '대표이사', '장동식', ''],
  ['투자사', '㈜신한벤처투자', '투자부문대표', '장기용', ''],
  ['투자사', '타임웍스인베스트먼트', '대표이사', '나종윤', ''],
  ['투자사', '제피러스랩', '대표이사', '서영우', ''],
  ['MARS 얼라이언스', '화성특례시', '시장', '정명근', '주최'],
  ['MARS 얼라이언스', '화성시의회', '의장', '이계철', ''],
  ['MARS 얼라이언스', '화성산업진흥원', '원장', '전병선', ''],
  ['MARS 얼라이언스', '신세계프라퍼티', '개발본부장(상무)', '서재옥', ''],
  ['MARS 얼라이언스', '볼트라인', '대표이사', '김도원', ''],
  ['MARS 얼라이언스', '기아', '상무', '이혜영', '국내마케팅실'],
  ['MARS 얼라이언스', 'JMR', '대표', '김동진', ''],
  ['MARS 얼라이언스', '제우스', '팀장', '황재익', ''],
  ['MARS 얼라이언스', '아비만로보틱스', '연구소장', '함민기', ''],
  ['MARS 얼라이언스', '삼성생명', '부사장', '최정훈', ''],
  ['MARS 얼라이언스', '삼성생명', '상무', '김봉재', ''],
  ['MARS 얼라이언스', '삼성생명', '상무', '오상택', ''],
  ['MARS 얼라이언스', '동탄시티병원', '행정원장', '김미영', ''],
  ['MARS 얼라이언스', '대웅제약', '대표이사', '이창재', '일정상 오찬 불가'],
  ['MARS 얼라이언스', '대웅제약', '상무', '조병하', ''],
  ['MARS 얼라이언스', '현대차그룹', '(확인 중)', '(확인 중)', '참석자 확인 중'],
  ['MARS 얼라이언스', '이노스페이스', '대표', '김수종', ''],
  ['기타', '한국군사문제연구원', '원장', '이재헌', ''],
];

const SPEECH_DEFAULT = { '정명근': '개회사', '이계철': '환영사', '김종민': '축사', '하정우': '축사' };
const SPEECH_TYPES = ['개회사', '환영사', '축사', '격려사', '기념사', '인사말'];

const makeSeed = () => SEED.map((r, i) => ({
  id: i + 1,
  category: r[0], organization: r[1], position: r[2], name: r[3], note: r[4],
  grade: 'VVIP',
  seat: `A-${String(i + 1).padStart(2, '0')}`,
  status: '미도착',
  arrivalTime: null, seatedTime: null,
  intro: true,
  speech: !!SPEECH_DEFAULT[r[3]],
  speechType: SPEECH_DEFAULT[r[3]] || '축사',
}));

const seedSpeechOrder = (list) => ['정명근', '이계철', '김종민', '하정우'].map(n => list.find(a => a.name === n)?.id).filter(Boolean);

const DEFAULT_STATE = () => {
  const attendees = makeSeed();
  return {
    event: DEFAULT_EVENT,
    program: DEFAULT_PROGRAM,
    attendees,
    speechOrder: seedSpeechOrder(attendees),
    introOrder: attendees.map(a => a.id),
    seatLayout: { A: { x: 20, y: 20, cols: 10 } },
    adminPin: '1234',
    nextId: attendees.length + 1,
  };
};

const loadState = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (s && s.attendees) return { ...DEFAULT_STATE(), ...s };
  } catch {}
  return DEFAULT_STATE();
};

// ---------- 상수 ----------
const STATUSES = ['미도착', '도착', '착석', '퇴장', '불참'];
const PRESENT = ['도착', '착석'];
const STATUS_STYLE = {
  '미도착': 'bg-slate-100 text-slate-600 border-slate-300',
  '도착': 'bg-amber-50 text-amber-700 border-amber-300',
  '착석': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  '퇴장': 'bg-slate-50 text-slate-500 border-slate-300',
  '불참': 'bg-rose-50 text-rose-700 border-rose-300',
};
const STATUS_DOT = { '미도착': 'bg-slate-400', '도착': 'bg-amber-500', '착석': 'bg-emerald-500', '퇴장': 'bg-slate-300', '불참': 'bg-rose-500' };
const GRADES = ['VVIP', 'VIP', '일반', '관계자'];
const GRADE_STYLES = {
  'VVIP': { bg: 'bg-rose-600', light: 'bg-rose-50', border: 'border-rose-200' },
  'VIP': { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200' },
  '일반': { bg: 'bg-slate-500', light: 'bg-slate-50', border: 'border-slate-200' },
  '관계자': { bg: 'bg-sky-600', light: 'bg-sky-50', border: 'border-sky-200' },
};
const nowHM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const honor = (a) => `${a.organization} ${a.name} ${a.position}님`;

// =====================================================================
// 메인
// =====================================================================
export default function App() {
  const [state, setState] = useState(loadState);
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem('mars-admin') === '1');
  const [view, setView] = useState('board');
  const [loginOpen, setLoginOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }, [state]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); } }, [toast]);

  const { attendees, event, program, speechOrder, introOrder } = state;
  const patch = (fn) => setState(s => ({ ...s, ...fn(s) }));
  const notify = (msg) => setToast(msg);

  // ----- 내빈 상태 -----
  const updateAttendee = (id, changes) => patch(s => ({ attendees: s.attendees.map(a => a.id === id ? { ...a, ...changes } : a) }));
  const setStatus = (id, status) => {
    const t = nowHM();
    patch(s => ({
      attendees: s.attendees.map(a => {
        if (a.id !== id) return a;
        const c = { status };
        if (status === '도착') { c.arrivalTime = a.arrivalTime || t; c.seatedTime = null; }
        if (status === '착석') { c.arrivalTime = a.arrivalTime || t; c.seatedTime = t; }
        if (status === '미도착') { c.arrivalTime = null; c.seatedTime = null; }
        return { ...a, ...c };
      }),
    }));
  };
  const toggleSpeech = (id, on) => patch(s => ({
    attendees: s.attendees.map(a => a.id === id ? { ...a, speech: on } : a),
    speechOrder: on ? (s.speechOrder.includes(id) ? s.speechOrder : [...s.speechOrder, id]) : s.speechOrder.filter(x => x !== id),
  }));
  const toggleIntro = (id, on) => patch(s => ({
    attendees: s.attendees.map(a => a.id === id ? { ...a, intro: on } : a),
    introOrder: on ? (s.introOrder.includes(id) ? s.introOrder : [...s.introOrder, id]) : s.introOrder.filter(x => x !== id),
  }));
  const addAttendee = (data) => patch(s => {
    const id = s.nextId;
    const a = { id, category: '기타', organization: '', position: '', name: '', note: '', grade: 'VVIP', seat: '', status: '미도착', arrivalTime: null, seatedTime: null, intro: true, speech: false, speechType: '축사', ...data };
    return { attendees: [...s.attendees, a], introOrder: [...s.introOrder, id], nextId: id + 1 };
  });
  const removeAttendee = (id) => patch(s => ({
    attendees: s.attendees.filter(a => a.id !== id),
    speechOrder: s.speechOrder.filter(x => x !== id),
    introOrder: s.introOrder.filter(x => x !== id),
  }));

  const stats = useMemo(() => {
    const total = attendees.length;
    const by = st => attendees.filter(a => a.status === st).length;
    const present = attendees.filter(a => PRESENT.includes(a.status)).length;
    const speakers = attendees.filter(a => a.speech);
    return { total, present, arrived: by('도착'), seated: by('착석'), notArrived: by('미도착'), absent: by('불참'), left: by('퇴장'),
      speakers: speakers.length, speakersPresent: speakers.filter(a => PRESENT.includes(a.status)).length,
      rate: total ? Math.round(present / total * 100) : 0 };
  }, [attendees]);

  const login = (pin) => {
    if (pin === state.adminPin) { setIsAdmin(true); sessionStorage.setItem('mars-admin', '1'); setLoginOpen(false); notify('관리자 모드로 전환되었습니다'); return true; }
    return false;
  };
  const logout = () => { setIsAdmin(false); sessionStorage.removeItem('mars-admin'); if (['manage', 'settings'].includes(view)) setView('board'); notify('조회 모드로 전환되었습니다'); };

  const tabs = [
    { id: 'board', label: '현황판', icon: BarChart3 },
    { id: 'speech', label: '인사말씀·소개 순서', icon: Mic2 },
    { id: 'seat', label: '좌석 현황', icon: MapPin },
    { id: 'report', label: '결과 요약', icon: FileText },
    ...(isAdmin ? [{ id: 'manage', label: '내빈 관리', icon: Users }, { id: 'settings', label: '설정', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 머리글 */}
      <header className="print:hidden sticky top-0 z-40 shadow-md">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 shadow"><Crown className="w-5 h-5" /></div>
            <div className="min-w-0">
              <div className="font-bold text-sm md:text-base truncate tracking-tight">{event.name} <span className="text-amber-300 font-semibold">내빈 운영</span></div>
              <div className="text-[11px] text-slate-300 truncate">{event.date} · {event.place} · {event.host}</div>
            </div>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              {isAdmin && <button onClick={() => setQuickAdd(true)} className="btn bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow"><UserPlus className="w-3.5 h-3.5" />긴급 내빈 추가</button>}
              <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${isAdmin ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' : 'bg-white/10 text-slate-200 border-white/20'}`}>
                {isAdmin ? <Unlock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{isAdmin ? '관리자 모드' : '조회 모드'}
              </span>
              {isAdmin
                ? <button onClick={logout} className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20"><Lock className="w-3 h-3" />조회 모드로</button>
                : <button onClick={() => setLoginOpen(true)} className="btn bg-rose-600 text-white hover:bg-rose-500 shadow"><LogIn className="w-3 h-3" />관리자</button>}
            </div>
          </div>
        </div>
        <nav className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-3 flex gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs md:text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${view === t.id ? 'border-indigo-600 text-indigo-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'}`}>
                <t.icon className="w-3.5 h-3.5" />{t.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="print:hidden max-w-7xl mx-auto p-3 md:p-4">
        {view === 'board' && <BoardView attendees={attendees} stats={stats} program={program} isAdmin={isAdmin} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} />}
        {view === 'speech' && <SpeechView attendees={attendees} speechOrder={speechOrder} introOrder={introOrder} isAdmin={isAdmin}
          setSpeechOrder={o => patch(() => ({ speechOrder: o }))} setIntroOrder={o => patch(() => ({ introOrder: o }))}
          updateAttendee={updateAttendee} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} notify={notify} />}
        {view === 'seat' && <SeatView attendees={attendees} layout={state.seatLayout} setLayout={l => patch(s => ({ seatLayout: typeof l === 'function' ? l(s.seatLayout) : l }))} isAdmin={isAdmin} setStatus={setStatus} patch={patch} notify={notify} />}
        {view === 'report' && <ReportView stats={stats} attendees={attendees} event={event} speechOrder={speechOrder} notify={notify} />}
        {view === 'manage' && isAdmin && <ManageView attendees={attendees} updateAttendee={updateAttendee} addAttendee={addAttendee} removeAttendee={removeAttendee} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} notify={notify} patch={patch} />}
        {view === 'settings' && isAdmin && <SettingsView state={state} patch={patch} setState={setState} notify={notify} />}
      </main>

      <footer className="print:hidden max-w-7xl mx-auto px-3 py-2 text-[10px] text-slate-400 flex justify-between">
        <span>화성특례시 AI스마트전략실 · 내빈 소개·인사말씀 운영 플랫폼 v{APP_VERSION}</span>
        <span>자료는 이 브라우저에만 저장됩니다</span>
      </footer>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLogin={login} />}
      {quickAdd && <QuickAddModal onClose={() => setQuickAdd(false)} attendees={attendees} onAdd={(d) => { addAttendee(d); setQuickAdd(false); notify(`${d.name} ${d.position}님을 ${d.status} 상태로 추가했습니다`); }} />}
      <PrintSheet event={event} attendees={attendees} speechOrder={speechOrder} introOrder={introOrder} stats={stats} />
      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/95 text-white text-xs px-4 py-2 rounded-full shadow-xl z-50 print:hidden">{toast}</div>}
    </div>
  );
}

// =====================================================================
// 공통 부품
// =====================================================================
function StatusChip({ status, small }) {
  return <span className={`inline-flex items-center gap-1 rounded border ${small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'} ${STATUS_STYLE[status]}`}><span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />{status}</span>;
}

function StatusButtons({ a, setStatus, compact }) {
  const btn = (st, cls) => (
    <button key={st} onClick={() => setStatus(a.id, st)} disabled={a.status === st}
      className={`${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} rounded font-semibold border disabled:opacity-40 ${cls}`}>{st}</button>
  );
  return (
    <div className="flex flex-wrap gap-1">
      {btn('도착', 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600')}
      {btn('착석', 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700')}
      {btn('퇴장', 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50')}
      {btn('불참', 'bg-white text-rose-600 border-rose-300 hover:bg-rose-50')}
      <button onClick={() => setStatus(a.id, '미도착')} title="초기화" className={`${compact ? 'px-1.5 py-1' : 'px-2 py-1.5'} rounded border border-slate-200 text-slate-400 hover:bg-slate-50`}><RotateCcw className="w-3 h-3" /></button>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const submit = (e) => { e.preventDefault(); if (!onLogin(pin)) { setErr(true); setPin(''); } };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white rounded-lg p-5 w-full max-w-xs shadow-xl">
        <div className="flex items-center gap-2 mb-3"><Lock className="w-4 h-4 text-rose-600" /><h3 className="font-bold text-sm">관리자 모드 입장</h3><button type="button" onClick={onClose} className="ml-auto text-slate-400"><X className="w-4 h-4" /></button></div>
        <input autoFocus type="password" inputMode="numeric" value={pin} onChange={e => { setPin(e.target.value); setErr(false); }} placeholder="비밀번호" className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2 text-center tracking-widest" />
        {err && <div className="text-xs text-rose-600 mb-2">비밀번호가 맞지 않습니다</div>}
        <button className="w-full bg-rose-600 text-white rounded py-2 text-sm font-semibold hover:bg-rose-700">입장</button>
        <p className="text-[10px] text-slate-400 mt-2">초기 비밀번호 1234 · 설정에서 변경하세요</p>
      </form>
    </div>
  );
}

// =====================================================================
// 현황판
// =====================================================================
function BoardView({ attendees, stats, program, isAdmin, setStatus, toggleSpeech, toggleIntro }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('전체');
  const [clock, setClock] = useState(nowHM());
  useEffect(() => { const t = setInterval(() => setClock(nowHM()), 15000); return () => clearInterval(t); }, []);

  const present = attendees.filter(a => PRESENT.includes(a.status)).sort((a, b) => (b.seatedTime || b.arrivalTime || '').localeCompare(a.seatedTime || a.arrivalTime || ''));
  const categories = [...new Set(attendees.map(a => a.category))];
  const visible = attendees.filter(a => (filter === '전체' || a.status === filter || (filter === '인사말씀' && a.speech)) && (!q || `${a.name}${a.organization}${a.position}`.includes(q)));
  const current = program.findIndex((p, i) => { const n = program[i + 1]; return clock >= p.time && (!n || clock < n.time); });

  return (
    <div className="space-y-3">
      {/* 핵심 지표 */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        <KPI label="초청 내빈" value={stats.total} />
        <KPI label="참석(도착+착석)" value={stats.present} sub={`${stats.rate}%`} tone="emerald" />
        <KPI label="착석 완료" value={stats.seated} tone="blue" />
        <KPI label="미도착" value={stats.notArrived} tone="amber" />
        <KPI label="불참·퇴장" value={stats.absent + stats.left} tone="rose" />
        <KPI label="인사말씀 참석" value={`${stats.speakersPresent}/${stats.speakers}`} tone="violet" />
      </div>

      {/* 도착 알림 (소형 칩) */}
      {present.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg px-3 py-2 text-white shadow">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 mr-1 shrink-0"><Bell className="w-3.5 h-3.5 animate-pulse" /><span className="text-xs font-bold">도착 내빈</span><span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded">{present.length}/{stats.total}</span></div>
            {present.map(a => (
              <span key={a.id} title={`${honor(a)} · ${a.status}`} className="inline-flex items-center gap-1 bg-white/15 border border-white/20 rounded px-1.5 py-0.5 text-[11px] leading-4 whitespace-nowrap">
                <span className={`w-1.5 h-1.5 rounded-full ${a.status === '착석' ? 'bg-emerald-300' : 'bg-amber-200'}`} />
                <span className="font-semibold">{a.name}</span><span className="text-white/75">{a.position}</span>
                {a.speech && <Mic2 className="w-2.5 h-2.5 text-amber-200" />}
                <span className="text-white/60 font-mono">{a.seatedTime || a.arrivalTime}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 식순 진행 */}
      <div className="card px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5"><Clock className="w-3.5 h-3.5 text-slate-500" /><span className="text-xs font-bold">식순 진행</span><span className="ml-auto text-[11px] font-mono text-slate-500">현재 {clock}</span></div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {program.map((p, i) => (
            <div key={p.id} className={`shrink-0 rounded px-2 py-1 border text-[11px] ${i === current ? 'bg-slate-900 text-white border-slate-900' : i < current ? 'bg-slate-100 text-slate-400 border-slate-200 line-through' : 'bg-white text-slate-700 border-slate-200'}`}>
              <span className="font-mono mr-1">{p.time}</span>{p.title}
            </div>
          ))}
        </div>
      </div>

      {/* 내빈 목록 */}
      <div className="card p-3">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <h2 className="section-title"><Users className="w-4 h-4" />내빈 현황</h2>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="이름·소속 검색" className="border border-slate-300 rounded px-2 py-1 text-xs w-40" />
          <div className="flex gap-1 flex-wrap">
            {['전체', ...STATUSES, '인사말씀'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 rounded text-[11px] border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}>{f}</button>
            ))}
          </div>
          {!isAdmin && <span className="ml-auto text-[10px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />조회 전용 · 상태 변경은 관리자 모드에서</span>}
        </div>

        {categories.map(cat => {
          const list = visible.filter(a => a.category === cat);
          if (!list.length) return null;
          return (
            <div key={cat} className="mb-3">
              <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center gap-2">{cat}<span className="text-slate-400 font-normal">{list.filter(a => PRESENT.includes(a.status)).length}/{list.length}</span></div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
                {list.map(a => (
                  <div key={a.id} className={`border rounded px-2.5 py-2 flex flex-col gap-1.5 ${a.status === '착석' ? 'border-emerald-200 bg-emerald-50/40' : a.status === '도착' ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200'}`}>
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold truncate">{a.name} <span className="text-xs font-normal text-slate-600">{a.position}</span></div>
                        <div className="text-[11px] text-slate-500 truncate">{a.organization}{a.note && <span className="text-slate-400"> · {a.note}</span>}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <StatusChip status={a.status} small />
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{a.seat}{a.arrivalTime && ` · ${a.arrivalTime}`}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {isAdmin && <StatusButtons a={a} setStatus={setStatus} compact />}
                      <label className={`flex items-center gap-1 text-[11px] ${a.speech ? 'text-violet-700 font-semibold' : 'text-slate-500'} ${isAdmin ? 'cursor-pointer' : ''}`}>
                        <input type="checkbox" checked={a.speech} disabled={!isAdmin} onChange={e => toggleSpeech(a.id, e.target.checked)} className="accent-violet-600" />인사말씀{a.speech && `(${a.speechType})`}
                      </label>
                      <label className={`flex items-center gap-1 text-[11px] ${a.intro ? 'text-slate-700' : 'text-slate-400'} ${isAdmin ? 'cursor-pointer' : ''}`}>
                        <input type="checkbox" checked={a.intro} disabled={!isAdmin} onChange={e => toggleIntro(a.id, e.target.checked)} className="accent-slate-700" />소개
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {!visible.length && <div className="text-xs text-slate-400 text-center py-6">해당하는 내빈이 없습니다</div>}
      </div>
    </div>
  );
}

function KPI({ label, value, sub, tone = 'slate' }) {
  const tones = { slate: 'text-slate-900', emerald: 'text-emerald-600', blue: 'text-blue-600', amber: 'text-amber-600', rose: 'text-rose-600', violet: 'text-violet-600' };
  const bars = { slate: 'bg-slate-400', emerald: 'bg-emerald-500', blue: 'bg-blue-500', amber: 'bg-amber-500', rose: 'bg-rose-500', violet: 'bg-violet-500' };
  return (
    <div className="card px-3 py-2 relative overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${bars[tone]}`} />
      <div className="text-[10px] text-slate-500 pl-1">{label}</div>
      <div className={`text-xl font-bold leading-tight pl-1 ${tones[tone]}`}>{value}{sub && <span className="text-xs font-medium text-slate-400 ml-1">{sub}</span>}</div>
    </div>
  );
}

// =====================================================================
// 순서 목록 (블록 끌어서 이동)
// =====================================================================
function OrderList({ ids, attendees, setOrder, editable, renderExtra, onRemove, presentOnly }) {
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const list = ids.map(id => attendees.find(a => a.id === id)).filter(Boolean).filter(a => !presentOnly || PRESENT.includes(a.status));
  const visibleIds = list.map(a => a.id);

  const move = (from, to) => {
    if (from === to || from == null || to == null) return;
    const vis = [...visibleIds];
    const [m] = vis.splice(from, 1); vis.splice(to, 0, m);
    let k = 0;
    setOrder(ids.map(id => visibleIds.includes(id) ? vis[k++] : id));
  };
  const onDown = (e, i) => { if (!editable) return; setDragIdx(i); e.currentTarget.setPointerCapture?.(e.pointerId); e.preventDefault(); };
  const onMove = (e) => {
    if (dragIdx == null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-oidx]');
    if (el) { const i = Number(el.dataset.oidx); if (i !== overIdx) setOverIdx(i); }
  };
  const onUp = () => { if (dragIdx != null && overIdx != null) move(dragIdx, overIdx); setDragIdx(null); setOverIdx(null); };

  if (!list.length) return <div className="text-xs text-slate-400 text-center py-6 border border-dashed rounded">대상이 없습니다{presentOnly && ' (참석 내빈만 표시 중)'}</div>;
  return (
    <div className="space-y-1.5" onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} style={{ touchAction: editable ? 'none' : 'auto' }}>
      {list.map((a, i) => {
        const absent = !PRESENT.includes(a.status);
        return (
          <div key={a.id} data-oidx={i}
            className={`flex items-center gap-2 rounded-lg border px-2 py-2 bg-white select-none ${dragIdx === i ? 'opacity-50 ring-2 ring-blue-400' : overIdx === i && dragIdx != null ? 'border-blue-400 border-dashed' : absent ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200'}`}>
            {editable && <div onPointerDown={e => onDown(e, i)} className="cursor-grab active:cursor-grabbing text-slate-400 px-1 py-2 shrink-0"><GripVertical className="w-4 h-4" /></div>}
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold truncate">{a.name} <span className="text-xs font-normal text-slate-600">{a.position}</span></div>
              <div className="text-[11px] text-slate-500 truncate">{a.organization}</div>
            </div>
            {renderExtra && renderExtra(a)}
            <StatusChip status={a.status} small />
            {absent && <span className="text-[10px] text-rose-600 font-semibold hidden sm:inline">미참석</span>}
            {editable && (
              <div className="flex items-center gap-0.5 shrink-0">
                <button onClick={() => move(i, Math.max(0, i - 1))} className="text-slate-400 hover:text-slate-800 px-1 text-xs">▲</button>
                <button onClick={() => move(i, Math.min(list.length - 1, i + 1))} className="text-slate-400 hover:text-slate-800 px-1 text-xs">▼</button>
                {onRemove && <button onClick={() => onRemove(a.id)} className="text-slate-300 hover:text-rose-600 px-1"><X className="w-3.5 h-3.5" /></button>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// =====================================================================
// 인사말씀·내빈 소개 순서
// =====================================================================
function SpeechView({ attendees, speechOrder, introOrder, setSpeechOrder, setIntroOrder, isAdmin, updateAttendee, toggleSpeech, toggleIntro, notify }) {
  const [tab, setTab] = useState('speech');
  const [presentOnly, setPresentOnly] = useState(false);
  const [addId, setAddId] = useState('');

  const speakers = speechOrder.map(id => attendees.find(a => a.id === id)).filter(Boolean);
  const introIds = introOrder.filter(id => attendees.find(a => a.id === id)?.intro);
  const intros = introIds.map(id => attendees.find(a => a.id === id));
  const presentSpeakers = speakers.filter(a => PRESENT.includes(a.status));
  const presentIntros = intros.filter(a => PRESENT.includes(a.status));

  const speechScript = (presentOnly ? presentSpeakers : speakers).map((a, i) =>
    `${i + 1}. 다음은 ${honor(a)}의 ${a.speechType}이 있겠습니다. 큰 박수로 맞아 주시기 바랍니다.`).join('\n');
  const introScript = (() => {
    const list = presentOnly ? presentIntros : intros;
    const groups = [];
    list.forEach(a => { const g = groups.find(x => x.cat === a.category); g ? g.items.push(a) : groups.push({ cat: a.category, items: [a] }); });
    return groups.map(g => `[${g.cat}]\n` + g.items.map(a => ` · ${honor(a)}`).join('\n')).join('\n') + '\n\n이상 참석해 주신 내빈 여러분께 감사의 박수를 부탁드립니다.';
  })();

  const copy = (t) => { navigator.clipboard?.writeText(t).then(() => notify('복사되었습니다')); };
  const candidates = attendees.filter(a => tab === 'speech' ? !a.speech : !a.intro);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded border border-slate-300 overflow-hidden">
          <button onClick={() => setTab('speech')} className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ${tab === 'speech' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><Mic2 className="w-3.5 h-3.5" />인사말씀 순서 ({presentSpeakers.length}/{speakers.length})</button>
          <button onClick={() => setTab('intro')} className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1 ${tab === 'intro' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><ListOrdered className="w-3.5 h-3.5" />내빈 소개 순서 ({presentIntros.length}/{intros.length})</button>
        </div>
        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer"><input type="checkbox" checked={presentOnly} onChange={e => setPresentOnly(e.target.checked)} />참석(도착·착석) 내빈만</label>
        {isAdmin && (
          <div className="ml-auto flex items-center gap-1">
            <select value={addId} onChange={e => setAddId(e.target.value)} className="text-xs border border-slate-300 rounded px-2 py-1.5 max-w-[220px]">
              <option value="">+ 대상 추가…</option>
              {candidates.map(a => <option key={a.id} value={a.id}>{a.name} {a.position} · {a.organization}</option>)}
            </select>
            <button onClick={() => { if (!addId) return; tab === 'speech' ? toggleSpeech(Number(addId), true) : toggleIntro(Number(addId), true); setAddId(''); }} className="btn btn-dark"><Plus className="w-3 h-3" />추가</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">{tab === 'speech' ? '인사말씀 순서' : '내빈 소개 순서'}</h2>
            <span className="text-[10px] text-slate-400">{isAdmin ? '⠿ 손잡이를 끌어 블록 단위로 순서를 바꿉니다' : '조회 전용'}</span>
          </div>
          {tab === 'speech' ? (
            <OrderList ids={speechOrder} attendees={attendees} setOrder={setSpeechOrder} editable={isAdmin} presentOnly={presentOnly} onRemove={id => toggleSpeech(id, false)}
              renderExtra={a => isAdmin
                ? <select value={a.speechType} onChange={e => updateAttendee(a.id, { speechType: e.target.value })} className="text-[11px] border border-violet-300 text-violet-700 rounded px-1 py-0.5 bg-violet-50">{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                : <span className="text-[11px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-semibold">{a.speechType}</span>} />
          ) : (
            <OrderList ids={introIds} attendees={attendees} editable={isAdmin} presentOnly={presentOnly} onRemove={id => toggleIntro(id, false)}
              setOrder={vis => { const hidden = introOrder.filter(id => !vis.includes(id)); setIntroOrder([...vis, ...hidden]); }}
              renderExtra={a => <span className="text-[10px] text-slate-400 hidden md:inline">{a.category}</span>} />
          )}
        </div>
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold">사회자 멘트 (자동 작성)</h2>
            <div className="flex gap-1">
              <button onClick={() => copy(tab === 'speech' ? speechScript : introScript)} className="btn btn-outline"><Copy className="w-3 h-3" />복사</button>
              <button onClick={() => { window.__printMode = tab; window.dispatchEvent(new Event('printmode')); setTimeout(() => window.print(), 50); }} className="btn btn-primary"><Printer className="w-3 h-3" />인쇄</button>
            </div>
          </div>
          <textarea readOnly value={tab === 'speech' ? speechScript : introScript} className="flex-1 min-h-[280px] text-xs font-mono border border-slate-200 rounded p-2 bg-slate-50 leading-relaxed" />
          <p className="text-[10px] text-slate-400 mt-1">순서·참석 여부가 바뀌면 멘트가 바로 다시 작성됩니다. 미참석 내빈은 붉게 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 좌석 현황 (구역 블록 이동 · 좌석 구역 재배정)
// =====================================================================
function SeatView({ attendees, layout, setLayout, isAdmin, setStatus, patch, notify }) {
  const seatZones = [...new Set(attendees.map(a => (a.seat || '').split('-')[0]).filter(Boolean))];
  const sections = [...new Set([...seatZones, ...Object.keys(layout).filter(k => k !== '_order')])];
  const [dragging, setDragging] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [editSeats, setEditSeats] = useState(false);
  const [selected, setSelected] = useState([]);
  const [target, setTarget] = useState('');
  const boardRef = useRef(null);
  const get = s => layout[s] || { x: 20, y: 20 + sections.indexOf(s) * 280, cols: 10 };

  const onPointerDown = (e, section) => {
    const board = boardRef.current.getBoundingClientRect();
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    setDragging({ section, offX: e.clientX - rect.left, offY: e.clientY - rect.top, boardLeft: board.left, boardTop: board.top });
    e.currentTarget.setPointerCapture?.(e.pointerId); e.preventDefault();
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const b = boardRef.current;
    const x = Math.max(0, (e.clientX - dragging.boardLeft - dragging.offX + b.scrollLeft) / zoom);
    const y = Math.max(0, (e.clientY - dragging.boardTop - dragging.offY + b.scrollTop) / zoom);
    setLayout(l => ({ ...l, [dragging.section]: { ...get(dragging.section), ...(l[dragging.section] || {}), x: Math.round(x / 10) * 10, y: Math.round(y / 10) * 10 } }));
  };
  const onPointerUp = () => setDragging(null);
  const setCols = (s, cols) => setLayout(l => ({ ...l, [s]: { ...get(s), cols } }));
  const boardHeight = Math.max(600, ...sections.map(s => get(s).y + 360));

  const addZone = () => {
    const name = (prompt('새 구역 이름(영문 한 글자 권장, 예: B)') || '').trim().toUpperCase().replace(/[^A-Z0-9가-힣]/g, '');
    if (!name) return;
    if (sections.includes(name)) return notify('이미 있는 구역입니다');
    const maxY = Math.max(0, ...sections.map(s => get(s).y + 300));
    setLayout(l => ({ ...l, [name]: { x: 20, y: maxY, cols: 10 } }));
    notify(`${name} 구역을 만들었습니다. 좌석 편집에서 내빈을 옮기세요`);
  };
  const removeZone = (z) => { if (attendees.some(a => a.seat.startsWith(z + '-'))) return notify('좌석이 있는 구역은 지울 수 없습니다'); setLayout(l => { const n = { ...l }; delete n[z]; return n; }); };
  const moveSelected = () => {
    if (!target || !selected.length) return;
    patch(s => {
      const used = s.attendees.filter(a => a.seat.startsWith(target + '-') && !selected.includes(a.id)).map(a => Number(a.seat.split('-')[1]) || 0);
      let n = Math.max(0, ...used);
      return { attendees: s.attendees.map(a => selected.includes(a.id) ? { ...a, seat: `${target}-${String(++n).padStart(2, '0')}` } : a) };
    });
    notify(`${selected.length}석을 ${target} 구역으로 옮겼습니다`); setSelected([]);
  };
  const toggleSel = id => setSelected(sel => sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);

  return (
    <div className="card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
        <div>
          <h2 className="section-title"><MapPin className="w-4 h-4" />좌석 현황</h2>
          <p className="text-[11px] text-slate-500">구역 제목을 끌어 블록 단위로 옮깁니다. {isAdmin ? (editSeats ? '좌석을 눌러 선택한 뒤 옮길 구역을 고르세요.' : '좌석을 누르면 착석/도착이 바뀝니다.') : '배치 이동은 가능하며 상태 변경은 관리자 모드에서 합니다.'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 shrink-0">
          {isAdmin && (
            <>
              <button onClick={() => { setEditSeats(v => !v); setSelected([]); }} className={`btn ${editSeats ? 'btn-dark' : 'btn-outline'}`}>{editSeats ? '좌석 편집 끝내기' : '좌석 편집(구역 이동)'}</button>
              <button onClick={addZone} className="btn btn-outline"><Plus className="w-3 h-3" />구역 추가</button>
            </>
          )}
          <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))} className="btn btn-outline">－</button>
          <span className="text-[10px] text-slate-500 w-9 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))} className="btn btn-outline">＋</button>
          <button onClick={() => setLayout({})} className="btn btn-outline">배치 초기화</button>
        </div>
      </div>
      {editSeats && isAdmin && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
          <span className="font-semibold text-blue-800">선택 {selected.length}석</span>
          <select value={target} onChange={e => setTarget(e.target.value)} className="border border-slate-300 rounded px-2 py-1 bg-white">
            <option value="">옮길 구역…</option>
            {sections.map(z => <option key={z} value={z}>{z} 구역</option>)}
          </select>
          <button onClick={moveSelected} disabled={!target || !selected.length} className="btn btn-primary disabled:opacity-40">이 구역으로 이동</button>
          <button onClick={() => setSelected([])} className="btn btn-outline">선택 해제</button>
          <span className="text-slate-500">옮긴 좌석은 해당 구역 마지막 번호부터 차례로 번호가 매겨집니다.</span>
        </div>
      )}
      <div className="stage">━━━━━ 무 대 (STAGE) ━━━━━</div>
      <div ref={boardRef} className="relative overflow-auto rounded-lg border border-dashed border-slate-300 bg-slate-50" style={{ height: 640, backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', touchAction: 'none' }}
        onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
        <div style={{ position: 'relative', width: '100%', minHeight: boardHeight * zoom }}>
          {sections.map(section => {
            const list = attendees.filter(a => a.seat.startsWith(section + '-')).sort((a, b) => a.seat.localeCompare(b.seat));
            const grade = list[0]?.grade || 'VVIP'; const style = GRADE_STYLES[grade] || GRADE_STYLES.VVIP; const pos = get(section);
            const seatPx = 44; const width = pos.cols * seatPx + (pos.cols - 1) * 4 + 16;
            return (
              <div key={section} className={`absolute bg-white rounded-xl border shadow-sm select-none ${dragging?.section === section ? 'shadow-lg ring-2 ring-blue-400 z-20' : 'border-slate-200 z-10'}`}
                style={{ left: pos.x * zoom, top: pos.y * zoom, width, transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
                <div onPointerDown={e => onPointerDown(e, section)} className={`flex items-center justify-between px-2 py-1.5 rounded-t-xl cursor-grab active:cursor-grabbing ${style.light} border-b ${style.border}`}>
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-3.5 h-3.5 text-slate-400" />
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${style.bg}`}>{grade}</span>
                    <span className="text-xs font-bold text-slate-700">{section} 구역 ({list.length}석)</span>
                  </div>
                  <div className="flex items-center gap-2" onPointerDown={e => e.stopPropagation()}>
                    <select value={pos.cols} onChange={e => setCols(section, Number(e.target.value))} className="text-[10px] border border-slate-300 rounded px-1 py-0.5 bg-white">{[4, 5, 6, 8, 10, 12, 15].map(c => <option key={c} value={c}>{c}열</option>)}</select>
                    <span className="text-[10px] text-slate-500">착석 {list.filter(a => a.status === '착석').length}/{list.length}</span>
                    {isAdmin && !list.length && <button onClick={() => removeZone(section)} className="text-slate-300 hover:text-rose-600"><X className="w-3 h-3" /></button>}
                  </div>
                </div>
                <div className="p-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${pos.cols}, ${seatPx}px)`, minHeight: 60 }}>
                  {!list.length && <div className="text-[10px] text-slate-400 col-span-full py-3 text-center">빈 구역 — 좌석 편집에서 내빈을 옮기세요</div>}
                  {list.map(a => {
                    const seated = a.status === '착석'; const arrived = a.status === '도착'; const sel = selected.includes(a.id);
                    return (
                      <div key={a.id} title={`${a.seat} · ${a.name} ${a.position} · ${a.status}`}
                        onClick={() => { if (!isAdmin) return; editSeats ? toggleSel(a.id) : setStatus(a.id, seated ? '도착' : '착석'); }}
                        className={`aspect-square rounded-md text-[9px] flex flex-col items-center justify-center leading-tight transition-transform hover:scale-110 ${isAdmin ? 'cursor-pointer' : 'cursor-help'} ${sel ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${
                          seated ? `${style.bg} text-white` : arrived ? 'bg-amber-100 text-amber-800 border border-amber-300' : a.status === '불참' ? 'bg-rose-50 text-rose-300 border border-rose-200 line-through' : 'bg-slate-100 text-slate-400 border border-dashed border-slate-300'}`}>
                        <div className="font-mono font-bold">{a.seat.split('-')[1]}</div>
                        <div className="truncate max-w-[40px]">{a.name.slice(0, 3)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 내빈 관리 (관리자)
// =====================================================================
function ManageView({ attendees, updateAttendee, addAttendee, removeAttendee, setStatus, toggleSpeech, toggleIntro, notify, patch }) {
  const [paste, setPaste] = useState('');
  const [showPaste, setShowPaste] = useState(false);
  const cell = 'border border-transparent hover:border-slate-300 focus:border-blue-400 rounded px-1 py-0.5 text-xs w-full bg-transparent';

  const importPaste = () => {
    const rows = paste.split('\n').map(r => r.trim()).filter(Boolean);
    let n = 0;
    rows.forEach(r => {
      const c = r.split(/\t|\|/).map(x => x.trim());
      if (c.length < 4) return;
      addAttendee({ category: c[0], organization: c[1], position: c[2], name: c[3], seat: c[4] || '', note: c[5] || '' }); n++;
    });
    setPaste(''); setShowPaste(false); notify(`${n}명을 추가했습니다`);
  };
  const exportCsv = () => {
    const head = ['연번', '구분', '소속', '직위', '성명', '등급', '좌석', '상태', '도착', '착석', '인사말씀', '소개', '비고'];
    const rows = attendees.map((a, i) => [i + 1, a.category, a.organization, a.position, a.name, a.grade, a.seat, a.status, a.arrivalTime || '', a.seatedTime || '', a.speech ? a.speechType : '', a.intro ? 'Y' : '', a.note]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `내빈현황_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  const resetStatus = () => { if (confirm('모든 내빈의 도착·착석 상태를 미도착으로 되돌립니다. 계속할까요?')) patch(s => ({ attendees: s.attendees.map(a => ({ ...a, status: '미도착', arrivalTime: null, seatedTime: null })) })); };
  const reseat = () => { if (confirm('현재 목록 순서대로 좌석번호(A-01~)를 다시 매깁니다. 계속할까요?')) patch(s => ({ attendees: s.attendees.map((a, i) => ({ ...a, seat: `A-${String(i + 1).padStart(2, '0')}` })) })); };

  return (
    <div className="card p-3">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <h2 className="section-title"><Users className="w-4 h-4" />내빈 관리 <span className="text-xs font-normal text-slate-500">{attendees.length}명</span></h2>
        <div className="ml-auto flex flex-wrap gap-1">
          <button onClick={() => addAttendee({})} className="btn btn-dark"><Plus className="w-3 h-3" />1명 추가</button>
          <button onClick={() => setShowPaste(v => !v)} className="btn btn-outline"><Upload className="w-3 h-3" />엑셀 붙여넣기</button>
          <button onClick={exportCsv} className="btn btn-outline"><Download className="w-3 h-3" />엑셀(CSV) 저장</button>
          <button onClick={reseat} className="btn btn-outline">좌석 재부여</button>
          <button onClick={resetStatus} className="text-xs px-2 py-1.5 rounded border border-rose-300 text-rose-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" />상태 초기화</button>
        </div>
      </div>
      {showPaste && (
        <div className="mb-3 border border-blue-200 bg-blue-50 rounded p-2">
          <div className="text-[11px] text-slate-600 mb-1">엑셀에서 <b>구분 | 소속 | 직위 | 성명 | 좌석 | 비고</b> 열을 복사해 붙여넣으세요 (탭 또는 | 구분, 좌석·비고는 생략 가능)</div>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={5} className="w-full text-xs border border-slate-300 rounded p-2 font-mono" placeholder={'국회\t국회\t국회의원\t홍길동\tA-44'} />
          <div className="flex gap-1 mt-1"><button onClick={importPaste} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">추가</button><button onClick={() => setShowPaste(false)} className="text-xs px-3 py-1 rounded border">취소</button></div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs min-w-[980px]">
          <thead><tr className="bg-slate-100 text-slate-600 text-left">
            {['#', '구분', '소속', '직위', '성명', '등급', '좌석', '상태 변경', '인사말씀', '소개', '비고', ''].map(h => <th key={h} className="px-1.5 py-1.5 font-semibold whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {attendees.map((a, i) => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 align-middle">
                <td className="px-1.5 text-slate-400">{i + 1}</td>
                <td className="px-1 w-28"><input className={cell} value={a.category} onChange={e => updateAttendee(a.id, { category: e.target.value })} /></td>
                <td className="px-1 w-44"><input className={cell} value={a.organization} onChange={e => updateAttendee(a.id, { organization: e.target.value })} /></td>
                <td className="px-1 w-28"><input className={cell} value={a.position} onChange={e => updateAttendee(a.id, { position: e.target.value })} /></td>
                <td className="px-1 w-24"><input className={`${cell} font-bold`} value={a.name} onChange={e => updateAttendee(a.id, { name: e.target.value })} /></td>
                <td className="px-1"><select value={a.grade} onChange={e => updateAttendee(a.id, { grade: e.target.value })} className="text-xs border border-slate-200 rounded px-1 py-0.5">{GRADES.map(g => <option key={g}>{g}</option>)}</select></td>
                <td className="px-1 w-16"><input className={`${cell} font-mono`} value={a.seat} onChange={e => updateAttendee(a.id, { seat: e.target.value.toUpperCase() })} /></td>
                <td className="px-1"><div className="flex items-center gap-1"><StatusChip status={a.status} small /><StatusButtons a={a} setStatus={setStatus} compact /></div></td>
                <td className="px-1 whitespace-nowrap">
                  <input type="checkbox" checked={a.speech} onChange={e => toggleSpeech(a.id, e.target.checked)} className="accent-violet-600 mr-1" />
                  {a.speech && <select value={a.speechType} onChange={e => updateAttendee(a.id, { speechType: e.target.value })} className="text-[11px] border border-violet-200 rounded px-1">{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select>}
                </td>
                <td className="px-1 text-center"><input type="checkbox" checked={a.intro} onChange={e => toggleIntro(a.id, e.target.checked)} /></td>
                <td className="px-1 w-32"><input className={cell} value={a.note} onChange={e => updateAttendee(a.id, { note: e.target.value })} /></td>
                <td className="px-1"><button onClick={() => { if (confirm(`${a.name || '이 내빈'}을(를) 삭제할까요?`)) removeAttendee(a.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================================
// 설정 (관리자)
// =====================================================================
function SettingsView({ state, patch, setState, notify }) {
  const [ev, setEv] = useState(state.event);
  const [prog, setProg] = useState(state.program.map(p => `${p.time} | ${p.dur} | ${p.title} | ${p.note}`).join('\n'));
  const [pin1, setPin1] = useState(''); const [pin2, setPin2] = useState('');
  const fileRef = useRef(null);

  const saveEvent = () => { patch(() => ({ event: ev })); notify('행사 정보를 저장했습니다'); };
  const saveProg = () => {
    const program = prog.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => { const c = l.split('|').map(x => x.trim()); return { id: 'p' + (i + 1), time: c[0] || '', dur: Number(c[1]) || 0, title: c[2] || '', note: c[3] || '' }; });
    patch(() => ({ program })); notify('식순을 저장했습니다');
  };
  const savePin = () => { if (pin1.length < 4) return notify('4자리 이상 입력하세요'); if (pin1 !== pin2) return notify('두 입력이 다릅니다'); patch(() => ({ adminPin: pin1 })); setPin1(''); setPin2(''); notify('비밀번호를 변경했습니다'); };
  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `내빈플랫폼_백업_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`; a.click();
  };
  const restore = (f) => { const r = new FileReader(); r.onload = () => { try { const s = JSON.parse(r.result); if (!s.attendees) throw 0; setState({ ...DEFAULT_STATE(), ...s }); notify('복원했습니다'); } catch { notify('파일 형식이 올바르지 않습니다'); } }; r.readAsText(f); };
  const resetAll = () => { if (confirm('모든 자료를 초기 상태(RSVP 43명)로 되돌립니다. 백업을 먼저 받으셨나요?')) { setState(DEFAULT_STATE()); notify('초기화했습니다'); } };
  const box = 'card p-3';
  const inp = 'w-full border border-slate-300 rounded px-2 py-1.5 text-xs';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className={box}>
        <h2 className="section-title mb-2">행사 정보</h2>
        {[['name', '행사명'], ['date', '일시'], ['place', '장소'], ['host', '주최'], ['mc', '사회자']].map(([k, l]) => (
          <label key={k} className="block mb-1.5"><span className="text-[11px] text-slate-500">{l}</span><input className={inp} value={ev[k]} onChange={e => setEv({ ...ev, [k]: e.target.value })} /></label>
        ))}
        <button onClick={saveEvent} className="btn btn-dark">저장</button>
      </div>
      <div className={box}>
        <h2 className="section-title mb-1">식순</h2>
        <p className="text-[11px] text-slate-500 mb-1">한 줄에 하나씩 <b>시작시각 | 소요(분) | 내용 | 비고</b></p>
        <textarea value={prog} onChange={e => setProg(e.target.value)} rows={11} className={`${inp} font-mono`} />
        <button onClick={saveProg} className="btn btn-dark mt-1">저장</button>
      </div>
      <div className={box}>
        <h2 className="section-title mb-2">관리자 비밀번호 변경</h2>
        <div className="flex gap-2 mb-2"><input type="password" placeholder="새 비밀번호" value={pin1} onChange={e => setPin1(e.target.value)} className={inp} /><input type="password" placeholder="다시 입력" value={pin2} onChange={e => setPin2(e.target.value)} className={inp} /></div>
        <button onClick={savePin} className="btn btn-dark">변경</button>
        <p className="text-[10px] text-slate-400 mt-2">비밀번호는 이 브라우저에만 저장됩니다. 공용 PC에서는 사용 후 조회 모드로 전환하세요.</p>
      </div>
      <div className={box}>
        <h2 className="section-title mb-2">자료 백업·복원</h2>
        <div className="flex flex-wrap gap-1">
          <button onClick={backup} className="btn btn-outline"><Download className="w-3 h-3" />백업 파일 내려받기</button>
          <button onClick={() => fileRef.current.click()} className="btn btn-outline"><Upload className="w-3 h-3" />백업 파일 복원</button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={e => e.target.files[0] && restore(e.target.files[0])} />
          <button onClick={resetAll} className="text-xs px-3 py-1.5 rounded border border-rose-300 text-rose-600">초기 자료로 되돌리기</button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">다른 PC·태블릿에서 같은 자료를 쓰려면 백업 파일을 옮겨 복원하세요. 행사 전날과 당일 아침에 백업을 권장합니다.</p>
      </div>
    </div>
  );
}

// =====================================================================
// 결과 요약
// =====================================================================
function ReportView({ stats, attendees, event, speechOrder, notify }) {
  const speakers = speechOrder.map(id => attendees.find(a => a.id === id)).filter(Boolean);
  const text = `▣ ${event.name} 내빈 참석 결과 (${new Date().toLocaleString('ko-KR')} 기준)
 · 초청 내빈 : ${stats.total}명
 · 참석 : ${stats.present}명 (${stats.rate}%) — 착석 ${stats.seated}, 도착 ${stats.arrived}
 · 미도착 ${stats.notArrived}명 / 불참 ${stats.absent}명 / 퇴장 ${stats.left}명

▣ 인사말씀 (${speakers.length}명)
${speakers.map((a, i) => ` ${i + 1}. ${a.speechType} — ${honor(a)} [${a.status}]`).join('\n')}

▣ 미도착·불참 내빈
${attendees.filter(a => !PRESENT.includes(a.status)).map(a => ` · ${honor(a)} (${a.status})`).join('\n') || ' · 없음'}`;
  const byCat = [...new Set(attendees.map(a => a.category))].map(c => { const l = attendees.filter(a => a.category === c); return { c, t: l.length, p: l.filter(a => PRESENT.includes(a.status)).length }; });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="card p-3">
        <h2 className="section-title mb-2">구분별 참석 현황</h2>
        <table className="w-full text-xs">
          <thead><tr className="bg-slate-100 text-slate-600"><th className="text-left px-2 py-1">구분</th><th className="px-2 py-1">초청</th><th className="px-2 py-1">참석</th><th className="px-2 py-1">참석률</th></tr></thead>
          <tbody>{byCat.map(r => <tr key={r.c} className="border-b border-slate-100"><td className="px-2 py-1">{r.c}</td><td className="text-center">{r.t}</td><td className="text-center font-bold text-emerald-700">{r.p}</td><td className="text-center">{r.t ? Math.round(r.p / r.t * 100) : 0}%</td></tr>)}
            <tr className="font-bold bg-slate-50"><td className="px-2 py-1">합계</td><td className="text-center">{stats.total}</td><td className="text-center text-emerald-700">{stats.present}</td><td className="text-center">{stats.rate}%</td></tr></tbody>
        </table>
      </div>
      <div className="card p-3 flex flex-col">
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-bold">보고용 요약문</h2><button onClick={() => navigator.clipboard?.writeText(text).then(() => notify('복사되었습니다'))} className="btn btn-outline"><Copy className="w-3 h-3" />복사</button></div>
        <textarea readOnly value={text} className="flex-1 min-h-[300px] text-xs font-mono border border-slate-200 rounded p-2 bg-slate-50" />
      </div>
    </div>
  );
}

// =====================================================================
// 긴급 내빈 추가 (갑작스러운 참석)
// =====================================================================
function QuickAddModal({ onClose, attendees, onAdd }) {
  const zones = [...new Set(attendees.map(a => (a.seat || '').split('-')[0]).filter(Boolean))];
  const nextSeat = (z) => { const n = Math.max(0, ...attendees.filter(a => a.seat.startsWith(z + '-')).map(a => Number(a.seat.split('-')[1]) || 0)); return `${z}-${String(n + 1).padStart(2, '0')}`; };
  const [f, setF] = useState({ name: '', position: '', organization: '', category: '긴급 추가', grade: 'VVIP', zone: zones[0] || 'A', status: '도착', speech: false, speechType: '축사', note: '현장 추가' });
  const inp = 'w-full border border-slate-300 rounded-md px-2 py-1.5 text-sm';
  const submit = (e) => { e.preventDefault(); if (!f.name.trim()) return; const { zone, ...rest } = f; onAdd({ ...rest, seat: nextSeat(zone), arrivalTime: f.status === '미도착' ? null : nowHM(), seatedTime: f.status === '착석' ? nowHM() : null, intro: true }); };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-5 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-2 mb-3"><UserPlus className="w-4 h-4 text-amber-500" /><h3 className="font-bold text-sm">긴급 내빈 추가</h3><span className="text-[10px] text-slate-400">갑자기 오신 분을 바로 등록</span><button type="button" onClick={onClose} className="ml-auto text-slate-400"><X className="w-4 h-4" /></button></div>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2"><span className="text-[11px] text-slate-500">성명 *</span><input autoFocus className={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
          <label><span className="text-[11px] text-slate-500">직위</span><input className={inp} value={f.position} onChange={e => setF({ ...f, position: e.target.value })} /></label>
          <label><span className="text-[11px] text-slate-500">소속</span><input className={inp} value={f.organization} onChange={e => setF({ ...f, organization: e.target.value })} /></label>
          <label><span className="text-[11px] text-slate-500">구분</span><input className={inp} value={f.category} onChange={e => setF({ ...f, category: e.target.value })} list="cats" /><datalist id="cats">{[...new Set(attendees.map(a => a.category))].map(c => <option key={c} value={c} />)}</datalist></label>
          <label><span className="text-[11px] text-slate-500">등급</span><select className={inp} value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label>
          <label><span className="text-[11px] text-slate-500">좌석 구역</span><select className={inp} value={f.zone} onChange={e => setF({ ...f, zone: e.target.value })}>{(zones.length ? zones : ['A']).map(z => <option key={z} value={z}>{z} 구역 → {nextSeat(z)}</option>)}</select></label>
          <label><span className="text-[11px] text-slate-500">현재 상태</span><select className={inp} value={f.status} onChange={e => setF({ ...f, status: e.target.value })}>{STATUSES.map(st => <option key={st}>{st}</option>)}</select></label>
          <label className="col-span-2 flex items-center gap-2 text-xs mt-1"><input type="checkbox" checked={f.speech} onChange={e => setF({ ...f, speech: e.target.checked })} className="accent-violet-600" />인사말씀 대상
            {f.speech && <select className="text-xs border border-violet-300 rounded px-1 py-0.5" value={f.speechType} onChange={e => setF({ ...f, speechType: e.target.value })}>{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select>}</label>
        </div>
        <div className="flex gap-2 mt-4"><button className="btn btn-primary flex-1 justify-center py-2">추가</button><button type="button" onClick={onClose} className="btn btn-outline">취소</button></div>
      </form>
    </div>
  );
}

// =====================================================================
// 인쇄용 양식 (인사말씀 순서 · 내빈 소개 순서)
// =====================================================================
function PrintSheet({ event, attendees, speechOrder, introOrder, stats }) {
  const speakers = speechOrder.map(id => attendees.find(a => a.id === id)).filter(Boolean);
  const intros = introOrder.map(id => attendees.find(a => a.id === id)).filter(a => a && a.intro);
  const [mode, setMode] = useState('speech');
  useEffect(() => { const h = () => setMode(window.__printMode || 'speech'); window.addEventListener('printmode', h); return () => window.removeEventListener('printmode', h); }, []);
  const stamp = new Date().toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="hidden print:block text-black p-2">
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <div className="text-xl font-bold">{event.name}</div>
        <div className="text-base font-bold mt-1">{mode === 'intro' ? '내빈 소개 순서' : '인사말씀 순서'}</div>
        <div className="text-xs mt-1">{event.date} · {event.place} · 출력 {stamp} · 참석 {stats.present}/{stats.total}명</div>
      </div>
      {mode === 'speech' ? (
        <table className="w-full text-sm border-collapse">
          <thead><tr className="bg-slate-100"><th className="border border-black px-2 py-1 w-10">순</th><th className="border border-black px-2 py-1 w-20">구분</th><th className="border border-black px-2 py-1">소속</th><th className="border border-black px-2 py-1">직위</th><th className="border border-black px-2 py-1">성명</th><th className="border border-black px-2 py-1 w-16">참석</th><th className="border border-black px-2 py-1 w-24">비고</th></tr></thead>
          <tbody>{speakers.map((a, i) => <tr key={a.id}><td className="border border-black px-2 py-1.5 text-center font-bold">{i + 1}</td><td className="border border-black px-2 py-1.5 text-center font-bold">{a.speechType}</td><td className="border border-black px-2 py-1.5">{a.organization}</td><td className="border border-black px-2 py-1.5">{a.position}</td><td className="border border-black px-2 py-1.5 font-bold text-base">{a.name}</td><td className="border border-black px-2 py-1.5 text-center">{PRESENT.includes(a.status) ? '○' : '×'}</td><td className="border border-black px-2 py-1.5 text-xs">{a.note}</td></tr>)}</tbody>
        </table>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-slate-100"><th className="border border-black px-1 py-1 w-8">순</th><th className="border border-black px-1 py-1 w-24">구분</th><th className="border border-black px-1 py-1">소속</th><th className="border border-black px-1 py-1">직위</th><th className="border border-black px-1 py-1 w-16">성명</th><th className="border border-black px-1 py-1 w-12">좌석</th><th className="border border-black px-1 py-1 w-10">참석</th></tr></thead>
          <tbody>{intros.map((a, i) => <tr key={a.id}><td className="border border-black px-1 py-0.5 text-center">{i + 1}</td><td className="border border-black px-1 py-0.5">{a.category}</td><td className="border border-black px-1 py-0.5">{a.organization}</td><td className="border border-black px-1 py-0.5">{a.position}</td><td className="border border-black px-1 py-0.5 font-bold">{a.name}</td><td className="border border-black px-1 py-0.5 text-center font-mono">{a.seat}</td><td className="border border-black px-1 py-0.5 text-center">{PRESENT.includes(a.status) ? '○' : '×'}</td></tr>)}</tbody>
        </table>
      )}
      <div className="mt-3 text-xs">
        {mode === 'speech' && speakers.map((a, i) => <div key={a.id} className="mb-1">{i + 1}. 다음은 {honor(a)}의 {a.speechType}이 있겠습니다. 큰 박수로 맞아 주시기 바랍니다.</div>)}
        <div className="mt-2 text-[10px] text-slate-500">※ 참석란 ○=도착·착석, ×=미도착·불참. 화성특례시 AI스마트전략실</div>
      </div>
    </div>
  );
}
