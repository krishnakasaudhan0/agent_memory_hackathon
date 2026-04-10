import { NavLink, useLocation } from 'react-router-dom';
import { usePulse } from '../context/PulseContext';
import {
  Activity, LayoutDashboard, AlertTriangle, BookOpen,
  BarChart3, Plus, Brain, Zap
} from 'lucide-react';

export default function Sidebar() {
  const { incidents, memoryInitialized, memoryScore, cloudConnected } = usePulse();
  const location = useLocation();
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
