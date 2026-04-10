import { NavLink, useLocation } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import { useAuth } from '../context/AuthContext';
import { useWebhookIngestion } from '../hooks/useWebhookIngestion';
import {
  Activity, LayoutDashboard, AlertTriangle, BookOpen,
  BarChart3, Plus, Brain, Zap, LogOut, Radio
} from 'lucide-react';

export default function Sidebar() {
  const { incidents, memoryInitialized, memoryScore, cloudConnected } = usePulse();
  const { logout, user } = useAuth();
  const location = useLocation();
  const { webhookConnected } = useWebhookIngestion();
  const activeCount = incidents.filter(i => i.status !== 'resolved').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Activity size={20} />
        </div>
        <div className="sidebar-brand">
          <h1>Pulse</h1>
          <span>Incident Intelligence</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={18} />
          Dashboard
        </NavLink>

        <div className="nav-section-label">Incidents</div>
        <NavLink to="/incidents" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={18} />
          All Incidents
          {activeCount > 0 && <span className="nav-badge">{activeCount}</span>}
        </NavLink>
        <NavLink to="/incidents/new" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Plus size={18} />
          Report Incident
        </NavLink>

        <div className="nav-section-label">Intelligence</div>
        <NavLink to="/knowledge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={18} />
          Knowledge Base
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart3 size={18} />
          Analytics
        </NavLink>
        <NavLink to="/ai-brain" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Brain size={18} />
          AI Brain
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {user && (
          <div className="user-profile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-surface)', borderRadius: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=random`} alt="User" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              <span style={{ fontSize: '0.85rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.displayName || user.email?.split('@')[0]}</span>
            </div>
            <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }} title="Log out">
              <LogOut size={14} />
            </button>
          </div>
        )}
        
        <div className="ai-status" style={{ marginBottom: '8px' }}>
          <div className="ai-status-dot" style={{
            background: webhookConnected ? '#10b981' : '#6b7280'
          }} />
          <div className="ai-status-text">
            <span><Radio size={10} style={{ display: 'inline', marginRight: 4 }} />Webhooks</span>
            <span>{webhookConnected ? 'Live Ingestion' : 'Manual Mode'}</span>
          </div>
        </div>

        <div className="ai-status">
          <div className="ai-status-dot" style={{
            background: memoryInitialized ? (cloudConnected ? '#10b981' : '#f59e0b') : '#ef4444'
          }} />
          <div className="ai-status-text">
            <span><Zap size={10} style={{ display: 'inline', marginRight: 4 }} />Hindsight {cloudConnected ? '☁️ Cloud' : 'AI'}</span>
            <span>{memoryInitialized ? `Memory: ${memoryScore}%` : 'Connecting...'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
