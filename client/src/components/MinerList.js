import React, { useState, useMemo } from 'react';
import './MinerList.css';
import Header from './Header';

const MinerList = ({ miners, analysis, onExport }) => {
  const [sortField, setSortField] = useState('uid');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterCountry, setFilterCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;



  const countries = useMemo(() => {
    if (!miners) return [];
    const unique = [...new Set(miners.map(m => m.location?.country || 'Unknown'))];
    return unique.sort();
  }, [miners]);

  const filteredAndSortedMiners = useMemo(() => {
    if (!miners) return [];

    let filtered = miners.filter(miner => {
      const matchesCountry = !filterCountry || 
        (miner.location?.country || 'Unknown') === filterCountry;
      
      const matchesSearch = !searchTerm || 
        miner.hotkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miner.coldkey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        miner.axon_info?.ip?.includes(searchTerm) ||
        (miner.location?.city || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCountry && matchesSearch;
    });

    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortField) {
        case 'uid':
          aVal = a.uid || 0;
          bVal = b.uid || 0;
          break;
        case 'hotkey':
          aVal = a.hotkey || '';
          bVal = b.hotkey || '';
          break;
        case 'coldkey':
          aVal = a.coldkey || '';
          bVal = b.coldkey || '';
          break;
        case 'ip':
          aVal = a.axon_info?.ip || '';
          bVal = b.axon_info?.ip || '';
          break;
        case 'country':
          aVal = a.location?.country || 'Unknown';
          bVal = b.location?.country || 'Unknown';
          break;
        case 'city':
          aVal = a.location?.city || 'Unknown';
          bVal = b.location?.city || 'Unknown';
          break;
        case 'stake':
          aVal = parseFloat(a.stake) || 0;
          bVal = parseFloat(b.stake) || 0;
          break;
        case 'trust':
          aVal = parseFloat(a.trust) || 0;
          bVal = parseFloat(b.trust) || 0;
          break;
        case 'consensus':
          aVal = parseFloat(a.consensus) || 0;
          bVal = parseFloat(b.consensus) || 0;
          break;
        default:
          aVal = a.uid || 0;
          bVal = b.uid || 0;
      }

      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      } else {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return filtered;
  }, [miners, sortField, sortDirection, filterCountry, searchTerm]);

  const paginatedMiners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedMiners.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedMiners, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedMiners.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getOwnershipInfo = (miner) => {
    if (!analysis) return null;
    
    const minerColdkey = miner.coldkey;
    const owner = analysis.topOwners.find(o => 
      o.coldkey === (minerColdkey?.substring(0, 8) + '...')
    );
    
    if (owner && parseInt(owner.count) > 1) {
      return {
        isMultiOwner: true,
        count: owner.count,
        percentage: owner.percentage
      };
    }
    
    return { isMultiOwner: false };
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (!miners || miners.length === 0) {
    return (
      <div className="miners-placeholder">
        <h2>No Miner Data Available</h2>
        <p>Load subnet data to see miner details</p>
      </div>
    );
  }

  return (
    <div className="miners-list">
      <Header 
        title="Miner Registry"
        subtitle="Complete list of active miners with location and ownership analysis"
      >
        <button className="button" onClick={() => onExport('csv')}>
          📊 Export CSV
        </button>
        <button className="button" onClick={() => onExport('json')}>
          📥 Export JSON
        </button>
      </Header>
      
      <div className="miners-info-note">
        <span className="info-icon">ℹ️</span>
        <span>Neurons without IPs are either validators (who don't need axons) or potentially inactive miners. Miners must publish axon servers to earn emissions.</span>
      </div>

      <div className="miners-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search hotkey, coldkey, IP, or city..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <select
            value={filterCountry}
            onChange={(e) => {
              setFilterCountry(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>
                {country} ({miners.filter(m => (m.location?.country || 'Unknown') === country).length})
              </option>
            ))}
          </select>
        </div>

        <div className="results-info">
          Showing {paginatedMiners.length} of {filteredAndSortedMiners.length} miners
        </div>
      </div>

      <div className="table-container">
        <table className="miners-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('uid')} className="sortable">
                UID {getSortIcon('uid')}
              </th>
              <th onClick={() => handleSort('hotkey')} className="sortable">
                Hotkey {getSortIcon('hotkey')}
              </th>
              <th onClick={() => handleSort('coldkey')} className="sortable">
                Coldkey {getSortIcon('coldkey')}
              </th>
              <th onClick={() => handleSort('ip')} className="sortable">
                IP Address {getSortIcon('ip')}
              </th>
              <th onClick={() => handleSort('country')} className="sortable">
                Location {getSortIcon('country')}
              </th>
              <th onClick={() => handleSort('stake')} className="sortable">
                Stake {getSortIcon('stake')}
              </th>
              <th onClick={() => handleSort('trust')} className="sortable">
                Trust {getSortIcon('trust')}
              </th>
              <th onClick={() => handleSort('consensus')} className="sortable">
                Consensus {getSortIcon('consensus')}
              </th>
              <th>Ownership</th>
            </tr>
          </thead>
          <tbody>
            {paginatedMiners.map((miner) => {
              const ownershipInfo = getOwnershipInfo(miner);
              return (
                <tr key={miner.uid} className="miner-row">
                  <td className="uid-cell">{miner.uid}</td>
                  <td className="key-cell" title={miner.hotkey}>
                    {miner.hotkey?.substring(0, 8)}...
                  </td>
                  <td className="key-cell" title={miner.coldkey}>
                    {miner.coldkey?.substring(0, 8)}...
                  </td>
                  <td className="ip-cell">{miner.axon_info?.ip || 'N/A'}</td>
                  <td className="location-cell">
                    <div className="location-info">
                      <div className="country">
                        {miner.location?.country || 'Unknown'}
                      </div>
                      <div className="city">
                        {miner.location?.city || 'Unknown'}
                      </div>
                      <div className="hosting-type" style={{
                        color: miner.location?.hostingType?.includes('Cloud') || miner.location?.hostingType?.includes('Hosting') 
                          ? 'var(--accent-red)' 
                          : miner.location?.hostingType === 'Residential' 
                            ? 'var(--accent-green)' 
                            : 'var(--accent-yellow)'
                      }}>
                        {miner.location?.hostingType || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="stake-cell">
                    {miner.stake ? parseFloat(miner.stake).toFixed(2) : '0.00'}
                  </td>
                  <td className="trust-cell">
                    {miner.trust ? parseFloat(miner.trust).toFixed(3) : '0.000'}
                  </td>
                  <td className="consensus-cell">
                    {miner.consensus ? parseFloat(miner.consensus).toFixed(3) : '0.000'}
                  </td>
                  <td className="ownership-cell">
                    <div className="ownership-info">
                      {ownershipInfo?.isMultiOwner ? (
                        <div className="ownership-warning">
                          <span className="ownership-badge">
                            {ownershipInfo.count} miners ({ownershipInfo.percentage}%)
                          </span>
                        </div>
                      ) : (
                        <div className="ownership-single">
                          <span className="ownership-badge single">
                            Single
                          </span>
                        </div>
                      )}
                      {miner.validator_permit && (
                        <div className="validator-badge">
                          Validator
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            ← Previous
          </button>
          
          <div className="pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="pagination-pages">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default MinerList;
