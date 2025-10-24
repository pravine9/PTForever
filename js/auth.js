// Password authentication for our private website
// This keeps our special memories safe and just between us

// The password to access the site
const SITE_PASSWORD = 'PTForever';

// Check if already authenticated
function isAuthenticated() {
    const authToken = sessionStorage.getItem('siteAuth');
    return authToken === 'authenticated';
}

// Authenticate the user
function authenticate(password) {
    if (password === SITE_PASSWORD) {
        sessionStorage.setItem('siteAuth', 'authenticated');
        return true;
    }
    return false;
}

// Show the password screen
function showPasswordScreen() {
    // Create the password overlay
    const overlay = document.createElement('div');
    overlay.id = 'authOverlay';
    overlay.innerHTML = `
        <div class="auth-container">
            <div class="auth-header">
                <h1>P&T Forever ∞</h1>
                <p>All our memories</p>
            </div>
            <div class="auth-body">
                <p class="auth-message">Enter the password to access the site</p>
                <input type="password" id="authPassword" placeholder="Enter password" autocomplete="off">
                <button id="authSubmit">Unlock</button>
                <p id="authError" class="auth-error"></p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Focus on the password input
    setTimeout(() => {
        document.getElementById('authPassword').focus();
    }, 100);

    // Handle submit button click
    document.getElementById('authSubmit').addEventListener('click', handleAuth);

    // Handle Enter key press
    document.getElementById('authPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAuth();
        }
    });
}

// Handle authentication attempt
function handleAuth() {
    const password = document.getElementById('authPassword').value;
    const errorElement = document.getElementById('authError');

    if (authenticate(password)) {
        // Success! Remove the overlay
        const overlay = document.getElementById('authOverlay');
        overlay.classList.add('fade-out');
        setTimeout(() => {
            overlay.remove();
        }, 300);
    } else {
        // Wrong password
        errorElement.textContent = 'Incorrect password. Try again!';
        document.getElementById('authPassword').value = '';
        document.getElementById('authPassword').focus();
        
        // Shake animation
        const container = document.querySelector('.auth-container');
        container.classList.add('shake');
        setTimeout(() => {
            container.classList.remove('shake');
        }, 500);
    }
}

// Initialize authentication check when page loads
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        showPasswordScreen();
    }
});

