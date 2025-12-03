// Modern Interactive Effects

// 3D Tilt Effect
function initTiltEffect() {
    const cards = document.querySelectorAll('.method-card, .demo-card, .glass-panel');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -5; // Max 5deg rotation
            const rotateY = ((x - centerX) / centerX) * 5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Spotlight Effect
function initSpotlightEffect() {
    const cards = document.querySelectorAll('.method-card, .demo-card, .glass-panel');

    document.addEventListener('mousemove', (e) => {
        cards.forEach(card => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

// Initialize Effects
document.addEventListener('DOMContentLoaded', () => {
    initTiltEffect();
    initSpotlightEffect();
});

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.querySelector('.theme-icon');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.querySelector('.theme-icon');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
}

// Enhanced Smooth Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -80px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Add stagger effect
                const delay = entry.target.dataset.delay || 0;
                entry.target.style.transitionDelay = `${delay}ms`;
            }
        });
    }, observerOptions);

    // Add scroll animation classes to elements
    document.querySelectorAll('.method-card').forEach((el, index) => {
        el.classList.add('scroll-animate');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.demo-card').forEach((el, index) => {
        el.classList.add('scroll-animate-scale');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.guide-card').forEach((el, index) => {
        el.classList.add('scroll-animate');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.integration-card').forEach((el, index) => {
        el.classList.add('scroll-animate-left');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.sso-provider-card').forEach((el, index) => {
        el.classList.add('scroll-animate-scale');
        el.style.transitionDelay = `${index * 0.05}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.server-item').forEach((el, index) => {
        el.classList.add('scroll-animate-right');
        el.style.transitionDelay = `${index * 0.02}s`;
        observer.observe(el);
    });

    document.querySelectorAll('.arch-feature').forEach((el, index) => {
        el.classList.add('scroll-animate');
        el.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(el);
    });
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    createSparkles();
    initScrollAnimations();
});

// OTP Storage
let otpCodes = {
    sms: null,
    email: null,
    app: null
};

let timers = {
    sms: null,
    email: null,
    app: null
};

// Rate limiting and attempt tracking
let rateLimits = {
    sms: { attempts: 0, lastAttempt: null, maxAttempts: 5, cooldown: 300000 }, // 5 min cooldown
    email: { attempts: 0, lastAttempt: null, maxAttempts: 5, cooldown: 300000 },
    app: { attempts: 0, lastAttempt: null, maxAttempts: 5, cooldown: 300000 }
};

let verificationAttempts = {
    sms: 0,
    email: 0,
    app: 0,
    maxAttempts: 3
};

// Check rate limit
function checkRateLimit(type) {
    const limit = rateLimits[type];
    const now = Date.now();

    // Reset if cooldown period has passed
    if (limit.lastAttempt && (now - limit.lastAttempt) > limit.cooldown) {
        limit.attempts = 0;
    }

    if (limit.attempts >= limit.maxAttempts) {
        const timeLeft = Math.ceil((limit.cooldown - (now - limit.lastAttempt)) / 1000);
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        showAlert(`⏱️ Too many attempts. Please wait ${minutes}m ${seconds}s`, 'error');
        return false;
    }

    limit.attempts++;
    limit.lastAttempt = now;
    return true;
}

// Check verification attempts
function checkVerificationAttempts(type) {
    if (verificationAttempts[type] >= verificationAttempts.maxAttempts) {
        showAlert('❌ Too many failed attempts. Please request a new code.', 'error');
        // Reset the OTP
        otpCodes[type] = null;
        verificationAttempts[type] = 0;
        return false;
    }
    return true;
}

// Generate Random OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Update phone placeholder based on country
function updatePhonePlaceholder() {
    const countrySelect = document.getElementById('countryCode');
    const phoneInput = document.getElementById('smsPhone');
    const countryCodeDisplay = document.getElementById('countryCodeDisplay');
    
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const countryCode = selectedOption.value;
    const countryName = selectedOption.getAttribute('data-country');
    
    // Update display
    countryCodeDisplay.textContent = countryCode;
    
    // Update placeholder based on country
    const placeholders = {
        '+1': '(555) 123-4567',
        '+44': '7700 900123',
        '+91': '98765 43210',
        '+86': '138 0000 0000',
        '+81': '90-1234-5678',
        '+82': '010-1234-5678',
        '+49': '151 23456789',
        '+33': '06 12 34 56 78',
        '+39': '312 345 6789',
        '+34': '612 34 56 78',
        '+61': '0412 345 678',
        '+65': '8123 4567',
        '+52': '55 1234 5678',
        '+55': '(11) 98765-4321',
        '+971': '50 123 4567',
        '+966': '50 123 4567'
    };
    
    phoneInput.placeholder = placeholders[countryCode] || '123456789';
}

// SMS OTP Functions
function sendSMSOTP() {
    const phone = document.getElementById('smsPhone').value;
    const countryCode = document.getElementById('countryCode').value;
    const sendButton = event.target;

    // Validate phone number
    if (!phone || phone.trim() === '') {
        showAlert('⚠️ Please enter a phone number', 'error');
        return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(phone) || phone.replace(/\D/g, '').length < 7) {
        showAlert('⚠️ Please enter a valid phone number', 'error');
        return;
    }

    // Check rate limit
    if (!checkRateLimit('sms')) {
        return;
    }

    // Disable button and show loading state
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="spinner"></span> Sending...';

    // Reset verification attempts
    verificationAttempts.sms = 0;
    document.getElementById('smsVerify').disabled = false;

    // Simulate API call delay
    setTimeout(() => {
        // Generate OTP with animation
        otpCodes.sms = generateOTP();

        // Display result with typing effect
        const otpDisplay = document.getElementById('smsOTP');
        otpDisplay.textContent = '------';
        document.getElementById('smsResult').style.display = 'block';
        document.getElementById('smsVerifyResult').textContent = '';
        document.getElementById('smsVerifyResult').className = 'verify-result';
        document.getElementById('smsVerify').value = '';

        // Animate OTP reveal
        setTimeout(() => {
            animateOTPReveal(otpDisplay, otpCodes.sms);
        }, 500);

        // Start countdown timer
        startCountdown('sms', 300); // 5 minutes

        // Re-enable button
        sendButton.disabled = false;
        sendButton.textContent = 'Resend Code';

        // Get country info for display
        const countrySelect = document.getElementById('countryCode');
        const selectedOption = countrySelect.options[countrySelect.selectedIndex];
        const countryFlag = selectedOption.getAttribute('data-flag');
        const countryName = selectedOption.getAttribute('data-country');
        
        // Mask phone number for privacy
        const maskedPhone = phone.slice(-4).padStart(phone.length, '*');
        const fullNumber = `${countryCode} ${maskedPhone}`;

        showAlert(`✅ SMS sent to ${countryFlag} ${fullNumber}`, 'success');
    }, 1500); // Simulate network delay
}

// Enhanced Alert System
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    
    const colors = {
        success: { bg: '#10b981', border: '#059669', icon: '✅' },
        error: { bg: '#ef4444', border: '#dc2626', icon: '❌' },
        warning: { bg: '#f59e0b', border: '#d97706', icon: '⚠️' },
        info: { bg: '#667eea', border: '#5568d3', icon: 'ℹ️' }
    };

    const style = colors[type] || colors.info;

    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${style.bg};
        border: 2px solid ${style.border};
        color: white;
        padding: 16px 24px;
        font-size: 1rem;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 400px;
        font-weight: 500;
    `;
    
    alertDiv.innerHTML = `
        <span style="font-size: 1.5rem;">${style.icon}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => alertDiv.remove(), 300);
    }, 3000);
}

// Add CSS animations
if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
        .spinner {
            display: inline-block;
            width: 14px;
            height: 14px;
            border: 2px solid rgba(255,255,255,0.3);
            border-top-color: white;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Animate OTP Reveal
function animateOTPReveal(element, code) {
    let revealed = '';
    let index = 0;

    const revealInterval = setInterval(() => {
        if (index < code.length) {
            revealed += code[index];
            element.textContent = revealed + '------'.substring(revealed.length);
            index++;
        } else {
            clearInterval(revealInterval);
            element.textContent = code;
        }
    }, 100);
}

function verifySMSOTP() {
    const enteredCode = document.getElementById('smsVerify').value;
    const resultDiv = document.getElementById('smsVerifyResult');
    const verifyButton = event.target;

    if (!enteredCode) {
        resultDiv.textContent = '⚠️ Please enter the code';
        resultDiv.className = 'verify-result error';
        showAlert('Please enter the verification code', 'warning');
        return;
    }

    if (enteredCode.length !== 6) {
        resultDiv.textContent = '⚠️ Code must be 6 digits';
        resultDiv.className = 'verify-result error';
        showAlert('Verification code must be 6 digits', 'warning');
        return;
    }

    // Check if code expired
    if (!otpCodes.sms) {
        resultDiv.textContent = '❌ Code has expired. Please request a new one.';
        resultDiv.className = 'verify-result error';
        showAlert('Code has expired', 'error');
        return;
    }

    // Check verification attempts
    if (!checkVerificationAttempts('sms')) {
        resultDiv.textContent = '❌ Too many failed attempts. Request a new code.';
        resultDiv.className = 'verify-result error';
        document.getElementById('smsVerify').disabled = true;
        return;
    }

    // Show loading state
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<span class="spinner"></span> Verifying...';

    // Simulate API verification delay
    setTimeout(() => {
        if (enteredCode === otpCodes.sms) {
            resultDiv.textContent = '✅ Verification Successful! Access granted.';
            resultDiv.className = 'verify-result success';
            clearInterval(timers.sms);
            showAlert('SMS verification successful!', 'success');
            verificationAttempts.sms = 0;
            
            // Disable input after success
            document.getElementById('smsVerify').disabled = true;
            verifyButton.textContent = 'Verified ✓';
        } else {
            verificationAttempts.sms++;
            const attemptsLeft = verificationAttempts.maxAttempts - verificationAttempts.sms;
            resultDiv.textContent = `❌ Invalid Code. ${attemptsLeft} attempt(s) remaining.`;
            resultDiv.className = 'verify-result error';
            showAlert(`Invalid code. ${attemptsLeft} attempts left`, 'error');
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify Code';
            
            // Clear input for retry
            document.getElementById('smsVerify').value = '';
            document.getElementById('smsVerify').focus();
        }
    }, 800);
}

// Email OTP Functions
function sendEmailOTP() {
    const email = document.getElementById('emailAddress').value;
    const sendButton = event.target;

    if (!email || email.trim() === '') {
        showAlert('⚠️ Please enter an email address', 'warning');
        return;
    }

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('⚠️ Please enter a valid email address', 'error');
        return;
    }

    // Check rate limit
    if (!checkRateLimit('email')) {
        return;
    }

    // Disable button and show loading state
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="spinner"></span> Sending...';

    // Reset verification attempts
    verificationAttempts.email = 0;
    document.getElementById('emailVerify').disabled = false;

    // Simulate API call delay
    setTimeout(() => {
        // Generate OTP
        otpCodes.email = generateOTP();

        // Display result with animation
        const otpDisplay = document.getElementById('emailOTP');
        otpDisplay.textContent = '------';
        document.getElementById('emailResult').style.display = 'block';
        document.getElementById('emailVerifyResult').textContent = '';
        document.getElementById('emailVerifyResult').className = 'verify-result';
        document.getElementById('emailVerify').value = '';

        // Animate OTP reveal
        setTimeout(() => {
            animateOTPReveal(otpDisplay, otpCodes.email);
        }, 500);

        // Start countdown timer
        startCountdown('email', 300); // 5 minutes

        // Re-enable button
        sendButton.disabled = false;
        sendButton.textContent = 'Resend Code';

        // Mask email for privacy
        const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (match, start, middle, end) => {
            return start + '*'.repeat(middle.length) + end;
        });

        showAlert('✅ Email sent to ' + maskedEmail, 'success');
    }, 1800); // Simulate network delay
}

function verifyEmailOTP() {
    const enteredCode = document.getElementById('emailVerify').value;
    const resultDiv = document.getElementById('emailVerifyResult');
    const verifyButton = event.target;

    if (!enteredCode) {
        resultDiv.textContent = '⚠️ Please enter the code';
        resultDiv.className = 'verify-result error';
        showAlert('Please enter the verification code', 'warning');
        return;
    }

    if (enteredCode.length !== 6) {
        resultDiv.textContent = '⚠️ Code must be 6 digits';
        resultDiv.className = 'verify-result error';
        showAlert('Verification code must be 6 digits', 'warning');
        return;
    }

    // Check if code expired
    if (!otpCodes.email) {
        resultDiv.textContent = '❌ Code has expired. Please request a new one.';
        resultDiv.className = 'verify-result error';
        showAlert('Code has expired', 'error');
        return;
    }

    // Check verification attempts
    if (!checkVerificationAttempts('email')) {
        resultDiv.textContent = '❌ Too many failed attempts. Request a new code.';
        resultDiv.className = 'verify-result error';
        document.getElementById('emailVerify').disabled = true;
        return;
    }

    // Show loading state
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<span class="spinner"></span> Verifying...';

    // Simulate API verification delay
    setTimeout(() => {
        if (enteredCode === otpCodes.email) {
            resultDiv.textContent = '✅ Verification Successful! Access granted.';
            resultDiv.className = 'verify-result success';
            clearInterval(timers.email);
            showAlert('Email verification successful!', 'success');
            verificationAttempts.email = 0;
            
            // Disable input after success
            document.getElementById('emailVerify').disabled = true;
            verifyButton.textContent = 'Verified ✓';
        } else {
            verificationAttempts.email++;
            const attemptsLeft = verificationAttempts.maxAttempts - verificationAttempts.email;
            resultDiv.textContent = `❌ Invalid Code. ${attemptsLeft} attempt(s) remaining.`;
            resultDiv.className = 'verify-result error';
            showAlert(`Invalid code. ${attemptsLeft} attempts left`, 'error');
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify Code';
            
            // Clear input for retry
            document.getElementById('emailVerify').value = '';
            document.getElementById('emailVerify').focus();
        }
    }, 800);
}

// App-based OTP Functions (Real TOTP Implementation)
let totpInterval = null;
let totpSecret = null;

// Generate base32 secret for TOTP
function generateTOTPSecret() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    const array = new Uint8Array(20);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < 32; i++) {
        secret += chars[array[i % 20] % 32];
    }

    return secret;
}

// Base32 decode
function base32Decode(base32) {
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    let value = 0;

    base32 = base32.replace(/=+$/, '');

    for (let i = 0; i < base32.length; i++) {
        const val = base32Chars.indexOf(base32.charAt(i).toUpperCase());
        if (val === -1) continue;
        bits += val.toString(2).padStart(5, '0');
    }

    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }

    return bytes;
}

// HMAC-SHA1 implementation
async function hmacSHA1(key, message) {
    const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );

    const signature = await window.crypto.subtle.sign(
        'HMAC',
        cryptoKey,
        message
    );

    return new Uint8Array(signature);
}

// Generate TOTP code
async function generateRealTOTP(secret, timeStep = 30) {
    // Get current time step
    const now = Math.floor(Date.now() / 1000);
    const timeCounter = Math.floor(now / timeStep);

    // Convert counter to 8-byte array
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, timeCounter, false);
    const timeBytes = new Uint8Array(buffer);

    // Decode secret
    const keyBytes = base32Decode(secret);

    // Generate HMAC
    const hmac = await hmacSHA1(keyBytes, timeBytes);

    // Dynamic truncation
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
    );

    // Generate 6-digit code
    const otp = (code % 1000000).toString().padStart(6, '0');
    return otp;
}

// Get remaining seconds in current time step
function getTOTPRemainingSeconds() {
    const now = Math.floor(Date.now() / 1000);
    return 30 - (now % 30);
}

async function generateAppOTP() {
    const username = document.getElementById('appUsername').value;
    const generateButton = event.target;

    if (!username || username.trim() === '') {
        showAlert('⚠️ Please enter a username', 'warning');
        return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
        showAlert('⚠️ Username must be 3-20 characters (letters, numbers, _ or -)', 'error');
        return;
    }

    // Show loading state
    generateButton.disabled = true;
    generateButton.innerHTML = '<span class="spinner"></span> Setting up...';

    // Simulate setup delay
    setTimeout(async () => {
        // Generate secret if not exists
        if (!totpSecret) {
            totpSecret = generateTOTPSecret();

            // Show QR code modal with secret
            showTOTPSetupModal(username, totpSecret);
        }

        // Display result
        document.getElementById('appResult').style.display = 'block';
        document.getElementById('appVerifyResult').textContent = '';
        document.getElementById('appVerifyResult').className = 'verify-result';
        document.getElementById('appVerify').value = '';

        // Generate initial TOTP
        await generateNewTOTP();

        // Auto-generate new TOTP every second (to update when time step changes)
        if (totpInterval) clearInterval(totpInterval);
        totpInterval = setInterval(async () => {
            await generateNewTOTP();
        }, 1000);

        // Start 30-second countdown
        startTOTPCountdown();

        // Re-enable button
        generateButton.disabled = false;
        generateButton.textContent = 'Regenerate TOTP';

        showAlert('✅ TOTP authenticator activated!', 'success');
    }, 1000);
}

async function generateNewTOTP() {
    if (!totpSecret) return;

    const otp = await generateRealTOTP(totpSecret);
    otpCodes.app = otp;

    const otpDisplay = document.getElementById('appOTP');

    // Only update if code changed
    if (otpDisplay.textContent !== otp) {
        otpDisplay.textContent = '------';

        // Animate reveal
        setTimeout(() => {
            animateOTPReveal(otpDisplay, otp);
        }, 200);
    }
}

// Show TOTP Setup Modal
function showTOTPSetupModal(username, secret) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('totpSetupModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'totpSetupModal';
        modal.className = 'permission-modal';
        modal.innerHTML = `
            <div class="permission-modal-content totp-setup-modal">
                <span class="modal-close" onclick="closeTOTPSetupModal()">&times;</span>
                <h3>📲 Setup Authenticator App</h3>
                <p>Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)</p>
                
                <div class="qr-code-container" id="qrCodeContainer">
                    <canvas id="qrCodeCanvas"></canvas>
                </div>
                
                <div class="totp-secret-display">
                    <p><strong>Or enter this secret key manually:</strong></p>
                    <div class="secret-key" id="secretKey">${secret}</div>
                    <button class="btn-copy" onclick="copyTOTPSecret()">📋 Copy Secret</button>
                </div>
                
                <div class="totp-info">
                    <p><strong>Account:</strong> ${username}@mfasolutions.com</p>
                    <p><strong>Issuer:</strong> MFA Solutions Demo</p>
                    <p><strong>Type:</strong> Time-based (30 seconds)</p>
                </div>
                
                <button class="btn btn-primary" onclick="closeTOTPSetupModal()">Done</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update content
    document.getElementById('secretKey').textContent = secret;

    // Generate QR code
    const otpauthUrl = `otpauth://totp/MFA Solutions:${username}@mfasolutions.com?secret=${secret}&issuer=MFA Solutions&algorithm=SHA1&digits=6&period=30`;
    generateQRCode(otpauthUrl);

    modal.style.display = 'flex';
}

