import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API = 'http://localhost:8000'

// --- Premium Section Wrapper ---
function Section({ label, children }) {
  return (
    <div className="detail-section">
      <div className="section-label-pro" style={{ marginBottom: '24px' }}>
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
    if (!student) return;

    fetch(`${API}/student/${student.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
      .catch(err => {
        console.warn("Backend missing, loading mock daily data...", err)
        setTimeout(() => {
          setDetail({
            ...student,
            year: 2,
            responses: [
              { date: "2024-10-01", attended: 6, total_classes: 6, confidence: 5, struggled_topic: "Nothing major" },
              { date: "2024-10-02", attended: 5, total_classes: 6, confidence: 4, struggled_topic: "Pointers introduction" },
              { date: "2024-10-03", attended: 3, total_classes: 6, confidence: 2, struggled_topic: "Dynamic programming is too fast" },
              { date: "2024-10-04", attended: 2, total_classes: 6, confidence: 1, struggled_topic: "I feel completely lost in lectures now" },
              { date: "2024-10-05", attended: 1, total_classes: 6, confidence: 1, struggled_topic: "Stopped attending entirely" }
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
      setTimeout(() => {
        setAnalysis({
          counselor_note: `${student.name} is showing a rapid daily decline in both attendance and confidence. The root issue appears to be a compounding misunderstanding of foundational CS topics like Pointers, which is making subsequent topics impossible to follow. Immediate intervention is strongly advised.`,
          root_causes: ["Knowledge gap in memory allocation/pointers", "Snowball effect leading to loss of daily motivation"],
          warning_signs: ["Attendance dropped by 80% over 5 days", "Confidence score hit minimum (1/5)", "Explicitly stated feeling 'completely lost'"],
          recommended_interventions: ["Schedule mandatory 1-on-1 tutoring for C/C++ basics", "Counselor check-in to address academic anxiety", "Pair with a high-performing peer mentor in the same branch"]
        })
      }, 1500)
    } finally {
      setAnalyzing(false)
    }
  }

  if (!student) return null;

  const chartData = detail?.responses?.map(r => {
    const dateObj = new Date(r.date);
    const formattedDate = !isNaN(dateObj) 
      ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : r.date; 
    
    return {
      dateLabel: formattedDate,
      attendance: Math.round((r.attended / r.total_classes) * 100),
      confidence: Math.round((r.confidence / 5) * 100),
    }
  }) || []

  const risk = detail?.risk || student?.risk
  const isHighRisk = risk?.level === 'high'
  const isMedRisk = risk?.level === 'medium'
  const riskColorHex = isHighRisk ? 'var(--accent-red)' : isMedRisk ? 'var(--accent-yellow)' : 'var(--accent-green)'

  return (
    <div className="detail-wrapper">
      <style>{`
        .detail-wrapper { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
        .detail-header { padding: 24px 32px; border-bottom: 1px solid var(--border); background: var(--bg-surface); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
        
        .btn-back { background: transparent; border: 1px solid var(--border); color: var(--text-main); padding: 8px 16px; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-back:hover { background: var(--bg-surface-hover); border-color: var(--border-strong); }

        .btn-ai { background: var(--text-main); color: var(--bg-base); padding: 14px 28px; border-radius: 8px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; width: 100%; text-align: center; border: none; }
        .btn-ai:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.1); opacity: 0.9; }
        .btn-ai:disabled { opacity: 0.6; cursor: wait; }

        .detail-section { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 32px; margin-bottom: 24px; }
        
        .info-grid { display: flex; gap: 48px; flex-wrap: wrap; }
        .info-block label { display: block; font-family: 'Inter', sans-serif; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; font-weight: 500; }
        .info-block span { font-size: 16px; font-weight: 600; }

        .reflection-card { padding: 20px; border-bottom: 1px solid var(--border); }
        .reflection-card:last-child { border-bottom: none; }
        
        .ai-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
        .ai-card { padding: 24px; border-radius: 10px; background: var(--bg-base); border: 1px solid var(--border); }
        
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* HEADER SECTION */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="btn-back" onClick={onBack}>← Back to Batch</button>
          <div>
            <div className="section-label-pro" style={{ marginBottom: '4px' }}>Student Profile</div>
            <div style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>{student.name}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span className="section-label-pro" style={{
            padding: '6px 12px', borderRadius: '6px', background: 'var(--bg-base)', 
            color: riskColorHex, border: '1px solid var(--border)'
          }}>
            {risk?.level || 'Unknown'} Risk
          </span>
          <span className="data-number" style={{ fontSize: '28px', fontWeight: 700, color: riskColorHex, lineHeight: 1 }}>
            {((risk?.score || 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* MAIN SCROLLABLE CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '40px 24px', backgroundColor: 'var(--bg-base)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
          
          {loading ? (
            <div className="reading-text" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '100px 0' }}>
              Extracting Student Dossier...
            </div>
          ) : (
            <div className="fade-up">
              
              <Section label="Student Meta Data">
                <div className="info-grid">
                  <div className="info-block"><label>Roll Number</label><span className="data-number">{detail.roll}</span></div>
                  <div className="info-block"><label>Branch</label><span>{detail.branch}</span></div>
                  <div className="info-block"><label>Year</label><span>{detail.year}</span></div>
                  <div className="info-block">
                    <label>Risk Trend</label>
                    <span style={{ color: detail.risk?.trend === 'declining' ? 'var(--accent-red)' : detail.risk?.trend === 'improving' ? 'var(--accent-green)' : 'var(--text-main)' }}>
                      {detail.risk?.trend === 'declining' ? 'Declining' : detail.risk?.trend === 'improving' ? 'Improving' : 'Stable'}
                    </span>
                  </div>
                  <div className="info-block"><label>Data Points</label><span>{detail.responses?.length || 0} Days</span></div>
                </div>
              </Section>

              {chartData.length > 0 && (
                <Section label="Daily Engagement Trends">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="4 4" stroke="var(--border-strong)" vertical={false} opacity={0.5} />
                      <XAxis dataKey="dateLabel" tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{ fontFamily: 'Inter', fontSize: 12, fill: 'var(--text-muted)' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'Inter', fontSize: 13, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }} itemStyle={{ color: 'var(--text-main)' }} />
                      <Line type="monotone" dataKey="attendance" stroke="var(--accent-blue)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--accent-blue)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Attendance %" />
                      <Line type="monotone" dataKey="confidence" stroke="var(--accent-yellow)" strokeWidth={3} dot={{ fill: 'var(--bg-surface)', stroke: 'var(--accent-yellow)', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} name="Confidence %" />
                    </LineChart>
                  </ResponsiveContainer>
                </Section>
              )}

              <Section label="DropWatch AI Analysis">
                {!analysis ? (
                  <div style={{ textAlign: 'center', padding: '12px 0' }}>
                    <p className="reading-text" style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                      Synthesize daily reflections and engagement metrics to identify root causes and generate actionable interventions.
                    </p>
                    <button className="btn-ai" onClick={runAnalysis} disabled={analyzing}>
                      {analyzing ? 'Analyzing Data...' : 'Generate AI Analysis'}
                    </button>
                  </div>
                ) : (
                  <div className="fade-up">
                    <div style={{ padding: '24px', borderRadius: '10px', background: 'var(--bg-base)', border: '1px solid var(--border)' }}>
                      <div className="section-label-pro" style={{ marginBottom: '12px' }}>Executive Summary</div>
                      <p className="reading-text" style={{ fontSize: '16px' }}>
                        {analysis.counselor_note}
                      </p>
                    </div>

                    <div className="ai-grid">
                      <div className="ai-card">
                        <div className="section-label-pro" style={{ marginBottom: '16px' }}>Root Causes</div>
                        {analysis.root_causes?.map((c, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-red)' }}>•</span>
                            <span className="reading-text" style={{ fontSize: '14px' }}>{c}</span>
                          </div>
                        ))}
                      </div>

                      <div className="ai-card">
                        <div className="section-label-pro" style={{ marginBottom: '16px' }}>Warning Signs</div>
                        {analysis.warning_signs?.map((w, i) => (
                          <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                            <span style={{ color: 'var(--accent-yellow)' }}>•</span>
                            <span className="reading-text" style={{ fontSize: '14px' }}>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="ai-card" style={{ marginTop: '20px' }}>
                      <div className="section-label-pro" style={{ marginBottom: '16px' }}>Recommended Interventions</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {analysis.recommended_interventions?.map((a, i) => (
                          <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'var(--bg-surface-hover)', padding: '16px', borderRadius: '8px' }}>
                            <span className="data-number" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                              0{i + 1}
                            </span>
                            <span className="reading-text" style={{ fontSize: '15px' }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Section>

              <Section label="Raw Daily Reflection Logs">
                <div style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                  {detail.responses?.slice().reverse().map((r, i) => (
                    <div key={i} className="reflection-card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                        <span className="section-label-pro">
                          {r.date}
                        </span>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <span className="section-label-pro">
                            Attended: <span className="data-number" style={{ color: 'var(--text-main)' }}>{r.attended}/{r.total_classes}</span>
                          </span>
                          <span className="section-label-pro">
                            Confidence: <span className="data-number" style={{ color: 'var(--text-main)' }}>{r.confidence}/5</span>
                          </span>
                        </div>
                      </div>
                      <div className="reading-text">
                        "{r.struggled_topic}"
                      </div>
                    </div>
                  ))}
                  {(!detail.responses || detail.responses.length === 0) && (
                    <div className="reading-text" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No daily reflections submitted yet.
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