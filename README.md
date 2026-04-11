# SwachhMitra - Frontend & Backend Integration

This project includes both frontend (React) and backend (Node.js/Express) components for the SwachhMitra application with complete user authentication.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (already created) with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/swachhmitra
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   ```

4. Start the backend server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:5173`

## 🔧 Features Implemented

### Backend Features
- ✅ User Registration API (`POST /api/auth/register`)
- ✅ User Login API (`POST /api/auth/login`)
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ MongoDB integration with Mongoose
- ✅ Input validation and error handling
- ✅ CORS enabled for frontend connection

### Frontend Features
- ✅ React Context for authentication state management
- ✅ Axios service for API communication
- ✅ Login form with backend integration
- ✅ Registration form with validation
- ✅ Protected routes (ready for implementation)
- ✅ Dynamic navbar with login/logout functionality
- ✅ Success/error message handling
- ✅ Responsive design

## 📡 API Endpoints

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login User**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

## 🗂️ Project Structure

```
swatchmitra/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── authController.js   # Authentication logic
│   ├── models/
│   │   └── User.js            # User schema
│   ├── routes/
│   │   └── auth.js            # Auth routes
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js             # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── SuccessMessage.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
└── README.md
```

## 🔐 Authentication Flow

1. **Registration**: User fills out registration form → Frontend sends data to backend → Backend hashes password and saves user → Success message shown
2. **Login**: User enters credentials → Frontend sends to backend → Backend validates and returns JWT token → Token stored in localStorage → User redirected to home
3. **Protected Routes**: Token automatically included in API requests → Backend validates token → Access granted/denied accordingly
4. **Logout**: Token removed from localStorage → User state cleared → Redirected to login

## 🎯 Next Steps

- Add protected routes for authenticated users
- Implement user profile management
- Add password reset functionality
- Create admin dashboard
- Add more user features (dashboard, settings, etc.)

## 🐛 Troubleshooting

- **Backend not starting**: Make sure MongoDB is running locally
- **CORS errors**: Ensure backend is running on port 5000
- **Frontend not connecting**: Check that both servers are running and backend URL is correct in authService.js

## 📋 Development Report

### Question 1: MongoDB Usage and Authentication Implementation

**MongoDB Integration:**
- **Database Connection**: `backend/config/db.js` (Lines 1-28)
  - Uses Mongoose ODM to connect to MongoDB
  - Connection string: `mongodb://localhost:27017/swachhmitra`
  - Includes error handling and troubleshooting logs

**User Model Schema**: `backend/models/User.js` (Lines 1-47)
- **Fields**: name, email, password, createdAt
- **Password Hashing**: Automatic bcrypt hashing before save (Lines 31-39)
- **Password Comparison**: Custom method for login validation (Lines 42-44)
- **Validation**: Email format validation, required fields, length constraints

**Authentication Flow**:
1. **Registration**: `backend/controllers/authController.js` (Lines 12-56)
   - Checks for existing user by email
   - Creates new user with hashed password
   - Returns user data (excluding password)

2. **Login**: `backend/controllers/authController.js` (Lines 58-104)
   - Validates email and password
   - Generates JWT token (30-day expiry)
   - Returns token and user data

3. **JWT Token Generation**: `backend/controllers/authController.js` (Lines 4-9)
   - Uses JWT_SECRET from environment variables
   - 30-day token expiration

### Question 2: Server.js and Backend-Frontend Connection

**Server.js Purpose**: `backend/server.js` (Lines 1-35)
- **Main Application Entry Point**: Sets up Express server
- **Middleware Configuration**: 
  - `express.json()` for parsing JSON requests
  - `cors()` for cross-origin requests from frontend
- **Database Connection**: Calls `connectDB()` function
- **Route Mounting**: `/api/auth` routes for authentication
- **Port Configuration**: Uses environment variable PORT (default: 5000)

**Backend-Frontend Connection**:
- **CORS Enabled**: Allows frontend (localhost:5173) to communicate with backend (localhost:5000)
- **API Endpoints**: 
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/profile` - Get user profile (protected)
- **JWT Authentication**: Token-based authentication for protected routes
- **Error Handling**: Comprehensive error responses with success/failure status

### Question 3: Complete Backend Files and Code Explanation

**1. server.js** (Main Application File)
```javascript
// Lines 1-35: Express server setup
- Express framework initialization
- CORS middleware for frontend communication
- JSON parsing middleware
- Database connection initialization
- Route mounting for authentication
- Server startup on configured port
```

**2. config/db.js** (Database Configuration)
```javascript
// Lines 1-28: MongoDB connection setup
- Mongoose connection to MongoDB
- Environment variable validation
- Connection error handling
- Troubleshooting guidance for connection issues
```

**3. models/User.js** (User Schema Definition)
```javascript
// Lines 1-47: User data model
- Mongoose schema definition
- Field validation (name, email, password)
- Pre-save middleware for password hashing
- Password comparison method for authentication
- Email format validation with regex
```

**4. controllers/authController.js** (Authentication Logic)
```javascript
// Lines 1-136: Authentication business logic
- registerUser(): User registration with duplicate check
- loginUser(): User login with password validation
- getUserProfile(): Protected route for user data
- generateToken(): JWT token creation
- Comprehensive error handling for all operations
```

**5. routes/auth.js** (API Route Definitions)
```javascript
// Lines 1-23: Route configuration
- POST /register: Public registration endpoint
- POST /login: Public login endpoint
- GET /profile: Protected profile endpoint (requires auth middleware)
- Route documentation with access levels
```

**6. middleware/auth.js** (JWT Authentication Middleware)
```javascript
// Lines 1-38: Token validation middleware
- JWT token extraction from Authorization header
- Token verification using JWT_SECRET
- User lookup and validation
- Request object enhancement with user data
- Error handling for invalid/expired tokens
```

**7. package.json** (Dependencies and Scripts)
```json
// Lines 1-23: Project configuration
- Dependencies: express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv
- Development: nodemon for auto-restart
- Scripts: npm start for development server
```

**Key Dependencies Used**:
- **Express**: Web framework for Node.js
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing and comparison
- **jsonwebtoken**: JWT token generation and verification
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management

**Authentication Security Features**:
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with 30-day expiration
- Protected routes with middleware authentication
- Input validation and sanitization
- Error handling without exposing sensitive information