function closeTOTPSetupModal() {
    const modal = document.getElementById('totpSetupModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function copyTOTPSecret() {
    const secret = document.getElementById('secretKey').textContent;
    navigator.clipboard.writeText(secret).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Generate QR Code
function generateQRCode(text) {
    const canvas = document.getElementById('qrCodeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const size = 200;
    canvas.width = size;
    canvas.height = size;

    // Simple QR code generation (for demo - in production use a proper QR library)
    // This creates a visual representation
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'black';
    const moduleSize = 4;
    const modules = Math.floor(size / moduleSize);

    // Create a simple pattern based on the text
    for (let y = 0; y < modules; y++) {
        for (let x = 0; x < modules; x++) {
            const index = (y * modules + x) % text.length;
            const charCode = text.charCodeAt(index);
            if ((charCode + x + y) % 2 === 0) {
                ctx.fillRect(x * moduleSize, y * moduleSize, moduleSize, moduleSize);
            }
        }
    }

    // Add positioning markers (corners)
    const markerSize = moduleSize * 7;
    drawQRMarker(ctx, 0, 0, markerSize);
    drawQRMarker(ctx, size - markerSize, 0, markerSize);
    drawQRMarker(ctx, 0, size - markerSize, markerSize);

    // Add text below QR code
    ctx.fillStyle = 'black';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Scan with authenticator app', size / 2, size - 5);
}

function drawQRMarker(ctx, x, y, size) {
    ctx.fillStyle = 'black';
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'white';
    ctx.fillRect(x + size / 7, y + size / 7, size * 5 / 7, size * 5 / 7);
    ctx.fillStyle = 'black';
    ctx.fillRect(x + size * 2 / 7, y + size * 2 / 7, size * 3 / 7, size * 3 / 7);
}

function startTOTPCountdown() {
    let seconds = 30;
    const timerElement = document.getElementById('appTimer');
    const progressBar = document.getElementById('totpProgress');

    if (timers.app) clearInterval(timers.app);

    timers.app = setInterval(() => {
        seconds--;
        timerElement.textContent = seconds;
        progressBar.style.width = ((seconds / 30) * 100) + '%';

        if (seconds <= 0) {
            seconds = 30;
            progressBar.style.width = '100%';
        }
    }, 1000);
}

async function verifyAppOTP() {
    const enteredCode = document.getElementById('appVerify').value;
    const resultDiv = document.getElementById('appVerifyResult');
    const verifyButton = event.target;

    if (!enteredCode) {
        resultDiv.textContent = '⚠️ Please enter the code';
        resultDiv.className = 'verify-result error';
        showAlert('Please enter the TOTP code', 'warning');
        return;
    }

    if (enteredCode.length !== 6 || !/^\d+$/.test(enteredCode)) {
        resultDiv.textContent = '⚠️ Code must be 6 digits';
        resultDiv.className = 'verify-result error';
        showAlert('TOTP code must be 6 digits', 'warning');
        return;
    }

    if (!totpSecret) {
        resultDiv.textContent = '❌ Please generate TOTP first';
        resultDiv.className = 'verify-result error';
        showAlert('Please generate TOTP first', 'error');
        return;
    }

    // Show loading state
    verifyButton.disabled = true;
    verifyButton.innerHTML = '<span class="spinner"></span> Verifying...';

    // Simulate verification delay
    setTimeout(async () => {
        // Verify against current TOTP code (with time window tolerance)
        const currentCode = await generateRealTOTP(totpSecret);

        // Also check previous and next time windows (±30 seconds tolerance)
        const now = Math.floor(Date.now() / 1000);
        const prevTimeCounter = Math.floor((now - 30) / 30);
        const nextTimeCounter = Math.floor((now + 30) / 30);

        // Generate codes for time windows
        const prevCode = await generateTOTPAtTime(totpSecret, prevTimeCounter);
        const nextCode = await generateTOTPAtTime(totpSecret, nextTimeCounter);

        if (enteredCode === currentCode || enteredCode === prevCode || enteredCode === nextCode) {
            resultDiv.textContent = '✅ Verification Successful! (Real TOTP Algorithm)';
            resultDiv.className = 'verify-result success';
            showAlert('TOTP verification successful!', 'success');
            
            // Disable input after success
            document.getElementById('appVerify').disabled = true;
            verifyButton.textContent = 'Verified ✓';
        } else {
            resultDiv.textContent = '❌ Invalid Code. Make sure you\'re using the current code.';
            resultDiv.className = 'verify-result error';
            showAlert('Invalid TOTP code', 'error');
            verifyButton.disabled = false;
            verifyButton.textContent = 'Verify Code';
            
            // Clear input for retry
            document.getElementById('appVerify').value = '';
            document.getElementById('appVerify').focus();
        }
    }, 600);
}

// Generate TOTP at specific time counter
async function generateTOTPAtTime(secret, timeCounter) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, timeCounter, false);
    const timeBytes = new Uint8Array(buffer);

    const keyBytes = base32Decode(secret);
    const hmac = await hmacSHA1(keyBytes, timeBytes);

    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = (
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff)
    );

    return (code % 1000000).toString().padStart(6, '0');
}

