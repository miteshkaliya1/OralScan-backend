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
    consentTitle: "Informed Consent for Oral Cancer Screening",
    consentSubtitle: "Please read all terms carefully. Consent is required before proceeding with your screening.",
    consentLine1: "AI screening is a supportive tool, not a substitute for professional medical diagnosis. Results must be interpreted by a qualified clinician before any treatment decision is made.",
    consentLine2: "Your oral cavity images, personal details, and health history are encrypted and securely stored in compliance with applicable data protection laws. Your data is used solely for screening purposes.",
    consentLine3: "A certified oral surgeon or oncologist may review your submitted images and provide clinical feedback. This review is advisory and non-binding.",
    consentLine4: "OralScan detects early signs of oral lesions, leukoplakia, and tobacco-related conditions. It does not diagnose cancer. A clinical examination and biopsy are required for confirmation.",
    consentLine5: "Your case data — including images and AI findings — may be anonymised and used to improve AI model accuracy. No personally identifiable information is shared with third parties.",
    consentLine6: "You may withdraw consent at any time by contacting OralScan support. Withdrawal does not affect any care already provided.",
    consentLine7: "For emergency symptoms — rapid swelling, severe pain, or difficulty swallowing — please contact a hospital immediately. Do not rely on this platform for emergencies.",
    consentLine8: "By consenting, you confirm that you are 18 years of age or older, or are a legal guardian providing consent on behalf of a minor patient.",
    consentButton: "I have read and agree to all the above terms",
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
    consentTitle: "ओरल कैंसर स्क्रीनिंग के लिए सूचित सहमति",
    consentSubtitle: "कृपया सभी शर्तें ध्यान से पढ़ें। आगे बढ़ने के लिए सहमति आवश्यक है।",
    consentLine1: "एआई स्क्रीनिंग केवल एक सहायक उपकरण है, पेशेवर चिकित्सा निदान का विकल्प नहीं। कोई भी उपचार निर्णय लेने से पहले किसी योग्य चिकित्सक द्वारा परिणामों की व्याख्या की जानी चाहिए।",
    consentLine2: "आपकी मुख गुहा की छवियाँ, व्यक्तिगत विवरण और स्वास्थ्य इतिहास एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत किए जाते हैं। आपका डेटा केवल स्क्रीनिंग उद्देश्यों के लिए उपयोग किया जाता है।",
    consentLine3: "एक प्रमाणित ओरल सर्जन या ऑन्कोलॉजिस्ट आपकी छवियों की समीक्षा कर सकते हैं। यह समीक्षा सलाहकारी है और बाध्यकारी नहीं है।",
    consentLine4: "OralScan ओरल घावों, ल्यूकोप्लाकिया और तंबाकू-संबंधित स्थितियों के प्रारंभिक संकेतों का पता लगाता है। यह कैंसर का निदान नहीं करता। पुष्टि के लिए बायोप्सी आवश्यक है।",
    consentLine5: "आपका केस डेटा — छवियाँ और एआई निष्कर्ष — एआई मॉडल सुधार के लिए अनामित किया जा सकता है। कोई व्यक्तिगत पहचान योग्य जानकारी तीसरे पक्ष के साथ साझा नहीं की जाती।",
    consentLine6: "आप किसी भी समय OralScan सहायता से संपर्क करके सहमति वापस ले सकते हैं। वापसी से पहले से प्रदान की गई देखभाल प्रभावित नहीं होती।",
    consentLine7: "आपातकालीन लक्षणों के लिए — तेज सूजन, गंभीर दर्द, या निगलने में कठिनाई — तुरंत अस्पताल से संपर्क करें।",
    consentLine8: "सहमति देकर, आप पुष्टि करते हैं कि आपकी आयु 18 वर्ष या उससे अधिक है, या आप किसी नाबालिग रोगी की ओर से सहमति देने वाले कानूनी अभिभावक हैं।",
    consentButton: "मैंने सभी शर्तें पढ़ ली हैं और सहमत हूँ",
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
    consentTitle: "ઓરલ કેન્સર સ્ક્રીનિંગ માટે જાણકાર સંમતિ",
    consentSubtitle: "કૃપા કરીને તમામ શરતો કાળજીપૂર્વક વાંચો. આગળ વધવા માટે સંમતિ ફરજિયાત છે.",
    consentLine1: "AI સ્ક્રીનિંગ એ એક સહાયક સાધન છે, વ્યાવસાયિક તબીબી નિદાનનો વિકલ્પ નથી. કોઈ પણ સારવારનો નિર્ણય લેતા પહેલા લાયક ચિકિત્સક દ્વારા પરિણામોનું અર્થઘટન થવું જોઈએ.",
    consentLine2: "તમારી ઓરલ કેવિટી ઇમેજ, વ્યક્તિગત વિગતો અને સ્વાસ્થ્ય ઇતિહાસ એન્ક્રિપ્ટ કરીને સુરક્ષિત રીતે સંગ્રહિત છે. ડેટા ફક્ત સ્ક્રીનિંગ હેતુ માટે ઉપયોગ કરવામાં આવે છે.",
    consentLine3: "પ્રમાણિત ઓરલ સર્જન અથવા ઓન્કોલોજિસ્ટ તમારી ઇમેજ સમીક્ષા કરી ક્લિનિકલ ફીડબેક આપી શકે છે. આ સમીક્ષા સલાહકારી છે અને બંધનકારક નથી.",
    consentLine4: "OralScan ઓરલ ઘા, લ્યુકોપ્લાકિયા અને તમાકુ-સંબંધિત સ્થિતિઓના પ્રારંભિક સંકેતો શોધે છે. તે કેન્સરનું નિદાન કરતું નથી. પુષ્ટિ માટે ક્લિનિકલ તપાસ અને બાયોપ્સી ફરજિયાત છે.",
    consentLine5: "તમારો કેસ ડેટા — ઇમેજ અને AI તારણ — AI મોડેલ સુધારવા માટે અનામી રૂપે ઉપયોગ થઈ શકે છે. કોઈ પણ વ્યક્તિ-ઓળખ માહિતી ત્રીજા પક્ષ સાથે શેર કરવામાં આવતી નથી.",
    consentLine6: "તમે OralScan સહાય ટીમ સાથે સંપર્ક કરીને ગમે ત્યારે સંમતિ પાછી ખેંચી શકો છો. પાછી ખેંચવાથી અગાઉ આપવામાં આવેલી સંભાળ પ્રભાવિત થતી નથી.",
    consentLine7: "ઇમરજન્સી લક્ષણો — ઝડપી સોજો, ગંભીર દુખાવો, ગળવામાં તકલીફ — માટે તાત્કાલિક હોસ્પિટલ સાથે સંપર્ક કરો. ઇમરજન્સી માટે આ પ્લેટફોર્મ પર આધાર ન રાખો.",
    consentLine8: "સંમતિ આપીને, તમે ખાતરી આપો છો કે તમારી ઉંમર 18 વર્ષ અથવા તેથી વધુ છે, અથવા તમે સગીર દર્દી વતી સંમતિ આપતા કાનૂની વાલી છો.",
    consentButton: "મેં ઉપરની તમામ શરતો વાંચી અને સ્વીકાર કરું છું",
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