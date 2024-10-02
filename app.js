const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middlewares/verifyToken'); // Adjust the path if necessary
const User = require('./models/User'); // Import the User model
const path = require('path'); // Import path module
const app = express();


//connecting backend to frontend
const cors = require('cors');

// const corsOptions = {
//     origin: 'https://signup-login-frontend-murex.vercel.app/',
//     optionsSuccessStatus: 200
// };

// app.use(cors(corsOptions));


app.use(cors());





//This middleware ensures that form data is properly parsed.
app.use(express.urlencoded({ extended: true }));



// Middleware to parse incoming JSON data
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


// // MongoDB Connection
// mongoose.connect('mongodb://localhost:27017/signupApp')
//     .then(() => console.log('MongoDB Connected'))
//     .catch(err => console.log('MongoDB Connection Error: ', err));


// MongoDB Atlas Connection
mongoose.connect(process.env.DB_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error: ', err));



// Routes
app.use('/auth', authRoutes);

// Protected profile route to fetch user data
app.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password'); // Fetch user and exclude password
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            username: user.username,
            email: user.email
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user data' });
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
