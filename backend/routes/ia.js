const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
    const prompt = 'Tu es un assistant commercial au Togo. Reponds en francais en 3 phrases max. Question: ' + message;
    const result = await model.generateContent(prompt);
    const reply = result.response.text();
    res.json({ reply });
  } catch(err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
