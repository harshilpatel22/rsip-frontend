import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import IssuesList from './components/IssuesList';
import Analytics from './components/Analytics';
import WhatsAppMonitor from './components/WhatsAppMonitor';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    // Check backend connection
    checkBackendConnection();
  }, []);

  const checkBackendConnection = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/health`);
      if (response.ok) {
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    }
  };

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>RSIP - RMC Dashboard</h1>
            <div className="connection-status">
              <span className={`status-indicator ${connectionStatus}`}></span>
              <span>{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </header>

        <nav className="navigation">
          <ul>
            <li>
              <Link 
                to="/" 
                className={activeTab === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveTab('dashboard')}
              >
                📊 Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/issues" 
                className={activeTab === 'issues' ? 'active' : ''}
                onClick={() => setActiveTab('issues')}
              >
                📋 Issues
              </Link>
            </li>
            <li>
              <Link 
                to="/analytics" 
                className={activeTab === 'analytics' ? 'active' : ''}
                onClick={() => setActiveTab('analytics')}
              >
                📈 Analytics
              </Link>
            </li>
            <li>
              <Link 
                to="/whatsapp" 
                className={activeTab === 'whatsapp' ? 'active' : ''}
                onClick={() => setActiveTab('whatsapp')}
              >
                💬 WhatsApp Monitor
              </Link>
            </li>
          </ul>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/issues" element={<IssuesList />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/whatsapp" element={<WhatsAppMonitor />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2025 Rajkot Municipal Corporation - RSIP System</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;