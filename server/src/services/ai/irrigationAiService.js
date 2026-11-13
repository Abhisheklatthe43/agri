import { buildIrrigationPrompt } from '../../prompts/irrigationPrompt.js';
import { irrigationAdvisoryResponseSchema } from '../../schemas/aiResponseSchemas.js';
import { executeGeminiPrompt } from './geminiClient.js';
import { logger } from '../../utils/logger.js';

export const generateIrrigationAdvisory = async (inputData) => {
  const prompt = buildIrrigationPrompt(inputData);

  logger.info('Generating irrigation advisory with Gemini', {
    crop: inputData.crop_name,
    stage: inputData.growth_stage,
    soil: inputData.soil_type,
    method: inputData.irrigation_method
  });

  const { data, modelName, timestamp } = await executeGeminiPrompt({ prompt });

  const validation = irrigationAdvisoryResponseSchema.safeParse(data);
  if (!validation.success) {
    logger.error('Gemini irrigation advisory output failed schema validation', {
      errors: validation.error.format()
    });
    throw new Error('AI irrigation advice did not match required response structure.');
  }

  return {
    advisory: validation.data,
    modelName,
    timestamp
  };
};
