import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PulseProvider } from './context/PulseContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import IncidentList from './pages/IncidentList';
import IncidentDetail from './pages/IncidentDetail';
import CreateIncident from './pages/CreateIncident';
import KnowledgeBase from './pages/KnowledgeBase';
import Analytics from './pages/Analytics';
import AIBrain from './pages/AIBrain';

function App() {
  return (
    <BrowserRouter>
      <PulseProvider>
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
      </PulseProvider>
    </BrowserRouter>
  );
}

export default App;
