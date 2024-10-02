
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

//-------------------//
const sendEmail = require('../sendEmail'); // Update the path as necessary
// Forgot Password Handler
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Check if the user exists in the database
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Generate a token (JWT or custom token)
    // When generating a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send email with password reset link
    try {
        await sendEmail(email, 'Password Reset', `Click this link to reset your password: http://localhost:3000/auth/reset-password?token=${token}`);
        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send email' });
    }
});
//-------------------//






//---------------------Add a Route to Serve the Reset Password Form:----------------------//
router.get('/reset-password', (req, res) => {
    const token = req.query.token;

    if (!token) {
        return res.status(400).send('Invalid or expired token.');
    }

    // // Serve an HTML form where the user can enter a new password
    // res.send(`
    //     <form action="/auth/reset-password" method="POST">
    //         <input type="hidden" name="token" value="${token}" />
    //         <label for="newPassword">Enter new password:</label>
    //         <input type="password" id="newPassword" name="newPassword" required />
    //         <button type="submit">Reset Password</button>
    //     </form>
    // `);

    // Serve an HTML form where the user can enter a new password with styling
    res.send(`
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f9;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .reset-container {
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                    width: 300px;
                    text-align: center;
                }
                .reset-container h2 {
                    margin-bottom: 20px;
                }
                .reset-container label {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: bold;
                }
                .reset-container input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    border: 1px solid #ccc;
                }
                .reset-container button {
                    width: 100%;
                    padding: 10px;
                    background-color: #28a745;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .reset-container button:hover {
                    background-color: #218838;
                }
            </style>
        </head>
        <body>
            <div class="reset-container">
                <h2>Reset Your Password</h2>
                <form action="/auth/reset-password" method="POST">
                    <input type="hidden" name="token" value="${token}" />
                    <label for="newPassword">Enter New Password:</label>
                    <input type="password" id="newPassword" name="newPassword" required />
                    <button type="submit">Reset Password</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

//---------------------Add a Route to Serve the Reset Password Form:----------------------//


//---------------------Add a POST Route to Handle Password Reset:----------------------//
router.post('/reset-password', async (req, res) => {

    // // Log received token and password for debugging
    // console.log("Token:", req.body.token);
    // console.log("New Password:", req.body.newPassword);


    const { token, newPassword } = req.body;



    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token or new password is missing.' });
    }

    // Log that a password reset attempt is being made
    console.log("Password reset attempt received");

    // Verify the token
    try {
        // console.log("Token received:", token);
        console.log("Verifying token...");

        // When verifying a token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

         // Log successful password reset without showing sensitive data
         console.log("Password reset successful for user:", userId);

        //res.status(200).json({ message: 'Password reset successful!' });
         // Render a success page or send a success message as HTML
         res.status(200).send(`
            <html>
                <head>
                    <title>Password Reset Success</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            text-align: center;
                            padding: 50px;
                        }
                        h2 {
                            color: #4CAF50;
                        }
                        a {
                            text-decoration: none;
                            color: #ffffff;
                            background-color: #4CAF50;
                            padding: 10px 20px;
                            border-radius: 5px;
                        }
                    </style>
                </head>
                <body>
                    <h2>Password reset successful!</h2>
                    <p>Your password has been successfully updated. You can now log in with your new password.</p>
                    <a href="/login">Go to Login</a>
                </body>
            </html>
        `);
    } catch (error) {
        //return res.status(400).json({ message: 'Invalid or expired token.' });
        return res.status(400).send('<h2>Invalid or expired token.</h2>');
    }
});

//---------------------Add a POST Route to Handle Password Reset:----------------------//





// Signup Route
router.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
        username,
        email,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1h' });
    res.json({ token });
});



module.exports = router;
