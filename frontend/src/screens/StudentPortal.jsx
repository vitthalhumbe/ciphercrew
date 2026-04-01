import { useState } from 'react'

const API = 'http://localhost:8000'

export default function StudentPortal({ onBack }) {
  const [step, setStep] = useState('login') // login | form | done
  const [student, setStudent] = useState(null)
  
  // Login State
  const [credentials, setCredentials] = useState({ roll: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [authenticating, setAuthenticating] = useState(false)

  // Form State
  const [form, setForm] = useState({ attended: '', total_classes: 6, confidence: 3, struggled_topic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  // --- API Calls ---
  async function handleLogin(e) {
    e.preventDefault()
    setAuthenticating(true)
    setLoginError('')
    
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      if (!res.ok) throw new Error('Invalid roll number or password')
      
      const userData = await res.json()
      setStudent(userData)
      setStep('form')
    } catch (err) {
      setLoginError(err.message)
    } finally {
      setAuthenticating(false)
    }
  }

  async function handleSubmit() {
    if (form.attended === '' || !form.struggled_topic) return
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/reflect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: student.id,
          attended: parseInt(form.attended),
          total_classes: parseInt(form.total_classes),
          confidence: form.confidence,
          struggled_topic: form.struggled_topic,
        }),
      })
      const data = await res.json()
      setResult(data)
      setStep('done')
    } catch (err) {
      console.error(err)
      setLoginError("Failed to connect to server.")
      setSubmitting(false)
    }
  }

  const confLabels = ['', 'Very Lost', 'Struggling', 'Getting By', 'Confident', 'Mastered']
  const confColors = ['', 'var(--accent-red)', 'var(--accent-red)', 'var(--accent-yellow)', 'var(--accent-green)', 'var(--accent-green)']

  return (
    <div className="portal-wrapper">
      <style>{`
        .portal-wrapper { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 40px 24px; 
  overflow-y: auto; 
}
        .mono-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); letter-spacing: 0.15em; text-transform: uppercase; }
        .heading-large { font-size: clamp(28px, 5vw, 40px); font-weight: 700; letter-spacing: -0.02em; margin-bottom: 8px; color: var(--text-main); }
        .serif-subtitle { font-family: 'Playfair Display', serif; font-style: italic; color: var(--text-muted); font-size: 18px; line-height: 1.6; }
        
        .input-group { margin-bottom: 32px; background: var(--bg-surface); border: 1px solid var(--border); padding: 24px; border-radius: 16px; }
        .auth-input { width: 100%; background: transparent; border: 1px solid var(--border); color: var(--text-main); font-family: 'JetBrains Mono', monospace; padding: 16px; border-radius: 8px; margin-bottom: 16px; transition: all 0.2s; }
        .auth-input:focus { border-color: var(--text-main); outline: none; background: var(--bg-surface-hover); }
        
        .attendance-btn { width: 48px; height: 48px; border-radius: 12px; border: 1px solid var(--border); background: transparent; color: var(--text-muted); cursor: pointer; font-family: 'JetBrains Mono', monospace; font-size: 15px; font-weight: 600; transition: all 0.2s ease; }
        .attendance-btn:hover:not(.active) { border-color: var(--border-strong); color: var(--text-main); background: var(--bg-surface-hover); }
        .attendance-btn.active { background: var(--text-main); color: var(--bg-base); border-color: var(--text-main); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        
        .confidence-btn { flex: 1; padding: 16px 0; border-radius: 12px; border: 1px solid var(--border); background: var(--bg-surface); cursor: pointer; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .premium-textarea { width: 100%; background: transparent; border: 1px solid var(--border); border-radius: 12px; color: var(--text-main); font-family: 'Playfair Display', serif; font-style: italic; font-size: 16px; padding: 20px; resize: none; outline: none; line-height: 1.6; transition: all 0.2s ease; }
        .premium-textarea:focus { border-color: var(--text-muted); background: var(--bg-surface-hover); }
        
        .submit-btn { width: 100%; padding: 18px; border-radius: 12px; background: var(--text-main); color: var(--bg-base); font-family: 'Inter', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.05em; border: none; cursor: pointer; transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); opacity: 0.9; }
        .submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* STEP 1: LOGIN */}
      {step === 'login' && (
        <form onSubmit={handleLogin} className="fade-up" style={{ width: '100%', maxWidth: '440px' }}>
          <div className="mono-label" style={{ marginBottom: '12px', color: 'var(--text-muted)' }}>STUDENT PORTAL</div>
          <h2 className="heading-large" style={{ marginBottom: '8px' }}>Sign In</h2>
          <p className="serif-subtitle" style={{ marginBottom: '32px' }}>Enter your credentials to submit today's reflection.</p>
          
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Roll Number (e.g. 22CS001)" 
              className="auth-input"
              value={credentials.roll}
              onChange={e => setCredentials({...credentials, roll: e.target.value.toUpperCase()})}
              required
            />
            <input 
              type="password" 
              placeholder="Password (demo: pass123)" 
              className="auth-input"
              value={credentials.password}
              onChange={e => setCredentials({...credentials, password: e.target.value})}
              required
            />
            
            {loginError && (
              <div className="mono-label" style={{ color: 'var(--accent-red)', marginBottom: '16px', background: 'rgba(244, 63, 94, 0.1)', padding: '12px', borderRadius: '6px' }}>
                ⚠ {loginError}
              </div>
            )}
            
            <button type="submit" className="submit-btn" disabled={authenticating}>
              {authenticating ? 'AUTHENTICATING...' : 'SECURE LOGIN →'}
            </button>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <button type="button" onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline' }}>
              ← Return to Home
            </button>
          </div>
        </form>
      )}

      {/* STEP 2: REFLECTION FORM */}
      {step === 'form' && (
        <div className="fade-up" style={{ width: '100%', maxWidth: '600px', paddingBottom: '40px' }}>
          <div className="mono-label" style={{ marginBottom: '12px', color: 'var(--accent-red)' }}>DAILY CHECK-IN</div>
          <h2 className="heading-large" style={{ marginBottom: '40px' }}>Hey {student.name.split(' ')[0]}, how was today?</h2>

          <div className="input-group">
            <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>01 — How many classes did you attend today?</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {[0,1,2,3,4,5,6].map(n => (
                <button key={n} className={`attendance-btn ${form.attended === n ? 'active' : ''}`} onClick={() => setForm(f => ({ ...f, attended: n }))}>{n}</button>
              ))}
              <span className="mono-label" style={{ marginLeft: '8px', opacity: 0.5 }}>/ 6</span>
            </div>
          </div>

          <div className="input-group">
            <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>02 — Rate your overall confidence today</label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[1,2,3,4,5].map(n => {
                const isActive = form.confidence === n;
                const color = confColors[n];
                return (
                  <button key={n} className="confidence-btn" onClick={() => setForm(f => ({ ...f, confidence: n }))} style={{ borderColor: isActive ? color : 'var(--border)', background: isActive ? 'var(--bg-surface-hover)' : 'transparent', color: isActive ? color : 'var(--text-muted)', boxShadow: isActive ? `0 0 0 1px ${color}` : 'none' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', fontWeight: 600 }}>{n}</div>
                    <div style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{confLabels[n]}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="input-group">
            <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>03 — What did you struggle with today?</label>
            <textarea className="premium-textarea" value={form.struggled_topic} onChange={e => setForm(f => ({ ...f, struggled_topic: e.target.value }))} placeholder="Be honest — no one will judge you. This helps us help you." rows={4} />
          </div>

          <button className="submit-btn" onClick={handleSubmit} disabled={submitting || form.attended === '' || !form.struggled_topic}>
            {submitting ? 'ANALYZING RESPONSE...' : 'SUBMIT REFLECTION →'}
          </button>
        </div>
      )}

      {/* STEP 3: DONE */}
      {step === 'done' && (
        <div className="fade-up" style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'var(--bg-surface)', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px auto', border: '1px solid var(--accent-green)' }}>✓</div>
          <h2 className="heading-large">{result?.message || 'Reflection saved.'}</h2>
          <p className="serif-subtitle" style={{ marginTop: '12px' }}>Thanks for checking in. Your responses help us create a better learning environment.</p>

          <button onClick={onBack} style={{ marginTop: '32px', padding: '12px 32px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 600 }}>
            RETURN TO HOME
          </button>
        </div>
      )}
    </div>
  )
}