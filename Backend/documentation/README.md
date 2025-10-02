# Backend Documentation - Zoo Website

## Overview

This document provides comprehensive information about the backend architecture and functionality of the zoo website. The backend serves as the foundation for all server-side operations, managing database connections, API endpoints, user authentication, and business logic for the zoo management system.

## Purpose

The backend is responsible for:
- Managing data flow between the database and frontend
- Providing secure API endpoints for frontend consumption
- Handling user authentication and authorization
- Processing business logic related to zoo operations
- Ensuring data consistency and security

## Quick Start

To run the backend locally:
1. Make sure you have Node.js installed
2. Install dependencies using `npm install`
3. Set up your environment variables in a `.env` file
4. Start the server with `node server.js`

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework for Node.js
- **PostgreSQL/MySQL**: Database management system
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Dotenv**: Environment variable management
- **Cors**: Cross-Origin Resource Sharing middleware
- **Body-parser**: Parsing incoming request bodies

## Repository Structure

```
├── server.js              # Main server file
├── .env                   # Environment variables
├── .env.example           # Example environment variables
├── package.json           # Project dependencies and scripts
├── schema.sql             # Database schema
├── setup-database.js      # Database setup script
├── check-config.js        # Configuration validation
├── documentation/         # Documentation files
```

## Key Features

- RESTful API endpoints for zoo management
- User authentication and role-based access control
- Data validation and sanitization
- Error handling and logging
- Database connection pooling
- Automated testing setup

## API Endpoints

For detailed API documentation, see the full documentation file.