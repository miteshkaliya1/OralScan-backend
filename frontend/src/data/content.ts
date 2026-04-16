export type Language = "en" | "hi" | "gu";
export type Urgency = "low" | "moderate" | "high";
export type ReviewStatus = "Pending" | "Reviewed";

export type DocType = "oral_image" | "biopsy_report" | "consultation_report";

export type UploadedImage = {
  id: string;
  name: string;
  previewUrl: string;
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  objectKey?: string;
  remoteUrl?: string;
  docType?: DocType;
  isPdf?: boolean;
};

export type QualityCheck = {
  key: string;
  label: Record<Language, string>;
  passed: boolean;
  detail: Record<Language, string>;
};

export type QualityResult = {
  passed: boolean;
  checks: QualityCheck[];
};

export type PatientCase = {
  id: string;
  patientName: string;
  phone: string;
  submittedAt: string;
  urgency: Urgency;
  status: ReviewStatus;
  riskScore: number;
  findings: string[];
  conditions: string[];
  redFlags: string[];
  recommendationKey: "monitor" | "consult" | "immediate";
  summary: Record<Language, string>;
  aiTechnicalSummary: string;
  doctorName?: string;
  reviewedAt?: string;
  doctorNotes?: string;
  finalOpinion?: string;
  recommendations?: string;
  images: { name: string; previewUrl: string }[];
};

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिंदी" },
  { value: "gu", label: "ગુજરાતી" },
] as const;

export const urgencyTone: Record<Urgency, string> = {
  low: "bg-emerald-100 text-emerald-900 border-emerald-300",
  moderate: "bg-amber-100 text-amber-900 border-amber-300",
  high: "bg-rose-100 text-rose-900 border-rose-300",
};

