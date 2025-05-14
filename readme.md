# Social Media Microservices Project

## Introduction

This project is built to learn and implement a microservices architecture using Node.js. It simulates a **social media platform** with four core services, all managed behind a central **API Gateway**.

The project covers key microservices concepts such as service communication, event-based architecture, caching, rate limiting, and JWT-based authentication.

---

## System Architecture
![Diagram](https://github.com/user-attachments/assets/4dda9223-ee1f-4cb3-a2f2-697a8e0fdbef)

### Services Overview

- **API Gateway**: Routes incoming requests to the appropriate service.
- **Identity (Auth) Service**: Handles authentication and user account creation.
- **Post Service**: Manages post CRUD operations and integrates with media & messaging systems.
- **Media Service**: Handles file/media uploads and event-based syncing.
- **Search Service**: Enables searching of posts.

---

## API Gateway

- Built with `express-http-proxy`
- Acts as the entry point for all client requests
- Verifies authentication using middleware before forwarding to secure routes



## Identity / Auth Service

Handles user authentication and account creation.

### Features:
- JWT-based Access and Refresh Token system
- Two types of rate limiting:
  - `express-rate-limit` (in-memory)
  - IP-based Redis rate limiter (for DDoS protection)
- Secures sensitive endpoints with custom middleware



## Post Service

Handles creation, reading, updating, and deletion of posts.

### Key Features:
- Event-driven architecture using **RabbitMQ**
  - Publishes & consumes post-related events
  - Example: Updates post with image URLs after a `media-success` event
- Implements caching with **Redis**
  - `Get All Posts` API is optimized from ~220ms to 20–40ms
- Includes both `express-rate-limit` and Redis-based rate limiting



## Media Service

Manages file and image uploads.

### Key Features:
- Publishes `media.success` event when uploads complete
- Listens for `post.delete` events and deletes corresponding media
- Integrates seamlessly with Post Service via RabbitMQ


## Search Service

Provides search functionality over posts.

---

## Rate Limiting

Most services implement both:
- **Express rate limiting** (basic in-memory)
- **Redis-based IP rate limiting** (for distributed and DDoS protection)

---

## Tech Stack & Dependencies

### Core:
- Node.js
- Express.js

### Messaging & Caching:
- **RabbitMQ** – Message broker for async communication
- **Redis** – Used for caching and rate limiting

---

## Project Folder Structure

The project is organized as follows:

```
.
├── api-gateway/          # API Gateway service
├── identity-service/     # Authentication and user management service
├── post-service/         # Post CRUD operations service
├── media-service/        # Media upload and management service
├── search-service/       # Search functionality service
├── docker-compose.yml    # Docker Compose configuration file
└── README.md             # Project documentation
```

Each service folder contains its own `package.json`, `.env`, and other necessary files for independent operation.

## 🛠️ Getting Started

You can run this project using Docker Compose or manually, depending on your setup.

## 🚀 Option 1: Run with Docker

### ✅ Prerequisites
Ensure you have the following installed:
- Docker
- Docker Compose

### ▶️ Run the App
To build and start all services, run the following command:

```bash
docker-compose up --build
```

This will:
- Build and start all services (API Gateway, Identity, Post, Media, Search)
- Start Redis and RabbitMQ with their management dashboards
- Expose the API Gateway on [http://localhost:3000](http://localhost:3000)

### 🐰 Access RabbitMQ Dashboard
- **URL**: [http://localhost:15672](http://localhost:15672)
- **Default username/password**: `guest` / `guest`

---

## ⚙️ Option 2: Run Without Docker (Manual Setup)

If you prefer to run the services manually, follow these steps:

### 1. Start Redis and RabbitMQ
You must have both Redis and RabbitMQ running locally. Use the following commands:

```bash
# Start Redis
redis-server

# Start RabbitMQ
rabbitmq-server
```

Alternatively, you can use Docker to run Redis and RabbitMQ:

```bash
# Run Redis
docker run -p 6379:6379 redis

# Run RabbitMQ with management dashboard
docker run -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

---

### 2. Install Dependencies and Run Each Service
Each service has its own `package.json` and `.env` file. Navigate into each service folder and run the following commands:

```bash
# Example for Identity Service
cd identity-service
npm install
npm start
```

Repeat the above steps for the following services:
- `post-service`
- `media-service`
- `search-service`
- `api-gateway`

---

### 🔁 Configuration
Ensure all `.env` files are correctly configured with your local Redis and RabbitMQ URLs.
For reference each service has their own `.env.sample` file. 🙂


---

## Postman Collection

> **Note**: This project is not deployed. The Postman documentation serves as a reference to help users easily interact with the API without manually figuring out endpoints, request formats, or required data.

### Postman Documentation
- **Placeholder Link**: [Postman Collection](#) (Link will be updated once finalized)
- Import the collection into Postman to explore and test the API endpoints.
- All endpoints are accessible through the API Gateway.

---

## Notes

- This project is intended for learning and prototyping. Some parts (like production-grade validation, monitoring, security) are simplified.
- Services are tightly integrated via events, making them loosely coupled but coordinated.

---

## Event-Driven Architecture Documentation

To better understand the event-driven architecture implemented in this project, detailed documentation is being prepared in Notion. This documentation will explain the flow of events, how services communicate asynchronously, and the role of RabbitMQ in this architecture.

## Notion Blogpost
### Event-Driven Architecture Documentation

To dive deeper into the event-driven architecture of this project, check out the detailed documentation on Notion:

- **[Event-Driven Architecture Docs: How Social Media Handles Media Uploads](https://iodized-chicken-170.notion.site/How-Social-Media-Handles-Media-Uploads-My-Journey-into-Event-Driven-Architecture-1f2a25b101b68081a0d5e24ca9a1e1d2?pvs=74)**

This resource includes:
- Diagrams and flowcharts explaining the event-driven system.
- Code snippets and examples for better understanding.
- Best practices and scaling strategies for event-driven systems.

Stay tuned for updates as the documentation evolves!

## Future Improvements

- Add monitoring/logging
- Add Kubernetes/Docker Compose orchestration
- Add service-specific test suites
