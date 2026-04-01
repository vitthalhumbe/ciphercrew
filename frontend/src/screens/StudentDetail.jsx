import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const API = 'http://localhost:8000'

function Section({ label, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '24px',
      marginBottom: '16px',
    }}>
      <div style={{
        fontFamily: 'var(--mono)', fontSize: '10px',
        color: 'var(--muted2)', letterSpacing: '0.15em',
        marginBottom: '16px',
      }}>
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
    fetch(`${API}/student/${student.id}`)
      .then(r => r.json())
      .then(d => { setDetail(d); setLoading(false) })
  }, [])

  async function runAnalysis() {
    setAnalyzing(true)
    const res = await fetch(`${API}/analyze/${student.id}`, { method: 'POST' })
    const data = await res.json()
    setAnalysis(data)
    setAnalyzing(false)
  }

  const chartData = detail?.responses?.map(r => ({
    week: `W${r.week}`,
    attendance: Math.round((r.attended / r.total_classes) * 100),
    confidence: Math.round((r.confidence / 5) * 100),
  })) || []

  const risk = detail?.risk || student?.risk
  const riskColor = risk?.level === 'high' ? 'var(--red)' : risk?.level === 'medium' ? 'var(--yellow)' : 'var(--green)'

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* topbar */}
      <div style={{
        padding: '14px 28px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="btn" onClick={onBack} style={{ padding: '6px 12px', fontSize: '11px' }}>← BACK</button>
          <div>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted2)', letterSpacing: '0.15em' }}>
              STUDENT PROFILE
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>{student.name}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`tag risk-${risk?.level}`}>{risk?.level} risk</span>
          <span style={{
            fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 800, color: riskColor,
          }}>
            {((risk?.score || 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
        {loading ? (
          <div className="pulse" style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: '13px' }}>
            loading student data...
          </div>
        ) : (
          <div className="fade-up">
            {/* meta */}
            <Section label="STUDENT INFO">
              <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                {[
                  ['Roll Number', detail.roll],
                  ['Branch', detail.branch],
                  ['Year', detail.year],
                  ['Trend', detail.risk?.trend],
                  ['Responses', detail.responses?.length + ' weeks'],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted)', marginBottom: '4px' }}>{k}</div>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* charts */}
            {chartData.length > 0 && (
              <Section label="ATTENDANCE & CONFIDENCE TREND">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="week" tick={{ fontFamily: 'var(--mono)', fontSize: 11, fill: 'var(--muted2)' }} />
                    <YAxis tick={{ fontFamily: 'var(--mono)', fontSize: 11, fill: 'var(--muted2)' }} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', fontFamily: 'var(--mono)', fontSize: 12 }}
                      labelStyle={{ color: 'var(--text)' }}
                    />
                    <Line type="monotone" dataKey="attendance" stroke="var(--blue)" strokeWidth={2} dot={{ fill: 'var(--blue)', r: 4 }} name="Attendance %" />
                    <Line type="monotone" dataKey="confidence" stroke="var(--yellow)" strokeWidth={2} dot={{ fill: 'var(--yellow)', r: 4 }} name="Confidence %" />
                  </LineChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '20px', marginTop: '12px' }}>
                  {[['var(--blue)', 'Attendance %'], ['var(--yellow)', 'Confidence %']].map(([c, l]) => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted2)' }}>
                      <div style={{ width: '12px', height: '2px', background: c }} />
                      {l}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* weekly responses */}
            <Section label="WEEKLY REFLECTIONS">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {detail.responses?.map((r, i) => (
                  <div key={i} style={{
                    padding: '16px',
                    border: '1px solid var(--border2)',
                    background: 'var(--surface2)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', color: 'var(--muted2)' }}>
                        WEEK {r.week} — {r.submitted_at}
                      </span>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: '11px',
                          color: (r.attended / r.total_classes) < 0.5 ? 'var(--red)' : 'var(--green)',
                        }}>
                          {r.attended}/{r.total_classes} classes
                        </span>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: '11px',
                          color: r.confidence <= 2 ? 'var(--red)' : r.confidence === 3 ? 'var(--yellow)' : 'var(--green)',
                        }}>
                          Confidence: {r.confidence}/5
                        </span>
                      </div>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted2)', fontSize: '14px', lineHeight: 1.6 }}>
                      "{r.struggled_topic}"
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* AI analysis */}
            <Section label="AI DROPOUT RISK ANALYSIS">
              {!analysis ? (
                <div>
                  <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--muted2)', fontSize: '14px', lineHeight: 1.7, marginBottom: '16px' }}>
                    Run AI analysis to identify root causes, warning signs, and recommended interventions for this student.
                  </p>
                  <button
                    className="btn danger"
                    onClick={runAnalysis}
                    disabled={analyzing}
                    style={{ opacity: analyzing ? 0.6 : 1 }}
                  >
                    {analyzing ? <span className="pulse">ANALYZING...</span> : 'RUN AI ANALYSIS →'}
                  </button>
                </div>
              ) : (
                <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* counselor note */}
                  <div style={{
                    padding: '20px',
                    border: `1px solid ${riskColor}`,
                    background: risk?.level === 'high' ? 'var(--red-dim)' : 'var(--surface2)',
                  }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted2)', marginBottom: '10px', letterSpacing: '0.1em' }}>
                      COUNSELOR NOTE
                    </div>
                    <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: '16px', lineHeight: 1.8, color: 'var(--text)' }}>
                      {analysis.counselor_note}
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {/* root causes */}
                    <div style={{ padding: '16px', border: '1px solid var(--border2)', background: 'var(--surface2)' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--red)', marginBottom: '12px', letterSpacing: '0.1em' }}>
                        ROOT CAUSES
                      </div>
                      {analysis.root_causes?.map((c, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '12px', marginTop: '1px' }}>→</span>
                          <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--muted2)' }}>{c}</span>
                        </div>
                      ))}
                    </div>

                    {/* warning signs */}
                    <div style={{ padding: '16px', border: '1px solid var(--border2)', background: 'var(--surface2)' }}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--yellow)', marginBottom: '12px', letterSpacing: '0.1em' }}>
                        WARNING SIGNS
                      </div>
                      {analysis.warning_signs?.map((w, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--yellow)', fontFamily: 'var(--mono)', fontSize: '12px', marginTop: '1px' }}>⚠</span>
                          <span style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--muted2)' }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* interventions */}
                  <div style={{ padding: '16px', border: '1px solid var(--border2)', background: 'var(--surface2)' }}>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--green)', marginBottom: '12px', letterSpacing: '0.1em' }}>
                      RECOMMENDED INTERVENTIONS
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {analysis.recommended_interventions?.map((a, i) => (
                        <div key={i} style={{
                          display: 'flex', gap: '12px', padding: '12px 14px',
                          border: '1px solid var(--border)', background: 'var(--surface)',
                          alignItems: 'flex-start',
                        }}>
                          <span style={{
                            fontFamily: 'var(--mono)', fontSize: '11px',
                            color: 'var(--green)', background: 'var(--green-dim)',
                            padding: '2px 8px', flexShrink: 0,
                          }}>{i + 1}</span>
                          <span style={{ fontSize: '14px', lineHeight: 1.5 }}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}