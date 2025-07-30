import React from 'react';
import './Dashboard.css';
import Header from './Header';

const Dashboard = ({ subnetData, analysis, onRefresh, onExport }) => {
  if (!subnetData || !analysis) {
    return (
      <div className="dashboard-placeholder">
        <h2>No Data Available</h2>
        <p>Load subnet data to see analytics</p>
      </div>
    );
  }

  const { subnet, miners } = subnetData;

  const getConcentrationStatus = (level) => {
    switch (level) {
      case 'Highly Decentralized':
        return 'status-decentralized';
      case 'Unconcentrated':
        return 'status-decentralized';
      case 'Moderately Concentrated':
        return 'status-moderate';
      case 'Highly Concentrated':
        return 'status-centralized';
      default:
        return 'status-moderate';
    }
  };

  const topCountries = Object.entries(analysis.geographicDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <Header 
        title={`Subnet ${subnet.netuid} Analytics`}
        subtitle={`${subnet.name || `Subnet ${subnet.netuid}`} - Decentralization Analysis`}
      >
        <button className="button button-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
        <button className="button" onClick={() => onExport('json')}>
          📥 Export JSON
        </button>
        <button className="button" onClick={() => onExport('csv')}>
          📊 Export CSV
        </button>
      </Header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-value" style={{color: 'var(--accent-blue)'}}>
            {analysis.totalMiners}
          </div>
          <div className="kpi-label">Total Miners</div>
          <div className="kpi-change">
            {analysis.totalUniqueIPs} unique IPs
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: 'var(--accent-purple)'}}>
            {analysis.uniqueOwners}
          </div>
          <div className="kpi-label">Unique Owners</div>
          <div className="kpi-change">
            {analysis.totalUniqueASNs} ASNs
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: 'var(--accent-green)'}}>
            {analysis.decentralizationScore}%
          </div>
          <div className="kpi-label">Decentralization Score</div>
          <div className="kpi-change">
            Enhanced analysis
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: analysis.ipClusterCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'}}>
            {analysis.ipClusterCount}
          </div>
          <div className="kpi-label">IP Clusters</div>
          <div className="kpi-change">
            Shared infrastructure
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: analysis.cloudCentralizationRisk > 50 ? 'var(--accent-red)' : analysis.cloudCentralizationRisk > 25 ? 'var(--accent-yellow)' : 'var(--accent-green)'}}>
            {analysis.cloudCentralizationRisk}%
          </div>
          <div className="kpi-label">Cloud Hosting Risk</div>
          <div className="kpi-change">
            Centralization concern
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: 'var(--accent-blue)'}}>
            {analysis.adjustedHHI}
          </div>
          <div className="kpi-label">Adjusted HHI</div>
          <div className="kpi-change">
            Includes IP clustering
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: 'var(--accent-green)'}}>
            {analysis.validatorCount}
          </div>
          <div className="kpi-label">Validators</div>
          <div className="kpi-change">
            Don't need axons
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-value" style={{color: analysis.potentiallyInactiveMiners > 10 ? 'var(--accent-red)' : analysis.potentiallyInactiveMiners > 5 ? 'var(--accent-yellow)' : 'var(--accent-green)'}}>
            {analysis.potentiallyInactiveMiners}
          </div>
          <div className="kpi-label">Potentially Inactive</div>
          <div className="kpi-change">
            Miners without axons
          </div>
        </div>
      </div>

      {/* Concentration Status */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Centralization Status</h3>
        </div>
        <div className="concentration-status">
          <div className={`status-indicator ${getConcentrationStatus(analysis.concentrationLevel)}`}>
            <span className="status-dot"></span>
            {analysis.concentrationLevel}
          </div>
          <p className="concentration-description">
            {analysis.concentrationLevel === 'Highly Decentralized' && 
              "Excellent! This subnet shows strong decentralization with well-distributed mining power."}
            {analysis.concentrationLevel === 'Unconcentrated' && 
              "Good decentralization. Mining power is reasonably distributed across participants."}
            {analysis.concentrationLevel === 'Moderately Concentrated' && 
              "Some concentration detected. A few entities may control significant mining power."}
            {analysis.concentrationLevel === 'Highly Concentrated' && 
              "Warning! High concentration detected. Few entities control most mining power."}
          </p>
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Geographic Distribution</h3>
        </div>
        <div className="country-distribution">
          {topCountries.map(([country, count]) => (
            <div key={country} className="country-item">
              <div className="country-info">
                <span className="country-name">{country}</span>
                <span className="country-count">{count} miners</span>
              </div>
              <div className="country-bar">
                <div 
                  className="country-fill"
                  style={{
                    width: `${(count / analysis.totalMiners) * 100}%`,
                    backgroundColor: 'var(--accent-blue)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IP Clusters Analysis */}
      {analysis.ipClusters && analysis.ipClusters.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚠️ IP Clustering Detection</h3>
          </div>
          <div className="clusters-list">
            {analysis.ipClusters.map((cluster, index) => (
              <div key={cluster.ip} className="cluster-item" title="">
                <div className="cluster-rank">#{index + 1}</div>
                <div className="cluster-details">
                  <div className="cluster-ip">{cluster.ip}</div>
                  <div className="cluster-location">{cluster.location}</div>
                  <div className="cluster-stats">
                    {cluster.count} miners • {cluster.hostingType}
                  </div>
                  <div className="cluster-uids">
                    UIDs: {cluster.uids.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cluster-warning">
            <p>⚠️ Multiple miners sharing the same IP address may indicate centralized control or shared infrastructure behind NAT.</p>
          </div>
        </div>
      )}

      {/* Hosting Distribution */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Hosting Infrastructure Analysis</h3>
        </div>
        <div className="hosting-distribution">
          {analysis.hostingDistribution?.map((hosting, index) => (
            <div key={hosting.type} className="hosting-item">
              <div className="hosting-info">
                <span className="hosting-type">{hosting.type}</span>
                <span className="hosting-count">{hosting.count} miners ({hosting.percentage}%)</span>
              </div>
              <div className="hosting-bar">
                <div 
                  className="hosting-fill"
                  style={{
                    width: `${hosting.percentage}%`,
                    backgroundColor: hosting.type.includes('Cloud') || hosting.type.includes('Hosting') 
                      ? 'var(--accent-red)' 
                      : hosting.type === 'Residential' 
                        ? 'var(--accent-green)' 
                        : 'var(--accent-yellow)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ASN Concentration */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top ASNs (Network Providers)</h3>
        </div>
        <div className="asn-list">
          {analysis.asnConcentration?.slice(0, 10).map((asn, index) => (
            <div key={asn.asn} className="asn-item">
              <div className="asn-rank">#{index + 1}</div>
              <div className="asn-details">
                <div className="asn-id">AS{asn.asn}</div>
                <div className="asn-name">{asn.asname}</div>
                <div className="asn-stats">
                  {asn.count} miners ({asn.percentage}%) • {asn.hostingType}
                </div>
              </div>
              <div className="asn-bar">
                <div 
                  className="asn-fill"
                  style={{
                    width: `${asn.percentage}%`,
                    backgroundColor: asn.hostingType.includes('Cloud') || asn.hostingType.includes('Hosting')
                      ? 'var(--accent-red)' 
                      : asn.hostingType === 'Residential' 
                        ? 'var(--accent-green)' 
                        : 'var(--accent-yellow)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Owners */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Top Owners by Miner Count</h3>
        </div>
        <div className="owners-list">
          {analysis.topOwners.slice(0, 10).map((owner, index) => (
            <div key={owner.coldkey} className="owner-item">
              <div className="owner-rank">#{index + 1}</div>
              <div className="owner-details">
                <div className="owner-id">{owner.coldkey}</div>
                <div className="owner-stats">
                  {owner.count} miners ({owner.percentage}%)
                </div>
              </div>
              <div className="owner-bar">
                <div 
                  className="owner-fill"
                  style={{
                    width: `${owner.percentage}%`,
                    backgroundColor: index === 0 ? 'var(--accent-red)' : 
                                   index < 3 ? 'var(--accent-yellow)' : 'var(--accent-green)'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bittensor Network Architecture */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Bittensor Network Architecture Analysis</h3>
        </div>
        <div className="axon-explanation">
          <div className="axon-stats">
            <div className="axon-stat">
              <span className="axon-number">{analysis.minersWithIPs}</span>
              <span className="axon-label">Active Miners (with Axons)</span>
            </div>
            <div className="axon-stat">
              <span className="axon-number">{analysis.validatorCount}</span>
              <span className="axon-label">Validators (Axon Optional)</span>
            </div>
            <div className="axon-stat">
              <span className="axon-number">{analysis.potentiallyInactiveMiners}</span>
              <span className="axon-label">Potentially Inactive Miners</span>
            </div>
            <div className="axon-stat">
              <span className="axon-number">{analysis.validatorsWithoutAxons}</span>
              <span className="axon-label">Validators without Axons</span>
            </div>
          </div>
          <div className="axon-info">
            <p><strong>Understanding Bittensor Network Roles:</strong></p>
            <ul>
              <li><strong>Miners (Axon Required):</strong> Must deploy and publish axon servers with IP addresses to receive queries from validators and earn emissions. Without a serving axon, miners cannot be scored or earn rewards.</li>
              <li><strong>Validators (Dendrites Only):</strong> Primarily use dendrites to query miners' axons and set weights on-chain. Validators don't need to publish axons to perform validation duties.</li>
              <li><strong>Inactive/Misconfigured Miners:</strong> Neurons without validator permits and no axon IPs may be inactive, misconfigured, or recently deregistered due to low performance.</li>
              <li><strong>Dual-Role Neurons:</strong> Some validators may optionally deploy axons for network communication or if serving dual roles.</li>
            </ul>
            <p><em>This analysis distinguishes between expected behavior (validators without axons) and potential issues (miners without axons).</em></p>
          </div>
        </div>
      </div>

      {/* Metrics Explanation */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Understanding the Metrics</h3>
        </div>
        <div className="metrics-explanation">
          <div className="metric-item">
            <h4>Enhanced HHI Analysis</h4>
            <p>Our adjusted Herfindahl-Hirschman Index includes IP clustering penalties. Values below 1000 indicate good decentralization, above 2500 suggest high concentration.</p>
          </div>
          <div className="metric-item">
            <h4>IP Clustering Detection</h4>
            <p>Identifies miners sharing the same IP address, which may indicate centralized control or shared infrastructure behind NAT gateways.</p>
          </div>
          <div className="metric-item">
            <h4>Hosting Infrastructure Analysis</h4>
            <p>Classifies miners by hosting type (Cloud, VPS, Residential) to assess centralization risks from cloud provider dependencies.</p>
          </div>
          <div className="metric-item">
            <h4>ASN Concentration</h4>
            <p>Analyzes network provider distribution to detect if miners are concentrated within specific data centers or ISPs.</p>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="last-updated">
        <small>
          Last updated: {new Date(analysis.lastAnalyzed).toLocaleString()}
        </small>
      </div>
    </div>
  );
};

export default Dashboard;
