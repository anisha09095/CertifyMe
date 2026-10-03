# CertifyMe

### Certificate Management and Verification Portal

CertifyMe is a full-stack web application that provides a centralized platform for students to upload, manage, and track their academic or professional certificates, while allowing administrators to review and verify submitted certificates.

The application implements secure authentication, role-based authorization, certificate file management, and an administrator verification workflow using the MERN stack.

---

## Overview

Managing certificates through scattered files and manual verification processes can make it difficult to organize documents and track their verification status.

CertifyMe addresses this by providing separate workflows for **students** and **administrators**.

Students can:

- Create an account and log in securely
- Upload certificate documents
- View their submitted certificates
- Track certificate verification status
- Access their uploaded certificate files

Administrators can:

- Access a protected administrative dashboard
- View submitted certificates
- Review certificate details
- Verify certificates
- Reject certificates
- Update and maintain certificate verification status

---

## Key Features

### Student Features

- User registration and login
- JWT-based authentication
- Protected student dashboard
- Certificate upload
- Support for PDF, JPG, JPEG, and PNG files
- Maximum file size validation of 5 MB
- Certificate listing
- Certificate status tracking
- Secure access to uploaded certificate files

### Administrator Features

- Protected administrator access
- Role-based authorization
- Dedicated admin dashboard
- View submitted certificates
- Review certificate information
- Verify certificates
- Reject certificates
- Persistent verification status

### Security and Validation

- JWT authentication
- Role-based access control
- Protected API endpoints
- Certificate ownership validation
- File type validation
- File size validation
- Multer upload error handling
- Invalid certificate ID validation
- Cleanup of uploaded files when database operations fail
- Environment-variable based configuration
- Sensitive files excluded through `.gitignore`

---

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3

### Backend

- Node.js
- Express.js
- JSON Web Token (JWT)
- Multer

### Database

- MongoDB
- Mongoose

### Development Tools

- Visual Studio Code
- Git
- GitHub
- npm

---

## System Architecture

```text
                    +----------------------+
                    |     React Client     |
                    |      Vite + JS       |
                    +----------+-----------+
                               |
                               | REST API
                               v
                    +----------------------+
                    |    Express Server    |
                    |       Node.js        |
                    +----------+-----------+
                               |
              +----------------+----------------+
              |                                 |
              v                                 v
    +-------------------+             +-------------------+
    | JWT Authentication|             | Role Authorization|
    +-------------------+             +-------------------+
              |                                 |
              +----------------+----------------+
                               |
                               v
                    +----------------------+
                    |       MongoDB        |
                    |      Mongoose        |
                    +----------|------------+
                               |
                    +----------v-----------+
                    | Certificate Storage  |
                    |   server/uploads/    |
                    +----------------------+
```

---

## Application Workflow

### Student Workflow

```text
Register
   |
   v
Login
   |
   v
JWT Authentication
   |
   v
Student Dashboard
   |
   v
Upload Certificate
   |
   v
Certificate Stored
   |
   v
Track Verification Status
```

### Administrator Workflow

```text
Admin Login
    |
    v
JWT Authentication
    |
    v
Role Verification
    |
    v
Admin Dashboard
    |
    v
View Submitted Certificates
    |
    +------------------+
    |                  |
    v                  v
  Verify             Reject
    |                  |
    +--------+---------+
             |
             v
     Status Updated
```

---

## Certificate Verification Flow

```text
Student uploads certificate
            |
            v
     File validation
            |
            v
Certificate metadata stored
            |
            v
     Admin reviews file
            |
       +----+----+
       |         |
       v         v
    Verify     Reject
       |         |
       +----+----+
            |
            v
 Verification status
 updated in database
```

---

## Project Structure

```text
CertifyMe/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js
│
└── README.md
```

> `node_modules/`, `.env`, and uploaded certificate files are excluded from version control through `.gitignore`.

---

## Backend API

### Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate an existing user |

### Certificate Management

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/certificates/upload` | Upload a certificate |
| GET | `/api/certificates` | Retrieve certificates for the authenticated user |
| GET | `/api/certificates/:id/file` | Access a certificate file |

### Administration

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/certificates/admin` | Retrieve submitted certificates for administrators |
| PATCH | `/api/certificates/admin/:id/verify` | Verify a certificate |
| PATCH | `/api/certificates/admin/:id/reject` | Reject a certificate |

---

## Authentication and Authorization

CertifyMe uses **JSON Web Tokens (JWT)** for authentication.

After successful login:

1. The server authenticates the user's credentials.
2. A JWT is generated.
3. The client uses the token when accessing protected endpoints.
4. The authentication middleware validates the token.
5. The authenticated user's identity is attached to the request.
6. Administrative routes additionally verify the user's role.

