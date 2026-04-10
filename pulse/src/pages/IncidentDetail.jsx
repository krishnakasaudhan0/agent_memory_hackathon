import { useParams, useNavigate } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import { useEffect, useState } from 'react';
import {
  ArrowLeft, Clock, Server, Tag, Brain, Zap,
  AlertCircle, Search, Wrench, CheckCircle, Loader2
} from 'lucide-react';

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, aiDiagnosis, diagnoseIncident, updateIncident, memoryLoading } = usePulse();
  const [showResolve, setShowResolve] = useState(false);
  const [rootCause, setRootCause] = useState('');
  const [resolution, setResolution] = useState('');
  const [lessons, setLessons] = useState('');

  const incident = incidents.find(i => i.id === id);
  const diagnosis = aiDiagnosis[id];

  useEffect(() => {
    if (incident && !diagnosis && incident.status !== 'resolved') {
      diagnoseIncident(incident);
    }
  }, [incident, diagnosis]);

  if (!incident) {
    return (
      <div className="empty-state">
        <AlertCircle size={48} />
        <h3>Incident not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/incidents')}>Back to Incidents</button>
      </div>
    );
  }

  const duration = incident.resolvedAt && incident.detectedAt
    ? `${Math.round((new Date(incident.resolvedAt) - new Date(incident.detectedAt)) / 60000)} minutes`
    : 'Ongoing';

  const handleResolve = () => {
    updateIncident({
      id: incident.id,
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      rootCause: rootCause || incident.rootCause,
      resolution: resolution || incident.resolution,
      lessonsLearned: lessons || incident.lessonsLearned
    });
    setShowResolve(false);
  };

  return (
    <div className="animate-in">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-4)' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header */}
      <div className="incident-detail-header">
        <div className="incident-detail-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' }}>
            <span className="incident-id" style={{ fontSize: '0.9375rem' }}>{incident.id}</span>
            <span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span>
            <span className={`status-badge ${incident.status}`}>
              <span className="status-dot" />{incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
            </span>
          </div>
          <h1>{incident.title}</h1>
          <div className="incident-meta" style={{ marginTop: 'var(--space-3)' }}>
            <div className="incident-meta-item"><Clock size={14} />{new Date(incident.detectedAt).toLocaleString()}</div>
            <div className="incident-meta-item"><Clock size={14} />Duration: {duration}</div>
            <div className="incident-meta-item"><Server size={14} />{incident.affectedServices.join(', ')}</div>
          </div>
        </div>
        {incident.status !== 'resolved' && (
          <button className="btn btn-primary" onClick={() => setShowResolve(!showResolve)}>
            <CheckCircle size={16} /> Resolve
          </button>
        )}
      </div>

      <div className="incident-detail-grid">
        {/* Left Column — Timeline & Details */}
        <div>
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Description</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{incident.description}</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
              {incident.tags.map(t => <span key={t} className="service-tag"><Tag size={10} style={{ marginRight: 4 }} />{t}</span>)}
            </div>
          </div>

          {/* Timeline */}
          <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
              <Clock size={16} style={{ marginRight: 8 }} />Timeline
            </h3>
            <div className="timeline">
              {incident.timeline.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${item.type}`} />
                  <div className="timeline-time">{item.time}</div>
                  <div className="timeline-event">{item.event}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Details */}
          {incident.status === 'resolved' && (
            <div className="card">
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                <Wrench size={16} style={{ marginRight: 8 }} />Resolution
              </h3>
              {incident.rootCause && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--danger)', marginBottom: 4, textTransform: 'uppercase' }}>Root Cause</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{incident.rootCause}</p>
                </div>
              )}
              {incident.resolution && (
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', marginBottom: 4, textTransform: 'uppercase' }}>Fix Applied</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{incident.resolution}</p>
                </div>
              )}
              {incident.lessonsLearned && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--pulse-secondary)', marginBottom: 4, textTransform: 'uppercase' }}>Lessons Learned</div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{incident.lessonsLearned}</p>
                </div>
              )}
            </div>
          )}

          {/* Resolve Form */}
          {showResolve && (
            <div className="card resolve-section" style={{ marginTop: 'var(--space-6)' }}>
              <h3><CheckCircle size={16} /> Resolve Incident</h3>
              <div className="form-group">
                <label className="form-label">Root Cause</label>
                <textarea className="form-input form-textarea" placeholder="What was the root cause?" value={rootCause} onChange={e => setRootCause(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Resolution</label>
                <textarea className="form-input form-textarea" placeholder="What fix was applied?" value={resolution} onChange={e => setResolution(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Lessons Learned</label>
                <textarea className="form-input form-textarea" placeholder="What should the team know?" value={lessons} onChange={e => setLessons(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn-primary" onClick={handleResolve}>
                  <CheckCircle size={16} /> Mark as Resolved & Learn
                </button>
                <button className="btn btn-secondary" onClick={() => setShowResolve(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column — AI Panel */}
        <div>
          <div className="ai-panel">
            <div className="ai-panel-header">
              <Brain size={20} />
              <h3>Pulse AI Diagnosis</h3>
              {memoryLoading && <Loader2 size={16} className="spin" style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
            </div>
            <div className="ai-panel-body">
              {!diagnosis && !memoryLoading && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                  {incident.status === 'resolved'
                    ? 'This incident has been resolved and stored in AI memory.'
                    : 'Analyzing incident against memory bank...'}
                </p>
              )}

              {diagnosis && (
                <>
                  <div>
                    <div className="ai-suggestion-label">AI Confidence</div>
                    <div className="ai-confidence">
                      <div className="confidence-bar-bg">
                        <div className="confidence-bar" style={{ width: `${diagnosis.confidence}%` }} />
                      </div>
                      <span className="confidence-value">{diagnosis.confidence}%</span>
                    </div>
                  </div>

                  {diagnosis.aiAnalysis && (
                    <div className="ai-suggestion">
                      <div className="ai-suggestion-label"><Zap size={12} /> AI Analysis</div>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{diagnosis.aiAnalysis}</p>
                    </div>
                  )}

                  {diagnosis.similarIncidents?.length > 0 && (
                    <div>
                      <div className="ai-suggestion-label" style={{ marginBottom: 'var(--space-3)' }}>
                        <Search size={12} /> Similar Past Incidents
                      </div>
                      {diagnosis.similarIncidents.slice(0, 3).map((mem, i) => (
                        <div key={i} className="similar-incident" style={{ marginBottom: 'var(--space-2)' }}>
                          <div className="similar-incident-header">
                            <span className="similar-incident-title">{mem.text?.substring(0, 60)}...</span>
                            <span className="match-score">{mem.type || 'memory'}</span>
                          </div>
                          <p>{mem.text?.substring(0, 200)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {diagnosis.evidence?.length > 0 && (
                    <div>
                      <div className="ai-suggestion-label">Evidence from Memory</div>
                      {diagnosis.evidence.slice(0, 3).map((e, i) => (
                        <div key={i} style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-primary)' }}>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{e.text?.substring(0, 150)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {memoryLoading && (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                  <div style={{ width: 40, height: 40, margin: '0 auto var(--space-3)', borderRadius: '50%', border: '3px solid var(--border-primary)', borderTopColor: 'var(--pulse-primary)', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Searching incident memory...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
