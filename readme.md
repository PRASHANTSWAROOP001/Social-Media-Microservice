# Social Media Microservice

## Overview
This project is a **Social Media Microservice** designed to handle core functionalities of a social media platform, such as user management, posts, and search post. It is built to be scalable, efficient, and easy to integrate with other services.
It has multiple services.

## System Architecture
![Untitled-2024-04-13-0032 excalidraw](https://github.com/user-attachments/assets/4dda9223-ee1f-4cb3-a2f2-697a8e0fdbef)

## Features
- User authentication and authorization
- CRUD operations for posts and comments
- RESTful API endpoints
- Database integration for persistent storage
- Logging and error handling

## Prerequisites
- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **MongoDB** (or any other supported database)
- **Postman** (optional, for API testing)

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/social-media-microservice.git
    cd social-media-microservice
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    Create a `.env` file in the root directory and configure the following:
    ```
    PORT=3000
    DATABASE_URL=mongodb://localhost:27017/social-media
    JWT_SECRET=your_secret_key
    ```

4. Start the server:
    ```bash
    npm start
    ```

## API Endpoints
### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Authenticate a user

### Posts
- `GET /api/posts` - Fetch all posts
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post



## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Submit a pull request with a detailed description.

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For any questions or feedback, please contact:
- **Name:** Nishant Swaroop
- **Email:** your-email@example.com
- **GitHub:** [your-username](https://github.com/your-username)
