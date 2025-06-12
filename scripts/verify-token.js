const dbConnect = require('../lib/db');
const User = require('../models/User');

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODQ5NjBjM2JlZGJkNmRjYjhiNDRhMTIiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImV4cCI6MTc1MjIzNjE0NSwiaWF0IjoxNzQ5NjQ0MTQ1fQ.0rZG3AlpYZghX-CQGDhNZO99tYqmfaXAQjolKFrtelI";

async function verifyToken() {
  try {
    await dbConnect();
    const user = await User.findOne({ token });
    
    if (!user) {
      console.log('Token not found in database');
      return;
    }
    
    console.log('Token found for user:', {
      id: user._id,
      email: user.email,
      tokenExpiry: user.tokenExpiry
    });
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit();
}

verifyToken(); 