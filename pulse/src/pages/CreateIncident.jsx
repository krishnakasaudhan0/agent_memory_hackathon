import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import { AlertTriangle, Zap } from 'lucide-react';
import { SERVICES } from '../data/seedData';

export default function CreateIncident() {
  const { addIncident } = usePulse();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('P2');
  const [services, setServices] = useState([]);
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description) return;

    const newIncident = addIncident({
      title,
      description,
      severity,
      affectedServices: services,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      rootCause: '',
      resolution: '',
      lessonsLearned: ''
    });

    navigate(`/incidents/${newIncident.id}`);
  };

  const toggleService = (s) => {
    setServices(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><AlertTriangle size={24} style={{ marginRight: 8, color: 'var(--danger)' }} />Report New Incident</h1>
        <p>Pulse AI will instantly search its memory for similar past incidents.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'var(--space-6)' }}>
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="form-group">
              <label className="form-label">Incident Title *</label>
              <input className="form-input" placeholder="e.g. Database connection pool exhausted" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input form-textarea" placeholder="Describe what's happening, what symptoms you're seeing..." value={description} onChange={e => setDescription(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Severity</label>
              <div className="severity-select">
                {['P1', 'P2', 'P3', 'P4'].map(p => (
                  <button type="button" key={p}
                    className={`severity-option ${severity === p ? `selected ${p.toLowerCase()}` : ''}`}
                    onClick={() => setSeverity(p)}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Affected Services</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {SERVICES.map(s => (
                  <button type="button" key={s}
                    className={`service-tag`}
                    style={{
                      cursor: 'pointer',
                      background: services.includes(s) ? 'var(--pulse-glow)' : 'var(--bg-primary)',
                      color: services.includes(s) ? 'var(--pulse-secondary)' : 'var(--text-tertiary)',
                      borderColor: services.includes(s) ? 'var(--pulse-primary)' : 'var(--border-primary)'
                    }}
                    onClick={() => toggleService(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma separated)</label>
              <input className="form-input" placeholder="e.g. database, timeout, deployment" value={tags} onChange={e => setTags(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button type="submit" className="btn btn-primary">
                <Zap size={16} /> Create & Auto-Diagnose
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
            </div>
          </div>
        </form>

        <div className="memory-score-widget" style={{ alignSelf: 'flex-start' }}>
          <div style={{ textAlign: 'center' }}>
            <Zap size={32} style={{ color: 'var(--pulse-primary)', marginBottom: 'var(--space-3)' }} />
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-2)' }}>AI Auto-Diagnosis</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              When you create this incident, Pulse will instantly search its memory of past incidents to find similar patterns, suggest likely root causes, and recommend proven fixes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
