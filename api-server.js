// Local MFA API Server - Works completely offline
// Run with: node api-server.js

const http = require('http');
const crypto = require('crypto');

const PORT = 3000;

// In-memory storage
const storage = {
    users: new Map(),
    otpCodes: new Map(),
    totpSecrets: new Map(),
    sessions: new Map()
};

// CORS headers for local development
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
};

// Generate random OTP
function generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length))
        .toString()
        .padStart(length, '0');
}

// Generate TOTP secret (base32)
function generateTOTPSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const bytes = crypto.randomBytes(20);
    
    for (let i = 0; i < 32; i++) {
        secret += chars[bytes[i % 20] % 32];
    }
    
    return secret;
}

// Base32 decode
function base32Decode(base32) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    
    base32 = base32.replace(/=+$/, '');
    
    for (let i = 0; i < base32.length; i++) {
        const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }
    
    const bytes = Buffer.alloc(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    
    return bytes;
}

// Generate TOTP code
function generateTOTP(secret, timeStep = 30) {
    const now = Math.floor(Date.now() / 1000);
    const timeCounter = Math.floor(now / timeStep);
    
    // Convert counter to buffer
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(timeCounter));
    
    // Decode secret
    const keyBytes = base32Decode(secret);
    
    // Generate HMAC-SHA1
    const hmac = crypto.createHmac('sha1', keyBytes);
    hmac.update(buffer);
    const hash = hmac.digest();
    
    // Dynamic truncation
    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
    );
    
    // Generate 6-digit code
    return (code % 1000000).toString().padStart(6, '0');
}

// Verify TOTP with time window tolerance
function verifyTOTP(secret, code, window = 1) {
    const now = Math.floor(Date.now() / 1000);
    const currentStep = Math.floor(now / 30);
    
    for (let i = -window; i <= window; i++) {
        const timeCounter = currentStep + i;
        const buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt(timeCounter));
        
        const keyBytes = base32Decode(secret);
        const hmac = crypto.createHmac('sha1', keyBytes);
        hmac.update(buffer);
        const hash = hmac.digest();
        
        const offset = hash[hash.length - 1] & 0x0f;
        const codeNum = (
            ((hash[offset] & 0x7f) << 24) |
            ((hash[offset + 1] & 0xff) << 16) |
            ((hash[offset + 2] & 0xff) << 8) |
            (hash[offset + 3] & 0xff)
        );
        
        const expectedCode = (codeNum % 1000000).toString().padStart(6, '0');
        
        if (expectedCode === code) {
            return true;
        }
    }
    
    return false;
}

