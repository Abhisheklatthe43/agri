import { z } from 'zod';

export const cropRecommendationResponseSchema = z.object({
  summary: z.string(),
  location_context: z.string(),
  data_limitations: z.array(z.string()).default([]),
  recommendations: z.array(z.object({
    crop_name: z.string(),
    scientific_name: z.string().default(''),
    suitability_score: z.number().min(0).max(100),
    suitability_level: z.string(),
    soil_compatibility: z.string(),
    climate_compatibility: z.string(),
    water_requirement: z.string(),
    growing_duration_days: z.union([z.number(), z.string()]),
    planting_season: z.string(),
    fertilizer_considerations: z.array(z.string()).default([]),
    risks: z.array(z.string()).default([]),
    explanation: z.string()
  })).min(1),
  next_steps: z.array(z.string()).default([]),
  expert_consultation_required: z.boolean().default(false)
});

export const diseaseDetectionResponseSchema = z.object({
  crop_name: z.string().default('Unspecified Plant'),
  health_status: z.enum(['healthy', 'possibly_affected', 'inconclusive']).default('possibly_affected'),
  primary_finding: z.string(),
  possible_causes: z.array(z.object({
    name: z.string(),
    category: z.enum(['fungal', 'bacterial', 'viral', 'pest', 'nutrient_deficiency', 'environmental', 'unknown']).default('unknown'),
    confidence: z.number().min(0).max(100),
    explanation: z.string()
  })).default([]),
  visible_symptoms: z.array(z.string()).default([]),
  severity: z.string().default('moderate'),
  immediate_actions: z.array(z.string()).default([]),
  prevention_methods: z.array(z.string()).default([]),
  additional_information_needed: z.array(z.string()).default([]),
  expert_consultation_required: z.boolean().default(true),
  limitations: z.array(z.string()).default([])
});

export const fertilizerAdvisoryResponseSchema = z.object({
  summary: z.string(),
  soil_observations: z.array(z.string()).default([]),
  nutrient_assessment: z.array(z.object({
    nutrient: z.string(),
    status: z.string(),
    explanation: z.string()
  })).default([]),
  recommendations: z.array(z.object({
    type: z.string(),
    recommendation: z.string(),
    application_guidance: z.string(),
    precautions: z.array(z.string()).default([])
  })).min(1),
  soil_testing_recommended: z.boolean().default(true),
  warnings: z.array(z.string()).default([]),
  next_steps: z.array(z.string()).default([])
});

export const irrigationAdvisoryResponseSchema = z.object({
  summary: z.string(),
  water_stress_risk: z.string().default('moderate'),
  irrigation_considerations: z.array(z.string()).default([]),
  recommended_actions: z.array(z.string()).default([]),
  rainfall_adjustments: z.array(z.string()).default([]),
  water_conservation_methods: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  data_limitations: z.array(z.string()).default([])
});

export const chatResponseSchema = z.object({
  answer: z.string(),
  language: z.string().default('en'),
  key_points: z.array(z.string()).default([]),
  recommended_actions: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  follow_up_question: z.string().default(''),
  expert_consultation_required: z.boolean().default(false)
});
