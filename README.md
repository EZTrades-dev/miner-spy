# 🔍 Miner Spy - Bittensor Network Analysis Tool

<div align="center">
  <img src="ez_trades.png" alt="Miner Spy Logo" width="120" height="120">
  
  **Comprehensive decentralization analysis and geographic visualization for Bittensor subnets**
  
  [![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
  [![Express](https://img.shields.io/badge/Express-4.18-yellow.svg)](https://expressjs.com/)
  [![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
  
  **[🚀 Live Demo](https://eztrades-dev.github.io/miner-spy/)** | **[📖 Documentation](#-getting-started)** | **[🐛 Issues](https://github.com/EZTrades-dev/miner-spy/issues)**
</div>

## 📖 What is Miner Spy?

**Miner Spy** is a powerful web application that analyzes and visualizes the decentralization of Bittensor network subnets. It helps researchers, validators, and community members understand network health by examining:

- **Geographic Distribution** - Where are miners located globally?
- **Ownership Concentration** - Are miners controlled by few entities?
- **Infrastructure Analysis** - Cloud hosting vs residential distribution
- **Network Security** - Potential centralization risks and vulnerabilities

### 🎯 Why Use Miner Spy?

Bittensor's security and fairness depend on decentralization. Miner Spy helps you:

✅ **Assess Network Health** - Identify concentration risks before they become problems  
✅ **Make Informed Decisions** - Choose subnets based on decentralization metrics  
✅ **Research & Analysis** - Export data for academic or investment research  
✅ **Monitor Changes** - Track how subnet decentralization evolves over time  

## 🚀 Quick Start (5 Minutes)

### 1. **Get a TaoStats API Key** (Free)
1. Visit [TaoStats.io API Documentation](https://taostats.io/api-docs)
2. Create a free account
3. Generate an API key
4. Copy the key for step 3 below

### 2. **Clone & Install**
```bash
# Clone the repository
git clone https://github.com/EZTrades-dev/miner-spy.git
cd miner-spy

# Install dependencies for both frontend and backend
npm install
cd client && npm install && cd ..
```

### 3. **Configure API Key**
```bash
# Copy environment template
cp .env.example .env

# Edit .env file and replace with your API key
# TAOSTATS_API_KEY=your_taostats_api_key_here
```

### 4. **Start the Application**
```bash
# Start both frontend and backend
npm run dev
```

### 5. **Open & Analyze**
- Open http://localhost:3000 in your browser
- Select a subnet (1-128) in the sidebar
- Explore Dashboard, World Map, and Miner List views!

## 🎮 Try the Live Demo

**[View Live Demo →](https://eztrades-dev.github.io/miner-spy/)**

*Note: The demo uses sample data. For real-time analysis, run locally with your API key.*

## 🎨 Features Overview

### 📊 **Analytics Dashboard**
- **Herfindahl-Hirschman Index (HHI)** - Industry-standard concentration measurement
- **Real-time KPIs** - Total miners, unique IPs, geographic spread
- **Risk Assessment** - Automated concentration level classification
- **Top Rankings** - Countries, providers, and ownership analysis

### 🌍 **Interactive World Map**
- **Global Visualization** - See exactly where every miner is located
- **Cluster Detection** - Identify geographic concentration hotspots
- **Color-coded Markers** - Instant visual assessment of distribution
- **Detailed Popups** - Click any location for miner details

### ⛏️ **Comprehensive Miner Registry**
- **Full Database** - Every miner with complete details
- **Advanced Filtering** - Search by location, IP, keys, or hosting type
- **Sortable Columns** - Organize by stake, trust, consensus, location
- **Export Options** - Download CSV or JSON for further analysis
- **Ownership Detection** - Automatically identifies multi-miner operations

### 🔄 **Smart Data Handling**
- **Rate Limit Protection** - Automatic retry with visual progress
- **Real-time Updates** - Always shows current subnet state
- **Data Validation** - Ensures accuracy and handles edge cases
- **Caching Layer** - Efficient data retrieval and performance

## 📈 Understanding the Analysis

### Concentration Levels
- **🟢 Highly Decentralized** (HHI < 1,500): Excellent distribution
- **🟡 Unconcentrated** (HHI 1,500-2,500): Good decentralization  
- **🟠 Moderately Concentrated** (HHI 2,500-5,000): Some risks
- **🔴 Highly Concentrated** (HHI > 5,000): Significant centralization

### Geographic Analysis
- **Country Distribution** - Percentage breakdown by nation
- **City Clustering** - Identification of geographic hotspots
- **Continental Spread** - Global distribution assessment

### Infrastructure Classification
- **🏠 Residential** - Home internet connections (preferred)
- **☁️ Cloud/Hosting** - AWS, Google Cloud, etc. (centralization risk)
- **🏢 Data Center** - Professional hosting facilities

### Ownership Patterns
- **Single Operations** - One coldkey, one miner (ideal)
- **Multi-Miner Operations** - One coldkey, multiple miners (risk)
- **Validator Detection** - Nodes with validator permits

## 🛠️ Development Setup

### Prerequisites
- **Node.js 18+** and npm
- **Git** for version control
- **TaoStats API Key** (free from taostats.io)

### Environment Configuration

Create `.env` file with:
```bash
# Required
TAOSTATS_API_KEY=your_actual_api_key_here

# Optional (defaults shown)
PORT=3001
REACT_APP_API_URL=http://localhost:3001/api
```

### Available Scripts

```bash
# Development
npm run dev          # Start both frontend and backend
npm run server       # Start backend only
npm run client       # Start frontend only

# Production
npm run build        # Build frontend for production
npm start           # Start production server

# Maintenance
npm run clean       # Clean build artifacts
npm test           # Run test suite
```

### Project Structure
```
miner-spy/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── styles/       # CSS and styling
│   │   └── ...
│   └── public/          # Static assets
├── server/          # Node.js backend
│   ├── index.js        # Main server file
│   └── routes/         # API endpoints
├── .github/         # GitHub Actions workflows
└── docs/           # Documentation
```

## 🔧 API Integration

### TaoStats.io Integration
```javascript
// Example API call structure
const response = await fetch('/api/subnet/8');
const data = await response.json();

// Returns:
{
  subnet: { netuid: 8, name: "Subnet 8" },
  miners: [...],  // Complete miner data
  analysis: {...} // Calculated metrics
}
```

### Custom Analysis Engine
The application includes a sophisticated analysis engine that:
- Calculates HHI from miner distribution
- Performs IP geolocation and clustering
- Classifies hosting infrastructure types
- Detects ownership patterns and validator behavior

## 🚀 Deployment Options

### GitHub Pages (Demo)
The repository includes GitHub Actions for automatic deployment to GitHub Pages for demo purposes.

### Local Production
```bash
# Build and start production server
npm run build
npm start
```

### Docker (Coming Soon)
```bash
docker build -t miner-spy .
docker run -p 3000:3000 -e TAOSTATS_API_KEY=your_key miner-spy
```

## 🔒 Security & Privacy

- **API Key Protection** - Never commit keys to version control
- **Rate Limiting** - Respects API provider limits
- **Data Privacy** - No user data stored or transmitted
- **Open Source** - Full transparency of analysis methods

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and add tests
4. **Commit**: `git commit -m 'Add amazing feature'`
5. **Push**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and patterns
- Add tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting

### Feature Ideas
- [ ] Historical trend analysis
- [ ] Subnet comparison tools
- [ ] Advanced alerting system
- [ ] Mobile app version
- [ ] Additional data sources

## 📚 Documentation

- **[API Reference](TAOSTATS_API.md)** - TaoStats integration details
- **[Contributing Guide](CONTRIBUTING.md)** - Development guidelines
- **[Changelog](CHANGELOG.md)** - Version history and updates

## 🐛 Troubleshooting

### Common Issues

**❌ "Error fetching subnet data"**
- Verify your API key is correct in `.env`
- Check if TaoStats.io is accessible
- Ensure you have an active internet connection

**❌ "API rate limit exceeded"**
- Wait a few minutes for rate limits to reset
- The app will automatically retry with visual progress

**❌ "Port 3000/3001 already in use"**
```bash
# Kill existing processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
```

**❌ "No data displayed"**
- Select a valid subnet ID (1-32)
- Wait for data loading to complete
- Check browser console for errors

### Getting Help
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/EZTrades-dev/miner-spy/issues)
- 💬 **Questions**: [GitHub Discussions](https://github.com/EZTrades-dev/miner-spy/discussions)
- 📧 **Direct Contact**: Create an issue for fastest response

## 🙏 Acknowledgments

- **TaoStats.io** - Comprehensive Bittensor network data
- **Bittensor Community** - Building the future of decentralized AI
- **Open Source Contributors** - Making this project possible

## 🐦 Follow the Creator

**Follow [@E_Z_Trades](https://x.com/E_Z_Trades) on X for:**
- 🚀 New tool releases and updates
- 📊 Bittensor network analysis insights  
- 🔍 Deep dives into subnet metrics
- 💡 Tips for using decentralization tools

Stay connected for the latest developments in Bittensor analysis!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ for the Bittensor community</strong>
  
  **[🚀 Try Live Demo](https://eztrades-dev.github.io/miner-spy/)** • **[⭐ Star on GitHub](https://github.com/EZTrades-dev/miner-spy)** • **[🐛 Report Issues](https://github.com/EZTrades-dev/miner-spy/issues)**
</div>
