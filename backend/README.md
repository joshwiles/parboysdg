# Express.js Backend Template

A clean, minimal Express.js backend template for building RESTful APIs.

## Features

- **Express.js** - Fast, unopinionated web framework
- **Security** - Helmet.js for security headers
- **CORS** - Cross-origin resource sharing support
- **Logging** - Morgan for HTTP request logging
- **Environment** - Dotenv for environment variables
- **Error Handling** - Centralized error handling middleware

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp env.example .env
```

3. Start development server:
```bash
npm run dev
```

4. Your API will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

## Project Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies and scripts
├── env.example        # Environment variables template
├── nodemon.json       # Development configuration
├── routes/            # API routes (create your own)
├── middleware/        # Custom middleware (create your own)
├── utils/             # Utility functions (create your own)
└── tests/             # Test files (create your own)
```

## API Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check
- `GET /api/example` - Example API endpoint

## Customization

This template provides a minimal starting point. You can:

- Add your own routes in the `routes/` directory
- Create custom middleware in the `middleware/` directory
- Add database connections and models
- Implement authentication and authorization
- Add validation and sanitization
- Create comprehensive test suites

## Environment Variables

Copy `env.example` to `.env` and configure:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed origin for CORS

## License

MIT
