import React from 'react';
import './Sidebar.css';

const Sidebar = ({ currentView, onViewChange, subnetId, onSubnetChange, loading }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'map', label: 'World Map', icon: '🌍' },
    { id: 'miners', label: 'Miner List', icon: '⛏️' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <a 
            href="https://x.com/E_Z_Trades" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sidebar-logo-link"
            title="Follow @E_Z_Trades on X"
          >
            <img 
              src="/logo.png" 
              alt="Miner Spy Logo" 
              className="sidebar-logo-image"
            />
          </a>
          <div className="sidebar-logo-text">
            <h1>Miner Spy</h1>
            <p>Bittensor Analysis Tool</p>
          </div>
        </div>
      </div>

      <div className="subnet-selector">
        <label>Subnet ID</label>
        <input
          type="number"
          value={subnetId}
          onChange={(e) => onSubnetChange(parseInt(e.target.value))}
          min="1"
          max="32"
          disabled={loading}
        />
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentView === item.id ? 'active' : ''}`}
            onClick={() => onViewChange(item.id)}
            disabled={loading}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-indicator">
          <div className={`status-dot ${loading ? 'loading' : 'online'}`}></div>
          <span>{loading ? 'Loading...' : 'Online'}</span>
        </div>
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://taostats.io" target="_blank" rel="noopener noreferrer">
            TaoStats
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
