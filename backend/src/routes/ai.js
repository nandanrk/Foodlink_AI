const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const aiService = require('../services/ai.service');

router.use(authenticate);

// POST /api/ai/describe-food
router.post('/describe-food', async (req, res) => {
  try {
    const description = await aiService.generateFoodDescription(req.body);
    res.json({ description });
  } catch (err) {
    res.status(500).json({ error: 'AI description failed' });
  }
});

// POST /api/ai/shelf-life
router.post('/shelf-life', async (req, res) => {
  try {
    const guidance = await aiService.generateShelfLifeGuidance(req.body);
    res.json({ guidance });
  } catch (err) {
    res.status(500).json({ error: 'AI shelf-life guidance failed' });
  }
});

// POST /api/ai/chat
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const reply = await aiService.chatAssistant(message, context || {});
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'AI chat failed' });
  }
});

module.exports = router;
