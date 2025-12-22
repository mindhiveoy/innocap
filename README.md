# INNOCAP - Green and Digital Transition Indicator Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A web-based dashboard for visualising and analysing green and digital transition indicators for municipalities in the Northern Periphery and Arctic (NPA) regions.

## About the Project

This open source project has been developed as part of the **INNOCAP (NPA0100032)** research project — *Building Public Sector Innovation Capacity towards Digital-driven Green Transition in NPA Areas*.

The INNOCAP project (January 2023 – December 2025) aims to support the adoption of digital technologies and innovations to offer quality and sustainable public service solutions. It addresses regional challenges including ageing populations, high service costs, geographic distances, and skills gaps in digital solutions across the Northern Periphery and Arctic regions.

**Project Partners:**
- University of Helsinki, Ruralia Institute (Project Lead)
- 8 partners across three geographic NPA regions plus Canada

**Funded by:**
- European Regional Development Fund (ERDF) Northern Periphery and Arctic Programme
- Lapland Regional Council

For more information, visit the [official project page](https://researchportal.helsinki.fi/fi/projects/building-public-sector-innovation-capacity-towards-digital-driven-2/).

## Features

- **20 Transition Indicators**: Display 10 green transition and 10 digital transition indicators
- **Interactive Map Visualisation**: Geospatial data presentation using Leaflet maps
- **Multi-region Support**: Coverage for Finland, Ireland, and Sweden
- **Customisable Indicators**: Flexible indicator configuration
- **Open Data Integration**: Built on publicly available data sources
- **Responsive Design**: Works across desktop and mobile devices

## Target Audience

- Municipal decision-makers
- Regional development planners
- Sustainability researchers
- Public sector innovation teams

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Runtime**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Monorepo**: [Turborepo](https://turbo.build/)
- **UI Components**: [Material-UI 6](https://mui.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) / [React-Leaflet](https://react-leaflet.js.org/)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Data Source**: Google Sheets API
- **Deployment**: [Vercel](https://vercel.com/)

## Project Structure

```
innocap/
├── apps/
│   └── web/                 # Main Next.js application
├── packages/
│   ├── ui/                  # Shared React component library
│   ├── eslint-config/       # Shared ESLint configurations
│   └── typescript-config/   # Shared TypeScript configurations
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- Yarn package manager
- Firebase project (for Firestore database)
- Google Cloud project (for Sheets API access)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mindhiveoy/innocap.git
   cd innocap
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example apps/web/.env.local
   ```

   Edit `apps/web/.env.local` and fill in your configuration values. See [Environment Variables](#environment-variables) for details.

4. Run the development server:
   ```bash
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
yarn build
```

### Linting

```bash
yarn lint
```

## Environment Variables

The application requires the following environment variables. Copy `.env.example` to `apps/web/.env.local` and configure:

### Firebase Configuration (Client-side)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |

### Google Sheets API (Server-side)
| Variable | Description |
|----------|-------------|
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account email address |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Service account private key (with `\n` for newlines) |
| `GOOGLE_SPREADSHEET_ID` | ID of the Google Spreadsheet containing indicator data |

### Analytics (Optional)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |

### Chat Widget (Optional)
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CHAT_BASE_URL` | Chat service base URL |
| `NEXT_PUBLIC_CHAT_TENANT_ID` | Chat tenant identifier |
| `NEXT_PUBLIC_CHAT_AGENT_ID` | Chat agent identifier |

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started.

## Security

For security concerns, please review our [Security Policy](SECURITY.md) and report vulnerabilities responsibly.

## Licence

This project is licensed under the MIT Licence — see the [LICENCE](LICENSE) file for details.

## Acknowledgements

This project has been developed by the [University of Helsinki, Ruralia Institute](https://www.helsinki.fi/en/ruralia-institute) as part of the INNOCAP research project.

**Project Team:**
- Toni Ryynänen (Project Director)
- Päivi Pylkkänen
- Anni Tuomaala

**Development:**
- [Mindhive Oy](https://mindhive.fi/)

**Funding:**
- European Regional Development Fund (ERDF) Northern Periphery and Arctic Programme
- Lapland Regional Council

---

*Building public sector innovation capacity towards digital-driven green transition in NPA areas.*