// Countdown Timer Function
function startCountdown(type, seconds) {
    const timerElement = document.getElementById(`${type}Timer`);

    if (timers[type]) clearInterval(timers[type]);

    timers[type] = setInterval(() => {
        seconds--;
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

        if (seconds <= 0) {
            clearInterval(timers[type]);
            timerElement.textContent = 'Expired';
            otpCodes[type] = null;
        }
    }, 1000);
}

// Mobile Menu Toggle
// Mobile Menu Toggle
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

// Initialize mobile menu when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileMenu);
} else {
    initMobileMenu();
}

// Enhanced Navbar Scroll Effect
function initNavbarScroll() {
    let lastScroll = 0;
    const navbar = document.querySelector('.navbar');

    if (!navbar) return;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// Initialize navbar scroll effect when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbarScroll);
} else {
    initNavbarScroll();
}

// Update active nav link on scroll
function initScrollNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (sections.length === 0 || navLinks.length === 0) return;

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (window.pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// Initialize scroll highlight when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollNavHighlight);
} else {
    initScrollNavHighlight();
}

// Add smooth hover effects to all buttons
document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .btn-learn-more').forEach(btn => {
    btn.addEventListener('mouseenter', function (e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Smooth Scrolling for Navigation Links
function initSmoothScroll() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });

                // Close mobile menu if open
                const navMenu = document.getElementById('navMenu');
                if (navMenu) {
                    navMenu.classList.remove('active');
                }

                // Update active link
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Initialize smooth scroll when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmoothScroll);
} else {
    initSmoothScroll();
}

