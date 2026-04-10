import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PulseProvider } from './context/PulseContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import CreateIncident from './pages/CreateIncident';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import AIBrain from './pages/AIBrain';
import Login from './pages/Login';

function PrivateRoute() {
  const { user, loading } = useAuth();
  
  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'white' }}>Pulse AI Loading Secure Context...</div>;
  
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/incidents" element={<IncidentList />} />
          <Route path="/incidents/new" element={<CreateIncident />} />
          <Route path="/incidents/:id" element={<IncidentDetail />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/ai-brain" element={<AIBrain />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PulseProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/*" element={<MainLayout />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PulseProvider>
    </AuthProvider>
  );
}

export default App;
