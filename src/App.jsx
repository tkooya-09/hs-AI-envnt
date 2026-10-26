import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Crown, MapPin, Clock, BarChart3, Mic2, FileText, Bell, X, Lock, Unlock, Settings, Copy, Plus, Trash2, GripVertical, Download, Upload, RotateCcw, ListOrdered, Eye, LogIn, Printer, UserPlus, MessageCircle, Pencil, Search, Share2, ArrowUpDown } from 'lucide-react';

// =====================================================================
// 공공행사 내빈 소개·인사말씀 운영 플랫폼 (AI EXPO 「MARS 2026」 개막식)
// 단일 파일 React 앱 · 모든 자료는 브라우저(localStorage)에 저장
// =====================================================================

const STORE_KEY = 'mars-vip-platform-v2';
const APP_VERSION = '3.5.0';

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

// 의전 순위 초안: 주최 → 국회 → 중앙정부·위원회 → 지방의회 → 공공기관장 → 학계·단체 → 경제계(대표이사 → 부사장 → 상무…) → 투자사
const DEFAULT_RANK = {
  '정명근': 1, '김종민': 2, '하정우': 3, '하용호': 4, '김동환': 5, '조성배': 6, '전종홍': 7,
  '이계철': 8, '황선희': 9,
  '양재수': 10, '전병선': 11, '유병직': 12, '이주연': 13, '임창주': 14, '신동학': 15, '한상선': 16, '이재헌': 17,
  '서명수': 18, '이종진': 19, '김진영': 20, '유태준': 21, '구남서': 22, '채종철': 23,
  '안상교': 24, '김도원': 25, '이창재': 26, '김수종': 27, '김동진': 28, '최정훈': 29, '서재옥': 30, '이혜영': 31,
  '김봉재': 32, '오상택': 33, '조병하': 34, '김미영': 35, '함민기': 36, '황재익': 37, '(확인 중)': 38,
  '장동식': 39, '나종윤': 40, '서영우': 41, '장기용': 42, '황태칠': 43,
};
const rankOf = (a) => (a.rank != null && a.rank !== '' ? Number(a.rank) : (DEFAULT_RANK[a.name] ?? 999));
const byRank = (x, y) => rankOf(x) - rankOf(y) || x.id - y.id;
// 한 줄 안에서 상석 순서: 무대에서 내려다보아 가운데 → 왼쪽 → 오른쪽 교대 (배치도 기준 가운데 → 오른쪽 → 왼쪽)
const centerOrder = (n) => {
  const out = []; const c = Math.floor(n / 2);
  if (n % 2) { out.push(c); for (let d = 1; out.length < n; d++) { if (c + d < n) out.push(c + d); if (c - d >= 0) out.push(c - d); } }
  else { out.push(c, c - 1); for (let d = 1; out.length < n; d++) { if (c + d < n) out.push(c + d); if (c - 1 - d >= 0) out.push(c - 1 - d); } }
  return out.slice(0, n);
};