// Modal Functionality
const modal = document.getElementById('modal');
const modalBody = document.getElementById('modalBody');

const modalContent = {
    sms: {
        title: 'SMS OTP Authentication',
        icon: '📱',
        description: 'SMS One-Time Password (OTP) is a widely adopted authentication method that sends a unique verification code to the user\'s mobile phone via text message.',
        features: [
            'Universal Compatibility: Works with any mobile phone capable of receiving text messages',
            'No App Required: Users don\'t need to install any additional applications',
            'Quick Setup: Easy to implement and configure for organizations',
            'Instant Delivery: Codes typically arrive within seconds',
            'Backup Method: Can serve as a fallback when other methods are unavailable'
        ],
        implementation: [
            'Integrate with SMS gateway providers (Twilio, AWS SNS, etc.)',
            'Configure message templates and sender IDs',
            'Set code expiration times (typically 5-10 minutes)',
            'Implement rate limiting to prevent abuse',
            'Add retry mechanisms for failed deliveries'
        ],
        considerations: [
            'Requires cellular coverage for delivery',
            'Potential costs per message sent',
            'Vulnerable to SIM swapping attacks',
            'May have delivery delays in some regions',
            'Not recommended as the sole MFA method for high-security applications'
        ]
    },
    email: {
        title: 'Email OTP Authentication',
        icon: '📧',
        description: 'Email OTP delivers verification codes directly to the user\'s registered email address, providing a secure and accessible authentication method.',
        features: [
            'Universal Access: Available on any device with email access',
            'No Phone Required: Perfect for users without mobile phones',
            'Audit Trail: Email records provide verification history',
            'Rich Content: Can include additional security information and instructions',
            'Cost-Effective: Lower operational costs compared to SMS'
        ],
        implementation: [
            'Configure SMTP servers or email service providers',
            'Design secure email templates with branding',
            'Implement SPF, DKIM, and DMARC for email authentication',
            'Set appropriate code expiration times',
            'Add email verification during user registration'
        ],
        considerations: [
            'Requires internet access to check email',
            'Potential delays due to email server processing',
            'Risk of email account compromise',
            'May end up in spam folders',
            'Users need to maintain secure email accounts'
        ]
    },
    app: {
        title: 'App-Based OTP (TOTP)',
        icon: '📲',
        description: 'Time-based One-Time Password (TOTP) uses authenticator apps like Google Authenticator, Microsoft Authenticator, or Authy to generate verification codes.',
        features: [
            'Offline Functionality: Generates codes without internet connection',
            'Enhanced Security: Based on cryptographic algorithms (HMAC-SHA1)',
            'Industry Standard: Follows RFC 6238 specification',
            'No Communication Costs: No SMS or email fees',
            'Multiple Account Support: One app can manage many accounts'
        ],
        implementation: [
            'Generate unique secret keys for each user',
            'Provide QR codes for easy setup',
            'Support manual entry of secret keys',
            'Implement time synchronization tolerance (±30 seconds)',
            'Provide backup codes for account recovery'
        ],
        considerations: [
            'Requires smartphone with authenticator app',
            'Initial setup slightly more complex than SMS',
            'Device loss requires recovery process',
            'Time synchronization issues can cause failures',
            'Users need to understand app-based authentication'
        ]
    },
    biometric: {
        title: 'Biometric Authentication',
        icon: '👆',
        description: 'Biometric authentication uses unique physical characteristics like fingerprints, facial recognition, or iris scans for secure, passwordless verification.',
        features: [
            'Passwordless Experience: No codes or passwords to remember',
            'Highest Security: Biometrics are unique and difficult to replicate',
            'Fast Authentication: Verification in under a second',
            'Cannot Be Shared: Inherently tied to the individual',
            'User-Friendly: Natural and intuitive authentication method'
        ],
        implementation: [
            'Integrate with device biometric APIs (Touch ID, Face ID, Windows Hello)',
            'Implement FIDO2/WebAuthn standards',
            'Store biometric templates securely (never raw data)',
            'Provide fallback authentication methods',
            'Ensure compliance with biometric data regulations'
        ],
        considerations: [
            'Requires compatible hardware (fingerprint reader, camera)',
            'Privacy concerns regarding biometric data storage',
            'False acceptance/rejection rates to consider',
            'Difficult to change if compromised',
            'May not work for all users (accessibility concerns)'
        ]
    },
    hardware: {
        title: 'Hardware Security Tokens',
        icon: '🔑',
        description: 'Physical security keys like YubiKey provide the strongest protection against phishing and account takeover attacks through cryptographic authentication.',
        features: [
            'Phishing-Resistant: Cryptographic verification prevents phishing attacks',
            'No Battery Required: Many tokens use NFC or USB power',
            'Durable: Built to withstand physical wear and tear',
            'FIDO2 Compliant: Supports modern authentication standards',
            'Multi-Protocol: Works with various authentication protocols'
        ],
        implementation: [
            'Deploy FIDO2/WebAuthn compatible tokens',
            'Configure token registration workflows',
            'Implement token management system',
            'Provide user training and documentation',
            'Establish token replacement procedures'
        ],
        considerations: [
            'Initial hardware cost per user',
            'Physical token can be lost or stolen',
            'Requires USB port or NFC capability',
            'Users must carry the token',
            'Need backup authentication methods'
        ]
    }
};

function openModal(method) {
    const content = modalContent[method];

    if (!content) {
        console.error('Modal content not found for:', method);
        return;
    }

    modalBody.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${content.icon}</div>
            <h2>${content.title}</h2>
        </div>
        <p class="modal-description">${content.description}</p>
        
        <div class="modal-section">
            <h3>✨ Key Features</h3>
            <ul class="modal-list">
                ${content.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modal-section">
            <h3>🔧 Implementation Steps</h3>
            <ul class="modal-list">
                ${content.implementation.map(step => `<li>${step}</li>`).join('')}
            </ul>
        </div>
        
        <div class="modal-section">
            <h3>⚠️ Considerations</h3>
            <ul class="modal-list considerations">
                ${content.considerations.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;

    modal.classList.add('active');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Add animation
    setTimeout(() => {
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.opacity = '0';

    setTimeout(() => {
        modal.classList.remove('active');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
        closeModal();
    }
});

// Form Submission
const contactForm = document.querySelector('.contact-form');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form data
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        company: document.getElementById('company').value,
        message: document.getElementById('message').value
    };

    // Simulate form submission
    alert('Thank you for your message! We will get back to you soon.');
    contactForm.reset();
});

// Scroll Animation for Elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.method-card, .integration-card, .arch-feature').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Active Navigation on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
});

// Hacker Typing Effect for Section Titles
function hackerType(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    const typing = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(typing);
        }
    }, speed);
}

// Apply typing effect to section titles when they come into view
const typingObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.typed) {
            const text = entry.target.textContent;
            hackerType(entry.target, text, 30);
            entry.target.dataset.typed = 'true';
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.section-title').forEach(title => {
    typingObserver.observe(title);
});

// Random Glitch Effect on Cards
function randomGlitch() {
    const cards = document.querySelectorAll('.method-card, .demo-card, .integration-card');
    const randomCard = cards[Math.floor(Math.random() * cards.length)];

    if (randomCard) {
        randomCard.style.transform = 'translate(' + (Math.random() * 4 - 2) + 'px, ' + (Math.random() * 4 - 2) + 'px)';
        setTimeout(() => {
            randomCard.style.transform = '';
        }, 50);
    }
}

