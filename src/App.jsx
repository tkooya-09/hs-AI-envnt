import React, { useState, useMemo } from 'react';
import { Upload, Search, Users, Crown, Star, UserCheck, Briefcase, MapPin, Car, Building2, Clock, CheckCircle2, AlertCircle, BarChart3, Smartphone, Trophy, FileText, Filter, Bell, X, ChevronRight, TrendingUp, Share2, Copy, Check, MessageCircle, UserPlus, Shield, Link2, QrCode, Trash2, Eye } from 'lucide-react';

// ============ 샘플 데이터 생성 ============
const generateSampleData = () => {
  const vvipNames = ['김OO 도지사', '이OO 국회의원', '박OO 시장', '정OO 장관', '최OO 청장'];
  const vipNames = ['행정부시장', '경제부시장', '시의회의장', '교육감', '경찰서장', '소방서장', '세무서장', '법원장', '검찰지청장', '상공회의소장',
                    '대학총장', '병원장', '문화원장', '체육회장', '농협조합장', '신협이사장', '언론사대표', '기업대표A', '기업대표B', '단체장'];
  const orgs = ['경기도청', '국회', '화성시청', '국토교통부', '환경부', '경기도의회', '화성교육지원청', '화성동부경찰서', '화성소방서', '화성세무서',
                '수원지방법원', '수원지방검찰청', '화성상공회의소', '한국대학교', '화성중앙병원', '화성문화원', '화성시체육회', '화성농협'];
  const positions = ['도지사', '국회의원', '시장', '장관', '청장', '부시장', '의장', '교육감', '서장', '대표', '회장', '원장', '단장', '본부장', '국장', '과장', '팀장'];
  
  const data = [];
  let idx = 1;
  
  // VVIP 5명
  vvipNames.forEach((name, i) => {
    data.push({
      id: idx++,
      name,
      grade: 'VVIP',
      organization: orgs[i],
      position: name.split(' ')[1] || '귀빈',
      vehicle: `${['12가', '34나', '56다', '78라', '90마'][i]} ${1000 + i * 111}`,
      seat: `A-${String(i + 1).padStart(2, '0')}`,
      manager: ['김의전', '이수행', '박비서'][i % 3],
      status: ['미도착', '주차장 도착', '로비 도착', '대기실', '착석 완료'][i % 5],
      arrivalTime: i < 3 ? `${13 + i}:${20 + i * 5}` : null,
    });
  });
  
  // VIP 20명
  vipNames.forEach((name, i) => {
    data.push({
      id: idx++,
      name: `VIP-${String(i+1).padStart(2,'0')} ${name}`,
      grade: 'VIP',
      organization: orgs[(i + 5) % orgs.length],
      position: positions[i % positions.length],
      vehicle: `${['가', '나', '다', '라', '마'][i % 5]}${100 + i} ${2000 + i}`,
      seat: `B-${String(i + 1).padStart(2, '0')}`,
      manager: ['김의전', '이수행', '박비서', '정담당', '최운영'][i % 5],
      status: ['미도착', '주차장 도착', '로비 도착', '대기실', '착석 완료', '미도착', '주차장 도착'][i % 7],
      arrivalTime: i % 3 !== 0 ? `${13 + (i % 2)}:${10 + i * 2}` : null,
    });
  });
  
  // 일반 50명
  for (let i = 0; i < 50; i++) {
    data.push({
      id: idx++,
      name: `참석자${String(i+1).padStart(3,'0')}`,
      grade: '일반',
      organization: orgs[i % orgs.length],
      position: positions[i % positions.length],
      vehicle: `${['바', '사', '아', '자', '차'][i % 5]}${200 + i} ${3000 + i}`,
      seat: `C-${String(i + 1).padStart(2, '0')}`,
      manager: ['김의전', '이수행', '박비서', '정담당', '최운영'][i % 5],
      status: ['미도착', '주차장 도착', '로비 도착', '착석 완료', '미도착', '착석 완료'][i % 6],
      arrivalTime: i % 2 === 0 ? `${13 + (i % 2)}:${(i % 50)}`.padEnd(5, '0') : null,
    });
  }
  
  // 관계자 10명
  for (let i = 0; i < 10; i++) {
    data.push({
      id: idx++,
      name: `관계자${String(i+1).padStart(2,'0')}`,
      grade: '관계자',
      organization: '화성시청 빅데이터팀',
      position: ['주무관', '주사', '사무관'][i % 3],
      vehicle: `관용 ${4000 + i}`,
      seat: `STAFF-${String(i + 1).padStart(2, '0')}`,
      manager: '운영본부',
      status: '착석 완료',
      arrivalTime: `12:${(i * 5)}`.padEnd(5, '0'),
    });
  }
  
  return data;
};

// ============ 상수 ============
const STATUSES = ['미도착', '주차장 도착', '로비 도착', '대기실', '착석 완료', '퇴장', '불참'];

const STATUS_COLORS = {
  '미도착': 'bg-slate-100 text-slate-600 border-slate-300',
  '주차장 도착': 'bg-amber-50 text-amber-700 border-amber-300',
  '로비 도착': 'bg-blue-50 text-blue-700 border-blue-300',
  '대기실': 'bg-indigo-50 text-indigo-700 border-indigo-300',
  '착석 완료': 'bg-emerald-50 text-emerald-700 border-emerald-300',
  '퇴장': 'bg-slate-50 text-slate-500 border-slate-300',
  '불참': 'bg-rose-50 text-rose-700 border-rose-300',
};

const STATUS_DOT = {
  '미도착': 'bg-slate-400',
  '주차장 도착': 'bg-amber-500',
  '로비 도착': 'bg-blue-500',
  '대기실': 'bg-indigo-500',
  '착석 완료': 'bg-emerald-500',
  '퇴장': 'bg-slate-400',
  '불참': 'bg-rose-500',
};

