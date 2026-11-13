import { z } from 'zod';

export const irrigationRequestSchema = z.object({
  crop_name: z.string().trim().min(1, 'Crop name is required').max(100),
  growth_stage: z.string().trim().min(1, 'Growth stage is required').max(100),
  soil_type: z.string().trim().min(1, 'Soil type is required').max(100),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero'),
  farm_area_unit: z.string().default('acre'),
  irrigation_method: z.string().trim().min(1, 'Irrigation method is required').max(100),
  water_availability: z.string().trim().min(1, 'Water availability is required').max(100),
  recent_rainfall: z.coerce.number().nonnegative().optional().nullable(),
  temperature: z.coerce.number().optional().nullable(),
  humidity: z.coerce.number().min(0).max(100).optional().nullable()
});