setInterval(randomGlitch, 3000);

// Add cyber sound effect simulation (visual feedback)
function cyberClick(element) {
    element.style.boxShadow = '0 0 50px rgba(0, 255, 0, 1)';
    setTimeout(() => {
        element.style.boxShadow = '';
    }, 100);
}

document.querySelectorAll('.btn, .btn-learn-more, .btn-primary, .btn-secondary').forEach(btn => {
    btn.addEventListener('click', function () {
        cyberClick(this);
    });
});

// Toggle Setup Guide Expansion
function toggleGuide(button) {
    const guideCard = button.closest('.guide-card');
    const guideContent = guideCard.querySelector('.guide-content');

    if (guideContent.classList.contains('expanded')) {
        guideContent.classList.remove('expanded');
        button.textContent = 'Show Full Guide';
        button.classList.remove('expanded');
    } else {
        guideContent.classList.add('expanded');
        button.textContent = 'Hide Guide';
        button.classList.add('expanded');
    }
}

// VPN Simulator
const vpnServers = [
    { country: 'United States', city: 'New York', flag: '🇺🇸', ping: 25, ip: '192.168.1.100' },
    { country: 'United States', city: 'Los Angeles', flag: '🇺🇸', ping: 30, ip: '192.168.1.101' },
    { country: 'United Kingdom', city: 'London', flag: '🇬🇧', ping: 45, ip: '192.168.2.100' },
    { country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', ping: 40, ip: '192.168.3.100' },
    { country: 'France', city: 'Paris', flag: '🇫🇷', ping: 42, ip: '192.168.4.100' },
    { country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', ping: 38, ip: '192.168.5.100' },
    { country: 'Japan', city: 'Tokyo', flag: '🇯🇵', ping: 120, ip: '192.168.6.100' },
    { country: 'Singapore', city: 'Singapore', flag: '🇸🇬', ping: 150, ip: '192.168.7.100' },
    { country: 'Australia', city: 'Sydney', flag: '🇦🇺', ping: 180, ip: '192.168.8.100' },
    { country: 'Canada', city: 'Toronto', flag: '🇨🇦', ping: 35, ip: '192.168.9.100' },
    { country: 'Brazil', city: 'São Paulo', flag: '🇧🇷', ping: 140, ip: '192.168.10.100' },
    { country: 'India', city: 'Mumbai', flag: '🇮🇳', ping: 160, ip: '192.168.11.100' },
    { country: 'South Korea', city: 'Seoul', flag: '🇰🇷', ping: 130, ip: '192.168.12.100' },
    { country: 'Spain', city: 'Madrid', flag: '🇪🇸', ping: 50, ip: '192.168.13.100' },
    { country: 'Italy', city: 'Milan', flag: '🇮🇹', ping: 48, ip: '192.168.14.100' }
];

let vpnState = {
    connected: false,
    connecting: false,
    selectedServer: null,
    originalIP: null,
    originalLocation: null,
    originalISP: null,
    connectionStartTime: null,
    connectionTimer: null,
    speedInterval: null
};

// Initialize VPN
window.addEventListener('DOMContentLoaded', () => {
    initializeVPN();
});

function initializeVPN() {
    // Get user's "real" IP (simulated)
    fetchUserIP();

    // Populate servers list
    populateServers();

    // Setup server search
    setupServerSearch();
}

function fetchUserIP() {
    // Simulate fetching user's real IP
    const simulatedIPs = [
        { ip: '203.0.113.45', location: 'New York, USA', isp: 'Comcast' },
        { ip: '198.51.100.78', location: 'London, UK', isp: 'BT Group' },
        { ip: '192.0.2.123', location: 'Toronto, Canada', isp: 'Rogers' }
    ];

    const randomIP = simulatedIPs[Math.floor(Math.random() * simulatedIPs.length)];

    vpnState.originalIP = randomIP.ip;
    vpnState.originalLocation = randomIP.location;
    vpnState.originalISP = randomIP.isp;

    document.getElementById('currentIP').textContent = randomIP.ip;
    document.getElementById('currentLocation').textContent = randomIP.location;
    document.getElementById('currentISP').textContent = randomIP.isp;
    document.getElementById('protocol').textContent = '-';
}

function populateServers() {
    const serversList = document.getElementById('serversList');
    serversList.innerHTML = '';

    vpnServers.forEach((server, index) => {
        const serverItem = document.createElement('div');
        serverItem.className = 'server-item';
        serverItem.onclick = () => selectServer(index);

        const pingClass = server.ping < 50 ? '' : server.ping < 100 ? 'medium' : 'high';

        serverItem.innerHTML = `
            <div class="server-info">
                <span class="server-flag">${server.flag}</span>
                <div class="server-details">
                    <h4>${server.country}</h4>
                    <p>${server.city}</p>
                </div>
            </div>
            <div class="server-ping">
                <span class="ping-indicator ${pingClass}"></span>
                <span>${server.ping}ms</span>
            </div>
        `;

        serversList.appendChild(serverItem);
    });
}

function selectServer(index) {
    vpnState.selectedServer = index;

    // Update UI
    const serverItems = document.querySelectorAll('.server-item');
    serverItems.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    });
}

function setupServerSearch() {
    const searchInput = document.getElementById('serverSearch');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const serverItems = document.querySelectorAll('.server-item');

        serverItems.forEach((item, index) => {
            const server = vpnServers[index];
            const matchesSearch = server.country.toLowerCase().includes(searchTerm) ||
                server.city.toLowerCase().includes(searchTerm);

            item.style.display = matchesSearch ? 'flex' : 'none';
        });
    });
}

function toggleVPN() {
    if (vpnState.connecting) return;

    if (vpnState.connected) {
        disconnectVPN();
    } else {
        connectVPN();
    }
}

function connectVPN() {
    if (vpnState.selectedServer === null) {
        showAlert('Please select a VPN server first');
        return;
    }

    vpnState.connecting = true;
    updateVPNUI('connecting');

    // Simulate connection process
    setTimeout(() => {
        vpnState.connected = true;
        vpnState.connecting = false;
        vpnState.connectionStartTime = Date.now();

        const server = vpnServers[vpnState.selectedServer];

        // Update IP and location
        document.getElementById('currentIP').textContent = server.ip;
        document.getElementById('currentLocation').textContent = `${server.city}, ${server.country}`;
        document.getElementById('currentISP').textContent = 'Secure VPN Network';

        const protocol = document.getElementById('protocolSelect').value;
        document.getElementById('protocol').textContent = protocol;

        updateVPNUI('connected');
        startConnectionTimer();
        startSpeedSimulation();

        // Show stats
        document.getElementById('vpnStats').style.display = 'block';
    }, 2000);
}

function disconnectVPN() {
    vpnState.connected = false;
    vpnState.connecting = false;

    // Restore original IP
    document.getElementById('currentIP').textContent = vpnState.originalIP;
    document.getElementById('currentLocation').textContent = vpnState.originalLocation;
    document.getElementById('currentISP').textContent = vpnState.originalISP;
    document.getElementById('protocol').textContent = '-';

    updateVPNUI('disconnected');
    stopConnectionTimer();
    stopSpeedSimulation();

    // Hide stats
    document.getElementById('vpnStats').style.display = 'none';
}

function updateVPNUI(state) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const connectBtn = document.getElementById('vpnConnectBtn');
    const btnText = connectBtn.querySelector('.btn-text');
    const btnIcon = connectBtn.querySelector('.btn-icon');

    if (state === 'connecting') {
        statusIndicator.className = 'status-indicator connecting';
        statusText.textContent = 'Connecting...';
        connectBtn.className = 'vpn-connect-btn connecting';
        btnText.textContent = 'Connecting...';
        btnIcon.textContent = '⏳';
    } else if (state === 'connected') {
        statusIndicator.className = 'status-indicator connected';
        statusText.textContent = 'Connected - Secure';
        connectBtn.className = 'vpn-connect-btn connected';
        btnText.textContent = 'Disconnect';
        btnIcon.textContent = '✓';
    } else {
        statusIndicator.className = 'status-indicator';
        statusText.textContent = 'Disconnected';
        connectBtn.className = 'vpn-connect-btn';
        btnText.textContent = 'Connect to VPN';
        btnIcon.textContent = '🔌';
    }
}

