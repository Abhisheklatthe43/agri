export const buildCropRecommendationPrompt = (inputData) => {
  return `
You are an agricultural crop suitability specialist.

Analyze the supplied farm conditions and recommend crops that may be suitable for the location, soil, season, and available resources.
Use only supplied measurements and clearly distinguish missing data from estimated information.
Consider local climatic suitability, soil compatibility, rainfall, irrigation availability, and crop season.
Return a ranked list of suitable crops with explanations and limitations.

FARM INPUT DATA:
- Location: ${inputData.district}, ${inputData.state}
- Soil Type: ${inputData.soil_type}
- Season: ${inputData.season}
- Farm Area: ${inputData.farm_area} ${inputData.farm_area_unit || 'acre'}
- Water / Irrigation Availability: ${inputData.water_availability}
- Soil pH: ${inputData.soil_ph != null ? inputData.soil_ph : 'Not measured / laboratory test needed'}
- Soil Nitrogen (N): ${inputData.nitrogen != null ? inputData.nitrogen + ' kg/ha' : 'Not measured'}
- Soil Phosphorus (P): ${inputData.phosphorus != null ? inputData.phosphorus + ' kg/ha' : 'Not measured'}
- Soil Potassium (K): ${inputData.potassium != null ? inputData.potassium + ' kg/ha' : 'Not measured'}
- Current / Forecast Temperature: ${inputData.temperature != null ? inputData.temperature + ' °C' : 'Estimated from regional season'}
- Humidity: ${inputData.humidity != null ? inputData.humidity + ' %' : 'Estimated from regional season'}
- Expected / Historical Rainfall: ${inputData.rainfall != null ? inputData.rainfall + ' mm' : 'Estimated from regional season'}
- Previous Crop Grown: ${inputData.previous_crop || 'None specified'}
- Farmer's Goal / Objective: ${inputData.farming_objective || 'General commercial & sustainable farming'}

REQUIRED JSON OUTPUT FORMAT:
Respond with a single valid JSON object strictly adhering to this schema (do not wrap in markdown quotes if possible, or produce clean JSON):
{
  "summary": "High-level summary of the agricultural conditions and key findings",
  "location_context": "Assessment of agro-climatic zone and regional compatibility for ${inputData.district}, ${inputData.state}",
  "data_limitations": ["List of any unmeasured parameters (e.g. soil NPK, pH) and potential impact"],
  "recommendations": [
    {
      "crop_name": "Common crop name",
      "scientific_name": "Botanical/scientific name",
      "suitability_score": 88,
      "suitability_level": "high",
      "soil_compatibility": "How well this crop matches ${inputData.soil_type}",
      "climate_compatibility": "How well this crop handles temperature and rainfall in ${inputData.season}",
      "water_requirement": "Low / Moderate / High with watering schedule overview",
      "growing_duration_days": "110-125 days",
      "planting_season": "Optimal sowing window",
      "fertilizer_considerations": ["Key nutrient requirements and organic inputs"],
      "risks": ["Possible pests, moisture stress, or climate risks"],
      "explanation": "Detailed rationale for recommending this crop"
    }
  ],
  "next_steps": ["Actionable steps before sowing: seed selection, soil test, land prep"],
  "expert_consultation_required": false
}
`.trim();
};
