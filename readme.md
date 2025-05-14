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

---

## Identity / Auth Service

Handles user authentication and account creation.

### Features:
- JWT-based Access and Refresh Token system
- Two types of rate limiting:
  - `express-rate-limit` (in-memory)
  - IP-based Redis rate limiter (for DDoS protection)
- Secures sensitive endpoints with custom middleware

---

## Post Service

Handles creation, reading, updating, and deletion of posts.

### Key Features:
- Event-driven architecture using **RabbitMQ**
  - Publishes & consumes post-related events
  - Example: Updates post with image URLs after a `media-success` event
- Implements caching with **Redis**
  - `Get All Posts` API is optimized from ~220ms to 20–40ms
- Includes both `express-rate-limit` and Redis-based rate limiting

---

## Media Service

Manages file and image uploads.

### Key Features:
- Publishes `media.success` event when uploads complete
- Listens for `post.delete` events and deletes corresponding media
- Integrates seamlessly with Post Service via RabbitMQ

---

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

## Getting Started

Coming soon...

(Here you can include instructions like `docker-compose up` or individual service setup.)

---

## Postman Collection

> **Note**: All endpoints are accessible through the API Gateway. Postman documentation link will be added here once finalized.

---

## Notes

- This project is intended for learning and prototyping. Some parts (like production-grade validation, monitoring, security) are simplified.
- Services are tightly integrated via events, making them loosely coupled but coordinated.

---

## Future Improvements

- Add monitoring/logging
- Add Kubernetes/Docker Compose orchestration
- Add service-specific test suites
