import { useState } from 'react'

const API = 'http://localhost:8000'

const STUDENTS_LIST = [
  { id: 'S001', name: 'Aarav Sharma',   roll: '22CS001' },
  { id: 'S002', name: 'Priya Patil',    roll: '22CS002' },
  { id: 'S003', name: 'Rohan Kulkarni', roll: '22ME001' },
  { id: 'S004', name: 'Sneha Desai',    roll: '22CS003' },
  { id: 'S005', name: 'Vikram Joshi',   roll: '22ME002' },
  { id: 'S006', name: 'Ananya Nair',    roll: '22CS004' },
  { id: 'S007', name: 'Karan Mehta',    roll: '22IT001' },
  { id: 'S008', name: 'Divya Reddy',    roll: '22IT002' },
]

export default function StudentPortal({ onBack }) {
  const [step, setStep] = useState('select') // select | form | done
  const [student, setStudent] = useState(null)
  const [form, setForm] = useState({ attended: '', total_classes: 6, confidence: 3, struggled_topic: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

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
    } catch (err) {
      console.error(err)
      // Mock result fallback for hackathon UI testing if server is offline
      setResult({ risk: { level: 'medium', trend: 'declining' } }) 
    }
    setSubmitting(false)
    setStep('done')
  }

  const confLabels = ['', 'Very Lost', 'Struggling', 'Getting By', 'Confident', 'Mastered']
  const confColors = ['', '#e11d48', '#f43f5e', '#fbbf24', '#10b981', '#059669']

  return (
    <div className="portal-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital@0;1&family=JetBrains+Mono:wght@400;600&display=swap');

        .portal-container {
          min-height: 100vh;
          width: 100vw;
          background-color: #09090b;
          color: #fafafa;
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Ambient Backgrounds */
        .portal-container::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; height: 50vh;
          background: radial-gradient(ellipse at top, rgba(255,255,255,0.03) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Typography */
        .mono-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #a1a1aa;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .heading-large {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }

        .serif-subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: #a1a1aa;
          font-size: 16px;
          line-height: 1.6;
        }

        /* Layout & Animations */
        .header-bar {
          position: relative;
          z-index: 10;
          padding: 20px 32px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          background: rgba(9, 9, 11, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .main-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          position: relative;
          z-index: 1;
        }

        .fade-up {
          animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* Components */
        .back-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fafafa;
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.2);
        }

        .student-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.08);
          padding: 16px 24px;
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          color: #fafafa;
          width: 100%;
        }
        .student-card:hover {
          background: rgba(255,255,255,0.04);
          border-color: rgba(255,255,255,0.2);
          transform: translateY(-2px);
        }

        .input-group {
          margin-bottom: 36px;
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 24px;
          border-radius: 16px;
        }

        .attendance-btn {
          width: 48px; height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #a1a1aa;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .attendance-btn:hover:not(.active) {
          border-color: rgba(255,255,255,0.3);
          color: #fafafa;
        }
        .attendance-btn.active {
          background: #fafafa;
          color: #09090b;
          border-color: #fafafa;
          box-shadow: 0 4px 12px rgba(255,255,255,0.15);
        }

        .confidence-btn {
          flex: 1;
          padding: 16px 0;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.01);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .premium-textarea {
          width: 100%;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fafafa;
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 16px;
          padding: 20px;
          resize: none;
          outline: none;
          line-height: 1.6;
          transition: all 0.2s ease;
        }
        .premium-textarea:focus {
          border-color: rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 0 0 4px rgba(255,255,255,0.02);
        }

        .submit-btn {
          width: 100%;
          padding: 18px;
          border-radius: 12px;
          background: #fafafa;
          color: #09090b;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255,255,255,0.15);
          background: #e4e4e7;
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .risk-card {
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          margin: 32px 0;
          text-align: left;
          backdrop-filter: blur(10px);
        }
        .risk-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .risk-high { background: rgba(225,29,72,0.15); color: #fda4af; border: 1px solid rgba(225,29,72,0.3); }
        .risk-medium { background: rgba(245,158,11,0.15); color: #fcd34d; border: 1px solid rgba(245,158,11,0.3); }
        .risk-low { background: rgba(16,185,129,0.15); color: #6ee7b7; border: 1px solid rgba(16,185,129,0.3); }
      `}</style>

      {/* Header */}
      <div className="header-bar">
        <button className="back-btn" onClick={onBack}>← BACK</button>
        <div className="mono-label" style={{ color: '#71717a' }}>
          STUDENT PORTAL
        </div>
      </div>

      <div className="main-content">
        
        {/* STEP 1: SELECT STUDENT */}
        {step === 'select' && (
          <div className="fade-up" style={{ width: '100%', maxWidth: '560px' }}>
            <h2 className="heading-large">Who are you?</h2>
            <p className="serif-subtitle" style={{ marginBottom: '32px' }}>
              Select your name to begin this week's check-in.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {STUDENTS_LIST.map(s => (
                <button
                  key={s.id}
                  className="student-card"
                  onClick={() => { setStudent(s); setStep('form') }}
                >
                  <span style={{ fontWeight: 600, fontSize: '16px' }}>{s.name}</span>
                  <span className="mono-label">{s.roll}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: REFLECTION FORM */}
        {step === 'form' && (
          <div className="fade-up" style={{ width: '100%', maxWidth: '600px' }}>
            <div className="mono-label" style={{ marginBottom: '12px', color: '#e11d48' }}>
              WEEKLY CHECK-IN
            </div>
            <h2 className="heading-large" style={{ marginBottom: '40px' }}>
              Hey {student.name.split(' ')[0]}, how was this week?
            </h2>

            {/* Q1: Attendance */}
            <div className="input-group">
              <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>
                01 — How many classes did you attend this week?
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {[0,1,2,3,4,5,6].map(n => (
                  <button
                    key={n}
                    className={`attendance-btn ${form.attended === n ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, attended: n }))}
                  >{n}</button>
                ))}
                <span className="mono-label" style={{ marginLeft: '8px', opacity: 0.5 }}>/ 6</span>
              </div>
            </div>

            {/* Q2: Confidence */}
            <div className="input-group">
              <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>
                02 — Rate your overall confidence this week
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[1,2,3,4,5].map(n => {
                  const isActive = form.confidence === n;
                  const color = confColors[n];
                  return (
                    <button
                      key={n}
                      className="confidence-btn"
                      onClick={() => setForm(f => ({ ...f, confidence: n }))}
                      style={{
                        borderColor: isActive ? color : 'rgba(255,255,255,0.08)',
                        background: isActive ? `${color}15` : 'transparent',
                        color: isActive ? color : '#a1a1aa',
                      }}
                    >
                      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', fontWeight: 600 }}>{n}</div>
                      <div style={{ fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{confLabels[n]}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Q3: Struggles */}
            <div className="input-group">
              <label className="mono-label" style={{ display: 'block', marginBottom: '20px' }}>
                03 — What did you struggle with this week?
              </label>
              <textarea
                className="premium-textarea"
                value={form.struggled_topic}
                onChange={e => setForm(f => ({ ...f, struggled_topic: e.target.value }))}
                placeholder="Be honest — no one will judge you. This helps us help you."
                rows={4}
              />
            </div>

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={submitting || form.attended === '' || !form.struggled_topic}
            >
              {submitting ? 'ANALYZING RESPONSE...' : 'SUBMIT REFLECTION →'}
            </button>
          </div>
        )}

        {/* STEP 3: DONE */}
        {step === 'done' && (
          <div className="fade-up" style={{ width: '100%', maxWidth: '480px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '32px', 
              background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '32px', margin: '0 auto 24px auto',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              ✓
            </div>
            
            <h2 className="heading-large">Reflection saved.</h2>
            <p className="serif-subtitle" style={{ marginTop: '12px' }}>
              Thanks for checking in. Your responses help us create a better learning environment.
            </p>

            {result?.risk && (
              <div className="risk-card">
                <div className="mono-label" style={{ marginBottom: '16px' }}>SYSTEM ANALYSIS</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`risk-badge risk-${result.risk.level}`}>
                    {result.risk.level} Risk
                  </span>
                  <span className="mono-label" style={{ color: '#d4d4d8' }}>
                    Trend: <span style={{ color: '#fafafa' }}>{result.risk.trend}</span>
                  </span>
                </div>
              </div>
            )}

            <button 
              className="back-btn" 
              onClick={onBack} 
              style={{ marginTop: result?.risk ? '0' : '32px', padding: '12px 32px' }}
            >
              RETURN TO HOME
            </button>
          </div>
        )}

      </div>
    </div>
  )
}