import { buildFertilizerPrompt } from '../../prompts/fertilizerPrompt.js';
import { fertilizerAdvisoryResponseSchema } from '../../schemas/aiResponseSchemas.js';
import { executeGeminiPrompt } from './geminiClient.js';
import { logger } from '../../utils/logger.js';

export const generateFertilizerAdvisory = async (inputData) => {
  const prompt = buildFertilizerPrompt(inputData);

  logger.info('Generating fertilizer advisory with Gemini', {
    crop: inputData.crop_name,
    stage: inputData.growth_stage,
    soil: inputData.soil_type
  });

  const { data, modelName, timestamp } = await executeGeminiPrompt({ prompt });

  const validation = fertilizerAdvisoryResponseSchema.safeParse(data);
  if (!validation.success) {
    logger.error('Gemini fertilizer advisory output failed schema validation', {
      errors: validation.error.format()
    });
    throw new Error('AI fertilizer advice did not match required response structure.');
  }

  return {
    advisory: validation.data,
    modelName,
    timestamp
  };
};
