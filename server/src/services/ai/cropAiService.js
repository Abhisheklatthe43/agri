import { buildCropRecommendationPrompt } from '../../prompts/cropPrompt.js';
import { cropRecommendationResponseSchema } from '../../schemas/aiResponseSchemas.js';
import { executeGeminiPrompt } from './geminiClient.js';
import { logger } from '../../utils/logger.js';

export const generateCropRecommendations = async (inputData) => {
  const prompt = buildCropRecommendationPrompt(inputData);

  logger.info('Generating crop recommendations with Gemini', {
    state: inputData.state,
    district: inputData.district,
    soil: inputData.soil_type,
    season: inputData.season
  });

  const { data, modelName, timestamp } = await executeGeminiPrompt({ prompt });

  // Validate AI output against strict Zod schema
  const validation = cropRecommendationResponseSchema.safeParse(data);
  if (!validation.success) {
    logger.error('Gemini crop recommendation output failed schema validation', {
      errors: validation.error.format()
    });
    throw new Error('AI output did not match required agricultural crop response structure.');
  }

  return {
    recommendations: validation.data,
    modelName,
    timestamp
  };
};
