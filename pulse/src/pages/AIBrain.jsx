import { useState } from 'react';
import { usePulse } from '../context/PulseContext';
import { Brain, Send, Loader2, Zap, MessageSquare } from 'lucide-react';

export default function AIBrain() {
  const { reflectOnQuery, memoryScore, totalMemories, memoryInitialized } = usePulse();
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query;
    setQuery('');
    setResponses(prev => [...prev, { type: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const result = await reflectOnQuery(userQuery);
      setResponses(prev => [...prev, {
        type: 'ai',
        text: result.text || 'No relevant memories found.',
        evidence: result.based_on?.memories || []
      }]);
    } catch (err) {
      setResponses(prev => [...prev, { type: 'ai', text: 'Error: Unable to process query.' }]);
    }

    setLoading(false);
  };

  const suggestions = [
    'What are the most common root causes we see?',
    'What should we check when database connections spike?',
    'How have we handled Redis failures in the past?',
    'What are our biggest risks right now?',
    'How has our incident response improved over time?'
  ];

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <div className="page-header" style={{ marginBottom: 'var(--space-4)' }}>
        <h1><Brain size={24} style={{ marginRight: 8, color: 'var(--pulse-primary)' }} />AI Brain</h1>
        <p>Ask Pulse anything about your incident history. It reflects on {totalMemories} memories to answer.</p>
      </div>

      {/* Chat Area */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
        {responses.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-16) var(--space-8)' }}>
            <Brain size={64} style={{ color: 'var(--pulse-primary)', margin: '0 auto var(--space-6)', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: 'var(--space-2)' }}>Ask Pulse AI</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)', maxWidth: 500, margin: '0 auto var(--space-6)' }}>
              Pulse uses Hindsight&apos;s reflect capability to analyze your incident memory and provide deep, contextual answers.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', justifyContent: 'center' }}>
              {suggestions.map((s, i) => (
                <button key={i} className="btn btn-secondary" style={{ fontSize: '0.8125rem' }}
                  onClick={() => { setQuery(s); }}>
                  <MessageSquare size={14} />{s}
                </button>
              ))}
            </div>
          </div>
        )}

        {responses.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 'var(--space-3)',
            animation: 'slide-up 0.3s ease'
          }}>
            <div style={{
              maxWidth: '70%',
              padding: 'var(--space-4) var(--space-5)',
              borderRadius: msg.type === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.type === 'user' ? 'var(--pulse-primary)' : 'var(--bg-surface)',
              border: msg.type === 'ai' ? '1px solid var(--border-primary)' : 'none',
              color: 'var(--text-primary)'
            }}>
              {msg.type === 'ai' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-2)' }}>
                  <Zap size={12} style={{ color: 'var(--pulse-primary)' }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--pulse-secondary)' }}>PULSE AI</span>
                </div>
              )}
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
              {msg.evidence?.length > 0 && (
                <div style={{ marginTop: 'var(--space-3)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>
                    Based on {msg.evidence.length} memories
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--border-primary)', borderTopColor: 'var(--pulse-primary)', animation: 'spin 1s linear infinite' }} />
            Reflecting on incident memory...
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <input className="form-input" style={{ flex: 1, padding: 'var(--space-4)' }}
          placeholder="Ask Pulse about your incident history..."
          value={query} onChange={e => setQuery(e.target.value)}
          disabled={loading} />
        <button type="submit" className="btn btn-primary" disabled={loading || !query.trim()}>
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} />}
          Ask
        </button>
      </form>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