const makeSeed = () => SEED.map((r, i) => ({
  id: i + 1,
  category: r[0], organization: r[1], position: r[2], name: r[3], note: r[4],
  grade: 'VVIP',
  seat: `A-${String(i + 1).padStart(2, '0')}`,
  status: '미도착',
  arrivalTime: null, seatedTime: null,
  intro: r[4] !== '주최',
  rank: DEFAULT_RANK[r[3]] ?? 999,
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
    metaAt: 0,
    tombstones: {},
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
// ---------- 공유 저장소(Supabase) ----------
const SYNC = { url: 'https://sbnjodqxvwgqgdnzcziz.supabase.co', key: 'sb_publishable_vDOafQ_YqlElOwBxLeHHvA_x1mgHGLw', table: 'event_state', id: 'mars-2026' };
const SYNC_ON = SYNC.url.startsWith('http');
const mergeState = (local, remote) => {
  if (!remote) return local;
  if (!local) return remote;
  const tomb = { ...(remote.tombstones || {}), ...(local.tombstones || {}) };
  const byId = new Map();
  [...(remote.attendees || []), ...(local.attendees || [])].forEach(a => {
    const t = tomb[a.id]; if (t && t >= (a.u || 0)) return;
    const cur = byId.get(a.id);
    if (!cur || (a.u || 0) >= (cur.u || 0)) byId.set(a.id, a);
  });
  const meta = (local.metaAt || 0) >= (remote.metaAt || 0) ? local : remote;
  const attendees = [...byId.values()].sort((a, b) => a.id - b.id);
  return { ...meta, attendees, tombstones: tomb, nextId: Math.max(local.nextId || 0, remote.nextId || 0, ...attendees.map(a => a.id + 1)),
    speechOrder: (meta.speechOrder || []).filter(id => byId.has(id)), introOrder: [...(meta.introOrder || []).filter(id => byId.has(id)), ...attendees.map(a => a.id).filter(id => !(meta.introOrder || []).includes(id))] };
};
const syncHeaders = (pin) => ({ apikey: SYNC.key, Authorization: `Bearer ${SYNC.key}`, 'Content-Type': 'application/json', ...(pin ? { 'x-event-pin': pin } : {}) });
const ROW = `${SYNC.url}/rest/v1/${SYNC.table}?id=eq.${SYNC.id}`;
// 바뀐 시각만 먼저 확인(수십 바이트) → 바뀌었을 때만 전체 자료를 받음
const syncHead = async () => {
  const r = await fetch(`${ROW}&select=updated_at`, { headers: syncHeaders() });
  if (!r.ok) throw new Error('head ' + r.status);
  const rows = await r.json(); return rows[0]?.updated_at || null;
};
const syncPull = async () => {
  const r = await fetch(`${ROW}&select=data,updated_at`, { headers: syncHeaders() });
  if (!r.ok) throw new Error('pull ' + r.status);
  const rows = await r.json(); return rows[0] || null;
};
// 쓰기: 비밀번호가 맞을 때만 서버가 수정해 줌(틀리면 0건)
const syncPush = async (data, pin) => {
  const r = await fetch(`${ROW}&select=updated_at`, { method: 'PATCH', headers: { ...syncHeaders(pin), Prefer: 'return=representation' }, body: JSON.stringify({ data, updated_at: new Date().toISOString() }) });
  if (!r.ok) throw new Error('push ' + r.status);
  const rows = await r.json(); if (!rows.length) throw new Error('PIN'); return rows[0].updated_at;
};
const syncCheckPin = async (pin) => {
  const head = await syncHead();
  const r = await fetch(`${ROW}&select=updated_at`, { method: 'PATCH', headers: { ...syncHeaders(pin), Prefer: 'return=representation' }, body: JSON.stringify({ updated_at: head }) });
  if (!r.ok) return false; const rows = await r.json(); return rows.length > 0;
};
const syncChangePin = async (oldPin, newPin) => {
  const r = await fetch(`${SYNC.url}/rest/v1/rpc/event_change_pin`, { method: 'POST', headers: syncHeaders(), body: JSON.stringify({ p_id: SYNC.id, p_old: oldPin, p_new: newPin }) });
  if (r.ok) return (await r.json()) === true;
  if (r.status === 404) { // 서버 함수가 아직 없으면 직접 수정
    const r2 = await fetch(`${ROW}&select=updated_at`, { method: 'PATCH', headers: { ...syncHeaders(oldPin), Prefer: 'return=representation' }, body: JSON.stringify({ pin: newPin }) });
    if (!r2.ok) return false; return (await r2.json()).length > 0;
  }
  return false;
};
const stripLocal = (s) => { const { seatLayout, adminPin, ...rest } = s; return rest; }; // 배치는 기기별, 비밀번호는 절대 공유 안 함
const pinStore = {
  get: () => { try { return sessionStorage.getItem('mars-pin') || localStorage.getItem('mars-pin') || ''; } catch { return ''; } },
  set: (v, keep) => { try { sessionStorage.setItem('mars-pin', v); if (keep) localStorage.setItem('mars-pin', v); } catch {} },
  clear: () => { try { sessionStorage.removeItem('mars-pin'); localStorage.removeItem('mars-pin'); } catch {} },
};

const EMBEDDED = typeof window !== 'undefined' && window.self !== window.top;
const nowHM = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const iga = (w) => { const c = (w || '').charCodeAt((w || '').length - 1) - 0xAC00; return c >= 0 && c <= 11171 && c % 28 ? '이' : '가'; };
// 인사말씀 대상: 순서 목록 + (다른 기기와 엇갈려 빠진) 대상자를 뒤에 덧붙임
const speakerList = (attendees, speechOrder) => {
  const inOrder = speechOrder.map(id => attendees.find(a => a.id === id)).filter(a => a && a.speech);
  const extra = attendees.filter(a => a.speech && !speechOrder.includes(a.id));
  return [...inOrder, ...extra];
};
const copyText = async (text, notify, fallbackId) => {
  try { await navigator.clipboard.writeText(text); notify('복사했습니다'); }
  catch { const el = fallbackId && document.getElementById(fallbackId); if (el) { el.focus(); el.select(); } notify('복사가 막혀 있습니다. 글자를 길게 눌러 복사하세요'); }
};
const verNum = v => String(v || '0').split('.').map(Number).reduce((acc, n) => acc * 1000 + (n || 0), 0);
const lsSafe = { get: (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };
const honor = (a) => `${a.organization} ${a.name} ${a.position}님`;

// =====================================================================
// 메인
// =====================================================================
export default function App() {
  const [state, setState] = useState(loadState);
  const [isAdmin, setIsAdmin] = useState(() => { const flag = sessionStorage.getItem('mars-admin') === '1' || localStorage.getItem('mars-admin-keep') === '1'; return SYNC_ON ? flag && !!pinStore.get() : flag; });
  const [view, setView] = useState('board');
  const [loginOpen, setLoginOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [ask, setAsk] = useState(null); // { msg, input, resolve }
  const askUser = (msg, input) => new Promise(resolve => setAsk({ msg, input, resolve }));
  const [sync, setSync] = useState({ on: SYNC_ON, status: SYNC_ON ? '연결 중' : '꺼짐', at: null, err: null });
  const stateRef = useRef(state); stateRef.current = state;
  const remoteRef = useRef(null); // 마지막으로 서버와 맞춘 내용(문자열)
  const pushTimer = useRef(null);

  const isAdminRef = useRef(isAdmin); isAdminRef.current = isAdmin;
  const lastUpRef = useRef(null);   // 서버 자료의 마지막 수정 시각
  const busyRef = useRef(false);
  const pendingRef = useRef(false);  // 연결 끊긴 동안 못 올린 변경이 있음
  const [newVer, setNewVer] = useState(null);
  const kickOut = () => { setIsAdmin(false); pinStore.clear(); try { sessionStorage.removeItem('mars-admin'); localStorage.removeItem('mars-admin-keep'); } catch {} setToast('관리자 비밀번호가 바뀌었습니다. 다시 입장하세요'); };

  // 서버 → 내 기기 (바뀐 경우에만 내려받음)
  const pull = async (force) => {
    if (busyRef.current) return;
    if (!force && typeof document !== 'undefined' && document.hidden) return; // 화면 꺼진 핸드폰은 쉼
    try {
      busyRef.current = true;
      const head = await syncHead();
      if (isAdminRef.current && pendingRef.current) { clearTimeout(pushTimer.current); pushTimer.current = setTimeout(push, 100); } // 연결 복구 → 밀린 변경 올리기
      if (!force && head && head === lastUpRef.current) { setSync(x => ({ ...x, status: '연결됨', at: nowHM(), err: null })); return; }
      const row = await syncPull();
      if (row && row.data) {
        lastUpRef.current = row.updated_at;
        if (row.data.appVersion && verNum(row.data.appVersion) > verNum(APP_VERSION)) setNewVer(row.data.appVersion);
        const remote = stripLocal(row.data);
        const merged = stripLocal(mergeState(stripLocal(stateRef.current), remote));
        const mergedStr = JSON.stringify(merged);
        if (JSON.stringify(stripLocal(stateRef.current)) !== mergedStr) setState(s => ({ ...merged, seatLayout: s.seatLayout, adminPin: s.adminPin }));
        remoteRef.current = JSON.stringify(remote);
        if (isAdminRef.current && mergedStr !== remoteRef.current) { clearTimeout(pushTimer.current); pushTimer.current = setTimeout(push, 300); } // 서로 엇갈린 수정 복구
      }
      setSync(x => ({ ...x, status: '연결됨', at: nowHM(), err: null }));
    } catch (e) { setSync(x => ({ ...x, status: '연결 안 됨', err: String(e.message || e) })); }
    finally { busyRef.current = false; }
  };
  // 내 기기 → 서버 (관리자만)
  const push = async () => {
    if (!isAdminRef.current) return;
    const pin = pinStore.get(); if (!pin) return kickOut();
    try {
      const row = await syncPull();
      const remote = row?.data ? stripLocal(row.data) : null;
      if (row?.data?.appVersion && verNum(row.data.appVersion) > verNum(APP_VERSION)) { setNewVer(row.data.appVersion); return; } // 옛 화면은 새 자료를 덮어쓰지 않음
      const merged = stripLocal(mergeState(stripLocal(stateRef.current), remote));
      merged.appVersion = APP_VERSION;
      const mergedStr = JSON.stringify(merged);
      if (JSON.stringify(stripLocal(stateRef.current)) !== mergedStr) setState(s => ({ ...merged, seatLayout: s.seatLayout, adminPin: s.adminPin }));
      if (JSON.stringify(row?.data || null) !== mergedStr) { lastUpRef.current = await syncPush(merged, pin); remoteRef.current = mergedStr; }
      pendingRef.current = false;
      setSync(x => ({ ...x, status: '연결됨', at: nowHM(), err: null }));
    } catch (e) {
      if (String(e.message) === 'PIN') return kickOut();
      pendingRef.current = true;
      setSync(x => ({ ...x, status: '저장 실패', err: String(e.message || e) }));
    }
  };
  useEffect(() => {
    if (!SYNC_ON) return;
    pull(true);
    const t = setInterval(() => pull(false), 4000);
    const onVis = () => { if (!document.hidden) pull(true); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  useEffect(() => {
    if (!SYNC_ON || !isAdmin) return;
    if (JSON.stringify(stripLocal(state)) === remoteRef.current) return;
    clearTimeout(pushTimer.current); pushTimer.current = setTimeout(push, 600);
    return () => clearTimeout(pushTimer.current);
  }, [state, isAdmin]);

  useEffect(() => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch {} }, [state]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(null), 2200); return () => clearTimeout(t); } }, [toast]);

  const { attendees, event, program, speechOrder, introOrder } = state;
  const patch = (fn) => setState(s => ({ ...s, ...fn(s) }));
  const notify = (msg) => setToast(msg);

  // ----- 내빈 상태 -----
  const now = () => Date.now();
  const patchMeta = (fn) => patch(s => ({ ...fn(s), metaAt: now() }));
  const updateAttendee = (id, changes) => patch(s => ({ attendees: s.attendees.map(a => a.id === id ? { ...a, ...changes, u: now() } : a) }));
  const setStatus = (id, status) => {
    const t = nowHM();
    patch(s => ({
      attendees: s.attendees.map(a => {
        if (a.id !== id) return a;
        const c = { status };
        if (status === '도착') { c.arrivalTime = a.arrivalTime || t; c.seatedTime = null; }
        if (status === '착석') { c.arrivalTime = a.arrivalTime || t; c.seatedTime = t; }
        if (status === '미도착') { c.arrivalTime = null; c.seatedTime = null; }
        return { ...a, ...c, u: now() };
      }),
    }));
  };
  const toggleSpeech = (id, on) => patchMeta(s => ({
    attendees: s.attendees.map(a => a.id === id ? { ...a, speech: on, u: now() } : a),
    speechOrder: on ? (s.speechOrder.includes(id) ? s.speechOrder : [...s.speechOrder, id]) : s.speechOrder.filter(x => x !== id),
  }));
  const toggleIntro = (id, on) => patchMeta(s => ({
    attendees: s.attendees.map(a => a.id === id ? { ...a, intro: on, u: now() } : a),
    introOrder: on ? (s.introOrder.includes(id) ? s.introOrder : [...s.introOrder, id]) : s.introOrder.filter(x => x !== id),
  }));
  const addAttendee = (data) => patchMeta(s => {
    const id = Math.max(s.nextId, ...s.attendees.map(a => a.id + 1), ...Object.keys(s.tombstones || {}).map(k => Number(k) + 1));
    const a = { id, category: '기타', organization: '', position: '', name: '', note: '', grade: 'VVIP', seat: '', status: '미도착', arrivalTime: null, seatedTime: null, intro: true, speech: false, speechType: '축사', ...data, u: now() };
    return { attendees: [...s.attendees, a], introOrder: [...s.introOrder, id], nextId: id + 1 };
  });
  // 의전순 적용: 순위 채우기 + 내빈 소개 순서 + 구역별 좌석(가운데 상석)
  const applyProtocol = () => patchMeta(s => {
    const t = now();
    const ranked = s.attendees.map(a => ({ ...a, rank: rankOf(a) }));
    const seat = {};
    const zones = [...new Set(ranked.map(a => (a.seat || 'A-').split('-')[0] || 'A'))];
    zones.forEach(z => {
      const list = ranked.filter(a => ((a.seat || 'A-').split('-')[0] || 'A') === z).sort(byRank);
      const cols = (s.seatLayout && s.seatLayout[z] && s.seatLayout[z].cols) || 10;
      for (let r0 = 0; r0 < list.length; r0 += cols) {
        const row = list.slice(r0, r0 + cols); const pos = centerOrder(row.length);
        row.forEach((a, j) => { seat[a.id] = `${z}-${String(r0 + pos[j] + 1).padStart(2, '0')}`; });
      }
    });
    const sorted = [...ranked].sort(byRank);
    return {
      attendees: ranked.map(a => ({ ...a, seat: seat[a.id] || a.seat, intro: a.note === '주최' ? false : a.intro, u: t })),
      introOrder: sorted.map(a => a.id),
      // 인사말씀: 개회사 → 환영사 → 축사 → 격려사 … 순, 같은 종류 안에서는 의전순
      speechOrder: [...s.speechOrder].sort((x, y) => { const ax = ranked.find(a => a.id === x) || {}, ay = ranked.find(a => a.id === y) || {}; return SPEECH_TYPES.indexOf(ax.speechType) - SPEECH_TYPES.indexOf(ay.speechType) || byRank(ax, ay); }),
    };
  });
  const removeAttendee = (id) => patchMeta(s => ({
    attendees: s.attendees.filter(a => a.id !== id),
    tombstones: { ...(s.tombstones || {}), [id]: now() },
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

  const login = async (pin, keep) => {
    let ok = false;
    if (SYNC_ON) { try { ok = await syncCheckPin(pin); } catch { ok = false; } }
    else ok = pin === state.adminPin;
    if (!ok) return false;
    pinStore.set(pin, keep);
    setIsAdmin(true); sessionStorage.setItem('mars-admin', '1'); if (keep) localStorage.setItem('mars-admin-keep', '1');
    setLoginOpen(false); notify('관리자 모드로 전환되었습니다'); return true;
  };
  const changePin = async (newPin) => {
    if (!SYNC_ON) { patchMeta(() => ({ adminPin: newPin })); return true; }
    const ok = await syncChangePin(pinStore.get(), newPin);
    if (ok) pinStore.set(newPin, localStorage.getItem('mars-admin-keep') === '1');
    return ok;
  };
  const logout = () => { setIsAdmin(false); pinStore.clear(); sessionStorage.removeItem('mars-admin'); localStorage.removeItem('mars-admin-keep'); if (['manage', 'settings'].includes(view)) setView('board'); notify('조회 모드로 전환되었습니다'); };

  const tabs = [
    { id: 'board', label: '현황판', icon: BarChart3 },
    ...(isAdmin ? [{ id: 'manage', label: '내빈 관리', icon: Users }] : []),
    { id: 'speech', label: '인사말씀·소개', icon: Mic2 },
    { id: 'seat', label: '좌석 현황', icon: MapPin },
    { id: 'report', label: '결과 요약', icon: FileText },
    ...(isAdmin ? [{ id: 'settings', label: '설정', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 머리글 */}
      <header className="print:hidden sticky top-0 z-40 shadow-md">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white">
          <div className="max-w-7xl mx-auto px-3 py-2 flex items-center gap-3">
            <div className="hidden sm:flex w-9 h-9 rounded-lg bg-amber-400 text-slate-900 items-center justify-center shrink-0 shadow"><Crown className="w-5 h-5" /></div>
            <div className="min-w-0">
              <div className="font-bold text-sm md:text-base truncate tracking-tight"><span className="hidden sm:inline">{event.name} </span><span className="sm:hidden">MARS 2026 </span><span className="text-amber-300 font-semibold">내빈 운영</span></div>
              <div className="text-[11px] text-slate-300 truncate">{event.date} · {event.place} · {event.host}</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
              {sync.on && <span title={sync.err || `마지막 동기화 ${sync.at || '-'}`} className={`hidden md:inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border ${sync.status === '연결됨' ? 'border-emerald-400/50 text-emerald-200 bg-emerald-500/10' : 'border-amber-400/50 text-amber-200 bg-amber-500/10'}`}><span className={`w-1.5 h-1.5 rounded-full ${sync.status === '연결됨' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />공유 {sync.status}{sync.at && ` ${sync.at}`}</span>}
              <button onClick={() => setReportOpen(true)} className="btn bg-[#FEE500] text-[#191919] hover:brightness-95 font-bold shadow"><MessageCircle className="w-3.5 h-3.5" /><span className="hidden sm:inline">카톡 </span>보고</button>
              {isAdmin && <button onClick={() => setQuickAdd(true)} className="btn bg-amber-400 text-slate-900 hover:bg-amber-300 font-bold shadow"><UserPlus className="w-3.5 h-3.5" /><span className="hidden sm:inline">긴급 내빈 </span>추가</button>}
              <span className={`hidden sm:inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-full border ${isAdmin ? 'bg-rose-500/20 text-rose-200 border-rose-400/40' : 'bg-white/10 text-slate-200 border-white/20'}`}>
                {isAdmin ? <Unlock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}{isAdmin ? '관리자 모드' : '조회 모드'}
              </span>
              {isAdmin
                ? <button onClick={logout} title="조회 모드로 전환" className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20"><Lock className="w-3 h-3" /><span className="hidden sm:inline">조회 모드로</span></button>
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

      {newVer && <div className="print:hidden bg-indigo-600 text-white text-xs sm:text-sm px-3 py-1.5 flex items-center gap-2"><span>새 버전(v{newVer})이 나왔습니다.</span><button onClick={() => location.reload()} className="ml-auto bg-white text-indigo-700 font-bold rounded px-2 py-0.5">새로고침</button></div>}
      {sync.on && sync.status !== '연결됨' && sync.status !== '연결 중' && <div className="print:hidden bg-rose-600 text-white text-xs px-3 py-1.5 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" /><span><b>서버 연결 끊김</b> — {isAdmin ? '체크한 내용은 이 기기에 보관되고, 연결되면 자동으로 올라갑니다.' : '화면이 최신이 아닐 수 있습니다.'}</span></div>}
      <main className="print:hidden max-w-7xl mx-auto p-3 md:p-4">
        {!isAdmin && ['board', 'seat', 'speech'].includes(view) && (
          <div className="mb-3 flex items-center gap-3 rounded-lg border-2 border-amber-400 bg-amber-50 px-3 py-2 text-sm">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-amber-900 text-xs sm:text-sm"><b>조회 모드</b>입니다. 체크·자리 변경은 관리자로 입장하세요.</span>
            <button onClick={() => setLoginOpen(true)} className="btn bg-amber-500 text-white hover:bg-amber-600 ml-auto shrink-0"><LogIn className="w-3.5 h-3.5" />관리자 입장</button>
          </div>
        )}
        {view === 'board' && <BoardView attendees={attendees} stats={stats} program={program} isAdmin={isAdmin} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} updateAttendee={updateAttendee} printSpeech={() => { if (EMBEDDED) { notify('인쇄는 노트북의 HTML 파일(또는 새 창)에서 하세요. 자료는 공유되어 있습니다'); return; } window.__printMode = 'speech'; window.__printOnly = false; window.dispatchEvent(new Event('printmode')); setTimeout(() => window.print(), 50); }} />}
        {view === 'speech' && <SpeechView attendees={attendees} speechOrder={speechOrder} introOrder={introOrder} isAdmin={isAdmin}
          setSpeechOrder={o => patchMeta(() => ({ speechOrder: o }))} setIntroOrder={o => patchMeta(() => ({ introOrder: o }))}
          updateAttendee={updateAttendee} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} notify={notify} />}
        {view === 'seat' && <SeatView attendees={attendees} layout={state.seatLayout} setLayout={l => patch(s => ({ seatLayout: typeof l === 'function' ? l(s.seatLayout) : l }))} isAdmin={isAdmin} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} updateAttendee={updateAttendee} patch={fn => patchMeta(s => { const r = fn(s); if (r.attendees) { const before = new Map(s.attendees.map(a => [a.id, a.seat])); r.attendees = r.attendees.map(a => before.get(a.id) !== a.seat ? { ...a, u: now() } : a); } return r; })} notify={notify} askUser={askUser} />}
        {view === 'report' && <ReportView stats={stats} attendees={attendees} event={event} speechOrder={speechOrder} notify={notify} />}
        {view === 'manage' && isAdmin && <ManageView applyProtocol={applyProtocol} onQuickAdd={() => setQuickAdd(true)} attendees={attendees} updateAttendee={updateAttendee} addAttendee={addAttendee} removeAttendee={removeAttendee} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} notify={notify} askUser={askUser} patch={(fn) => patchMeta(s => { const r = fn(s); if (r.attendees) r.attendees = r.attendees.map(a => ({ ...a, u: now() })); return r; })} />}
        {view === 'settings' && isAdmin && <SettingsView state={state} patch={patchMeta} setState={setState} notify={notify} sync={sync} askUser={askUser} changePin={changePin} />}
      </main>

      <footer className="print:hidden max-w-7xl mx-auto px-3 py-2 text-[10px] text-slate-400 flex justify-between gap-2 whitespace-nowrap overflow-hidden">
        <span className="truncate">화성특례시 AI스마트전략실 · 내빈 운영 플랫폼 v{APP_VERSION}</span>
        <span className="hidden sm:inline">{SYNC_ON ? '여러 기기가 같은 자료를 공유합니다(4초 간격)' : '자료는 이 브라우저에만 저장됩니다'}</span>
      </footer>

      {ask && <AskModal ask={ask} onDone={v => { ask.resolve(v); setAsk(null); }} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLogin={login} />}
      {quickAdd && <QuickAddModal onClose={() => setQuickAdd(false)} attendees={attendees} onAdd={(d) => { addAttendee(d); setQuickAdd(false); notify(`${d.name} ${d.position}님을 ${d.status} 상태로 추가했습니다`); }} />}
      {reportOpen && <KakaoReportModal onClose={() => setReportOpen(false)} stats={stats} attendees={attendees} event={event} speechOrder={speechOrder} notify={notify} />}
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
      className={`${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} whitespace-nowrap rounded font-semibold border disabled:opacity-40 ${cls}`}>{st}</button>
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

function AskModal({ ask, onDone }) {
  const [v, setV] = useState('');
  return (
    <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center p-4" onClick={() => onDone(ask.input ? null : false)}>
      <form onSubmit={e => { e.preventDefault(); onDone(ask.input ? v : true); }} onClick={e => e.stopPropagation()} className="bg-white rounded-xl p-4 w-full max-w-sm shadow-2xl">
        <div className="text-sm text-slate-800 mb-3 whitespace-pre-line">{ask.msg}</div>
        {ask.input && <input autoFocus value={v} onChange={e => setV(e.target.value)} className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm mb-3" />}
        <div className="flex gap-2 justify-end"><button type="button" onClick={() => onDone(ask.input ? null : false)} className="btn btn-outline">취소</button><button className="btn btn-primary">확인</button></div>
      </form>
    </div>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [pin, setPin] = useState('');
  const [err, setErr] = useState(false);
  const [keep, setKeep] = useState(true);
  const [busy, setBusy] = useState(false);
  const submit = async (e) => { e.preventDefault(); if (busy || !pin) return; setBusy(true); const ok = await onLogin(pin, keep); setBusy(false); if (!ok) { setErr(true); setPin(''); } };
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={e => e.stopPropagation()} className="bg-white rounded-lg p-5 w-full max-w-xs shadow-xl">
        <div className="flex items-center gap-2 mb-3"><Lock className="w-4 h-4 text-rose-600" /><h3 className="font-bold text-sm">관리자 모드 입장</h3><button type="button" onClick={onClose} className="ml-auto text-slate-400"><X className="w-4 h-4" /></button></div>
        <input autoFocus type="password" value={pin} onChange={e => { setPin(e.target.value); setErr(false); }} placeholder="비밀번호" className="w-full border border-slate-300 rounded px-3 py-2 text-sm mb-2 text-center tracking-widest" />
        {err && <div className="text-xs text-rose-600 mb-2">비밀번호가 맞지 않습니다</div>}
        <label className="flex items-center gap-1.5 text-xs text-slate-600 mb-3 cursor-pointer"><input type="checkbox" checked={keep} onChange={e => setKeep(e.target.checked)} />이 기기에서 계속 관리자로 유지 (운영 태블릿·노트북)</label>
        <button disabled={busy} className="w-full bg-rose-600 text-white rounded py-2 text-sm font-semibold hover:bg-rose-700 disabled:opacity-60">{busy ? '확인 중…' : '입장'}</button>
        <p className="text-[10px] text-slate-400 mt-2">비밀번호는 서버에서 확인합니다. 모르면 담당자에게 문의하세요.</p>
      </form>
    </div>
  );
}

// =====================================================================
// 현황판
// =====================================================================
function BoardView({ attendees, stats, program, isAdmin, setStatus, toggleSpeech, toggleIntro, updateAttendee, printSpeech }) {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('전체');
  const [big, setBig] = useState(() => lsSafe.get('mars-big', '0') === '1');
  const [sheet, setSheet] = useState(null);
  useEffect(() => { lsSafe.set('mars-big', big ? '1' : '0'); }, [big]);
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
            {['전체', ...STATUSES, '인사말씀'].map(f => {
              const n = f === '전체' ? attendees.length : f === '인사말씀' ? attendees.filter(a => a.speech).length : attendees.filter(a => a.status === f).length;
              return <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 rounded-md text-[11px] font-semibold border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{f} <span className="opacity-60">{n}</span></button>;
            })}
          </div>
          <button onClick={() => setBig(v => !v)} className={`btn ml-auto ${big ? 'btn-dark' : 'btn-outline'}`}>{big ? '글자 크게 ✓' : '글자 크게'}</button>
          <button onClick={printSpeech} className="btn btn-primary"><Printer className="w-3 h-3" />인사말씀 명단 인쇄 ({stats.speakersPresent}/{stats.speakers})</button>
          {!isAdmin && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />조회 전용</span>}
        </div>

        {categories.map(cat => {
          const list = visible.filter(a => a.category === cat);
          if (!list.length) return null;
          const pc = list.filter(a => PRESENT.includes(a.status)).length;
          return (
            <div key={cat} className="mb-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold text-white bg-slate-700 px-2 py-0.5 rounded">{cat}</span>
                <span className="text-[11px] text-slate-500">참석 <b className={pc ? 'text-emerald-600' : ''}>{pc}</b>/{list.length}</span>
                <span className="flex-1 border-t border-slate-200" />
              </div>
              <div className={`grid gap-2 ${big ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                {list.map(a => {
                  const tone = a.status === '착석' ? 'border-l-emerald-500 bg-emerald-50' : a.status === '도착' ? 'border-l-amber-500 bg-amber-50' : a.status === '불참' ? 'border-l-rose-400 bg-rose-50/60 opacity-75' : a.status === '퇴장' ? 'border-l-slate-300 bg-slate-50 opacity-70' : 'border-l-slate-300 bg-white';
                  const badge = a.status === '착석' ? 'bg-emerald-600 text-white' : a.status === '도착' ? 'bg-amber-500 text-white' : a.status === '불참' ? 'bg-rose-500 text-white' : a.status === '퇴장' ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-600';
                  return (
                    <div key={a.id} onClick={() => isAdmin && setSheet(a.id)} className={`rounded-lg border border-slate-200 border-l-4 shadow-sm px-3 py-2 ${tone} ${isAdmin ? 'cursor-pointer hover:shadow-md hover:border-indigo-300 active:scale-[0.99] transition' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-1.5 flex-wrap">
                            <span className={`font-bold text-slate-900 leading-tight ${big ? 'text-2xl' : 'text-lg'}`}>{a.name}</span>
                            <span className={`text-slate-700 font-medium ${big ? 'text-base' : 'text-sm'}`}>{a.position}</span>
                            {a.speech && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-600 text-white"><Mic2 className="w-2.5 h-2.5 inline -mt-0.5" /> {a.speechType}</span>}
                          </div>
                          <div className={`text-slate-500 truncate ${big ? 'text-sm' : 'text-xs'}`}>{a.organization}{a.note && <span className="text-slate-400"> · {a.note}</span>}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`inline-block px-2 py-1 rounded-md font-bold ${big ? 'text-sm' : 'text-xs'} ${badge}`}>{a.status}</span>
                          <div className="text-[10px] text-slate-500 font-mono mt-1">{a.seat}{(a.seatedTime || a.arrivalTime) && ` · ${a.seatedTime || a.arrivalTime}`}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded border ${a.intro ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-300'}`}>소개 {a.intro ? '○' : '×'}</span>
                        <span className={`px-1.5 py-0.5 rounded border ${a.speech ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-400 border-slate-300'}`}>인사말씀 {a.speech ? '○' : '×'}</span>
                        {isAdmin && <span className="ml-auto text-slate-400">누르면 체크 창</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {!visible.length && <div className="text-xs text-slate-400 text-center py-6">해당하는 내빈이 없습니다</div>}
      </div>
      {sheet != null && (() => { const a = attendees.find(x => x.id === sheet); return a ? <ActionSheet a={a} onClose={() => setSheet(null)} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} updateAttendee={updateAttendee} /> : null; })()}
    </div>
  );
}

// =====================================================================
// 체크 창 (카드 누르면) — 도착 · 착석 · 내빈소개 · 인사말씀
// =====================================================================
function ActionSheet({ a, onClose, setStatus, toggleSpeech, toggleIntro, updateAttendee }) {
  const Big = ({ on, cls, onClick, children }) => (
    <button onClick={onClick} className={`rounded-xl border-2 py-4 text-base font-bold flex flex-col items-center gap-1 transition ${on ? cls : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>{children}</button>
  );
  const present = PRESENT.includes(a.status);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-4 w-full max-w-md shadow-2xl">
        <div className="flex items-start gap-2 mb-3">
          <div className="min-w-0">
            <div className="text-2xl font-bold leading-tight">{a.name} <span className="text-base font-medium text-slate-600">{a.position}</span></div>
            <div className="text-sm text-slate-500">{a.organization} · <span className="font-mono">{a.seat}</span></div>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0"><StatusChip status={a.status} /><button onClick={onClose} className="text-slate-400"><X className="w-5 h-5" /></button></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Big on={a.status === '도착'} cls="bg-amber-500 border-amber-500 text-white" onClick={() => setStatus(a.id, a.status === '도착' ? '미도착' : '도착')}>
            <span className="text-2xl">🚶</span>도착{a.arrivalTime && <span className="text-[11px] font-mono opacity-80">{a.arrivalTime}</span>}
          </Big>
          <Big on={a.status === '착석'} cls="bg-emerald-600 border-emerald-600 text-white" onClick={() => setStatus(a.id, a.status === '착석' ? '도착' : '착석')}>
            <span className="text-2xl">💺</span>착석{a.seatedTime && <span className="text-[11px] font-mono opacity-80">{a.seatedTime}</span>}
          </Big>
          <Big on={a.intro} cls="bg-slate-800 border-slate-800 text-white" onClick={() => toggleIntro(a.id, !a.intro)}>
            <span className="text-2xl">📣</span>내빈 소개 {a.intro ? '○' : '×'}
          </Big>
          <Big on={a.speech} cls="bg-violet-600 border-violet-600 text-white" onClick={() => toggleSpeech(a.id, !a.speech)}>
            <span className="text-2xl">🎤</span>인사말씀 {a.speech ? '○' : '×'}
          </Big>
        </div>
        {a.speech && (
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-slate-600">인사말씀 종류</span>
            <div className="flex flex-wrap gap-1">{SPEECH_TYPES.map(t => <button key={t} onClick={() => updateAttendee(a.id, { speechType: t })} className={`px-2 py-1 rounded-md text-xs font-semibold border ${a.speechType === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-600 border-slate-300'}`}>{t}</button>)}</div>
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-1.5 text-xs">
          <button onClick={() => setStatus(a.id, '퇴장')} className="btn btn-outline">퇴장</button>
          <button onClick={() => setStatus(a.id, '불참')} className="btn btn-outline text-rose-600 border-rose-300">불참</button>
          <button onClick={() => setStatus(a.id, '미도착')} className="btn btn-outline"><RotateCcw className="w-3 h-3" />초기화</button>
          <button onClick={onClose} className="btn btn-dark ml-auto px-4">닫기</button>
        </div>
        {!present && a.speech && <div className="mt-2 text-[11px] text-rose-600 font-semibold">※ 인사말씀 대상인데 아직 미도착입니다. 인쇄 전 확인하세요.</div>}
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
  const [picked, setPicked] = useState(null); // 눌러서 옮기기: 선택된 순번
  const list = ids.map(id => attendees.find(a => a.id === id)).filter(Boolean).filter(a => !presentOnly || PRESENT.includes(a.status));
  const tap = (i) => { if (!editable) return; if (picked == null) setPicked(i); else { move(picked, i); setPicked(null); } };
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
  const BAR = { '착석': 'bg-emerald-500', '도착': 'bg-amber-400', '미도착': 'bg-slate-300', '불참': 'bg-rose-400', '퇴장': 'bg-slate-300' };
  const TXT = { '착석': 'text-emerald-700', '도착': 'text-amber-700', '미도착': 'text-slate-400', '불참': 'text-rose-600', '퇴장': 'text-slate-400' };
  return (
    <div onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
      {editable && picked != null && <div className="sticky top-[92px] z-20 mb-1 text-xs rounded-md px-2 py-1.5 bg-blue-600 text-white font-semibold shadow">{picked + 1}번 {list[picked]?.name} 선택 — 들어갈 자리를 누르세요 <button className="underline ml-1" onClick={() => setPicked(null)}>취소</button></div>}
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
        {list.map((a, i) => {
          const absent = !PRESENT.includes(a.status);
          return (
            <div key={a.id} data-oidx={i} onClick={() => picked === i ? setPicked(null) : tap(i)}
              className={`relative flex items-center gap-2 pl-2.5 pr-1.5 py-1.5 select-none ${editable ? 'cursor-pointer active:bg-slate-100' : ''} ${picked === i ? 'bg-blue-100' : picked != null ? 'bg-blue-50/40' : dragIdx === i ? 'opacity-40' : overIdx === i && dragIdx != null ? 'bg-blue-50' : absent ? 'bg-rose-50/50' : 'bg-white'}`}>
              <span className={`absolute left-0 top-0 bottom-0 w-1 ${BAR[a.status]}`} />
              <span className="w-6 text-center text-sm font-bold text-slate-500 tabular-nums shrink-0">{i + 1}</span>
              <div className="min-w-0 flex-1 leading-tight">
                <div className="flex items-baseline gap-1.5 min-w-0">
                  <span className="text-[17px] font-bold text-slate-900 whitespace-nowrap">{a.name}</span>
                  <span className="text-[13px] text-slate-600 truncate">{a.position}</span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{a.organization}</div>
              </div>
              {renderExtra && <span className="shrink-0" onClick={e => e.stopPropagation()}>{renderExtra(a)}</span>}
              <span className={`shrink-0 w-9 text-right text-[11px] font-bold ${TXT[a.status]}`}>{a.status === '미도착' ? '미도착' : a.status}</span>
              {editable && (
                <div className="hidden sm:flex items-center shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => move(i, Math.max(0, i - 1))} className="text-slate-400 hover:text-slate-800 px-1 text-xs">▲</button>
                  <button onClick={() => move(i, Math.min(list.length - 1, i + 1))} className="text-slate-400 hover:text-slate-800 px-1 text-xs">▼</button>
                  {onRemove && <button onClick={() => onRemove(a.id)} className="text-slate-300 hover:text-rose-600 px-1"><X className="w-3.5 h-3.5" /></button>}
                </div>
              )}
              {editable && <div onPointerDown={e => onDown(e, i)} onClick={e => e.stopPropagation()} className="cursor-grab active:cursor-grabbing text-slate-300 pl-1 py-2 shrink-0" style={{ touchAction: 'none' }}><GripVertical className="w-4 h-4" /></div>}
            </div>
          );
        })}
      </div>
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

  const speakers = speakerList(attendees, speechOrder);
  const introIds = introOrder.filter(id => attendees.find(a => a.id === id)?.intro);
  const intros = introIds.map(id => attendees.find(a => a.id === id));
  const presentSpeakers = speakers.filter(a => PRESENT.includes(a.status));
  const presentIntros = intros.filter(a => PRESENT.includes(a.status));

  const speechScript = (presentOnly ? presentSpeakers : speakers).map((a, i) =>
    `${i + 1}. 다음은 ${honor(a)}의 ${a.speechType}${iga(a.speechType)} 있겠습니다. 큰 박수로 맞아 주시기 바랍니다.`).join('\n');
  const introScript = (() => {
    const list = presentOnly ? presentIntros : intros;
    const groups = [];
    list.forEach(a => { const g = groups.find(x => x.cat === a.category); g ? g.items.push(a) : groups.push({ cat: a.category, items: [a] }); });
    return groups.map(g => `[${g.cat}]\n` + g.items.map(a => ` · ${honor(a)}`).join('\n')).join('\n') + '\n\n이상 참석해 주신 내빈 여러분께 감사의 박수를 부탁드립니다.';
  })();

  const copy = (t) => copyText(t, notify, 'mc-script');
  const candidates = attendees.filter(a => tab === 'speech' ? !a.speech : !a.intro);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="grid grid-cols-2 w-full sm:w-auto rounded-md border border-slate-300 overflow-hidden">
          <button onClick={() => setTab('speech')} className={`px-3 py-2 text-sm font-bold flex items-center justify-center gap-1 ${tab === 'speech' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><Mic2 className="w-3.5 h-3.5" />인사말씀 <span className="tabular-nums opacity-80">{presentSpeakers.length}/{speakers.length}</span></button>
          <button onClick={() => setTab('intro')} className={`px-3 py-2 text-sm font-bold flex items-center justify-center gap-1 ${tab === 'intro' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}><ListOrdered className="w-3.5 h-3.5" />내빈 소개 <span className="tabular-nums opacity-80">{presentIntros.length}/{intros.length}</span></button>
        </div>
        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer"><input type="checkbox" checked={presentOnly} onChange={e => setPresentOnly(e.target.checked)} />참석자만</label>
        {isAdmin && (
          <div className="ml-auto flex items-center gap-1 min-w-0 flex-1 sm:flex-none justify-end">
            <select value={addId} onChange={e => setAddId(e.target.value)} className="text-xs border border-slate-300 rounded px-2 py-1.5 min-w-0 flex-1 sm:flex-none sm:max-w-[220px] bg-white">
              <option value="">+ 대상 추가…</option>
              {candidates.map(a => <option key={a.id} value={a.id}>{a.name} {a.position} · {a.organization}</option>)}
            </select>
            <button onClick={() => { if (!addId) return; tab === 'speech' ? toggleSpeech(Number(addId), true) : toggleIntro(Number(addId), true); setAddId(''); }} className="btn btn-dark"><Plus className="w-3 h-3" />추가</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-1 px-1">
            <h2 className="text-sm font-bold">{tab === 'speech' ? '인사말씀 순서' : '내빈 소개 순서'}</h2>
            <span className="text-[10px] text-slate-400">{isAdmin ? '누르고 → 들어갈 자리 누르기 · ⠿ 끌기' : '조회 전용'}</span>
          </div>
          {tab === 'speech' ? (
            <OrderList ids={speechOrder} attendees={attendees} setOrder={setSpeechOrder} editable={isAdmin} presentOnly={presentOnly} onRemove={id => toggleSpeech(id, false)}
              renderExtra={a => isAdmin
                ? <select value={a.speechType} onChange={e => updateAttendee(a.id, { speechType: e.target.value })} className="appearance-none text-[12px] font-bold border border-violet-300 text-violet-700 rounded-md px-1.5 py-0.5 bg-violet-50 text-center">{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select>
                : <span className="text-[12px] px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200 font-bold">{a.speechType}</span>} />
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
              <button onClick={() => { if (EMBEDDED) { notify('인쇄는 노트북의 HTML 파일에서 하세요. 자료는 공유되어 있습니다'); return; } window.__printMode = tab; window.__printOnly = presentOnly; window.dispatchEvent(new Event('printmode')); setTimeout(() => window.print(), 50); }} className="btn btn-primary"><Printer className="w-3 h-3" />인쇄</button>
            </div>
          </div>
          <textarea id="mc-script" readOnly value={tab === 'speech' ? speechScript : introScript} className="flex-1 min-h-[280px] text-xs font-mono border border-slate-200 rounded p-2 bg-slate-50 leading-relaxed" />
          <p className="text-[10px] text-slate-400 mt-1">순서·참석 여부가 바뀌면 멘트가 바로 다시 작성됩니다. 미참석 내빈은 붉게 표시됩니다.</p>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// 좌석 현황 — 예매 좌석도 방식(무대 위, 열 번호, 범례, 좌석 찾기)
// =====================================================================
const SEAT_TONE = {
  '착석': 'bg-emerald-600 text-white border-emerald-700',
  '도착': 'bg-amber-400 text-amber-950 border-amber-500',
  '미도착': 'bg-white text-slate-700 border-slate-300',
  '불참': 'bg-rose-50 text-rose-300 border-rose-200 line-through',
  '퇴장': 'bg-slate-200 text-slate-500 border-slate-300',
};
const zoneOf = a => (a.seat || '').split('-')[0];
const seatNo = a => Number((a.seat || '').split('-')[1]) || 0;

function SeatView({ attendees, layout, setLayout, isAdmin, setStatus, toggleSpeech, toggleIntro, updateAttendee, patch, notify, askUser }) {
  const lsGet = (k, d) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } };
  const [mode, setMode] = useState('check');            // check | move
  const [view, setView] = useState(() => lsGet('mars-seat-view', (typeof window !== 'undefined' && window.innerWidth < 640) ? 'list' : 'map')); // map | list
  const [size, setSize] = useState(() => Number(lsGet('mars-seat-size', '56')));
  const [q, setQ] = useState('');
  const [picked, setPicked] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [drag, setDrag] = useState(null);
  const [over, setOver] = useState(null);
  useEffect(() => { try { localStorage.setItem('mars-seat-view', view); localStorage.setItem('mars-seat-size', String(size)); } catch {} }, [view, size]);
  useEffect(() => { setPicked(null); }, [mode]);

  const zonesInData = [...new Set(attendees.map(zoneOf).filter(Boolean))];
  const extraZones = Object.keys(layout).filter(k => k !== '_order' && !zonesInData.includes(k));
  const allZones = [...zonesInData, ...extraZones];
  const order = (layout._order || []).filter(z => allZones.includes(z));
  const zones = [...order, ...allZones.filter(z => !order.includes(z)).sort()];
  const colsOf = z => (layout[z] && layout[z].cols) || 10;
  const hit = q.trim() ? attendees.filter(a => `${a.name}${a.organization}${a.position}`.includes(q.trim())) : [];
  const hitIds = new Set(hit.map(a => a.id));
  useEffect(() => { if (hit[0]) document.querySelector(`[data-seat-id="${hit[0].id}"]`)?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' }); }, [q]);

  const count = st => attendees.filter(a => a.status === st).length;
  const moveTo = (srcId, target) => {           // target: 사람 id(그 자리에 끼우기) 또는 'zone:X'(맨 뒤)
    if (srcId == null || target == null || srcId === target) return;
    patch(s => {
      const src = s.attendees.find(x => x.id === srcId); if (!src) return {};
      let tz, tIdx;
      if (typeof target === 'string') { tz = target.slice(5); tIdx = null; }
      else { const t = s.attendees.find(x => x.id === target); if (!t) return {}; tz = zoneOf(t); tIdx = target; }
      const list = s.attendees.filter(x => zoneOf(x) === tz && x.id !== srcId).sort((x, y) => seatNo(x) - seatNo(y));
      const at = tIdx == null ? list.length : list.findIndex(x => x.id === tIdx);
      list.splice(at < 0 ? list.length : at, 0, src);
      const ns = {}; list.forEach((x, i) => { ns[x.id] = `${tz}-${String(i + 1).padStart(2, '0')}`; });
      const sz = zoneOf(src);
      if (sz && sz !== tz) s.attendees.filter(x => zoneOf(x) === sz && x.id !== srcId).sort((x, y) => seatNo(x) - seatNo(y)).forEach((x, i) => { ns[x.id] = `${sz}-${String(i + 1).padStart(2, '0')}`; });
      return { attendees: s.attendees.map(x => ns[x.id] ? { ...x, seat: ns[x.id] } : x) };
    });
    const a = attendees.find(x => x.id === srcId);
    notify(`${a?.name || ''}님 자리를 옮겼습니다`);
  };
  const onSeat = (a) => {
    if (!isAdmin) { setSheet({ id: a.id, ro: true }); return; }
    if (mode === 'check') { setSheet({ id: a.id }); return; }
    if (picked == null) setPicked(a.id); else if (picked === a.id) setPicked(null); else { moveTo(picked, a.id); setPicked(null); }
  };
  // 마우스 끌기(노트북) — 자리 바꾸기 모드에서만
  const onDown = (e, a) => { if (!isAdmin || mode !== 'move' || e.pointerType !== 'mouse') return; setDrag({ id: a.id, x: e.clientX, y: e.clientY, moved: false }); };
  const onMove = (e) => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
    if (!drag.moved) setDrag(d => ({ ...d, moved: true }));
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-seat-id],[data-zone-end]');
    setOver(el ? (el.dataset.seatId ? Number(el.dataset.seatId) : `zone:${el.dataset.zoneEnd}`) : null);
  };
  const onUp = () => { if (drag?.moved) { moveTo(drag.id, over); setPicked(null); } setDrag(null); setOver(null); };

  const addZone = async () => {
    const name = ((await askUser('새 구역 이름 (예: B)', true)) || '').trim().toUpperCase().replace(/[^A-Z0-9가-힣]/g, '');
    if (!name) return; if (zones.includes(name)) return notify('이미 있는 구역입니다');
    setLayout(l => ({ ...l, [name]: { cols: 10 }, _order: [...zones, name] }));
  };
  const moveZone = (z, d) => { const o = [...zones]; const i = o.indexOf(z); const j = i + d; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; setLayout(l => ({ ...l, _order: o })); };
  const setCols = (z, cols) => setLayout(l => ({ ...l, [z]: { ...(l[z] || {}), cols } }));
  const removeZone = (z) => setLayout(l => { const n = { ...l }; delete n[z]; n._order = zones.filter(x => x !== z); return n; });
  const pickedA = attendees.find(a => a.id === picked);
  const sheetA = sheet && attendees.find(a => a.id === sheet.id);

  return (
    <div className="space-y-3" onPointerMove={onMove} onPointerUp={onUp}>
      {/* 상단 조작줄 */}
      <div className="card p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="section-title"><MapPin className="w-4 h-4" />좌석 현황</h2>
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="이름으로 좌석 찾기" className="w-full border border-slate-300 rounded-md pl-7 pr-2 py-1.5 text-sm" />
          </div>
          <div className="flex rounded-md border border-slate-300 overflow-hidden text-xs font-semibold">
            <button onClick={() => setView('map')} className={`px-2.5 py-1.5 ${view === 'map' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>배치도</button>
            <button onClick={() => setView('list')} className={`px-2.5 py-1.5 ${view === 'list' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600'}`}>열별 명단</button>
          </div>
          {view === 'map' && (
            <div className="flex items-center gap-1">
              <button onClick={() => setSize(v => Math.max(40, v - 8))} className="btn btn-outline px-2">－</button>
              <button onClick={() => setSize(v => Math.min(88, v + 8))} className="btn btn-outline px-2">＋</button>
            </div>
          )}
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-md border border-indigo-300 overflow-hidden text-xs font-bold">
              <button onClick={() => setMode('check')} className={`px-3 py-1.5 ${mode === 'check' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}>상태 체크</button>
              <button onClick={() => setMode('move')} className={`px-3 py-1.5 flex items-center gap-1 ${mode === 'move' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}><ArrowUpDown className="w-3 h-3" />자리 바꾸기</button>
            </div>
            <button onClick={addZone} className="btn btn-outline"><Plus className="w-3 h-3" />구역 추가</button>
            <span className="text-[11px] text-slate-500">{mode === 'check' ? '좌석을 누르면 도착·착석 체크 창이 뜹니다.' : '옮길 사람을 누르고, 들어갈 자리를 누르세요. 노트북은 끌어 놓아도 됩니다.'}</span>
          </div>
        )}
        {/* 범례 */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
          {['착석', '도착', '미도착', '불참'].map(st => (
            <span key={st} className="inline-flex items-center gap-1"><span className={`w-3.5 h-3.5 rounded border ${SEAT_TONE[st]}`} />{st} <b className="tabular-nums">{count(st)}</b></span>
          ))}
          <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-600" />인사말씀</span>
          {q && <span className="text-indigo-700 font-semibold">찾은 사람 {hit.length}명{hit[0] && ` · ${hit[0].name} ${hit[0].seat}`}</span>}
        </div>
      </div>

      {mode === 'move' && pickedA && (
        <div className="sticky top-[104px] z-30 flex items-center gap-2 rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm shadow-lg">
          <ArrowUpDown className="w-4 h-4" /><b>{pickedA.name}</b> ({pickedA.seat}) 선택됨 — 들어갈 자리를 누르세요
          <button onClick={() => setPicked(null)} className="ml-auto text-xs underline">취소</button>
        </div>
      )}

      <div className="stage text-sm py-2.5">무 대 STAGE</div>
      <div className="text-center text-[11px] text-slate-400 -mt-1">무대에서 내려다보아 1열 가운데가 최상석 · 「내빈 관리 → 의전순 적용」으로 자동 배치</div>

      {zones.map((z, zi) => {
        const list = attendees.filter(a => zoneOf(a) === z).sort((x, y) => seatNo(x) - seatNo(y));
        const cols = colsOf(z);
        const rows = []; for (let i = 0; i < list.length; i += cols) rows.push(list.slice(i, i + cols));
        const grade = list[0]?.grade || 'VVIP'; const gs = GRADE_STYLES[grade] || GRADE_STYLES.VVIP;
        const seated = list.filter(a => a.status === '착석').length; const present = list.filter(a => PRESENT.includes(a.status)).length;
        return (
          <div key={z} className="card overflow-hidden">
            <div className={`flex flex-wrap items-center gap-2 px-3 py-2 border-b ${gs.light} ${gs.border}`}>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${gs.bg}`}>{grade}</span>
              <span className="text-sm font-bold">{z} 구역</span>
              <span className="text-xs text-slate-600 tabular-nums">착석 <b className="text-emerald-700">{seated}</b> · 참석 {present} / {list.length}석</span>
              <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden min-w-[60px] max-w-[160px]"><div className="h-full bg-emerald-500" style={{ width: `${list.length ? seated / list.length * 100 : 0}%` }} /></div>
              {isAdmin && (
                <div className="ml-auto flex items-center gap-1">
                  <select value={cols} onChange={e => setCols(z, Number(e.target.value))} className="text-[11px] border border-slate-300 rounded px-1 py-0.5 bg-white" title="한 열의 좌석 수">{[4, 5, 6, 7, 8, 10, 12, 15].map(c => <option key={c} value={c}>한 열 {c}석</option>)}</select>
                  <button onClick={() => moveZone(z, -1)} disabled={zi === 0} className="px-1 text-slate-500 disabled:opacity-30">▲</button>
                  <button onClick={() => moveZone(z, 1)} disabled={zi === zones.length - 1} className="px-1 text-slate-500 disabled:opacity-30">▼</button>
                  {!list.length && <button onClick={() => removeZone(z)} className="text-slate-400 hover:text-rose-600"><X className="w-3.5 h-3.5" /></button>}
                </div>
              )}
            </div>

            {view === 'map' ? (
              <div ref={el => { if (el && !el.dataset.centered) { el.dataset.centered = '1'; requestAnimationFrame(() => { el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2; }); } }} className="overflow-x-auto px-2 py-3" style={{ touchAction: drag ? 'none' : 'auto' }}>
                {cols * (size + 6) + 40 > (typeof window !== 'undefined' ? window.innerWidth - 40 : 9999) && <div className="text-[11px] text-slate-400 mb-1 sm:hidden">← 옆으로 밀어서 보세요 · 핸드폰은 「열별 명단」이 더 편합니다</div>}
                <div className="w-max mx-auto space-y-1.5">
                  {rows.map((r, ri) => (
                    <div key={ri} className="flex items-center gap-1.5">
                      <span className="w-8 shrink-0 text-right text-[11px] font-bold text-slate-400 tabular-nums">{ri + 1}열</span>
                      {r.map(a => {
                        const isHit = hitIds.has(a.id); const isPick = picked === a.id; const isOver = over === a.id;
                        return (
                          <button key={a.id} data-seat-id={a.id} onClick={() => !drag?.moved && onSeat(a)} onPointerDown={e => onDown(e, a)}
                            title={`${a.seat} ${a.name} ${a.position} · ${a.status}`}
                            style={{ width: size, height: size }}
                            className={`relative shrink-0 rounded-lg border-2 flex flex-col items-center justify-center leading-tight select-none transition ${SEAT_TONE[a.status]} ${isPick ? 'ring-4 ring-indigo-500 scale-105' : ''} ${isOver ? 'ring-4 ring-indigo-400' : ''} ${isHit ? 'ring-4 ring-fuchsia-500 animate-pulse' : ''} ${drag?.id === a.id && drag.moved ? 'opacity-40' : ''} ${mode === 'move' && isAdmin ? 'cursor-grab' : 'cursor-pointer'} hover:brightness-95`}>
                            <span className="text-[9px] font-mono opacity-70">{a.seat.split('-')[1]}</span>
                            <span className="font-bold" style={{ fontSize: Math.max(11, Math.round(size / 4.2)) }}>{a.name.replace(/[()]/g, '').slice(0, size >= 64 ? 4 : 3)}</span>
                            {size >= 64 && <span className="text-[9px] opacity-80 truncate max-w-full px-0.5">{a.position}</span>}
                            {a.speech && <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-violet-600 ring-1 ring-white" />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                  {isAdmin && mode === 'move' && (
                    <button data-zone-end={z} onClick={() => { if (picked != null) { moveTo(picked, `zone:${z}`); setPicked(null); } }}
                      className={`ml-10 mt-1 px-3 py-2 rounded-lg border-2 border-dashed text-xs ${picked != null || over === `zone:${z}` ? 'border-indigo-400 text-indigo-700 bg-indigo-50' : 'border-slate-300 text-slate-400'}`}>
                      + {z} 구역 맨 뒤에 넣기
                    </button>
                  )}
                  {!list.length && <div className="text-xs text-slate-400 py-4 px-6">빈 구역입니다. 자리 바꾸기로 사람을 옮겨 오세요.</div>}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {rows.map((r, ri) => (
                  <div key={ri} className="flex gap-2 px-3 py-2">
                    <span className="w-9 shrink-0 text-xs font-bold text-slate-400 pt-1 tabular-nums">{ri + 1}열</span>
                    <div className="flex flex-wrap gap-1.5">
                      {r.map(a => (
                        <button key={a.id} data-seat-id={a.id} onClick={() => onSeat(a)}
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-sm ${SEAT_TONE[a.status]} ${hitIds.has(a.id) ? 'ring-2 ring-fuchsia-500' : ''} ${picked === a.id ? 'ring-2 ring-indigo-500' : ''}`}>
                          <span className="text-[10px] font-mono opacity-70">{a.seat.split('-')[1]}</span><b>{a.name}</b><span className="text-[11px] opacity-80">{a.position}</span>
                          {a.speech && <Mic2 className="w-3 h-3" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {sheetA && (sheet.ro
        ? <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-3" onClick={() => setSheet(null)}>
            <div className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="text-xl font-bold">{sheetA.name} <span className="text-sm font-medium text-slate-600">{sheetA.position}</span></div>
              <div className="text-sm text-slate-500 mb-2">{sheetA.organization} · <span className="font-mono">{sheetA.seat}</span></div>
              <div className="flex items-center gap-2"><StatusChip status={sheetA.status} />{sheetA.arrivalTime && <span className="text-xs text-slate-500">도착 {sheetA.arrivalTime}</span>}{sheetA.speech && <span className="text-xs text-violet-700 font-semibold">{sheetA.speechType}</span>}</div>
              <button onClick={() => setSheet(null)} className="btn btn-dark w-full justify-center mt-3 py-2">닫기</button>
            </div>
          </div>
        : <ActionSheet a={sheetA} onClose={() => setSheet(null)} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} updateAttendee={updateAttendee} />)}
    </div>
  );
}

// =====================================================================
// 내빈 관리 (관리자)
// =====================================================================
function ManageView({ applyProtocol, onQuickAdd, attendees, updateAttendee, addAttendee, removeAttendee, setStatus, toggleSpeech, toggleIntro, notify, patch, askUser }) {
  const [paste, setPaste] = useState('');
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);
  const [more, setMore] = useState(false);
  const [sort, setSort] = useState(() => { try { return localStorage.getItem('mars-manage-sort') || 'rank'; } catch { return 'rank'; } });
  useEffect(() => { try { localStorage.setItem('mars-manage-sort', sort); } catch {} }, [sort]);
  const ST_ORDER = { '미도착': 0, '도착': 1, '착석': 2, '불참': 3, '퇴장': 4 };
  const sorter = { rank: byRank, reg: (x, y) => x.id - y.id, seat: (x, y) => (x.seat || '~').localeCompare(y.seat || '~'), name: (x, y) => x.name.localeCompare(y.name, 'ko'), status: (x, y) => ST_ORDER[x.status] - ST_ORDER[y.status] || byRank(x, y) }[sort];
  const shown = attendees.filter(a => !q.trim() || `${a.name}${a.organization}${a.position}${a.category}${a.seat}`.includes(q.trim())).sort(sorter);
  const doProtocol = async () => { if (await askUser('의전 순위대로 맞춥니다.\n· 내빈 소개 순서를 의전순으로\n· 인사말씀 순서를 의전순으로\n· 좌석을 구역별로 1열 가운데부터(가운데 → 좌우 교대)\n\n지금 순서와 좌석이 바뀝니다. 계속할까요?')) { applyProtocol(); notify('의전순으로 맞췄습니다'); } };
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
    const head = ['의전', '구분', '소속', '직위', '성명', '등급', '좌석', '상태', '도착', '착석', '인사말씀', '소개', '비고'];
    const rows = [...attendees].sort(byRank).map((a, i) => [rankOf(a) === 999 ? '' : rankOf(a), a.category, a.organization, a.position, a.name, a.grade, a.seat, a.status, a.arrivalTime || '', a.seatedTime || '', a.speech ? a.speechType : '', a.intro ? 'Y' : '', a.note]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `내빈현황_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  const resetStatus = async () => { if (await askUser('모든 내빈의 도착·착석 상태를 미도착으로 되돌립니다. 계속할까요?')) patch(s => ({ attendees: s.attendees.map(a => ({ ...a, status: '미도착', arrivalTime: null, seatedTime: null })) })); };
  const reseat = async () => { if (await askUser('현재 목록 순서대로 좌석번호(A-01~)를 다시 매깁니다. 계속할까요?')) patch(s => ({ attendees: s.attendees.map((a, i) => ({ ...a, seat: `A-${String(i + 1).padStart(2, '0')}` })) })); };

  return (
    <div className="card p-2 sm:p-3">
      <div className="flex flex-wrap items-center gap-1.5 mb-2">
        <h2 className="section-title"><Users className="w-4 h-4" />내빈 관리 <span className="text-xs font-normal text-slate-500">{attendees.length}명</span></h2>
        <div className="relative flex-1 min-w-[140px] max-w-xs"><Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="이름·소속·좌석 검색" className="w-full border border-slate-300 rounded-md pl-7 pr-2 py-1.5 text-sm" /></div>
        <div className="w-full md:w-auto md:ml-auto flex flex-wrap gap-1">
          <button onClick={onQuickAdd} className="btn btn-dark"><Plus className="w-3 h-3" />1명 추가</button>
          <button onClick={doProtocol} className="btn btn-primary">의전순 적용</button>
          <button onClick={() => setMore(v => !v)} className="btn btn-outline md:hidden">{more ? '접기 ▴' : '더보기 ▾'}</button>
          <div className={`${more ? 'flex' : 'hidden'} md:flex flex-wrap gap-1 w-full md:w-auto`}>
            <button onClick={() => setShowPaste(v => !v)} className="btn btn-outline"><Upload className="w-3 h-3" />엑셀 붙여넣기</button>
            <button onClick={exportCsv} className="btn btn-outline"><Download className="w-3 h-3" />엑셀(CSV) 저장</button>
            <button onClick={reseat} className="btn btn-outline">좌석 재부여</button>
            <button onClick={resetStatus} className="text-xs px-2 py-1.5 rounded border border-rose-300 text-rose-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" />상태 초기화</button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-1.5 overflow-x-auto text-xs">
        <span className="text-slate-500 shrink-0">정렬</span>
        {[['rank', '의전순'], ['status', '미도착 먼저'], ['seat', '좌석순'], ['name', '가나다순'], ['reg', '등록순']].map(([k, l]) => (
          <button key={k} onClick={() => setSort(k)} className={`shrink-0 px-2 py-0.5 rounded-full border font-semibold ${sort === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300'}`}>{l}</button>
        ))}
      </div>
      {showPaste && (
        <div className="mb-3 border border-blue-200 bg-blue-50 rounded p-2">
          <div className="text-[11px] text-slate-600 mb-1">엑셀에서 <b>구분 | 소속 | 직위 | 성명 | 좌석 | 비고</b> 열을 복사해 붙여넣으세요 (탭 또는 | 구분, 좌석·비고는 생략 가능)</div>
          <textarea value={paste} onChange={e => setPaste(e.target.value)} rows={5} className="w-full text-xs border border-slate-300 rounded p-2 font-mono" placeholder={'국회\t국회\t국회의원\t홍길동\tA-44'} />
          <div className="flex gap-1 mt-1"><button onClick={importPaste} className="text-xs px-3 py-1 rounded bg-blue-600 text-white">추가</button><button onClick={() => setShowPaste(false)} className="text-xs px-3 py-1 rounded border">취소</button></div>
        </div>
      )}
      {/* 핸드폰: 2줄 카드 (이름 줄 + 단추 줄) */}
      <div className="md:hidden space-y-1">
        {shown.map(a => (
          <div key={a.id} className={`rounded-md border border-l-4 pl-2 pr-1.5 py-1 ${a.status === '착석' ? 'border-l-emerald-500 bg-emerald-50/50' : a.status === '도착' ? 'border-l-amber-500 bg-amber-50/50' : a.status === '불참' ? 'border-l-rose-400' : 'border-l-slate-300'} border-slate-200`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 text-[11px] font-bold text-indigo-600 tabular-nums w-5">{rankOf(a) === 999 ? '-' : rankOf(a)}</span>
              <span className="shrink-0 text-[16px] font-bold leading-tight">{a.name}</span>
              <span className="shrink-0 text-[12px] text-slate-700">{a.position}</span>
              <span className="min-w-0 truncate text-[11px] text-slate-400">{a.organization} · {a.seat || '-'}</span>
              <span className="ml-auto shrink-0"><StatusChip status={a.status} small /></span>
              <button onClick={() => setEdit(a.id)} className="shrink-0 p-1 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[['도착', 'bg-amber-500 border-amber-500 text-white'], ['착석', 'bg-emerald-600 border-emerald-600 text-white'], ['불참', 'bg-white border-rose-300 text-rose-600'], ['미도착', 'bg-white border-slate-300 text-slate-500']].map(([st, cls]) => (
                <button key={st} onClick={() => setStatus(a.id, st)} className={`flex-1 rounded border py-1 text-[12px] font-bold ${a.status === st ? 'ring-2 ring-slate-800' : ''} ${cls}`}>{st === '미도착' ? '초기화' : st}</button>
              ))}
              <button onClick={() => toggleIntro(a.id, !a.intro)} className={`shrink-0 px-1.5 py-1 rounded border text-[11px] font-bold ${a.intro ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-400 border-slate-300'}`}>소개{a.intro ? '○' : '×'}</button>
              <button onClick={() => toggleSpeech(a.id, !a.speech)} className={`shrink-0 px-1.5 py-1 rounded border text-[11px] font-bold ${a.speech ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-slate-400 border-slate-300'}`}>{a.speech ? a.speechType : '말씀×'}</button>
            </div>
          </div>
        ))}
      </div>
      {edit != null && (() => { const a = attendees.find(x => x.id === edit); return a ? <EditModal a={a} onClose={() => setEdit(null)} updateAttendee={updateAttendee} onDelete={async () => { if (await askUser(`${a.name}을(를) 삭제할까요?`)) { removeAttendee(a.id); setEdit(null); } }} /> : null; })()}
      {/* 노트북: 표 */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs min-w-[980px]">
          <thead><tr className="bg-slate-100 text-slate-600 text-left">
            {['의전', '구분', '소속', '직위', '성명', '등급', '좌석', '상태 변경', '인사말씀', '소개', '비고', ''].map(h => <th key={h} className="px-1.5 py-1.5 font-semibold whitespace-nowrap">{h}</th>)}
          </tr></thead>
          <tbody>
            {shown.map((a, i) => (
              <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50 align-middle">
                <td className="px-1 w-12"><input type="number" min="1" className={`${cell} text-center font-bold text-indigo-700`} value={rankOf(a) === 999 ? '' : rankOf(a)} onChange={e => updateAttendee(a.id, { rank: e.target.value === '' ? null : Number(e.target.value) })} /></td>
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
                <td className="px-1"><button onClick={async () => { if (await askUser(`${a.name || '이 내빈'}을(를) 삭제할까요?`)) removeAttendee(a.id); }} className="text-slate-300 hover:text-rose-600"><Trash2 className="w-3.5 h-3.5" /></button></td>
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
function SettingsView({ state, patch, setState, notify, sync, askUser, changePin }) {
  const [ev, setEv] = useState(state.event);
  const [prog, setProg] = useState(state.program.map(p => `${p.time} | ${p.dur} | ${p.title} | ${p.note}`).join('\n'));
  const [pin1, setPin1] = useState(''); const [pin2, setPin2] = useState('');
  const fileRef = useRef(null);

  const saveEvent = () => { patch(() => ({ event: ev })); notify('행사 정보를 저장했습니다'); };
  const saveProg = () => {
    const program = prog.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => { const c = l.split('|').map(x => x.trim()); return { id: 'p' + (i + 1), time: c[0] || '', dur: Number(c[1]) || 0, title: c[2] || '', note: c[3] || '' }; });
    patch(() => ({ program })); notify('식순을 저장했습니다');
  };
  const savePin = async () => {
    if (pin1.length < 6) return notify('6자리 이상, 영문과 숫자를 섞어 입력하세요');
    if (pin1 !== pin2) return notify('두 입력이 다릅니다');
    const ok = await changePin(pin1);
    if (!ok) return notify('변경하지 못했습니다. 다시 입장한 뒤 시도하세요');
    setPin1(''); setPin2(''); notify('비밀번호를 변경했습니다. 다른 관리자 기기는 새 비밀번호로 다시 입장해야 합니다');
  };
  const backup = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(stripLocal(state), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `내빈플랫폼_백업_${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '')}.json`; a.click();
  };
  // 다른 기기와 합칠 때 이 자료가 이기도록 모든 항목에 새 시각을 찍고, 없어진 사람은 삭제 표시
  const stampAll = (next) => setState(prev => {
    const t = Date.now(); const keep = new Set(next.attendees.map(a => a.id));
    const tomb = { ...(prev.tombstones || {}) }; prev.attendees.forEach(a => { if (!keep.has(a.id)) tomb[a.id] = t; });
    Object.keys(tomb).forEach(k => { if (keep.has(Number(k))) delete tomb[k]; });
    return { ...next, attendees: next.attendees.map(a => ({ ...a, u: t })), tombstones: tomb, metaAt: t, seatLayout: prev.seatLayout, adminPin: prev.adminPin, nextId: Math.max(next.nextId || 0, prev.nextId || 0) };
  });
  const restore = (f) => { const r = new FileReader(); r.onload = async () => { try { const s = JSON.parse(r.result); if (!s.attendees) throw 0; if (!(await askUser(`백업 파일(${s.attendees.length}명)로 모든 기기의 자료를 바꿉니다. 계속할까요?`))) return; stampAll({ ...DEFAULT_STATE(), ...s }); notify('복원했습니다'); } catch { notify('파일 형식이 올바르지 않습니다'); } }; r.readAsText(f); };
  const resetAll = async () => { if (await askUser('모든 기기의 자료를 초기 상태(RSVP 43명)로 되돌립니다. 백업을 먼저 받으셨나요?')) { stampAll(DEFAULT_STATE()); notify('초기화했습니다'); } };
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
        <h2 className="section-title mb-2">여러 기기 공유</h2>
        {sync?.on ? <p className="text-xs text-slate-600">공유 저장소에 연결되어 있습니다. 상태: <b>{sync.status}</b>{sync.at && ` (${sync.at})`}{sync.err && <span className="text-rose-600"> · {sync.err}</span>}<br />관리자 모드 기기에서 바꾼 내용이 서버에 저장되고, 모든 기기는 4초마다 서버 내용을 받아옵니다. 관리자 비밀번호가 서버 쓰기 열쇠이므로 바꾸면 모든 관리자 기기에서 새 비밀번호로 다시 입장하세요.</p>
          : <p className="text-xs text-slate-600">공유 저장소가 설정되지 않은 파일입니다(이 브라우저에만 저장).</p>}
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
  const speakers = speakerList(attendees, speechOrder);
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
        <div className="flex items-center justify-between mb-2"><h2 className="text-sm font-bold">보고용 요약문</h2><button onClick={() => copyText(text, notify, 'report-text')} className="btn btn-outline"><Copy className="w-3 h-3" />복사</button></div>
        <textarea id="report-text" readOnly value={text} className="flex-1 min-h-[300px] text-xs font-mono border border-slate-200 rounded p-2 bg-slate-50" />
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
  const [f, setF] = useState({ rank: Math.max(0, ...attendees.map(a => rankOf(a)).filter(r => r < 999)) + 1, name: '', position: '', organization: '', category: '긴급 추가', grade: 'VVIP', zone: zones[0] || 'A', status: '도착', speech: false, speechType: '축사', note: '현장 추가' });
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
          <label><span className="text-[11px] text-slate-500">의전 순위</span><input type="number" min="1" className={inp} value={f.rank} onChange={e => setF({ ...f, rank: Number(e.target.value) })} /></label>
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
  const speakers = speakerList(attendees, speechOrder);
  const [only, setOnly] = useState(false);
  const intros = introOrder.map(id => attendees.find(a => a.id === id)).filter(a => a && a.intro).filter(a => !only || PRESENT.includes(a.status));
  const [mode, setMode] = useState('speech');
  useEffect(() => { const h = () => { setMode(window.__printMode || 'speech'); setOnly(!!window.__printOnly); }; window.addEventListener('printmode', h); return () => window.removeEventListener('printmode', h); }, []);
  const stamp = new Date().toLocaleString('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <div className="hidden print:block text-black p-2">
      <div className="text-center border-b-2 border-black pb-2 mb-3">
        <div className="text-xl font-bold">{event.name}</div>
        <div className="text-base font-bold mt-1">{mode === 'intro' ? `내빈 소개 순서${only ? ' (참석자만)' : ''}` : '인사말씀 순서'}</div>
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
        {mode === 'speech' && <div className="font-bold mb-1">[사회자 멘트 — 참석자 기준]</div>}
        {mode === 'speech' && speakers.filter(a => PRESENT.includes(a.status)).map((a, i) => <div key={a.id} className="mb-1">{i + 1}. 다음은 {honor(a)}의 {a.speechType}{iga(a.speechType)} 있겠습니다. 큰 박수로 맞아 주시기 바랍니다.</div>)}
        {mode === 'speech' && speakers.some(a => !PRESENT.includes(a.status)) && <div className="mt-2 font-bold">※ 미도착(멘트 제외): {speakers.filter(a => !PRESENT.includes(a.status)).map(a => `${a.name} ${a.position}(${a.speechType})`).join(', ')}</div>}
        <div className="mt-2 text-[10px] text-slate-500">※ 참석란 ○=도착·착석, ×=미도착·불참. 화성특례시 AI스마트전략실</div>
      </div>
    </div>
  );
}

// =====================================================================
// 내빈 정보 수정 창 (핸드폰용)
// =====================================================================
function EditModal({ a, onClose, updateAttendee, onDelete }) {
  const inp = 'w-full border border-slate-300 rounded-md px-2 py-2 text-sm';
  const F = ({ k, label, mono }) => <label className="block"><span className="text-[11px] text-slate-500">{label}</span><input className={`${inp} ${mono ? 'font-mono' : ''}`} value={a[k] || ''} onChange={e => updateAttendee(a.id, { [k]: k === 'seat' ? e.target.value.toUpperCase() : e.target.value })} /></label>;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-4 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center mb-3"><h3 className="font-bold">내빈 정보 수정</h3><button onClick={onClose} className="ml-auto text-slate-400"><X className="w-5 h-5" /></button></div>
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">{F({ k: 'name', label: '성명' })}</div>
          {F({ k: 'position', label: '직위' })}
          {F({ k: 'organization', label: '소속' })}
          {F({ k: 'category', label: '구분' })}
          {F({ k: 'seat', label: '좌석 (예: A-05)', mono: true })}
          <label className="block"><span className="text-[11px] text-slate-500">등급</span><select className={inp} value={a.grade} onChange={e => updateAttendee(a.id, { grade: e.target.value })}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label>
          <label className="block"><span className="text-[11px] text-slate-500">인사말씀 종류</span><select className={inp} value={a.speechType} onChange={e => updateAttendee(a.id, { speechType: e.target.value })}>{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select></label>
          <label className="block"><span className="text-[11px] text-slate-500">의전 순위 (작을수록 상석)</span><input type="number" min="1" className={inp} value={rankOf(a) === 999 ? '' : rankOf(a)} onChange={e => updateAttendee(a.id, { rank: e.target.value === '' ? null : Number(e.target.value) })} /></label>
          <div className="col-span-2">{F({ k: 'note', label: '비고' })}</div>
        </div>
        <div className="flex gap-2 mt-4"><button onClick={onDelete} className="btn btn-outline text-rose-600 border-rose-300"><Trash2 className="w-3.5 h-3.5" />삭제</button><button onClick={onClose} className="btn btn-dark ml-auto px-6 py-2">완료</button></div>
      </div>
    </div>
  );
}

// =====================================================================
// 카톡 중간보고
// =====================================================================
const buildKakaoReport = ({ stats, attendees, event, speechOrder, detail }) => {
  const d = new Date(); const wd = '일월화수목금토'[d.getDay()];
  const stamp = `${d.getMonth() + 1}.${d.getDate()}.(${wd}) ${nowHM()}`;
  const speakers = speakerList(attendees, speechOrder);
  const absentNames = attendees.filter(a => a.status === '미도착');
  const recent = attendees.filter(a => PRESENT.includes(a.status)).sort((a, b) => (b.arrivalTime || '').localeCompare(a.arrivalTime || '')).slice(0, 5);
  const cats = [...new Set(attendees.map(a => a.category))].map(c => { const l = attendees.filter(a => a.category === c); return `${c} ${l.filter(a => PRESENT.includes(a.status)).length}/${l.length}`; });
  const lines = [
    `[${event.name} 내빈 현황]`,
    `${stamp} 기준`,
    ``,
    `■ 참석 ${stats.present}/${stats.total}명 (${stats.rate}%)`,
    ` - 착석 ${stats.seated} · 도착 ${stats.arrived} · 미도착 ${stats.notArrived}${stats.absent ? ` · 불참 ${stats.absent}` : ''}`,
    ``,
    `■ 인사말씀 ${stats.speakersPresent}/${stats.speakers}명 도착`,
    ...speakers.map((a, i) => ` ${i + 1}) ${a.speechType} ${a.name} ${a.position} — ${PRESENT.includes(a.status) ? a.status + ' ✔' : '미도착 ⚠'}`),
  ];
  if (detail) {
    lines.push('', '■ 구분별 참석', ' ' + cats.join(' / '));
    if (recent.length) lines.push('', '■ 최근 도착', ...recent.map(a => ` · ${a.name} ${a.position}(${a.organization}) ${a.arrivalTime || ''}`));
    lines.push('', `■ 미도착 ${absentNames.length}명`, ' ' + (absentNames.map(a => `${a.name} ${a.position}`).join(', ') || '없음'));
  }
  lines.push('', '※ AI스마트전략실 내빈 운영 현황');
  return lines.join('\n');
};

function KakaoReportModal({ onClose, stats, attendees, event, speechOrder, notify }) {
  const [detail, setDetail] = useState(false);
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!touched) setText(buildKakaoReport({ stats, attendees, event, speechOrder, detail })); }, [detail, stats, attendees, touched]);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !EMBEDDED;
  const copy = async () => { try { await navigator.clipboard.writeText(text); notify('복사했습니다. 카톡 대화방에 붙여넣으세요'); } catch { document.getElementById('kakao-text')?.select(); notify('글자가 선택되었습니다. 길게 눌러 복사하세요'); } };
  const share = async () => { if (!canShare) return copy(); try { await navigator.share({ text }); } catch (e) { if (e?.name !== 'AbortError') copy(); } };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#FEE500] px-4 py-3 flex items-center gap-2"><MessageCircle className="w-5 h-5" /><h3 className="font-bold text-[#191919]">카톡 중간보고</h3><button onClick={onClose} className="ml-auto"><X className="w-5 h-5" /></button></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border border-slate-300 overflow-hidden text-xs font-semibold">
              <button onClick={() => { setDetail(false); setTouched(false); }} className={`px-3 py-1.5 ${!detail ? 'bg-slate-900 text-white' : 'bg-white'}`}>간단</button>
              <button onClick={() => { setDetail(true); setTouched(false); }} className={`px-3 py-1.5 ${detail ? 'bg-slate-900 text-white' : 'bg-white'}`}>상세(미도착 명단)</button>
            </div>
            {touched && <button onClick={() => setTouched(false)} className="text-xs text-indigo-700 underline">최신 현황으로 다시 작성</button>}
          </div>
          <textarea id="kakao-text" value={text} onChange={e => { setText(e.target.value); setTouched(true); }} rows={14} className="w-full text-[13px] leading-relaxed border border-slate-300 rounded-lg p-3 bg-[#B2C7D9]/20 font-sans" />
          <div className={`grid gap-2 ${canShare ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {canShare && <button onClick={share} className="rounded-lg py-3 font-bold bg-[#FEE500] text-[#191919] flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" />카톡으로 보내기</button>}
            <button onClick={copy} className="rounded-lg py-3 font-bold border border-slate-300 flex items-center justify-center gap-1.5"><Copy className="w-4 h-4" />복사</button>
          </div>
          <p className="text-[11px] text-slate-500">「카톡으로 보내기」를 누르면 핸드폰 공유 창이 열립니다. 카카오톡 → 보고방을 고르면 됩니다. 노트북에서는 복사 후 PC 카톡에 붙여넣으세요. 내용은 보내기 전에 고쳐 쓸 수 있습니다.</p>
        </div>
      </div>
    </div>
  );
}
