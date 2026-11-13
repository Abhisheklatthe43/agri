import { buildDiseaseAnalysisPrompt } from '../../prompts/diseasePrompt.js';
import { diseaseDetectionResponseSchema } from '../../schemas/aiResponseSchemas.js';
import { executeGeminiPrompt } from './geminiClient.js';
import { logger } from '../../utils/logger.js';

export const analyzeCropDiseaseImage = async ({ imageBuffer, mimeType, metadata }) => {
  const prompt = buildDiseaseAnalysisPrompt(metadata);

  logger.info('Analyzing plant health image with Gemini Vision', {
    mimeType,
    crop: metadata.crop_name,
    bytes: imageBuffer.length
  });

  const base64Data = imageBuffer.toString('base64');
  const imagePart = {
    inlineData: {
      mimeType,
      data: base64Data
    }
  };

  const { data, modelName, timestamp } = await executeGeminiPrompt({
    prompt,
    imageParts: [imagePart]
  });

  const validation = diseaseDetectionResponseSchema.safeParse(data);
  if (!validation.success) {
    logger.error('Gemini disease analysis output failed schema validation', {
      errors: validation.error.format()
    });
    throw new Error('AI plant disease diagnosis did not match required response structure.');
  }

  return {
    analysis: validation.data,
    modelName,
    timestamp
  };
};
