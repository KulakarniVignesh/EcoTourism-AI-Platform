const API_URL = "https://ecotourism-ai-platform.onrender.com/api";

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Forgot Password Flow ---
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('forgotEmail').value;
            const msgDiv = document.getElementById('forgotMessage');
            
            msgDiv.innerText = 'Sending request...';
            msgDiv.style.color = '#4A5568';
            
            try {
                const response = await fetch(`${API_URL}/auth/forgot-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    msgDiv.innerHTML = `<span style="color: #2F855A;">Success!</span><br><br>For testing purposes, here is your reset link:<br><a href="${data.resetUrl}" style="color: #4299E1; text-decoration: underline;">${data.resetUrl}</a>`;
                } else {
                    msgDiv.innerText = data.message || 'Failed to send reset request.';
                    msgDiv.style.color = '#C53030';
                }
            } catch (err) {
                msgDiv.innerText = 'Server connection failed.';
                msgDiv.style.color = '#C53030';
            }
        });
    }

    // --- Reset Password Flow ---
    const resetForm = document.getElementById('resetPasswordForm');
    if (resetForm) {
        resetForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Extract token from URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const msgDiv = document.getElementById('resetMessage');
            
            if (!token) {
                msgDiv.innerText = 'Invalid or missing reset token.';
                msgDiv.style.color = '#C53030';
                return;
            }
            
            const password = document.getElementById('newPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            
            if (password !== confirm) {
                msgDiv.innerText = 'Passwords do not match!';
                msgDiv.style.color = '#C53030';
                return;
            }
            
            msgDiv.innerText = 'Resetting password...';
            msgDiv.style.color = '#4A5568';
            
            try {
                const response = await fetch(`${API_URL}/auth/reset-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    msgDiv.innerText = 'Password reset successfully! Redirecting to login...';
                    msgDiv.style.color = '#2F855A';
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                } else {
                    msgDiv.innerText = data.message || 'Failed to reset password.';
                    msgDiv.style.color = '#C53030';
                }
            } catch (err) {
                msgDiv.innerText = 'Server connection failed.';
                msgDiv.style.color = '#C53030';
            }
        });
    }
});
