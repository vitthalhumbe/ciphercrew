import { useState, useEffect } from 'react'

const API = 'http://localhost:8000'

// --- Subcomponents ---

function RiskBadge({ level }) {
  const safeLevel = level || 'unknown'
  return <span className={`risk-badge risk-${safeLevel}`}>{safeLevel}</span>
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className="stat-card">
      <div className="mono-label">{label}</div>
      <div className={`stat-value ${colorClass || ''}`}>
        {value}
      </div>
    </div>
  )
}

// --- Main Dashboard Component ---

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
    ])
    .then(([s, sum]) => {
      setStudents(s)
      setSummary(sum)
      setLoading(false)
    })
    .catch(err => {
      console.warn("Backend not reachable. Loading mock hackathon data...", err)
      // MOCK DATA FALLBACK FOR UI TESTING
      setTimeout(() => {
        setSummary({
          total: 142, high_risk_count: 12, medium_risk_count: 34, low_risk_count: 96, avg_risk: 0.28,
          common_struggle_topics: ["Pointers in C", "Dynamic Programming", "Time Management", "Project Deadlines"]
        })
        setStudents([
          { id: 'S001', name: 'Aarav Sharma', roll: '22CS001', branch: 'CS', risk: { level: 'high', score: 0.85, trend: 'declining' } },
          { id: 'S002', name: 'Priya Patil', roll: '22CS002', branch: 'IT', risk: { level: 'medium', score: 0.55, trend: 'stable' } },
          { id: 'S003', name: 'Rohan Kulkarni', roll: '22ME001', branch: 'MECH', risk: { level: 'low', score: 0.12, trend: 'improving' } },
          { id: 'S004', name: 'Sneha Desai', roll: '22CS003', branch: 'CS', risk: { level: 'high', score: 0.78, trend: 'declining' } },
        ])
        setLoading(false)
      }, 800)
    })
  }, [])

  const filtered = students
    .filter(s => filter === 'all' || s.risk?.level === filter)
    .sort((a, b) => {
      if (sortBy === 'risk') return (b.risk?.score || 0) - (a.risk?.score || 0)
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="admin-wrapper">
      <style>{`
        /* Local layout styles - Inherits colors from App.jsx global theme */
        .admin-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        /* Typography */
        .mono-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        /* Layout & Header */
        .topbar-header {
          padding: 16px 32px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          z-index: 10;
        }

        .main-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 32px;
        }

        /* Buttons */
        .btn-ghost {
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
        .btn-ghost:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-strong);
        }
        .btn-ghost.active {
          background: var(--text-main);
          color: var(--bg-base);
          border-color: var(--text-main);
        }

        /* Stat Cards */
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.05);
          border-color: var(--border-strong);
        }
        .stat-value {
          font-size: 40px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        /* Colors mapping to App.jsx variables */
        .color-red { color: var(--accent-red); }
        .color-yellow { color: var(--accent-yellow); }
        .color-green { color: var(--accent-green); }
        .color-default { color: var(--text-main); }
        .color-dim { color: var(--text-muted); }

        /* Tags & Badges */
        .struggle-tag {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          padding: 6px 14px;
          border-radius: 100px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
        
        .risk-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 6px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .risk-high { background: rgba(244, 63, 94, 0.1); color: var(--accent-red); border: 1px solid rgba(244, 63, 94, 0.2); }
        .risk-medium { background: rgba(251, 191, 36, 0.1); color: var(--accent-yellow); border: 1px solid rgba(251, 191, 36, 0.2); }
        .risk-low { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); border: 1px solid rgba(16, 185, 129, 0.2); }

        /* Table */
        .data-table-container {
          border: 1px solid var(--border);
          border-radius: 12px;
          background: var(--bg-surface);
          overflow: hidden;
        }
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 100px;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s ease;
        }
        .table-row:last-child { border-bottom: none; }
        .table-header {
          background: var(--bg-surface);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--text-dim);
          letter-spacing: 0.1em;
          font-weight: 600;
        }
        .table-body-row { cursor: pointer; }
        .table-body-row:hover { background: var(--bg-surface-hover); }

        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Topbar Context (No theme toggle needed here anymore) */}
      <div className="topbar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="btn-ghost" onClick={onBack}>← HOME</button>
          <div>
            <div className="mono-label" style={{ marginBottom: '4px' }}>INSTITUTION DASHBOARD</div>
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Batch Overview — SY 2024–25</div>
          </div>
        </div>
        
        <div className="mono-label">
          PCCOE PUNE
        </div>
      </div>

      <div className="main-scroll">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-dim)' }} className="mono-label">
            Loading System Data...
          </div>
        ) : (
          <div className="fade-up">
            {/* Stat Cards */}
            {summary && (
              <div className="stat-grid">
                <StatCard label="TOTAL STUDENTS" value={summary.total} colorClass="color-default" />
                <StatCard label="HIGH RISK" value={summary.high_risk_count} colorClass="color-red" />
                <StatCard label="MEDIUM RISK" value={summary.medium_risk_count} colorClass="color-yellow" />
                <StatCard label="LOW RISK" value={summary.low_risk_count} colorClass="color-green" />
                <StatCard label="AVG RISK SCORE" value={`${(summary.avg_risk * 100).toFixed(0)}%`} colorClass="color-dim" />
              </div>
            )}

            {/* Common Struggles */}
            {summary?.common_struggle_topics?.length > 0 && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
                <div className="mono-label" style={{ marginBottom: '16px' }}>
                  MOST REPORTED STRUGGLE AREAS THIS MONTH
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {summary.common_struggle_topics.slice(0, 6).map((t, i) => (
                    <span key={i} className="struggle-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Filters & Sorting */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="mono-label" style={{ marginRight: '8px' }}>FILTER:</span>
                {['all', 'high', 'medium', 'low'].map(f => (
                  <button
                    key={f}
                    className={`btn-ghost ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="mono-label" style={{ marginRight: '8px' }}>SORT BY:</span>
                {['risk', 'name'].map(s => (
                  <button
                    key={s}
                    className={`btn-ghost ${sortBy === s ? 'active' : ''}`}
                    onClick={() => setSortBy(s)}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Student Table */}
            <div className="data-table-container">
              {/* Header Row */}
              <div className="table-row table-header">
                <span>STUDENT DETAILS</span>
                <span>BRANCH</span>
                <span>RISK LEVEL</span>
                <span>RISK SCORE</span>
                <span>TREND</span>
                <span style={{ textAlign: 'right' }}>ACTION</span>
              </div>

              {/* Data Rows */}
              {filtered.map((s, i) => {
                const isHigh = s.risk?.level === 'high';
                const isMed = s.risk?.level === 'medium';
                
                return (
                  <div key={s.id} className="table-row table-body-row" onClick={() => onSelectStudent(s)}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>{s.name}</div>
                      <div className="mono-label" style={{ marginTop: '4px' }}>{s.roll}</div>
                    </div>
                    
                    <div className="mono-label" style={{ color: 'var(--text-muted)' }}>{s.branch || 'N/A'}</div>
                    
                    <div><RiskBadge level={s.risk?.level} /></div>
                    
                    <div style={{ 
                      fontFamily: 'JetBrains Mono', fontSize: '15px', fontWeight: 700,
                      color: isHigh ? 'var(--accent-red)' : isMed ? 'var(--accent-yellow)' : 'var(--accent-green)'
                    }}>
                      {((s.risk?.score || 0) * 100).toFixed(0)}%
                    </div>
                    
                    <div style={{ 
                      fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 600,
                      color: s.risk?.trend === 'declining' ? 'var(--accent-red)' : s.risk?.trend === 'improving' ? 'var(--accent-green)' : 'var(--text-dim)'
                    }}>
                      {s.risk?.trend === 'declining' ? '↓ DECLINING' : s.risk?.trend === 'improving' ? '↑ IMPROVING' : '→ STABLE'}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button className="btn-ghost" onClick={e => { e.stopPropagation(); onSelectStudent(s); }}>
                        VIEW →
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }} className="mono-label">
                  No students found matching current filters.
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  )
}