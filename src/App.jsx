import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Users, Crown, MapPin, Clock, BarChart3, Mic2, FileText, Bell, X, Lock, Unlock, Settings, Copy, Plus, Trash2, GripVertical, Download, Upload, RotateCcw, ListOrdered, Eye, LogIn, BookOpen, Printer, UserPlus, MessageCircle, Pencil, Search, Share2, ArrowUpDown } from 'lucide-react';
import { ROSTER } from './roster.js';

// =====================================================================
// 공공행사 내빈 소개·인사말씀 운영 플랫폼 (AI EXPO 「MARS 2026」 개막식)
// 단일 파일 React 앱 · 모든 자료는 브라우저(localStorage)에 저장
// =====================================================================

const STORE_KEY = 'mars-vip-platform-v2';
const APP_VERSION = '4.1.1';

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

// ---------- 초청명단(8차, 10.29.) 기반 초기 자료 ----------
const T0 = 1793256699493; // 명단 반영 시점 — 이보다 오래된 기록은 새 명단으로 대체
const SPEECH_TYPES = ['개회사', '환영사', '축사', '격려사', '기념사', '인사말'];
const MARK_TXT = { O: '○ 사전참석', T: '△ 미정', X: '✕ 사전불참', '': '미확인' };
const HOST = { id: 901, rid: -1, category: '주최', organization: '화성특례시', position: '시장', name: '정명근', note: '주최', grade: 'VIP', rsvp: 'O', seat: '', status: '미도착', arrivalTime: null, seatedTime: null, intro: false, rank: 1, speech: true, speechType: '개회사', u: T0 };
const SPEECH_DEFAULT = { '이계철': '환영사', '김종민': '축사', '하정우': '축사' };
const fromRoster = (i, extra) => {
  const [grade, category, organization, position, name, rsvp] = ROSTER[i];
  return { id: 1000 + i, rid: i, grade, category, organization, position, name, rsvp, note: '', seat: '', status: '미도착', arrivalTime: null, seatedTime: null, intro: true, rank: i + 2, speech: !!SPEECH_DEFAULT[name], speechType: SPEECH_DEFAULT[name] || '축사', u: T0, ...extra };
};
// 예정 명단: 사전회신 ○·△ 전원 + VIP 등급 미확인
const LISTED = ROSTER.map((r, i) => i).filter(i => ROSTER[i][5] === 'O' || ROSTER[i][5] === 'T' || (ROSTER[i][0] === 'VIP' && ROSTER[i][5] === ''));
const rankOf = (a) => (a.rank != null && a.rank !== '' ? Number(a.rank) : 999);
const byRank = (x, y) => rankOf(x) - rankOf(y) || x.id - y.id;
const makeSeed = () => [HOST, ...LISTED.map(i => fromRoster(i))];
const seedSpeechOrder = (list) => ['정명근', '이계철', '김종민', '하정우'].map(n => list.find(a => a.name === n && a.speech)?.id).filter(Boolean);

// ---------- 좌석: 오디토리움 VIP지정석 (무대 앞 가운데 좌·우 블록, 1열이 지정석) ----------
const DEFAULT_SEATZONES = [
  { id: 'L', name: '좌측 블록', rows: [6, 7, 8], vip: 1 },
  { id: 'R', name: '우측 블록', rows: [6, 7, 8], vip: 1 },
];
const seatKey = (z, r, c) => `${z}:${r}:${c}`;
const seatLabel = (k) => { const [z, r, c] = k.split(':'); return `${z === 'L' ? '좌' : z === 'R' ? '우' : z}${r}-${c}`; };
// 배정 순서: 1열부터, 가운데 통로에 가까운 자리부터 우측 → 좌측 교대
const seatKeysInOrder = (zones) => {
  const L = zones.find(z => z.id === 'L') || zones[0] || { rows: [] };
  const R = zones.find(z => z.id === 'R') || zones[1] || { rows: [] };
  const out = []; const nRows = Math.max(L.rows.length, R.rows.length);
  for (let r = 0; r < nRows; r++) {
    const ln = L.rows[r] || 0, rn = R.rows[r] || 0;
    for (let i = 0; i < Math.max(ln, rn); i++) {
      if (i < rn) out.push(seatKey('R', r + 1, i + 1));
      if (i < ln) out.push(seatKey('L', r + 1, ln - i));
    }
  }
  return out;
};

const DEFAULT_STATE = () => {
  const attendees = makeSeed();
  const tomb = {}; for (let k = 1; k <= 120; k++) tomb[k] = T0; // 이전 판(43명 체계) 기록 정리
  return {
    event: DEFAULT_EVENT, program: DEFAULT_PROGRAM, attendees,
    speechOrder: seedSpeechOrder(attendees), introOrder: attendees.map(a => a.id),
    seatZones: DEFAULT_SEATZONES, seatMap: {}, seatLayout: {},
    adminPin: '1234', nextId: 900001, metaAt: T0, tombstones: tomb, rosterVer: 8,
  };
};

const loadState = () => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (s && s.attendees && s.rosterVer === 8) return normState({ ...DEFAULT_STATE(), ...s });
  } catch {}
  return DEFAULT_STATE();
};

