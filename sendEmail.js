const { google } = require('googleapis');
const nodemailer = require('nodemailer');
require('dotenv').config(); // Load .env variables

// OAuth2 Client
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

// Set credentials
oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN
});

// Get access token
async function getAccessToken() {
  const accessToken = await oauth2Client.getAccessToken();
  //console.log("Access Token: ", accessToken.token);  // Log access token
  console.log("Access Token generated");  // Keep this message, but avoid showing the token
  return accessToken.token;
}

// Function to send email
async function sendEmail(to, subject, text) {
  const accessToken = await getAccessToken();

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    //console.log('Email sent:', result);
    console.log('Email sent:', result.response); // Only log the response, not the entire result
  } catch (error) {
    //console.error('Error sending email:', error);
    console.error('Error sending email:', error.message); // Log only the error message
    throw error; // Propagate error to be handled in the route
  }
}

module.exports = sendEmail; // Export the sendEmail function   
