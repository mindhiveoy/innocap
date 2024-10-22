# Innocap - Green and Digital Transition Indicator Dashboard

This is a Turborepo-based monorepo for the Innocap project, which aims to visualize and analyze green and digital transition indicators for municipalities.

## Project Structure

This Turborepo includes the following packages and apps:

- `apps/web`: The main Next.js application for the Innocap dashboard
- `packages/ui`: A shared React component library
- `packages/eslint-config`: Shared ESLint configurations
- `packages/typescript-config`: Shared TypeScript configurations

## Key Features

- Display 10 green transition and 10 digital transition indicators
- Interactive map visualization for geospatial data
- Transnational support (Finland, Ireland, Sweden)
- Customizable indicators
- Open data integration

## Target Audience

- Municipal decision-makers
- Regional development planners
- Sustainability researchers

## Getting Started

To get started with this Turborepo, follow these steps:

1. Clone the repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Run the development server:
   ```
   yarn dev
   ```

This will start the development servers for both the main application and any other parts of the monorepo.

## Building

To build all apps and packages, run the following command:

```
yarn build
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)
