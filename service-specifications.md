# Innocap Service Specifications

## 5.1 Functional Requirements

### User Stories
- Municipal decision-makers can view green and digital transition indicators
- Regional development planners can analyze geospatial data through interactive maps
- Sustainability researchers can access customizable indicators
- Users can interact with an AI chatbot for strategy-related queries
- Users can access the system in multiple languages (Finland, Ireland, Sweden)
- Users can view and compare indicator data across different years
- Users can pin multiple indicators to the map simultaneously
- Users can access detailed source information for each indicator
- Users can interact with both map and chart visualizations
- Users can filter indicators by green and digital transition categories

### Features and Functions
- Display of 10 green transition and 10 digital transition indicators
- Interactive map visualization for geospatial data
- AI-powered chatbot for strategy consultation
- Transnational support system
- Customizable indicator dashboard
- Open data integration
- Natura 2000 sites visualization for Southern Savo region
- Display and management of indicators:
  - Green transition indicators
  - Digital transition indicators
  - Municipality-level data visualization
  - Point-based marker data
  - Bar chart comparisons
  - Natura 2000 protected areas overlay
- Interactive features:
  - Pin/unpin indicators to map
  - Year selection for temporal analysis
  - Keyboard shortcuts (Esc to close, Ctrl+/ for chat)
  - Tooltips for truncated information

## 5.2 Non-Functional Requirements

### Performance
- Optimized polygon simplification for map rendering
- Efficient data caching through Turborepo
- Client-side performance optimization through Next.js
- Chatbot response time optimization with retry logic
- Efficient data synchronization with Google Sheets
- Batch processing for Firebase updates
- Optimized data structures for real-time filtering
- Client-side caching of indicator data
- Lazy loading of map components

### Security
- Environment variable protection (.env files)
- Vercel deployment security
- Firebase Admin integration for backend security
- Google Auth Library implementation
- Google Service Account authentication for sheets access
- Firebase Security Rules implementation
- Secure API routes with error handling
- Protected metadata management

### Usability
- Responsive design with mobile support
- Keyboard navigation support (Escape to close, Ctrl+/ to open chat)
- ARIA labels and roles for accessibility
- Focus management for chat window
- Custom typography for readability
- Consistent UI components through shared library
- Responsive design with mobile-first approach
- Accessible UI components with ARIA labels
- Gradient icons for visual hierarchy
- Consistent typography system
- Multi-language support (En/Fi)

### Scalability
- Monorepo architecture for code reuse
- Modular component design
- Remote caching capability
- Containerized deployment support
- Firebase real-time database integration
- Batch processing for data updates
- Automated data refresh mechanism

## 5.3 Technical Specifications

### Architecture
- Turborepo-based monorepo structure
- Next.js frontend application
- Shared component library
- ESLint and TypeScript configurations
- Material-UI based theming system
- Data Flow:
  - 1. Google Sheets → API Routes
  - 2. Firebase Storage → Client Application
  - 3. Real-time Updates → User Interface
- Component Structure:
  - Indicator Management System
  - Map Visualization Layer
  - Data Synchronization Service
  - Real-time Update System

### Technology Stack
- Frontend:
  - Next.js
  - React
  - TypeScript
  - Material-UI
  - Emotion (CSS-in-JS)
- Backend:
  - Firebase Admin
  - Flowise for chatbot
- Development:
  - Yarn 4.5.1
  - Turborepo
  - ESLint
  - Prettier
  - Node.js ≥18
- Deployment:
  - Vercel
  - Docker support
- Data Management:
  - Google Sheets API
  - Firebase Firestore
  - Batch Processing
- Map Technologies:
  - Leaflet
  - GeoJSON processing
  - Custom map layers

### Integration
- Flowise chatbot integration
- Natura 2000 data integration
- Open data API integration
- Firebase services integration
- Data Sources:
  - Google Sheets (primary data)
  - Firebase (real-time storage)
  - SYKE (environmental data)
- APIs:
  - Sheets API for data fetching
  - Firebase API for storage
  - Custom API routes for data processing

## 5.4 Service Delivery

### Workflow
- Automated CI/CD pipeline through GitHub Actions
- Staging and production deployment separation
- Automated testing on pull requests
- Code quality checks through ESLint
- Data Update Process:
  - 1. Scheduled sheet data fetch
  - 2. Data validation and processing
  - 3. Firebase batch updates
  - 4. Client-side refresh
- Error Handling:
  - Validation checks
  - Error logging
  - Fallback mechanisms

### Support and Maintenance
- Automated error logging for chatbot
- Development, staging, and production environments
- Vercel deployment monitoring
- GitHub-based issue tracking

## 5.5 Implementation Plan

### Roadmap
- Continuous integration with GitHub Actions
- Separate staging and production deployments
- Automated testing implementation
- Component library development

### Testing and Validation
- Pull request validation
- Automated testing through GitHub Actions
- Playwright for end-to-end testing
- TypeScript for type safety
- Data Integrity:
  - Type validation
  - Data format verification
  - Null checks
- Performance Testing:
  - Load time optimization
  - Data update efficiency
  - Real-time update performance

## 5.6 Documentation and Training

### User Documentation
- Basic README with project overview
- TypeScript interfaces for data structures
- Comments in key components

### Training Materials
- Basic workspace configuration in .vscode/innocap.code-workspace