function startConnectionTimer() {
    vpnState.connectionTimer = setInterval(() => {
        const elapsed = Date.now() - vpnState.connectionStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);

        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('connectionTime').textContent = timeString;
    }, 1000);
}

function stopConnectionTimer() {
    if (vpnState.connectionTimer) {
        clearInterval(vpnState.connectionTimer);
        vpnState.connectionTimer = null;
    }
    document.getElementById('connectionTime').textContent = '00:00:00';
}

function startSpeedSimulation() {
    vpnState.speedInterval = setInterval(() => {
        const downloadSpeed = (Math.random() * 50 + 50).toFixed(1);
        const uploadSpeed = (Math.random() * 20 + 20).toFixed(1);

        document.getElementById('downloadSpeed').textContent = `${downloadSpeed} Mbps`;
        document.getElementById('uploadSpeed').textContent = `${uploadSpeed} Mbps`;
    }, 2000);
}

function stopSpeedSimulation() {
    if (vpnState.speedInterval) {
        clearInterval(vpnState.speedInterval);
        vpnState.speedInterval = null;
    }
    document.getElementById('downloadSpeed').textContent = '0 Mbps';
    document.getElementById('uploadSpeed').textContent = '0 Mbps';
}

function changeProtocol() {
    const protocol = document.getElementById('protocolSelect').value;
    if (vpnState.connected) {
        document.getElementById('protocol').textContent = protocol;
        showAlert(`Protocol changed to ${protocol}`);
    }
}


// Hardware Token + SSO Integration Simulator
let ssoHardwareState = {
    selectedProvider: null,
    authenticated: false,
    registeredTokens: [],
    currentStep: 0,
    sessionId: null
};

// SSO Provider Selection
function selectSSO(provider) {
    ssoHardwareState.selectedProvider = provider;

    const providerNames = {
        'okta': '🔷 Okta',
        'azure': '☁️ Azure AD',
        'google': '🔴 Google Workspace',
        'auth0': '🔶 Auth0'
    };

    document.getElementById('selectedProvider').textContent = `Sign in with ${providerNames[provider]}`;
    document.getElementById('ssoLoginForm').style.display = 'block';

    // Scroll to form
    document.getElementById('ssoLoginForm').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function resetSSO() {
    ssoHardwareState.selectedProvider = null;
    document.getElementById('ssoLoginForm').style.display = 'none';
    document.getElementById('ssoEmail').value = '';
    document.getElementById('ssoPassword').value = '';
}

// Initiate SSO Login
function initiateSSO() {
    const email = document.getElementById('ssoEmail').value;
    const password = document.getElementById('ssoPassword').value;

    if (!email || !password) {
        showAlert('Please enter both email and password');
        return;
    }

    if (!email.includes('@')) {
        showAlert('Please enter a valid email address');
        return;
    }

    // Start authentication flow
    startAuthenticationFlow();
}

// Authentication Flow
function startAuthenticationFlow() {
    // Reset all steps
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed', 'error');
        step.querySelector('.step-status').textContent = '⏳';
    }

    document.getElementById('authResult').style.display = 'none';

    // Step 1: SSO Provider Selection
    updateFlowStep(1, 'active');
    setTimeout(() => {
        updateFlowStep(1, 'completed');

        // Step 2: Credentials Verification
        updateFlowStep(2, 'active');
        setTimeout(() => {
            updateFlowStep(2, 'completed');

            // Step 3: Hardware Token Challenge
            updateFlowStep(3, 'active');
            activateHardwareToken();

        }, 1500);
    }, 1000);
}

function updateFlowStep(stepNumber, status) {
    const step = document.getElementById(`step${stepNumber}`);
    step.classList.remove('active', 'completed', 'error');

    if (status === 'active') {
        step.classList.add('active');
        step.querySelector('.step-status').textContent = '⏳';
    } else if (status === 'completed') {
        step.classList.add('completed');
        step.querySelector('.step-status').textContent = '✅';
    } else if (status === 'error') {
        step.classList.add('error');
        step.querySelector('.step-status').textContent = '❌';
    }
}

// Hardware Token Activation
function activateHardwareToken() {
    const tokenButton = document.getElementById('tokenButton');
    const tokenStatus = document.getElementById('tokenStatus');
    const instructions = document.getElementById('tokenInstructions');

    tokenButton.classList.add('active');
    tokenStatus.innerHTML = '<span class="status-icon">👆</span><span class="status-text">Touch your security key now!</span>';
    instructions.style.display = 'block';

    // Make token button clickable
    tokenButton.onclick = () => touchSecurityKey();
}

function touchSecurityKey() {
    const tokenButton = document.getElementById('tokenButton');
    const tokenStatus = document.getElementById('tokenStatus');

    tokenButton.classList.remove('active');
    tokenButton.onclick = null;

    tokenStatus.innerHTML = '<span class="status-icon">✓</span><span class="status-text">Verifying...</span>';

    // Complete step 3
    updateFlowStep(3, 'completed');

    // Step 4: Token Verification
    updateFlowStep(4, 'active');
    setTimeout(() => {
        updateFlowStep(4, 'completed');

        // Step 5: Session Creation
        updateFlowStep(5, 'active');
        setTimeout(() => {
            updateFlowStep(5, 'completed');
            showAuthenticationSuccess();
        }, 1500);
    }, 2000);
}

function showAuthenticationSuccess() {
    const authResult = document.getElementById('authResult');
    const sessionInfo = document.getElementById('sessionInfo');

    // Generate session ID
    ssoHardwareState.sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
    ssoHardwareState.authenticated = true;

    const email = document.getElementById('ssoEmail').value;
    const provider = ssoHardwareState.selectedProvider;

    sessionInfo.innerHTML = `
        <div class="session-info-item">
            <span class="session-info-label">User:</span>
            <span class="session-info-value">${email}</span>
        </div>
        <div class="session-info-item">
            <span class="session-info-label">Provider:</span>
            <span class="session-info-value">${provider.toUpperCase()}</span>
        </div>
        <div class="session-info-item">
            <span class="session-info-label">Session ID:</span>
            <span class="session-info-value">${ssoHardwareState.sessionId}</span>
        </div>
        <div class="session-info-item">
            <span class="session-info-label">Token Used:</span>
            <span class="session-info-value">YubiKey 5 NFC</span>
        </div>
        <div class="session-info-item">
            <span class="session-info-label">Authenticated:</span>
            <span class="session-info-value">${new Date().toLocaleString()}</span>
        </div>
    `;

    authResult.style.display = 'block';

    // Hide token instructions
    document.getElementById('tokenInstructions').style.display = 'none';

    // Update token status
    document.getElementById('tokenStatus').innerHTML = '<span class="status-icon">✅</span><span class="status-text">Authentication Complete</span>';
}

function resetAuthentication() {
    ssoHardwareState.authenticated = false;
    ssoHardwareState.sessionId = null;

    document.getElementById('authResult').style.display = 'none';
    document.getElementById('tokenInstructions').style.display = 'none';
    document.getElementById('tokenStatus').innerHTML = '<span class="status-icon">⏳</span><span class="status-text">Waiting for SSO login...</span>';

    const tokenButton = document.getElementById('tokenButton');
    tokenButton.classList.remove('active');
    tokenButton.onclick = null;

    resetSSO();

    // Reset all steps
    for (let i = 1; i <= 5; i++) {
        const step = document.getElementById(`step${i}`);
        step.classList.remove('active', 'completed', 'error');
        step.querySelector('.step-status').textContent = '⏳';
    }
}

// Token Registration
function registerNewToken() {
    document.getElementById('tokenModal').style.display = 'flex';
    document.getElementById('regStep1').classList.add('active');
}

function closeTokenModal() {
    document.getElementById('tokenModal').style.display = 'none';

    // Reset registration steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`regStep${i}`).classList.remove('active');
    }

    document.getElementById('tokenName').value = '';
}

function nextRegStep(stepNumber) {
    // Hide current step
    document.querySelectorAll('.reg-step').forEach(step => {
        step.classList.remove('active');
    });

    // Show next step
    document.getElementById(`regStep${stepNumber}`).classList.add('active');
}

function completeRegistration() {
    const tokenName = document.getElementById('tokenName').value || 'My Security Key';

    // Add token to registered list
    const token = {
        id: 'token_' + Math.random().toString(36).substr(2, 9),
        name: tokenName,
        type: 'YubiKey 5 NFC',
        registered: new Date().toLocaleDateString()
    };

    ssoHardwareState.registeredTokens.push(token);

    // Show success step
    nextRegStep(4);

    // Update tokens list
    updateTokensList();
}