export const appCopy = {
  en: {
    appName: "OralScan",
    heroKicker: "AI-powered oral screening for Gujarat",
    heroTitle: "Early detection workflows for oral cancer, leukoplakia, and tobacco-related lesions.",
    heroBody:
      "A unified patient and surgeon experience with guided uploads, quality validation, payment gating, AI triage, multilingual results, PDF reporting, and WhatsApp follow-up.",
    disclaimer:
      "Screening support only. OralScan does not replace diagnosis, biopsy, or emergency care.",
    language: "Language",
    patientPortal: "Patient Portal",
    doctorPortal: "Surgeon Portal",
    patientAuth: "Patient login / registration",
    doctorAuth: "Doctor login",
    otpLabel: "OTP verification",
    startScreening: "Start new screening",
    previousReports: "Previous reports",
    profile: "Profile & language",
    consentTitle: "Mandatory consent",
    consentLine1: "AI screening is not a final diagnosis.",
    consentLine2: "Images are securely stored.",
    consentLine3: "Your case may be reviewed by a certified surgeon.",
    consentButton: "Agree & continue",
    consentStored: "Consent stored",
    uploadTitle: "Image upload",
    uploadGuide1: "Good lighting",
    uploadGuide2: "Clear focus",
    uploadGuide3: "Mouth fully open",
    uploadGuide4: "No filters or blur",
    qualityTitle: "AI quality check",
    qualityPass: "Quality approved. Payment unlocked.",
    qualityFail: "Quality failed. Re-upload with better lighting and framing.",
    paymentTitle: "Razorpay checkout",
    paymentBody: "Includes AI analysis, surgeon review, and PDF report.",
    paymentButton: "Start payment",
    paymentSuccess: "Payment successful. AI analysis triggered.",
    analysisTitle: "AI analysis and results",
    resultsTitle: "Results",
    recommendation: "Recommended next step",
    findings: "AI findings",
    conditions: "Possible conditions",
    redFlags: "Red flags",
    downloadPdf: "Download PDF report",
    shareReview: "Share for doctor review",
    sharedReview: "Shared to surgeon queue",
    doctorQueue: "Patient queue",
    pendingOnly: "Pending only",
    urgentOnly: "Urgent only",
    allPatients: "All patients",
    technicalNotes: "Technical notes",
    finalOpinion: "Final opinion",
    recommendations: "Recommendations",
    whatsapp: "Send WhatsApp feedback",
    reviewed: "Reviewed",
    pending: "Pending",
    architecture: "Architecture & safety",
    pipeline: "AI pipeline",
    compliance: "Compliance",
    future: "Future enhancements",
    patientDetails: "Patient details",
    screeningFee: "Screening fee",
    doctorFeedback: "Doctor feedback",
    monitor: "Monitor",
    consult: "Consult surgeon",
    immediate: "Immediate attention",
  },
  hi: {
    appName: "ओरलस्कैन",
    heroKicker: "गुजरात के लिए एआई आधारित मौखिक स्क्रीनिंग",
    heroTitle: "ओरल कैंसर, ल्यूकोप्लाकिया और तंबाकू-संबंधित घावों के लिए शुरुआती पहचान वर्कफ़्लो।",
    heroBody:
      "गाइडेड अपलोड, गुणवत्ता जाँच, भुगतान गेट, एआई ट्रायेज, बहुभाषी परिणाम, पीडीएफ रिपोर्ट और व्हाट्सऐप फॉलो-अप वाला एकीकृत रोगी और सर्जन अनुभव।",
    disclaimer:
      "यह केवल स्क्रीनिंग सहायता है। OralScan निदान, बायोप्सी या आपातकालीन देखभाल का विकल्प नहीं है।",
    language: "भाषा",
    patientPortal: "रोगी पोर्टल",
    doctorPortal: "सर्जन पोर्टल",
    patientAuth: "रोगी लॉगिन / पंजीकरण",
    doctorAuth: "डॉक्टर लॉगिन",
    otpLabel: "ओटीपी सत्यापन",
    startScreening: "नई स्क्रीनिंग शुरू करें",
    previousReports: "पुरानी रिपोर्टें",
    profile: "प्रोफ़ाइल और भाषा",
    consentTitle: "अनिवार्य सहमति",
    consentLine1: "एआई स्क्रीनिंग अंतिम निदान नहीं है।",
    consentLine2: "छवियाँ सुरक्षित रूप से संग्रहीत की जाती हैं।",
    consentLine3: "आपके केस की समीक्षा प्रमाणित सर्जन कर सकते हैं।",
    consentButton: "सहमति दें और आगे बढ़ें",
    consentStored: "सहमति संग्रहीत",
    uploadTitle: "इमेज अपलोड",
    uploadGuide1: "अच्छी रोशनी",
    uploadGuide2: "स्पष्ट फोकस",
    uploadGuide3: "मुंह पूरी तरह खोलें",
    uploadGuide4: "फ़िल्टर या ब्लर नहीं",
    qualityTitle: "एआई गुणवत्ता जाँच",
    qualityPass: "गुणवत्ता स्वीकृत। भुगतान खुल गया है।",
    qualityFail: "गुणवत्ता असफल। बेहतर रोशनी और फ्रेमिंग के साथ फिर अपलोड करें।",
    paymentTitle: "रेजरपे चेकआउट",
    paymentBody: "इसमें एआई विश्लेषण, सर्जन समीक्षा और पीडीएफ रिपोर्ट शामिल है।",
    paymentButton: "डेमो भुगतान शुरू करें",
    paymentSuccess: "भुगतान सफल। एआई विश्लेषण शुरू हो गया।",
    analysisTitle: "एआई विश्लेषण और परिणाम",
    resultsTitle: "परिणाम",
    recommendation: "अगला सुझाया गया कदम",
    findings: "एआई निष्कर्ष",
    conditions: "संभावित स्थितियाँ",
    redFlags: "रेड फ्लैग्स",
    downloadPdf: "पीडीएफ रिपोर्ट डाउनलोड करें",
    shareReview: "डॉक्टर समीक्षा के लिए साझा करें",
    sharedReview: "सर्जन कतार में साझा किया गया",
    doctorQueue: "रोगी कतार",
    pendingOnly: "केवल लंबित",
    urgentOnly: "केवल तात्कालिक",
    allPatients: "सभी रोगी",
    technicalNotes: "तकनीकी नोट्स",
    finalOpinion: "अंतिम राय",
    recommendations: "सिफारिशें",
    whatsapp: "व्हाट्सऐप प्रतिक्रिया भेजें",
    reviewed: "समीक्षित",
    pending: "लंबित",
    architecture: "आर्किटेक्चर और सुरक्षा",
    pipeline: "एआई पाइपलाइन",
    compliance: "अनुपालन",
    future: "भविष्य के सुधार",
    patientDetails: "रोगी विवरण",
    screeningFee: "स्क्रीनिंग शुल्क",
    doctorFeedback: "डॉक्टर प्रतिक्रिया",
    monitor: "निगरानी रखें",
    consult: "सर्जन से परामर्श करें",
    immediate: "तुरंत ध्यान दें",
  },
  gu: {
    appName: "ઓરલસ્કેન",
    heroKicker: "ગુજરાત માટે AI આધારિત ઓરલ સ્ક્રીનિંગ",
    heroTitle: "ઓરલ કેન્સર, લ્યુકોપ્લાકિયા અને તમાકુ સંબંધિત લીઝન્સ માટે વહેલી શોધનું વર્કફ્લો.",
    heroBody:
      "ગાઇડેડ અપલોડ, ગુણવત્તા ચેક, પેમેન્ટ ગેટ, AI ટ્રાયેજ, બહુભાષી પરિણામો, PDF રિપોર્ટ અને વોટ્સએપ ફોલો-અપ સાથેનું એકીકૃત પેશન્ટ અને સર્જન અનુભવ.",
    disclaimer:
      "આ ફક્ત સ્ક્રીનિંગ સહાય છે. OralScan નિદાન, બાયોપ્સી અથવા ઇમરજન્સી સારવારનું સ્થાન લઈ શકતું નથી.",
    language: "ભાષા",
    patientPortal: "પેશન્ટ પોર્ટલ",
    doctorPortal: "સર્જન પોર્ટલ",
    patientAuth: "પેશન્ટ લોગિન / નોંધણી",
    doctorAuth: "ડોક્ટર લોગિન",
    otpLabel: "OTP ચકાસણી",
    startScreening: "નવી સ્ક્રીનિંગ શરૂ કરો",
    previousReports: "પાછલા રિપોર્ટ્સ",
    profile: "પ્રોફાઇલ અને ભાષા",
    consentTitle: "ફરજિયાત સંમતિ",
    consentLine1: "AI સ્ક્રીનિંગ અંતિમ નિદાન નથી.",
    consentLine2: "ઇમેજ સુરક્ષિત રીતે સંગ્રહિત થાય છે.",
    consentLine3: "તમારો કેસ પ્રમાણિત સર્જન દ્વારા સમીક્ષિત થઈ શકે છે.",
    consentButton: "સંમતિ આપો અને આગળ વધો",
    consentStored: "સંમતિ સંગ્રહિત",
    uploadTitle: "ઇમેજ અપલોડ",
    uploadGuide1: "સારી લાઇટિંગ",
    uploadGuide2: "સ્પષ્ટ ફોકસ",
    uploadGuide3: "મોઢું સંપૂર્ણ ખોલો",
    uploadGuide4: "ફિલ્ટર અથવા બ્લર નહીં",
    qualityTitle: "AI ગુણવત્તા ચેક",
    qualityPass: "ગુણવત્તા મંજૂર. ચુકવણી હવે ઉપલબ્ધ છે.",
    qualityFail: "ગુણવત્તા નિષ્ફળ. વધુ સારી લાઇટિંગ અને ફ્રેમિંગ સાથે ફરી અપલોડ કરો.",
    paymentTitle: "રેઝરપે ચેકઆઉટ",
    paymentBody: "આમાં AI વિશ્લેષણ, સર્જન સમીક્ષા અને PDF રિપોર્ટ શામેલ છે.",
    paymentButton: "ડેમો ચુકવણી શરૂ કરો",
    paymentSuccess: "ચુકવણી સફળ. AI વિશ્લેષણ શરૂ થયું.",
    analysisTitle: "AI વિશ્લેષણ અને પરિણામો",
    resultsTitle: "પરિણામો",
    recommendation: "આગળનું સૂચિત પગલું",
    findings: "AI શોધો",
    conditions: "સંભવિત સ્થિતિઓ",
    redFlags: "રેડ ફ્લેગ્સ",
    downloadPdf: "PDF રિપોર્ટ ડાઉનલોડ કરો",
    shareReview: "ડોક્ટર સમીક્ષા માટે શેર કરો",
    sharedReview: "સર્જન કતારમાં શેર કરાયું",
    doctorQueue: "પેશન્ટ કતાર",
    pendingOnly: "ફક્ત પેન્ડિંગ",
    urgentOnly: "ફક્ત તાત્કાલિક",
    allPatients: "બધા પેશન્ટ્સ",
    technicalNotes: "ટેક્નિકલ નોંધો",
    finalOpinion: "અંતિમ અભિપ્રાય",
    recommendations: "ભલામણો",
    whatsapp: "વોટ્સએપ ફીડબેક મોકલો",
    reviewed: "રીવ્યુડ",
    pending: "પેન્ડિંગ",
    architecture: "આર્કિટેક્ટર અને સલામતી",
    pipeline: "AI પાઇપલાઇન",
    compliance: "અનુપાલન",
    future: "ભવિષ્યના સુધારા",
    patientDetails: "પેશન્ટ વિગતો",
    screeningFee: "સ્ક્રીનિંગ ફી",
    doctorFeedback: "ડોક્ટર ફીડબેક",
    monitor: "મોનિટર કરો",
    consult: "સર્જનનો સંપર્ક કરો",
    immediate: "તાત્કાલિક ધ્યાન",
  },
} as const;

