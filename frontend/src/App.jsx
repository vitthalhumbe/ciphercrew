import { useState, useEffect } from 'react'

// Import your screens (uncomment these in your actual project)
import StudentPortal from './screens/StudentPortal.jsx'
import AdminDashboard from './screens/AdminDashboard.jsx'
import StudentDetail from './screens/StudentDetail.jsx'

export default function App() {
  // --- GLOBAL STATE ---
  const [view, setView] = useState('landing') // landing | student | admin | detail
  const [selectedStudent, setSelectedStudent] = useState(null)
  
  // Theme State (Default to Dark, check local storage if you want to be fancy)
  const [isDark, setIsDark] = useState(true)

  // --- ROUTER HELPER ---
  const navigateTo = (path, student = null) => {
    if (student) setSelectedStudent(student)
    setView(path)
  }

  return (
    <div className={`app-root ${isDark ? 'theme-dark' : 'theme-light'}`}>
      
      {/* GLOBAL CSS VARIABLES 
        Because these are defined at the root, ALL your child components 
        (StudentPortal, AdminDashboard, etc.) will automatically inherit them!
      */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital@0;1&family=JetBrains+Mono:wght@400;600;700&display=swap');

        .theme-dark {
          --bg-base: #09090b;
          --bg-surface: rgba(255,255,255,0.02);
          --bg-surface-hover: rgba(255,255,255,0.04);
          --border: rgba(255,255,255,0.08);
          --border-strong: rgba(255,255,255,0.2);
          --text-main: #fafafa;
          --text-muted: #a1a1aa;
          --text-dim: #71717a;
          --accent-red: #f43f5e;
          --accent-yellow: #fbbf24;
          --accent-green: #10b981;
          --accent-blue: #3b82f6;
        }

        .theme-light {
          --bg-base: #f4f4f5;
          --bg-surface: #ffffff;
          --bg-surface-hover: #f8fafc;
          --border: rgba(0,0,0,0.08);
          --border-strong: rgba(0,0,0,0.2);
          --text-main: #09090b;
          --text-muted: #52525b;
          --text-dim: #a1a1aa;
          --accent-red: #e11d48;
          --accent-yellow: #d97706;
          --accent-green: #059669;
          --accent-blue: #2563eb;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .app-root {
          height: 100vh;
          width: 100vw;
          background-color: var(--bg-base);
          color: var(--text-main);
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          transition: background-color 0.3s ease, color 0.3s ease;
          overflow: hidden;
        }

        /* Global Navbar */
        .global-nav {
          height: 64px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
          z-index: 100;
        }

        .nav-logo {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: -0.02em;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .nav-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-btn:hover { color: var(--text-main); background: var(--bg-surface-hover); }
        .nav-btn.active { color: var(--bg-base); background: var(--text-main); }

        .theme-toggle-btn {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .theme-toggle-btn:hover { border-color: var(--border-strong); }

        .main-content {
          flex: 1;
          position: relative;
          overflow: hidden; /* Let the child screens handle their own scrolling */
        }
      `}</style>

      {/* --- PERSISTENT GLOBAL NAVIGATION --- */}
      <nav className="global-nav">
        {/* Click logo to go home */}
        <div className="nav-logo" onClick={() => navigateTo('landing')}>
          DROP<span style={{ color: 'var(--accent-red)' }}>WATCH</span>
        </div>

        <div className="nav-links">
          <button 
            className={`nav-btn ${view === 'student' ? 'active' : ''}`}
            onClick={() => navigateTo('student')}
          >
            STUDENT PORTAL
          </button>
          
          <button 
            className={`nav-btn ${(view === 'admin' || view === 'detail') ? 'active' : ''}`}
            onClick={() => navigateTo('admin')}
          >
            ADMIN DASHBOARD
          </button>

          <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 8px' }} />

          {/* Universal Theme Toggle */}
          <button 
            className="theme-toggle-btn" 
            onClick={() => setIsDark(!isDark)}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* --- ROUTER VIEW --- */}
      <main className="main-content">
        
        {view === 'landing' && (
          <LandingView onNavigate={navigateTo} />
        )}

        {view === 'student' && (
          <StudentPortal onBack={() => navigateTo('landing')} />
        )}

        {view === 'admin' && (
          <AdminDashboard 
            onBack={() => navigateTo('landing')}
            onSelectStudent={(student) => navigateTo('detail', student)}
          />
        )}

        {view === 'detail' && (
          <StudentDetail 
            student={selectedStudent} 
            onBack={() => navigateTo('admin')} 
          />
        )}

      </main>
    </div>
  )
}

// --- EXTRACTED LANDING PAGE COMPONENT ---
function LandingView({ onNavigate }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Ambient Glows */}
      <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(244, 63, 94, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      
      <div style={{ textAlign: 'center', zIndex: 10, animation: 'fadeUp 0.8s ease forwards' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '12px', color: 'var(--accent-red)', letterSpacing: '0.25em', marginBottom: '24px', padding: '8px 20px', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '100px', display: 'inline-block', background: 'rgba(244, 63, 94, 0.05)' }}>
          AI RISK ANALYSIS ACTIVE
        </div>

        <h1 style={{ fontSize: 'clamp(56px, 10vw, 100px)', fontWeight: 800, lineHeight: 0.9, marginBottom: '24px', letterSpacing: '-0.04em' }}>
          DROP<br /><span style={{ color: 'var(--accent-red)' }}>WATCH</span>
        </h1>

        <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '20px', lineHeight: 1.6, marginBottom: '48px' }}>
          Weekly reflections → AI analysis → Institutional reports.<br/>
          Catch silent dropout before it becomes irreversible.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          <button 
            onClick={() => onNavigate('student')}
            style={{ padding: '16px 36px', borderRadius: '100px', background: 'var(--text-main)', color: 'var(--bg-base)', border: 'none', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            I AM A STUDENT
          </button>
          <button 
            onClick={() => onNavigate('admin')}
            style={{ padding: '16px 36px', borderRadius: '100px', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-strong)', fontFamily: 'Inter', fontWeight: 600, letterSpacing: '0.05em', cursor: 'pointer' }}
          >
            ADMIN DASHBOARD
          </button>
        </div>
      </div>
    </div>
  )
}