# 📝 Contributing to Doqu

Welcome aboard! This document outlines how we work together, from branching to PR etiquette.

## 🎨 Key Design Decisions

- **API-First Design**: RESTful API with OpenAPI documentation: [Wiki](https://github.com/nochoy/Doqu/wiki/API-Docs)
- **Real-time Updates**: WebSocket connections for live quiz sessions
- **Type Safety**: Full TypeScript on frontend, type hints on backend
- **Database Migrations**: Alembic for version-controlled schema changes
- **Containerization**: Docker for consistent deployment environments
- **Hot Reloading**: Development servers with automatic restart on code changes

## 🌲 Branch Strategy (GitFlow)

- `main` — Production-ready
- `dev` — Integration branch for features
- `feature/*` — For new features
- `bugfix/*` — Fixes for bugs
- `release/*` — Prepping for release
- `setup/*` — Setup config, tools, etc.

### Git Workflow

```bash
# Start new feature
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add new quiz generation endpoint"

# Push and create PR
git push origin feature/your-feature-name

# Create PR to develop branch
```

## ✏️ Pull Request Etiquette & Merge Rules
1. Open a PR targeting the **dev** branch (ONLY **dev** can merge into **main**)
2. Receive at least one reviewer approval
3. Write and pass new tests
4. Pass all new and existing tests with >= 80% code coverage
5. PR must pass CI (lint, tests, build)
6. Once approved and CI is green, merge using "**Create a merge commit**"
7. Never merge directly to main—use a release PR when ready for production.

## 🔑 Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/doqu` |
| `SECRET_KEY` | JWT signing secret | Generate with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |


## 💻 Development Setup

This project is configured to use [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) for a consistent and seamless development experience.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Node.js v22.18.0
- Python 3.12.10

### Getting Started with Dev Containers

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/nochoy/doqu.git
    cd doqu
    ```

2.  **Open in VS Code:**
    ```bash
    code .
    ```

3.  **Reopen in Dev Container:**
    - VS Code will detect the `.devcontainer` configuration
    - Click "Reopen in Container" when prompted
    - Or use Command Palette (`Ctrl+Shift+P`) → "Dev Containers: Reopen in Container"

4.  **Environment Setup:**
    The dev container will automatically:
    - Install all dependencies (Node.js & Python)
    - Set up the database
    - Start all services

### Manual Setup (Alternative)

If you prefer not to use Dev Containers:

1. **Create Virtual Environment**
   ```bash
   cd backend 
   
   python -m venv venv
   source venv/bin/activate   # Linux/Mac
   venv\Scripts\activate      # Windows
   ```

2.  **Install Dependencies:**
    ```bash
    # Backend
    pip install -r requirements-dev.txt

    # Frontend
    cd ../frontend
    npm install
    ```

3.  **Environment Configuration:**
    ```bash
    # Backend environment
    cp backend/.env.example backend/.env

    # Frontend environment
    cp frontend/.env.example frontend/.env.local
    ```

4.  **Database Setup:**
    ```bash
    # Start PostgreSQL
    docker compose up -d db

    # Run migrations
    alembic upgrade head
    ```

5.  **Start Services:**
    ```bash
    # Terminal 1 - Backend
    cd backend
    uvicorn app.main:app --reload

    # Terminal 2 - Frontend
    cd frontend
    npm run dev
    ```

## 🔧 Development Workflow

### Database Management

```bash
# Create initial migration
alembic revision --autogenerate -m "Initial tables"

# Apply migrations
alembic upgrade head

# Reset database (development only)
alembic downgrade base && alembic upgrade head

# View migration history
alembic history
```

### Testing

```bash
# Backend tests
cd backend
pytest -v
pytest --cov=app tests/

# Frontend tests
cd frontend
npm test
npm run test:watch

# E2E tests (when available)
npm run test:e2e
```

### Code Quality

```bash
# Backend linting & formatting
cd backend
black . --check
flake8
mypy app/
isort .

# Frontend linting & formatting
cd frontend
npm run lint
npm run format
npm run type-check
```

### API Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🆘 Getting Help

### Common Issues

- **Database Connection**: Verify `DATABASE_URL` in `.env` files
- **Port Conflicts**: Ensure ports 3000 and 8000 are available
- **Dependencies**: Run `docker compose down && docker compose up --build` for clean rebuild
- **Hot Reload Not Working**: Restart the dev container or check file permissions

### Debug Commands

```bash
# Check service health
docker compose ps
docker compose logs backend
docker compose logs frontend

# Database connectivity
docker compose exec db psql -U postgres -d doqu -c "\dt"

# Reset everything
docker compose down -v
docker compose up --build
```
