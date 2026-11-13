import { buildChatPrompt } from '../../prompts/chatPrompt.js';
import { chatResponseSchema } from '../../schemas/aiResponseSchemas.js';
import { executeGeminiPrompt } from './geminiClient.js';
import { logger } from '../../utils/logger.js';

export const generateChatMessage = async ({ message, history = [], userProfile = {}, cropContext, locationContext, preferredLanguage }) => {
  const prompt = buildChatPrompt({
    message,
    history,
    userProfile,
    cropContext,
    locationContext,
    preferredLanguage
  });

  logger.info('Processing AI Farming Assistant query with Gemini', {
    messagePreview: message.substring(0, 50),
    language: preferredLanguage
  });

  const { data, modelName, timestamp } = await executeGeminiPrompt({ prompt });

  const validation = chatResponseSchema.safeParse(data);
  if (!validation.success) {
    logger.error('Gemini chat response failed schema validation', {
      errors: validation.error.format()
    });
    throw new Error('AI assistant response format was invalid.');
  }

  return {
    response: validation.data,
    modelName,
    timestamp
  };
};
