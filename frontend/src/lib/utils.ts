import { jsPDF } from "jspdf";
import type { Language, PatientCase, QualityResult, UploadedImage } from "../data/content";
import { recommendationText } from "../data/content";

export const screeningFee = 499;

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function readUploadFile(file: File): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => {
        resolve({
          id: `${file.name}-${file.lastModified}`,
          name: file.name,
          previewUrl: dataUrl,
          dataUrl,
          width: image.width,
          height: image.height,
          sizeBytes: file.size,
        });
      };
      image.onerror = () => reject(new Error(`Could not load image: ${file.name}`));
      image.src = dataUrl;
    };
    reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function readDocumentFile(file: File, docType: import("../data/content").DocType): Promise<import("../data/content").UploadedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve({
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        previewUrl: dataUrl,
        dataUrl,
        width: 0,
        height: 0,
        sizeBytes: file.size,
        docType,
        isPdf: file.type === "application/pdf",
      });
    };
    reader.onerror = () => reject(new Error(`Could not read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
}

export function evaluateQuality(images: UploadedImage[]): QualityResult {
  const image = images[0];
  const lightingPassed = image.sizeBytes >= 90_000;
  const oralVisibilityPassed = image.width / image.height > 0.7 && image.width / image.height < 1.8;
  const blurPassed = image.width * image.height >= 700_000;
  const resolutionPassed = image.width >= 900 && image.height >= 900;

  return {
    passed: lightingPassed && oralVisibilityPassed && blurPassed && resolutionPassed,
    checks: [
      {
        key: "lighting",
        label: { en: "Lighting adequacy", hi: "पर्याप्त रोशनी", gu: "પૂરતી લાઇટિંગ" },
        passed: lightingPassed,
        detail: {
          en: lightingPassed ? "Brightness is adequate for model intake." : "Exposure is too low for reliable screening.",
          hi: lightingPassed ? "मॉडल इनपुट के लिए रोशनी पर्याप्त है।" : "विश्वसनीय स्क्रीनिंग के लिए रोशनी कम है।",
          gu: lightingPassed ? "મોડલ ઇનપુટ માટે લાઇટિંગ પૂરતી છે." : "વિશ્વસનીય સ્ક્રીनिंg maaTe eKSaPoJaRa oChhuN chhe.",
        },
      },
      {
        key: "visibility",
        label: { en: "Oral cavity visibility", hi: "मौखिक गुहा दृश्यता", gu: "ઓરલ કેવિટી દેખાવ" },
        passed: oralVisibilityPassed,
        detail: {
          en: oralVisibilityPassed ? "Framing suggests the oral cavity is centered." : "Retake with a clearer view of the mouth.",
          hi: oralVisibilityPassed ? "फ्रेमिंग से मौखिक गुहा केंद्रित दिखती है।" : "मुंह का अधिक स्पष्ट दृश्य लेकर दोबारा फोटो लें।",
          gu: oralVisibilityPassed ? "ફ્રેમિંગ મુજબ ઓરલ કેવિટી કેન્દ્રિત છે." : "મોઢાનો વધુ સ્પષ્ટ વ્યૂ લઈને ફરી ફોટો લો.",
        },
      },
      {
        key: "blur",
        label: { en: "Blur detection", hi: "ब्लर जाँच", gu: "બ્લર ચેક" },
        passed: blurPassed,
        detail: {
          en: blurPassed ? "Detail density is adequate for screening." : "Image appears too soft. Use a steadier camera.",
          hi: blurPassed ? "स्क्रीनिंग के लिए विवरण पर्याप्त है।" : "इमेज धुंधली लग रही है। स्थिर कैमरा उपयोग करें।",
          gu: blurPassed ? "સ્ક્રીनिंg maaTe vigaTo puraTI chhe." : "ઇمejH dhUMDhLI Laghe chhe. sthiRa kaeMarO vApaRo.",
        },
      },
      {
        key: "resolution",
        label: { en: "Resolution check", hi: "रिज़ॉल्यूशन जाँच", gu: "રિઝોલ્યુશન ચેક" },
        passed: resolutionPassed,
        detail: {
          en: resolutionPassed ? "Resolution meets triage minimums." : "Resolution is below the minimum threshold.",
          hi: resolutionPassed ? "रिज़ॉल्यूशन न्यूनतम सीमा पूरी करता है।" : "रिज़ॉल्यूशन न्यूनतम सीमा से कम है।",
          gu: resolutionPassed ? "રિઝોλ્યуशन jaRurI marYaDa puRaN kare chhe." : "રિઝол्यूशन jaRurI marYaDa thi OchuN chhe.",
        },
      },
    ],
  };
}

export function downloadPdf(
  report: PatientCase,
  language: Language,
  disclaimer: string,
  uploadedImages: UploadedImage[],
  patientName?: string,
): void {
  const pdf = new jsPDF();
  const rec = recommendationText[language][report.recommendationKey];

  pdf.setFontSize(20);
  pdf.text("OralScan Report", 16, 18);
  pdf.setFontSize(11);
  pdf.text(`Reference ID: ${report.id}`, 16, 28);
  pdf.text(`Patient: ${patientName || report.patientName}`, 16, 36);
  pdf.text(`Urgency: ${report.urgency.toUpperCase()}`, 16, 44);
  pdf.text(`Summary: ${report.summary[language]}`, 16, 56, { maxWidth: 176 });
  pdf.text(`Findings: ${report.findings.join(", ")}`, 16, 76, { maxWidth: 176 });
  pdf.text(`Conditions: ${report.conditions.join(", ")}`, 16, 92, { maxWidth: 176 });
  pdf.text(`Recommendation: ${rec}`, 16, 108, { maxWidth: 176 });
  pdf.text(`Disclaimer: ${disclaimer}`, 16, 124, { maxWidth: 176 });
  pdf.text("OralScan generated report", 16, 140);

  const firstImage = uploadedImages[0];
  if (firstImage) {
    try {
      pdf.addImage(firstImage.dataUrl, "JPEG", 16, 148, 54, 54);
    } catch {
      pdf.text(`Uploaded image: ${firstImage.name}`, 16, 148);
    }
  }

  pdf.save(`${report.id}.pdf`);
}
