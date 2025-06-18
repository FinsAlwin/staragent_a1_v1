const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('Generated JWT Secret:');
console.log(jwtSecret);
console.log('\nAdd this to your AWS Amplify environment variables:');
console.log('Key: JWT_SECRET');
console.log(`Value: ${jwtSecret}`); 