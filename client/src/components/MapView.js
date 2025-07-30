import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import Header from './Header';

// Fix default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ miners, analysis }) => {
  const [mapData, setMapData] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    if (!miners || miners.length === 0) return;

    // Process miners data for mapping
    const processedData = miners
      .filter(miner => 
        miner.location && 
        miner.location.lat !== 0 && 
        miner.location.lon !== 0 &&
        miner.location.country !== 'Unknown'
      )
      .map(miner => ({
        id: miner.uid,
        hotkey: miner.hotkey?.substring(0, 8) + '...' || 'N/A',
        coldkey: miner.coldkey?.substring(0, 8) + '...' || 'N/A',
        ip: miner.axon_info?.ip || 'N/A',
        lat: miner.location.lat,
        lon: miner.location.lon,
        country: miner.location.country,
        city: miner.location.city,
        region: miner.location.region,
        isp: miner.location.isp,
        stake: miner.stake || 0,
        trust: miner.trust || 0,
        consensus: miner.consensus || 0
      }));

    // Cluster nearby miners
    const clusters = createClusters(processedData);
    setMapData(clusters);
  }, [miners]);

  const createClusters = (data) => {
    const clusters = [];
    const processed = new Set();
    const CLUSTER_DISTANCE = 0.5; // degrees

    data.forEach((miner, index) => {
      if (processed.has(index)) return;

      const cluster = {
        id: `cluster_${index}`,
        lat: miner.lat,
        lon: miner.lon,
        miners: [miner],
        country: miner.country,
        city: miner.city
      };

      // Find nearby miners
      data.forEach((otherMiner, otherIndex) => {
        if (index === otherIndex || processed.has(otherIndex)) return;

        const distance = Math.sqrt(
          Math.pow(miner.lat - otherMiner.lat, 2) + 
          Math.pow(miner.lon - otherMiner.lon, 2)
        );

        if (distance <= CLUSTER_DISTANCE) {
          cluster.miners.push(otherMiner);
          processed.add(otherIndex);
        }
      });

      processed.add(index);
      clusters.push(cluster);
    });

    return clusters;
  };

  const getClusterColor = (clusterSize) => {
    if (clusterSize === 1) return '#10b981'; // Green for single miners
    if (clusterSize <= 3) return '#f59e0b'; // Yellow for small clusters
    if (clusterSize <= 7) return '#ef4444'; // Red for medium clusters
    return '#dc2626'; // Dark red for large clusters
  };

  const getClusterRadius = (clusterSize) => {
    return Math.min(8 + clusterSize * 2, 25);
  };

  if (!miners || miners.length === 0) {
    return (
      <div className="map-placeholder">
        <h2>No Geographic Data Available</h2>
        <p>Load subnet data to see miner locations</p>
      </div>
    );
  }

  return (
    <div className="map-view">
      <Header 
        title="Global Miner Distribution"
        subtitle="Interactive map showing geographic distribution and clustering of miners"
      >
        <div className="map-stats">
          <div className="stat-item">
            <span className="stat-value">{mapData.length}</span>
            <span className="stat-label">Locations</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {mapData.reduce((sum, cluster) => sum + cluster.miners.length, 0)}
            </span>
            <span className="stat-label">Geolocated Miners</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {new Set(mapData.map(cluster => cluster.country)).size}
            </span>
            <span className="stat-label">Countries</span>
          </div>
        </div>
      </Header>

      <div className="map-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-dot" style={{backgroundColor: '#10b981'}}></div>
            <span>Single Miner</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{backgroundColor: '#f59e0b'}}></div>
            <span>Small Cluster (2-3)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{backgroundColor: '#ef4444'}}></div>
            <span>Medium Cluster (4-7)</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{backgroundColor: '#dc2626'}}></div>
            <span>Large Cluster (8+)</span>
          </div>
        </div>
      </div>

      <div className="map-container">
        <MapContainer
          center={[30, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {mapData.map((cluster) => (
            <CircleMarker
              key={cluster.id}
              center={[cluster.lat, cluster.lon]}
              radius={getClusterRadius(cluster.miners.length)}
              pathOptions={{
                color: getClusterColor(cluster.miners.length),
                fillColor: getClusterColor(cluster.miners.length),
                fillOpacity: 0.7,
                weight: 2
              }}
              eventHandlers={{
                click: () => setSelectedCluster(cluster)
              }}
            >
              <Popup>
                <div className="cluster-popup">
                  <h4>{cluster.city}, {cluster.country}</h4>
                  <p><strong>{cluster.miners.length}</strong> miners at this location</p>
                  
                  <div className="miners-list">
                    {cluster.miners.slice(0, 5).map((miner, index) => (
                      <div key={index} className="miner-item">
                        <div className="miner-info">
                          <strong>Hotkey:</strong> {miner.hotkey}<br/>
                          <strong>IP:</strong> {miner.ip}<br/>
                          <strong>ISP:</strong> {miner.isp}
                        </div>
                      </div>
                    ))}
                    {cluster.miners.length > 5 && (
                      <p className="more-miners">
                        ... and {cluster.miners.length - 5} more miners
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {selectedCluster && (
        <div className="cluster-details">
          <div className="cluster-details-header">
            <h3>{selectedCluster.city}, {selectedCluster.country}</h3>
            <button 
              className="close-button"
              onClick={() => setSelectedCluster(null)}
            >
              ✕
            </button>
          </div>
          
          <div className="cluster-info">
            <p><strong>Total Miners:</strong> {selectedCluster.miners.length}</p>
            <p><strong>Coordinates:</strong> {selectedCluster.lat.toFixed(4)}, {selectedCluster.lon.toFixed(4)}</p>
          </div>

          <div className="miners-table">
            <h4>Miners at this Location</h4>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Hotkey</th>
                    <th>IP Address</th>
                    <th>ISP</th>
                    <th>Stake</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCluster.miners.map((miner, index) => (
                    <tr key={index}>
                      <td>{miner.hotkey}</td>
                      <td>{miner.ip}</td>
                      <td>{miner.isp}</td>
                      <td>{miner.stake}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
