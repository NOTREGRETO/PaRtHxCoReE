// Enhanced Input Validation and UX Improvements

// Auto-format phone number input based on country
document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.getElementById('smsPhone');
    const countrySelect = document.getElementById('countryCode');
    
    if (phoneInput && countrySelect) {
        phoneInput.addEventListener('input', (e) => {
            const countryCode = countrySelect.value;
            let value = e.target.value.replace(/\D/g, '');
            
            // Format based on country code
            if (countryCode === '+1') {
                // US/Canada format: (555) 123-4567
                if (value.length > 0) {
                    if (value.length <= 3) {
                        value = value;
                    } else if (value.length <= 6) {
                        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                    } else {
                        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                    }
                }
            } else if (countryCode === '+44') {
                // UK format: 7700 900123
                if (value.length > 4) {
                    value = `${value.slice(0, 4)} ${value.slice(4, 10)}`;
                }
            } else if (countryCode === '+91') {
                // India format: 98765 43210
                if (value.length > 5) {
                    value = `${value.slice(0, 5)} ${value.slice(5, 10)}`;
                }
            } else if (countryCode === '+81') {
                // Japan format: 90-1234-5678
                if (value.length > 2) {
                    if (value.length <= 6) {
                        value = `${value.slice(0, 2)}-${value.slice(2)}`;
                    } else {
                        value = `${value.slice(0, 2)}-${value.slice(2, 6)}-${value.slice(6, 10)}`;
                    }
                }
            } else if (countryCode === '+55') {
                // Brazil format: (11) 98765-4321
                if (value.length > 2) {
                    if (value.length <= 7) {
                        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                    } else {
                        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
                    }
                }
            } else {
                // Default: space every 3-4 digits
                if (value.length > 3) {
                    value = value.match(/.{1,3}/g).join(' ');
                }
            }
            
            e.target.value = value;
        });
        
        // Initialize placeholder
        updatePhonePlaceholder();
    }

    // Auto-format OTP inputs (only allow numbers, max 6 digits)
    const otpInputs = ['smsVerify', 'emailVerify', 'appVerify'];
    otpInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
            });

            // Auto-submit on 6 digits
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 6) {
                    // Trigger verification automatically
                    const verifyBtn = e.target.parentElement.nextElementSibling;
                    if (verifyBtn && verifyBtn.tagName === 'BUTTON') {
                        setTimeout(() => verifyBtn.click(), 300);
                    }
                }
            });

            // Allow paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedText = (e.clipboardData || window.clipboardData).getData('text');
                const numbers = pastedText.replace(/\D/g, '').slice(0, 6);
                e.target.value = numbers;
                
                // Trigger input event for auto-submit
                e.target.dispatchEvent(new Event('input'));
            });
        }
    });

    // Email validation with real-time feedback
    const emailInput = document.getElementById('emailAddress');
    if (emailInput) {
        emailInput.addEventListener('blur', (e) => {
            const email = e.target.value;
            if (email && !isValidEmail(email)) {
                e.target.style.borderColor = '#ef4444';
            } else if (email) {
                e.target.style.borderColor = '#10b981';
            }
        });

        emailInput.addEventListener('focus', (e) => {
            e.target.style.borderColor = '';
        });
    }

    // Username validation
    const usernameInput = document.getElementById('appUsername');
    if (usernameInput) {
        usernameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20);
        });
    }

    // Add Enter key support for all forms
    addEnterKeySupport();
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function addEnterKeySupport() {
    // SMS form
    const smsPhone = document.getElementById('smsPhone');
    if (smsPhone) {
        smsPhone.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = document.querySelector('#smsPhone').parentElement.nextElementSibling;
                if (sendBtn) sendBtn.click();
            }
        });
    }

    // Email form
    const emailAddress = document.getElementById('emailAddress');
    if (emailAddress) {
        emailAddress.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = document.querySelector('#emailAddress').parentElement.nextElementSibling;
                if (sendBtn) sendBtn.click();
            }
        });
    }

    // App form
    const appUsername = document.getElementById('appUsername');
    if (appUsername) {
        appUsername.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const sendBtn = document.querySelector('#appUsername').parentElement.nextElementSibling;
                if (sendBtn) sendBtn.click();
            }
        });
    }

    // Verification inputs
    ['smsVerify', 'emailVerify', 'appVerify'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const verifyBtn = input.parentElement.nextElementSibling;
                    if (verifyBtn && verifyBtn.tagName === 'BUTTON') {
                        verifyBtn.click();
                    }
                }
            });
        }
    });
}

// Add visual feedback for button clicks
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn') || 
        e.target.classList.contains('btn-primary') || 
        e.target.classList.contains('btn-secondary')) {
        
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            width: 100px;
            height: 100px;
            margin-top: -50px;
            margin-left: -50px;
            animation: ripple 0.6s;
            pointer-events: none;
        `;
        
        const rect = e.target.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        
        e.target.style.position = 'relative';
        e.target.style.overflow = 'hidden';
        e.target.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
});

// Add ripple animation CSS
if (!document.getElementById('ripple-animation')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation';
    style.textContent = `
        @keyframes ripple {
            from {
                opacity: 1;
                transform: scale(0);
            }
            to {
                opacity: 0;
                transform: scale(4);
            }
        }
    `;
    document.head.appendChild(style);
}

// Add copy to clipboard functionality for OTP codes
function addCopyFunctionality() {
    const otpDisplays = document.querySelectorAll('.otp-display');
    otpDisplays.forEach(display => {
        display.style.cursor = 'pointer';
        display.title = 'Click to copy';
        
        display.addEventListener('click', () => {
            const code = display.textContent;
            if (code && code !== '------' && /^\d{6}$/.test(code)) {
                navigator.clipboard.writeText(code).then(() => {
                    const originalBg = display.style.background;
                    display.style.background = '#10b981';
                    display.style.color = 'white';
                    
                    setTimeout(() => {
                        display.style.background = originalBg;
                        display.style.color = '';
                    }, 500);
                    
                    showAlert('✅ Code copied to clipboard!', 'success');
                });
            }
        });
    });
}

// Initialize copy functionality after a delay
setTimeout(addCopyFunctionality, 2000);

// Add accessibility improvements
document.addEventListener('DOMContentLoaded', () => {
    // Add ARIA labels
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label')) {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                input.setAttribute('aria-label', label.textContent);
            }
        }
    });

    // Add keyboard navigation hints
    const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-secondary');
    buttons.forEach(btn => {
        btn.setAttribute('role', 'button');
        if (!btn.getAttribute('aria-label')) {
            btn.setAttribute('aria-label', btn.textContent);
        }
    });
});

// Session timeout warning
let sessionTimeout;
let sessionWarningShown = false;

function startSessionTimer() {
    // Clear existing timer
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    // Set 15 minute session timeout
    sessionTimeout = setTimeout(() => {
        if (!sessionWarningShown) {
            sessionWarningShown = true;
            showAlert('⏱️ Your session will expire in 5 minutes due to inactivity', 'warning');
            
            // Final timeout after 5 more minutes
            setTimeout(() => {
                showAlert('🔒 Session expired. Please refresh the page.', 'error');
                // Disable all inputs
                document.querySelectorAll('input, button').forEach(el => el.disabled = true);
            }, 300000); // 5 minutes
        }
    }, 900000); // 15 minutes
}

// Reset session timer on user activity
['click', 'keypress', 'scroll', 'mousemove'].forEach(event => {
    document.addEventListener(event, () => {
        if (!sessionWarningShown) {
            startSessionTimer();
        }
    }, { passive: true });
});

// Start initial session timer
startSessionTimer();
