# SLIIT MindEase - Stress Management System

A simple, modern User Management System for SLIIT students built with Node.js, Express, MongoDB, and React.

## 🏗️ Project Structure

```
Minduli/
├── backend/               # Node.js + Express API
│   ├── config/
│   │   └── db.js         # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   └── User.js       # User schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── userRoutes.js
│   ├── .env              # Environment variables
│   ├── .env.example      # Example env file
│   ├── package.json
│   └── server.js         # Main server file
│
└── frontend/             # React app
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── Landing.js
    │   │   ├── Register.js
    │   │   ├── Login.js
    │   │   ├── Dashboard.js
    │   │   ├── Profile.js
    │   │   └── AdminUsers.js
    │   ├── api.js        # API configuration
    │   ├── App.js        # Main app component
    │   ├── styles.css    # Global styles
    │   └── index.js
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or connection string)

### Backend Setup

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/sliit_mindease
   JWT_SECRET=your_secret_key_here
   ```

5. Start the server:
   ```bash
   npm run dev    # Development with nodemon
   # OR
   npm start      # Production
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the React app:
   ```bash
   npm start
   ```

   Frontend will run on `http://localhost:3000`

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### User Management
- `PUT /api/users/me` - Update own profile (Protected)
- `GET /api/users` - Get all users (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

## 👤 User Roles

- **Student** (default): Can view and edit their own profile
- **Admin**: Can manage all users and perform administrative tasks

## 🧪 Testing the Application

### 1. Register a User
```json
POST http://localhost:5000/api/auth/register
{
  "fullName": "John Doe",
  "email": "john@sliit.lk",
  "password": "Password123",
  "studentId": "IT21234567",
  "faculty": "Computing",
  "degreeProgram": "BSc (Hons) in IT",
  "year": 2
}
```

### 2. Login
```json
POST http://localhost:5000/api/auth/login
{
  "email": "john@sliit.lk",
  "password": "Password123"
}
```

### 3. Use the Token
Copy the token from login response and use it in headers:
```
Authorization: Bearer <your_token>
```

### 4. Create Admin User
To test admin features, manually update a user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "john@sliit.lk" },
  { $set: { role: "admin" } }
)
```

## 🎨 Features

### Frontend Pages
1. **Landing Page** (`/`) - Welcome page with system overview
2. **Register** (`/register`) - New user registration
3. **Login** (`/login`) - User authentication
4. **Dashboard** (`/dashboard`) - User home page with profile info
5. **Profile** (`/profile`) - View and edit user profile
6. **Admin Panel** (`/admin`) - User management (admin only)

### Key Features
- ✅ JWT authentication with localStorage
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Modern, responsive UI
- ✅ Clean gradient design
- ✅ Form validation
- ✅ Error handling
- ✅ Search and filter users (admin)

## 🎓 Student Notes

### Backend Architecture
- **MVC Pattern**: Models, Controllers, Routes separated
- **Middleware**: Authentication and authorization
- **JWT**: Token-based authentication (2-hour expiry)
- **bcrypt**: Password hashing
- **MongoDB**: NoSQL database with Mongoose ODM

### Frontend Architecture
- **React Router**: Client-side routing
- **Axios**: HTTP requests with interceptors
- **Protected Routes**: Authentication checks
- **Role-based rendering**: Show/hide based on user role
- **localStorage**: Token storage
- **CSS**: Custom styling (no frameworks)

## 🔐 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Role-based access control
- HTTP-only cookie support (in code)
- CORS enabled for frontend

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcrypt
- dotenv
- cors

### Frontend
- React
- React Router DOM
- Axios
- Plain CSS

## 📚 Learning Resources

- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- JWT: https://jwt.io/
- React: https://react.dev/
- React Router: https://reactrouter.com/

## 👨‍💻 Development Tips

1. Always keep backend and frontend running simultaneously
2. Check browser console for frontend errors
3. Check terminal for backend errors
4. Use MongoDB Compass to view database
5. Use Postman/Thunder Client to test API

## 🐛 Common Issues

**Port Already in Use:**
```bash
# Find process on port 5000
lsof -ti:5000 | xargs kill -9
```

**MongoDB Connection Failed:**
- Make sure MongoDB is running
- Check MONGO_URI in .env file

**CORS Errors:**
- Ensure backend CORS is configured for http://localhost:3000
- Check if both servers are running

## 📄 License

This is a student project for educational purposes.

---

**Created for:** SLIIT Stress Management System  
**Purpose:** User Management Backend & Frontend  
**Date:** 2026
