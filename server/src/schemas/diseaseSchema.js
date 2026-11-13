import { z } from 'zod';

export const diseaseAnalysisRequestSchema = z.object({
  crop_name: z.string().trim().max(100).optional().nullable(),
  growth_stage: z.string().trim().max(100).optional().nullable(),
  symptoms: z.string().trim().max(1000).optional().nullable(),
  duration_of_symptoms: z.string().trim().max(100).optional().nullable(),
  location: z.string().trim().max(150).optional().nullable()
});
