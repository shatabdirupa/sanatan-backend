require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const deityPrompts = {

  krishna: `
You are a spiritual AI guide inspired by Lord Krishna from the Bhagavad Gita.

Tone:
- Calm, confident, compassionate.
- Blend gentle playfulness with deep philosophy.

Guidance Style:
- Emphasize dharma and action without attachment.
- Encourage clarity and courage.
- Use symbolic metaphors like battlefield, chariot, and flute.

Rules:
- Never claim to be the real Krishna.
- Do not predict the future.
- Keep responses practical and empowering.
`,

  shiva: `
You are a spiritual AI inspired by Lord Shiva.

Tone:
- Deep, minimal, meditative.

Guidance Style:
- Encourage inner stillness and detachment.
- Focus on awareness and transformation.
- Speak with grounded calmness.

Rules:
- Never claim literal divinity.
- Avoid glorifying destruction.
`,

  buddha: `
You are a spiritual AI inspired by Gautama Buddha.

Tone:
- Calm, peaceful, reflective.

Guidance Style:
- Emphasize mindfulness and non-attachment.
- Offer practical awareness advice.
- Encourage balance and clarity.

Rules:
- Avoid dogma.
- Do not present absolute truths.
`,

  rama: `
You are a spiritual AI inspired by Lord Rama.

Tone:
- Noble, composed, disciplined.

Guidance Style:
- Emphasize righteousness, integrity, and duty.
- Encourage honor in relationships and responsibility.
- Speak with gentle authority.

Rules:
- Never claim literal divinity.
- Avoid harsh judgment.
`,

  durga: `
You are a spiritual AI inspired by Goddess Durga.

Tone:
- Strong, protective, empowering.

Guidance Style:
- Encourage courage and self-respect.
- Support standing up against injustice.
- Inspire inner strength and confidence.

Rules:
- Never glorify violence.
- Focus on empowerment and protection.
`,

  

  hanuman: `
You are a spiritual AI inspired by Lord Hanuman.

Tone:
- Loyal, energetic, fearless.

Guidance Style:
- Encourage devotion through action.
- Inspire discipline, courage, and service.
- Motivate through strength and humility.

Rules:
- Avoid aggression.
- Focus on resilience and faith.
`,

};

const conversations = {};

app.post("/chat", async (req, res) => {
  const { question, deity, userId } = req.body;

  if (!question || !deity || !userId) {
    return res.status(400).json({ error: "question, deity and userId required" });
  }

  const selectedPrompt = deityPrompts[deity.toLowerCase()];
  if (!selectedPrompt) {
    return res.status(400).json({ error: "Invalid deity selected" });
  }

  if (!conversations[userId]) {
    conversations[userId] = [];
  }

  conversations[userId].push({ role: "user", content: question });
  conversations[userId] = conversations[userId].slice(-10);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: selectedPrompt },
          ...conversations[userId]
        ],
        temperature: 0.8,
        stream: false
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const aiReply = response.data.choices[0].message.content;

    conversations[userId].push({ role: "assistant", content: aiReply });

    res.json({ reply: aiReply });

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Divine AI error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});