# GitHub Repository Settings

## Branch Protection

### main branch
- Require pull request reviews before merging
- Require status checks to pass before merging
  - `build`
  - `lint` (optional)
- Require branches to be up to date before merging
- Include administrators

## Environments

### github-pages
- Auto-deploy on push to main

### staging (optional)
- Manual deployment

### production
- Manual deployment
- Requires review

## Secrets Required

| Secret | Description | Used In |
|--------|-------------|---------|
| `VERCEL_TOKEN` | Vercel API token | deploy.yml |
| `VERCEL_ORG_ID` | Vercel organization ID | deploy.yml |
| `VERCEL_PROJECT_ID` | Vercel project ID | deploy.yml |

## Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push to main/develop, PRs | Build & test |
| `deploy.yml` | Push to main, manual | Deploy to GitHub Pages |
| `mobile.yml` | Tag (v*), manual | Build Android/iOS apps |
| `release.yml` | Manual | Create new release |
