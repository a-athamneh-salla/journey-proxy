# Technical Product Requirements Document (PRD)

## Overview

This document outlines the technical requirements for a proxy application built using **Hono.js** and **TypeScript**. The application will be deployed on **Cloudflare Workers** and will serve as a middleware between client-side requests and an Airflow API. It will also handle webhooks from the Airflow server.

## Features

### 1. Client-Side Request Proxy

- The application will receive requests from the client side.
- An authentication layer will validate client requests using **JWT (JSON Web Token) Authentication**.
- All requests will be redirected to the Airflow API with basic authentication added.

### 2. Webhook Handling

- The application will receive webhooks from the Airflow server.
- An authentication layer will validate incoming webhook requests using a shared secret or token.

## Architecture

### Deployment

- The application will be deployed on **Cloudflare Workers** for serverless execution.

### Folder Structure

- **src/**: Contains the main application code.
   - **routes/**: Define all the application routes.
   - **middlewares/**: Middleware functions for request handling and authentication.
   - **helpers/**: Utility functions for authentication and request handling.
   - **types/**: Custom TypeScript type definitions.
   - **config/**: Configuration files for API keys, endpoints, and other settings.

- **tests/**: Unit and integration tests.
- **dist/**: Compiled JavaScript files for deployment.
- **.github/**: GitHub-specific configurations and workflows.

### Authentication

- **Client-Side Requests**: Validate requests using **JWT Authentication**. Clients will include a signed JWT in the `Authorization` header of each request. The proxy will validate the token's signature and claims.
- **Webhooks**: Validate incoming webhook requests using a shared secret or token.

### Request Flow

1. **Client-Side Requests**:
   - Validate the request using the authentication middleware.
   - Add basic authentication headers.
   - Redirect the request to the Airflow API.

2. **Webhooks**:
   - Validate the webhook request using the authentication middleware.
   - Process the webhook payload.

## Dependencies

- **Hono.js**: Web framework for building the application.
- **TypeScript**: For type safety and maintainability.
- **Cloudflare Workers**: For serverless deployment.
- **ESLint** and **Prettier**: For code linting and formatting.

## Additional Notes

- Ensure all dependencies are compatible with Cloudflare Workers.
- Document all helper functions and their usage in the `helpers/` folder.