import { z } from 'zod';
import { AREA_UNITS } from '../constants/agriculturalData.js';

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100),
  phone: z.string().trim().max(20).optional().nullable(),
  state: z.string().trim().max(100).optional().nullable(),
  district: z.string().trim().max(100).optional().nullable(),
  village: z.string().trim().max(100).optional().nullable(),
  farm_area: z.coerce.number().positive('Farm area must be greater than zero').optional().nullable(),
  farm_area_unit: z.enum(AREA_UNITS).default('acre'),
  soil_type: z.string().trim().max(100).optional().nullable(),
  irrigation_availability: z.string().trim().max(100).optional().nullable(),
  farming_experience: z.string().trim().max(100).optional().nullable(),
  preferred_language: z.string().trim().min(2).max(10).default('en'),
  primary_crops: z.array(z.string().trim()).max(20).default([])
});
