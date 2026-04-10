import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogIn } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Login() {
  const { login, user } = useAuth();
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError(null);
      await login();
    } catch (err) {
      console.error(err);
      setError("Failed to sign in. Please verify your Firebase configuration.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-brand">
          <div className="sidebar-logo">
            <Activity size={32} />
          </div>
          <h1>Pulse</h1>
          <p>Incident Intelligence Engine</p>
        </div>

        <div className="login-content">
          <h2>Secure Login</h2>
          <p>Sign in to access your team's persistent incident memory and AI diagnostic brain.</p>
          
          {error && <div className="alert error">{error}</div>}

          <button 
            className="btn btn-primary login-btn" 
            onClick={handleLogin}
            disabled={isLoggingIn}
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
          >
            <LogIn size={18} />
            {isLoggingIn ? "Authenticating..." : "Sign in with Google"}
          </button>
        </div>
      </div>
    </div>
  );
}
