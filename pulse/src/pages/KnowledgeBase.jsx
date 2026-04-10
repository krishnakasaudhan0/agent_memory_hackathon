import { usePulse } from '../context/PulseContext';
import { BookOpen, Tag, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function KnowledgeBase() {
  const { incidents } = usePulse();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const resolved = incidents.filter(i => i.status === 'resolved' && i.rootCause);

  // Group by tags
  const tagGroups = {};
  resolved.forEach(i => {
    i.tags.forEach(t => {
      if (!tagGroups[t]) tagGroups[t] = [];
      tagGroups[t].push(i);
    });
  });

  const filtered = resolved.filter(i =>
    !search || i.title.toLowerCase().includes(search.toLowerCase()) ||
    i.rootCause.toLowerCase().includes(search.toLowerCase()) ||
    i.tags.some(t => t.includes(search.toLowerCase()))
  );

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><BookOpen size={24} style={{ marginRight: 8 }} />Knowledge Base</h1>
        <p>Auto-generated from {resolved.length} resolved incidents. Powered by Hindsight AI memory.</p>
      </div>

      <div className="search-bar">
        <BookOpen size={18} />
        <input placeholder="Search knowledge base by keyword, root cause, or tag..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Tag summary */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-6)' }}>
        {Object.entries(tagGroups).sort((a, b) => b[1].length - a[1].length).slice(0, 12).map(([tag, items]) => (
          <button key={tag}
            className="service-tag"
            style={{ cursor: 'pointer' }}
            onClick={() => setSearch(tag)}>
            <Tag size={10} style={{ marginRight: 4 }} />{tag} ({items.length})
          </button>
        ))}
      </div>

      <div className="knowledge-grid">
        {filtered.map(incident => (
          <div key={incident.id} className="knowledge-card" onClick={() => navigate(`/incidents/${incident.id}`)}>
            <div className="knowledge-card-header">
              <span className={`severity-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span>
              <span className="knowledge-count">{incident.id}</span>
            </div>
            <h3>{incident.title}</h3>
            <p><strong style={{ color: 'var(--danger)' }}>Root Cause:</strong> {incident.rootCause}</p>
            <div style={{ marginTop: 'var(--space-3)' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--success)' }}>
                <strong>Fix:</strong> {incident.resolution}
              </p>
            </div>
            <div className="knowledge-card-footer">
              <div className="knowledge-card-tags">
                {incident.tags.slice(0, 3).map(t => <span key={t} className="knowledge-tag">{t}</span>)}
              </div>
              <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <BookOpen size={48} />
          <h3>No knowledge entries found</h3>
          <p>Resolve incidents to build your knowledge base.</p>
        </div>
      )}
    </div>
  );
}