// API Routes
const routes = {
    // Send SMS OTP
    'POST /api/sms/send': (body) => {
        const { phone } = body;
        
        if (!phone) {
            return { success: false, error: 'Phone number required' };
        }
        
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
        
        storage.otpCodes.set(`sms:${phone}`, { otp, expiresAt });
        
        return {
            success: true,
            message: 'OTP sent successfully',
            otp: otp, // In production, don't return this
            expiresIn: 300
        };
    },
    
    // Verify SMS OTP
    'POST /api/sms/verify': (body) => {
        const { phone, code } = body;
        
        if (!phone || !code) {
            return { success: false, error: 'Phone and code required' };
        }
        
        const stored = storage.otpCodes.get(`sms:${phone}`);
        
        if (!stored) {
            return { success: false, error: 'No OTP found for this phone' };
        }
        
        if (Date.now() > stored.expiresAt) {
            storage.otpCodes.delete(`sms:${phone}`);
            return { success: false, error: 'OTP expired' };
        }
        
        if (stored.otp !== code) {
            return { success: false, error: 'Invalid OTP' };
        }
        
        storage.otpCodes.delete(`sms:${phone}`);
        return { success: true, message: 'Verification successful' };
    },
    
    // Send Email OTP
    'POST /api/email/send': (body) => {
        const { email } = body;
        
        if (!email) {
            return { success: false, error: 'Email address required' };
        }
        
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        
        storage.otpCodes.set(`email:${email}`, { otp, expiresAt });
        
        return {
            success: true,
            message: 'OTP sent to email',
            otp: otp,
            expiresIn: 300
        };
    },
    
    // Verify Email OTP
    'POST /api/email/verify': (body) => {
        const { email, code } = body;
        
        if (!email || !code) {
            return { success: false, error: 'Email and code required' };
        }
        
        const stored = storage.otpCodes.get(`email:${email}`);
        
        if (!stored) {
            return { success: false, error: 'No OTP found for this email' };
        }
        
        if (Date.now() > stored.expiresAt) {
            storage.otpCodes.delete(`email:${email}`);
            return { success: false, error: 'OTP expired' };
        }
        
        if (stored.otp !== code) {
            return { success: false, error: 'Invalid OTP' };
        }
        
        storage.otpCodes.delete(`email:${email}`);
        return { success: true, message: 'Verification successful' };
    },
    
    // Setup TOTP
    'POST /api/totp/setup': (body) => {
        const { username } = body;
        
        if (!username) {
            return { success: false, error: 'Username required' };
        }
        
        const secret = generateTOTPSecret();
        storage.totpSecrets.set(username, secret);
        
        const otpauthUrl = `otpauth://totp/MFA Solutions:${username}@mfasolutions.com?secret=${secret}&issuer=MFA Solutions&algorithm=SHA1&digits=6&period=30`;
        
        return {
            success: true,
            secret: secret,
            otpauthUrl: otpauthUrl,
            qrCodeData: otpauthUrl
        };
    },
    
    // Generate TOTP
    'POST /api/totp/generate': (body) => {
        const { username } = body;
        
        if (!username) {
            return { success: false, error: 'Username required' };
        }
        
        const secret = storage.totpSecrets.get(username);
        
        if (!secret) {
            return { success: false, error: 'TOTP not setup for this user' };
        }
        
        const code = generateTOTP(secret);
        const remainingSeconds = 30 - (Math.floor(Date.now() / 1000) % 30);
        
        return {
            success: true,
            code: code,
            remainingSeconds: remainingSeconds
        };
    },
    
    // Verify TOTP
    'POST /api/totp/verify': (body) => {
        const { username, code } = body;
        
        if (!username || !code) {
            return { success: false, error: 'Username and code required' };
        }
        
        const secret = storage.totpSecrets.get(username);
        
        if (!secret) {
            return { success: false, error: 'TOTP not setup for this user' };
        }
        
        const isValid = verifyTOTP(secret, code);
        
        if (isValid) {
            return { success: true, message: 'TOTP verification successful' };
        } else {
            return { success: false, error: 'Invalid TOTP code' };
        }
    },
    
    // Biometric registration
    'POST /api/biometric/register': (body) => {
        const { username, biometricType, biometricData } = body;
        
        if (!username || !biometricType) {
            return { success: false, error: 'Username and biometric type required' };
        }
        
        const userId = crypto.randomBytes(16).toString('hex');
        storage.users.set(username, {
            userId,
            biometricType,
            biometricData: biometricData || 'simulated',
            registeredAt: Date.now()
        });
        
        return {
            success: true,
            message: 'Biometric registered successfully',
            userId: userId
        };
    },
    
    // Biometric verification
    'POST /api/biometric/verify': (body) => {
        const { username, biometricType } = body;
        
        if (!username || !biometricType) {
            return { success: false, error: 'Username and biometric type required' };
        }
        
        const user = storage.users.get(username);
        
        if (!user) {
            return { success: false, error: 'User not registered' };
        }
        
        if (user.biometricType !== biometricType) {
            return { success: false, error: 'Biometric type mismatch' };
        }
        
        return {
            success: true,
            message: 'Biometric verification successful',
            userId: user.userId
        };
    },
    
    // Health check
    'GET /api/health': () => {
        return {
            success: true,
            status: 'running',
            timestamp: Date.now(),
            uptime: process.uptime()
        };
    }
};

// Request handler
const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, corsHeaders);
        res.end();
        return;
    }
    
    // Parse request
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    
    req.on('end', () => {
        const route = `${req.method} ${req.url}`;
        const handler = routes[route];
        
        if (!handler) {
            res.writeHead(404, corsHeaders);
            res.end(JSON.stringify({
                success: false,
                error: 'Route not found',
                availableRoutes: Object.keys(routes)
            }));
            return;
        }
        
        try {
            const requestBody = body ? JSON.parse(body) : {};
            const result = handler(requestBody);
            
            res.writeHead(200, corsHeaders);
            res.end(JSON.stringify(result));
            
            console.log(`[${new Date().toISOString()}] ${route} - Success`);
        } catch (error) {
            res.writeHead(500, corsHeaders);
            res.end(JSON.stringify({
                success: false,
                error: error.message
            }));
            
            console.error(`[${new Date().toISOString()}] ${route} - Error:`, error.message);
        }
    });
});

// Start server
server.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║                                                        ║');
    console.log('║          🔐 MFA Local API Server Running 🔐           ║');
    console.log('║                                                        ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`✅ Server running at: http://localhost:${PORT}`);
    console.log('');
    console.log('📡 Available Endpoints:');
    console.log('   POST /api/sms/send       - Send SMS OTP');
    console.log('   POST /api/sms/verify     - Verify SMS OTP');
    console.log('   POST /api/email/send     - Send Email OTP');
    console.log('   POST /api/email/verify   - Verify Email OTP');
    console.log('   POST /api/totp/setup     - Setup TOTP');
    console.log('   POST /api/totp/generate  - Generate TOTP code');
    console.log('   POST /api/totp/verify    - Verify TOTP code');
    console.log('   POST /api/biometric/register - Register biometric');
    console.log('   POST /api/biometric/verify   - Verify biometric');
    console.log('   GET  /api/health         - Health check');
    console.log('');
    console.log('🌐 CORS enabled for all origins');
    console.log('💾 Using in-memory storage (data resets on restart)');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('════════════════════════════════════════════════════════');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...');
    server.close(() => {
        console.log('✅ Server stopped successfully');
        process.exit(0);
    });
});
