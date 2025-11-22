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
];

export function generateMockPrediction(symptoms: string[]): {
  prediction: string;
  medications: string[];
  nextSteps: string[];
} {
  const symptomCount = symptoms.length;

  let prediction = "Common Cold";
  let medications = ["Rest", "Plenty of fluids", "Over-the-counter pain relievers"];
  let nextSteps = [
    "Monitor symptoms for 3-5 days",
    "Consult a doctor if symptoms worsen",
  ];

  if (symptoms.includes("Fever") && symptoms.includes("Cough")) {
    prediction = "Possible Flu or Respiratory Infection";
    medications = [
      "Acetaminophen or Ibuprofen for fever",
      "Cough suppressants",
      "Rest and hydration",
    ];
    nextSteps = [
      "Self-isolate to prevent spread",
      "Consult a doctor if fever persists beyond 3 days",
      "Seek immediate care if difficulty breathing develops",
    ];
  }

  if (symptoms.includes("Sore Throat") && symptoms.includes("Fever")) {
    prediction = "Possible Strep Throat or Viral Infection";
    medications = [
      "Throat lozenges",
      "Warm saltwater gargle",
      "Pain relievers",
    ];
    nextSteps = [
      "Schedule a throat culture test",
      "Avoid close contact with others",
    ];
  }

  if (symptomCount >= 5) {
    prediction = "Multiple Symptoms - Requires Medical Evaluation";
    nextSteps = [
      "Schedule an appointment with your primary care physician",
      "Document all symptoms and their severity",
      "Avoid self-medication",
    ];
  }

  return { prediction, medications, nextSteps };
}
