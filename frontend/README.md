# Doqu Frontend

This is the Next.js frontend for the Doqu real-time quiz platform.

## Getting Started

### Prerequisites

- Node.js v22.18.0 or higher
- npm v10.8.2 or higher

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/nochoy/Doqu.git
   cd Doqu/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Running the Development Server

1. **Start the server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

2. **Open the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the running application.

### Running with Docker

1. **Build and start the containers:**
   From the root of the project, run:

   ```bash
   docker-compose up --build
   ```

2. **Open the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the running application.

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |

## 🔧 Configuration

### Next.js Configuration

The application uses Next.js 15 with the following key configurations:

- **App Router**: Modern routing with `app/` directory
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first CSS framework
- **ESLint**: Code linting with Next.js rules
- **Jest**: Testing framework with React Testing Library

## 🧪 Testing

### Run All Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=AuthContext

# Run tests with debugging
npm test -- --debug
```

### Run E2E Tests

```bash
npm run test:e2e
```

## 🔍 Linting & Code Quality

### Run ESLint

```bash
npm run lint
```

### Fix ESLint Issues Automatically

```bash
npm run lint:fix
```

### Run Type Checking

```bash
npm run type-check
```

### Run All Quality Checks

```bash
npm run quality
```

## 🎨 Formatting

### Format All Code

```bash
npm run format
```

### Check Formatting (Dry Run)

```bash
npm run format:check
```

### Format Specific File

```bash
npx prettier --write src/components/Button.tsx
```

## 🔄 Pre-commit Hooks

### Install Husky (if not already installed)

```bash
npm run prepare
```

### Run Pre-commit Manually

```bash
npx lint-staged
```

## 📊 Build & Production

### Build for Production

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Analyze Bundle Size

```bash
npm run analyze
```

## 🛠️ Development Scripts

### Available Scripts

```bash
# Check types
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

#### WebSocket Connection Issues

- Ensure backend is running on port 8000
- Check CORS configuration in backend
- Verify WebSocket URL in environment variables

#### Build Failures

```bash
# Clear all caches
rm -rf .next node_modules
npm install
npm run build
```

### Debug Mode

Enable debug logging:

```bash
npm run dev -- --hostname 0.0.0.0
```

Then access via your local IP: `http://[your-ip]:3000`

## 🚀 Performance Optimization

### Check Bundle Size

```bash
npm run build && npm run analyze
```

### Lighthouse Audit

```bash
npm run build && npm run start
# Then run Lighthouse in Chrome DevTools
```

## Tech Stack

- [Next.js](https://nextjs.org/) – React framework
- [Tailwind CSS](https://tailwindcss.com/) – Utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) – Component library
- [Socket.IO Client](https://socket.io/docs/v4/client-api/) – Real-time communication
- [Phosphor Icons](https://phosphoricons.com/) – Icon library
- [Jest](https://jestjs.io/) – Testing framework
- [React Testing Library](https://testing-library.com/react) – Testing utilities
- [ESLint](https://eslint.org/) – Linter
- [Prettier](https://prettier.io/) – Code formatter
- [TypeScript](https://www.typescriptlang.org/) – Type checking
