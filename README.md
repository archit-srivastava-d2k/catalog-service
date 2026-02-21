# Catalog Service

A microservice for managing product categories, built with the **MERN stack** (MongoDB, Express, Node.js) using **TypeScript**.

## Goal

The Catalog Service is designed to serve as the product catalog backbone of a larger microservices-based e-commerce platform. Its primary responsibilities are:

- **Category Management** — Provide a robust API for creating and managing product categories, including flexible price configurations and dynamic attributes.
- **Secure Access** — Enforce role-based access control (RBAC) so that only authorized users (e.g., admins) can create or modify categories.
- **Scalability** — Run as an independent, containerized microservice that can be deployed and scaled on its own.

## What Has Been Done

### Core API

- **POST `/categories`** — Create a new product category with a name, price configuration (base/additional pricing with available options), and custom attributes (switch/radio widgets).

### Authentication & Authorization

- **JWT Authentication** — Integrated `express-jwt` with `jwks-rsa` to validate JSON Web Tokens using RS256 and a remote JWKS endpoint.
- **Cookie & Bearer Token Support** — The authenticate middleware extracts tokens from either the `Authorization` header or an `accessToken` cookie via `cookie-parser`.
- **Role-Based Access Control** — A `canAccess` middleware restricts endpoints by user role. Category creation is locked to the **Admin** role.

### Data Layer

- **MongoDB with Mongoose** — Category schema includes nested sub-schemas for `PriceConfiguration` and `Attribute`, supporting a flexible, map-based price configuration.

### Middleware & Error Handling

- **Global Error Handler** — Centralized error handler that assigns a unique error ID (UUID) to every error, logs the full stack trace, and returns a structured JSON response. Sensitive details are hidden in production.
- **Async Wrapper** — A utility that wraps async route handlers to catch unhandled promise rejections and forward them to the error handler.
- **Request Validation** — `express-validator` rules enforce that required fields (`name`, `priceConfiguration`, `attributes`) are present and correctly typed.

### Developer Experience

- **TypeScript** — Strict type-checking across the entire codebase.
- **ESLint & Prettier** — Linting and formatting enforced via `lint-staged` and a Husky pre-commit hook.
- **Testing** — Jest + Supertest setup for unit and integration tests.
- **Docker** — Separate Dockerfiles for development (with hot-reload via `nodemon`) and production (multi-stage build for a lean image).

## Approach

1. **Microservice Architecture** — The catalog service is a standalone microservice with its own database, decoupled from authentication and other services. It validates JWTs issued by an external auth service via a JWKS endpoint.
2. **Layered Design** — The codebase follows a clean separation of concerns:
   - **Router** → defines routes and wires up middleware
   - **Controller** → handles request/response logic and validation
   - **Service** → encapsulates business logic and database operations
   - **Model** → defines the Mongoose schema and data shape
   - **Types** → shared TypeScript interfaces
3. **Security First** — Every mutating endpoint is protected behind authentication and authorization middleware before any business logic runs.
4. **Configuration Driven** — Server port, JWKS URI, and other settings are managed through the `config` package, keeping environment-specific values out of the source code.

## Tech Stack

| Layer            | Technology                          |
| ---------------- | ----------------------------------- |
| Runtime          | Node.js 18+                         |
| Language         | TypeScript                          |
| Framework        | Express.js                          |
| Database         | MongoDB (Mongoose ODM)              |
| Authentication   | express-jwt, jwks-rsa (RS256 / JWKS)|
| Validation       | express-validator                   |
| Logging          | Winston                             |
| Testing          | Jest, Supertest                     |
| Containerization | Docker                              |
| Code Quality     | ESLint, Prettier, Husky, lint-staged|

## Getting Started

### Prerequisites

- Node.js ≥ 18 (see `.nvmrc`)
- MongoDB instance
- A running auth service that exposes a JWKS endpoint

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build & Run (Production)

```bash
npm run build
node dist/src/server.js
```

### Docker

```bash
# Development
docker build -f docker/dev/Dockerfile -t catalog-service:dev .
docker run -p 5502:5502 catalog-service:dev

# Production
docker build -f docker/prod/Dockerfile -t catalog-service:prod .
docker run -p 5500:5500 catalog-service:prod
```

### Testing

```bash
npm test
```

## Project Structure

```
src/
├── app.ts                          # Express app setup
├── server.ts                       # Server bootstrap & DB connection
├── catagory/
│   ├── category-controller.ts      # Request handling
│   ├── category-model.ts           # Mongoose schema
│   ├── category-router.ts          # Route definitions
│   ├── category-service.ts         # Business logic
│   ├── category-types.ts           # TypeScript interfaces
│   └── category-validator.ts       # Validation rules
└── common/
    ├── constants/index.ts           # Role constants
    ├── middlewares/
    │   ├── authenticate.ts          # JWT authentication
    │   ├── canAccess.ts             # Role-based authorization
    │   └── globalErrorHandler.ts    # Centralized error handler
    ├── types/index.ts               # Shared types
    └── utils/wrapper.ts             # Async handler wrapper
```

## Author

Archit
