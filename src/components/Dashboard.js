import React, { useState, useEffect } from 'react';
import { apiService, wsService } from '../services/api';
import IssueMap from './IssueMap';
import { IssueCard } from './IssueCard';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    openIssues: 0,
    resolvedIssues: 0,
    criticalIssues: 0,
    avgResponseTime: 0,
    activeUsers: 0
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
    
    // Set up real-time updates
    const handleUpdate = (data) => {
      if (data.type === 'NEW_ISSUE') {
        loadDashboardData(); // Refresh data
      }
    };
    
    wsService.addListener(handleUpdate);
    
    return () => {
      wsService.removeListener(handleUpdate);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load dashboard stats
      const [dashboardStats, recentActivity] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getRecentActivity()
      ]);
      
      setStats(dashboardStats);
      setRecentIssues(recentActivity.slice(0, 5)); // Show last 5 issues
      setError(null);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)} days ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffMinutes} minutes ago`;
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#ef4444',
      critical: '#7c2d12'
    };
    return colors[severity] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '400px' }}>
        <div className="loading-spinner"></div>
        <span style={{ marginLeft: '1rem' }}>Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="text-center" style={{ color: '#ef4444' }}>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn btn-primary mt-3" onClick={loadDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between mb-4">
        <h2>Dashboard Overview</h2>
        <button className="btn btn-primary" onClick={loadDashboardData}>
          🔄 Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalIssues}</div>
          <div className="stat-label">Total Issues</div>
          <div className="stat-change positive">
            +{stats.newIssuesThisWeek || 0} this week
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value">{stats.openIssues}</div>
          <div className="stat-label">Open Issues</div>
          <div className="stat-change negative">
            Needs attention
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-value">{stats.resolvedIssues}</div>
          <div className="stat-label">Resolved Issues</div>
          <div className="stat-change positive">
            {stats.resolvedThisWeek || 0} this week
          </div>
        </div>

        <div className="stat-card critical">
          <div className="stat-value">{stats.criticalIssues}</div>
          <div className="stat-label">Critical Issues</div>
          <div className="stat-change negative">
            Urgent attention needed
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.avgResponseTime}h</div>
          <div className="stat-label">Avg Response Time</div>
          <div className="stat-change positive">
            -0.5h from last week
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.activeUsers}</div>
          <div className="stat-label">Active Users</div>
          <div className="stat-change positive">
            +{stats.newUsersThisWeek || 0} new this week
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-2">
        {/* Recent Issues */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Issues</h3>
            <a href="/issues" className="btn btn-secondary">View All</a>
          </div>
          
          {recentIssues.length === 0 ? (
  <p className="text-center text-gray-500 py-8">
    No recent issues found
  </p>
) : (
  <div className="space-y-3">
    {recentIssues.map((issue) => (
      <IssueCard key={issue.id} issue={issue} />
    ))}
  </div>
)}

</div>


        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          
          <div className="grid gap-3">
            <button className="btn btn-primary" onClick={() => window.location.href = '/issues'}>
              📋 View All Issues
            </button>
            <button className="btn btn-warning" onClick={() => window.location.href = '/issues?status=open'}>
              ⚠️ Critical Issues
            </button>
            <button className="btn btn-success" onClick={() => window.location.href = '/analytics'}>
              📊 View Analytics
            </button>
            <button className="btn btn-secondary" onClick={() => window.location.href = '/whatsapp'}>
              💬 WhatsApp Monitor
            </button>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '0.5rem' }}>System Status</h4>
            <div className="flex-between mb-2">
              <span>WhatsApp Bot</span>
              <span className="status-badge in-progress">ACTIVE</span>
            </div>
            <div className="flex-between mb-2">
              <span>Database</span>
              <span className="status-badge resolved">CONNECTED</span>
            </div>
            <div className="flex-between">
              <span>SMS Service</span>
              <span className="status-badge resolved">OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title">Issues Map</h3>
          <select className="form-select" style={{ width: 'auto' }}>
            <option value="all">All Wards</option>
            <option value="1">Ward 1</option>
            <option value="2">Ward 2</option>
            <option value="3">Ward 3</option>
            {/* Add more wards */}
          </select>
        </div>
        <IssueMap issues={recentIssues} />
      </div>
    </div>
  );
};

export default Dashboard;