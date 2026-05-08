const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan'); 

// 1. Environment Variables Configuration
require('dotenv').config({ path: path.join(__dirname, '.env') });
console.log('--- Server Startup ---');
console.log('Environment Variables Loaded:');
console.log('PORT:', process.env.PORT || 5000);
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded (hidden for security)' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded (hidden for security)' : 'Missing');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Loaded (hidden for security)' : 'Missing');

const app = express();

// 18. Middleware
const allowedOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'];
console.log('Allowed CORS Origins:', allowedOrigins);

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json({ extended: false }));
app.use(morgan('dev')); // Log incoming requests

// Check optional environment variables
if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY.includes('placeholder')) {
    console.warn('⚠️ WARNING: GROQ_API_KEY is missing or invalid. Chatbot feature will be disabled.');
}

// 3. Database Connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tourismDB';
console.log(`Connecting to Mongo... (${mongoUri.substring(0, 20)}...)`);

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        console.warn('⚠️ The backend is running, but DB operations will fail until MongoDB is active.');
    }
};

const startServer = async () => {
    // 3. Database Connection
    await connectDB();

    // 4. Define Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/guides', require('./routes/guideRoutes'));
    app.use('/api/bookings', require('./routes/bookingRoutes'));
    app.use('/api/reviews', require('./routes/reviewRoutes'));
    app.use('/api/chatbot', require('./routes/chatbotRoutes'));
    app.use('/api/travel', require('./routes/travelRoutes'));

    // 🚩 404 JSON Fallback
    app.use((req, res) => {
        console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
        res.status(404).json({ 
            reply: 'Endpoint not found. Please check your API URL.',
            error: 'Not Found' 
        });
    });

    // 🚩 5. Global JSON Error Handler
    app.use((err, req, res, next) => {
        console.error('❌ Server Error:', err.stack);
        res.status(err.status || 500).json({ 
            reply: 'Internal Server Error. Please try again later.',
            error: err.message 
        });
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend Server running on http://0.0.0.0:${PORT}`));
};

// Fire it up
startServer();