Unauthorized requests receive an appropriate `401` response, while authenticated users without administrative privileges receive a `403` response for protected admin operations.

---

## File Upload Validation

Certificate uploads are validated before being processed.

### Supported Formats

```text
PDF
JPG
JPEG
PNG
```

### Maximum File Size

```text
5 MB
```

The backend also handles upload errors such as:

- Unsupported file types
- Files exceeding the size limit
- Invalid upload requests
- Failed database operations
- Invalid certificate IDs

If a certificate file is uploaded but its database record cannot be created, the uploaded file is removed to prevent orphaned files.

---

## Database

MongoDB is used for storing application data.

Mongoose provides the object modeling layer between the Node.js backend and MongoDB.

The database stores information required for:

- User accounts
- Authentication-related data
- Certificate metadata
- Certificate ownership
- Certificate verification status
- Administrative verification actions

Certificate files themselves are stored separately from their database metadata.

---

## Environment Configuration

Create a `.env` file inside the `server` directory.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

### Important

Do not commit the `.env` file to GitHub.

The project validates the required environment variables when the backend starts.

---

## Installation

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB or a MongoDB connection
- Git

---

### 1. Clone the Repository

```bash
git clone <repository-url>
cd CertifyMe
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

### 3. Configure Environment Variables

Create:

```text
server/.env
```

Add:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

---

### 4. Install Frontend Dependencies

Open another terminal and run:

```bash
cd client
npm install
```

---

## Running the Application

### Start the Backend

From the `server` directory:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

The API can be tested through:

```text
http://localhost:5000/
```

The root endpoint returns:

```json
{
  "message": "CertifyMe API is running"
}
```

---

### Start the Frontend

From the `client` directory:

```bash
npm run dev
```

Vite will provide the local frontend URL, normally:

```text
http://localhost:5173
```

---

## Security Measures

The project incorporates several backend security and validation mechanisms:

- JWT-based authentication
- Protected API routes
- Role-based authorization
- Authentication middleware
- Admin authorization middleware
- Certificate ownership checks
- File extension and MIME-type validation
- Maximum upload size restriction
- Invalid ObjectId validation
- Environment variable protection
- Upload directory exclusion from Git
- Dependency directory exclusion from Git
- Automatic cleanup of failed uploads

---

## Error Handling

The application handles common failure scenarios including:

- Missing authentication token
- Invalid authentication token
- Expired authentication token
- Unauthorized administrative access
- Invalid certificate ID
- Invalid certificate file type
- Certificate file exceeding the size limit
- Database connection failure
- Certificate upload failure

The API returns appropriate HTTP status codes and JSON error messages for these scenarios.

---

## Testing

The application has been tested across the major user and administrative workflows.

### Authentication Tests

- User registration
- User login
- Missing authentication token
- Invalid or expired authentication token

### Authorization Tests

- Protected certificate routes
- Student attempting administrative access
- Administrative verification access

### Certificate Tests

- Certificate upload
- Supported file types
- Invalid file type handling
- File-size validation
- Certificate listing
- Certificate file access
- Invalid certificate ID handling

### Administration Tests

- Admin certificate listing
- Certificate verification
- Certificate rejection
- Verification status persistence

### End-to-End Workflow

```text
Registration
      ↓
Login
      ↓
Certificate Upload
      ↓
Database Storage
      ↓
Admin Review
      ↓
Verify / Reject
      ↓
Updated Status
      ↓
Student Dashboard
```

---

## Current Project Status

The core CertifyMe application is implemented with the following functionality:

- Full-stack React and Node.js application
- MongoDB database integration
- User authentication
- JWT-based authorization
- Role-based administrative access
- Certificate upload and management
- Certificate file validation
- Admin verification workflow
- Admin rejection workflow
- Protected certificate access
- Backend validation and error handling
- Security-focused configuration
- End-to-end workflow testing

---

## Future Enhancements

Potential future improvements include:

- Cloud-based certificate storage
- QR-code based certificate verification
- Public certificate verification
- Certificate download functionality
- Email notifications
- Advanced search and filtering
- Certificate expiry tracking
- Audit logs
- Automated unit and integration testing
- Production deployment
- Advanced administrative analytics
- Improved monitoring and logging

---

## Learning Outcomes

This project provided practical experience with:

- MERN stack application development
- REST API design
- React frontend development
- Express.js backend development
- MongoDB and Mongoose
- JWT authentication
- Role-based authorization
- File upload handling with Multer
- API validation and error handling
- Git and GitHub workflow
- Full-stack application integration
- Security-conscious backend development

---

## License

This project was developed for academic and portfolio purposes.

---
