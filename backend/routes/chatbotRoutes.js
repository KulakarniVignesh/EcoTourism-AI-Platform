const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

// 🔐 Initialize Groq safely
let groq;

if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== "dummy") {
  groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });
  console.log("🤖 Groq AI initialized successfully");
} else {
  console.log("⚠️ GROQ_API_KEY missing — running in fallback mode");
}

// 🚀 Chatbot Route
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    // ❌ Validation
    if (!message || message.trim() === '') {
      return res.status(400).json({ reply: 'Please enter a valid message.' });
    }

    console.log(`💬 User Message: "${message}"`);

    // 🔁 Support both GROQ_MOCK_MODE and missing groq object
    const isMock = process.env.GROQ_MOCK_MODE === 'true';

    if (isMock || !groq) {
      console.log('🔁 Mode: Mock/Fallback');
      return res.json({ 
        reply: getFallbackResponse(message) 
      });
    }

    // 🤖 AI Response (Real)
    console.log('🤖 Powering by real Groq AI...');
    
    // Safety check for the object structure
    if (!groq.chat || !groq.chat.completions) {
        throw new Error('Groq SDK structure mismatch. Ensure the library is correctly installed.');
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are EcoTour AI Assistant. You provide sustainable travel tips, suggest local eco-friendly guides, and give advice on how to be a smart tourist in places like Coorg, Kerala, and Himachal Pradesh. Keep responses helpful and under three sentences."
        },
        {
          role: "user",
          content: message
        }
      ],
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile"
    });


    const reply = completion.choices?.[0]?.message?.content || "I'm sorry, I couldn't process that.";
    console.log(`🤖 AI Reply: "${reply.substring(0, 50)}..."`);

    res.json({ reply });

  } catch (error) {
    console.error('❌ Chatbot AI Error:', error);
    
    // Always return JSON, never HTML
    res.status(500).json({
      reply: "The AI is momentarily offline. Let me try my built-in knowledge instead...",
      fallbackReply: getFallbackResponse(req.body.message || ''),
      error: error.message
    });
  }
});


// 🔁 Fallback Responses (for demo without API)
function getFallbackResponse(message) {
  const msg = message.toLowerCase();

  if (msg.includes("place") || msg.includes("travel")) {
    return "You can explore eco-friendly destinations like Coorg, Kerala, and Himachal Pradesh 🌱";
  }

  if (msg.includes("hotel") || msg.includes("stay")) {
    return "Try booking eco-friendly stays through trusted platforms like Booking.com or Airbnb 🏨";
  }

  if (msg.includes("transport")) {
    return "Consider using public transport or carpooling for eco-friendly travel 🚗";
  }

  return "I'm your EcoTour assistant 🌿. Ask me about travel, destinations, or guides!";
}

module.exports = router;