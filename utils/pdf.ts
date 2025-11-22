import { HealthCheck, UserProfile } from "./storage";

export interface HealthReport {
  userProfile: UserProfile;
  healthChecks: HealthCheck[];
  generatedDate: string;
}

export function generateHealthReportText(report: HealthReport): string {
  const { userProfile, healthChecks, generatedDate } = report;

  let text = "MEDICAL HEALTH REPORT\n";
  text += "=====================\n\n";

  text += `Generated: ${new Date(generatedDate).toLocaleDateString()}\n`;
  text += `User: ${userProfile.name}\n\n`;

  text += "USER PROFILE\n";
  text += "------------\n";
  if (userProfile.bloodType) {
    text += `Blood Type: ${userProfile.bloodType}\n`;
  }
  if (userProfile.emergencyContact) {
    text += `Emergency Contact: ${userProfile.emergencyContact}\n`;
  }

  if (userProfile.allergies.length > 0) {
    text += `\nAllergies:\n`;
    userProfile.allergies.forEach((allergy) => {
      text += `  - ${allergy}\n`;
    });
  }

  if (userProfile.medicalHistory.length > 0) {
    text += `\nMedical History:\n`;
    userProfile.medicalHistory.forEach((item) => {
      text += `  - ${item}\n`;
    });
  }

  if (userProfile.medications.length > 0) {
    text += `\nCurrent Medications:\n`;
    userProfile.medications.forEach((med) => {
      text += `  - ${med}\n`;
    });
  }

  text += `\n\nHEALTH CHECK HISTORY (${healthChecks.length} checks)\n`;
  text += "--------------------------------------------\n\n";

  healthChecks.forEach((check, index) => {
    text += `Check #${index + 1} - ${new Date(check.date).toLocaleDateString()}\n`;
    text += `Symptoms: ${check.symptoms.join(", ")}\n`;
    if (check.prediction) {
      text += `Assessment: ${check.prediction}\n`;
    }
    if (check.medications.length > 0) {
      text += `Suggested Medications: ${check.medications.join(", ")}\n`;
    }
    if (check.nextSteps.length > 0) {
      text += `Next Steps: ${check.nextSteps.join(", ")}\n`;
    }
    text += "\n";
  });

  text += "DISCLAIMER\n";
  text += "----------\n";
  text += "This report is for informational purposes only and should not be considered ";
  text += "professional medical advice. Always consult with a healthcare provider for ";
  text += "diagnosis and treatment recommendations.\n";

  return text;
}

export function downloadHealthReport(report: HealthReport): void {
  const text = generateHealthReportText(report);
  const fileName = `health-report-${new Date().toISOString().split("T")[0]}.txt`;

  if (typeof window !== "undefined" && window.document) {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", fileName);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }
}
