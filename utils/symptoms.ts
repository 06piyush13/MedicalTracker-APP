import { GEMINI_API_KEY, GEMINI_API_URL } from "@/constants/api";

export const COMMON_SYMPTOMS = [
  "Fever",
  "Cough",
  "Sore Throat",
  "Headache",
  "Fatigue",
  "Loss of Taste",
  "Shortness of Breath",
  "Sneezing",
  "Diarrhea",
  "Nausea",
  "Body Ache",
  "Runny Nose",
  "Chest Pain",
  "Dizziness",
  "Skin Rash",
  "Joint Pain",
  "Abdominal Pain",
  "Vomiting",
  "Earache",
];

export interface DiseasePrediction {
  condition: string;
  probability: "High" | "Medium" | "Low";
  description: string;
}

export interface PredictionResult {
  predictions: DiseasePrediction[];
  medications: string[];
  nextSteps: string[];
}

export async function analyzeSymptomsWithAI(
  symptoms: string[]
): Promise<PredictionResult> {
  try {
    // Try to call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are a medical assistant. Analyze the following symptoms and provide a JSON response with:
            1. "predictions": A list of 3-4 potential conditions. Each item must have:
               - "condition": Name of the disease.
               - "probability": "High", "Medium", or "Low".
               - "description": A one-sentence explanation.
            2. "medications": A list of 2-3 common over-the-counter medications or home remedies.
            3. "nextSteps": A list of 2-3 actionable next steps.
            
            Format: {"predictions": [{"condition": "...", "probability": "...", "description": "..."}], "medications": ["..."], "nextSteps": ["..."]}
            Do not include markdown formatting, just raw JSON.
            
            Symptoms: ${symptoms.join(", ")}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      }),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    // Parse the JSON response from AI
    const result = JSON.parse(content);
    return {
      predictions: result.predictions,
      medications: result.medications,
      nextSteps: result.nextSteps,
    };
  } catch (error) {
    console.log("Online analysis failed, falling back to offline mode:", error);
    return generateOfflinePrediction(symptoms);
  }
}

