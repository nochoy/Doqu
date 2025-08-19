# Contributing to Doqu

Welcome aboard! This document outlines how we work together, from branching to PR etiquette.

## Branching Strategy (GitFlow)

- **main** — Production-ready
- **dev** — Integration branch for features
- **feature/<short-description>** — For new features
- **bugfix/<short-description>** — Fixes for bugs
- **release/<version>** — Prepping for release

### Branching Example
```bash
git checkout dev
git pull origin dev
git checkout -b feature/ai-quiz-generation
```

## Pull Request Etiquette & Merge Rules
1. Open a PR targeting the **dev** branch (ONLY **dev** can merge into **main**)
2. Receive at least one reviewer approval
3. Write and pass new tests
4. Pass all new and existing tests with >= 90% code coverage
5. PR must pass CI (lint, tests, build)
6. Once approved and CI is green, merge using "**Create a merge commit**"
7. Never merge directly to main—use a release PR when ready for production.

## Development Setup

### Prerequisites
- Install Node.js v22.18.0
- Install Python 3.12.10
- Install Docker Desktop
