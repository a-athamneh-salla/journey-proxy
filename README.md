# Salla Journey Proxy

A secure proxy service that handles communication between client applications and the Airflow API, as well as processes incoming webhooks. Built with Hono.js, TypeScript, and deployed on Cloudflare Workers.

## Features

- **Secure API Proxy**: Forwards authenticated client requests to the Airflow API with proper authentication
- **JWT Authentication**: Validates JWT tokens for client-side requests
- **Webhook Processing**: Handles incoming webhook events with shared secret authentication
- **Type Safety**: Built with TypeScript for improved code quality and developer experience
- **Serverless**: Designed to run on Cloudflare Workers for optimal performance and scalability

## Project Structure

```
journey-proxy/
├── src/                 # Source code
│   ├── config/          # Configuration files (API endpoints, secrets)
│   ├── routes/          # API route handlers
│   ├── middlewares/     # Middleware functions
│   ├── helpers/         # Utility functions
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main application entry point
├── tests/               # Test files
├── dist/                # Compiled output (generated)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── wrangler.toml        # Cloudflare Worker configuration
```

## API Documentation

### Proxy Endpoints

The proxy route handles requests to the Airflow API with JWT authentication.

#### `POST /proxy`

Forwards a POST request to the Airflow API.

#### `GET /proxy`

Forwards a GET request with query parameters to the Airflow API.

#### `PUT /proxy` and `PATCH /proxy`

Forwards PUT/PATCH requests to the Airflow API.

### Webhook Endpoint

Processes incoming webhook events with shared secret authentication.

#### `POST /webhook`

Processes different types of webhook events based on the event type.

## Development and Deployment

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare Workers
npm run deploy
```

