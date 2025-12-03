# 🔐 Local MFA API Guide

## Overview
This is a **completely offline** local API server that handles all MFA operations without any external dependencies or internet connection required.

## 🚀 Quick Start

### 1. Start the Server
```bash
node api-server.js
```

Or using npm:
```bash
npm start
```

The server will start at `http://localhost:3000`

### 2. Test the API
Open your browser and navigate to:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "success": true,
  "status": "running",
  "timestamp": 1234567890,
  "uptime": 123.45
}
```

## 📡 API Endpoints

### SMS OTP

#### Send SMS OTP
```http
POST /api/sms/send
Content-Type: application/json

{
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456",
  "expiresIn": 300
}
```

#### Verify SMS OTP
```http
POST /api/sms/verify
Content-Type: application/json

{
  "phone": "+1234567890",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification successful"
}
```

### Email OTP

#### Send Email OTP
```http
POST /api/email/send
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to email",
  "otp": "654321",
  "expiresIn": 300
}
```

#### Verify Email OTP
```http
POST /api/email/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "654321"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification successful"
}
```

### TOTP (Time-based OTP)

#### Setup TOTP
```http
POST /api/totp/setup
Content-Type: application/json

{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "secret": "JBSWY3DPEHPK3PXP",
  "otpauthUrl": "otpauth://totp/MFA Solutions:john_doe@mfasolutions.com?secret=JBSWY3DPEHPK3PXP&issuer=MFA Solutions&algorithm=SHA1&digits=6&period=30",
  "qrCodeData": "otpauth://..."
}
```

#### Generate TOTP Code
```http
POST /api/totp/generate
Content-Type: application/json

{
  "username": "john_doe"
}
```

**Response:**
```json
{
  "success": true,
  "code": "789012",
  "remainingSeconds": 25
}
```

#### Verify TOTP Code
```http
POST /api/totp/verify
Content-Type: application/json

{
  "username": "john_doe",
  "code": "789012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "TOTP verification successful"
}
```

### Biometric Authentication

#### Register Biometric
```http
POST /api/biometric/register
Content-Type: application/json

{
  "username": "john_doe",
  "biometricType": "fingerprint",
  "biometricData": "simulated"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric registered successfully",
  "userId": "a1b2c3d4e5f6..."
}
```

#### Verify Biometric
```http
POST /api/biometric/verify
Content-Type: application/json

{
  "username": "john_doe",
  "biometricType": "fingerprint"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric verification successful",
  "userId": "a1b2c3d4e5f6..."
}
```

## 🔧 JavaScript Integration Examples

### Using Fetch API

```javascript
// Send SMS OTP
async function sendSMSOTP(phone) {
    const response = await fetch('http://localhost:3000/api/sms/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    });
    
    const data = await response.json();
    console.log('OTP:', data.otp);
    return data;
}

// Verify SMS OTP
async function verifySMSOTP(phone, code) {
    const response = await fetch('http://localhost:3000/api/sms/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, code })
    });
    
    const data = await response.json();
    return data.success;
}

// Setup TOTP
async function setupTOTP(username) {
    const response = await fetch('http://localhost:3000/api/totp/setup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    console.log('Secret:', data.secret);
    console.log('QR Code URL:', data.otpauthUrl);
    return data;
}

// Generate TOTP
async function generateTOTP(username) {
    const response = await fetch('http://localhost:3000/api/totp/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
    });
    
    const data = await response.json();
    console.log('TOTP Code:', data.code);
    console.log('Expires in:', data.remainingSeconds, 'seconds');
    return data;
}
```

## ✨ Features

- ✅ **100% Offline** - No internet connection required
- ✅ **No External Dependencies** - Uses only Node.js built-in modules
- ✅ **CORS Enabled** - Works with any frontend
- ✅ **Real TOTP Implementation** - RFC 6238 compliant
- ✅ **In-Memory Storage** - Fast and simple
- ✅ **Error Handling** - Comprehensive error messages
- ✅ **Time Window Tolerance** - TOTP accepts ±30 seconds
- ✅ **OTP Expiration** - Automatic cleanup of expired codes

## 🔒 Security Notes

### For Development/Demo:
- This server is designed for **local development and demonstration**
- OTP codes are returned in responses for testing purposes
- Data is stored in memory and resets on server restart

### For Production:
If you want to use this in production, you should:
1. Never return OTP codes in API responses
2. Use a real database instead of in-memory storage
3. Add rate limiting to prevent brute force attacks
4. Implement proper authentication and authorization
5. Use HTTPS instead of HTTP
6. Add logging and monitoring
7. Implement proper session management
8. Add input validation and sanitization
9. Use environment variables for configuration
10. Add unit and integration tests

## 🛠️ Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the PORT in `api-server.js`:
```javascript
const PORT = 3001; // or any available port
```

### CORS Issues
The server has CORS enabled for all origins. If you still face issues:
1. Make sure the server is running
2. Check browser console for errors
3. Verify the API URL in your frontend code

### Node.js Not Found
Make sure Node.js is installed:
```bash
node --version
```

If not installed, download from: https://nodejs.org/

## 📝 Testing with cURL

```bash
# Health check
curl http://localhost:3000/api/health

# Send SMS OTP
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890"}'

# Verify SMS OTP
curl -X POST http://localhost:3000/api/sms/verify \
  -H "Content-Type: application/json" \
  -d '{"phone":"+1234567890","code":"123456"}'

# Setup TOTP
curl -X POST http://localhost:3000/api/totp/setup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Generate TOTP
curl -X POST http://localhost:3000/api/totp/generate \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'
```

## 🎯 Next Steps

1. Start the server: `node api-server.js`
2. Open `index.html` in your browser
3. The website will automatically connect to the local API
4. All MFA features will work completely offline!

## 📞 Support

For issues or questions:
- Email: parthxcore@gmail.com
- Phone: +91 870038xxxx

---

**Made with ❤️ for secure, offline MFA demonstrations**
