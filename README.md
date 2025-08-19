# Doqu - The Interactive Real-Time Quiz Platform

Doqu is a real-time quiz platform with AI-powered quiz generation, enhanced player interactions, and advanced host analytics. It features a Next.js frontend, a FastAPI backend, and a PostgreSQL database.

##  Directory Structure

```
Doqu/
├── 📁 backend/                   # FastAPI backend service
│   ├── 📁 app/                   # Main application package
│   │   ├── 📁 api/               # REST API endpoints (v1)
│   │   │   ├── auth.py           # Authentication & authorization
│   │   ├── 📁 core/              # Core configurations & settings
│   │   │   └── config.py         # Environment variables & app config
│   │   ├── 📁 db/                # Database layer
│   │   │   ├── engine.py         # SQLAlchemy engine configuration
│   │   │   ├── session.py        # Database session management
│   │   │   ├── init_db.py        # Database initialization
│   │   │   └── utils.py          # Database utilities
│   │   ├── 📁 models/            # SQLModel database models
│   │   │   ├── user.py           # User & authentication models
│   │   ├── 📁 websocket/         # Real-time communication
│   │   │   └── handlers.py       # WebSocket event handlers
│   │   ├── main.py               # FastAPI application factory
│   │   └── __init__.py           # Package initialization
│   ├── 📁 alembic/               # Database migrations
│   ├── 📁 tests/                 # Backend test suite
│   ├── requirements.txt          # Production dependencies
│   ├── requirements-dev.txt      # Development dependencies
│   ├── pyproject.toml           # Python project configuration
│   ├── Dockerfile               # Backend container image
│   └── README.md                # Backend-specific documentation
│
├── 📁 frontend/                   # Next.js frontend service
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js 15 app directory
│   │   │   ├── api/              # Next.js API routes (proxy)
│   │   │   ├── login/            # Authentication pages
│   │   │   ├── globals.css       # Global styles & Tailwind
│   │   │   ├── layout.tsx        # Root layout component
│   │   │   └── page.tsx          # Home page component
│   │   ├── 📁 components/        # Reusable React components
│   │   │   ├── ui/               # Shadcn/ui primitive components
│   │   │   └── shared/           # Shared application components
│   │   ├── 📁 contexts/          # React context providers
│   │   │   └── AuthContext.tsx   # Authentication state management
│   │   ├── 📁 lib/               # Utility libraries
│   │   │   ├── socket.ts         # WebSocket client configuration
│   │   │   ├── utils.ts          # Helper functions
│   │   │   └── api.ts            # API client configuration
│   │   ├── 📁 types/             # TypeScript type definitions
│   │   │   └── auth.ts           # Authentication-related types
│   │   └── 📁 __tests__/         # Frontend test suite
│   ├── 📁 public/                # Static assets
│   ├── package.json              # Node.js dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── next.config.ts            # Next.js configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── Dockerfile               # Frontend container image
│   └── README.md                # Frontend-specific documentation
│
├── 📁 docs/                      # Project documentation
│   ├── CONTRIBUTING.md          # Development guidelines
│   ├── DATABASE_SCHEMA.md       # Database design documentation
│   └── PROJECT_SETUP_GUIDE.md   # Environment setup instructions
│
├── 📁 alembic/                  # Root-level migrations (shared)
├── 📁 .devcontainer/            # VS Code development container
├── 📁 .github/                  # GitHub workflows & templates
├── docker-compose.yml          # Multi-service orchestration
├── docker-compose.override.yml # Local development overrides
├── .env.example                # Environment variable templates
├── .gitignore                  # Git ignore patterns
└── README.md                   # This file
```

### Data Flow Architecture

```mermaid
graph TD
    A[Next.js Frontend<br/>:3000] -->|HTTP/WebSocket| B[FastAPI Backend<br/>:8000]
    B -->|SQLAlchemy| C[PostgreSQL<br/>:5432]
    B -->|WebSocket| A
    C -->|Alembic| D[Migrations]
```

### Key Design Decisions

- **API-First Design**: RESTful API with OpenAPI documentation at `/docs`
- **Real-time Updates**: WebSocket connections for live quiz sessions
- **Type Safety**: Full TypeScript on frontend, type hints on backend
- **Database Migrations**: Alembic for version-controlled schema changes
- **Containerization**: Docker for consistent deployment environments
- **Hot Reloading**: Development servers with automatic restart on code changes

## 🚀 Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS | Modern React framework with SSR |
| **Backend** | FastAPI, Python 3.12, SQLModel | High-performance async API |
| **Database** | PostgreSQL 15 | Primary data storage |
| **Real-time** | WebSockets (native) | Live quiz interactions |
| **Auth** | JWT tokens, Google OAuth | Secure user authentication |
| **DevOps** | Docker, Dev Containers | Consistent development environment |

## 🎯 Key Features

- **🎮 Real-time Quiz Games**: Live multiplayer quiz sessions with instant feedback
- **🤖 AI Quiz Generation**: Automatic quiz creation from topics or documents
- **📊 Host Analytics**: Detailed performance metrics and insights
- **👥 Player Interaction**: Live leaderboards, reactions, and chat
- **🔐 Secure Auth**: JWT-based authentication with Google OAuth
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## 🛠️ Development Environment

This project is configured to use [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers) for a consistent and seamless development experience.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [VS Code Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Node.js v22.18.0
- Python 3.12.11

### Getting Started with Dev Containers

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/doqu.git
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

1.  **Install dependencies:**
    ```bash
    # Backend
    cd backend
    pip install -r requirements.txt
    pip install -r requirements-dev.txt

    # Frontend
    cd ../frontend
    npm install
    ```

2.  **Environment Configuration:**
    ```bash
    # Backend environment
    cp backend/.env.example backend/.env

    # Frontend environment
    cp frontend/.env.example frontend/.env.local
    ```

3.  **Database Setup:**
    ```bash
    # Start PostgreSQL
    docker compose up -d db

    # Run migrations
    alembic upgrade head
    ```

4.  **Start Services:**
    ```bash
    # Terminal 1 - Backend
    cd backend
    uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

    # Terminal 2 - Frontend
    cd frontend
    npm run dev
    ```

### Key Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost/doqu` |
| `SECRET_KEY` | JWT signing secret | Generate with `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Cloud Console |
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |

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

## 📚 Additional Resources

- **[📖 Contributing Guide](docs/CONTRIBUTING.md)** - Development standards and practices

## 🆘 Getting Help

### Common Issues

- **Dev Container Issues**: Check [troubleshooting guide](PROJECT_SETUP_GUIDE.md#dev-container-issues)
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

## 🏷️ Branch Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature branches
- `hotfix/*` - Critical bug fixes
- `release/*` - Release preparation branches

### Git Workflow

```bash
# Start new feature
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Commit changes
git add .
git commit -m "feat: add new quiz generation endpoint"

# Push and create PR
git push origin feature/your-feature-name
# Create PR to develop branch
```

---

**Happy coding!** 🎉 For questions or issues, please check the documentation or create an issue in the repository.
