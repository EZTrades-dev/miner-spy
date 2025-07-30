const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cache with 5 minute TTL
const cache = new NodeCache({ stdTTL: 300 });

app.use(cors());
app.use(express.json());

// API Configuration
const TAOSTATS_BASE_URL = 'https://api.taostats.io/api';
const API_KEY = process.env.TAOSTATS_API_KEY;
const SUBNET_ID = process.env.SUBNET_ID || 8;

// Rate limiting helper
let lastApiCall = 0;
const MIN_INTERVAL = 12000; // 12 seconds between calls (5 per minute)

const rateLimitedRequest = async (url, headers) => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_INTERVAL) {
    const waitTime = MIN_INTERVAL - timeSinceLastCall;
    console.log(`Rate limiting: waiting ${waitTime}ms before API call`);
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastApiCall = Date.now();
  return axios.get(url, { headers });
};

// Enhanced geolocation service with ISP and ASN analysis
const getLocationFromIP = async (ip) => {
  try {
    // Use ip-api.com with enhanced fields for centralization analysis
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting`, {
      timeout: 5000
    });
    
    if (response.data.status === 'success') {
      const data = response.data;
      
      // Classify hosting type based on ISP and AS information
      const hostingType = classifyHostingType(data.isp, data.org, data.as, data.hosting);
      
      return {
        country: data.country,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        region: data.regionName,
        isp: data.isp,
        organization: data.org,
        asn: data.as,
        asname: data.asname,
        hostingType: hostingType,
        isProxy: data.proxy || false,
        isMobile: data.mobile || false,
        isHosting: data.hosting || false,
        timezone: data.timezone
      };
    }
  } catch (error) {
    console.error(`Geolocation failed for IP ${ip}:`, error.message);
  }
  
  return {
    country: 'Unknown',
    city: 'Unknown',
    lat: 0,
    lon: 0,
    region: 'Unknown',
    isp: 'Unknown',
    organization: 'Unknown',
    asn: 'Unknown',
    asname: 'Unknown',
    hostingType: 'Unknown',
    isProxy: false,
    isMobile: false,
    isHosting: false,
    timezone: 'Unknown'
  };
};

// Classify hosting type for centralization analysis
function classifyHostingType(isp, org, asn, isHosting) {
  const lowerISP = (isp || '').toLowerCase();
  const lowerOrg = (org || '').toLowerCase();
  const lowerASN = (asn || '').toLowerCase();
  
  // Cloud providers (major centralization risk)
  const cloudProviders = [
    'amazon', 'aws', 'microsoft', 'azure', 'google', 'gcp', 'digitalocean',
    'vultr', 'linode', 'ovh', 'hetzner', 'cloudflare', 'oracle'
  ];
  
  // VPS/Hosting providers (moderate centralization risk)
  const vpsProviders = [
    'contabo', 'hostinger', 'godaddy', 'namecheap', 'dreamhost', 'bluehost'
  ];
  
  // Residential ISPs (good for decentralization)
  const residentialISPs = [
    'comcast', 'verizon', 'att', 'charter', 'cox', 'spectrum', 'frontier',
    'centurylink', 'telus', 'rogers', 'bell', 'shaw', 'bt', 'sky', 'vodafone'
  ];
  
  if (isHosting) return 'Hosting/Cloud';
  
  for (const provider of cloudProviders) {
    if (lowerISP.includes(provider) || lowerOrg.includes(provider) || lowerASN.includes(provider)) {
      return 'Cloud Provider';
    }
  }
  
  for (const provider of vpsProviders) {
    if (lowerISP.includes(provider) || lowerOrg.includes(provider)) {
      return 'VPS/Hosting';
    }
  }
  
  for (const provider of residentialISPs) {
    if (lowerISP.includes(provider) || lowerOrg.includes(provider)) {
      return 'Residential';
    }
  }
  
  // Default classification based on common patterns
  if (lowerISP.includes('datacenter') || lowerISP.includes('server') || lowerISP.includes('hosting')) {
    return 'Hosting/Datacenter';
  }
  
  if (lowerISP.includes('cable') || lowerISP.includes('fiber') || lowerISP.includes('broadband')) {
    return 'Residential';
  }
  
  return 'Unknown';
}

// Get subnet data
app.get('/api/subnet/:subnetId', async (req, res) => {
  const subnetId = req.params.subnetId || SUBNET_ID;
  const cacheKey = `subnet_${subnetId}`;
  
  try {
    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached subnet data');
      return res.json(cachedData);
    }

    console.log(`Fetching subnet ${subnetId} data from API...`);
    
    const headers = {
      'Authorization': API_KEY,
      'Accept': 'application/json'
    };

    // Fetch subnet info
    const subnetResponse = await rateLimitedRequest(
      `${TAOSTATS_BASE_URL}/subnet/latest/v1?netuid=${subnetId}`,
      headers
    );

    // Fetch miners (metagraph data)
    const minersResponse = await rateLimitedRequest(
      `${TAOSTATS_BASE_URL}/metagraph/latest/v1?netuid=${subnetId}&limit=500`,
      headers
    );

    // Extract data from API response structure
    const subnetData = subnetResponse.data.data?.[0] || {};
    const miners = minersResponse.data.data || [];

    console.log(`Found ${miners.length} miners for subnet ${subnetId}`);

    // Process miner data with geolocation
    const processedMiners = [];
    console.log(`Processing ${miners.length} miners with geolocation...`);
    for (const miner of miners) { // Process all miners
      // Extract IP from axon object
      const axonIp = miner.axon?.ip;
      
      if (axonIp && axonIp !== '0.0.0.0' && axonIp !== '127.0.0.1') {
        const location = await getLocationFromIP(axonIp);
        processedMiners.push({
          uid: miner.uid,
          hotkey: miner.hotkey?.ss58,
          coldkey: miner.coldkey?.ss58,
          stake: miner.stake,
          trust: miner.trust,
          consensus: miner.consensus,
          incentive: miner.incentive,
          dividends: miner.dividends,
          emission: miner.emission,
          active: miner.active,
          validator_permit: miner.validator_permit,
          daily_reward: miner.daily_reward,
          axon_info: {
            ip: axonIp,
            port: miner.axon?.port,
            protocol: miner.axon?.protocol
          },
          location
        });
        
        // Small delay to avoid overwhelming ip-api (reduced for better performance)
        if (processedMiners.length % 20 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Batch delay every 20 requests
          console.log(`Processed ${processedMiners.length} miners with geolocation...`);
        }
      } else {
        processedMiners.push({
          uid: miner.uid,
          hotkey: miner.hotkey?.ss58,
          coldkey: miner.coldkey?.ss58,
          stake: miner.stake,
          trust: miner.trust,
          consensus: miner.consensus,
          incentive: miner.incentive,
          dividends: miner.dividends,
          emission: miner.emission,
          active: miner.active,
          validator_permit: miner.validator_permit,
          daily_reward: miner.daily_reward,
          axon_info: {
            ip: 'N/A',
            port: null,
            protocol: null
          },
          location: {
            country: 'Unknown',
            city: 'Unknown',
            lat: 0,
            lon: 0,
            region: 'Unknown',
            isp: 'Unknown'
          }
        });
      }
    }

    const result = {
      subnet: {
        netuid: subnetData.netuid || subnetId,
        name: `Subnet ${subnetData.netuid || subnetId}`,
        owner: subnetData.owner?.ss58,
        max_neurons: subnetData.max_neurons,
        active_keys: subnetData.active_keys,
        validators: subnetData.validators,
        active_validators: subnetData.active_validators,
        active_miners: subnetData.active_miners,
        tempo: subnetData.tempo,
        difficulty: subnetData.difficulty,
        emission: subnetData.emission,
        registration_cost: subnetData.neuron_registration_cost
      },
      miners: processedMiners,
      lastUpdated: new Date().toISOString()
    };

    // Cache the result
    cache.set(cacheKey, result);
    console.log(`Cached subnet ${subnetId} data with ${processedMiners.length} miners`);

    res.json(result);
  } catch (error) {
    console.error('Error fetching subnet data:', error.message);
    console.error('Error details:', error.response?.data || 'No additional details');
    res.status(500).json({ 
      error: 'Failed to fetch subnet data', 
      details: error.message 
    });
  }
});

// Analyze centralization
app.get('/api/analyze/:subnetId', async (req, res) => {
  const subnetId = req.params.subnetId || SUBNET_ID;
  const cacheKey = `analysis_${subnetId}`;
  
  try {
    // Check cache first
    const cachedAnalysis = cache.get(cacheKey);
    if (cachedAnalysis) {
      return res.json(cachedAnalysis);
    }

    // Get subnet data
    const subnetDataKey = `subnet_${subnetId}`;
    let subnetData = cache.get(subnetDataKey);
    
    if (!subnetData) {
      return res.status(400).json({ 
        error: 'Subnet data not found. Fetch subnet data first.' 
      });
    }

    const { subnet, miners } = subnetData;
    
    // Calculate centralization metrics
    const analysis = calculateCentralization(subnet, miners);
    
    // Cache analysis
    cache.set(cacheKey, analysis);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing centralization:', error.message);
    res.status(500).json({ 
      error: 'Failed to analyze centralization', 
      details: error.message 
    });
  }
});

// Enhanced centralization calculation with IP clustering and hosting analysis
function calculateCentralization(subnet, miners) {
  const totalMiners = miners.length;
  
  // Count miners by coldkey
  const coldkeyGroups = {};
  miners.forEach(miner => {
    const coldkey = miner.coldkey || 'unknown';
    if (!coldkeyGroups[coldkey]) {
      coldkeyGroups[coldkey] = [];
    }
    coldkeyGroups[coldkey].push(miner);
  });

  // IP clustering analysis - detect shared infrastructure
  const ipGroups = {};
  const asnGroups = {};
  const hostingTypes = {};
  
  miners.forEach(miner => {
    const ip = miner.axon_info?.ip;
    const asn = miner.location?.asn;
    const hostingType = miner.location?.hostingType || 'Unknown';
    
    // Group by IP (same IP = likely same operator/NAT)
    if (ip && ip !== 'N/A') {
      if (!ipGroups[ip]) ipGroups[ip] = [];
      ipGroups[ip].push(miner);
    }
    
    // Group by ASN (same provider/datacenter)
    if (asn && asn !== 'Unknown') {
      if (!asnGroups[asn]) asnGroups[asn] = [];
      asnGroups[asn].push(miner);
    }
    
    // Count hosting types
    hostingTypes[hostingType] = (hostingTypes[hostingType] || 0) + 1;
  });

  // Detect suspicious IP clustering (multiple miners same IP)
  const ipClusters = Object.entries(ipGroups)
    .filter(([ip, miners]) => miners.length > 1)
    .map(([ip, miners]) => ({
      ip,
      count: miners.length,
      uids: miners.map(m => m.uid),
      location: miners[0].location?.city + ', ' + miners[0].location?.country,
      hostingType: miners[0].location?.hostingType
    }))
    .sort((a, b) => b.count - a.count);

  // ASN concentration analysis
  const asnConcentration = Object.entries(asnGroups)
    .map(([asn, miners]) => ({
      asn: asn.split(' ')[0], // Just the number
      asname: miners[0].location?.asname || 'Unknown',
      count: miners.length,
      percentage: ((miners.length / totalMiners) * 100).toFixed(2),
      hostingType: miners[0].location?.hostingType
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate enhanced HHI including IP clustering penalty
  const baseHHI = Object.values(coldkeyGroups).reduce((sum, group) => {
    const share = (group.length / totalMiners) * 100;
    return sum + (share * share);
  }, 0);

  // IP clustering penalty (adds to centralization concern)
  const ipClusterPenalty = ipClusters.reduce((penalty, cluster) => {
    const clusterShare = (cluster.count / totalMiners) * 100;
    return penalty + (clusterShare * clusterShare * 0.5); // 50% weight for IP clustering
  }, 0);

  const adjustedHHI = baseHHI + ipClusterPenalty;

  // Determine concentration level with enhanced criteria
  let concentrationLevel = 'Highly Decentralized';
  if (adjustedHHI > 2500 || ipClusters.length > 5) {
    concentrationLevel = 'Highly Concentrated';
  } else if (adjustedHHI > 1500 || ipClusters.length > 2) {
    concentrationLevel = 'Moderately Concentrated';
  } else if (adjustedHHI > 1000 || ipClusters.length > 0) {
    concentrationLevel = 'Unconcentrated';
  }

  // Calculate hosting distribution percentages
  const hostingDistribution = Object.entries(hostingTypes).map(([type, count]) => ({
    type,
    count,
    percentage: ((count / totalMiners) * 100).toFixed(1)
  })).sort((a, b) => b.count - a.count);

  // Calculate cloud centralization risk
  const cloudMiners = hostingTypes['Cloud Provider'] || 0;
  const hostingMiners = (hostingTypes['Hosting/Cloud'] || 0) + (hostingTypes['VPS/Hosting'] || 0);
  const cloudCentralizationRisk = ((cloudMiners + hostingMiners) / totalMiners) * 100;

  // Geographic distribution
  const countries = {};
  miners.forEach(miner => {
    const country = miner.location?.country || 'Unknown';
    countries[country] = (countries[country] || 0) + 1;
  });

  // Top owners analysis
  const topOwners = Object.entries(coldkeyGroups)
    .map(([coldkey, group]) => ({
      coldkey: coldkey.substring(0, 8) + '...',
      count: group.length,
      percentage: ((group.length / totalMiners) * 100).toFixed(2)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Enhanced decentralization score considering multiple factors
  const baseScore = Math.max(0, 100 - (baseHHI / 100));
  const ipClusterPenalty_score = Math.min(20, ipClusters.length * 5); // Up to 20 point penalty
  const cloudPenalty = Math.min(30, cloudCentralizationRisk * 0.5); // Up to 30 point penalty
  const enhancedDecentralizationScore = Math.max(0, baseScore - ipClusterPenalty_score - cloudPenalty);

  // Calculate axon statistics based on Bittensor architecture
  const minersWithIPs = miners.filter(m => m.axon_info?.ip && m.axon_info.ip !== 'N/A').length;
  const minersWithoutIPs = totalMiners - minersWithIPs;
  
  // Distinguish between validators and potentially inactive miners
  // Validators typically have validator_permit = true and don't need axons
  // Miners without axons but no validator permit may be inactive/misconfigured
  const validatorsWithoutAxons = miners.filter(m => 
    (!m.axon_info?.ip || m.axon_info.ip === 'N/A') && m.validator_permit
  ).length;
  
  const nonValidatorsWithoutAxons = miners.filter(m => 
    (!m.axon_info?.ip || m.axon_info.ip === 'N/A') && !m.validator_permit
  ).length;
  
  const minerAxonCoverage = minersWithIPs / totalMiners * 100;
  const validatorCount = miners.filter(m => m.validator_permit).length;
  const potentiallyInactiveMiners = nonValidatorsWithoutAxons;

  return {
    totalMiners,
    uniqueOwners: Object.keys(coldkeyGroups).length,
    hhi: Math.round(baseHHI),
    adjustedHHI: Math.round(adjustedHHI),
    concentrationLevel,
    topOwners,
    geographicDistribution: countries,
    decentralizationScore: Math.round(enhancedDecentralizationScore * 100) / 100,
    // Enhanced analysis
    ipClusters,
    ipClusterCount: ipClusters.length,
    asnConcentration,
    hostingDistribution,
    cloudCentralizationRisk: Math.round(cloudCentralizationRisk * 100) / 100,
    totalUniqueIPs: Object.keys(ipGroups).length,
    totalUniqueASNs: Object.keys(asnGroups).length,
    // Enhanced axon statistics
    minersWithIPs,
    minersWithoutIPs,
    validatorCount,
    validatorsWithoutAxons,
    potentiallyInactiveMiners,
    minerAxonCoverage: Math.round(minerAxonCoverage * 100) / 100,
    // Legacy compatibility
    axonCoverage: Math.round(minerAxonCoverage * 100) / 100,
    lastAnalyzed: new Date().toISOString()
  };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    config: {
      api_base: TAOSTATS_BASE_URL,
      default_subnet: SUBNET_ID,
      api_key_configured: !!API_KEY
    },
    cache: {
      keys: cache.keys().length,
      stats: cache.getStats()
    }
  });
});

// Test API connectivity 
app.get('/api/test-connection', async (req, res) => {
  try {
    const headers = {
      'Authorization': API_KEY,
      'Accept': 'application/json'
    };
    
    const response = await rateLimitedRequest(
      `${TAOSTATS_BASE_URL}/subnet/latest/v1?netuid=${SUBNET_ID}&limit=1`,
      headers
    );
    
    res.json({
      status: 'success',
      message: 'API connection successful',
      subnet_found: !!response.data.data?.[0],
      api_response_structure: {
        has_pagination: !!response.data.pagination,
        has_data: !!response.data.data,
        data_count: response.data.data?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'API connection failed',
      error: error.message,
      api_response: error.response?.data || null
    });
  }
});

// Clear cache endpoint
app.post('/api/cache/clear', (req, res) => {
  cache.flushAll();
  res.json({ message: 'Cache cleared successfully' });
});

app.listen(PORT, () => {
  console.log(`Miner Spy backend running on port ${PORT}`);
  console.log(`Subnet ID: ${SUBNET_ID}`);
  console.log(`Cache TTL: ${cache.options.stdTTL} seconds`);
});
