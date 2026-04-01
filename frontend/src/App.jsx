import { useState } from 'react'
import StudentPortal from './screens/StudentPortal.jsx'
import AdminDashboard from './screens/AdminDashboard.jsx'
import StudentDetail from './screens/StudentDetail.jsx'

export default function App() {
  const [view, setView] = useState('landing') // landing | student | admin | detail
  const [selectedStudent, setSelectedStudent] = useState(null)

  // -- Routing Logic Remains Untouched --
  if (view === 'student') return <StudentPortal onBack={() => setView('landing')} />
  if (view === 'admin') return (
    <AdminDashboard
      onBack={() => setView('landing')}
      onSelectStudent={(s) => { setSelectedStudent(s); setView('detail') }}
    />
  )
  if (view === 'detail') return (
    <StudentDetail
      student={selectedStudent}
      onBack={() => setView('admin')}
    />
  )

  // -- Premium Landing View --
  return (
    <div className="app-container">
      {/* Self-contained premium styles. 
        Pulls in beautiful fonts: Inter (sans), Playfair (serif), JetBrains (mono).
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Playfair+Display:ital@0;1&family=JetBrains+Mono:wght@400;700&display=swap');

        :root {
          --bg-base: #09090b;
          --text-main: #fafafa;
          --text-muted: #a1a1aa;
          --accent-red: #e11d48;
          --accent-glow: rgba(225, 29, 72, 0.15);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .app-container {
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-base);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Ambient Background Glows */
        .ambient-glow-1 {
          position: absolute;
          top: -20%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          filter: blur(80px);
          z-index: 0;
          pointer-events: none;
        }

        .ambient-glow-2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: 50vw;
          height: 50vw;
          background: radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%);
          filter: blur(60px);
          z-index: 0;
          pointer-events: none;
        }

        /* Fading Dot Grid (Masked at edges) */
        .premium-dot-grid {
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
          z-index: 0;
          pointer-events: none;
        }

        /* Main Content Animation */
        .content-wrapper {
          position: relative;
          z-index: 10;
          text-align: center;
          max-width: 700px;
          padding: 0 24px;
          animation: fadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Glassmorphic Badge */
        .system-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          color: #fda4af;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 2rem;
          display: inline-block;
          padding: 8px 20px;
          border: 1px solid rgba(225, 29, 72, 0.3);
          border-radius: 100px;
          background: rgba(225, 29, 72, 0.08);
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 24px rgba(225, 29, 72, 0.1);
        }

        /* Typography */
        .hero-title {
          font-size: clamp(64px, 12vw, 110px);
          font-weight: 800;
          line-height: 0.85;
          letter-spacing: -0.04em;
          margin-bottom: 1.5rem;
          color: var(--text-main);
        }

        .hero-title span {
          background: linear-gradient(135deg, #ff4b6e 0%, #b90024 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: var(--text-muted);
          font-size: clamp(18px, 4vw, 22px);
          line-height: 1.6;
          margin-bottom: 3.5rem;
          font-weight: 400;
        }

        .hero-subtitle strong {
          color: #d4d4d8;
          font-weight: 400;
        }

        /* Buttons */
        .button-group {
          display: flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-premium {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.08em;
          padding: 16px 36px;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
          text-transform: uppercase;
        }

        .btn-primary {
          background: var(--text-main);
          color: var(--bg-base);
          border: 1px solid transparent;
          box-shadow: 0 4px 14px rgba(255,255,255,0.1);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.2);
          background: #e4e4e7;
        }

        .btn-secondary {
          background: rgba(255,255,255,0.03);
          color: var(--text-main);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.08);
          transform: translateY(-2px);
        }

        /* Footer */
        .footer-text {
          position: absolute;
          bottom: 32px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.2em;
          opacity: 0.5;
          z-index: 10;
        }
      `}</style>

      {/* Background Elements */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />
      <div className="premium-dot-grid" />

      {/* Main Content */}
      <div className="content-wrapper">
        <div className="system-badge">AI Risk Analysis Active</div>

        <h1 className="hero-title">
          DROP<br /><span>WATCH</span>
        </h1>

        <p className="hero-subtitle">
          Weekly student reflections <strong>→</strong> AI risk analysis <strong>→</strong> institutional reports.<br/>
          Catch silent dropout before it becomes irreversible.
        </p>

        <div className="button-group">
          <button 
            className="btn-premium btn-primary" 
            onClick={() => setView('student')}
          >
            I am a Student
          </button>
          <button 
            className="btn-premium btn-secondary" 
            onClick={() => setView('admin')}
          >
            Admin Dashboard
          </button>
        </div>
      </div>

      <div className="footer-text">
        PCCOE PUNE — HACKATHON DEMO
      </div>
    </div>
  )
}