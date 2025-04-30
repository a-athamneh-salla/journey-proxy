# Salla Journey Proxy API

A secure proxy service for Salla applications to communicate with Airflow APIs and handle webhook events.

## Features

- **Secure Authentication**: JWT-based authentication for client requests and shared secret for webhooks
- **API Key Management**: Create and manage API keys for programmatic access
- **User Management**: Support for user accounts and authentication
- **Proxy Functionality**: Forward requests to Airflow API with proper authentication
- **Webhook Handling**: Process incoming webhook events from Airflow
- **D1 Database Integration**: Store user data and API keys securely
- **Cloudflare Workers**: Built to run on the edge with Cloudflare Workers

## Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono.js](https://honojs.dev/) - Fast, lightweight web framework
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) - SQL database at the edge
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type safety and modern JavaScript features

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (v8 or later)
- [Wrangler CLI](https://developers.cloudflare.com/workers/cli-wrangler/) (v4 or later)
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/salla/journey-proxy.git
   cd journey-proxy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.dev.vars` file for local development:
   ```
   AIRFLOW_API_URL="https://your-airflow-instance.example.com/api"
   AIRFLOW_USERNAME="your-airflow-username"
   AIRFLOW_PASSWORD="your-airflow-password"
   JWT_SECRET="your-secure-jwt-secret"
   WEBHOOK_SECRET="your-webhook-secret"
   ```

4. Set up the D1 database:
   ```bash
   # Create the database in your Cloudflare account
   wrangler d1 create salla-proxy-db
   
   # Apply migrations
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Creating a User and API Key

Use the provided script to create a new user and API key:

```bash
npm run db:create-user
```

Follow the prompts to create a user and generate API keys.

## Deployment

1. Update the `wrangler.toml` file with your Cloudflare account ID and database ID

2. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## API Documentation

The API is documented using OpenAPI 3.0 specification. You can view the full API documentation in:
- `openapi-updated.yaml` - Contains all endpoints including user management and authentication

### Main Endpoints

- `GET /` - Health check endpoint
- `POST /users/login` - User authentication
- `GET /users/me` - Get current user information
- `GET/POST /users/api-keys` - Manage API keys
- `POST /webhook` - Handle Airflow webhook events
- `POST/GET/PUT/PATCH /proxy` - Proxy requests to Airflow API

## Authentication

### JWT Authentication

For client-side requests, use Bearer token authentication:

```
Authorization: Bearer <jwt-token>
```

You can obtain a token by using the `/users/login` endpoint.

### API Key Authentication

For programmatic access, use API key authentication:

```
Authorization: ApiKey <your-api-key>
```

API keys can be created and managed through the `/users/api-keys` endpoints.

### Webhook Authentication

Webhooks use a shared secret for authentication:

```
X-Webhook-Secret: <webhook-secret>
```

## Database Schema

The application uses Cloudflare D1 with the following tables:

- `users` - Store user information
- `api_keys` - Store API keys linked to users

## Development

### Testing

Run the test suite:

```bash
npm test
```

### Linting and Formatting

```bash
# Lint TypeScript files
npm run lint

# Format code
npm run format
```

## Security Considerations

- JWT tokens expire after 24 hours by default
- API keys can be set to expire after a specified number of days
- Passwords are hashed using bcrypt before storage
- All authentication secrets are stored as environment variables
- WebHook endpoints require a shared secret

## License

ISC © Salla Team

