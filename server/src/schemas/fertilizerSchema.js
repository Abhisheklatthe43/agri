import { z } from 'zod';

export const fertilizerRequestSchema = z.object({
  crop_name: z.string().trim().min(1, 'Crop name is required').max(100),
  growth_stage: z.string().trim().min(1, 'Growth stage is required').max(100),
  soil_type: z.string().trim().min(1, 'Soil type is required').max(100),
  soil_ph: z.coerce.number().min(0).max(14).optional().nullable(),
  nitrogen: z.coerce.number().nonnegative().optional().nullable(),
  phosphorus: z.coerce.number().nonnegative().optional().nullable(),
  potassium: z.coerce.number().nonnegative().optional().nullable(),
  soil_test_details: z.string().trim().max(500).optional().nullable(),
  farming_method: z.string().trim().default('conventional')
});
