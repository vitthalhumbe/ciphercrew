import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API = 'http://localhost:8000'

// --- Premium Section Wrapper ---
function Section({ label, children, glowColor }) {
  return (
    <div className="detail-section" style={{ 
      boxShadow: glowColor ? `0 0 30px ${glowColor}10` : 'none',
      borderColor: glowColor ? `${glowColor}30` : 'var(--border)'
    }}>
      <div className="section-label" style={{ color: glowColor || 'var(--text-muted)' }}>
        {label}
      </div>
      {children}
    </div>
  )
}

export default function StudentDetail({ student, onBack }) {
  const [detail, setDetail] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If no student is passed, don't try to fetch
    if (!student) return;

    fetch(`${API}/student/${student.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
      .catch(err => {
        console.warn("Backend missing, loading mock data...", err)
        // MOCK DATA FOR HACKATHON DEMO
        setTimeout(() => {
          setDetail({
            ...student,
            year: 2,
            responses: [
              { week: 1, attended: 6, total_classes: 6, confidence: 5, struggled_topic: "Nothing major", submitted_at: "2024-10-01" },
              { week: 2, attended: 4, total_classes: 6, confidence: 3, struggled_topic: "Pointers and memory allocation", submitted_at: "2024-10-08" },
              { week: 3, attended: 3, total_classes: 6, confidence: 2, struggled_topic: "Dynamic programming is too fast", submitted_at: "2024-10-15" },
              { week: 4, attended: 2, total_classes: 6, confidence: 1, struggled_topic: "I feel completely lost in lectures now", submitted_at: "2024-10-22" }
            ]
          })
          setLoading(false)
        }, 500)
      })
  }, [student])

  async function runAnalysis() {
    setAnalyzing(true)
    try {
      const res = await fetch(`${API}/analyze/${student.id}`, { method: 'POST' })
      const data = await res.json()
      setAnalysis(data)
    } catch (err) {
      console.warn("AI Backend missing, loading mock analysis...", err)
      // MOCK AI ANALYSIS FOR HACKATHON
      setTimeout(() => {
        setAnalysis({
          counselor_note: `${student.name} is showing a rapid decline in both attendance and confidence. The root issue appears to be a compounding misunderstanding of foundational CS topics like Pointers, which is making subsequent topics impossible to follow. Immediate intervention is strongly advised.`,
          root_causes: ["Knowledge gap in memory allocation/pointers", "Snowball effect leading to loss of motivation"],
          warning_signs: ["Attendance dropped by 66% over 3 weeks", "Confidence score hit minimum (1/5)", "Explicitly stated feeling 'completely lost'"],
          recommended_interventions: ["Schedule mandatory 1-on-1 tutoring for C/C++ basics", "Counselor check-in to address academic anxiety", "Pair with a high-performing peer mentor in the same branch"]
        })
      }, 1500)
    } finally {
      setAnalyzing(false)
    }
  }

  // Prevent render if no student is selected yet
  if (!student) return null;

  // Prepare Chart Data
  const chartData = detail?.responses?.map(r => ({
    week: `W${r.week}`,
    attendance: Math.round((r.attended / r.total_classes) * 100),
    confidence: Math.round((r.confidence / 5) * 100),
  })) || []

  const risk = detail?.risk || student?.risk
  const isHighRisk = risk?.level === 'high'
  const isMedRisk = risk?.level === 'medium'
  const riskColorHex = isHighRisk ? 'var(--accent-red)' : isMedRisk ? 'var(--accent-yellow)' : 'var(--accent-green)'

  return (
    <div className="detail-wrapper">
      <style>{`
        /* Local layout styles - Inherits colors from App.jsx global theme */
        .detail-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Topbar Header */
        .detail-header {
          padding: 24px 32px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        /* Typography */
        .mono-text { font-family: 'JetBrains Mono', monospace; }
        .serif-quote { font-family: 'Playfair Display', serif; font-style: italic; }

        /* Buttons */
        .btn-back {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-main);
          padding: 8px 16px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .btn-back:hover { background: var(--bg-surface-hover); border-color: var(--border-strong); }

        .btn-ai {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.1), rgba(59, 130, 246, 0.1));
          border: 1px solid rgba(244, 63, 94, 0.3);
          color: var(--text-main);
          padding: 16px 32px;
          border-radius: 8px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 20px rgba(244, 63, 94, 0.05);
        }
        .btn-ai:hover:not(:disabled) {
          background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(59, 130, 246, 0.2));
          border-color: rgba(244, 63, 94, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(244, 63, 94, 0.15);
        }
        .btn-ai:disabled { opacity: 0.6; cursor: wait; }

        /* Sections & Cards */
        .detail-section {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
        }
        .section-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          margin-bottom: 24px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .info-grid {
          display: flex;
          gap: 48px;
          flex-wrap: wrap;
        }
        .info-block label {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          margin-bottom: 6px;
        }
        .info-block span {
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.01em;
        }

        .reflection-card {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }
        .reflection-card:last-child { border-bottom: none; }
        
        /* AI Layout */
        .ai-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }
        .ai-card {
          padding: 24px;
          border-radius: 12px;
          background: var(--bg-surface-hover);
          border: 1px solid var(--border);
        }

        .pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="btn-back" onClick={onBack}>← BACK TO BATCH</button>
          <div>
            <div className="mono-text" style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '4px' }}>
              STUDENT PROFILE
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{student.name}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="mono-text" style={{
            fontSize: '11px', fontWeight: 700, padding: '6px 12px', borderRadius: '6px', textTransform: 'uppercase',
            background: 'var(--bg-surface-hover)', color: riskColorHex, border: '1px solid var(--border)'
          }}>
            {risk?.level || 'Unknown'} Risk
          </span>
          <span className="mono-text" style={{ fontSize: '28px', fontWeight: 800, color: riskColorHex, lineHeight: 1 }}>
            {((risk?.score || 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* MAIN SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {loading ? (
            <div className="pulse mono-text" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '100px 0' }}>
              Extracting Student Dossier...
            </div>
          ) : (
            <div className="fade-up">
              
              {/* META INFO */}
              <Section label="Student Meta Data">
                <div className="info-grid">
                  <div className="info-block"><label>Roll Number</label><span>{detail.roll}</span></div>
                  <div className="info-block"><label>Branch</label><span>{detail.branch}</span></div>
                  <div className="info-block"><label>Year</label><span>{detail.year}</span></div>
                  <div className="info-block">
                    <label>Risk Trend</label>
                    <span style={{ 
                      color: detail.risk?.trend === 'declining' ? 'var(--accent-red)' : 
                             detail.risk?.trend === 'improving' ? 'var(--accent-green)' : 'var(--text-muted)' 
                    }}>
                      {detail.risk?.trend === 'declining' ? '↓ Declining' : detail.risk?.trend === 'improving' ? '↑ Improving' : '→ Stable'}
                    </span>
                  </div>
                  <div className="info-block"><label>Data Points</label><span>{detail.responses?.length || 0} Weeks</span></div>
                </div>
              </Section>

              {/* CHARTS */}
              {chartData.length > 0 && (
                <Section label="Engagement Trends">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--border-strong)" vertical={false} opacity={0.3} />
                      <XAxis dataKey="week" tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontFamily: 'JetBrains Mono', fontSize: 11, fill: 'var(--text-muted)' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'JetBrains Mono', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                        itemStyle={{ color: 'var(--text-main)' }}
                      />
                      <Line type="monotone" dataKey="attendance" stroke="var(--accent-blue)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--accent-blue)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Attendance %" />
                      <Line type="monotone" dataKey="confidence" stroke="var(--accent-yellow)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--accent-yellow)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Confidence %" />
                    </LineChart>
                  </ResponsiveContainer>
                </Section>
              )}

              {/* AI ANALYSIS GENERATOR */}
              <Section label="DropWatch AI Analysis" glowColor="var(--accent-red)">
                {!analysis ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <p className="serif-quote" style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '24px' }}>
                      Synthesize weekly reflections and engagement metrics to identify root causes and generate actionable interventions.
                    </p>
                    <button className="btn-ai" onClick={runAnalysis} disabled={analyzing}>
                      {analyzing ? <span className="pulse">RUNNING INFERENCE ENGINE...</span> : '✦ GENERATE AI DOSSIER'}
                    </button>
                  </div>
                ) : (
                  <div className="fade-up">
                    {/* Counselor Note */}
                    <div style={{ padding: '24px', borderRadius: '12px', background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                      <div className="mono-text" style={{ fontSize: '10px', color: 'var(--accent-red)', marginBottom: '12px', letterSpacing: '0.1em' }}>
                        EXECUTIVE SUMMARY
                      </div>
                      <p className="serif-quote" style={{ fontSize: '18px', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        "{analysis.counselor_note}"
                      </p>
                    </div>

                    <div className="ai-grid">
                      {/* Root Causes */}
                      <div className="ai-card">
                        <div className="mono-text" style={{ fontSize: '11px', color: 'var(--accent-red)', marginBottom: '16px', letterSpacing: '0.1em' }}>
                          ROOT CAUSES
                        </div>
                        {analysis.root_causes?.map((c, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-red)', marginTop: '2px' }}>▹</span>
                            <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-muted)' }}>{c}</span>
                          </div>
                        ))}
                      </div>

                      {/* Warning Signs */}
                      <div className="ai-card">
                        <div className="mono-text" style={{ fontSize: '11px', color: 'var(--accent-yellow)', marginBottom: '16px', letterSpacing: '0.1em' }}>
                          WARNING SIGNS
                        </div>
                        {analysis.warning_signs?.map((w, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-yellow)', marginTop: '2px' }}>⚠</span>
                            <span style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-muted)' }}>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interventions */}
                    <div className="ai-card" style={{ marginTop: '20px', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div className="mono-text" style={{ fontSize: '11px', color: 'var(--accent-green)', marginBottom: '16px', letterSpacing: '0.1em' }}>
                        RECOMMENDED INTERVENTIONS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysis.recommended_interventions?.map((a, i) => (
                          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-surface)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <span className="mono-text" style={{ color: 'var(--accent-green)', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '4px', fontSize: '12px' }}>
                              0{i + 1}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-main)' }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Section>

              {/* WEEKLY REFLECTIONS LOG */}
              <Section label="Raw Reflection Logs">
                <div style={{ border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  {detail.responses?.slice().reverse().map((r, i) => (
                    <div key={i} className="reflection-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <span className="mono-text" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          WEEK {r.week} <span style={{ opacity: 0.5, margin: '0 8px' }}>|</span> {r.submitted_at}
                        </span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span className="mono-text" style={{ fontSize: '11px', color: (r.attended / r.total_classes) < 0.5 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                            Attendance: {r.attended}/{r.total_classes}
                          </span>
                          <span className="mono-text" style={{ fontSize: '11px', color: r.confidence <= 2 ? 'var(--accent-red)' : r.confidence === 3 ? 'var(--accent-yellow)' : 'var(--accent-green)' }}>
                            Confidence: {r.confidence}/5
                          </span>
                        </div>
                      </div>
                      <div className="serif-quote" style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        "{r.struggled_topic}"
                      </div>
                    </div>
                  ))}
                  {(!detail.responses || detail.responses.length === 0) && (
                    <div className="mono-text" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No reflections submitted yet.
                    </div>
                  )}
                </div>
              </Section>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}