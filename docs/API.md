# AgriSmart AI — REST API Documentation

Base URL: `/api/v1`

All responses follow the AgriSmart standard API format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Request completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Specific explanation"
  }
}
```

---

## 1. Health & Status

### `GET /api/v1/health`
Checks server health and connectivity status of integrations.
- **Auth Required**: No
- **Response**:
```json
{
  "success": true,
  "data": {
    "status": "UP",
    "service": "AgriSmart AI API",
    "timestamp": "2026-11-13T22:00:00.000Z",
    "version": "1.0.0",
    "integrations": {
      "geminiAi": "configured",
      "supabaseDatabase": "configured",
      "openWeather": "configured"
    }
  }
}
```

---

## 2. Farmer Profile

### `GET /api/v1/profile`
Retrieve the authenticated user's profile and farm parameters.
- **Auth Required**: Yes (`Bearer <token>`)

### `PUT /api/v1/profile`
Update the authenticated user's profile.
- **Auth Required**: Yes (`Bearer <token>`)
- **Body**:
```json
{
  "full_name": "Ramesh Kumar",
  "phone": "+91 98765 43210",
  "state": "Maharashtra",
  "district": "Pune",
  "village": "Khed",
  "farm_area": 5.0,
  "farm_area_unit": "acre",
  "soil_type": "Black soil",
  "irrigation_availability": "Drip irrigation",
  "farming_experience": "10 years",
  "preferred_language": "en",
  "primary_crops": ["Soybean", "Wheat", "Tomato"]
}
```

---

## 3. Crop Suitability Advisory

### `POST /api/v1/crops/recommend`
Generates ranked crop suitability recommendations using Gemini AI reasoning.
- **Auth Required**: Yes (`Bearer <token>`)
- **Rate Limit**: Dedicated AI Limiter (20 requests / 15 min)
- **Body**:
```json
{
  "state": "Maharashtra",
  "district": "Pune",
  "soil_type": "Black soil",
  "season": "Kharif",
  "farm_area": 5.0,
  "farm_area_unit": "acre",
  "water_availability": "Drip irrigation",
  "soil_ph": 6.8,
  "nitrogen": 140,
  "phosphorus": 45,
  "potassium": 180,
  "farming_objective": "High commercial value with moderate water use"
}
```

### `GET /api/v1/crops/recommendations`
Retrieve all crop recommendations generated for the authenticated user.

### `GET /api/v1/crops/recommendations/:id`
Retrieve a single crop recommendation report.

### `DELETE /api/v1/crops/recommendations/:id`
Delete an owned crop recommendation report.

---

## 4. Plant Disease Detection (Vision AI)

### `POST /api/v1/disease/analyze`
Uploads a plant leaf/specimen image and performs multimodal disease diagnosis via Gemini Vision.
- **Auth Required**: Yes (`Bearer <token>`)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image`: Image file (JPEG, PNG, WebP up to 8MB) - **Required**
  - `crop_name`: string (optional)
  - `growth_stage`: string (optional)
  - `symptoms`: string (optional)
  - `duration_of_symptoms`: string (optional)

### `GET /api/v1/disease/history`
Retrieve disease scan history for the authenticated user.

### `GET /api/v1/disease/:id`
Retrieve disease analysis details by ID.

### `DELETE /api/v1/disease/:id`
Delete an owned disease report.

---

## 5. Agricultural Weather Intelligence

### `GET /api/v1/weather/current?location=Pune,Maharashtra`
Retrieves live meteorological conditions, cached in PostgreSQL for 30 minutes, and calculates agro-meteorological alerts.

### `GET /api/v1/weather/forecast?location=Pune,Maharashtra`
Retrieves a 5-day daily forecast and rain probability.

---

## 6. Fertilizer & Soil Nutrient Planning

### `POST /api/v1/fertilizer/recommend`
Formulates balanced NPK nutrition and organic amendments.
- **Body**:
```json
{
  "crop_name": "Tomato",
  "growth_stage": "Vegetative Growth",
  "soil_type": "Black soil",
  "soil_ph": 6.5,
  "nitrogen": 120,
  "farming_method": "integrated"
}
```

### `GET /api/v1/fertilizer/history`
Retrieve historical fertilizer recommendations.

---

## 7. Irrigation Scheduling

### `POST /api/v1/irrigation/recommend`
Evaluates crop water stress risk and generates irrigation frequencies.
- **Body**:
```json
{
  "crop_name": "Wheat",
  "growth_stage": "Tillering",
  "soil_type": "Loamy soil",
  "farm_area": 5.0,
  "farm_area_unit": "acre",
  "irrigation_method": "Drip irrigation",
  "water_availability": "Borewell 4 hours daily"
}
```

### `GET /api/v1/irrigation/history`
Retrieve irrigation advisories history.

---

## 8. AI Farming Assistant Chatbot

### `POST /api/v1/assistant/chat`
Send a conversational query to AgriSmart AI with user farm context.
- **Body**:
```json
{
  "message": "Why are my soybean leaves getting yellow spots?",
  "conversation_id": "optional-uuid",
  "preferred_language": "en"
}
```

### `GET /api/v1/assistant/conversations`
List user conversations.

### `GET /api/v1/assistant/conversations/:id`
List messages within a conversation.

### `DELETE /api/v1/assistant/conversations/:id`
Delete conversation and its messages.

---

## 9. Notifications

### `GET /api/v1/notifications`
List in-app alerts and weather advisories.

### `PATCH /api/v1/notifications/:id/read`
Mark notification as read.
