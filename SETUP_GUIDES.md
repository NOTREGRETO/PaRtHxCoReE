# 🔐 MFA Setup Guides - Complete Documentation

## Overview

This document provides comprehensive setup guides for implementing all MFA methods and integrations covered in the website.

---

## 📱 SMS OTP Setup Guide

### Prerequisites
- SMS Gateway Provider account (Twilio, AWS SNS, Nexmo)
- API credentials and authentication tokens
- Phone number verification system
- Database for storing user phone numbers

### Implementation Steps

#### 1. Choose SMS Provider
**Recommended: Twilio**
- Global coverage
- Reliable delivery
- Comprehensive API
- Good documentation

#### 2. Configure API Credentials
```javascript
const accountSid = 'YOUR_ACCOUNT_SID';
const authToken = 'YOUR_AUTH_TOKEN';
const twilioNumber = '+1234567890';
```

#### 3. Implement OTP Generation
```javascript
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function createOTPRecord(userId, otp) {
    const hashedOTP = bcrypt.hashSync(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    
    return {
        userId,
        otp: hashedOTP,
        expiresAt,
        attempts: 0
    };
}
```

#### 4. Send SMS
```javascript
const twilio = require('twilio')(accountSid, authToken);

async function sendSMSOTP(phoneNumber, otp) {
    try {
        const message = await twilio.messages.create({
            body: `Your verification code is: ${otp}. Valid for 5 minutes.`,
            from: twilioNumber,
            to: phoneNumber
        });
        return { success: true, messageId: message.sid };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

#### 5. Verify OTP
```javascript
function verifyOTP(enteredOTP, storedRecord) {
    // Check expiration
    if (new Date() > storedRecord.expiresAt) {
        return { valid: false, reason: 'expired' };
    }
    
    // Check attempts
    if (storedRecord.attempts >= 3) {
        return { valid: false, reason: 'max_attempts' };
    }
    
    // Verify OTP
    const isValid = bcrypt.compareSync(enteredOTP, storedRecord.otp);
    
    if (!isValid) {
        storedRecord.attempts++;
        return { valid: false, reason: 'invalid_code' };
    }
    
    return { valid: true };
}
```

### Security Best Practices
- ✅ Use HTTPS for all communications
- ✅ Implement rate limiting (3 SMS per 5 minutes per user)
- ✅ Set OTP expiration to 5-10 minutes
- ✅ Hash OTPs before storing
- ✅ Log all SMS attempts for audit
- ✅ Validate phone numbers before sending
- ✅ Implement account lockout after failed attempts

### Cost Considerations
- Average cost: $0.01 - $0.05 per SMS
- Budget for 2-3 SMS per authentication (resends)
- Consider volume discounts for large deployments

---

## 📧 Email OTP Setup Guide

### Prerequisites
- SMTP server or email service (SendGrid, AWS SES, Mailgun)
- Domain with SPF, DKIM, and DMARC configured
- Email templates designed
- User email verification system

### Implementation Steps

#### 1. Configure Email Service
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
```

#### 2. Design Email Template
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; }
        .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #00ff00;
            letter-spacing: 5px;
            padding: 20px;
            background: #000;
            text-align: center;
        }
    </style>
</head>
<body>
    <h2>Your Verification Code</h2>
    <div class="otp-code">{{OTP_CODE}}</div>
    <p>This code expires in 10 minutes.</p>
    <p><strong>Security Warning:</strong> Never share this code with anyone.</p>
