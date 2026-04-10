import { useNavigate } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import { AlertTriangle, Search, Filter } from 'lucide-react';
import { useState } from 'react';

export default function IncidentList() {
  const { incidents } = usePulse();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = incidents.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.tags.some(t => t.includes(search.toLowerCase()));
    const matchSeverity = severityFilter === 'all' || i.severity === severityFilter;
    const matchStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1>Incidents</h1>
            <p>{incidents.length} total incidents • {incidents.filter(i => i.status !== 'resolved').length} active</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/incidents/new')}>
            <AlertTriangle size={16} /> Report Incident
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 280, marginBottom: 0 }}>
          <Search />
          <input type="text" placeholder="Search incidents by title or tag..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 'auto' }} value={severityFilter} onChange={e => setSeverityFilter(e.target.value)}>
          <option value="all">All Severity</option>
          <option value="P1">P1 - Critical</option>
          <option value="P2">P2 - High</option>
          <option value="P3">P3 - Medium</option>
          <option value="P4">P4 - Low</option>
        </select>
        <select className="form-input" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="detected">Detected</option>
          <option value="investigating">Investigating</option>
          <option value="identified">Identified</option>
          <option value="monitoring">Monitoring</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-header incident-table-header">
        <span>ID</span><span>Incident</span><span>Severity</span><span>Status</span><span>Time</span><span>Duration</span>
      </div>
      <div className="incident-list">
        {filtered.map(incident => {
          const duration = incident.resolvedAt && incident.detectedAt
            ? `${Math.round((new Date(incident.resolvedAt) - new Date(incident.detectedAt)) / 60000)}m`
            : 'Ongoing';
          const timeAgo = getTimeAgo(incident.detectedAt);

          return (
            <div key={incident.id}
              className={`incident-row ${incident.status !== 'resolved' ? 'active-incident' : ''}`}
              onClick={() => navigate(`/incidents/${incident.id}`)}>
              <span className="incident-id">{incident.id}</span>
              <div className="incident-info">
                <span className="incident-title">{incident.title}</span>
                <div className="incident-services">
                  {incident.affectedServices.slice(0, 3).map(s => <span key={s} className="service-tag">{s}</span>)}
                </div>
              </div>
              <span><span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span></span>
              <span>
                <span className={`status-badge ${incident.status}`}>
                  <span className="status-dot" />{incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
                </span>
              </span>
              <span className="incident-time">{timeAgo}</span>
              <span className="incident-duration">{duration}</span>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="empty-state">
            <Filter size={48} />
            <h3>No incidents found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
