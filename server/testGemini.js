require('dotenv').config();

const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('Gemini API key loaded:', !!apiKey);
    console.log('API key length:', apiKey ? apiKey.length : 0);

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing from .env');
    }

    const ai = new GoogleGenAI({
      apiKey
    });

    console.log('Calling Gemini...');

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: 'Reply with exactly: Gemini connection successful'
    });

    console.log('Gemini response:');
    console.log(response.text);

  } catch (error) {
    console.error('GEMINI TEST FAILED:');
    console.error(error);
  }
}

testGemini();