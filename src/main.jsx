import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 화면 오류 방지막: 어떤 이유로든 그리기 오류가 나면 흰 화면 대신 복구 단추를 보여줌
class Boundary extends React.Component {
  constructor(p) { super(p); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (!this.state.err) return this.props.children;
    const reset = () => { try { localStorage.removeItem('mars-vip-platform-v2'); } catch {} location.reload(); };
    return (
      <div style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 480, margin: '40px auto' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>화면에 문제가 생겼습니다</h2>
        <p style={{ fontSize: 13, color: '#475569', margin: '8px 0 16px' }}>서버 자료는 안전합니다. 아래 단추를 누르면 이 기기의 임시 자료를 지우고 서버에서 다시 받아옵니다. (관리자는 다시 입장)</p>
        <button onClick={reset} style={{ background: '#1e293b', color: '#fff', padding: '10px 16px', borderRadius: 8, fontWeight: 700, marginRight: 8 }}>자료 다시 받고 새로고침</button>
        <button onClick={() => location.reload()} style={{ border: '1px solid #cbd5e1', padding: '10px 16px', borderRadius: 8 }}>그냥 새로고침</button>
        <pre style={{ fontSize: 10, color: '#94a3b8', marginTop: 16, whiteSpace: 'pre-wrap' }}>{String(this.state.err && this.state.err.message)}</pre>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Boundary><App /></Boundary>
  </React.StrictMode>,
)
