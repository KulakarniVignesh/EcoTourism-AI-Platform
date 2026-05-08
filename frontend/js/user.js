// Protect route
protectRoute('user');

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('userNameDisplay').innerText = `Welcome, ${localStorage.getItem('name')}`;
    loadGuides();
    loadSettings();
});

let allGuides = [];
let selectedGuideId = null;

async function loadGuides() {
    try {
        const response = await fetch(`${API_URL}/guides`);
        allGuides = await response.json();
        displayGuides(allGuides);
    } catch (error) {
        console.error('Error fetching guides:', error);
    }
}

function displayGuides(guides) {
    const grid = document.getElementById('guidesGrid');
    grid.innerHTML = '';

    if (guides.length === 0) {
        grid.innerHTML = '<p>No guides available.</p>';
        return;
    }

    guides.forEach(guide => {
        const name = guide.user_id ? guide.user_id.name : 'Unknown';
        const card = document.createElement('div');
        card.className = 'card';
        const rating = guide.rating ? guide.rating.toFixed(1) : '0.0';
        const reviews = guide.totalReviews || 0;
        const role = localStorage.getItem('role');

        // Only show booking & chat buttons if user is a Tourist (user)
        let actionButtons = '';
        if (role === 'user' && guide.user_id) {
            const recipientId = guide.user_id._id || guide.user_id.id || guide.user_id;

            actionButtons = `
                <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="openBookingModal('${recipientId}', '${name}')">Book Guide</button>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline" style="flex: 1; border-color: #48BB78; color: #2F855A;" onclick="whatsappGuide('${guide.phone}')">💬 WhatsApp</button>
                        <button class="btn btn-outline" style="flex: 1" onclick="callGuide('${guide.phone}')">📞 Call</button>
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <h3>${name}</h3>
            <p><strong>Location:</strong> ${guide.location || 'N/A'}</p>
            <p><strong>Phone:</strong> ${guide.phone || 'N/A'}</p>
            <p><strong>Languages:</strong> ${guide.languages || 'N/A'}</p>
            <p><strong>Experience:</strong> ${guide.experience || 'N/A'}</p>
            <p><strong>Price:</strong> $${guide.price}/day</p>
            <p><strong>Rating:</strong> ⭐ ${rating} (${reviews} reviews)</p>
            <p style="font-size: 0.9rem; color: #4A5568;">"${guide.bio || ''}"</p>
            ${actionButtons}
        `;
        grid.appendChild(card);
    });
}

// Search functionality
document.getElementById('searchGuide').addEventListener('input', (e) => {
    const text = e.target.value.toLowerCase();
    const filtered = allGuides.filter(g => 
        (g.location && g.location.toLowerCase().includes(text)) || 
        (g.languages && g.languages.toLowerCase().includes(text))
    );
    displayGuides(filtered);
});

// Modal logic
const modal = document.getElementById('bookingModal');
const closeModalBtn = document.getElementById('closeModal');
const submitBookingBtn = document.getElementById('submitBooking');

window.openBookingModal = function(guideId, guideName) {
    selectedGuideId = guideId;
    document.getElementById('modalGuideName').innerText = guideName;
    modal.style.display = 'flex';
};

closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

submitBookingBtn.addEventListener('click', async () => {
    const role = localStorage.getItem('role');
    if (role !== 'user') {
        alert('Only tourists can book guides.');
        return;
    }

    const date = document.getElementById('bookingDate').value;
    const message = document.getElementById('bookingMessage').value;

    if(!date) return alert('Please select a date.');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ guide_id: selectedGuideId, date, message })
        });

        if (response.ok) {
            alert('Booking request sent successfully!');
            modal.style.display = 'none';
        } else {
            const data = await response.json();
            alert(data.message || 'Failed to book');
        }
    } catch (err) {
        alert('Server Error');
    }
});
// --- Travel Services Logic ---

window.bookTransport = async function() {
    const searchVal = document.getElementById('searchGuide').value.trim();
    let url = "https://www.makemytrip.com/bus-tickets/";
    
    if (searchVal) {
        // Smart URL formatting: location-bus-tickets.html
        const loc = searchVal.toLowerCase().replace(/\s+/g, '-');
        url = `https://www.makemytrip.com/bus-tickets/${loc}-bus-tickets.html`;
    }
    
    await logActivity('transport_booking', url);
    window.open(url, "_blank");
}

window.bookAccommodation = async function() {
    const searchVal = document.getElementById('searchGuide').value.trim();
    let url = "https://www.booking.com/";
    
    if (searchVal) {
        const loc = encodeURIComponent(searchVal);
        url = `https://www.booking.com/searchresults.html?ss=${loc}`;
    }
    
    await logActivity('hotel_booking', url);
    window.open(url, "_blank");
}

async function logActivity(action, details) {
    try {
        const token = localStorage.getItem('token');
        // Sending to auth/activity as configured in authRoutes.js
        await fetch(`${API_URL}/auth/activity`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action, details })
        });
        console.log(`User activity logged: ${action}`);
    } catch (err) {
        console.error('Failed to log user activity:', err);
    }
}