function updateTokensList() {
    const tokensList = document.getElementById('tokensList');

    if (ssoHardwareState.registeredTokens.length === 0) {
        tokensList.innerHTML = '<p class="no-tokens">No security keys registered yet</p>';
        return;
    }

    tokensList.innerHTML = '';

    ssoHardwareState.registeredTokens.forEach((token, index) => {
        const tokenItem = document.createElement('div');
        tokenItem.className = 'token-item';
        tokenItem.innerHTML = `
            <div class="token-item-info">
                <span class="token-item-icon">🔑</span>
                <div class="token-item-details">
                    <h5>${token.name}</h5>
                    <p>${token.type} • Registered ${token.registered}</p>
                </div>
            </div>
            <div class="token-item-actions">
                <button class="btn-icon" onclick="removeToken(${index})" title="Remove">🗑️</button>
            </div>
        `;
        tokensList.appendChild(tokenItem);
    });
}

function removeToken(index) {
    if (confirm('Are you sure you want to remove this security key?')) {
        ssoHardwareState.registeredTokens.splice(index, 1);
        updateTokensList();
    }
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    updateTokensList();
});


// Biometric Authentication Simulator
let biometricState = {
    selectedMethod: 'fingerprint',
    scanning: false,
    authenticated: false,
    cameraStream: null,
    webAuthnCredential: null,
    hasRegistered: false
};

// Load WebAuthn credential on page load
window.addEventListener('DOMContentLoaded', () => {
    loadWebAuthnCredential();
});

async function selectBiometricMethod(method) {
    biometricState.selectedMethod = method;

    // Update active card
    document.querySelectorAll('.bio-method-card').forEach(card => {
        card.classList.remove('active');
    });
    document.getElementById(`${method}Card`).classList.add('active');

    // Update scanner display
    const scanners = {
        fingerprint: 'fingerprintScanner',
        face: 'faceScanner',
        iris: 'irisScanner'
    };

    Object.keys(scanners).forEach(key => {
        document.getElementById(scanners[key]).style.display = key === method ? 'flex' : 'none';
    });

    // Update title and check WebAuthn support for fingerprint
    const titles = {
        fingerprint: 'Fingerprint Scanner',
        face: 'Face Recognition',
        iris: 'Iris Scanner'
    };

    let title = titles[method];

    // Check if WebAuthn is available for fingerprint
    if (method === 'fingerprint' && window.PublicKeyCredential) {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (available) {
            title += ' (Device Sensor Available)';
        }
    }

    document.getElementById('scannerTitle').textContent = title;

    // Reset result
    resetBiometric();
}

async function startBiometricScan() {
    if (biometricState.scanning) return;

    const method = biometricState.selectedMethod;

    // Use real fingerprint authentication on supported devices
    if (method === 'fingerprint') {
        const hasFingerprint = await requestFingerprintAuth();
        if (hasFingerprint !== null) {
            return; // WebAuthn handled authentication
        }
        // If WebAuthn not available, continue with simulation
    }

    // Request camera permission for face recognition and iris scan
    if (method === 'face' || method === 'iris') {
        const hasPermission = await requestCameraPermission(method);
        if (!hasPermission) {
            return; // Permission denied, stop here
        }
    }

    biometricState.scanning = true;

    const scanButton = document.getElementById('scanButton');
    const scanProgress = document.getElementById('scanProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const resultDisplay = document.getElementById('resultDisplay');

    // Disable button
    scanButton.disabled = true;
    scanButton.textContent = 'Scanning...';

    // Show progress
    scanProgress.style.display = 'block';

    // Add scanning class to sensor
    if (method === 'fingerprint') {
        document.getElementById('fingerprintSensor').classList.add('scanning');
    } else if (method === 'face') {
        document.querySelector('.face-outline').classList.add('scanning');
        // Show camera feed if available
        if (biometricState.cameraStream) {
            showCameraFeed();
        }
    } else if (method === 'iris') {
        document.querySelector('.iris-outline').classList.add('scanning');
        // Show camera feed if available
        if (biometricState.cameraStream) {
            showCameraFeed();
        }
    }

    // Update result display
    resultDisplay.className = 'result-display';
    resultDisplay.innerHTML = `
        <div class="result-icon">🔍</div>
        <h4>Scanning in progress...</h4>
        <p>Please hold still</p>
    `;

    // Simulate scanning progress
    let progress = 0;
    const scanInterval = setInterval(() => {
        progress += 5;
        progressFill.style.width = progress + '%';
        progressText.textContent = `Scanning... ${progress}%`;

        if (progress >= 100) {
            clearInterval(scanInterval);
            completeBiometricScan();
        }
    }, 100);
}

// Request Fingerprint Authentication (WebAuthn)
async function requestFingerprintAuth() {
    try {
        // Check if WebAuthn is supported
        if (!window.PublicKeyCredential) {
            console.log('WebAuthn not supported, using simulation');
            return null; // Fall back to simulation
        }

        // Check if platform authenticator is available
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();

        if (!available) {
            console.log('Platform authenticator not available, using simulation');
            return null; // Fall back to simulation
        }

        // Show requesting modal
        showPermissionModal(
            'Fingerprint Authentication',
            'Please use your device fingerprint sensor to authenticate.',
            'requesting'
        );

        // Check if user has registered credentials
        if (!biometricState.webAuthnCredential) {
            // First time - register credential
            await registerWebAuthnCredential();
        } else {
            // Authenticate with existing credential
            await authenticateWebAuthn();
        }

        return true;

    } catch (error) {
        console.error('WebAuthn error:', error);

        let errorMessage = 'Fingerprint authentication failed. ';

        if (error.name === 'NotAllowedError') {
            errorMessage += 'Authentication was cancelled or timed out.';
        } else if (error.name === 'InvalidStateError') {
            errorMessage += 'This device is already registered.';
        } else if (error.name === 'NotSupportedError') {
            errorMessage += 'This device does not support fingerprint authentication.';
        } else {
            errorMessage += 'Please try again or use simulation mode.';
        }

        showPermissionModal(
            'Authentication Failed',
            errorMessage,
            'error'
        );

        return false;
    }
}

// Register WebAuthn Credential
async function registerWebAuthnCredential() {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialCreationOptions = {
        challenge: challenge,
        rp: {
            name: "MFA Solutions Demo",
            id: window.location.hostname
        },
        user: {
            id: new Uint8Array(16),
            name: "demo@mfasolutions.com",
            displayName: "Demo User"
        },
        pubKeyCredParams: [
            { alg: -7, type: "public-key" },  // ES256
            { alg: -257, type: "public-key" } // RS256
        ],
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            requireResidentKey: false,
            userVerification: "required"
        },
        timeout: 60000,
        attestation: "none"
    };

    const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
    });

    // Store credential ID
    biometricState.webAuthnCredential = {
        id: credential.id,
        rawId: credential.rawId,
        type: credential.type
    };

    // Save to localStorage
    localStorage.setItem('webauthn_credential', JSON.stringify({
        id: credential.id,
        type: credential.type
    }));

    // Show success and complete authentication
    showPermissionModal(
        'Fingerprint Registered',
        'Your fingerprint has been registered successfully!',
        'success'
    );

    setTimeout(() => {
        closePermissionModal();
        showFingerprintSuccess();
    }, 1500);
}

// Authenticate with WebAuthn
async function authenticateWebAuthn() {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    const publicKeyCredentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [{
            id: biometricState.webAuthnCredential.rawId,
            type: 'public-key',
            transports: ['internal']
        }],
        timeout: 60000,
        userVerification: "required"
    };

    const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
    });

    // Show success
    showPermissionModal(
        'Authentication Successful',
        'Fingerprint verified successfully!',
        'success'
    );

    setTimeout(() => {
        closePermissionModal();
        showFingerprintSuccess();
    }, 1500);
}

