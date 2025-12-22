# Contributing to Innocap

Thank you for your interest in contributing to Innocap! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

### Prerequisites

- Node.js >= 18
- Yarn 4.x (package manager)
- Git
- A Firebase project (for data storage)
- Google Cloud service account (optional, for Sheets integration)

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/innocap.git
   cd innocap
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/mindhiveoy/innocap.git
   ```

4. **Install dependencies**

   ```bash
   yarn install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your configuration values.

6. **Start the development server**

   ```bash
   yarn dev
   ```

   The application will be available at http://localhost:3000

## Making Changes

### Branch Naming

Create a new branch for your changes using a descriptive name:

- `feature/add-new-indicator` - For new features
- `fix/map-loading-issue` - For bug fixes
- `docs/update-readme` - For documentation changes
- `refactor/simplify-data-context` - For code refactoring

```bash
git checkout -b feature/your-feature-name
```

### Commit Messages

Write clear, concise commit messages that explain what and why:

```
feat: add municipality comparison tooltip

- Display population data on hover
- Show year-over-year change percentage
- Support both Finnish and English languages
```

Use conventional commit prefixes:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Keep Changes Focused

- One pull request should address one concern
- Avoid mixing unrelated changes
- Keep commits atomic and logically grouped

## Pull Request Process

1. **Update your fork**

   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

2. **Run quality checks**

   ```bash
   yarn lint
   yarn build
   yarn test
   ```

   Ensure all checks pass before submitting.

3. **Push your changes**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request**

   - Go to GitHub and create a PR from your branch to `develop`
   - Fill in the PR template completely
   - Link any related issues
   - Request review from maintainers

5. **Address feedback**

   - Respond to review comments promptly
   - Make requested changes in new commits
   - Re-request review when ready

6. **Merge**

   Once approved, a maintainer will merge your PR.

## Coding Standards

### TypeScript

- Use strict TypeScript - avoid `any` type
- Define interfaces for all data structures
- Use proper type imports: `import type { ... }`

```typescript
// Good
interface IndicatorData {
  id: string;
  value: number;
  year: number;
}

// Avoid
const data: any = fetchData();
```

### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks

```typescript
// Good - focused component
const IndicatorCard: React.FC<IndicatorCardProps> = ({ indicator, onSelect }) => {
  // Component logic
};

// Avoid - component doing too much
const Dashboard = () => {
  // 500 lines of mixed concerns
};
```

### File Organisation

```
src/
├── app/           # Next.js App Router pages and API routes
├── components/    # React components
├── contexts/      # React Context providers
├── hooks/         # Custom React hooks
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### Naming Conventions

- **Components**: PascalCase (`IndicatorCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useIndicator.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_INDICATORS`)
- **Types/Interfaces**: PascalCase (`IndicatorData`)

### Code Style

- Use Prettier for formatting (configured in project)
- Follow ESLint rules (run `yarn lint`)
- Maximum line length: 100 characters
- Use meaningful variable names

## Testing

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test --watch

# Run tests with coverage
yarn test --coverage
```

### Writing Tests

- Write tests for new features
- Update tests when modifying existing code
- Aim for meaningful coverage, not just percentage

```typescript
describe('calculateTrend', () => {
  it('returns positive trend for increasing values', () => {
    const data = [
      { year: 2023, value: 100 },
      { year: 2024, value: 120 },
    ];
    expect(calculateTrend(data)).toBe('increasing');
  });
});
```

## Documentation

### Code Comments

- Write self-documenting code where possible
- Add comments for complex logic
- Use JSDoc for public APIs

```typescript
/**
 * Calculates the trend direction based on historical data.
 * @param data - Array of data points with year and value
 * @returns Trend direction: 'increasing', 'decreasing', or 'stable'
 */
function calculateTrend(data: DataPoint[]): TrendDirection {
  // Implementation
}
```

### README Updates

- Update README.md if you add new features
- Document any new environment variables
- Add examples for new functionality

## Questions?

If you have questions about contributing:

1. Check existing [issues](https://github.com/mindhiveoy/innocap/issues) and [discussions](https://github.com/mindhiveoy/innocap/discussions)
2. Open a new discussion for general questions
3. Open an issue for bugs or feature requests

Thank you for contributing to Innocap!
