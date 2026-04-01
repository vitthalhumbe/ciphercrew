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
  const confColors = ['', 'var(--accent-red)', 'var(--accent-red)', 'var(--accent-yellow)', 'var(--accent-green)', 'var(--accent-green)']

  return (
    <div className="portal-wrapper">
      <style>{`
        /* Portal Specific Layout Styles (Inherits colors from App.jsx) */
        .portal-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
          overflow-y: auto;
        }

        .mono-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .heading-large {
          font-size: clamp(28px, 5vw, 40px);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: 8px;
          color: var(--text-main);
        }

        .serif-subtitle {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          color: var(--text-muted);
          font-size: 18px;
          line-height: 1.6;
        }

        .student-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 16px 24px;
          border-radius: 12px;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.2s ease;
          color: var(--text-main);
          width: 100%;
        }
        .student-card:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-strong);
          transform: translateY(-2px);
        }

        .input-group {
          margin-bottom: 32px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          padding: 24px;
          border-radius: 16px;
        }

        .attendance-btn {
          width: 48px; height: 48px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .attendance-btn:hover:not(.active) {
          border-color: var(--border-strong);
          color: var(--text-main);
          background: var(--bg-surface-hover);
        }
        .attendance-btn.active {
          background: var(--text-main);
          color: var(--bg-base);
          border-color: var(--text-main);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .confidence-btn {
          flex: 1;
          padding: 16px 0;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-surface);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .premium-textarea {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text-main);
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
          border-color: var(--text-muted);
          background: var(--bg-surface-hover);
        }

        .submit-btn {
          width: 100%;
          padding: 18px;
          border-radius: 12px;
          background: var(--text-main);
          color: var(--bg-base);
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
          opacity: 0.9;
        }
        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
        <div className="fade-up" style={{ width: '100%', maxWidth: '600px', paddingBottom: '40px' }}>
          <div className="mono-label" style={{ marginBottom: '12px', color: 'var(--accent-red)' }}>
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
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[1,2,3,4,5].map(n => {
                const isActive = form.confidence === n;
                const color = confColors[n];
                return (
                  <button
                    key={n}
                    className="confidence-btn"
                    onClick={() => setForm(f => ({ ...f, confidence: n }))}
                    style={{
                      borderColor: isActive ? color : 'var(--border)',
                      background: isActive ? 'var(--bg-surface-hover)' : 'transparent',
                      color: isActive ? color : 'var(--text-muted)',
                      boxShadow: isActive ? `0 0 0 1px ${color}` : 'none'
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
            background: 'var(--bg-surface)', color: 'var(--accent-green)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', margin: '0 auto 24px auto',
            border: '1px solid var(--accent-green)'
          }}>
            ✓
          </div>
          
          <h2 className="heading-large">Reflection saved.</h2>
          <p className="serif-subtitle" style={{ marginTop: '12px' }}>
            Thanks for checking in. Your responses help us create a better learning environment.
          </p>

          {result?.risk && (
            <div style={{
              padding: '24px', borderRadius: '16px', border: '1px solid var(--border)',
              background: 'var(--bg-surface)', margin: '32px 0', textAlign: 'left'
            }}>
              <div className="mono-label" style={{ marginBottom: '16px' }}>SYSTEM STATUS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{
                  padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'JetBrains Mono',
                  background: `var(--accent-${result.risk.level === 'high' ? 'red' : result.risk.level === 'medium' ? 'yellow' : 'green'})`,
                  color: 'var(--bg-base)'
                }}>
                  {result.risk.level} Risk
                </span>
                <span className="mono-label" style={{ color: 'var(--text-dim)' }}>
                  Trend: <span style={{ color: 'var(--text-main)' }}>{result.risk.trend}</span>
                </span>
              </div>
            </div>
          )}

          <button 
            onClick={onBack} 
            style={{ 
              marginTop: result?.risk ? '0' : '32px', padding: '12px 32px',
              background: 'transparent', border: '1px solid var(--border)',
              color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer',
              fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 600
            }}
          >
            RETURN TO HOME
          </button>
        </div>
      )}
    </div>
  )
}