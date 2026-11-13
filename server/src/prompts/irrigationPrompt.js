export const buildIrrigationPrompt = (inputData) => {
  return `
You are an agricultural irrigation management assistant.

Evaluate the supplied crop, growth stage, soil, irrigation method, rainfall, and weather information.
Provide water management recommendations.
Do not invent exact water quantities when essential physical measurements are missing.
Highlight water stress indicators and water conservation practices.

FARMER INPUTS:
- Crop: ${inputData.crop_name}
- Growth Stage: ${inputData.growth_stage}
- Soil Type: ${inputData.soil_type}
- Farm Area: ${inputData.farm_area} ${inputData.farm_area_unit || 'acre'}
- Irrigation Method: ${inputData.irrigation_method}
- Water Availability: ${inputData.water_availability}
- Recent Rainfall: ${inputData.recent_rainfall != null ? inputData.recent_rainfall + ' mm' : 'None recorded'}
- Ambient Temperature: ${inputData.temperature != null ? inputData.temperature + ' °C' : 'Seasonal average'}
- Relative Humidity: ${inputData.humidity != null ? inputData.humidity + ' %' : 'Seasonal average'}

REQUIRED JSON OUTPUT FORMAT:
Respond with a single valid JSON object strictly adhering to this structure:
{
  "summary": "Assessment of current crop water requirement and soil moisture dynamics",
  "water_stress_risk": "low / moderate / high / critical",
  "irrigation_considerations": ["Critical moisture sensitivity stages for ${inputData.crop_name} at ${inputData.growth_stage}"],
  "recommended_actions": ["Recommended watering frequency, optimal time of day (early morning/evening), duration"],
  "rainfall_adjustments": ["How to adjust scheduling based on recent rainfall or expected rain"],
  "water_conservation_methods": ["Mulching, drip line maintenance, soil moisture retention techniques"],
  "warnings": ["Risks of waterlogging, root rot, fungal proliferation, or salinity buildup"],
  "data_limitations": ["Notes on missing tensiometer/soil probe data and local evapotranspiration"]
}
`.trim();
};
