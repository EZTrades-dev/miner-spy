import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import MinerList from './components/MinerList';
import LoadingDialog from './components/LoadingDialog';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const IS_DEMO_MODE = process.env.REACT_APP_DEMO_MODE === 'true';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [subnetData, setSubnetData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subnetId, setSubnetId] = useState(8);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStage, setLoadingStage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const fetchWithRetry = async (url, maxRetries = 3, delay = 2000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url);
        
        if (response.status === 429) {
          // Rate limited
          const retryAfter = response.headers.get('Retry-After') || delay / 1000;
          const waitTime = Math.max(delay, retryAfter * 1000);
          
          setLoadingMessage(`Rate limited. Retrying in ${Math.ceil(waitTime / 1000)} seconds... (${attempt}/${maxRetries})`);
          await sleep(waitTime);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return response;
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }
        
        setLoadingMessage(`Attempt ${attempt} failed. Retrying in ${delay / 1000} seconds...`);
        await sleep(delay);
      }
    }
  };

  const fetchSubnetData = async () => {
    setLoading(true);
    setError(null);
    setLoadingProgress(0);
    setLoadingStage('Initializing...');
    setLoadingMessage('');
    
    try {
      console.log(`Fetching data for subnet ${subnetId}...`);
      
      // Demo mode - load from static file
      if (IS_DEMO_MODE) {
        setLoadingStage('Loading demo data...');
        setLoadingProgress(20);
        setLoadingMessage('Using sample data for demonstration');
        
        const response = await fetch('/demo-data.json');
        if (!response.ok) {
          throw new Error('Demo data not available');
        }
        
        const demoData = await response.json();
        setLoadingProgress(70);
        
        setSubnetData({
          subnet: demoData.subnet,
          miners: demoData.miners
        });
        setAnalysis(demoData.analysis);
        
        setLoadingStage('Demo Ready!');
        setLoadingProgress(100);
        setLoadingMessage('Demo data loaded successfully');
        await sleep(500);
        
        setLoading(false);
        return;
      }
      
      // Production mode - fetch from API
      // Stage 1: Fetch subnet data
      setLoadingStage('Fetching subnet data...');
      setLoadingProgress(10);
      
      const response = await fetchWithRetry(`${API_BASE}/subnet/${subnetId}`);
      setLoadingProgress(50);
      
      const data = await response.json();
      setLoadingProgress(60);
      
      // Validate data
      if (!data || !data.miners) {
        throw new Error('Invalid data received from server');
      }
      
      console.log(`Received ${data.miners.length} miners`);
      setSubnetData(data);
      setLoadingProgress(70);
      
      // Stage 2: Fetch analysis
      setLoadingStage('Analyzing data...');
      setLoadingMessage('Processing miner data and calculating metrics...');
      
      const analysisResponse = await fetchWithRetry(`${API_BASE}/analyze/${subnetId}`);
      setLoadingProgress(90);
      
      if (analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        setAnalysis(analysisData);
        console.log('Analysis data loaded');
      }
      
      setLoadingStage('Complete!');
      setLoadingProgress(100);
      setLoadingMessage('Data loaded successfully');
      
      // Brief delay to show completion
      await sleep(500);
      
    } catch (err) {
      console.error('Error fetching subnet data:', err);
      setError(err.message);
      setLoadingStage('Error');
      setLoadingMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubnetData();
  }, [subnetId]);

  const handleRefresh = () => {
    fetchSubnetData();
  };

  const exportData = (format) => {
    if (!subnetData) return;
    
    const exportData = {
      subnet: subnetData.subnet,
      miners: subnetData.miners,
      analysis: analysis,
      exportedAt: new Date().toISOString()
    };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subnet_${subnetId}_data.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csvData = subnetData.miners.map(miner => ({
        hotkey: miner.hotkey?.substring(0, 8) + '...' || 'N/A',
        coldkey: miner.coldkey?.substring(0, 8) + '...' || 'N/A',
        ip: miner.axon_info?.ip || 'N/A',
        country: miner.location?.country || 'Unknown',
        city: miner.location?.city || 'Unknown',
        stake: miner.stake || 0,
        trust: miner.trust || 0,
        consensus: miner.consensus || 0
      }));
      
      const csvContent = [
        Object.keys(csvData[0]).join(','),
        ...csvData.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subnet_${subnetId}_miners.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const renderCurrentView = () => {
    if (error) {
      return (
        <div className="error-container">
          <div className="error-card">
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Retry
            </button>
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            subnetData={subnetData}
            analysis={analysis}
            onRefresh={handleRefresh}
            onExport={exportData}
          />
        );
      case 'map':
        return (
          <MapView 
            miners={subnetData?.miners || []}
            analysis={analysis}
          />
        );
      case 'miners':
        return (
          <MinerList 
            miners={subnetData?.miners || []}
            analysis={analysis}
            onExport={exportData}
          />
        );
      default:
        return <Dashboard subnetData={subnetData} analysis={analysis} />;
    }
  };

  return (
    <div className="App">
      {IS_DEMO_MODE && (
        <div className="demo-banner">
          <div className="demo-banner-content">
            <span className="demo-icon">🎮</span>
            <span className="demo-text">
              <strong>Demo Mode:</strong> Using sample data for demonstration. 
              <a href="https://github.com/EZTrades-dev/miner-spy" target="_blank" rel="noopener noreferrer">
                Run locally with your API key
              </a> for real-time analysis.
            </span>
          </div>
        </div>
      )}
      
      <div className="App-content">
        <Sidebar 
          currentView={currentView}
          onViewChange={setCurrentView}
          subnetId={subnetId}
          onSubnetChange={setSubnetId}
          loading={loading}
        />
        <main className="main-content">
          {renderCurrentView()}
        </main>
      </div>
      
      <LoadingDialog
        isVisible={loading}
        progress={loadingProgress}
        stage={loadingStage}
        message={loadingMessage}
        canCancel={false}
      />
    </div>
  );
}

export default App;
