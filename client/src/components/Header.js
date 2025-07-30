import React from 'react';
import './Header.css';

const Header = ({ title, subtitle, children }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <a 
            href="https://x.com/E_Z_Trades" 
            target="_blank" 
            rel="noopener noreferrer"
            className="logo-link"
            title="Follow @E_Z_Trades on X"
          >
            <img 
              src="/logo.png" 
              alt="Miner Spy Logo" 
              className="logo-image"
            />
          </a>
          <div className="logo-text">
            <h1>Miner Spy</h1>
            <span className="logo-tagline">Bittensor Analysis Tool</span>
          </div>
        </div>
        
        {(title || subtitle) && (
          <div className="header-title-section">
            {title && <h2 className="header-title">{title}</h2>}
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        )}
        
        {children && (
          <div className="header-actions">
            {children}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