// --- Smart Travel Analyzer Logic ---
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const startLoc = document.getElementById('startLoc').value.trim();
    const destLoc = document.getElementById('destLoc').value.trim();
    const resultsDiv = document.getElementById('analyzerResults');
    const loadingDiv = document.getElementById('analyzerLoading');

    if (!startLoc || !destLoc) {
        alert('Please enter both start and destination locations');
        return;
    }

    // Reset UI
    resultsDiv.classList.add('hidden');
    loadingDiv.classList.remove('hidden');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/travel/analyze`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ startLocation: startLoc, destination: destLoc })
        });

        if (response.ok) {
            const data = await response.json();
            displayAnalysisResults(data);
            generateRouteMap(startLoc, destLoc);
        } else {
            alert('Analysis failed. Try again');
        }
    } catch (err) {
        console.error('Travel analysis fetch error:', err);
        alert('Server connection failed. Please ensure the backend is running.');
    } finally {
        loadingDiv.classList.add('hidden');
    }
});

function displayAnalysisResults(data) {
    const resultsDiv = document.getElementById('analyzerResults');
    
    resultsDiv.innerHTML = `
        <div class="card mb-1" style="border-left: 5px solid var(--primary-color)">
            <p><strong>Route Summary:</strong> ${data.summary}</p>
        </div>

        <div class="analyzer-results-grid">
            <div class="result-stat ${data.footprintClass}">
                <i>🌱</i>
                <strong>Carbon Footprint</strong>
                <span>${data.footprint}</span>
            </div>
            <div class="result-stat">
                <i>📊</i>
                <strong>Crowd Density</strong>
                <span>${data.crowdLevel}</span>
            </div>
            <div class="result-stat">
                <i>⏰</i>
                <strong>Best Time to Visit</strong>
                <span>${data.bestTime}</span>
            </div>
        </div>

        <div class="eco-tips-section mt-1">
            <p><strong>🌱 Smart Eco-Tips:</strong></p>
            <ul>
                ${data.ecoTips.map(tip => `<li>- ${tip}</li>`).join('')}
            </ul>
        </div>
    `;

    resultsDiv.classList.remove('hidden');
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// --- Map Visualization Logic ---
let travelMapInstance = null;
let routingControl = null;

async function geocodeLocation(locationName) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}`);
        const data = await response.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
        return null;
    } catch (err) {
        console.error('Geocoding error:', err);
        return null;
    }
}

async function generateRouteMap(startLoc, destLoc) {
    const mapContainer = document.getElementById('travelMap');
    const mapLoading = document.getElementById('mapLoading');
    const mapError = document.getElementById('mapError');
    
    // Reset UI
    mapContainer.classList.add('hidden');
    mapError.classList.add('hidden');
    mapLoading.classList.remove('hidden');

    // Geocode both locations
    const startCoords = await geocodeLocation(startLoc);
    const destCoords = await geocodeLocation(destLoc);

    mapLoading.classList.add('hidden');

    if (!startCoords || !destCoords) {
        mapError.innerText = `Could not find exact coordinates for one or both locations. Map generation skipped.`;
        mapError.classList.remove('hidden');
        return;
    }

    mapContainer.classList.remove('hidden');

    // Initialize or reset map
    if (travelMapInstance !== null) {
        travelMapInstance.remove();
    }

    travelMapInstance = L.map('travelMap').setView(startCoords, 6);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(travelMapInstance);

    // Add Markers
    L.marker(startCoords).addTo(travelMapInstance).bindPopup(`<b>Start:</b> ${startLoc}`).openPopup();
    L.marker(destCoords).addTo(travelMapInstance).bindPopup(`<b>Destination:</b> ${destLoc}`);

    // Add Routing Control
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(startCoords[0], startCoords[1]),
            L.latLng(destCoords[0], destCoords[1])
        ],
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: true,
        show: false, // Don't show the turn-by-turn instructions box to save UI space
        lineOptions: {
            styles: [{ color: '#2F855A', opacity: 0.8, weight: 6 }] // Thick Green for Fastest
        },
        altLineOptions: {
            styles: [{ color: '#718096', opacity: 0.5, weight: 4 }] // Lighter Gray for Alternatives
        },
        createMarker: function() { return null; } // Prevent duplicate markers
    }).addTo(travelMapInstance);

    // Scroll to map
    setTimeout(() => {
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
}

// --- Contact Helper Functions ---
function callGuide(phone) {
    if (!phone || phone === 'N/A') return alert('Phone number not available');
    window.location.href = `tel:${phone}`;
}

function whatsappGuide(phone) {
    if (!phone || phone === 'N/A') return alert('Phone number not available');
    // Remove non-numeric characters for WhatsApp link
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
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
            document.getElementById('userNameDisplay').innerText = `Welcome, ${name}`;
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
