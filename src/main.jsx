import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// 행사 종료 안내 화면 — 명단·사진·실시간 자료는 모두 내려갔습니다.
function Closed() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f172a,#1e1b4b 60%,#0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: 420, textAlign: 'center', color: '#fff' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: '#fbbf24', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 28 }}>✓</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>AI EXPO 「MARS 2026」 개막식</div>
        <div style={{ color: '#cbd5e1', fontSize: 14, marginTop: 4 }}>2026. 11. 3.(화) · 코엑스 3층 오디토리움</div>
        <div style={{ marginTop: 20, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 16, padding: '14px 16px', textAlign: 'left' }}>
          <div style={{ color: '#fcd34d', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>내빈 운영 플랫폼 운영이 종료되었습니다.</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: '#e2e8f0' }}>행사가 마무리되어 명단·도착 기록 등 모든 자료는 삭제되었습니다.<br />플랫폼 문의: 화성특례시 AI스마트전략실 AI전략팀 전명구 주무관 (☎ 3652)</div>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 18 }}>화성특례시 AI스마트전략실 · 내빈 운영 플랫폼</div>
      </div>
    </div>
  )
}
ReactDOM.createRoot(document.getElementById('root')).render(<Closed />)
