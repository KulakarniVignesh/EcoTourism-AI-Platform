document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('userNameDisplay').innerText = `Guide: ${localStorage.getItem('name')}`;
    loadProfile();
    loadBookings();
    loadSettings();
});

async function loadProfile() {
    // ... (Keep existing loadProfile)
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/guides/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const profile = await response.json();
            document.getElementById('guideBio').value = profile.bio || '';
            document.getElementById('guideLocation').value = profile.location || '';
            document.getElementById('guideLanguages').value = profile.languages || '';
            document.getElementById('guideExperience').value = profile.experience || '';
            document.getElementById('guidePrice').value = profile.price || 0;
            document.getElementById('guidePhone').value = profile.phone || '';
        }
    } catch(err) {
        console.error('Error loading profile');
    }
}

document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const currentRole = localStorage.getItem('role');
    if (currentRole !== 'guide') {
        alert('Access Denied: You must be logged in as a Guide.');
        return;
    }

    const bio = document.getElementById('guideBio').value;
    const location = document.getElementById('guideLocation').value;
    const languages = document.getElementById('guideLanguages').value;
    const experience = document.getElementById('guideExperience').value;
    const price = parseFloat(document.getElementById('guidePrice').value) || 0;
    const phone = document.getElementById('guidePhone').value;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/guides/profile`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ bio, location, languages, experience, price, phone })
        });
        
        const data = await response.json();
        if (response.ok) {
            alert('Profile saved successfully!');
            document.getElementById('profileMessage').innerText = 'Profile saved successfully!';
            setTimeout(() => document.getElementById('profileMessage').innerText = '', 3000);
        } else {
            alert(data.message || 'Access denied');
        }
    } catch(err) {
        alert('Server error while saving profile.');
    }
});

async function loadBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/guide-requests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const bookings = await response.json();
            displayBookings(bookings);
        }
    } catch(err) {
        console.error('Error loading bookings');
    }
}

function displayBookings(bookings) {
    const list = document.getElementById('bookingRequests');
    list.innerHTML = '';
    
    if (bookings.length === 0) {
        list.innerHTML = '<div class="card"><p>No booking requests yet.</p></div>';
        return;
    }
    
    bookings.forEach(b => {
        const touristName = b.tourist_id ? b.tourist_id.name : 'Unknown';
        const touristId = b.tourist_id ? (b.tourist_id._id || b.tourist_id.id || b.tourist_id) : null;
        const date = new Date(b.date).toLocaleDateString();
        
        console.log(`[Guide Dashboard] Booking from: ${touristName} (ID: ${touristId})`);
        
        const card = document.createElement('div');
        card.className = 'card mb-1';
        
        // Buttons
        let actionBtns = '';
        if (b.status === 'pending') {
            actionBtns = `
                <div class="mt-1" style="display:flex; gap: 10px;">
                    <button class="btn btn-primary" onclick="updateStatus('${b._id}', 'accepted')">Accept</button>
                    <button class="btn btn-danger" onclick="updateStatus('${b._id}', 'rejected')">Reject</button>
                </div>
            `;
        }

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h4 style="display: flex; align-items: center; gap: 10px;">${touristName}</h4>
                <span class="badge badge-${b.status}">${b.status.toUpperCase()}</span>
            </div>
            <p style="margin-top:0.5rem"><strong>Date:</strong> ${date}</p>
            <p><strong>Message:</strong> ${b.message || 'No message provided.'}</p>
            ${actionBtns}
        `;
        list.appendChild(card);
    });
}

window.updateStatus = async function(bookingId, status) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });
        
        if (response.ok) {
            loadBookings();
        } else {
            alert('Failed to update status');
        }
    } catch(err) {
        alert('Error updating status');
    }
}

// --- Settings Logic ---
async function loadSettings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const user = await response.json();
            document.getElementById('settingsName').value = user.name || '';
            document.getElementById('settingsEmail').value = user.email || '';
        }
    } catch (err) {
        console.error('Error loading settings', err);
    }
}

document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('settingsName').value;
    const email = document.getElementById('settingsEmail').value;
    const msg = document.getElementById('settingsMessage');
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, email })
        });
        
        if (response.ok) {
            msg.innerText = 'Profile updated successfully!';
            msg.style.color = '#2F855A';
            localStorage.setItem('name', name);
            document.getElementById('userNameDisplay').innerText = `Guide: ${name}`;
        } else {
            msg.innerText = 'Failed to update profile.';
            msg.style.color = '#C53030';
        }
    } catch (err) {
        msg.innerText = 'Server error.';
        msg.style.color = '#C53030';
    }
});

document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    if (confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/auth/me`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                alert('Account deleted successfully.');
                localStorage.clear();
                window.location.href = 'login.html';
            } else {
                alert('Failed to delete account.');
            }
        } catch (err) {
            alert('Server error.');
        }
    }
});
