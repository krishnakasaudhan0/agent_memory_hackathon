import { useNavigate } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import {
  AlertTriangle, Clock, TrendingDown, Brain,
  ArrowUpRight, ArrowDownRight, Minus, ChevronRight, Zap
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mttrTrend, rootCauseDistribution } from '../data/seedData';

export default function Dashboard() {
  const { incidents, memoryScore, totalMemories } = usePulse();
  const navigate = useNavigate();

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
  const avgMTTR = resolvedIncidents.reduce((sum, i) => {
    if (i.resolvedAt && i.detectedAt) {
      return sum + (new Date(i.resolvedAt) - new Date(i.detectedAt)) / 60000;
    }
    return sum;
  }, 0) / (resolvedIncidents.length || 1);

  const p1Count = incidents.filter(i => i.severity === 'P1' && i.status !== 'resolved').length;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Command Center</h1>
            <p>Real-time incident intelligence powered by Hindsight AI</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/incidents/new')}>
            <AlertTriangle size={16} />
            Report Incident
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card danger animate-in animate-in-delay-1">
          <div className="metric-header">
            <div className="metric-icon danger"><AlertTriangle size={20} /></div>
            {activeIncidents.length > 0 ? (
              <div className="metric-trend up"><ArrowUpRight size={14} />{activeIncidents.length}</div>
            ) : (
              <div className="metric-trend neutral"><Minus size={14} />0</div>
            )}
          </div>
          <div className="metric-value">{activeIncidents.length}</div>
          <div className="metric-label">Active Incidents</div>
        </div>

        <div className="metric-card warning animate-in animate-in-delay-2">
          <div className="metric-header">
            <div className="metric-icon warning"><Clock size={20} /></div>
            <div className="metric-trend down"><ArrowDownRight size={14} />-18%</div>
          </div>
          <div className="metric-value">{Math.round(avgMTTR)}m</div>
          <div className="metric-label">Avg. MTTR</div>
        </div>

        <div className="metric-card success animate-in animate-in-delay-3">
          <div className="metric-header">
            <div className="metric-icon success"><TrendingDown size={20} /></div>
            <div className="metric-trend down"><ArrowDownRight size={14} />-32%</div>
          </div>
          <div className="metric-value">{resolvedIncidents.length}</div>
          <div className="metric-label">Resolved This Month</div>
        </div>

        <div className="metric-card primary animate-in animate-in-delay-4">
          <div className="metric-header">
            <div className="metric-icon primary"><Brain size={20} /></div>
            <div className="metric-trend neutral"><Zap size={14} />Learning</div>
          </div>
          <div className="metric-value">{memoryScore}%</div>
          <div className="metric-label">AI Memory Score</div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
        {/* MTTR Trend */}
        <div className="card animate-in animate-in-delay-2">
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingDown size={18} style={{ color: 'var(--text-tertiary)' }} />
            MTTR Trend — Getting Faster
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={mttrTrend}>
              <defs>
                <linearGradient id="mttrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} unit="m" />
              <Tooltip
                contentStyle={{
                  background: '#12121a', border: '1px solid #1e1e2e',
                  borderRadius: 8, fontSize: 13, color: '#f1f5f9'
                }}
                formatter={(val) => [`${val} min`, 'MTTR']}
              />
              <Area type="monotone" dataKey="mttr" stroke="#6366f1" strokeWidth={2} fill="url(#mttrGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Memory Widget */}
        <div className="memory-score-widget animate-in animate-in-delay-3">
          <div className="memory-score-circle">
            <svg viewBox="0 0 120 120">
              <defs>
                <linearGradient id="pulse-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="bg" cx="60" cy="60" r="52" />
              <circle className="progress" cx="60" cy="60" r="52"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - memoryScore / 100)}`}
                stroke="url(#pulse-gradient)"
              />
            </svg>
            <div className="memory-score-value">
              <div className="number">{memoryScore}</div>
              <div className="label">Score</div>
            </div>
          </div>
          <div className="memory-score-details">
            <h3>AI Memory</h3>
            <p>Pulse has learned from {totalMemories} resolved incidents and is ready to diagnose new issues.</p>
          </div>
          <div className="memory-stats">
            <div className="memory-stat">
              <div className="value">{totalMemories}</div>
              <div className="label">Memories</div>
            </div>
            <div className="memory-stat">
              <div className="value">{incidents.filter(i => i.rootCause).length}</div>
              <div className="label">Root Causes</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="card animate-in animate-in-delay-3">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
          <h3 style={{ fontSize: '0.9375rem', fontWeight: 600 }}>Recent Incidents</h3>
          <button className="btn btn-ghost" onClick={() => navigate('/incidents')}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        <div className="table-header incident-table-header">
          <span>ID</span>
          <span>Incident</span>
          <span>Severity</span>
          <span>Status</span>
          <span>Time</span>
          <span>Duration</span>
        </div>

        <div className="incident-list">
          {incidents.slice(0, 6).map(incident => (
            <IncidentRow key={incident.id} incident={incident} onClick={() => navigate(`/incidents/${incident.id}`)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function IncidentRow({ incident, onClick }) {
  const duration = incident.resolvedAt && incident.detectedAt
    ? `${Math.round((new Date(incident.resolvedAt) - new Date(incident.detectedAt)) / 60000)}m`
    : 'Ongoing';

  const timeAgo = getTimeAgo(incident.detectedAt);

  return (
    <div className={`incident-row ${incident.status !== 'resolved' ? 'active-incident' : ''}`} onClick={onClick}>
      <span className="incident-id">{incident.id}</span>
      <div className="incident-info">
        <span className="incident-title">{incident.title}</span>
        <div className="incident-services">
          {incident.affectedServices.slice(0, 3).map(s => (
            <span key={s} className="service-tag">{s}</span>
          ))}
        </div>
      </div>
      <span><span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span></span>
      <span>
        <span className={`status-badge ${incident.status}`}>
          <span className="status-dot" />
          {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
        </span>
      </span>
      <span className="incident-time">{timeAgo}</span>
      <span className="incident-duration">{duration}</span>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
