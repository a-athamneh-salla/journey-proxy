# TODO List for Salla Proxy Application

## Milestone 1: Project Setup

- [x] Initialize a new Hono.js project with TypeScript.
- [x] Set up the project structure as per the guidelines:
   - **src/**: Main application code.
   - **routes/**: Define all application routes.
   - **middlewares/**: Middleware functions for request handling and authentication.
   - **helpers/**: Utility functions for authentication and request handling.
   - **types/**: Custom TypeScript type definitions.
   - **config/**: Configuration files for API keys, endpoints, and other settings.

- [x] Install necessary dependencies (Hono.js, TypeScript, ESLint, Prettier, etc.).
- [x] Configure `wrangler.toml` for Cloudflare Workers deployment.

## Milestone 2: Authentication Middleware

- [x] Implement JWT authentication middleware for client-side requests.
- [x] Validate JWT tokens for signature and claims.
- [x] Implement shared secret authentication for webhook requests.
- [x] Write unit tests for authentication middleware.

## Milestone 3: Proxy Client-Side Requests

- [x] Create a route to handle `/proxy` requests.
- [x] Add support for POST, PUT, PATCH, and GET methods.
- [x] Implement logic to redirect requests to the Airflow API.
- [x] Add basic authentication headers to requests forwarded to the Airflow API.
- [x] Write unit tests for the `/proxy` route.

## Milestone 4: Handle Webhooks

- [x] Create a route to handle `/webhook` requests.
- [x] Validate incoming webhook requests using the shared secret.
- [x] Process and log webhook payloads.
- [x] Write unit tests for the `/webhook` route.

## Milestone 5: Deployment

- [x] Build the application for production.
- [x] Deploy the application to Cloudflare Workers.
- [x] Test the deployed application to ensure all routes and authentication layers work as expected.

## Milestone 6: Documentation

- [x] Write a comprehensive README file:
   - Overview of the application.
   - Installation and setup instructions.
   - Deployment steps.
   - API documentation.
   - Testing instructions.

- [x] Document all helper functions and their usage in the `helpers/` folder.

## Milestone 7: Final Testing and QA

- [x] Run all unit tests and ensure 100% pass rate.
- [x] Perform end-to-end testing for all routes and features.
- [x] Fix any bugs or issues identified during testing.

## Milestone 8: Review and Optimization

- [x] Review the code for adherence to TypeScript best practices.
- [x] Optimize the application for performance and scalability.
- [x] Ensure compatibility with Cloudflare Workers.

## Milestone 9: Handover

- [x] Finalize all documentation.
- [x] Prepare the application for handover to the client or deployment team.

## Milestone 10: Database Integration

- [x] Configure D1 database integration.
- [x] Create database schema for users and API keys.
- [x] Implement user management functionality.
- [x] Create utility scripts for user and credentials management.