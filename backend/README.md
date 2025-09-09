# Doqu Backend - FastAPI Application

This is the FastAPI backend for Doqu, a real-time quiz platform built with Python 3.12, FastAPI, SQLModel, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Python (3.12 or later)
- PostgreSQL 16

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/nochoy/Doqu.git
   cd Doqu/backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv

   source venv/bin/activate   # Linux/Mac
   venv\Scripts\activate      # Windows
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements-dev.txt
   ```

4. **Common errors in setup:**

   ```bash
   psycopg2-binary may fail while building wheels

   Mac: run `brew install postgresql` then run `pip install -r requirements-dev.txt`
   ```

### Running the Development Server

1. **Start the server:**
   ```bash
   uvicorn app.main:app --reload
   ```

2. **Access the API:**
   Open [http://localhost:8000](http://localhost:8000) in your browser to interact with the API.

### Running with Docker

1. **Build and start the database container:**
   ```bash
   # Build and start the DB container
   docker compose up --build db

   # Or start the existing DB container:
   docker compose up db

   # Or start the existing DB container detached w/o terminal logs (recommended):
   docker compose up db -d
   ```

2. **Shut down the containers:**
   ```bash
   # Stop the containers
   docker compose stop

   # Delete the containers
   docker compose down
   ```

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Schema**: http://localhost:8000/openapi.json

## 🧪 Testing

### Run All Tests
```bash
pytest
```

### Run Tests with Coverage
```bash
pytest --cov=app --cov-report=html
```

### Run Specific Test File
```bash
pytest tests/test_auth.py
```

### Run Tests in Watch Mode
```bash
pytest-watch
```

## 🔍 Linting & Code Quality

### Run All Linters
```bash
flake8 app/
```

### Run Type Checker
```bash
mypy app/
```

### Auto-fix Import Sorting
```bash
isort app/
```

## 🎨 Formatting

### Format All Code
```bash
black app/
```

### Check Formatting (Dry Run)
```bash
black --check app/
```

### Format with Import Sorting
```bash
black app/ && isort app/
```

## 📊 Code Quality Scripts

### Run Full Quality Check
```bash
# Format, lint, type check, and test
black app/ && isort app/ && flake8 app/ && mypy app/ && pytest
```

### Quick Development Check
```bash
# Fast check for common issues
flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics
```

## 🗄️ Database Commands

### Create Migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply Migrations
```bash
alembic upgrade head
```

### Reset Database (Development)
```bash
alembic downgrade base && alembic upgrade head
```

## 🛠️ Development Scripts

### Add to your `pyproject.toml`:
```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]

[tool.black]
line-length = 100
target-version = ['py312']

[tool.isort]
profile = "black"
multi_line_output = 3

[tool.mypy]
python_version = "3.12"
warn_return_any = true
warn_unused_configs = true
```

## Tech Stack

- [FastAPI](https://fastapi.tiangolo.com/) – Python web framework
- [SQLModel](https://sqlmodel.tiangolo.com/) – Python ORM
- [PostgreSQL](https://www.postgresql.org/) – Relational database
- [Google Gemini API](https://ai.google.dev/) – AI models for question generation
- [Pytest](https://pytest.org/) – Testing framework
- [Black](https://black.readthedocs.io/) – Code formatter
- [Flake8](https://flake8.pycqa.org/) – Linter
- [MyPy](https://mypy.readthedocs.io/) – Type checker
