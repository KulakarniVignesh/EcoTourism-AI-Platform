const analyzeTrip = async (req, res) => {
    const { startLocation, destination } = req.body;

    if (!startLocation || !destination) {
        return res.status(400).json({ message: 'Please enter both start and destination locations.' });
    }

    try {
        console.log(`🌍 Analyzing trip from ${startLocation} to ${destination}...`);

        // 1. Simulated Distance & Carbon Footprint
        // We'll use a deterministic mock distance based on string lengths
        const distance = (startLocation.length + destination.length) * 15; // in kilometers (simulated)
        let footprint = 'Moderate ⚠️';
        let footprintClass = 'moderate';
        
        if (distance < 150) {
            footprint = 'Low 🌱';
            footprintClass = 'low';
        } else if (distance > 500) {
            footprint = 'High ❌';
            footprintClass = 'high';
        }

        // 2. Crowd Prediction Logic
        const crowdedKeywords = ['city', 'mall', 'market', 'station', 'beach', 'mumbai', 'delhi', 'new york', 'london', 'shopping'];
        const natureKeywords = ['park', 'forest', 'mountain', 'hill', 'reserve', 'eco', 'sanctuary', 'lake', 'river'];

        const destLower = destination.toLowerCase();
        let crowdLevel = 'Moderate';
        
        if (crowdedKeywords.some(k => destLower.includes(k))) {
            crowdLevel = 'High (Peak Season) 🎫';
        } else if (natureKeywords.some(k => destLower.includes(k))) {
            crowdLevel = 'Low (Serene) 🧘';
        }

        // 3. Best Time to Visit (Heuristic)
        let bestTime = 'Year-round';
        if (destLower.includes('hill') || destLower.includes('mountain')) {
            bestTime = 'October - February';
        } else if (destLower.includes('beach') || destLower.includes('coast')) {
            bestTime = 'November - March';
        } else {
            bestTime = 'September - November (Spring)';
        }

        // 4. Eco-Tips Selection
        const allTips = [
            'Use public transport like buses or trains to reduce emissions 🚆',
            'Avoid peak hours (10 AM - 4 PM) to reduce crowd strain ⏰',
            'Choose Eco-certified stays and local homestays 🌱',
            'Carry a reusable water bottle and avoid single-use plastics ♻️',
            'Support local artisans and buy eco-friendly souvenirs 🛖',
            'Prefer walking or cycling for short distances within the destination 🚶'
        ];
        
        // Pick 3 random but stable tips for this trip
        const tips = allTips.sort(() => 0.5 - Math.random()).slice(0, 3);

        res.json({
            summary: `Recommended route via main highways and scenic local connectors. Estimated distance: ${distance} km.`,
            footprint,
            footprintClass,
            crowdLevel,
            bestTime,
            ecoTips: tips,
            timestamp: new Date()
        });

    } catch (error) {
        console.error('Analysis error:', error.message);
        res.status(500).json({ message: 'Smart analysis failed. Please try again later.' });
    }
};

module.exports = {
    analyzeTrip
};