const GRADE_STYLES = {
  'VVIP': { bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200', icon: Crown },
  'VIP': { bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50', border: 'border-amber-200', icon: Star },
  '일반': { bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50', border: 'border-slate-200', icon: UserCheck },
  '관계자': { bg: 'bg-teal-600', text: 'text-teal-600', light: 'bg-teal-50', border: 'border-teal-200', icon: Briefcase },
};

// ============ 카카오톡 공유 텍스트 생성 ============
const generateShareText = (stats, attendees, type = 'dashboard') => {
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  if (type === 'dashboard') {
    const vvipArrived = stats.byGrade.VVIP.filter(a => ['주차장 도착','로비 도착','대기실','착석 완료'].includes(a.status)).length;
    return `[화성시 VIP 행사 실시간 현황]
■ 기준시각 : ${dateStr}

▣ 전체 현황
 · 초청인원 : ${stats.total}명
 · 실 참석 : ${stats.arrived}명 (${stats.attendanceRate}%)
 · 착석완료 : ${stats.seated}명
 · 미도착 : ${stats.notArrived}명

▣ VVIP 동향
 · 도착 : ${vvipArrived}/${stats.byGrade.VVIP.length}명
${stats.byGrade.VVIP.map(a => ` · ${a.position} : ${a.status}`).join('\n')}

※ 본 정보는 행사 운영 목적의 비식별 요약본입니다.
※ 화성시 빅데이터팀`;
  }
  
  if (type === 'report') {
    const noShow = attendees.filter(a => a.status === '미도착' || a.status === '불참').length;
    return `[화성시 VIP 행사 결과보고 요약]
■ 보고일시 : ${dateStr}

▣ 참석 결과
 · 초청 : ${stats.total}명
 · 참석 : ${stats.arrived}명 (${stats.attendanceRate}%)
 · 착석 : ${stats.seated}명
 · 불참·미도착 : ${noShow}명

▣ 등급별 참석률
${Object.entries(stats.byGrade).map(([g, list]) => {
  const arr = list.filter(a => ['주차장 도착','로비 도착','대기실','착석 완료'].includes(a.status)).length;
  const rate = list.length > 0 ? ((arr/list.length)*100).toFixed(0) : 0;
  return ` · ${g} : ${arr}/${list.length}명 (${rate}%)`;
}).join('\n')}

▣ 특이사항
 · 목표 참석률 90% 대비 ${(stats.attendanceRate - 90).toFixed(1)}%p
 · 사후 확인대상 : ${noShow}명

※ 화성시 빅데이터팀 자동생성 보고서`;
  }
  
  return '';
};

// ============ 클립보드 복사 공통 함수 (모든 환경 호환) ============
const copyToClipboard = async (text) => {
  // 1차: 최신 Clipboard API (HTTPS/localhost 환경)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      // fallback으로 진행
    }
  }
  
  // 2차: 레거시 execCommand 방식 (iframe·HTTP 환경 대응)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch (e) {
    return false;
  }
};

