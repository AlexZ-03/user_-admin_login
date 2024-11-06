A simple yet powerful web application for managing user accounts, built with Express.js, MongoDB, and Node.js. This project demonstrates how to create a role-based login system where admins can manage users, edit details, and delete accounts.


📋 Features
User Registration and Login: Secure authentication for users, with hashed passwords using bcrypt.
Admin Dashboard: Admin users can view, edit, and delete user accounts.
Role-Based Access Control: Only admin users have access to the dashboard and editing features.
Session Management: Persistent sessions using express-session to maintain login state.
Responsive Design: Clean, minimalistic interface for easy navigation and functionality.


🔧 Technologies Used
Backend: Express.js (Node.js)
Database: MongoDB
Templating: EJS
Authentication: bcrypt for password hashing
CSS Framework: Basic styling for the interface (optional to mention if any specific framework)

📁 Project Structure
- public/         # Static assets (CSS, images)
- src/            # Application logic
  - config/       # Configuration files
  - views/        # EJS templates (login, signup, dashboard, etc.)
  - JS/           # Server file (server.js)
- node_modules/   # Dependencies

  
🚀 Getting Started
Prerequisites
Node.js and npm installed on your local machine
MongoDB installed and running locally or in the cloud


Installation

Clone the repository:
git clone https://github.com/your-username/repository-name.git

Install dependencies:
cd repository-name
npm install
cd repository-name
npm install

Set up environment variables (create a .env file with your MongoDB URI and other necessary configurations).
Start the server:
npm start

Usage
Visit http://localhost:3000 to access the application.
Sign up as a user or log in as an admin to access the dashboard.

🤔 Why This Project?
This project helped me understand the basics of session handling, role-based access control, and CRUD operations with MongoDB. It also demonstrates how to secure user data with password hashing and manage user data efficiently with Express and MongoDB.
