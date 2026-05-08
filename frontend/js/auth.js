const API_URL = 'http://localhost:5000/api';

// Handle Registration
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const role = document.getElementById('role').value;
        const errorElem = document.getElementById('signupError');

        // Clear error element before new request
        errorElem.innerText = '';

        console.log("Selected role:", role);

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful');
                window.location.href = 'login.html';
            } else {
                // Display error strictly from backend
                // Filtering out deep backend database diagnostics from UI rendering per requirements
                if (data.message && data.message.includes('Database')) {
                     errorElem.innerText = 'Server processing failed. Please try again.';
                } else {
                     errorElem.innerText = data.message || 'Registration failed';
                }
            }
        } catch (error) {
            console.error('Connection Error:', error);
            errorElem.innerText = 'Server connection failed. Please ensure the backend is running.';
        }
    });
}

// Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const role = document.getElementById('loginRole').value;
        const errorElem = document.getElementById('loginError');

        // IMPORTANT: Clear old token and role before login to prevent caching issues
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        console.log(`Cleaning old session. Starting fresh login for ${email}...`);

        // Clear error element before new request
        errorElem.innerText = '';

        try {
            console.log(`Attempting login for ${email} as ${role}...`);
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('name', data.name);
                
                // Final role-based redirection
                window.location.href = data.role === 'guide' ? 'guide-dashboard.html' : 'user-dashboard.html';
            } else {
                 if (data.message && data.message.includes('Database')) {
                     errorElem.innerText = 'Server processing failed. Please try again.';
                 } else {
                     errorElem.innerText = data.message || 'Login failed';
                 }
            }
        } catch (error) {
            console.error('Fetch error:', error);
            errorElem.innerText = 'Server connection failed';
        }
    });
}

// Global Logout function
window.logout = function() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
    window.location.href = 'index.html';
};

// Protect Routes utility
function protectRoute(requiredRole) {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    if (requiredRole && role !== requiredRole) {
        console.warn(`Access Denied: Required ${requiredRole}, but user is ${role}. Redirecting...`);
        window.location.href = role === 'guide' ? 'guide-dashboard.html' : 'user-dashboard.html';
    }
}
