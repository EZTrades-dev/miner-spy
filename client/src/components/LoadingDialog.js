import React from 'react';
import './LoadingDialog.css';

const LoadingDialog = ({ 
  isVisible, 
  progress = 0, 
  stage = 'Loading...', 
  message = '', 
  canCancel = false, 
  onCancel 
}) => {
  if (!isVisible) return null;

  return (
    <div className="loading-dialog-overlay">
      <div className="loading-dialog">
        <div className="loading-dialog-header">
          <h3>🔄 Loading Data</h3>
          {canCancel && (
            <button 
              className="loading-dialog-close" 
              onClick={onCancel}
              title="Cancel loading"
            >
              ✕
            </button>
          )}
        </div>
        
        <div className="loading-dialog-content">
          <div className="loading-stage">
            <span className="loading-icon">⚡</span>
            <span className="loading-stage-text">{stage}</span>
          </div>
          
          {message && (
            <div className="loading-message">
              {message}
            </div>
          )}
          
          <div className="loading-progress-container">
            <div className="loading-progress-bar">
              <div 
                className="loading-progress-fill" 
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
            <div className="loading-progress-text">
              {progress > 0 ? `${Math.round(progress)}%` : 'Starting...'}
            </div>
          </div>
          
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDialog;