// ============ 공유 모달 ============
function ShareModal({ onClose, shareText, title }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    const success = await copyToClipboard(shareText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      alert('자동 복사에 실패했습니다. 텍스트를 길게 눌러 직접 복사해 주세요.');
    }
  };
  
  const openKakao = () => {
    handleCopy();
    // 카카오톡 앱 실행 (모바일에서만 동작)
    setTimeout(() => {
      window.location.href = 'kakaotalk://';
    }, 300);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-yellow-400 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">카카오톡 공유</h3>
              <p className="text-[11px] text-slate-500">{title}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 공유 텍스트 미리보기 */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-3 max-h-64 overflow-y-auto">
          <pre className="text-[11px] text-slate-700 whitespace-pre-wrap font-sans leading-relaxed select-all cursor-text">{shareText}</pre>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900 transition-colors"
          >
            {copied ? <><Check className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 텍스트 복사</>}
          </button>
          <button
            onClick={openKakao}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-500 transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> 카카오톡 열기
          </button>
        </div>

        {/* 안내 */}
        <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[10px] text-amber-800 leading-relaxed">
          <div className="font-bold mb-0.5">▣ 사용 안내</div>
          <div>① [텍스트 복사] 클릭 → 카카오톡 채팅방에 붙여넣기</div>
          <div>② [카카오톡 열기]는 모바일에서 자동 복사 후 앱 실행</div>
          <div className="mt-1 pt-1 border-t border-amber-200 text-amber-700">
            ※ 개인정보 보호를 위해 비식별 요약 정보만 공유됩니다.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ 관리자 권한 정의 ============
const ROLES = {
  '총괄': { 
    label: '총괄 관리자', 
    desc: '전체 권한 (VVIP·전체 명단·통계·결과보고)', 
    color: 'bg-rose-600', 
    light: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Crown,
    permissions: ['VVIP', 'VIP', '일반', '관계자', '결과보고']
  },
  '의전팀': { 
    label: '의전팀', 
    desc: 'VVIP·VIP 의전 및 동선 관리', 
    color: 'bg-amber-600', 
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Star,
    permissions: ['VVIP', 'VIP']
  },
  '현장담당': { 
    label: '현장 담당자', 
    desc: '체크인 및 좌석 안내 (전체 등급)', 
    color: 'bg-blue-600', 
    light: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: UserCheck,
    permissions: ['VVIP', 'VIP', '일반', '관계자']
  },
  '참관': { 
    label: '참관자', 
    desc: '읽기전용 (통계·현황 조회만 가능)', 
    color: 'bg-slate-500', 
    light: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Eye,
    permissions: ['읽기전용']
  },
};

// 8자리 토큰 생성 (대문자+숫자)
const generateToken = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// 초기 관리자 샘플
const initialManagers = [
  { id: 1, name: '김의전', role: '총괄', phone: '010-1234-****', token: 'A3K9P2M7', status: 'active', addedAt: '13:00', addedBy: '시스템' },
  { id: 2, name: '이수행', role: '의전팀', phone: '010-2345-****', token: 'B5N7Q4R8', status: 'active', addedAt: '13:05', addedBy: '김의전' },
  { id: 3, name: '박비서', role: '현장담당', phone: '010-3456-****', token: 'C6T2W9X4', status: 'active', addedAt: '13:10', addedBy: '김의전' },
];

// ============ 관리자 추가 모달 ============
function AddManagerModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('현장담당');
  const [phone, setPhone] = useState('');
  
  const handleSubmit = () => {
    if (!name.trim()) {
      alert('성명을 입력해 주세요.');
      return;
    }
    const newManager = {
      id: Date.now(),
      name: name.trim(),
      role,
      phone: phone.trim() || '미등록',
      token: generateToken(),
      status: 'active',
      addedAt: new Date().toTimeString().slice(0, 5),
      addedBy: '김의전',
    };
    onAdd(newManager);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-slate-800 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">행사 관리자 추가</h3>
              <p className="text-[11px] text-slate-500">행사 진행 중 신규 담당자를 즉시 등록합니다.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">성명 <span className="text-rose-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 홍길동"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">연락처 (선택)</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
            <p className="text-[10px] text-slate-500 mt-1">※ 카카오톡 초대 링크 발송 시 활용됩니다.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">권한 등급 <span className="text-rose-500">*</span></label>
            <div className="space-y-1.5">
              {Object.entries(ROLES).map(([key, r]) => {
                const Icon = r.icon;
                return (
                  <label
                    key={key}
                    className={`flex items-start gap-2 p-2.5 border-2 rounded cursor-pointer transition-all ${
                      role === key ? 'border-slate-800 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={role === key}
                      onChange={() => setRole(key)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 text-slate-700" />
                        <span className="text-xs font-bold text-slate-900">{r.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[10px] text-amber-800">
            <div className="font-bold mb-0.5">▣ 자동 생성 정보</div>
            <div>· 8자리 1회용 접속 토큰 자동 발급</div>
            <div>· 행사 당일 24시간 후 자동 만료</div>
            <div>· 카카오톡 공유용 초대 링크 즉시 생성</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-3 py-2.5 border border-slate-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-3 py-2.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900"
          >
            등록 + 초대링크 생성
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ 초대 링크 모달 (카카오톡 공유) ============
function InviteLinkModal({ manager, onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  
  // ※ 실제 운영 시 화성시 공식 도메인 사용 (예: https://hsvip.hscity.go.kr/invite)
  // 시제품 단계에서는 현재 접속 환경 기반 URL 자동 생성
  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#invite`
    : '시제품 환경';
  const inviteLink = `${baseUrl}/${manager.token}`;
  const role = ROLES[manager.role];
  
  const inviteText = `[화성시 VIP 행사 운영시스템 초대]

▣ ${manager.name}님을 행사 관리자로 초대합니다.

· 권한 : ${role.label}
· 토큰 : ${manager.token}
· 유효 : 행사 당일 24시간

▼ 접속 링크
${inviteLink}

※ 본 링크는 ${manager.name}님 전용이며, 외부 유출을 금합니다.
※ [시제품 단계] 정식 배포 전까지 데모 환경 접속 링크입니다.
※ 화성시 빅데이터팀`;
  
  const copyLink = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      alert('자동 복사에 실패했습니다. 링크를 길게 눌러 직접 복사해 주세요.');
    }
  };
  
  const copyFullText = async () => {
    const success = await copyToClipboard(inviteText);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      alert('자동 복사에 실패했습니다. 메시지를 길게 눌러 직접 복사해 주세요.');
    }
  };
  
  const openKakao = () => {
    copyFullText();
    setTimeout(() => { window.location.href = 'kakaotalk://'; }, 300);
  };
  
  // QR 코드 (qr-server.com 무료 API 활용)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(inviteLink)}`;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">초대 링크 발급 완료</h3>
              <p className="text-[11px] text-slate-500">{manager.name}님을 카카오톡으로 초대하세요.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* 관리자 정보 카드 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${role.color}`}>
              {role.label}
            </span>
            <span className="text-[10px] text-slate-300">발급: {manager.addedAt}</span>
          </div>
          <div className="text-lg font-bold">{manager.name}</div>
          <div className="text-xs text-slate-300 mb-3">{manager.phone}</div>
          <div className="bg-white/10 backdrop-blur-sm rounded p-2 font-mono text-center tracking-widest text-base font-bold">
            {manager.token}
          </div>
          <div className="text-[10px] text-slate-300 text-center mt-1">접속 토큰 (8자리)</div>
        </div>

        {/* QR + 링크 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-white border-2 border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center">
            <img src={qrUrl} alt="QR" className="w-32 h-32 mb-2" />
            <div className="text-[10px] text-slate-500 flex items-center gap-1">
              <QrCode className="w-3 h-3" /> QR코드 스캔 접속
            </div>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">접속 링크 (클릭하여 복사)</label>
              <div 
                onClick={copyLink}
                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded p-2 text-[10px] font-mono text-slate-700 break-all cursor-pointer select-all transition-colors"
              >
                {inviteLink}
              </div>
            </div>
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium"
            >
              {copiedLink ? <><Check className="w-3.5 h-3.5" /> 링크 복사됨</> : <><Copy className="w-3.5 h-3.5" /> 링크만 복사</>}
            </button>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-[10px] text-blue-800">
              <div className="font-bold">권한 범위</div>
              <div>{role.permissions.join(' · ')}</div>
            </div>
          </div>
        </div>

        {/* 카카오톡 메시지 미리보기 */}
        <div className="mb-3">
          <label className="block text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
            <MessageCircle className="w-3 h-3" /> 카카오톡 발송 메시지 (미리보기)
          </label>
          <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 max-h-40 overflow-y-auto">
            <pre className="text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed select-all cursor-text">{inviteText}</pre>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={copyFullText}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900"
          >
            {copiedText ? <><Check className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 메시지 복사</>}
          </button>
          <button
            onClick={openKakao}
            className="flex items-center justify-center gap-1.5 px-3 py-3 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-500"
          >
            <MessageCircle className="w-4 h-4" /> 카카오톡 열기
          </button>
        </div>

        <div className="mt-3 text-[10px] text-slate-500 leading-relaxed">
          ※ 초대 링크는 1회용이며, 24시간 후 자동 만료됩니다.<br/>
          ※ 외부 유출 시 즉시 [관리자] 화면에서 권한을 회수할 수 있습니다.
        </div>
      </div>
    </div>
  );
}

// ============ 메인 컴포넌트 ============
export default function VIPEventManagementApp() {
  const [attendees, setAttendees] = useState(generateSampleData());
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [selectedAttendee, setSelectedAttendee] = useState(null);
  const [shareModal, setShareModal] = useState(null); // {type, title}
  const [showPlatformShare, setShowPlatformShare] = useState(false);
  const [managers, setManagers] = useState(initialManagers);
  const [showAddManager, setShowAddManager] = useState(false);
  const [inviteLinkModal, setInviteLinkModal] = useState(null); // manager object
  
  const handleAddManager = (newManager) => {
    setManagers(prev => [...prev, newManager]);
    setShowAddManager(false);
    setInviteLinkModal(newManager); // 등록 직후 초대링크 모달 자동 표시
  };
  
  const handleRevokeManager = (id) => {
    if (window.confirm('해당 관리자의 권한을 회수하시겠습니까?')) {
      setManagers(prev => prev.map(m => m.id === id ? { ...m, status: 'revoked' } : m));
    }
  };

  // 필터링
  const filteredAttendees = useMemo(() => {
    return attendees.filter(a => {
      const matchSearch = !searchQuery || 
        a.name.includes(searchQuery) || 
        a.organization.includes(searchQuery) ||
        a.position.includes(searchQuery) ||
        a.vehicle.includes(searchQuery);
      const matchGrade = gradeFilter === '전체' || a.grade === gradeFilter;
      const matchStatus = statusFilter === '전체' || a.status === statusFilter;
      return matchSearch && matchGrade && matchStatus;
    });
  }, [attendees, searchQuery, gradeFilter, statusFilter]);

  // 통계
  const stats = useMemo(() => {
    const total = attendees.length;
    const seated = attendees.filter(a => a.status === '착석 완료').length;
    const arrived = attendees.filter(a => ['주차장 도착', '로비 도착', '대기실', '착석 완료'].includes(a.status)).length;
    const notArrived = attendees.filter(a => a.status === '미도착').length;
    const absent = attendees.filter(a => a.status === '불참').length;
    
    const byGrade = {
      VVIP: attendees.filter(a => a.grade === 'VVIP'),
      VIP: attendees.filter(a => a.grade === 'VIP'),
      '일반': attendees.filter(a => a.grade === '일반'),
      '관계자': attendees.filter(a => a.grade === '관계자'),
    };
    
    const byStatus = STATUSES.reduce((acc, s) => {
      acc[s] = attendees.filter(a => a.status === s).length;
      return acc;
    }, {});
    
    return { total, seated, arrived, notArrived, absent, byGrade, byStatus, attendanceRate: ((arrived / total) * 100).toFixed(1) };
  }, [attendees]);

  // VVIP 도착 알림
  const vvipAlerts = useMemo(() => {
    return attendees.filter(a => 
      a.grade === 'VVIP' && 
      ['주차장 도착', '로비 도착', '대기실', '착석 완료'].includes(a.status)
    );
  }, [attendees]);

  const updateStatus = (id, newStatus) => {
    setAttendees(prev => prev.map(a => 
      a.id === id 
        ? { ...a, status: newStatus, arrivalTime: a.arrivalTime || new Date().toTimeString().slice(0,5) }
        : a
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Noto Sans KR', system-ui, sans-serif" }}>
      {/* 상단 헤더 */}
      <header className="bg-white border-b-2 border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  공공행사 VIP 실시간 상황관리 플랫폼
                  <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-300">시제품</span>
                </h1>
                <p className="text-xs text-slate-500">화성시 · 2026년 정기행사 운영시스템</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPlatformShare(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded text-[11px] font-bold transition-colors shadow-sm"
                title="플랫폼을 카카오톡으로 공유"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">공유</span>
              </button>
              <div className="hidden md:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-emerald-700 font-medium">실시간 운영 중</span>
                </div>
                <span className="text-slate-500">담당: 빅데이터팀</span>
              </div>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-200">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'dashboard', label: '관리자 대시보드', icon: BarChart3 },
              { id: 'mobile', label: '모바일 체크인', icon: Smartphone },
              { id: 'vvip', label: 'VVIP 현황판', icon: Crown },
              { id: 'seat', label: '좌석 현황', icon: MapPin },
              { id: 'report', label: '결과보고', icon: FileText },
              { id: 'managers', label: '운영자 관리', icon: Shield },
              { id: 'upload', label: '엑셀 업로드', icon: Upload },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeView === tab.id 
                      ? 'border-slate-800 text-slate-900' 
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeView === 'dashboard' && <DashboardView stats={stats} vvipAlerts={vvipAlerts} attendees={attendees} updateStatus={updateStatus} onShare={() => setShareModal({type: 'dashboard', title: '실시간 현황 요약'})} />}
        {activeView === 'mobile' && <MobileCheckinView 
          attendees={filteredAttendees} 
          updateStatus={updateStatus}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          gradeFilter={gradeFilter}
          setGradeFilter={setGradeFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          setSelectedAttendee={setSelectedAttendee}
        />}
        {activeView === 'vvip' && <VVIPView attendees={attendees.filter(a => a.grade === 'VVIP')} updateStatus={updateStatus} />}
        {activeView === 'seat' && <SeatView attendees={attendees} />}
        {activeView === 'report' && <ReportView stats={stats} attendees={attendees} onShare={() => setShareModal({type: 'report', title: '결과보고 요약'})} />}
        {activeView === 'managers' && <ManagersView 
          managers={managers} 
          onAdd={() => setShowAddManager(true)}
          onShowInvite={(m) => setInviteLinkModal(m)}
          onRevoke={handleRevokeManager}
        />}
        {activeView === 'upload' && <UploadView />}
      </main>

      {/* 상세 모달 */}
      {selectedAttendee && (
        <DetailModal attendee={selectedAttendee} onClose={() => setSelectedAttendee(null)} updateStatus={(id, status) => { updateStatus(id, status); setSelectedAttendee(null); }} />
      )}

      {/* 카카오톡 공유 모달 */}
      {shareModal && (
        <ShareModal 
          onClose={() => setShareModal(null)} 
          shareText={generateShareText(stats, attendees, shareModal.type)}
          title={shareModal.title}
        />
      )}

      {/* 관리자 추가 모달 */}
      {showAddManager && (
        <AddManagerModal onClose={() => setShowAddManager(false)} onAdd={handleAddManager} />
      )}

      {/* 초대 링크 모달 */}
      {inviteLinkModal && (
        <InviteLinkModal manager={inviteLinkModal} onClose={() => setInviteLinkModal(null)} />
      )}

      {/* 플랫폼 공유 모달 */}
      {showPlatformShare && (
        <PlatformShareModal onClose={() => setShowPlatformShare(false)} />
      )}

      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-4 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>© 2026 화성시 빅데이터팀 · AI·데이터 기반 행정혁신</span>
          <span>v1.0 시제품 (Prototype)</span>
        </div>
      </footer>
    </div>
  );
}

// ============ 대시보드 화면 ============
function DashboardView({ stats, vvipAlerts, attendees, updateStatus, onShare }) {
  return (
    <div className="space-y-6">
      {/* 상단 액션 바 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">실시간 운영 현황</h2>
          <p className="text-xs text-slate-500">전체 행사 진행 상황을 한눈에 확인하세요.</p>
        </div>
        <button
          onClick={onShare}
          className="flex items-center gap-1.5 px-3 py-2 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <MessageCircle className="w-4 h-4" />
          카카오톡 공유
        </button>
      </div>

      {/* VVIP 도착 알림 */}
      {vvipAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 animate-pulse" />
            <h2 className="font-bold">VVIP 도착 알림</h2>
            <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded">{vvipAlerts.length}명 도착</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {vvipAlerts.map(a => (
              <div key={a.id} className="bg-white/15 backdrop-blur-sm rounded p-3 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{a.name}</div>
                    <div className="text-xs text-white/80">{a.organization}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-medium">{a.status}</div>
                    {a.arrivalTime && <div className="text-xs text-white/70">{a.arrivalTime}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 핵심 KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard title="전체 참석자" value={stats.total} unit="명" icon={Users} color="slate" />
        <KPICard title="참석률" value={stats.attendanceRate} unit="%" icon={TrendingUp} color="emerald" highlight />
        <KPICard title="착석 완료" value={stats.seated} unit="명" icon={CheckCircle2} color="blue" />
        <KPICard title="미도착" value={stats.notArrived} unit="명" icon={AlertCircle} color="amber" />
      </div>

      {/* 등급별 현황 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> 등급별 참석 현황
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.byGrade).map(([grade, list]) => {
              const arrived = list.filter(a => ['주차장 도착', '로비 도착', '대기실', '착석 완료'].includes(a.status)).length;
              const rate = list.length > 0 ? (arrived / list.length) * 100 : 0;
              const style = GRADE_STYLES[grade];
              const Icon = style.icon;
              return (
                <div key={grade}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${style.text}`} />
                      <span className="font-semibold text-slate-700">{grade}</span>
                      <span className="text-slate-500">{arrived} / {list.length}명</span>
                    </div>
                    <span className={`font-bold ${style.text}`}>{rate.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${style.bg} transition-all duration-700`} 
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> 상태별 분포
          </h3>
          <div className="space-y-2">
            {STATUSES.map(status => {
              const count = stats.byStatus[status] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 w-24 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[status]}`} />
                    <span className="text-xs text-slate-700">{status}</span>
                  </div>
                  <div className="flex-1 h-5 bg-slate-50 rounded relative overflow-hidden">
                    <div className="h-full bg-slate-700 transition-all duration-500" style={{ width: `${pct}%` }} />
                    <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-medium text-slate-700 mix-blend-difference filter invert">
                      {count}명
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 최근 도착 */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> 최근 상태 변경 (상위 10건)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="text-left py-2 px-2 font-medium">등급</th>
                <th className="text-left py-2 px-2 font-medium">성명</th>
                <th className="text-left py-2 px-2 font-medium hidden md:table-cell">소속</th>
                <th className="text-left py-2 px-2 font-medium hidden md:table-cell">좌석</th>
                <th className="text-left py-2 px-2 font-medium">현재 상태</th>
                <th className="text-left py-2 px-2 font-medium">시각</th>
              </tr>
            </thead>
            <tbody>
              {attendees.filter(a => a.arrivalTime).slice(0, 10).map(a => {
                const style = GRADE_STYLES[a.grade];
                return (
                  <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${style.bg}`}>
                        {a.grade}
                      </span>
                    </td>
                    <td className="py-2 px-2 font-medium text-slate-900">{a.name}</td>
                    <td className="py-2 px-2 text-slate-600 hidden md:table-cell">{a.organization}</td>
                    <td className="py-2 px-2 text-slate-600 hidden md:table-cell font-mono">{a.seat}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block px-2 py-0.5 rounded border text-[10px] font-medium ${STATUS_COLORS[a.status]}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-mono">{a.arrivalTime}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, unit, icon: Icon, color, highlight }) {
  const colors = {
    slate: 'border-slate-200',
    emerald: 'border-emerald-300 bg-emerald-50',
    blue: 'border-blue-200',
    amber: 'border-amber-200',
  };
  const iconColors = {
    slate: 'text-slate-500 bg-slate-100',
    emerald: 'text-emerald-600 bg-emerald-100',
    blue: 'text-blue-600 bg-blue-100',
    amber: 'text-amber-600 bg-amber-100',
  };
  return (
    <div className={`bg-white border-2 rounded-lg p-4 ${highlight ? colors[color] : 'border-slate-200'}`}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs text-slate-500 font-medium">{title}</span>
        <div className={`w-7 h-7 rounded flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl md:text-3xl font-bold text-slate-900">{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

// ============ 모바일 체크인 화면 ============
function MobileCheckinView({ attendees, updateStatus, searchQuery, setSearchQuery, gradeFilter, setGradeFilter, statusFilter, setStatusFilter, setSelectedAttendee }) {
  return (
    <div className="max-w-md mx-auto space-y-3">
      <div className="bg-slate-800 text-white rounded-lg p-4">
        <div className="flex items-center gap-2 mb-1">
          <Smartphone className="w-4 h-4" />
          <h2 className="font-bold text-sm">현장 담당자 체크인</h2>
        </div>
        <p className="text-xs text-slate-300">참석자를 검색하고 상태를 변경하세요.</p>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="이름·소속·직위·차량번호 검색"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
        />
      </div>

      {/* 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['전체', 'VVIP', 'VIP', '일반', '관계자'].map(g => (
          <button
            key={g}
            onClick={() => setGradeFilter(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border ${
              gradeFilter === g 
                ? 'bg-slate-800 text-white border-slate-800' 
                : 'bg-white text-slate-700 border-slate-300'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['전체', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap border ${
              statusFilter === s 
                ? 'bg-slate-700 text-white border-slate-700' 
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-500 px-1">검색결과: <span className="font-bold text-slate-900">{attendees.length}명</span></div>

      {/* 카드 목록 */}
      <div className="space-y-2">
        {attendees.slice(0, 30).map(a => {
          const style = GRADE_STYLES[a.grade];
          return (
            <div
              key={a.id}
              onClick={() => setSelectedAttendee(a)}
              className={`bg-white border rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow ${style.border}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${style.bg}`}>
                      {a.grade}
                    </span>
                    <span className="font-semibold text-sm text-slate-900 truncate">{a.name}</span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">{a.organization} · {a.position}</div>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.seat}</span>
                    <span className="flex items-center gap-1"><Car className="w-3 h-3" />{a.vehicle}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded border text-[10px] font-medium ${STATUS_COLORS[a.status]}`}>
                    {a.status}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
          );
        })}
        {attendees.length > 30 && (
          <div className="text-center text-xs text-slate-500 py-2">
            상위 30명 표시 · 전체 {attendees.length}명 (검색을 활용해 주세요)
          </div>
        )}
      </div>
    </div>
  );
}

// ============ 상세 모달 ============
function DetailModal({ attendee, onClose, updateStatus }) {
  const style = GRADE_STYLES[attendee.grade];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-md rounded-t-2xl md:rounded-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white ${style.bg} mb-1.5`}>
              {attendee.grade}
            </span>
            <h3 className="text-lg font-bold text-slate-900">{attendee.name}</h3>
            <p className="text-sm text-slate-600">{attendee.organization} · {attendee.position}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <InfoBlock label="좌석번호" value={attendee.seat} icon={MapPin} />
          <InfoBlock label="차량번호" value={attendee.vehicle} icon={Car} />
          <InfoBlock label="담당자" value={attendee.manager} icon={UserCheck} />
          <InfoBlock label="도착시각" value={attendee.arrivalTime || '-'} icon={Clock} />
        </div>

        <div className="mb-2 text-xs font-bold text-slate-700">상태 변경</div>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => updateStatus(attendee.id, s)}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium border-2 transition-all ${
                attendee.status === s 
                  ? 'border-slate-800 bg-slate-800 text-white' 
                  : `${STATUS_COLORS[s]} hover:scale-[1.02]`
              }`}
            >
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]} ${attendee.status === s ? 'ring-2 ring-white' : ''}`} />
                {s}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, icon: Icon }) {
  return (
    <div className="bg-slate-50 rounded p-2.5">
      <div className="flex items-center gap-1 text-slate-500 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px]">{label}</span>
      </div>
      <div className="font-semibold text-slate-900 text-sm font-mono">{value}</div>
    </div>
  );
}

// ============ VVIP 전용 현황판 ============
function VVIPView({ attendees, updateStatus }) {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-5 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-amber-400" />
          <h2 className="font-bold">VVIP 전용 현황판</h2>
        </div>
        <p className="text-xs text-slate-300">최고위급 참석자에 대한 실시간 의전 상태를 표시합니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {attendees.map(a => {
          const stage = STATUSES.indexOf(a.status);
          const isArrived = ['주차장 도착', '로비 도착', '대기실', '착석 완료'].includes(a.status);
          return (
            <div key={a.id} className="bg-white border-2 border-rose-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Crown className="w-4 h-4 text-rose-600" />
                    <span className="text-[10px] font-bold text-rose-600 tracking-wider">VVIP</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{a.name}</h3>
                  <p className="text-xs text-slate-600">{a.organization}</p>
                </div>
                <span className={`px-2 py-1 rounded border text-[10px] font-bold ${STATUS_COLORS[a.status]}`}>
                  {a.status}
                </span>
              </div>

              {/* 동선 진행 표시 */}
              <div className="bg-slate-50 rounded p-2.5 mb-3">
                <div className="text-[10px] text-slate-500 mb-2">의전 동선 진행</div>
                <div className="flex items-center gap-1">
                  {['미도착', '주차장 도착', '로비 도착', '대기실', '착석 완료'].map((s, i) => (
                    <React.Fragment key={s}>
                      <div className={`flex-1 h-1.5 rounded-full ${stage >= i ? 'bg-rose-500' : 'bg-slate-200'}`} />
                    </React.Fragment>
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[9px] text-slate-500">
                  <span>출발</span>
                  <span>주차</span>
                  <span>로비</span>
                  <span>대기</span>
                  <span>착석</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] mb-3">
                <div>
                  <div className="text-slate-500">좌석</div>
                  <div className="font-bold text-slate-900 font-mono">{a.seat}</div>
                </div>
                <div>
                  <div className="text-slate-500">담당</div>
                  <div className="font-bold text-slate-900">{a.manager}</div>
                </div>
                <div>
                  <div className="text-slate-500">도착</div>
                  <div className="font-bold text-slate-900 font-mono">{a.arrivalTime || '-'}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1">
                {['로비 도착', '대기실', '착석 완료'].map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(a.id, s)}
                    className="px-2 py-1.5 text-[10px] font-medium border border-slate-300 rounded hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 좌석 현황 ============
function SeatView({ attendees }) {
  const sections = ['A', 'B', 'C'];
  
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> 좌석 현황
        </h2>
        <p className="text-xs text-slate-500 mb-4">색상이 채워진 좌석은 착석 완료 상태입니다.</p>

        {/* 무대 */}
        <div className="bg-slate-800 text-white text-center py-3 rounded mb-6 text-xs font-bold tracking-widest">
          ━━━━━ 무 대 (STAGE) ━━━━━
        </div>

        {sections.map(section => {
          const sectionAttendees = attendees.filter(a => a.seat.startsWith(section));
          const grade = section === 'A' ? 'VVIP' : section === 'B' ? 'VIP' : '일반';
          const style = GRADE_STYLES[grade];
          
          return (
            <div key={section} className="mb-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${style.bg}`}>{grade}</span>
                  <span className="text-xs font-bold text-slate-700">{section} 구역 ({sectionAttendees.length}석)</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  착석 {sectionAttendees.filter(a => a.status === '착석 완료').length}/{sectionAttendees.length}
                </span>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-1">
                {sectionAttendees.map(a => {
                  const seated = a.status === '착석 완료';
                  return (
                    <div
                      key={a.id}
                      title={`${a.seat} · ${a.name} · ${a.status}`}
                      className={`aspect-square rounded text-[9px] flex flex-col items-center justify-center font-mono cursor-help transition-transform hover:scale-110 ${
                        seated ? `${style.bg} text-white` : 'bg-slate-100 text-slate-400 border border-dashed border-slate-300'
                      }`}
                    >
                      <div className="font-bold">{a.seat.split('-')[1]}</div>
                      {seated && <div className="text-[7px] opacity-90">●</div>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============ 결과보고 ============
function ReportView({ stats, attendees, onShare }) {
  const seatedFinal = stats.seated;
  const noShow = attendees.filter(a => a.status === '미도착' || a.status === '불참').length;
  
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-bold text-slate-900">행사 결과 요약 보고</h2>
            <p className="text-xs text-slate-500">2026.05.03 기준 · 자동 생성</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onShare}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded text-xs font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              카톡 공유
            </button>
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <ReportStat label="초청 인원" value={stats.total} unit="명" />
          <ReportStat label="실 참석" value={stats.arrived} unit="명" highlight />
          <ReportStat label="최종 착석" value={seatedFinal} unit="명" />
          <ReportStat label="불참·미도착" value={noShow} unit="명" warning />
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-bold text-slate-700 mb-2">▣ 등급별 참석 결과</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-300">
                  <th className="text-left py-2 px-3 font-bold text-slate-700">구분</th>
                  <th className="text-right py-2 px-3 font-bold text-slate-700">초청</th>
                  <th className="text-right py-2 px-3 font-bold text-slate-700">참석</th>
                  <th className="text-right py-2 px-3 font-bold text-slate-700">불참</th>
                  <th className="text-right py-2 px-3 font-bold text-slate-700">참석률</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byGrade).map(([grade, list]) => {
                  const arrived = list.filter(a => ['주차장 도착', '로비 도착', '대기실', '착석 완료'].includes(a.status)).length;
                  const absent = list.length - arrived;
                  const rate = list.length > 0 ? ((arrived / list.length) * 100).toFixed(1) : 0;
                  return (
                    <tr key={grade} className="border-b border-slate-200">
                      <td className="py-2 px-3 font-medium text-slate-900">{grade}</td>
                      <td className="py-2 px-3 text-right font-mono">{list.length}</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-bold">{arrived}</td>
                      <td className="py-2 px-3 text-right font-mono text-rose-700">{absent}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold">{rate}%</td>
                    </tr>
                  );
                })}
                <tr className="bg-slate-100 border-t-2 border-slate-700 font-bold">
                  <td className="py-2 px-3">합계</td>
                  <td className="py-2 px-3 text-right font-mono">{stats.total}</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700">{stats.arrived}</td>
                  <td className="py-2 px-3 text-right font-mono text-rose-700">{stats.total - stats.arrived}</td>
                  <td className="py-2 px-3 text-right font-mono">{stats.attendanceRate}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-5">
          <h3 className="text-xs font-bold text-slate-700 mb-2">▣ 상태별 최종 분포</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {STATUSES.map(s => (
              <div key={s} className="bg-slate-50 rounded p-2.5 border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[s]}`} />
                  <span className="text-[10px] text-slate-600">{s}</span>
                </div>
                <div className="text-base font-bold text-slate-900">{stats.byStatus[s] || 0}<span className="text-[10px] font-normal text-slate-500 ml-0.5">명</span></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 border-l-4 border-slate-700 p-3 text-xs text-slate-700">
          <div className="font-bold mb-1">▣ 특이사항</div>
          <div>· VVIP {stats.byGrade.VVIP.length}명 중 {stats.byGrade.VVIP.filter(a => ['주차장 도착','로비 도착','대기실','착석 완료'].includes(a.status)).length}명 참석</div>
          <div>· 전체 참석률 {stats.attendanceRate}% (목표 90% 대비)</div>
          <div>· 불참·미도착 {noShow}명 사후 확인 필요</div>
        </div>
      </div>
    </div>
  );
}

function ReportStat({ label, value, unit, highlight, warning }) {
  return (
    <div className={`rounded-lg p-3 border ${highlight ? 'bg-emerald-50 border-emerald-300' : warning ? 'bg-rose-50 border-rose-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="text-[10px] text-slate-600 mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${highlight ? 'text-emerald-700' : warning ? 'text-rose-700' : 'text-slate-900'}`}>{value}</span>
        <span className="text-xs text-slate-500">{unit}</span>
      </div>
    </div>
  );
}

// ============ 운영자 관리 ============
function ManagersView({ managers, onAdd, onShowInvite, onRevoke }) {
  const activeCount = managers.filter(m => m.status === 'active').length;
  const revokedCount = managers.filter(m => m.status === 'revoked').length;
  
  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4" /> 행사 운영자 관리
            </h2>
            <p className="text-xs text-slate-500 mt-1">행사 진행 중 신규 담당자를 추가하고 카카오톡으로 초대 링크를 발송합니다.</p>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 shadow-sm whitespace-nowrap"
          >
            <UserPlus className="w-4 h-4" />
            신규 등록
          </button>
        </div>

        {/* 현황 통계 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5">
            <div className="text-[10px] text-emerald-700 font-medium">활성</div>
            <div className="text-lg font-bold text-emerald-700">{activeCount}<span className="text-[10px] font-normal ml-0.5">명</span></div>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded p-2.5">
            <div className="text-[10px] text-rose-700 font-medium">권한 회수</div>
            <div className="text-lg font-bold text-rose-700">{revokedCount}<span className="text-[10px] font-normal ml-0.5">명</span></div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded p-2.5">
            <div className="text-[10px] text-slate-700 font-medium">전체</div>
            <div className="text-lg font-bold text-slate-700">{managers.length}<span className="text-[10px] font-normal ml-0.5">명</span></div>
          </div>
        </div>
      </div>

      {/* 권한 등급 안내 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-700 mb-3">▣ 권한 등급별 접근 범위</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {Object.entries(ROLES).map(([key, r]) => {
            const Icon = r.icon;
            return (
              <div key={key} className={`border rounded p-2.5 ${r.light}`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{r.label}</span>
                </div>
                <div className="text-[10px] opacity-80">{r.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 관리자 목록 */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-xs font-bold text-slate-700 mb-3">▣ 등록된 운영자 ({managers.length}명)</h3>
        <div className="space-y-2">
          {managers.map(m => {
            const role = ROLES[m.role];
            const Icon = role.icon;
            const isActive = m.status === 'active';
            return (
              <div
                key={m.id}
                className={`border rounded-lg p-3 transition-all ${
                  isActive 
                    ? 'bg-white border-slate-200 hover:shadow-sm' 
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${role.color}`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900">{m.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${role.light}`}>
                          {role.label}
                        </span>
                        {!isActive && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                            회수됨
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">{m.phone}</div>
                      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{m.token}</span>
                        <span>등록 {m.addedAt}</span>
                        <span className="hidden md:inline">by {m.addedBy}</span>
                      </div>
                    </div>
                  </div>
                  
                  {isActive && (
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => onShowInvite(m)}
                        className="flex items-center gap-1 px-2 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 rounded text-[10px] font-bold whitespace-nowrap"
                      >
                        <MessageCircle className="w-3 h-3" /> 카톡 초대
                      </button>
                      <button
                        onClick={() => onRevoke(m.id)}
                        className="flex items-center gap-1 px-2 py-1.5 border border-rose-300 hover:bg-rose-50 text-rose-700 rounded text-[10px] font-medium whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> 권한 회수
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 보안 안내 */}
      <div className="bg-amber-50 border-l-4 border-amber-500 rounded p-3 text-xs text-amber-900">
        <div className="font-bold mb-1 flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> 보안 운영 수칙
        </div>
        <div className="space-y-0.5 text-[11px]">
          <div>· 초대 링크는 1회용이며, 행사 당일 24시간 후 자동 만료됩니다.</div>
          <div>· 토큰은 외부 유출 금지. 유출 의심 시 즉시 [권한 회수] 버튼을 눌러 차단하세요.</div>
          <div>· 「개인정보보호법」 §29(안전조치 의무)에 따라 모든 접속 이력이 자동 기록됩니다.</div>
          <div>· VVIP 명단 조회 권한은 [총괄] 등급으로 제한 운영 권장.</div>
        </div>
      </div>
    </div>
  );
}

// ============ 플랫폼 공유 모달 ============
function PlatformShareModal({ onClose }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [activeTab, setActiveTab] = useState('intro'); // intro | brief | guide
  
  // ※ 실제 운영 시 화성시 공식 도메인으로 교체 (예: https://hsvip.hscity.go.kr)
  // 현재는 시제품 단계로, 실 도메인 발급 전까지 데모 안내 표시
  const platformUrl = typeof window !== 'undefined' ? window.location.href : '시제품 데모 환경';
  const isPrototype = true; // 정식 배포 후 false로 변경
  
  // 3가지 공유 메시지 템플릿 (시제품 단계 - 외부 공유 불가)
  const messages = {
    intro: `[화성시 빅데이터팀]
공공행사 VIP 실시간 상황관리 플랫폼 안내

▣ 한 줄 소개
 공공행사의 VIP 의전·체크인·결과보고를
 모바일에서 실시간으로 관리하는 플랫폼입니다.

▣ 핵심 기능
 · 참석자 등급별 실시간 상태 추적
 · VVIP 도착 자동 알림
 · 좌석·차량·담당자 통합 관리
 · 행사 종료 후 결과보고 자동 생성
 · 모바일 우선 (현장 즉시 활용)

▣ 시연 안내
 현재 시제품(Prototype) 단계로,
 외부 접속 링크는 별도 배포 후 안내드립니다.
 시연 요청은 빅데이터팀으로 연락 바랍니다.

※ 화성시 빅데이터팀 (AI·데이터 기반 행정혁신)
※ 도입·시연 문의: 빅데이터팀`,
    
    brief: `[공공행사 VIP 실시간 상황관리 플랫폼]

화성시 빅데이터팀이 자체 개발한
행사 운영 솔루션입니다.

· 등급별 참석 현황 실시간 가시화
· VVIP 동선 5단계 추적 (출발→착석)
· 운영자 카카오톡 즉시 초대
· 결과보고서 자동 생성

[시제품 시연 문의: 화성시 빅데이터팀]`,
    
    guide: `[VIP 행사관리 플랫폼 사용안내]

▣ 시작하기
 ① 접속 → ② 엑셀 명단 업로드 → ③ 운영자 초대

▣ 주요 화면
 · 대시보드 : 실시간 참석 현황
 · 모바일 체크인 : 현장 상태 변경
 · VVIP 현황판 : 의전 동선 추적
 · 좌석 현황 : 구역별 착석 가시화
 · 결과보고 : 자동 요약 보고서

▣ 시연 신청
 화성시 빅데이터팀으로 연락 주시면
 정식 배포 일정 및 접속 안내드립니다.

※ 화성시 빅데이터팀`,
  };
  
  const currentMessage = messages[activeTab];
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(platformUrl)}`;
  
  const copyLink = async () => {
    const success = await copyToClipboard(platformUrl);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } else {
      alert('자동 복사에 실패했습니다. 링크를 길게 눌러 직접 복사해 주세요.');
    }
  };
  
  const copyMessage = async () => {
    const success = await copyToClipboard(currentMessage);
    if (success) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } else {
      alert('자동 복사에 실패했습니다. 메시지를 길게 눌러 직접 복사해 주세요.');
    }
  };
  
  const openKakao = () => {
    copyMessage();
    setTimeout(() => { window.location.href = 'kakaotalk://'; }, 300);
  };
  
  // Web Share API (모바일 네이티브 공유 시트)
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '공공행사 VIP 실시간 상황관리 플랫폼',
          text: currentMessage,
          url: platformUrl,
        });
      } catch(e) {}
    } else {
      copyMessage();
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-t-2xl md:rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Share2 className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h3 className="text-base font-bold">플랫폼 공유</h3>
                <p className="text-[11px] text-slate-300">동료에게 플랫폼을 카카오톡으로 공유합니다.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* 시제품 안내 배너 */}
          {isPrototype && (
            <div className="bg-rose-50 border-l-4 border-rose-500 rounded p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-rose-900 leading-relaxed">
                  <div className="font-bold mb-1">⚠ 시제품 단계 — 외부 직접 접속 불가</div>
                  <div className="mb-1">현재 본 플랫폼은 시연용 시제품으로, 카카오톡으로 링크를 공유해도 다른 사람은 접속할 수 없습니다.</div>
                  <div className="font-bold mt-1.5">▣ 외부 공유 시 권장 방법</div>
                  <div>① 화면 캡처·녹화 후 이미지·영상으로 공유</div>
                  <div>② Vercel·Netlify 무료 배포 후 정식 URL 발급 (10분 소요)</div>
                  <div>③ 화성시 정식 인프라 배포 (정식 운영용)</div>
                </div>
              </div>
            </div>
          )}

          {/* 플랫폼 정보 카드 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-slate-900">공공행사 VIP 실시간 상황관리 플랫폼</div>
                <div className="text-[11px] text-slate-600 mt-0.5">화성시 빅데이터팀 · AI·데이터 기반 행정혁신</div>
                <div 
                  onClick={copyLink}
                  className="text-[10px] text-slate-500 mt-1 font-mono break-all cursor-pointer hover:text-slate-800 select-all"
                  title="클릭하여 복사"
                >
                  {platformUrl}
                </div>
              </div>
            </div>
          </div>

          {/* QR + 링크 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div className="bg-white border-2 border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center">
              <img src={qrUrl} alt="플랫폼 QR" className="w-36 h-36 mb-2" />
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <QrCode className="w-3 h-3" /> QR로 즉시 접속
              </div>
            </div>
            <div className="space-y-2 flex flex-col">
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium"
              >
                {copiedLink ? <><Check className="w-3.5 h-3.5" /> 링크 복사됨</> : <><Link2 className="w-3.5 h-3.5" /> 링크만 복사</>}
              </button>
              {typeof navigator !== 'undefined' && navigator.share && (
                <button
                  onClick={nativeShare}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded text-xs font-medium"
                >
                  <Share2 className="w-3.5 h-3.5" /> 시스템 공유
                </button>
              )}
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-[10px] text-emerald-800 flex-1">
                <div className="font-bold mb-0.5">▣ 공유 가능 대상</div>
                <div>· 화성시 내·외부 협력기관</div>
                <div>· 행사 운영 위탁업체</div>
                <div>· 타 지자체 벤치마킹 요청</div>
              </div>
            </div>
          </div>

          {/* 메시지 템플릿 선택 */}
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-600 mb-1.5">▣ 공유 메시지 템플릿</div>
            <div className="grid grid-cols-3 gap-1 mb-2">
              {[
                { id: 'intro', label: '상세 소개' },
                { id: 'brief', label: '간단 안내' },
                { id: 'guide', label: '사용 가이드' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-2 py-1.5 text-[11px] font-medium rounded transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 max-h-44 overflow-y-auto">
              <pre className="text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed select-all cursor-text">{currentMessage}</pre>
            </div>
          </div>

          {/* 메인 액션 */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={copyMessage}
              className="flex items-center justify-center gap-1.5 px-3 py-3 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-900"
            >
              {copiedText ? <><Check className="w-4 h-4" /> 복사됨</> : <><Copy className="w-4 h-4" /> 메시지 복사</>}
            </button>
            <button
              onClick={openKakao}
              className="flex items-center justify-center gap-1.5 px-3 py-3 bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold hover:bg-yellow-500"
            >
              <MessageCircle className="w-4 h-4" /> 카카오톡 열기
            </button>
          </div>

          {/* 사용 안내 */}
          <div className="mt-3 bg-slate-50 border border-slate-200 rounded p-2.5 text-[10px] text-slate-600 leading-relaxed">
            <div className="font-bold text-slate-700 mb-0.5">▣ 사용 안내</div>
            <div>① 메시지 템플릿 선택 → ② [메시지 복사] 또는 [카카오톡 열기]</div>
            <div>③ 카카오톡 채팅방에 붙여넣기 → ④ 전송</div>
            <div className="mt-1 pt-1 border-t border-slate-200 text-slate-500">
              ※ 본 공유 기능은 플랫폼 자체 안내용이며, 참석자 개인정보는 포함되지 않습니다.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ 엑셀 업로드 ============
function UploadView() {
  const [uploaded, setUploaded] = useState(false);
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-base font-bold text-slate-900 mb-1">참석자 명단 엑셀 업로드</h2>
        <p className="text-xs text-slate-500 mb-5">사전 등록된 참석자 명단(.xlsx)을 업로드하면 자동으로 명단이 생성됩니다.</p>

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50">
          <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700 mb-1">엑셀 파일을 끌어다 놓거나 클릭하여 업로드</p>
          <p className="text-xs text-slate-500 mb-4">.xlsx, .xls 형식 지원 · 최대 10MB</p>
          <button 
            onClick={() => setUploaded(true)}
            className="px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-900"
          >
            파일 선택
          </button>
          {uploaded && (
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              샘플 데이터 85건이 적용되었습니다.
            </div>
          )}
        </div>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800">
          <div className="font-bold mb-1">▣ 필수 컬럼 (양식)</div>
          <div className="font-mono text-[11px]">성명 | 등급(VVIP/VIP/일반/관계자) | 소속 | 직위 | 차량번호 | 좌석번호 | 담당자</div>
        </div>

        <div className="mt-3 text-[10px] text-slate-500">
          ※ 개인정보보호법에 따라 행사 종료 후 30일 이내 자동 파기됩니다.
        </div>
      </div>
    </div>
  );
}
