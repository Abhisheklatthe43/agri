import { GoogleGenAI } from '@google/genai';
import { env, isConfigured } from '../../config/env.js';
import { logger } from '../../utils/logger.js';
import { AGRISMART_SYSTEM_PROMPT } from '../../prompts/systemPrompt.js';

let aiClient = null;

if (isConfigured.gemini) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY
    });
    logger.info(`Google Gen AI SDK initialized with model: ${env.GEMINI_MODEL}`);
  } catch (error) {
    logger.error('Failed to initialize Google Gen AI SDK', error);
  }
} else {
  logger.warn('GEMINI_API_KEY is not configured or using placeholders. AI requests will return informative configuration instructions.');
}

export const getGeminiClient = () => aiClient;

/**
 * Execute a structured prompt with Gemini and validate JSON output
 */
export const executeGeminiPrompt = async ({ prompt, systemInstruction = AGRISMART_SYSTEM_PROMPT, imageParts = [] }) => {
  if (!aiClient) {
    throw new Error('Google Gemini API is not configured on the server. Please supply a valid GEMINI_API_KEY in server/.env');
  }

  const modelName = env.GEMINI_MODEL || 'gemini-2.5-flash';

  try {
    const contents = [];

    // If image parts provided for multimodal analysis
    if (imageParts && imageParts.length > 0) {
      contents.push(...imageParts);
    }

    contents.push({
      text: prompt
    });

    const response = await aiClient.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        },
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response received from Gemini model');
    }

    // Parse JSON safely
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch (parseError) {
      // Strip markdown code fences if model enclosed JSON in ```json ... ```
      const cleanedText = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      parsedData = JSON.parse(cleanedText);
    }

    return {
      data: parsedData,
      modelName,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Gemini content generation failed', {
      error: error.message,
      model: modelName
    });
    throw error;
  }
};
