// 내빈 사진 — src/photos/ 폴더에 「성명.jpg」(동명이인은 「성명_소속.jpg」)로 넣으면 자동 연결됩니다.
// 권장 크기 120×160(세로형), 10KB 내외. 빌드 시 파일명 기준으로 묶이며 명단이 바뀌어도 이름으로 다시 연결됩니다.
const mods = import.meta.glob('./photos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
export const PHOTOS = {};
for (const [p, url] of Object.entries(mods)) {
  const base = decodeURIComponent(p.split('/').pop().replace(/\.[^.]+$/, '')).normalize('NFC');
  PHOTOS[base] = url;
}
// 동명이인: 사진 주인의 소속에 들어 있는 글자. 소속이 맞지 않으면 사진을 붙이지 않음
const ONLY = { '김승원': ['수원시갑', '수원 갑'], '김태형': ['경기도의회'], '김진영': ['의과학대'], '한상선': ['FTA'], '김미영': ['시의회'], '김덕천': ['오케이', '로지웰'] };
export const photoOf = (a) => {
  if (!a || !a.name) return null;
  const n = String(a.name).trim().normalize('NFC');
  const org = String(a.organization || '').trim().normalize('NFC');
  const exact = PHOTOS[`${n}_${org}`]; if (exact) return exact;
  const only = ONLY[n]; if (only && !only.some(k => org.includes(k))) return null;
  return PHOTOS[n] || null;
};
export const PHOTO_COUNT = Object.keys(PHOTOS).length;
