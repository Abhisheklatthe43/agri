import { z } from 'zod';

export const cropRecommendationRequestSchema = z.object({
  state: z.string().trim().min(1, 'State is required'),
  district: z.string().trim().min(1, 'District is required'),
  soil_type: z.string().trim().min(1, 'Soil type is required'),
  season: z.string().trim().min(1, 'Season is required'),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero'),
  farm_area_unit: z.string().default('acre'),
  water_availability: z.string().trim().min(1, 'Water availability is required'),
  
  // Optional soil & climate fields
  soil_ph: z.coerce.number().min(0, 'pH cannot be below 0').max(14, 'pH cannot exceed 14').optional().nullable(),
  nitrogen: z.coerce.number().nonnegative('Nitrogen must be non-negative').optional().nullable(),
  phosphorus: z.coerce.number().nonnegative('Phosphorus must be non-negative').optional().nullable(),
  potassium: z.coerce.number().nonnegative('Potassium must be non-negative').optional().nullable(),
  temperature: z.coerce.number().optional().nullable(),
  humidity: z.coerce.number().min(0).max(100).optional().nullable(),
  rainfall: z.coerce.number().nonnegative().optional().nullable(),
  previous_crop: z.string().trim().max(100).optional().nullable(),
  farming_objective: z.string().trim().max(250).optional().nullable()
});
