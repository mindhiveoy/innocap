# Security Policy

## Supported Versions

The following versions of Innocap are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please use GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](https://github.com/mindhiveoy/innocap/security) of this repository
2. Click "Report a vulnerability"
3. Fill in the details of the vulnerability

This ensures your report is handled privately and securely.

### What to Include

When reporting a vulnerability, please include:

1. **Description** - A clear description of the vulnerability
2. **Impact** - What an attacker could achieve by exploiting it
3. **Steps to Reproduce** - Detailed steps to reproduce the issue
4. **Affected Components** - Which parts of the codebase are affected
5. **Suggested Fix** - If you have one (optional)

### What to Expect

- **Acknowledgement** - We will acknowledge receipt within 48 hours
- **Initial Assessment** - We will provide an initial assessment within 7 days
- **Resolution Timeline** - We aim to resolve critical issues within 30 days
- **Disclosure** - We will coordinate disclosure timing with you

### Safe Harbour

We consider security research conducted in accordance with this policy to be:

- Authorised concerning any applicable anti-hacking laws
- Authorised concerning any relevant anti-circumvention laws
- Exempt from restrictions in our Terms of Service that would interfere with conducting security research

We will not pursue legal action against researchers who:

- Act in good faith
- Avoid privacy violations and data destruction
- Do not exploit vulnerabilities beyond what is necessary to demonstrate them
- Report vulnerabilities promptly

## Security Best Practices for Contributors

When contributing to Innocap, please follow these security practices:

### Never Commit Secrets

- API keys, tokens, and credentials must **never** be committed
- Use environment variables for all sensitive configuration
- Check your commits with `git diff` before pushing

### Environment Variables

All sensitive data should be stored in environment variables:

```bash
# Good - use environment variables
const apiKey = process.env.API_KEY;

# Bad - hardcoded secrets
const apiKey = "sk-abc123...";
```

### Input Validation

- Validate all user input on the server side
- Use schema validation (e.g., Zod) for API requests
- Sanitise data before rendering to prevent XSS

### Dependencies

- Keep dependencies up to date
- Review security advisories: `yarn audit`
- Avoid dependencies with known vulnerabilities

### Authentication & Authorisation

- Never trust client-side authentication alone
- Validate permissions on every API request
- Use secure session management

## Security Features

### Current Implementations

- Firebase Security Rules for data access
- Environment variable configuration
- HTTPS enforcement in production

### Planned Improvements

- API rate limiting
- Input validation with Zod
- Content Security Policy headers
- Security headers middleware

## Contact

For security concerns, use [GitHub's private vulnerability reporting](https://github.com/mindhiveoy/innocap/security).

For general questions, please use [GitHub Discussions](https://github.com/mindhiveoy/innocap/discussions).