export const recommendationText = {
  en: {
    monitor: "Continue monitoring and repeat screening if symptoms change.",
    consult: "Arrange a surgeon consultation within the next few days.",
    immediate: "Seek immediate clinical examination from an oral oncology specialist.",
  },
  hi: {
    monitor: "लक्षण बदलें तो निगरानी रखें और स्क्रीनिंग दोहराएँ।",
    consult: "अगले कुछ दिनों में सर्जन परामर्श लें।",
    immediate: "तुरंत ओरल ऑन्कोलॉजी विशेषज्ञ से चिकित्सकीय जांच कराएँ।",
  },
  gu: {
    monitor: "લક્ષણોમાં ફેરફાર થાય તો મોનિટરિંગ ચાલુ રાખો અને ફરી સ્ક્રીનિંગ કરો.",
    consult: "આવતા કેટલાક દિવસોમાં સર્જન પરામર્શ લો.",
    immediate: "તાત્કાલિક ઓરલ ઓન્કોલોજી નિષ્ણાત પાસે ક્લિનિકલ તપાસ કરાવો.",
  },
};

export const pipelineSteps = [
  "Image upload",
  "Quality assessment model",
  "Disease classification model",
  "Urgency scoring",
  "Result generation",
  "Surgeon review",
];

export const complianceItems = [
  "Patient consent capture with timestamp",
  "Encrypted image storage in object storage",
  "Role-based visibility for patient and surgeon records",
  "Audit logs for feedback and report actions",
  "Medical disclaimers on result and report surfaces",
];

export const futureEnhancements = [
  "Appointment booking",
  "Tele-consultation",
  "Government hospital referral mapping",
  "Offline camp mode",
  "Model retraining dashboard",
  "Real backend contract: auth, case schema, REST APIs, and PostgreSQL models",
  "Real integrations: Razorpay, WhatsApp, and server-side PDF generation",
];