// ---------- 상수 ----------
const STATUSES = ['미도착', '도착', '불참'];
const PRESENT = ['도착', '착석'];
const STATUS_STYLE = {
  '미도착': 'bg-slate-100 text-slate-600 border-slate-300',
  '도착': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  '착석': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  '퇴장': 'bg-slate-50 text-slate-500 border-slate-300',
  '불참': 'bg-rose-50 text-rose-700 border-rose-300',
};
const STATUS_DOT = { '미도착': 'bg-slate-400', '도착': 'bg-emerald-500', '착석': 'bg-emerald-500', '퇴장': 'bg-slate-300', '불참': 'bg-rose-500' };
const GRADES = ['VIP', 'S', 'A', 'B', '기타'];
const GRADE_STYLES = {
  'VIP': { bg: 'bg-rose-600', light: 'bg-rose-50', border: 'border-rose-200' },
  'S': { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-200' },
  'A': { bg: 'bg-sky-600', light: 'bg-sky-50', border: 'border-sky-200' },
  'B': { bg: 'bg-slate-500', light: 'bg-slate-50', border: 'border-slate-200' },
  '기타': { bg: 'bg-slate-400', light: 'bg-slate-50', border: 'border-slate-200' },
};
// ---------- 공유 저장소(Supabase) ----------
const SYNC = { url: 'https://sbnjodqxvwgqgdnzcziz.supabase.co', key: 'sb_publishable_vDOafQ_YqlElOwBxLeHHvA_x1mgHGLw', table: 'event_state', id: 'mars-2026' };
const SYNC_ON = SYNC.url.startsWith('http');
const normAtt = (a) => (a.status === '착석' || a.status === '퇴장' ? { ...a, status: '도착' } : a);
const normState = (st) => (st && st.attendees && st.attendees.some(a => a.status === '착석' || a.status === '퇴장') ? { ...st, attendees: st.attendees.map(normAtt) } : st);
const mergeState = (local, remote) => {
  if (!remote) return local;
  if (!local) return remote;
  const tomb = { ...(remote.tombstones || {}), ...(local.tombstones || {}) };
  const byId = new Map();
  const rv = Math.max(local.rosterVer || 0, remote.rosterVer || 0);
  const pool = [...((remote.rosterVer || 0) === rv ? remote.attendees || [] : []), ...((local.rosterVer || 0) === rv ? local.attendees || [] : [])];
  pool.forEach(a => {
    if (rv >= 8 && a.id < 900) return; // 옛 판(43명 체계) 번호대는 새 판에서 받지 않음
    const t = tomb[a.id]; if (t && t >= (a.u || 0)) return;
    const cur = byId.get(a.id);
    if (!cur || (a.u || 0) >= (cur.u || 0)) byId.set(a.id, a);
  });
  // 명단 판(rosterVer)이 높은 쪽이 항상 이기고, 같으면 더 최근에 순서·설정을 바꾼 쪽
  const score = x => (x.rosterVer || 0) * 1e15 + (x.metaAt || 0);
  const meta = score(local) >= score(remote) ? local : remote;
  const other = meta === local ? remote : local;
  const attendees = [...byId.values()].map(normAtt).sort((a, b) => a.id - b.id);
  return { ...meta, rosterVer: Math.max(local.rosterVer || 0, remote.rosterVer || 0), seatZones: meta.seatZones || other.seatZones, seatMap: meta.seatMap || other.seatMap || {},
    attendees, tombstones: tomb, nextId: Math.max(local.nextId || 0, remote.nextId || 0, ...attendees.map(a => a.id + 1)),
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
  const [gateOpen, setGateOpen] = useState(() => { try { return !(sessionStorage.getItem('mars-admin') === '1' || localStorage.getItem('mars-admin-keep') === '1' || localStorage.getItem('mars-role')); } catch { return true; } });
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
    const id = Date.now();
    const a = { id, rid: null, category: '현장 추가', organization: '', position: '', name: '', note: '현장 추가', grade: '기타', rsvp: '', seat: '', status: '도착', arrivalTime: nowHM(), seatedTime: null, intro: true, speech: false, speechType: '축사', rank: 999, ...data, u: now() };
    return { attendees: [...s.attendees, a], introOrder: [...s.introOrder, id] };
  });
  // 대기 명단(초청명단 전체)에서 찾아 올리기 — 같은 사람은 기기와 무관하게 같은 번호(1000+순번)
  const addFromRoster = (i) => patchMeta(s => {
    const id = 1000 + i;
    const ex = s.attendees.find(a => a.id === id);
    if (ex) return { attendees: s.attendees.map(a => a.id === id ? { ...a, status: '도착', arrivalTime: a.arrivalTime || nowHM(), u: now() } : a) };
    const a = fromRoster(i, { status: '도착', arrivalTime: nowHM(), u: now() });
    return { attendees: [...s.attendees, a], introOrder: [...s.introOrder, id] };
  });
  // 좌석 배정/해제: id가 없으면 해당 좌석 비우기
  const assignSeat = (key, id) => patchMeta(s => {
    const m = { ...(s.seatMap || {}) };
    if (id == null) { delete m[key]; }
    else { Object.keys(m).forEach(k => { if (m[k] === id) delete m[k]; }); m[key] = id; }
    const label = {}; Object.entries(m).forEach(([k, v]) => { label[v] = seatLabel(k); });
    return { seatMap: m, attendees: s.attendees.map(a => (a.seat || '') !== (label[a.id] || '') ? { ...a, seat: label[a.id] || '', u: now() } : a) };
  });
  const setZones = (zones) => patchMeta(s => {
    const valid = new Set(seatKeysInOrder(zones));
    const m = {}; Object.entries(s.seatMap || {}).forEach(([k, v]) => { if (valid.has(k)) m[k] = v; });
    const label = {}; Object.entries(m).forEach(([k, v]) => { label[v] = seatLabel(k); });
    return { seatZones: zones, seatMap: m, attendees: s.attendees.map(a => (a.seat || '') !== (label[a.id] || '') ? { ...a, seat: label[a.id] || '', u: now() } : a) };
  });
  // 의전순 적용: 소개·인사말씀 순서 정렬 + 지정석(통로 가까운 자리부터 우→좌 교대) 자동 배정
  const applyProtocol = () => patchMeta(s => {
    const t = now();
    const sorted = [...s.attendees].sort(byRank);
    const keys = seatKeysInOrder(s.seatZones || DEFAULT_SEATZONES);
    const eligible = sorted.filter(a => a.status !== '불참');
    const seatMap = {}; const label = {};
    keys.forEach((k, i) => { const a = eligible[i]; if (a) { seatMap[k] = a.id; label[a.id] = seatLabel(k); } });
    return {
      attendees: s.attendees.map(a => ({ ...a, seat: label[a.id] || '', u: t })),
      seatMap,
      introOrder: sorted.map(a => a.id),
      speechOrder: [...s.speechOrder].sort((x, y) => { const ax = s.attendees.find(a => a.id === x) || {}, ay = s.attendees.find(a => a.id === y) || {}; return SPEECH_TYPES.indexOf(ax.speechType) - SPEECH_TYPES.indexOf(ay.speechType) || byRank(ax, ay); }),
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
    { id: 'board', label: '현황판', icon: BarChart3, on: 'bg-indigo-600 text-white shadow', off: 'bg-indigo-50 text-indigo-700' },
    ...(isAdmin ? [{ id: 'manage', label: '내빈 관리', icon: Users, on: 'bg-emerald-600 text-white shadow', off: 'bg-emerald-50 text-emerald-700' }] : []),
    { id: 'speech', label: '인사말씀·소개', icon: Mic2, on: 'bg-violet-600 text-white shadow', off: 'bg-violet-50 text-violet-700' },
    { id: 'seat', label: '좌석 현황', icon: MapPin, on: 'bg-rose-600 text-white shadow', off: 'bg-rose-50 text-rose-700' },
    { id: 'report', label: '결과 요약', icon: FileText, on: 'bg-amber-500 text-white shadow', off: 'bg-amber-50 text-amber-700' },
    ...(isAdmin ? [{ id: 'settings', label: '설정', icon: Settings, on: 'bg-slate-700 text-white shadow', off: 'bg-slate-100 text-slate-600' }] : []),
    { id: 'guide', label: '안내', icon: BookOpen, on: 'bg-sky-600 text-white shadow', off: 'bg-sky-50 text-sky-700' },
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
          <div className="max-w-7xl mx-auto px-2 py-1.5 flex gap-1.5 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition ${view === t.id ? t.on : `${t.off} hover:brightness-95`}`}>
                <t.icon className="w-4 h-4" />{t.label}
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
        {view === 'seat' && <SeatView attendees={attendees} zones={state.seatZones || DEFAULT_SEATZONES} seatMap={state.seatMap || {}} isAdmin={isAdmin} setStatus={setStatus} assignSeat={assignSeat} setZones={setZones} applyProtocol={applyProtocol} askUser={askUser} notify={notify} />}
        {view === 'report' && <ReportView stats={stats} attendees={attendees} event={event} speechOrder={speechOrder} notify={notify} />}
        {view === 'manage' && isAdmin && <ManageView applyProtocol={applyProtocol} onQuickAdd={() => setQuickAdd(true)} attendees={attendees} updateAttendee={updateAttendee} addAttendee={addAttendee} removeAttendee={removeAttendee} setStatus={setStatus} toggleSpeech={toggleSpeech} toggleIntro={toggleIntro} notify={notify} askUser={askUser} patch={(fn) => patchMeta(s => { const r = fn(s); if (r.attendees) r.attendees = r.attendees.map(a => ({ ...a, u: now() })); return r; })} />}
        {view === 'guide' && <GuideView state={state} stats={stats} sync={sync} isAdmin={isAdmin} />}
        {view === 'settings' && isAdmin && <SettingsView state={state} patch={patchMeta} setState={setState} notify={notify} sync={sync} askUser={askUser} changePin={changePin} />}
      </main>

      <footer className="print:hidden max-w-7xl mx-auto px-3 py-2 text-[10px] text-slate-400 flex justify-between gap-2 whitespace-nowrap overflow-hidden">
        <span className="truncate">화성특례시 AI스마트전략실 · 내빈 운영 플랫폼 v{APP_VERSION}</span>
        <span className="hidden sm:inline">{SYNC_ON ? '여러 기기가 같은 자료를 공유합니다(4초 간격)' : '자료는 이 브라우저에만 저장됩니다'}</span>
      </footer>

      {ask && <AskModal ask={ask} onDone={v => { ask.resolve(v); setAsk(null); }} />}
      {gateOpen && !isAdmin && <RoleGate event={event} onViewer={() => { lsSafe.set('mars-role', 'viewer'); setGateOpen(false); }} onAdmin={() => { setGateOpen(false); setLoginOpen(true); }} />}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} onLogin={login} />}
      {quickAdd && <QuickAddModal onClose={() => setQuickAdd(false)} attendees={attendees} onAddRoster={(i) => { addFromRoster(i); setQuickAdd(false); notify(`${ROSTER[i][4]} ${ROSTER[i][3]}님을 도착으로 등록했습니다`); }} onAdd={(d) => { addAttendee(d); setQuickAdd(false); notify(`${d.name}님을 도착으로 추가했습니다`); }} />}
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
  if (status === '미도착') return null;
  return <span className={`inline-flex items-center gap-1 rounded border ${small ? 'px-1.5 py-0 text-[10px]' : 'px-2 py-0.5 text-xs'} ${STATUS_STYLE[status]}`}><span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]}`} />{status}</span>;
}

function StatusButtons({ a, setStatus, compact }) {
  const btn = (st, cls) => (
    <button key={st} onClick={() => setStatus(a.id, st)} disabled={a.status === st}
      className={`${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'} whitespace-nowrap rounded font-semibold border disabled:opacity-40 ${cls}`}>{st}</button>
  );
  return (
    <div className="flex flex-wrap gap-1">
      {btn('도착', 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700')}
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
  const categories = GRADES.filter(g => attendees.some(a => a.grade === g));
  const visible = attendees.filter(a => (filter === '전체' || a.status === filter || (filter === '인사말씀' && a.speech)) && (!q || `${a.name}${a.organization}${a.position}`.includes(q)));
  const current = program.findIndex((p, i) => { const n = program[i + 1]; return clock >= p.time && (!n || clock < n.time); });

  return (
    <div className="space-y-3">
      {/* 핵심 지표 */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <KPI label="예정" value={stats.total} />
        <KPI label="도착" value={stats.present} sub={`${stats.rate}%`} tone="emerald" />
        <KPI label="불참" value={stats.absent} tone="rose" />
        <KPI label="말씀" value={`${stats.speakersPresent}/${stats.speakers}`} tone="violet" />
      </div>

      {/* 도착 알림 (소형 칩) */}
      {present.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg px-3 py-2 text-white shadow">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1.5 mr-1 shrink-0"><Bell className="w-3.5 h-3.5 animate-pulse" /><span className="text-xs font-bold">도착 내빈</span><span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded">{present.length}/{stats.total}</span></div>
            {present.map(a => (
              <span key={a.id} title={`${honor(a)} · ${a.status}`} className="inline-flex items-center gap-1 bg-white/15 border border-white/20 rounded px-1.5 py-0.5 text-[11px] leading-4 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
                <span className="font-semibold">{a.name}</span><span className="text-white/75">{a.position}</span>
                {a.speech && <Mic2 className="w-2.5 h-2.5 text-amber-200" />}
                <span className="text-white/60 font-mono">{a.seatedTime || a.arrivalTime}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 내빈 목록 */}
      <div className="card p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <h2 className="section-title hidden sm:flex"><Users className="w-4 h-4" />내빈 현황</h2>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="이름·소속 검색" className="border border-slate-300 rounded px-2 py-1 text-xs flex-1 min-w-0 sm:flex-none sm:w-40" />
          <button onClick={() => setBig(v => !v)} className={`btn px-2 sm:order-last ${big ? 'btn-dark' : 'btn-outline'}`}>{big ? '크게 ✓' : '크게'}</button>
          <button onClick={printSpeech} className="btn btn-primary px-2 sm:order-last"><Printer className="w-3 h-3" />인사말씀 인쇄 ({stats.speakersPresent}/{stats.speakers})</button>
          <div className="w-full sm:w-auto flex gap-1 overflow-x-auto">
            {['전체', ...STATUSES.filter(x => x !== '미도착'), '인사말씀'].map(f => {
              const n = f === '전체' ? attendees.length : f === '인사말씀' ? attendees.filter(a => a.speech).length : attendees.filter(a => a.status === f).length;
              return <button key={f} onClick={() => setFilter(f)} className={`shrink-0 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${filter === f ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{f} <span className="opacity-60">{n}</span></button>;
            })}
          </div>

        </div>

        {categories.map(cat => {
          const list = visible.filter(a => a.grade === cat);
          if (!list.length) return null;
          const pc = list.filter(a => PRESENT.includes(a.status)).length;
          return (
            <div key={cat} className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-white bg-slate-700 px-1.5 py-0 rounded">{cat}</span>
                <span className="text-[11px] text-slate-500">도착 <b className={pc ? 'text-emerald-600' : ''}>{pc}</b>/{list.length}</span>
                <span className="flex-1 border-t border-slate-200" />
              </div>
              <div className={`grid gap-1 ${big ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
                {list.map(a => {
                  const tone = PRESENT.includes(a.status) ? 'border-l-emerald-500 bg-emerald-50' : a.status === '불참' ? 'border-l-rose-400 bg-rose-50/60 opacity-75' : a.status === '퇴장' ? 'border-l-slate-300 bg-slate-50 opacity-70' : 'border-l-slate-300 bg-white';
                  const badge = PRESENT.includes(a.status) ? 'bg-emerald-600 text-white' : a.status === '불참' ? 'bg-rose-500 text-white' : a.status === '퇴장' ? 'bg-slate-400 text-white' : 'bg-slate-200 text-slate-600';
                  return (
                    <div key={a.id} onClick={() => isAdmin && setSheet(a.id)} className={`rounded-md border border-slate-200 border-l-4 pl-2 pr-2 ${big ? 'py-1.5' : 'py-1'} ${tone} ${isAdmin ? 'cursor-pointer hover:border-indigo-300 active:bg-slate-100' : ''}`}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`shrink-0 font-bold text-slate-900 leading-tight ${big ? 'text-xl' : 'text-[16px]'}`}>{a.name}</span>
                        <span className={`min-w-0 truncate text-slate-700 ${big ? 'text-sm' : 'text-[12px]'}`}>{a.position}</span>
                        {a.speech && <span className="shrink-0 text-[10px] font-bold px-1 rounded bg-violet-600 text-white">{a.speechType}</span>}
                        {a.status !== '미도착' && <span className={`ml-auto shrink-0 px-1.5 py-0.5 rounded font-bold text-[11px] ${badge}`}>{a.status}</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0 leading-tight mt-0.5">
                        {a.rsvp !== 'O' && <span className={`shrink-0 font-semibold ${a.rsvp === 'T' ? 'text-amber-600' : a.rsvp === 'X' ? 'text-rose-500' : 'text-slate-400'}`}>{a.rid == null ? '현장추가' : a.rsvp === 'T' ? '△미정' : a.rsvp === 'X' ? '✕사전불참' : '미확인'}</span>}
                        <span className="min-w-0 truncate">{a.organization}</span>
                        <span className="shrink-0 font-mono">· {a.seat}{(a.seatedTime || a.arrivalTime) && ` · ${a.seatedTime || a.arrivalTime}`}</span>
                        {!a.intro && <span className="shrink-0 px-1 rounded border border-slate-300">소개×</span>}
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
// 체크 창 (카드 누르면) — 도착 · 내빈소개 · 인사말씀
// =====================================================================
function ActionSheet({ a, onClose, setStatus, toggleSpeech, toggleIntro, updateAttendee }) {
  const Big = ({ on, cls, onClick, children }) => (
    <button onClick={onClick} className={`w-full rounded-xl border-2 py-4 text-base font-bold flex flex-col items-center gap-1 transition ${on ? cls : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>{children}</button>
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
          <div className="col-span-2"><Big on={PRESENT.includes(a.status)} cls="bg-emerald-600 border-emerald-600 text-white" onClick={() => setStatus(a.id, PRESENT.includes(a.status) ? '미도착' : '도착')}>
            <span className="text-2xl">✅</span>{PRESENT.includes(a.status) ? '도착 완료 (누르면 취소)' : '도착'}{a.arrivalTime && <span className="text-[11px] font-mono opacity-80">{a.arrivalTime}</span>}
          </Big></div>
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
          <button onClick={() => setStatus(a.id, '불참')} className="btn btn-outline text-rose-600 border-rose-300">불참</button>
          <button onClick={() => setStatus(a.id, '미도착')} className="btn btn-outline"><RotateCcw className="w-3 h-3" />초기화</button>
          <button onClick={onClose} className="btn btn-dark ml-auto px-4">닫기</button>
        </div>
        {!present && a.speech && <div className="mt-2 text-[11px] text-rose-600 font-semibold">※ 인사말씀 대상인데 아직 도착 체크가 안 됐습니다.</div>}
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
      <div className="text-[10px] text-slate-500 pl-1 whitespace-nowrap">{label}</div>
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
  const BAR = { '착석': 'bg-emerald-500', '도착': 'bg-emerald-500', '미도착': 'bg-slate-300', '불참': 'bg-rose-400', '퇴장': 'bg-slate-300' };
  const TXT = { '착석': 'text-emerald-700', '도착': 'text-emerald-700', '미도착': 'text-slate-400', '불참': 'text-rose-600', '퇴장': 'text-slate-400' };
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
              <span className={`shrink-0 w-9 text-right text-[11px] font-bold ${TXT[a.status]}`}>{a.status === '미도착' ? '' : a.status}</span>
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
// 좌석 현황 — 오디토리움 VIP지정석 (무대 앞 가운데 좌·우 블록, 1열이 지정석)
// =====================================================================
function SeatView({ attendees, zones, seatMap, isAdmin, setStatus, assignSeat, setZones, applyProtocol, askUser, notify }) {
  const [q, setQ] = useState('');
  const [pickFor, setPickFor] = useState(null);   // 배정할 좌석 key
  const [sheet, setSheet] = useState(null);       // 눌러 연 좌석 key
  const [editRows, setEditRows] = useState(false);
  const byId = new Map(attendees.map(a => [a.id, a]));
  const qq = q.trim();
  const hitIds = new Set(qq ? attendees.filter(a => (a.name + a.organization).includes(qq)).map(a => a.id) : []);
  const occ = Object.entries(seatMap).filter(([, id]) => byId.has(id));
  const arrived = occ.filter(([, id]) => PRESENT.includes(byId.get(id).status)).length;

  const Seat = ({ z, r, c, vip }) => {
    const k = seatKey(z.id, r, c); const a = byId.get(seatMap[k]);
    const cls = a
      ? (PRESENT.includes(a.status) ? 'bg-emerald-600 text-white border-emerald-700' : a.status === '불참' ? 'bg-rose-50 text-rose-400 border-rose-300 line-through' : 'bg-white text-slate-800 border-slate-500')
      : 'bg-slate-50 text-slate-300 border-dashed border-slate-300';
    return (
      <button onClick={() => { if (a) setSheet(k); else if (isAdmin) setPickFor(k); }}
        title={a ? `${seatLabel(k)} ${a.name} ${a.position} · ${a.status}` : seatLabel(k)}
        className={`relative w-11 h-11 shrink-0 rounded-md border-2 flex flex-col items-center justify-center leading-none ${cls} ${vip ? 'ring-2 ring-rose-500 ring-offset-1' : ''} ${a && hitIds.has(a.id) ? 'ring-4 ring-fuchsia-500 animate-pulse' : ''}`}>
        {a ? (<><span className="text-[12px] font-bold">{a.name.slice(0, 3)}</span><span className="text-[8px] opacity-70 mt-0.5">{c}</span>{a.speech && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-violet-500 ring-1 ring-white" />}</>)
          : (<span className="text-[10px]">{c}</span>)}
      </button>
    );
  };
  const Block = ({ z }) => (
    <div className="space-y-1">
      {z.rows.map((n, ri) => (
        <div key={ri} className={`flex gap-1 ${z.id === 'L' ? 'justify-end' : 'justify-start'}`}>
          {Array.from({ length: n }, (_, i) => <Seat key={i} z={z} r={ri + 1} c={i + 1} vip={ri < (z.vip || 0)} />)}
        </div>
      ))}
    </div>
  );
  const L = zones.find(z => z.id === 'L') || zones[0], R = zones.find(z => z.id === 'R') || zones[1];
  const sheetA = sheet && byId.get(seatMap[sheet]);
  const totalSeats = seatKeysInOrder(zones).length;

  const doAuto = async () => {
    if (await askUser(`의전 순위대로 지정석 ${totalSeats}석을 자동 배정합니다.\n(불참 제외 · 1열 통로 쪽부터 우→좌 교대)\n지금 배정을 덮어씁니다. 계속할까요?`)) { applyProtocol(); notify('의전순으로 배정했습니다'); }
  };
  const doClear = async () => { if (await askUser('모든 좌석 배정을 비웁니다. 계속할까요?')) { Object.keys(seatMap).forEach(k => assignSeat(k, null)); notify('비웠습니다'); } };
  const setRowStr = (zid, str) => {
    const rows = str.split(',').map(x => parseInt(x.trim(), 10)).filter(n => n > 0 && n <= 20).slice(0, 8);
    if (!rows.length) return;
    setZones(zones.map(z => z.id === zid ? { ...z, rows } : z));
  };

  return (
    <div className="space-y-2">
      <div className="card p-3 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="section-title"><MapPin className="w-4 h-4" />VIP 지정석</h2>
          <span className="text-xs text-slate-500 tabular-nums">배정 {occ.length}/{totalSeats}석 · 도착 <b className="text-emerald-700">{arrived}</b></span>
          <div className="relative flex-1 min-w-[120px] max-w-[220px] ml-auto">
            <Search className="w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="이름으로 찾기" className="w-full border border-slate-300 rounded-md pl-7 pr-2 py-1.5 text-sm" />
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-1.5">
            <button onClick={doAuto} className="btn btn-primary">의전순 자동 배정</button>
            <button onClick={doClear} className="btn btn-outline">전체 비우기</button>
            <button onClick={() => setEditRows(v => !v)} className={`btn ${editRows ? 'btn-dark' : 'btn-outline'}`}>열 구성</button>
            <span className="text-[11px] text-slate-500">빈 좌석을 누르면 배정, 배정된 좌석을 누르면 도착 체크·변경.</span>
          </div>
        )}
        {editRows && isAdmin && (
          <div className="flex flex-wrap gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs">
            {[L, R].map(z => (
              <label key={z.id} className="flex items-center gap-1.5">{z.name} 열별 좌석 수
                <input defaultValue={z.rows.join(', ')} onBlur={e => setRowStr(z.id, e.target.value)} className="w-28 border border-slate-300 rounded px-2 py-1 bg-white" />
              </label>
            ))}
            <span className="text-slate-500 w-full">쉼표로 열별 좌석 수를 적습니다(예: 6, 7, 8 = 1열 6석·2열 7석·3열 8석). 실제 홀과 다르면 여기서 맞추세요.</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border-2 bg-emerald-600 border-emerald-700" />도착</span>
          <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border-2 bg-white border-slate-500" />배정(도착 전)</span>
          <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border-2 bg-rose-50 border-rose-300" />불참</span>
          <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded border-2 border-dashed bg-slate-50 border-slate-300" />빈 좌석</span>
          <span className="inline-flex items-center gap-1"><span className="w-3.5 h-3.5 rounded ring-2 ring-rose-500" />1열 = VIP지정석</span>
        </div>
      </div>

      <div className="card p-3 overflow-x-auto">
        <div className="w-max mx-auto">
          <div className="stage text-sm py-2 px-10">무 대 · LED SCREEN</div>
          <div className="text-center my-1"><span className="inline-block text-[10px] font-bold text-white bg-violet-700 rounded px-2 py-0.5">VIP내빈</span></div>
          <div className="flex items-start gap-5 justify-center">
            <div><Block z={L} /><div className="text-center text-[10px] text-slate-400 mt-1">{L.name}</div></div>
            <div className="self-stretch flex flex-col items-center justify-center text-[9px] text-slate-300 px-0.5"><span className="flex-1 border-l border-dashed border-slate-300" />통로<span className="flex-1 border-l border-dashed border-slate-300" /></div>
            <div><Block z={R} /><div className="text-center text-[10px] text-slate-400 mt-1">{R.name}</div></div>
          </div>
          <div className="text-center text-[10px] text-slate-400 mt-2">객석 뒤쪽(일반석은 자유석) · 좌석 번호는 각 블록 왼쪽부터 1번</div>
        </div>
      </div>

      {/* 배정 창 */}
      {pickFor && <SeatPicker seatKeyStr={pickFor} attendees={attendees} seatMap={seatMap} onClose={() => setPickFor(null)}
        onPick={(id) => { assignSeat(pickFor, id); setPickFor(null); notify(`${byId.get(id)?.name || ''}님을 ${seatLabel(pickFor)}에 배정했습니다`); }} />}

      {/* 좌석 상세 창 */}
      {sheet && sheetA && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={() => setSheet(null)}>
          <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-4 w-full max-w-sm shadow-2xl">
            <div className="flex items-start gap-2">
              <div className="min-w-0"><div className="text-xl font-bold">{sheetA.name} <span className="text-sm font-medium text-slate-600">{sheetA.position}</span></div>
                <div className="text-xs text-slate-500 truncate">{sheetA.organization} · <b>{seatLabel(sheet)}</b></div></div>
              <span className="ml-auto shrink-0"><StatusChip status={sheetA.status} /></span>
            </div>
            {isAdmin ? (
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => { setStatus(sheetA.id, PRESENT.includes(sheetA.status) ? '미도착' : '도착'); }} className={`col-span-2 rounded-xl border-2 py-3 text-base font-bold ${PRESENT.includes(sheetA.status) ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-slate-300 text-slate-600'}`}>✅ {PRESENT.includes(sheetA.status) ? '도착 완료 (누르면 취소)' : '도착'}</button>
                <button onClick={() => setStatus(sheetA.id, '불참')} className="btn btn-outline justify-center py-2 text-rose-600 border-rose-300">불참</button>
                <button onClick={() => { assignSeat(sheet, null); setSheet(null); }} className="btn btn-outline justify-center py-2">자리 비우기</button>
                <button onClick={() => { setPickFor(sheet); setSheet(null); }} className="btn btn-outline justify-center py-2">다른 분 배정</button>
                <button onClick={() => setSheet(null)} className="btn btn-dark justify-center py-2">닫기</button>
              </div>
            ) : <button onClick={() => setSheet(null)} className="btn btn-dark w-full justify-center mt-3 py-2">닫기</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function SeatPicker({ seatKeyStr, attendees, seatMap, onClose, onPick }) {
  const [q, setQ] = useState('');
  const qq = q.trim();
  const seatOf = {}; Object.entries(seatMap).forEach(([k, id]) => { seatOf[id] = seatLabel(k); });
  const list = [...attendees].sort(byRank).filter(a => a.status !== '불참').filter(a => !qq || (a.name + a.organization + a.position).includes(qq)).slice(0, 30);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-3 pt-14 sm:pt-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-4 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2"><h3 className="font-bold text-sm">{seatLabel(seatKeyStr)} 좌석에 배정</h3><button onClick={onClose} className="ml-auto text-slate-400"><X className="w-5 h-5" /></button></div>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="이름·소속 검색 (의전순 표시)" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2" />
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden">
          {list.map(a => (
            <button key={a.id} onClick={() => onPick(a.id)} className="w-full text-left px-2.5 py-2 flex items-center gap-2 hover:bg-slate-50">
              <span className="shrink-0 w-7 text-center text-[11px] font-bold text-indigo-600 tabular-nums">{rankOf(a) === 999 ? '-' : rankOf(a)}</span>
              <span className="min-w-0 flex-1"><b className="text-[14px]">{a.name}</b> <span className="text-xs text-slate-600">{a.position}</span><span className="block text-[11px] text-slate-400 truncate">{a.organization}</span></span>
              {seatOf[a.id] && <span className="shrink-0 text-[10px] text-amber-600 font-bold">{seatOf[a.id]} → 이동</span>}
              <StatusChip status={a.status} small />
            </button>
          ))}
        </div>
      </div>
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
  const ST_ORDER = { '도착': 0, '착석': 0, '미도착': 1, '불참': 3, '퇴장': 4 };
  const RSVP_ORDER = { O: 0, T: 1, '': 2, X: 3 };
  const sorter = { rank: byRank, reg: (x, y) => x.id - y.id, seat: (x, y) => (x.seat || '~').localeCompare(y.seat || '~'), name: (x, y) => x.name.localeCompare(y.name, 'ko'), status: (x, y) => ST_ORDER[x.status] - ST_ORDER[y.status] || byRank(x, y), rsvp: (x, y) => RSVP_ORDER[x.rsvp ?? ''] - RSVP_ORDER[y.rsvp ?? ''] || byRank(x, y) }[sort];
  const shown = attendees.filter(a => !q.trim() || `${a.name}${a.organization}${a.position}${a.category}${a.seat}`.includes(q.trim())).sort(sorter);
  const doProtocol = async () => { if (await askUser('의전 순위대로 맞춥니다.\n· 내빈 소개·인사말씀 순서를 의전순으로\n· VIP지정석을 1열 통로 쪽부터 자동 배정(불참 제외)\n\n지금 순서와 좌석 배정이 바뀝니다. 계속할까요?')) { applyProtocol(); notify('의전순으로 맞췄습니다'); } };
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
    const head = ['의전', '구분', '소속', '직위', '성명', '등급', '좌석', '상태', '도착시각', '인사말씀', '소개', '비고'];
    const rows = [...attendees].sort(byRank).map((a, i) => [rankOf(a) === 999 ? '' : rankOf(a), a.category, a.organization, a.position, a.name, a.grade, a.seat, a.status, a.arrivalTime || '', a.speech ? a.speechType : '', a.intro ? 'Y' : '', a.note]);
    const csv = '﻿' + [head, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `내빈현황_${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  const resetStatus = async () => { if (await askUser('모든 내빈의 도착·불참 체크를 지웁니다. 계속할까요?')) patch(s => ({ attendees: s.attendees.map(a => ({ ...a, status: '미도착', arrivalTime: null, seatedTime: null })) })); };

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
            <button onClick={resetStatus} className="text-xs px-2 py-1.5 rounded border border-rose-300 text-rose-600 flex items-center gap-1"><RotateCcw className="w-3 h-3" />상태 초기화</button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-1.5 overflow-x-auto text-xs">
        <span className="text-slate-500 shrink-0">정렬</span>
        {[['rank', '의전순'], ['status', '도착 먼저'], ['rsvp', '사전참석(○) 먼저'], ['seat', '좌석순'], ['name', '가나다순'], ['reg', '등록순']].map(([k, l]) => (
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
          <div key={a.id} className={`rounded-md border border-l-4 pl-2 pr-1.5 py-1 ${PRESENT.includes(a.status) ? 'border-l-emerald-500 bg-emerald-50/50' : a.status === '불참' ? 'border-l-rose-400' : 'border-l-slate-300'} border-slate-200`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0 text-[11px] font-bold text-indigo-600 tabular-nums w-5">{rankOf(a) === 999 ? '-' : rankOf(a)}</span>
              <span className="shrink-0 text-[16px] font-bold leading-tight">{a.name}</span>
              <span className="shrink-0 text-[12px] text-slate-700">{a.position}</span>
              <span className="min-w-0 truncate text-[11px] text-slate-400"><b className="text-slate-600">{a.grade}</b>{a.rsvp === 'T' ? <span className="text-amber-600"> △</span> : a.rsvp === 'X' ? <span className="text-rose-500"> ✕</span> : a.rsvp === '' ? ' –' : ''} · {a.organization}{a.seat ? ` · ${a.seat}` : ''}</span>
              <span className="ml-auto shrink-0"><StatusChip status={a.status} small /></span>
              <button onClick={() => setEdit(a.id)} className="shrink-0 p-1 text-slate-400"><Pencil className="w-3.5 h-3.5" /></button>
            </div>
            <div className="flex items-center gap-1 mt-1">
              {[['도착', 'bg-emerald-600 border-emerald-600 text-white'], ['불참', 'bg-white border-rose-300 text-rose-600'], ['미도착', 'bg-white border-slate-300 text-slate-500']].map(([st, cls]) => (
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
 · 참석 : ${stats.present}명 (${stats.rate}%) 
 · 불참 ${stats.absent}명

▣ 인사말씀 (${speakers.length}명)
${speakers.map((a, i) => ` ${i + 1}. ${a.speechType} — ${honor(a)} [${a.status}]`).join('\n')}

▣ 불참 내빈
${attendees.filter(a => a.status === '불참').map(a => ` · ${honor(a)} (${a.status})`).join('\n') || ' · 없음'}`;
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
function QuickAddModal({ onClose, attendees, onAdd, onAddRoster }) {
  const [q, setQ] = useState('');
  const [manual, setManual] = useState(false);
  const [f, setF] = useState({ name: '', position: '', organization: '', grade: '기타', rank: 999, speech: false, speechType: '축사' });
  const inp = 'w-full border border-slate-300 rounded-md px-2 py-2 text-sm';
  const qq = q.trim().replace(/\s/g, '');
  const hits = qq.length >= 1 ? ROSTER.map((r, i) => ({ r, i })).filter(({ r }) => (r[4] + r[2] + r[3]).replace(/\s/g, '').includes(qq)).slice(0, 10) : [];
  const inList = new Map(attendees.filter(a => a.rid != null && a.rid >= 0).map(a => [a.rid, a]));
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start sm:items-center justify-center p-3 pt-14 sm:pt-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl p-4 w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-2"><UserPlus className="w-4 h-4 text-amber-500" /><h3 className="font-bold text-sm">내빈 추가 · 도착 등록</h3><button type="button" onClick={onClose} className="ml-auto text-slate-400"><X className="w-5 h-5" /></button></div>
        {!manual && (
          <>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="이름을 입력하세요 (초청명단 1,049명 검색)" className="w-full border-2 border-slate-300 rounded-lg pl-8 pr-2 py-2.5 text-base" />
            </div>
            <div className="mt-2 divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden empty:border-0">
              {hits.map(({ r, i }) => {
                const ex = inList.get(i); const gs = GRADE_STYLES[r[0]] || GRADE_STYLES['기타'];
                return (
                  <button key={i} onClick={() => onAddRoster(i)} className="w-full text-left px-2.5 py-2 flex items-center gap-2 hover:bg-slate-50 active:bg-slate-100">
                    <span className={`shrink-0 w-8 text-center text-[10px] font-bold text-white rounded py-0.5 ${gs.bg}`}>{r[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-1.5"><b className="text-[15px]">{r[4]}</b><span className="text-xs text-slate-600 truncate">{r[3]}</span></span>
                      <span className="block text-[11px] text-slate-400 truncate">{r[2]}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className={`block text-[10px] font-semibold ${r[5] === 'O' ? 'text-emerald-600' : r[5] === 'X' ? 'text-rose-500' : r[5] === 'T' ? 'text-amber-600' : 'text-slate-400'}`}>{MARK_TXT[r[5]]}</span>
                      {ex ? <StatusChip status={ex.status} small /> : <span className="text-[10px] text-indigo-600 font-bold">누르면 도착 ›</span>}
                    </span>
                  </button>
                );
              })}
              {qq && !hits.length && <div className="px-3 py-4 text-center text-xs text-slate-400">초청명단에서 찾지 못했습니다</div>}
            </div>
            {!qq && <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">갑자기 오신 분도 이름만 치면 됩니다. 사전 불참(✕)·미확인 인사도 전체 초청명단에서 찾아 소속·직위가 채워진 채 도착 처리됩니다.</p>}
            <button onClick={() => { setManual(true); setF(v => ({ ...v, name: q.trim() })); }} className="mt-2 w-full btn btn-outline justify-center py-2.5">명단에 없는 분 → 새로 입력</button>
          </>
        )}
        {manual && (
          <form onSubmit={e => { e.preventDefault(); if (!f.name.trim()) return; onAdd({ ...f }); }} className="grid grid-cols-2 gap-2">
            <label className="col-span-2"><span className="text-[11px] text-slate-500">성명 *</span><input autoFocus className={inp} value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /></label>
            <label><span className="text-[11px] text-slate-500">직위</span><input className={inp} value={f.position} onChange={e => setF({ ...f, position: e.target.value })} /></label>
            <label><span className="text-[11px] text-slate-500">소속</span><input className={inp} value={f.organization} onChange={e => setF({ ...f, organization: e.target.value })} /></label>
            <label><span className="text-[11px] text-slate-500">등급</span><select className={inp} value={f.grade} onChange={e => setF({ ...f, grade: e.target.value })}>{GRADES.map(g => <option key={g}>{g}</option>)}</select></label>
            <label><span className="text-[11px] text-slate-500">의전 순위</span><input type="number" min="1" className={inp} value={f.rank} onChange={e => setF({ ...f, rank: Number(e.target.value) })} /></label>
            <label className="col-span-2 flex items-center gap-2 text-xs mt-1"><input type="checkbox" checked={f.speech} onChange={e => setF({ ...f, speech: e.target.checked })} className="accent-violet-600" />인사말씀 대상
              {f.speech && <select className="text-xs border border-violet-300 rounded px-1 py-0.5" value={f.speechType} onChange={e => setF({ ...f, speechType: e.target.value })}>{SPEECH_TYPES.map(t => <option key={t}>{t}</option>)}</select>}</label>
            <div className="col-span-2 flex gap-2 mt-2"><button className="btn btn-primary flex-1 justify-center py-2.5">도착으로 추가</button><button type="button" onClick={() => setManual(false)} className="btn btn-outline">← 검색으로</button></div>
          </form>
        )}
      </div>
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
          <tbody>{speakers.map((a, i) => <tr key={a.id}><td className="border border-black px-2 py-1.5 text-center font-bold">{i + 1}</td><td className="border border-black px-2 py-1.5 text-center font-bold">{a.speechType}</td><td className="border border-black px-2 py-1.5">{a.organization}</td><td className="border border-black px-2 py-1.5">{a.position}</td><td className="border border-black px-2 py-1.5 font-bold text-base">{a.name}</td><td className="border border-black px-2 py-1.5 text-center">{PRESENT.includes(a.status) ? '○' : a.status === '불참' ? '불참' : ''}</td><td className="border border-black px-2 py-1.5 text-xs">{a.note}</td></tr>)}</tbody>
        </table>
      ) : (
        <table className="w-full text-xs border-collapse">
          <thead><tr className="bg-slate-100"><th className="border border-black px-1 py-1 w-8">순</th><th className="border border-black px-1 py-1 w-24">구분</th><th className="border border-black px-1 py-1">소속</th><th className="border border-black px-1 py-1">직위</th><th className="border border-black px-1 py-1 w-16">성명</th><th className="border border-black px-1 py-1 w-12">좌석</th><th className="border border-black px-1 py-1 w-10">참석</th></tr></thead>
          <tbody>{intros.map((a, i) => <tr key={a.id}><td className="border border-black px-1 py-0.5 text-center">{i + 1}</td><td className="border border-black px-1 py-0.5">{a.category}</td><td className="border border-black px-1 py-0.5">{a.organization}</td><td className="border border-black px-1 py-0.5">{a.position}</td><td className="border border-black px-1 py-0.5 font-bold">{a.name}</td><td className="border border-black px-1 py-0.5 text-center font-mono">{a.seat}</td><td className="border border-black px-1 py-0.5 text-center">{PRESENT.includes(a.status) ? '○' : a.status === '불참' ? '불참' : ''}</td></tr>)}</tbody>
        </table>
      )}
      <div className="mt-3 text-xs">
        {mode === 'speech' && <div className="font-bold mb-1">[사회자 멘트 — 참석자 기준]</div>}
        {mode === 'speech' && speakers.filter(a => PRESENT.includes(a.status)).map((a, i) => <div key={a.id} className="mb-1">{i + 1}. 다음은 {honor(a)}의 {a.speechType}{iga(a.speechType)} 있겠습니다. 큰 박수로 맞아 주시기 바랍니다.</div>)}
        {mode === 'speech' && speakers.some(a => !PRESENT.includes(a.status)) && <div className="mt-2 font-bold">※ 도착 체크 안 됨(멘트 제외): {speakers.filter(a => !PRESENT.includes(a.status)).map(a => `${a.name} ${a.position}(${a.speechType})`).join(', ')}</div>}
        <div className="mt-2 text-[10px] text-slate-500">※ 참석란 ○=도착. 화성특례시 AI스마트전략실</div>
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
          {F({ k: 'seat', label: '좌석 표시(배정은 좌석 탭에서)', mono: true })}
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
const buildKakaoReport = ({ stats, attendees, event, speechOrder, kind }) => {
  const d = new Date(); const wd = '일월화수목금토'[d.getDay()];
  const stamp = `${d.getMonth() + 1}.${d.getDate()}.(${wd}) ${nowHM()}`;
  const speakers = speakerList(attendees, speechOrder);
  const present = attendees.filter(a => PRESENT.includes(a.status)).sort(byRank);
  const absent = attendees.filter(a => a.status === '불참').sort(byRank);
  const who = a => `${a.name} ${a.position}(${a.organization})`;
  const title = { all: '내빈 현황', present: '참석 내빈', absent: '불참 내빈', speech: '인사말씀' }[kind];
  const head = [`[${event.name} ${title}]`, `${stamp} 기준`, ''];
  const sum = [`■ 예정 ${stats.total}명 · 참석 ${stats.present}명(${stats.rate}%) · 불참 ${stats.absent}명`];
  const pBlock = [`■ 참석 ${present.length}명`, ...(present.length ? present.map((a, i) => ` ${i + 1}. ${who(a)}`) : [' · 없음'])];
  const aBlock = [`■ 불참 ${absent.length}명`, ...(absent.length ? absent.map((a, i) => ` ${i + 1}. ${who(a)}`) : [' · 없음'])];
  const sBlock = [`■ 인사말씀 ${stats.speakersPresent}/${stats.speakers}명 도착`, ...speakers.map((a, i) => ` ${i + 1}) ${a.speechType} ${a.name} ${a.position}${PRESENT.includes(a.status) ? ' — 도착 ✔' : a.status === '불참' ? ' — 불참' : ''}`)];
  const body = kind === 'present' ? [...sum, '', ...pBlock]
    : kind === 'absent' ? [...sum, '', ...aBlock]
    : kind === 'speech' ? sBlock
    : [...sum, '', ...sBlock, '', ...pBlock, '', ...aBlock];
  return [...head, ...body, '', '※ AI스마트전략실 내빈 운영 현황'].join('\n');
};

function KakaoReportModal({ onClose, stats, attendees, event, speechOrder, notify }) {
  const [kind, setKind] = useState('all');
  const [text, setText] = useState('');
  const [touched, setTouched] = useState(false);
  useEffect(() => { if (!touched) setText(buildKakaoReport({ stats, attendees, event, speechOrder, kind })); }, [kind, stats, attendees, touched]);
  const canShare = typeof navigator !== 'undefined' && !!navigator.share && !EMBEDDED;
  const copy = async () => { try { await navigator.clipboard.writeText(text); notify('복사했습니다. 카톡 대화방에 붙여넣으세요'); } catch { document.getElementById('kakao-text')?.select(); notify('글자가 선택되었습니다. 길게 눌러 복사하세요'); } };
  const share = async () => { if (!canShare) return copy(); try { await navigator.share({ text }); } catch (e) { if (e?.name !== 'AbortError') copy(); } };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="bg-[#FEE500] px-4 py-3 flex items-center gap-2"><MessageCircle className="w-5 h-5" /><h3 className="font-bold text-[#191919]">카톡 중간보고</h3><button onClick={onClose} className="ml-auto"><X className="w-5 h-5" /></button></div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex w-full rounded-md border border-slate-300 overflow-hidden text-xs font-semibold">
              {[['all', `전체`], ['present', `참석 ${stats.present}`], ['absent', `불참 ${stats.absent}`], ['speech', `인사말씀 ${stats.speakersPresent}/${stats.speakers}`]].map(([k, l]) => (
                <button key={k} onClick={() => { setKind(k); setTouched(false); }} className={`flex-1 px-2 py-1.5 whitespace-nowrap ${kind === k ? 'bg-slate-900 text-white' : 'bg-white'}`}>{l}</button>
              ))}
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

// =====================================================================
// 안내 (사용 설명서)
// =====================================================================
// 안내 탭 부품 — 화면 갱신(4초)에도 펼친 상태가 유지되도록 바깥에 둠
function GuideSec({ id, title, open, children }) {
  const key = 'mars-guide-' + id;
  const [isOpen, setOpen] = useState(() => { const v = lsSafe.get(key, null); return v == null ? !!open : v === '1'; });
  const toggle = () => setOpen(v => { lsSafe.set(key, v ? '0' : '1'); return !v; });
  return (
    <div className="card">
      <button onClick={toggle} className="w-full text-left px-3 py-2.5 flex items-center gap-2 font-bold text-sm">
        <span className={`text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`}>▸</span>{title}
      </button>
      {isOpen && <div className="px-4 pb-3 text-[13px] leading-relaxed text-slate-700 space-y-2">{children}</div>}
    </div>
  );
}
function GuideTable({ rows, head }) {
  return (
    <div className="overflow-x-auto"><table className="w-full text-[12px] border-collapse">
      {head && <thead><tr className="bg-slate-100">{head.map(h => <th key={h} className="border border-slate-200 px-2 py-1 text-left whitespace-nowrap">{h}</th>)}</tr></thead>}
      <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`border border-slate-200 px-2 py-1 align-top ${j === 0 ? 'font-semibold whitespace-nowrap bg-slate-50' : ''}`}>{c}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
function GuideView({ state, stats, sync, isAdmin }) {
  const kb = Math.round(JSON.stringify(stripLocal(state)).length / 1024);
  return (
    <div className="space-y-2 max-w-3xl">
      <div className="card px-3 py-2 text-[12px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
        <span>판 <b>v{APP_VERSION}</b></span>
        <span>공유 <b className={sync.status === '연결됨' ? 'text-emerald-700' : 'text-rose-600'}>{sync.on ? sync.status : '꺼짐'}</b>{sync.at && ` (${sync.at})`}</span>
        <span>등록 내빈 <b>{stats.total}명</b></span>
        <span>공유 자료 크기 <b>{kb}KB</b></span>
      </div>

      <GuideSec id="about" title="1. 이 플랫폼은" open>
        <p>AI EXPO 「MARS 2026」 개막식(2026. 11. 3.) <b>내빈 도착 확인 · 내빈 소개 · 인사말씀 순서 · VIP지정석</b>을 여러 사람이 핸드폰으로 함께 관리하는 화면입니다. 초청명단 1,049명 중 참석(○)·미정(△) 회신 인사와 VIP 등급 전원인 <b>예정 명단 약 182명</b>이 화면에 보이고, 나머지는 「추가」에서 이름만 치면 올라옵니다.</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li><b>링크 하나로 공유</b>: 설치·회원가입 없이 주소만 열면 됩니다. 핸드폰·태블릿·노트북 모두 같은 자료를 봅니다(4초 간격 갱신).</li>
          <li><b>관리자 / 조회 구분</b>: 비밀번호를 넣은 사람만 체크·수정할 수 있고, 나머지는 보기만 합니다.</li>
          <li><b>의전 순서 반영</b>: 의전 순위에 따라 내빈 소개·인사말씀 순서와 좌석(1열 가운데 상석)을 한 번에 맞춥니다.</li>
          <li><b>사회자 멘트·인쇄·카톡 보고</b>: 도착한 사람 기준으로 멘트가 자동 작성되고, A4 인쇄와 카톡 중간보고(전체·참석·불참·인사말씀)가 됩니다.</li>
          <li><b>현장 와이파이 대비</b>: 연결이 끊겨도 체크는 기기에 보관되고, 다시 연결되면 자동으로 올라갑니다.</li>
        </ul>
      </GuideSec>

      <GuideSec id="howto" title="2. 사용법" open={isAdmin}>
        <p className="font-bold">① 조회만 하는 분(사회자·수행비서 등)</p>
        <ul className="list-disc pl-5"><li>링크를 열면 끝입니다. <b>현황판</b>에서 도착 인원과 명단, <b>인사말씀·소개</b>에서 순서와 멘트를 봅니다.</li></ul>
        <p className="font-bold pt-1">② 관리자(체크 담당)</p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>오른쪽 위 <b>「관리자」</b> → 비밀번호 입력. 「이 기기에서 계속 관리자로 유지」를 켜 두면 다시 열어도 유지됩니다.</li>
          <li><b>도착 체크</b>: 현황판에서 이름 카드를 누름 → 「도착」. 내빈 관리 탭에서는 카드의 「도착」 단추를 바로 눌러도 됩니다. 다시 누르면 취소.</li>
          <li><b>불참</b>: 체크 창 또는 내빈 관리의 「불참」. 잘못 눌렀으면 「초기화」.</li>
          <li><b>갑자기 오신 분</b>: 머리글 <b>「추가」</b> → 이름 검색 → 초청명단 1,049명에서 소속·직위가 채워진 채 도착 등록. 명단에 없으면 「새로 입력」.</li>
          <li><b>VIP지정석</b>: 좌석 탭에서 「의전순 자동 배정」 또는 빈 좌석을 눌러 직접 배정. 1열(빨간 테두리)이 지정석입니다. 열별 좌석 수는 「열 구성」에서 실제 홀에 맞게 바꿉니다.</li>
          <li><b>인사말씀 지정</b>: 체크 창의 「인사말씀」 또는 인사말씀·소개 탭의 「대상 추가」. 순서는 줄을 누르고 → 들어갈 자리를 누르면 바뀝니다.</li>
          <li><b>인쇄</b>: 현황판 「인사말씀 인쇄」(노트북 크롬 권장). 도착한 사람만 멘트에 들어가고, 도착 체크가 안 된 대상은 아래에 따로 표시됩니다.</li>
          <li><b>카톡 보고</b>: 머리글 「보고」 → 전체·참석·불참·인사말씀 중 선택 → 「카톡으로 보내기」 또는 「복사」 후 대화방에 붙여넣기.</li>
        </ul>
        <p className="font-bold pt-1">③ 일정별 할 일</p>
        <GuideTable head={['시점', '할 일']} rows={[
          ['지금 ~ 11. 2.', '3차 RSVP 반영(내빈 관리 → 더보기 → 엑셀 붙여넣기 또는 1명씩) → 의전 담당 확인 → 「의전순 적용」 → 관리자 비밀번호 변경'],
          ['11. 2.(월) 리허설', '관리자 핸드폰 2대로 도착 체크 → 노트북에서 인쇄·카톡 보고 시험 → 설정 「백업 파일 내려받기」'],
          ['11. 3.(화) 아침', '내빈 관리 → 더보기 → 「상태 초기화」(시험 기록 삭제) → 운영진에게 링크·비밀번호 공유'],
          ['행사 중', '도착 체크 → 11:15쯤 인사말씀 인쇄해 사회자 전달 → 필요 시 카톡 중간보고'],
          ['행사 후', '결과 요약 복사(보고용) · 엑셀(CSV) 저장 → 정리(아래 6번)'],
        ]} />
      </GuideSec>

      <GuideSec id="caution" title="3. 유의사항">
        <ul className="list-disc pl-5 space-y-0.5">
          <li><b>비밀번호</b>: 영문+숫자 6자리 이상으로 바꾸고 관리자에게만 알려 주세요. 바꾸면 다른 관리자 기기는 자동으로 조회 모드가 되어 새 비밀번호로 다시 입장해야 합니다.</li>
          <li><b>링크 공유 범위</b>: 링크를 아는 사람은 누구나 내빈 명단(이름·직위·소속)을 볼 수 있습니다. 운영진 대화방 등 필요한 범위에만 공유하세요.</li>
          <li><b>빨간 띠 「서버 연결 끊김」</b>이 뜨면 와이파이·데이터를 확인하세요. 체크는 사라지지 않고 연결되면 자동으로 올라갑니다.</li>
          <li><b>파란 띠 「새 버전」</b>이 뜨면 「새로고침」을 눌러 주세요.</li>
          <li><b>카카오톡 안에서 링크를 열면</b> 「카톡으로 보내기」·인쇄가 막힐 수 있습니다. 크롬·삼성 인터넷으로 여세요.</li>
          <li><b>크롬 자동 번역은 꺼 주세요.</b> 화면이 깨질 수 있습니다.</li>
          <li>예전에 내려받은 HTML 파일은 서버에 저장되지 않습니다. 반드시 Vercel 주소를 쓰세요.</li>
        </ul>
      </GuideSec>

      <GuideSec id="cost" title="4. 사용 기간 · 비용">
        <p><b>비용은 들지 않습니다.</b> Vercel(화면)은 무료 Hobby 요금제, Supabase(자료 저장)는 무료 Free 요금제입니다. 두 요금제 모두 사용량에 따른 추가 요금이 없어서, 한도를 넘으면 <b>요금이 청구되는 대신 해당 기능이 멈춥니다.</b> 유료 요금제로 직접 바꾸지 않는 한 비용은 생기지 않습니다.</p>
        <GuideTable head={['구분', '무료 한도(월)', '이번 행사 예상 사용량', '한도를 넘으면']} rows={[
          ['Vercel (화면 전송)', '데이터 전송 100GB · 요청 100만 건', '50명 × 수십 회 접속 ≈ 0.1GB 안팎', '최대 30일 정지(요금 없음)'],
          ['Supabase (공유 자료)', '데이터 송신 5GB · 저장 500MB', '50명 3시간 사용 ≈ 0.3GB 안팎 · 저장 약 ' + kb + 'KB', '서비스 제한(요금 없음)'],
        ]} />
        <ul className="list-disc pl-5 space-y-0.5">
          <li><b>사용 가능 기간</b>: 11. 5.(목)까지는 물론 그 이후에도 무료 한도 안에서 계속 쓸 수 있습니다. 별도 만료일은 없습니다.</li>
          <li><b>주의 — 7일 미사용 시 잠듦</b>: Supabase 무료 프로젝트는 <b>7일 동안 아무도 열지 않으면 일시정지</b>됩니다. 행사 전 리허설(11. 2.) 때 한 번 열면 됩니다. 잠들었으면 Supabase 대시보드에서 다시 켤 수 있고 자료는 남아 있습니다.</li>
          <li><b>사용량 줄이는 설계</b>: 4초마다 「바뀐 게 있나」만 확인(수십 바이트)하고, 바뀐 경우에만 전체 자료를 받습니다. 화면이 꺼진 핸드폰은 확인도 멈춥니다.</li>
          <li><b>참고</b>: Vercel 무료(Hobby) 요금제는 원칙적으로 개인·비상업 용도입니다. 시 공식 사업으로 계속 운영하려면 유료 요금제나 시 서버 이관을 검토하세요.</li>
          <li className="text-[11px] text-slate-500">한도는 2026년 10월 확인 기준이며 서비스 회사 사정에 따라 바뀔 수 있습니다.</li>
        </ul>
      </GuideSec>

      <GuideSec id="arch" title="5. 만들어진 구조">
        <pre className="text-[11px] leading-snug bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto whitespace-pre">{`[핸드폰·태블릿·노트북 (브라우저)]
   │  ① 화면 내려받기 (최초 1회)
   ▼
[Vercel]  ← 깃허브 저장소(tkooya-09/hs-AI-envnt)에 올리면 자동 배포
   │
   │  ② 4초마다 "바뀐 게 있나?" 확인 → 바뀌면 자료 받기
   │  ③ 관리자가 체크하면 비밀번호와 함께 저장 요청
   ▼
[Supabase]  공유 자료 1건(행사 전체 자료) · 비밀번호는 서버에만 보관`}</pre>
        <GuideTable rows={[
          ['화면', 'React + Vite로 만든 한 페이지 웹 화면, Vercel에서 배포'],
          ['공유 저장소', 'Supabase(PostgreSQL) 표 1개, 행사 자료를 한 묶음(JSON)으로 저장'],
          ['권한', '읽기는 누구나 · 쓰기는 비밀번호가 맞을 때만 서버가 허용 · 비밀번호 칸은 아무도 읽을 수 없음'],
          ['동시 수정', '사람(내빈)별로 마지막 수정 시각을 비교해 합치므로, 여러 명이 동시에 체크해도 서로 지워지지 않음'],
          ['기기 저장', '각 기기에도 사본을 보관 → 연결이 끊겨도 화면·체크 유지, 복구되면 자동 반영'],
          ['기기별 설정', '좌석 배치도 보기(한 열 좌석 수 등)·글자 크기는 기기마다 따로'],
        ]} />
      </GuideSec>

      <GuideSec id="after" title="6. 행사 후 정리 (개인정보)">
        <ul className="list-disc pl-5 space-y-0.5">
          <li>결과 요약 복사 · 엑셀(CSV) 저장 · 설정 「백업 파일 내려받기」로 기록을 남깁니다.</li>
          <li>보관이 끝나면 설정 「초기 자료로 되돌리기」로 공유 자료를 비우거나, 링크 공유를 중단하세요.</li>
          <li>다음 행사에 다시 쓰려면 내빈 명단만 엑셀 붙여넣기로 바꾸면 됩니다.</li>
        </ul>
      </GuideSec>

      <div className="text-[11px] text-slate-400 px-1">문의: AI스마트전략실(AI전략팀) ☎ 3652</div>
    </div>
  );
}

// =====================================================================
// 입장 선택 (참관인 / 관리자)
// =====================================================================
function RoleGate({ event, onViewer, onAdmin }) {
  return (
    <div className="fixed inset-0 z-[70] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-5">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center shadow-lg mb-3"><Crown className="w-8 h-8" /></div>
        <div className="text-white text-xl font-bold leading-tight">{event.name}</div>
        <div className="text-slate-300 text-sm mb-6">{event.date} · {event.place}</div>
        <div className="space-y-3">
          <button onClick={onViewer} className="w-full rounded-2xl bg-white p-4 text-left shadow-xl active:scale-[0.99] transition">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center"><Eye className="w-6 h-6" /></span>
              <span><b className="block text-base">참관인으로 보기</b><span className="text-xs text-slate-500">비밀번호 없이 실시간 현황 조회</span></span>
              <span className="ml-auto text-slate-300 text-xl">›</span>
            </div>
          </button>
          <button onClick={onAdmin} className="w-full rounded-2xl bg-rose-600 p-4 text-left shadow-xl active:scale-[0.99] transition">
            <div className="flex items-center gap-3">
              <span className="w-11 h-11 shrink-0 rounded-xl bg-white/20 text-white flex items-center justify-center"><Lock className="w-6 h-6" /></span>
              <span className="text-white"><b className="block text-base">운영진(관리자) 입장</b><span className="text-xs text-rose-100">비밀번호 입력 · 도착 체크와 수정 가능</span></span>
              <span className="ml-auto text-rose-200 text-xl">›</span>
            </div>
          </button>
        </div>
        <div className="text-[11px] text-slate-400 mt-5">화성특례시 AI스마트전략실 · 내빈 운영 플랫폼</div>
      </div>
    </div>
  );
}