export function generateOfflinePrediction(symptoms: string[]): PredictionResult {
  const symptomCount = symptoms.length;
  const hasFever = symptoms.includes("Fever");
  const hasCough = symptoms.includes("Cough");
  const hasSoreThroat = symptoms.includes("Sore Throat");
  const hasHeadache = symptoms.includes("Headache");
  const hasBodyAche = symptoms.includes("Body Ache");

  let predictions: DiseasePrediction[] = [
    { condition: "Common Cold", probability: "Medium", description: "A common viral infection of the nose and throat." },
    { condition: "Seasonal Allergies", probability: "Low", description: "Immune system reaction to pollen or other allergens." }
  ];
  let medications = ["Rest", "Hydration"];
  let nextSteps = ["Monitor symptoms", "Rest"];

  // Enhanced Rule-based Logic
  if (hasFever && hasCough && hasBodyAche) {
    predictions = [
      { condition: "Viral Flu", probability: "High", description: "A contagious respiratory illness caused by influenza viruses." },
      { condition: "COVID-19", probability: "Medium", description: "A respiratory disease caused by SARS-CoV-2." },
      { condition: "Common Cold", probability: "Low", description: "A milder respiratory illness." }
    ];
    medications = ["Ibuprofen or Acetaminophen", "Cough Syrup", "Warm Fluids"];
    nextSteps = ["Rest completely", "Isolate from others", "Monitor temperature"];
  } else if (hasSoreThroat && hasFever) {
    predictions = [
      { condition: "Strep Throat", probability: "High", description: "A bacterial infection that may cause a sore, scratchy throat." },
      { condition: "Tonsillitis", probability: "Medium", description: "Inflammation of the tonsils." },
      { condition: "Viral Pharyngitis", probability: "Medium", description: "Sore throat caused by a virus." }
    ];
    medications = ["Throat Lozenges", "Salt water gargle", "Pain relievers"];
    nextSteps = ["See a doctor for a swab test", "Avoid cold drinks"];
  } else if (hasHeadache && hasBodyAche && !hasFever) {
    predictions = [
      { condition: "Tension Headache", probability: "High", description: "A mild to moderate pain often described as feeling like a tight band around the head." },
      { condition: "Fatigue", probability: "Medium", description: "Extreme tiredness resulting from mental or physical exertion or illness." },
      { condition: "Dehydration", probability: "Low", description: "Occurs when you use or lose more fluid than you take in." }
    ];
    medications = ["Pain relievers", "Magnesium supplements"];
    nextSteps = ["Reduce screen time", "Sleep in a dark room", "Manage stress"];
  } else if (symptoms.includes("Shortness of Breath") || symptoms.includes("Chest Pain")) {
    predictions = [
      { condition: "Respiratory Distress", probability: "High", description: "Difficulty breathing." },
      { condition: "Panic Attack", probability: "Medium", description: "Sudden episode of intense fear." },
      { condition: "Bronchitis", probability: "Low", description: "Inflammation of the lining of bronchial tubes." }
    ];
    medications = ["Do not self-medicate"];
    nextSteps = ["Seek immediate medical attention", "Go to the ER"];
  } else if (symptoms.includes("Diarrhea") || symptoms.includes("Nausea") || symptoms.includes("Vomiting")) {
    predictions = [
      { condition: "Food Poisoning", probability: "High", description: "Illness caused by food contaminated with bacteria, viruses, parasites or toxins." },
      { condition: "Stomach Flu (Gastroenteritis)", probability: "Medium", description: "Intestinal infection marked by diarrhea, cramps, nausea, vomiting and fever." },
      { condition: "Indigestion", probability: "Low", description: "Pain or discomfort in the stomach associated with difficulty in digesting food." }
    ];
    medications = ["Oral Rehydration Salts (ORS)", "Probiotics", "Anti-nausea medication"];
    nextSteps = ["Stay hydrated", "Eat bland foods (BRAT diet)", "Avoid dairy"];
  } else if (symptoms.includes("Skin Rash")) {
    predictions = [
      { condition: "Contact Dermatitis", probability: "High", description: "Skin rash caused by contact with a certain substance." },
      { condition: "Eczema", probability: "Medium", description: "Condition that makes your skin red and itchy." },
      { condition: "Allergic Reaction", probability: "Low", description: "Immune system reaction to a foreign substance." }
    ];
    medications = ["Hydrocortisone cream", "Antihistamines"];
    nextSteps = ["Avoid scratching", "Identify and avoid triggers", "Keep skin moisturized"];
  } else if (symptoms.includes("Joint Pain")) {
    predictions = [
      { condition: "Arthritis", probability: "Medium", description: "Inflammation of one or more joints." },
      { condition: "Strain or Sprain", probability: "High", description: "Injury to ligaments or muscles." },
      { condition: "Viral Infection", probability: "Low", description: "Some viral infections can cause joint pain." }
    ];
    medications = ["Pain relievers (Ibuprofen)", "Topical pain relief gels"];
    nextSteps = ["Rest the joint", "Apply ice or heat", "Gentle stretching"];
  } else if (symptoms.includes("Earache")) {
    predictions = [
      { condition: "Ear Infection", probability: "High", description: "Infection of the middle ear." },
      { condition: "Swimmer's Ear", probability: "Medium", description: "Infection in the outer ear canal." },
      { condition: "Wax Buildup", probability: "Low", description: "Accumulation of earwax." }
    ];
    medications = ["Pain relievers", "Ear drops (if prescribed)"];
    nextSteps = ["Keep ear dry", "Avoid inserting objects into ear", "See a doctor if pain persists"];
  }

  return { predictions, medications, nextSteps };
}

// Keep the old name for backward compatibility if needed, but redirect to new offline logic
export const generateMockPrediction = generateOfflinePrediction;