</body>
</html>
```

#### 3. Send Email OTP
```javascript
async function sendEmailOTP(email, otp) {
    const msg = {
        to: email,
        from: 'noreply@yourdomain.com',
        subject: 'Your Verification Code',
        html: emailTemplate.replace('{{OTP_CODE}}', otp)
    };
    
    try {
        await sgMail.send(msg);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}
```

#### 4. Configure SPF/DKIM/DMARC
```dns
; SPF Record
yourdomain.com. IN TXT "v=spf1 include:sendgrid.net ~all"

; DKIM Record
s1._domainkey.yourdomain.com. IN TXT "k=rsa; p=YOUR_PUBLIC_KEY"

; DMARC Record
_dmarc.yourdomain.com. IN TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Email Template Best Practices
- Clear subject line: "Your Verification Code"
- Display OTP prominently in large font
- Include expiration time
- Add security warning
- Provide support contact
- Make it mobile-responsive
- Use plain text alternative

---

## 📲 App-based OTP (TOTP) Setup Guide

### Prerequisites
- TOTP library (pyotp, speakeasy, otplib)
- QR code generation library
- Secure secret key storage
- Time synchronization (NTP)

### Implementation Steps

#### 1. Generate Secret Key
```javascript
const speakeasy = require('speakeasy');

function generateSecret(username) {
    const secret = speakeasy.generateSecret({
        name: `YourApp (${username})`,
        length: 32
    });
    
    return {
        secret: secret.base32,
        qrCode: secret.otpauth_url
    };
}
```

#### 2. Generate QR Code
```javascript
const QRCode = require('qrcode');

async function generateQRCode(otpauthUrl) {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error('QR code generation failed');
    }
}
```

#### 3. Verify TOTP
```javascript
function verifyTOTP(token, secret) {
    const verified = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow ±30 seconds
    });
    
    return verified;
}
```

#### 4. Generate Backup Codes
```javascript
function generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        codes.push(code);
    }
    return codes;
}
```

### TOTP Configuration
```javascript
const totpConfig = {
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    window: 1
};
```

### Compatible Authenticator Apps
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- LastPass Authenticator
- FreeOTP

---

## 👆 Biometric Authentication Setup Guide

### Prerequisites
- FIDO2/WebAuthn compatible server library
- HTTPS enabled (required)
- Compatible devices
- Fallback authentication method

### Implementation Steps

#### 1. Registration Flow (Client-Side)
```javascript
async function registerBiometric() {
    const publicKeyCredentialCreationOptions = {
        challenge: new Uint8Array(32), // From server
        rp: {
            name: "Your App",
            id: "yourdomain.com"
        },
        user: {
            id: new Uint8Array(16),
            name: "user@example.com",
            displayName: "User Name"
        },
        pubKeyCredParams: [{alg: -7, type: "public-key"}],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
        },
        timeout: 60000,
        attestation: "direct"
    };
    
    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
    });
    
    return credential;
}
```

#### 2. Authentication Flow (Client-Side)
```javascript
async function authenticateBiometric() {
    const publicKeyCredentialRequestOptions = {
        challenge: new Uint8Array(32), // From server
        allowCredentials: [{
            id: credentialId,
            type: 'public-key',
            transports: ['internal']
        }],
        timeout: 60000,
        userVerification: "required"
    };
    
    const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
    });
    
    return assertion;
}
```

#### 3. Server-Side Verification
```javascript
const fido2 = require('fido2-lib');

async function verifyBiometric(assertion, storedCredential) {
    const result = await fido2.assertionResult(assertion, {
        challenge: storedChallenge,
        origin: 'https://yourdomain.com',
        factor: 'either',
        publicKey: storedCredential.publicKey,
        prevCounter: storedCredential.counter,
        userHandle: storedCredential.userHandle
    });
    
    return result;
}
```

### Privacy & Compliance
- Never store raw biometric data
- Use device-local verification only
- Comply with GDPR/CCPA
- Provide clear privacy policy
- Allow users to delete biometric data
- Implement data retention policies

---

## 🔑 Hardware Tokens Setup Guide

### Prerequisites
- FIDO2/U2F compatible server library
- Hardware security keys
- HTTPS enabled
- Token management system

### Implementation Steps

#### 1. Token Registration
```javascript
async function registerSecurityKey() {
    const publicKeyCredentialCreationOptions = {
        challenge: Uint8Array.from(serverChallenge),
        rp: { name: "Your App", id: "yourdomain.com" },
        user: {
            id: Uint8Array.from(userId),
            name: userEmail,
            displayName: userName
        },
        pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: "cross-platform",
            requireResidentKey: false,
            userVerification: "discouraged"
        },
        timeout: 60000,
        attestation: "direct"
    };
    
    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
    });
    
    return credential;
}
```

#### 2. Token Authentication
```javascript
async function authenticateWithSecurityKey(credentialIds) {
    const publicKeyCredentialRequestOptions = {
        challenge: Uint8Array.from(serverChallenge),
        allowCredentials: credentialIds.map(id => ({
            id: Uint8Array.from(id),
            type: 'public-key',
            transports: ['usb', 'nfc', 'ble']
        })),
        timeout: 60000,
        userVerification: "discouraged"
    };
    
    const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
    });
    
    return assertion;
}
```

### Recommended Hardware
| Token | Price | Features |
|-------|-------|----------|
| YubiKey 5 NFC | $45 | USB-A, NFC, FIDO2, U2F |
| YubiKey 5C | $50 | USB-C, FIDO2, U2F |
| Google Titan | $30 | USB-A, NFC, FIDO2 |
| Feitian ePass | $20 | USB-A, FIDO2, U2F |

### Deployment Strategy
1. Purchase tokens in bulk (10% discount)
2. Pre-register tokens for users
3. Distribute with setup instructions
4. Require 2+ tokens per user
5. Establish replacement process
6. Track token inventory

---

## 🔗 SSO Integration Setup Guide

### Prerequisites
- Identity Provider (Okta, Auth0, Azure AD)
- SAML 2.0 or OAuth 2.0/OIDC library
- SSL certificates
- Metadata exchange capability

### SAML 2.0 Implementation

#### 1. Configure Service Provider
```xml
<EntityDescriptor entityID="https://yourapp.com/saml/metadata">
    <SPSSODescriptor>
        <AssertionConsumerService 
            Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
            Location="https://yourapp.com/saml/acs"
            index="0"/>
    </SPSSODescriptor>
</EntityDescriptor>
```

#### 2. Handle SAML Response
```javascript
const saml = require('passport-saml');

app.post('/saml/acs', async (req, res) => {
    const profile = await saml.validatePostResponse(req.body);
    
    // Extract user attributes
    const user = {
        email: profile.email,
        name: profile.displayName,
        groups: profile.groups
    };
    
    // Create session
    req.session.user = user;
    res.redirect('/dashboard');
});
```

### OAuth 2.0/OIDC Implementation

#### 1. Authorization Request
```javascript
const authUrl = `https://idp.com/oauth/authorize?
    client_id=${clientId}&
    redirect_uri=${redirectUri}&
    response_type=code&
    scope=openid profile email&
    state=${state}`;
```

#### 2. Token Exchange
```javascript
const tokenResponse = await fetch('https://idp.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
    })
});

const tokens = await tokenResponse.json();
```

### MFA Integration with SSO
```javascript
// Configure MFA policy in IdP
const mfaPolicy = {
    requireMFA: true,
    methods: ['totp', 'sms', 'push'],
    rememberDevice: true,
    rememberDuration: 30 // days
};
```

---

## 🌐 VPN Integration Setup Guide

### Prerequisites
- VPN server (OpenVPN, WireGuard)
- RADIUS server
- MFA provider with RADIUS support
- Network infrastructure access

### OpenVPN + RADIUS Setup

#### 1. Install FreeRADIUS
```bash
sudo apt-get install freeradius freeradius-utils
```

#### 2. Configure RADIUS Client
```conf
# /etc/freeradius/clients.conf
client vpn-server {
    ipaddr = 10.0.0.1
    secret = your-shared-secret
    require_message_authenticator = no
}
```

#### 3. Configure OpenVPN
```conf
# /etc/openvpn/server.conf
plugin /usr/lib/openvpn/radiusplugin.so /etc/openvpn/radiusplugin.cnf
```

#### 4. RADIUS Plugin Configuration
```conf
# /etc/openvpn/radiusplugin.cnf
NAS-Identifier=OpenVPN
Service-Type=5
Framed-Protocol=1
NAS-Port-Type=5
NAS-IP-Address=10.0.0.1
OpenVPNConfig=/etc/openvpn/server.conf
subnet=10.8.0.0/24
```

### Duo Security Integration
```python
import duo_client

auth_api = duo_client.Auth(
    ikey='YOUR_INTEGRATION_KEY',
    skey='YOUR_SECRET_KEY',
    host='api-XXXXXXXX.duosecurity.com'
)

# Trigger MFA
response = auth_api.auth('push',
    username='user@example.com',
    device='auto',
    type='VPN Login',
    display_username='user@example.com'
)
```

---

## 📊 Comparison Matrix

| Method | Security | Cost | User Experience | Deployment |
|--------|----------|------|-----------------|------------|
| SMS OTP | Medium | $0.01-0.05/auth | Easy | Easy |
| Email OTP | Medium | Low | Easy | Easy |
| App TOTP | High | Free | Medium | Medium |
| Biometric | Very High | Free | Excellent | Medium |
| Hardware Token | Very High | $20-50/user | Good | Complex |

---

## 🎯 Best Practices Summary

### General
- ✅ Always use HTTPS
- ✅ Implement rate limiting
- ✅ Log all authentication attempts
- ✅ Provide multiple MFA options
- ✅ Allow users to manage their MFA methods
- ✅ Implement account recovery process
- ✅ Regular security audits

### User Experience
- ✅ Clear setup instructions
- ✅ Remember device options
- ✅ Backup authentication methods
- ✅ Self-service management portal
- ✅ Mobile-friendly interfaces

### Compliance
- ✅ GDPR compliance
- ✅ SOC 2 requirements
- ✅ PCI DSS standards
- ✅ HIPAA regulations
- ✅ Data retention policies

---

**© 2024 MFA Solutions - Complete Setup Documentation**
