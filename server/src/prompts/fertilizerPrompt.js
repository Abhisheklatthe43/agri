export const buildFertilizerPrompt = (inputData) => {
  return `
You are a soil fertility and nutrient management advisor.

Analyze the supplied crop, growth stage, soil characteristics, and available NPK measurements.
Provide responsible nutrient management guidance.
If laboratory measurements are missing, explain the limitation and recommend appropriate soil testing.
Avoid unsupported fertilizer quantities or dangerous chemical dosage instructions.

FARMER INPUTS:
- Crop: ${inputData.crop_name}
- Growth Stage: ${inputData.growth_stage}
- Soil Type: ${inputData.soil_type}
- Soil pH: ${inputData.soil_ph != null ? inputData.soil_ph : 'Not tested'}
- Nitrogen (N): ${inputData.nitrogen != null ? inputData.nitrogen + ' kg/ha' : 'Not tested'}
- Phosphorus (P): ${inputData.phosphorus != null ? inputData.phosphorus + ' kg/ha' : 'Not tested'}
- Potassium (K): ${inputData.potassium != null ? inputData.potassium + ' kg/ha' : 'Not tested'}
- Soil Test Details / Notes: ${inputData.soil_test_details || 'No lab test report attached'}
- Farming Method: ${inputData.farming_method || 'Integrated'}

REQUIRED JSON OUTPUT FORMAT:
Respond with a single valid JSON object strictly adhering to this structure:
{
  "summary": "Overall nutrient assessment and fertility plan overview",
  "soil_observations": ["Key characteristics of ${inputData.soil_type} and nutrient retention tendencies"],
  "nutrient_assessment": [
    {
      "nutrient": "Nitrogen (N)",
      "status": "deficient / sufficient / excess / unknown",
      "explanation": "Specific role for ${inputData.crop_name} at ${inputData.growth_stage}"
    },
    {
      "nutrient": "Phosphorus (P)",
      "status": "deficient / sufficient / excess / unknown",
      "explanation": "Root development and flowering requirements"
    },
    {
      "nutrient": "Potassium (K)",
      "status": "deficient / sufficient / excess / unknown",
      "explanation": "Disease resistance and water regulation"
    }
  ],
  "recommendations": [
    {
      "type": "organic / chemical / integrated / biofertilizer",
      "recommendation": "Specific nutrient or organic amendment advice (e.g. FYM, Vermicompost, Neem cake)",
      "application_guidance": "Timing, split application method (basal vs top dressing), and soil moisture condition required",
      "precautions": ["Avoid direct contact with foliage, apply in cool hours, PPE"]
    }
  ],
  "soil_testing_recommended": true,
  "warnings": ["Caution on over-fertilization, groundwater runoff, or pH imbalance"],
  "next_steps": ["Actionable steps for the farmer in the current week"]
}
`.trim();
};
