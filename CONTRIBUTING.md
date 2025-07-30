# Contributing to Miner Spy

Thank you for considering contributing to Miner Spy! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### Prerequisites
- Node.js 18+ and npm
- Git
- TaoStats API key (for testing with real data)
- Basic knowledge of React and Node.js

### Setup Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/miner-spy.git
   cd miner-spy
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your TaoStats API key to .env
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Reporting Bugs
1. Check existing [issues](https://github.com/EZTrades-dev/miner-spy/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, Node version)

### Suggesting Features
1. Check [discussions](https://github.com/EZTrades-dev/miner-spy/discussions) for existing ideas
2. Create a new discussion or issue with:
   - Clear use case description
   - Expected behavior
   - Why this would benefit users
   - Implementation ideas (optional)

### Contributing Code

#### 1. Choose an Issue
- Look for issues labeled `good first issue` for beginners
- Comment on the issue to let others know you're working on it
- Ask questions if anything is unclear

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

#### 3. Make Your Changes
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure all existing tests pass

#### 4. Test Your Changes
```bash
# Run frontend tests
cd client && npm test

# Test the full application
npm run dev
# Test with multiple subnets and scenarios
```

#### 5. Commit and Push
```bash
git add .
git commit -m "feat: add new subnet comparison feature"
git push origin feature/your-feature-name
```

#### 6. Create Pull Request
- Use the PR template (if available)
- Link related issues with "Fixes #123"
- Provide clear description of changes
- Include screenshots for UI changes

## 📋 Development Guidelines

### Code Style
- **JavaScript**: Use ES6+ features, async/await over promises
- **React**: Functional components with hooks, no class components
- **CSS**: Use CSS variables for theming, mobile-first approach
- **Naming**: Descriptive names, camelCase for JS, kebab-case for CSS

### File Structure
```
client/src/
├── components/       # Reusable UI components
│   ├── Header.js
│   ├── Header.css
│   └── ...
├── pages/           # Page-level components (if added)
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
└── styles/          # Global styles

server/
├── index.js         # Main server file
├── routes/          # API route handlers
├── utils/           # Server utilities
└── middleware/      # Express middleware
```

### Component Guidelines
```jsx
// Good component structure
import React, { useState, useEffect } from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2, onAction }) => {
  const [localState, setLocalState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, [prop1]);
  
  const handleAction = () => {
    // Event handling
    onAction?.(data);
  };
  
  return (
    <div className="component-name">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

### API Guidelines
- Use RESTful endpoints
- Include proper error handling
- Add request validation
- Document new endpoints
- Follow existing patterns

### Testing Guidelines
- Write tests for new components
- Test edge cases and error scenarios
- Include integration tests for new features
- Maintain test coverage above 80%

## 🎨 Design Guidelines

### UI/UX Principles
- **Dark Theme**: Maintain consistency with existing dark theme
- **Accessibility**: Ensure WCAG 2.1 AA compliance
- **Responsiveness**: Mobile-first, test on multiple screen sizes
- **Performance**: Optimize for fast loading and smooth interactions

### Color Palette
```css
/* Primary Colors */
--accent-purple: #8b5cf6
--accent-blue: #3b82f6
--accent-green: #10b981
--accent-yellow: #f59e0b
--accent-red: #ef4444

/* Background Colors */
--bg-primary: #111827
--bg-secondary: #1f2937
--bg-tertiary: #374151

/* Text Colors */
--text-primary: #f9fafb
--text-secondary: #d1d5db
--text-muted: #9ca3af
```

## 🔧 Technical Specifications

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dependencies
- **Frontend**: React 18, Leaflet for maps
- **Backend**: Node.js 18+, Express
- **Build**: Create React App, standard Node.js

### Performance Requirements
- First Contentful Paint < 2s
- Largest Contentful Paint < 4s
- Cumulative Layout Shift < 0.1
- Time to Interactive < 5s

## 📚 Resources

### Learning Resources
- [React Documentation](https://reactjs.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [TaoStats API](https://taostats.io/api-docs)

### Development Tools
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools)
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [Postman](https://www.postman.com/) for API testing

## 🎯 Feature Roadmap

### High Priority
- [ ] Historical trend analysis
- [ ] Subnet comparison tools
- [ ] Advanced filtering options
- [ ] Export improvements

### Medium Priority
- [ ] Mobile app version
- [ ] Additional data sources
- [ ] Real-time notifications
- [ ] Advanced visualizations

### Low Priority
- [ ] Plugin system
- [ ] Custom dashboards
- [ ] API for third-party tools
- [ ] Internationalization

## 📝 Commit Message Format

Use conventional commits for better changelog generation:

```
feat: add new subnet comparison feature
fix: resolve map rendering issue on mobile
docs: update API documentation
style: improve button hover animations
refactor: optimize data processing pipeline
test: add unit tests for Dashboard component
chore: update dependencies
```

## 🔍 Review Process

### Automated Checks
- All tests must pass
- Code coverage must not decrease
- Build must succeed
- No linting errors

### Manual Review
- Code quality and style
- Feature completeness
- Documentation updates
- Performance impact

### Review Timeline
- Initial review within 2-3 days
- Follow-up reviews within 1 day
- Merge after approval from maintainer

## 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Mentioned in release notes for significant contributions
- Invited to join the core team for exceptional contributions

## ❓ Getting Help

- **Technical Questions**: [GitHub Discussions](https://github.com/EZTrades-dev/miner-spy/discussions)
- **Bug Reports**: [GitHub Issues](https://github.com/EZTrades-dev/miner-spy/issues)
- **Real-time Chat**: Create an issue for faster response
- **Direct Contact**: [@E_Z_Trades](https://x.com/E_Z_Trades) on X

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Miner Spy! Together, we're building better tools for the Bittensor community. 🚀
