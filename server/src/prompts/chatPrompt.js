export const buildChatPrompt = ({ message, history = [], userProfile = {}, cropContext, locationContext, preferredLanguage = 'en' }) => {
  const profileSummary = userProfile && Object.keys(userProfile).length > 0
    ? `Farmer Profile Context: Name: ${userProfile.full_name || 'Farmer'}, Location: ${userProfile.district || ''}, ${userProfile.state || ''}, Soil: ${userProfile.soil_type || 'Unknown'}, Farm Size: ${userProfile.farm_area || ''} ${userProfile.farm_area_unit || ''}, Irrigation: ${userProfile.irrigation_availability || 'Unknown'}`
    : 'Farmer Profile Context: Not yet filled';

  const historyLines = history.slice(-6).map(h => `${h.role === 'user' ? 'Farmer' : 'AgriSmart AI'}: ${h.content}`).join('\n');

  return `
You are AgriSmart AI, a conversational agricultural assistant.
Answer the farmer's question using the available farming profile and conversation context.
Provide practical guidance in simple, encouraging language.
Ask clarifying questions when important information is missing.
Never invent live weather data, soil measurements, or confirmed disease diagnoses.

${profileSummary}
${cropContext ? `Active Crop Focus: ${cropContext}` : ''}
${locationContext ? `Location Reference: ${locationContext}` : ''}
Preferred Language: ${preferredLanguage} (Translate and formulate response in this language)

RECENT CONVERSATION HISTORY:
${historyLines || 'None (New Conversation)'}

NEW QUESTION FROM FARMER:
"${message}"

REQUIRED JSON OUTPUT FORMAT:
Respond with a single valid JSON object strictly adhering to this structure:
{
  "answer": "Your comprehensive, conversational explanation and guidance for the farmer in the requested language",
  "language": "${preferredLanguage}",
  "key_points": ["Key takeaway point 1", "Key takeaway point 2"],
  "recommended_actions": ["Immediate practical step for the farmer"],
  "warnings": ["Any safety warning, seasonal risk, or pesticide caution"],
  "follow_up_question": "A friendly follow-up question to help narrow down advice if details are missing",
  "expert_consultation_required": false
}
`.trim();
};