// Show Fingerprint Success Result
function showFingerprintSuccess() {
    const resultDisplay = document.getElementById('resultDisplay');
    const biometricInfo = document.getElementById('biometricInfo');

    // Success
    resultDisplay.className = 'result-display success';
    resultDisplay.innerHTML = `
        <div class="result-icon">✅</div>
        <h4>Authentication Successful!</h4>
        <p>Fingerprint verified using device sensor</p>
    `;

    // Show biometric info
    const quality = 'Excellent';
    const score = (Math.random() * 5 + 95).toFixed(1);

    document.getElementById('infoMethod').textContent = 'Fingerprint (WebAuthn)';
    document.getElementById('infoQuality').textContent = quality;
    document.getElementById('infoScore').textContent = score + '%';
    document.getElementById('infoTime').textContent = new Date().toLocaleTimeString();

    biometricInfo.style.display = 'block';
    biometricState.authenticated = true;
}

// Load saved WebAuthn credential
function loadWebAuthnCredential() {
    const saved = localStorage.getItem('webauthn_credential');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // Note: We can't restore rawId from localStorage, so we'll need to re-register
            // This is just to check if user has registered before
            biometricState.hasRegistered = true;
        } catch (e) {
            console.error('Error loading credential:', e);
        }
    }
}

// Request Camera Permission
async function requestCameraPermission(method) {
    const methodName = method === 'face' ? 'Face Recognition' : 'Iris Scanning';

    try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showPermissionModal(
                'Camera Not Supported',
                'Your browser does not support camera access. Please use a modern browser like Chrome, Firefox, or Safari.',
                'error'
            );
            return false;
        }

        // Show permission request modal
        showPermissionModal(
            `Camera Access Required`,
            `${methodName} requires camera access. Please allow camera permission when prompted.`,
            'requesting'
        );

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        // Store stream
        biometricState.cameraStream = stream;

        // Show success
        showPermissionModal(
            'Camera Access Granted',
            `Camera access granted successfully. Starting ${methodName.toLowerCase()}...`,
            'success'
        );

        // Close modal after 1 second
        setTimeout(() => {
            closePermissionModal();
        }, 1000);

        return true;

    } catch (error) {
        console.error('Camera permission error:', error);

        let errorMessage = 'Camera access was denied. Please allow camera permission in your browser settings.';

        if (error.name === 'NotAllowedError') {
            errorMessage = 'Camera access was denied. Please click the camera icon in your browser\'s address bar and allow camera access.';
        } else if (error.name === 'NotFoundError') {
            errorMessage = 'No camera found. Please connect a camera and try again.';
        } else if (error.name === 'NotReadableError') {
            errorMessage = 'Camera is already in use by another application. Please close other apps using the camera.';
        }

        showPermissionModal(
            'Camera Access Denied',
            errorMessage,
            'error'
        );

        return false;
    }
}

// Show Permission Modal
function showPermissionModal(title, message, type) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('permissionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'permissionModal';
        modal.className = 'permission-modal';
        modal.innerHTML = `
            <div class="permission-modal-content">
                <div class="permission-icon" id="permissionIcon"></div>
                <h3 id="permissionTitle"></h3>
                <p id="permissionMessage"></p>
                <button class="btn btn-primary" id="permissionClose" onclick="closePermissionModal()">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Update content
    document.getElementById('permissionTitle').textContent = title;
    document.getElementById('permissionMessage').textContent = message;

    const iconElement = document.getElementById('permissionIcon');
    const closeButton = document.getElementById('permissionClose');

    if (type === 'requesting') {
        iconElement.textContent = '📷';
        iconElement.className = 'permission-icon requesting';
        closeButton.style.display = 'none';
    } else if (type === 'success') {
        iconElement.textContent = '✅';
        iconElement.className = 'permission-icon success';
        closeButton.style.display = 'none';
    } else if (type === 'error') {
        iconElement.textContent = '❌';
        iconElement.className = 'permission-icon error';
        closeButton.style.display = 'block';
    }

    modal.style.display = 'flex';
}

// Close Permission Modal
function closePermissionModal() {
    const modal = document.getElementById('permissionModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Show Camera Feed
function showCameraFeed() {
    const method = biometricState.selectedMethod;
    let videoContainer;

    if (method === 'face') {
        videoContainer = document.querySelector('.face-icon');
    } else if (method === 'iris') {
        videoContainer = document.querySelector('.iris-icon');
    }

    if (videoContainer && biometricState.cameraStream) {
        // Create video element if it doesn't exist
        let video = document.getElementById('biometricVideo');
        if (!video) {
            video = document.createElement('video');
            video.id = 'biometricVideo';
            video.autoplay = true;
            video.playsInline = true;
            video.muted = true;
            video.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
                position: absolute;
                top: 0;
                left: 0;
            `;
        }

        video.srcObject = biometricState.cameraStream;
        videoContainer.style.position = 'relative';
        videoContainer.appendChild(video);
    }
}

// Stop Camera Feed
function stopCameraFeed() {
    if (biometricState.cameraStream) {
        biometricState.cameraStream.getTracks().forEach(track => track.stop());
        biometricState.cameraStream = null;
    }

    const video = document.getElementById('biometricVideo');
    if (video) {
        video.remove();
    }
}

function completeBiometricScan() {
    const method = biometricState.selectedMethod;
    const resultDisplay = document.getElementById('resultDisplay');
    const biometricInfo = document.getElementById('biometricInfo');
    const scanButton = document.getElementById('scanButton');

    // Stop camera feed after scan
    if (method === 'face' || method === 'iris') {
        setTimeout(() => {
            stopCameraFeed();
        }, 1000);
    }

    // Remove scanning class
    if (method === 'fingerprint') {
        document.getElementById('fingerprintSensor').classList.remove('scanning');
    } else if (method === 'face') {
        document.querySelector('.face-outline').classList.remove('scanning');
    } else if (method === 'iris') {
        document.querySelector('.iris-outline').classList.remove('scanning');
    }

    // Simulate authentication (90% success rate)
    const success = Math.random() > 0.1;

    if (success) {
        // Success
        resultDisplay.className = 'result-display success';
        resultDisplay.innerHTML = `
            <div class="result-icon">✅</div>
            <h4>Authentication Successful!</h4>
            <p>Identity verified</p>
        `;

        // Show biometric info
        const methodNames = {
            fingerprint: 'Fingerprint',
            face: 'Face Recognition',
            iris: 'Iris Scan'
        };

        const quality = ['Excellent', 'Good', 'Fair'][Math.floor(Math.random() * 3)];
        const score = (Math.random() * 10 + 90).toFixed(1);

        document.getElementById('infoMethod').textContent = methodNames[method];
        document.getElementById('infoQuality').textContent = quality;
        document.getElementById('infoScore').textContent = score + '%';
        document.getElementById('infoTime').textContent = new Date().toLocaleTimeString();

        biometricInfo.style.display = 'block';
        biometricState.authenticated = true;
    } else {
        // Failure
        resultDisplay.className = 'result-display error';
        resultDisplay.innerHTML = `
            <div class="result-icon">❌</div>
            <h4>Authentication Failed</h4>
            <p>Please try again</p>
        `;

        biometricInfo.style.display = 'none';
    }

    // Reset button
    scanButton.disabled = false;
    scanButton.textContent = 'Start Scan';
    biometricState.scanning = false;

    // Hide progress after delay
    setTimeout(() => {
        document.getElementById('scanProgress').style.display = 'none';
        document.getElementById('progressFill').style.width = '0%';
        document.getElementById('progressText').textContent = 'Scanning... 0%';
    }, 1000);
}

function resetBiometric() {
    biometricState.authenticated = false;
    biometricState.scanning = false;

    // Stop camera feed
    stopCameraFeed();

    const resultDisplay = document.getElementById('resultDisplay');
    const biometricInfo = document.getElementById('biometricInfo');
    const scanButton = document.getElementById('scanButton');

    resultDisplay.className = 'result-display';
    resultDisplay.innerHTML = `
        <div class="result-icon">⏳</div>
        <h4>Waiting for scan...</h4>
        <p>Select a method and start scanning</p>
    `;

    biometricInfo.style.display = 'none';
    scanButton.disabled = false;
    scanButton.textContent = 'Start Scan';

    document.getElementById('scanProgress').style.display = 'none';
    document.getElementById('progressFill').style.width = '0%';
    document.getElementById('progressText').textContent = 'Scanning... 0%';

    // Remove scanning classes
    document.getElementById('fingerprintSensor').classList.remove('scanning');
    const faceOutline = document.querySelector('.face-outline');
    const irisOutline = document.querySelector('.iris-outline');
    if (faceOutline) faceOutline.classList.remove('scanning');
    if (irisOutline) irisOutline.classList.remove('scanning');
}
