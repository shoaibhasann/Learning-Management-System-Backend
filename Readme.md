# Learning Management System Backend

Welcome to the Learning Management System (LMS) backend project! This project provides API endpoints for user registration, login, course management, and lecture management. It includes authentication and authorization to differentiate between regular users and administrators. Administrators have additional privileges to create, update, and delete courses, as well as add and delete lectures.

## Project Structure

The project consists of two main parts - user routes and course routes. The user routes handle user authentication, while the course routes manage course and lecture data.

### User Routes

- `/register` (POST): Register a new user with optional avatar upload.
- `/login` (POST): Log in to an existing user account.
- `/logout` (GET): Log out the currently logged-in user.
- `/me` (GET): Get the profile of the currently logged-in user.
- `/forgot-password` (POST): Request a password reset link to the user's email.
- `/reset/:resetToken` (POST): Reset the user's password using the provided reset token.
- `/change-password` (POST): Change the user's password after authentication.
- `/update` (PUT): Update the user's profile information with optional avatar upload.

### Course Routes

- `/` (GET): Get all available courses.
- `/` (POST): Create a new course (Admin privilege required).
- `/:id` (GET): Get lectures for a specific course.
- `/:id` (PUT): Update an existing course (Admin privilege required).
- `/:id` (DELETE): Delete an existing course (Admin privilege required).
- `/:id` (POST): Add a new lecture to an existing course (Admin privilege required).
- `/:courseId/lecture/:lectureId` (DELETE): Delete a lecture from an existing course (Admin privilege required).

## Authentication and Authorization

Authentication is implemented using email and password-based login, and password reset functionality. Authorization is based on user roles, with two roles: "User" and "Admin."

- Regular users (non-admins) have limited access and can register, log in, view courses, update their profile, and manage their own data.
- Admins have additional privileges and can create, update, and delete courses, as well as add and delete lectures.

## Middleware

The project uses middleware functions to handle file uploads (for avatar and lecture thumbnails) , to check if a user is logged in (for protected routes) , and to check authorized roles.

This Learning Management System (LMS) backend project is built using the following tech stack and libraries:

## Tech Stack:

- **Node.js:** A JavaScript runtime environment that allows running server-side JavaScript code.
- **Express.js:** A web application framework for Node.js that simplifies routing, middleware handling, and other common web application functionalities.
- **MongoDB:** A NoSQL database that stores data in a JSON-like format, making it flexible and scalable.
- **Mongoose:** An Object Data Modeling (ODM) library for MongoDB that provides a schema-based solution to model application data.
- **Cloudinary:** A cloud-based service for managing and serving images and other media files efficiently.
- **JSON Web Token (jsonwebtoken):** A library for generating and verifying JSON Web Tokens, used for user authentication and authorization.
- **Multer:** A middleware for handling multipart/form-data, used for file uploads (avatar and lecture thumbnails).
- **Node Mailer:** A library for sending emails from Node.js applications, used for password reset functionality.
- **Cookie-Parser:** A middleware for parsing cookies in the incoming requests.
- **bcryptjs:** A library for hashing passwords securely, used for storing user passwords.
- **crypto:** A Node.js native library used for generating random tokens for password reset functionality.
- **dotenv:** A library for reading environment variables from a .env file, used for managing configuration settings.
- **CORS (Cross-Origin Resource Sharing):** A middleware that enables cross-origin requests between different domains.
- **Morgan:** A middleware for logging HTTP requests, used for development and debugging purposes.
- **Nodemon:** A development dependency that automatically restarts the server on code changes, making the development process more efficient.

## Library Versions (at the time of project development): All are Latest Versions 

## Getting Started

To get started with the Learning Management System backend, follow these steps:

1. Clone the repository and navigate to the project directory.
2. Install the required dependencies using `npm install`.
3. Set up your database and configure the environment variables for database connection and other settings.
4. Run the application using `npm start` or `node server.js`.
5. Access the API endpoints to interact with the system based on the provided documentation.

Remember to set appropriate environment variables and configure your database to make the application work seamlessly.

# Contributions

Contributions to this project are welcome. Feel free to open issues or submit pull requests to improve the project.