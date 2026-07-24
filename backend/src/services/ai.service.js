const axios = require('axios');

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = process.env.OPENROUTER_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';

/**
 * Call OpenRouter AI API
 */
async function callAI(messages, maxTokens = 500) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY.includes('placeholder') || OPENROUTER_API_KEY.includes('your_')) {
    return 'AI service not configured.';
  }
  try {
    const response = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: MODEL,
        messages,
        max_tokens: maxTokens,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://foodlinkai.com',
          'X-Title': 'FoodLink AI'
        },
        timeout: 3000
      }
    );
    return response.data.choices[0]?.message?.content || 'No response generated.';
  } catch (err) {
    console.error('OpenRouter AI error:', err.response?.data || err.message);
    return 'AI service temporarily unavailable.';
  }
}

/**
 * Generate a professional food description from basic details
 */
async function generateFoodDescription(foodDetails) {
  const { food_name, food_type, quantity, servings, description } = foodDetails;
  const messages = [
    {
      role: 'system',
      content: 'You are a professional food description writer for a food donation platform. Write clear, appetizing, and accurate descriptions.'
    },
    {
      role: 'user',
      content: `Generate a professional, concise food description (2-3 sentences) for a food donation listing with these details:
- Food Name: ${food_name}
- Food Type: ${food_type}
- Quantity: ${quantity}
- Servings: ${servings}
- Additional Info: ${description || 'None'}

Write the description in a warm, professional tone suitable for a food redistribution platform.`
    }
  ];
  return callAI(messages, 200);
}

/**
 * Generate shelf-life and food safety guidance
 */
async function generateShelfLifeGuidance(foodDetails) {
  const { food_name, food_type, cooked_time, expiry_time } = foodDetails;
  const messages = [
    {
      role: 'system',
      content: 'You are a food safety advisor providing general guidance for food donation programs. Always emphasize that your guidance is not a food safety certification.'
    },
    {
      role: 'user',
      content: `Provide shelf-life and safe handling guidance for the following donated food:
- Food: ${food_name}
- Type: ${food_type}
- Cooked/Prepared at: ${cooked_time}
- Listed expiry: ${expiry_time}

Provide:
1. Estimated safe consumption window
2. Storage recommendations
3. Warning signs to watch for
4. Safe serving temperature

IMPORTANT: Clearly state at the beginning that this is general guidance only, not a food safety certification, and users should follow local food safety regulations.`
    }
  ];
  return callAI(messages, 400);
}

/**
 * Chat assistant for platform questions
 */
async function chatAssistant(message, context = {}) {
  const messages = [
    {
      role: 'system',
      content: `You are FoodLink AI Assistant, a helpful chatbot for the FoodLink AI food redistribution platform. 
You help restaurants, NGOs, and volunteers understand how to use the platform, track donations, and maximize food redistribution impact.
You support SDG 2 (Zero Hunger) and SDG 12 (Responsible Consumption).
Be concise, friendly, and helpful. If asked about specific donation data, explain what information you have access to.
Context: ${JSON.stringify(context)}`
    },
    {
      role: 'user',
      content: message
    }
  ];
  return callAI(messages, 500);
}

/**
 * Generate analytics natural language summary
 */
async function generateAnalyticsSummary(stats) {
  const messages = [
    {
      role: 'system',
      content: 'You are an analytics assistant for a food redistribution platform. Generate concise, insightful summaries.'
    },
    {
      role: 'user',
      content: `Generate a brief, motivating natural-language summary (3-4 sentences) of these food donation statistics:
${JSON.stringify(stats, null, 2)}

Highlight key achievements, trends, and impact. Include SDG references where relevant.`
    }
  ];
  return callAI(messages, 300);
}

module.exports = {
  generateFoodDescription,
  generateShelfLifeGuidance,
  chatAssistant,
  generateAnalyticsSummary,
  callAI
};
