import { z } from 'zod';

export const chatRequestSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  conversation_id: z.string().uuid().optional().nullable(),
  preferred_language: z.string().trim().default('en'),
  crop_context: z.string().trim().max(100).optional().nullable(),
  location_context: z.string().trim().max(150).optional().nullable()
});
