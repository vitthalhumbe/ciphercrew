import { useState, useEffect, useMemo } from 'react'

const API = 'http://localhost:8000'

// --- Subcomponents ---
function RiskBadge({ level }) {
  const safeLevel = level || 'unknown'
  return <span className={`risk-badge risk-${safeLevel}`}>{safeLevel}</span>
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className="stat-card">
      <div className="section-label-pro">{label}</div>
      <div className={`stat-value ${colorClass || ''}`}>
        {value}
      </div>
    </div>
  )
}

// Map short branch codes to full names for a premium look
const BRANCH_NAMES = {
  'CS': 'Computer Science',
  'IT': 'Information Tech',
  'ME': 'Mechanical Eng',
  'EE': 'Electrical Eng',
  'CE': 'Civil Eng'
}

export default function AdminDashboard({ onBack, onSelectStudent }) {
  const [students, setStudents] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') 
  const [sortBy, setSortBy] = useState('risk') 

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
      setTimeout(() => {
        setSummary({
          total: 142, high_risk_count: 12, medium_risk_count: 34, low_risk_count: 96, avg_risk: 0.28,
          common_struggle_topics: ["Pointers in C", "Dynamic Programming", "Time Management", "Project Deadlines"]
        })
        setStudents([
          { id: 'S001', name: 'Aarav Sharma', roll: '22CS001', branch: 'CS', risk: { level: 'high', score: 0.85, trend: 'declining' } },
          { id: 'S002', name: 'Priya Patil', roll: '22CS002', branch: 'IT', risk: { level: 'medium', score: 0.55, trend: 'stable' } },
          { id: 'S003', name: 'Rohan Kulkarni', roll: '22ME001', branch: 'ME', risk: { level: 'low', score: 0.12, trend: 'improving' } },
          { id: 'S004', name: 'Sneha Desai', roll: '22CS003', branch: 'CS', risk: { level: 'high', score: 0.78, trend: 'declining' } },
          { id: 'S005', name: 'Vikram Joshi', roll: '22ME002', branch: 'ME', risk: { level: 'medium', score: 0.45, trend: 'stable' } },
          { id: 'S006', name: 'Ananya Nair', roll: '22CS004', branch: 'CS', risk: { level: 'low', score: 0.20, trend: 'improving' } },
          { id: 'S007', name: 'Karan Mehta', roll: '22IT001', branch: 'IT', risk: { level: 'high', score: 0.72, trend: 'declining' } },
          { id: 'S008', name: 'Divya Reddy', roll: '22IT002', branch: 'IT', risk: { level: 'low', score: 0.18, trend: 'stable' } },
        ])
        setLoading(false)
      }, 800)
    })
  }, [])

  // --- Dynamic Branch Aggregation ---
  // We calculate department stats on the fly based on the students array!
  const branchStats = useMemo(() => {
    const stats = {}
    students.forEach(s => {
      const b = s.branch || 'OTHER'
      if (!stats[b]) {
        stats[b] = { total: 0, high: 0, medium: 0, low: 0, riskSum: 0 }
      }
      stats[b].total++
      stats[b].riskSum += (s.risk?.score || 0)
      
      const level = s.risk?.level || 'low'
      if (level === 'high') stats[b].high++
      else if (level === 'medium') stats[b].medium++
      else stats[b].low++
    })
    return Object.entries(stats).map(([branch, data]) => ({
      branch,
      name: BRANCH_NAMES[branch] || branch,
      ...data,
      avgRisk: data.riskSum / data.total,
      highRiskRatio: data.high / data.total
    })).sort((a, b) => b.avgRisk - a.avgRisk) // Sort by most at-risk branch first
  }, [students])

  // --- Table Filtering & Sorting ---
  const filtered = students
    .filter(s => filter === 'all' || s.risk?.level === filter)
    .sort((a, b) => {
      if (sortBy === 'risk') return (b.risk?.score || 0) - (a.risk?.score || 0)
      return a.name.localeCompare(b.name)
    })

  return (
    <div className="admin-wrapper">
      <style>{`
        .admin-wrapper { width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden; background: var(--bg-base); }
        .topbar-header { padding: 16px 32px; border-bottom: 1px solid var(--border); background: var(--bg-surface); display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; z-index: 10; }
        .main-scroll { flex: 1; overflow-y: auto; padding: 32px; }

        .btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--text-main); padding: 8px 16px; border-radius: 6px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
        .btn-ghost:hover { background: var(--bg-surface-hover); border-color: var(--border-strong); }
        .btn-ghost.active { background: var(--text-main); color: var(--bg-base); border-color: var(--text-main); }

        .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .stat-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 12px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.05); border-color: var(--border-strong); }
        .stat-value { font-size: 40px; font-weight: 800; line-height: 1; letter-spacing: -0.02em; font-family: 'Inter', sans-serif; }

        /* Branch Breakdown Cards */
        .branch-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .branch-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; gap: 16px; transition: all 0.2s ease; }
        .branch-card:hover { border-color: var(--border-strong); background: var(--bg-surface-hover); }
        .branch-insight { background: var(--bg-base); border: 1px solid var(--border); border-left: 3px solid var(--accent-blue); padding: 16px; border-radius: 6px; font-size: 14px; color: var(--text-main); line-height: 1.5; }
        .branch-insight.critical { border-left-color: var(--accent-red); background: rgba(225, 29, 72, 0.05); }

        .color-red { color: var(--accent-red); } .color-yellow { color: var(--accent-yellow); } .color-green { color: var(--accent-green); } .color-default { color: var(--text-main); } .color-dim { color: var(--text-muted); }

        .risk-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Inter', sans-serif; }
        .risk-high { background: rgba(225, 29, 72, 0.1); color: var(--accent-red); border: 1px solid rgba(225, 29, 72, 0.2); }
        .risk-medium { background: rgba(217, 119, 6, 0.1); color: var(--accent-yellow); border: 1px solid rgba(217, 119, 6, 0.2); }
        .risk-low { background: rgba(5, 150, 105, 0.1); color: var(--accent-green); border: 1px solid rgba(5, 150, 105, 0.2); }

        .data-table-container { border: 1px solid var(--border); border-radius: 12px; background: var(--bg-surface); overflow: hidden; }
        .table-row { display: grid; grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr 100px; align-items: center; padding: 16px 24px; border-bottom: 1px solid var(--border); transition: background 0.15s ease; }
        .table-row:last-child { border-bottom: none; }
        .table-header { background: var(--bg-surface); border-bottom: 1px solid var(--border-strong); }
        .table-body-row { cursor: pointer; }
        .table-body-row:hover { background: var(--bg-surface-hover); }

        .fade-up { animation: fadeUp 0.5s ease forwards; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* TOPBAR */}
      <div className="topbar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button className="btn-ghost" onClick={onBack}>← HOME</button>
          <div>
            <div className="section-label-pro" style={{ marginBottom: '4px' }}>Institution Dashboard</div>
            <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>Batch Overview — SY 2024–25</div>
          </div>
        </div>
        <div className="section-label-pro">New Institute of Technology, Kolhapur</div>
      </div>

      <div className="main-scroll">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '100px', color: 'var(--text-dim)' }} className="section-label-pro">
            Aggregating System Data...
          </div>
        ) : (
          <div className="fade-up">
            
            {/* 1. TOP-LEVEL STATS */}
            {summary && (
              <div className="stat-grid">
                                <StatCard label="TOTAL STUDENTS" value={summary.total} colorClass="color-default" />
                                <StatCard label="HIGH RISK" value={summary.high_risk_count} colorClass="color-red" />
                                <StatCard label="MEDIUM RISK" value={summary.medium_risk_count} colorClass="color-yellow" />
                                <StatCard label="LOW RISK" value={summary.low_risk_count} colorClass="color-green" />
                                <StatCard label="AVG RISK SCORE" value={`${(summary.avg_risk * 100).toFixed(0)}%`} colorClass="color-dim" />
                            </div>
            )}

            {/* 2. DEPARTMENT ANALYSIS (NEW FEATURE) */}
            <div className="section-label-pro" style={{ marginBottom: '16px', color: 'var(--text-main)' }}>
              Department Analysis
            </div>
            <div className="branch-grid">
              {branchStats.map(stat => {
                const isCritical = stat.highRiskRatio > 0.25; // 25% or more high risk
                const avgRiskPct = (stat.avgRisk * 100).toFixed(0);
                
                // Auto-generate insight text based on data
                let insightText = "";
                if (stat.total === 0) insightText = "No data available.";
                else if (isCritical) insightText = `Critical Alert: ${(stat.highRiskRatio * 100).toFixed(0)}% of students are at high risk. Immediate departmental review recommended.`;
                else if (stat.avgRisk > 0.4) insightText = `Warning: Average risk score is climbing (${avgRiskPct}%). Closely monitor medium-risk students.`;
                else insightText = `Department is stable. Only ${stat.high} students currently require high-level intervention.`;

                return (
                  <div key={stat.branch} className="branch-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                          {stat.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({stat.branch})</span>
                        </div>
                        <div className="section-label-pro">
                          {stat.total} Enrolled Students
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="data-number" style={{ fontSize: '24px', fontWeight: 800, color: isCritical ? 'var(--accent-red)' : 'var(--text-main)', lineHeight: 1 }}>
                          {avgRiskPct}%
                        </div>
                        <div className="section-label-pro" style={{ fontSize: '10px', marginTop: '4px' }}>Avg Risk</div>
                      </div>
                    </div>

                    {/* Risk Breakdown Bar */}
                    <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden', background: 'var(--border)' }}>
                      <div style={{ width: `${(stat.high / stat.total) * 100}%`, background: 'var(--accent-red)' }} title={`${stat.high} High Risk`} />
                      <div style={{ width: `${(stat.medium / stat.total) * 100}%`, background: 'var(--accent-yellow)' }} title={`${stat.medium} Medium Risk`} />
                      <div style={{ width: `${(stat.low / stat.total) * 100}%`, background: 'var(--accent-green)' }} title={`${stat.low} Low Risk`} />
                    </div>

                    {/* Auto-Generated Insight */}
                    <div className={`branch-insight ${isCritical ? 'critical' : ''}`}>
                      {insightText}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* 3. STUDENT DATA TABLE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="section-label-pro" style={{ marginRight: '8px' }}>Risk Filter:</span>
                {['all', 'high', 'medium', 'low'].map(f => (
                  <button key={f} className={`btn-ghost ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="section-label-pro" style={{ marginRight: '8px' }}>Sort By:</span>
                {['risk', 'name'].map(s => (
                  <button key={s} className={`btn-ghost ${sortBy === s ? 'active' : ''}`} onClick={() => setSortBy(s)}>
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="data-table-container">
              <div className="table-row table-header section-label-pro">
                <span>Student Details</span>
                <span>Branch</span>
                <span>Risk Level</span>
                <span>Risk Score</span>
                <span>Trend</span>
                <span style={{ textAlign: 'right' }}>Action</span>
              </div>

              {filtered.map(s => {
                const isHigh = s.risk?.level === 'high';
                const isMed = s.risk?.level === 'medium';
                
                return (
                  <div key={s.id} className="table-row table-body-row" onClick={() => onSelectStudent(s)}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>{s.name}</div>
                      <div className="data-number" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.roll}</div>
                    </div>
                    
                    <div className="section-label-pro" style={{ color: 'var(--text-main)' }}>{s.branch || 'N/A'}</div>
                    
                    <div><RiskBadge level={s.risk?.level} /></div>
                    
                    <div className="data-number" style={{ 
                      fontSize: '15px', fontWeight: 700,
                      color: isHigh ? 'var(--accent-red)' : isMed ? 'var(--accent-yellow)' : 'var(--accent-green)'
                    }}>
                      {((s.risk?.score || 0) * 100).toFixed(0)}%
                    </div>
                    
                    <div className="section-label-pro" style={{ 
                      fontWeight: 700,
                      color: s.risk?.trend === 'declining' ? 'var(--accent-red)' : s.risk?.trend === 'improving' ? 'var(--accent-green)' : 'var(--text-dim)'
                    }}>
                      {s.risk?.trend === 'declining' ? '↓ Declining' : s.risk?.trend === 'improving' ? '↑ Improving' : '→ Stable'}
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <button className="btn-ghost" onClick={e => { e.stopPropagation(); onSelectStudent(s); }}>
                        View →
                      </button>
                    </div>
                  </div>
                )
              })}
              
              {filtered.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }} className="section-label-pro">
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