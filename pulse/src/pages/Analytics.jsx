import { usePulse } from '../context/PulseContext';
import { BarChart3, TrendingDown, PieChart as PieIcon, Activity } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { mttrTrend, incidentsByService, rootCauseDistribution } from '../data/seedData';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export default function Analytics() {
  const { incidents } = usePulse();

  const severityData = [
    { name: 'P1', count: incidents.filter(i => i.severity === 'P1').length, color: '#ef4444' },
    { name: 'P2', count: incidents.filter(i => i.severity === 'P2').length, color: '#f59e0b' },
    { name: 'P3', count: incidents.filter(i => i.severity === 'P3').length, color: '#3b82f6' },
    { name: 'P4', count: incidents.filter(i => i.severity === 'P4').length, color: '#6b7280' },
  ];

  const tooltipStyle = {
    background: '#12121a', border: '1px solid #1e1e2e',
    borderRadius: 8, fontSize: 13, color: '#f1f5f9'
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1><BarChart3 size={24} style={{ marginRight: 8 }} />Analytics</h1>
        <p>Incident trends and patterns — Pulse is helping your team resolve faster.</p>
      </div>

      <div className="analytics-grid">
        {/* MTTR Trend */}
        <div className="chart-card animate-in animate-in-delay-1">
          <h3><TrendingDown size={18} />MTTR Trend (Minutes)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={mttrTrend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} min`, 'MTTR']} />
              <Area type="monotone" dataKey="mttr" stroke="#6366f1" strokeWidth={2} fill="url(#grad1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Service */}
        <div className="chart-card animate-in animate-in-delay-2">
          <h3><Activity size={18} />Incidents by Service</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={incidentsByService} layout="vertical">
              <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {incidentsByService.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Root Cause Distribution */}
        <div className="chart-card animate-in animate-in-delay-3">
          <h3><PieIcon size={18} />Root Cause Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={rootCauseDistribution} cx="50%" cy="50%" outerRadius={90} innerRadius={50}
                paddingAngle={3} dataKey="value" label={({ name, value }) => `${name} ${value}%`}
                labelLine={{ stroke: '#475569' }} fontSize={11}>
                {rootCauseDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Distribution */}
        <div className="chart-card animate-in animate-in-delay-4">
          <h3><BarChart3 size={18} />Severity Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={severityData}>
              <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
