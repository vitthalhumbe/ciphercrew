import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

function RiskBadge({ level }) {
  return <span className={`tag risk-${level || 'unknown'}`}>{level || 'unknown'}</span>
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: '20px 24px',
      flex: 1,
    }}>
      <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted2)', letterSpacing: '0.12em', marginBottom: '8px' }}>
        {label}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: color || 'var(--text)', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  )
}

export default function AdminDashboard({ onBack, onSelectStudent }) {
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all | high | medium | low
  const [sortBy, setSortBy] = useState('risk') // risk | name

  useEffect(() => {
    Promise.all([
      fetch(`${API}/students`).then(r => r.json()),
      fetch(`${API}/batch/summary`).then(r => r.json()),
    ]).then(([s, sum]) => {
      setStudents(s)
      setSummary(sum)
      setLoading(false)
    })
  }, [])

  const filtered = students
    .filter(s => filter === 'all' || s.risk?.level === filter)
    .sort((a, b) => {
      if (sortBy === 'risk') return (b.risk?.score || 0) - (a.risk?.score || 0)
      return a.name.localeCompare(b.name)
    })

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
            <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted2)', letterSpacing: '0.15em' }}>ADMIN DASHBOARD</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>Batch Overview — SY 2024–25</div>
          </div>
        </div>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '0.08em' }}>
          PCCOE PUNE
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
        {loading ? (
          <div className="pulse" style={{ fontFamily: 'var(--mono)', color: 'var(--muted)', fontSize: '13px' }}>
            loading batch data...
          </div>
        ) : (
          <div className="fade-up">
            {/* stat cards */}
            {summary && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
                <StatCard label="TOTAL STUDENTS" value={summary.total} />
                <StatCard label="HIGH RISK" value={summary.high_risk_count} color="var(--red)" />
                <StatCard label="MEDIUM RISK" value={summary.medium_risk_count} color="var(--yellow)" />
                <StatCard label="LOW RISK" value={summary.low_risk_count} color="var(--green)" />
                <StatCard label="AVG RISK SCORE" value={`${(summary.avg_risk * 100).toFixed(0)}%`} color="var(--muted2)" />
              </div>
            )}

            {/* common struggles */}
            {summary?.common_struggle_topics?.length > 0 && (
              <div style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '20px 24px',
                marginBottom: '28px',
              }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--muted2)', letterSpacing: '0.12em', marginBottom: '12px' }}>
                  MOST REPORTED STRUGGLE AREAS THIS MONTH
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[...new Set(summary.common_struggle_topics)].slice(0, 8).map((t, i) => (
                    <span key={i} style={{
                      fontFamily: 'var(--mono)', fontSize: '11px',
                      padding: '4px 12px',
                      border: '1px solid var(--border2)',
                      color: 'var(--muted2)',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* filters */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginRight: '4px' }}>FILTER:</span>
              {['all','high','medium','low'].map(f => (
                <button
                  key={f}
                  className="btn"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px', fontSize: '11px',
                    borderColor: filter === f ? 'var(--text)' : 'var(--border2)',
                    color: filter === f ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  {f.toUpperCase()}
                </button>
              ))}
              <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)' }}>SORT:</span>
              {['risk','name'].map(s => (
                <button
                  key={s}
                  className="btn"
                  onClick={() => setSortBy(s)}
                  style={{
                    padding: '6px 14px', fontSize: '11px',
                    borderColor: sortBy === s ? 'var(--text)' : 'var(--border2)',
                    color: sortBy === s ? 'var(--text)' : 'var(--muted)',
                  }}
                >
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            {/* student table */}
            <div style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
              {/* header row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                padding: '12px 20px',
                borderBottom: '1px solid var(--border)',
                fontFamily: 'var(--mono)', fontSize: '10px',
                color: 'var(--muted)', letterSpacing: '0.1em',
              }}>
                <span>STUDENT</span>
                <span>BRANCH</span>
                <span>RISK LEVEL</span>
                <span>RISK SCORE</span>
                <span>TREND</span>
                <span></span>
              </div>

              {filtered.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                    padding: '16px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  onClick={() => onSelectStudent(s)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{s.name}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--muted)', marginTop: '2px' }}>{s.roll}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)' }}>{s.branch}</div>
                  <div><RiskBadge level={s.risk?.level} /></div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600,
                    color: s.risk?.level === 'high' ? 'var(--red)' : s.risk?.level === 'medium' ? 'var(--yellow)' : 'var(--green)',
                  }}>
                    {((s.risk?.score || 0) * 100).toFixed(0)}%
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: '11px',
                    color: s.risk?.trend === 'declining' ? 'var(--red)' : s.risk?.trend === 'improving' ? 'var(--green)' : 'var(--muted2)',
                  }}>
                    {s.risk?.trend === 'declining' ? '↓ DECLINING' : s.risk?.trend === 'improving' ? '↑ IMPROVING' : '→ STABLE'}
                  </div>
                  <div>
                    <button className="btn" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={e => { e.stopPropagation(); onSelectStudent(s) }}>
                      VIEW →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}