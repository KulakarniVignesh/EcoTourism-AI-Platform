// Protect route
protectRoute('user');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('userNameDisplay').innerText = localStorage.getItem('name');
    loadMyBookings();
});

async function loadMyBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const bookings = await response.json();
            displayMyBookings(bookings);
        }
    } catch(err) {
        console.error('Error loading bookings');
    }
}

function displayMyBookings(bookings) {
    const list = document.getElementById('bookingsList');
    list.innerHTML = '';
    
    if (bookings.length === 0) {
        list.innerHTML = '<div class="card" style="grid-column: 1 / -1;"><p>You have no bookings yet. Time to explore!</p></div>';
        return;
    }
    
    bookings.forEach(b => {
        const guideName = b.guide_id ? b.guide_id.name : 'Unknown';
        const guideUserId = b.guide_id ? b.guide_id._id : null;
        const date = new Date(b.date).toLocaleDateString();
        
        const card = document.createElement('div');
        card.className = 'card';
        
        let reviewBtn = '';
        if (b.status === 'accepted') {
            reviewBtn = `<button class="btn btn-outline mt-1" style="width: 100%; border-color: var(--accent-color); color: var(--accent-color);" onclick="openReviewModal('${b._id}', '${guideUserId}')">Leave Review</button>`;
        }
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3>Guide: ${guideName}</h3>
                <span class="badge badge-${b.status}">${b.status.toUpperCase()}</span>
            </div>
            <p style="margin-top:0.5rem"><strong>Date:</strong> ${date}</p>
            <p><strong>Message:</strong> ${b.message || 'No message'}</p>
            ${reviewBtn}
        `;
        list.appendChild(card);
    });
}

// Review Logic
const reviewModal = document.getElementById('reviewModal');
const closeReviewModal = document.getElementById('closeReviewModal');
const submitReviewBtn = document.getElementById('submitReviewBtn');
let currentBookingId = null;
let currentGuideId = null;

window.openReviewModal = function(bookingId, guideId) {
    currentBookingId = bookingId;
    currentGuideId = guideId;
    reviewModal.style.display = 'flex';
};

closeReviewModal.addEventListener('click', () => {
    reviewModal.style.display = 'none';
});

submitReviewBtn.addEventListener('click', async () => {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value;
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                booking_id: currentBookingId,
                guide_id: currentGuideId,
                rating: Number(rating),
                comment
            })
        });
        
        if (response.ok) {
            alert('Review submitted successfully!');
            reviewModal.style.display = 'none';
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to submit review');
        }
    } catch(err) {
        alert('Server Error');
    }
});
