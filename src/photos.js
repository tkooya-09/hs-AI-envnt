// 내빈 사진 — src/photos/ 폴더에 「성명.jpg」(동명이인은 「성명_소속.jpg」)로 넣으면 자동 연결됩니다.
// 권장 크기 120×160(세로형), 10KB 내외. 빌드 시 파일명 기준으로 묶이며 명단이 바뀌어도 이름으로 다시 연결됩니다.
const mods = import.meta.glob('./photos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });
export const PHOTOS = {};
for (const [p, url] of Object.entries(mods)) {
  const base = decodeURIComponent(p.split('/').pop().replace(/\.[^.]+$/, '')).normalize('NFC');
  PHOTOS[base] = url;
}
export const photoOf = (a) => {
  if (!a || !a.name) return null;
  const n = String(a.name).trim().normalize('NFC');
  return PHOTOS[`${n}_${(a.organization || '').trim().normalize('NFC')}`] || PHOTOS[n] || null;
};
export const PHOTO_COUNT = Object.keys(PHOTOS).length;
