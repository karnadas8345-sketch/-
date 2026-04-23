import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { 
  Sparkles, 
  Moon, 
  Sun, 
  Compass, 
  Calendar, 
  Clock, 
  MapPin, 
  Send,
  Loader2,
  Info,
  Star,
  ChevronRight,
  RefreshCw,
  Lock,
  User,
  Key,
  Fingerprint,
  ScanFace,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  FileDown,
  Check,
  FileText,
  History,
  Languages,
  Globe,
  MessageSquare,
  X,
  SendHorizontal,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  calculateAstrology, 
  SIGNS_BN, 
  PLANETS_BN, 
  PLANETS_HI, 
  PLANETS_NE, 
  PLANETS_OR,
  PLANETS_MR,
  PLANETS_GU
} from './services/astrologyEngine';
import BirthChart from './components/BirthChart';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date("2026-02-23T04:32:22-08:00"));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [language, setLanguage] = useState<'bn' | 'en' | 'hi' | 'ne' | 'or' | 'mr' | 'gu' | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginMode, setLoginMode] = useState<'password' | 'pin' | 'biometric'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const [dob, setDob] = useState('');
  const [tob, setTob] = useState('');
  const [location, setLocation] = useState({ lat: 22.5726, lon: 88.3639 }); // Default Kolkata
  const [userName, setUserName] = useState('অনামিকা');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const interpretationRef = React.useRef<HTMLDivElement>(null);

  const [showDailyHoroscope, setShowDailyHoroscope] = useState(false);
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [dailyHoroscopeText, setDailyHoroscopeText] = useState<string>('');
  const [isDailyHoroscopeLoading, setIsDailyHoroscopeLoading] = useState(false);

  const [showDoshaDetails, setShowDoshaDetails] = useState(false);
  const [doshaDetailsText, setDoshaDetailsText] = useState<string>('');
  const [isDoshaLoading, setIsDoshaLoading] = useState(false);
  const [selectedDoshaPlanet, setSelectedDoshaPlanet] = useState<string>('');

  const [chatPosition, setChatPosition] = useState({ x: 0, y: 0 });
  const dragControls = useDragControls();

  const [history, setHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('astro_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('astro_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (data: any) => {
    setHistory(prev => {
      const filtered = prev.filter(item => 
        item.dob !== data.dob || item.tob !== data.tob || item.userName !== data.userName
      );
      return [data, ...filtered].slice(0, 10); // Keep last 10
    });
  };

  const getBengaliDate = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const bengaliMonths = [
      { bn: "বৈশাখ", en: "Boishakh" },
      { bn: "জ্যৈষ্ঠ", en: "Jyoishtha" },
      { bn: "আষাঢ়", en: "Asharh" },
      { bn: "শ্রাবণ", en: "Shravan" },
      { bn: "ভাদ্র", en: "Bhadra" },
      { bn: "আশ্বিন", en: "Ashwin" },
      { bn: "কার্তিক", en: "Kartik" },
      { bn: "অগ্রহায়ণ", en: "Agrahayan" },
      { bn: "পৌষ", en: "Paush" },
      { bn: "মাঘ", en: "Magh" },
      { bn: "ফাল্গুন", en: "Falgun" },
      { bn: "চৈত্র", en: "Choitra" }
    ];

    // Simplified Revised Bengali Calendar logic
    let bDay, bMonth, bYear;

    const isLeapYear = (y: number) => (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);

    const monthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
    if (isLeapYear(year)) monthDays[10] = 31; // Falgun in leap year

    // Poila Boishakh is April 14
    const poilaBoishakh = new Date(year, 3, 14);
    
    if (date < poilaBoishakh) {
      bYear = year - 594;
      // Calculate days from previous year's Poila Boishakh
      const prevPoilaBoishakh = new Date(year - 1, 3, 14);
      let diff = Math.floor((date.getTime() - prevPoilaBoishakh.getTime()) / (1000 * 60 * 60 * 24));
      
      const prevMonthDays = [31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 30, 30];
      if (isLeapYear(year - 1)) prevMonthDays[10] = 31;

      let m = 0;
      while (diff >= prevMonthDays[m]) {
        diff -= prevMonthDays[m];
        m++;
      }
      bMonth = m;
      bDay = diff + 1;
    } else {
      bYear = year - 593;
      let diff = Math.floor((date.getTime() - poilaBoishakh.getTime()) / (1000 * 60 * 60 * 24));
      let m = 0;
      while (diff >= monthDays[m]) {
        diff -= monthDays[m];
        m++;
      }
      bMonth = m;
      bDay = diff + 1;
    }

    const monthName = bengaliMonths[bMonth];
    return {
      day: bDay,
      month: monthName,
      year: bYear
    };
  };

  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'bn' ? 'bn-BD' : language || 'en', { weekday: 'long' });
  };

  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string, timestamp?: string }[]>(() => {
    const saved = localStorage.getItem('astro_chat_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [chatDateFilter, setChatDateFilter] = useState<string>('');
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  useEffect(() => {
    localStorage.setItem('astro_chat_history', JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    const timestamp = new Date().toISOString();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMessage, timestamp }]);
    setIsChatLoading(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are an expert Vedic Astrologer. Answer the user's questions accurately and politely. If the user has provided birth details (Name: ${userName}, DOB: ${dob}, TOB: ${tob}), use them to provide personalized insights. Support the user in their preferred language: ${language || 'bn'}. Languages supported: Bengali (bn), English (en), Hindi (hi), Nepali (ne), Odia (or), Marathi (mr), Gujarati (gu).`,
        },
        history: chatMessages.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
      });

      const response = await chat.sendMessageStream({ message: userMessage });
      
      let fullText = '';
      const responseTimestamp = new Date().toISOString();
      setChatMessages(prev => [...prev, { role: 'model', text: '', timestamp: responseTimestamp }]);
      
      for await (const chunk of response) {
        const text = chunk.text || '';
        fullText += text;
        setChatMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullText;
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: t('somethingWrong'), timestamp: new Date().toISOString() }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const translations = {
    bn: {
      loginTitle: "নিরাপদ প্রবেশ",
      loginSubtitle: "আপনার জ্যোতিষ প্রোফাইলে প্রবেশ করতে যাচাই করুন",
      passwordTab: "পাসওয়ার্ড",
      pinTab: "পিন",
      bioTab: "বায়োমেট্রিক",
      idLabel: "মোবাইল নম্বর বা ইমেইল আইডি",
      idPlaceholder: "আপনার নম্বর বা ইমেইল লিখুন",
      passLabel: "পাসওয়ার্ড",
      pinLabel: "সিকিউরিটি পিন",
      pinHint: "আপনার ৪ ডিজিটের পিন কোডটি প্রদান করুন",
      bioHint: "দ্রুত প্রবেশের জন্য বায়োমেট্রিক ব্যবহার করুন",
      fingerprint: "ফিঙ্গারপ্রিন্ট",
      facelock: "ফেস লক",
      loginBtn: "প্রবেশ করুন",
      guestBtn: "অতিথি হিসেবে প্রবেশ করুন (Guest Login)",
      forgotPass: "পাসওয়ার্ড ভুলে গেছেন?",
      appTitle: "জ্যোতিষ শাস্ত্র",
      appSubtitle: "আপনার জন্মলগ্নের গ্রহের অবস্থান এবং ভাগ্যের রহস্য উন্মোচন করুন।",
      dobLabel: "জন্ম তারিখ",
      tobLabel: "জন্ম সময়",
      nameLabel: "আপনার নাম",
      namePlaceholder: "এখানে আপনার নাম লিখুন",
      calculateBtn: "রাশিফল দেখুন",
      yourRashi: "আপনার রাশি",
      yourNakshatra: "আপনার নক্ষত্র",
      interpretationTitle: "আপনার ভাগ্য বিশ্লেষণ",
      copyBtn: "কপি করুন",
      copiedBtn: "কপি হয়েছে",
      loadingInterpretation: "আপনার গ্রহের অবস্থান বিশ্লেষণ করা হচ্ছে...",
      footer: "© ২০২৬ জ্যোতিষ শাস্ত্র - মহাজাগতিক অন্তর্দৃষ্টি",
      tagline: "মহাজাগতিক অন্তর্দৃষ্টি",
      card1Title: "নির্ভুল গণনা",
      card1Desc: "আধুনিক জ্যোতির্বিজ্ঞান এবং বৈদিক শাস্ত্রের সমন্বয়।",
      card2Title: "ব্যক্তিগত বিশ্লেষণ",
      card2Desc: "আপনার জন্মলগ্নের ভিত্তিতে তৈরি বিশেষ প্রতিবেদন।",
      card3Title: "গোপনীয়তা",
      card3Desc: "আপনার তথ্য সম্পূর্ণ নিরাপদ এবং শুধুমাত্র আপনার জন্য।",
      calculationDetails: "গণনা পদ্ধতি: লাহিড়ী অয়নাংশ",
      siderealMethod: "নিরয়ণ (Sidereal) পদ্ধতি",
      birthChart: "জন্ম কুণ্ডলী (চক্র)",
      locationError: "অবস্থান পাওয়া যায়নি। অনুগ্রহ করে ম্যানুয়ালি লিখুন।",
      somethingWrong: "কিছু একটা ভুল হয়েছে। আবার চেষ্টা করুন।",
      required: "প্রদান করুন",
      currentLocation: "আপনার বর্তমান অবস্থান",
      currentDasha: "বর্তমান দশা",
      endsOn: "শেষ হবে",
      remaining: "বাকি সময়",
      currentTimeLabel: "বর্তমান সময়",
      bengaliDate: "বাংলা তারিখ",
      dayOfWeek: "বার",
      history: "ইতিহাস",
      recentCalculations: "সাম্প্রতিক গণনা",
      noHistory: "কোনো ইতিহাস নেই",
      clearHistory: "ইতিহাস মুছুন",
      chatTitle: "এআই জ্যোতিষী চ্যাট",
      chatPlaceholder: "যেকোনো প্রশ্ন জিজ্ঞাসা করুন...",
      chatSend: "পাঠান",
      chatWelcome: "নমস্কার! আমি আপনার জ্যোতিষ সংক্রান্ত যেকোনো প্রশ্নের উত্তর দিতে পারি। আপনি আপনার রাশিফল বা অন্য কিছু সম্পর্কে জিজ্ঞাসা করতে পারেন।",
      dailyHoroscope: "আজকের রাশিফল",
      effectsAndRemedies: "প্রভাব ও প্রতিকার",
      doshaAnalysis: "দশা/দোষ বিশ্লেষণ",
      close: "বন্ধ করুন",
      selectSign: "আপনার রাশি নির্বাচন করুন",
      clearChat: "চ্যাট মুছুন"
    },
    mr: {
      loginTitle: "सुरक्षित प्रवेश",
      loginSubtitle: "तुमच्या ज्योतिष प्रोफाइलमध्ये प्रवेश करण्यासाठी सत्यापित करा",
      passwordTab: "पासवर्ड",
      pinTab: "पिन",
      bioTab: "बायोमेट्रिक",
      idLabel: "मोबाईल नंबर किंवा ईमेल आयडी",
      idPlaceholder: "तुमचा नंबर किंवा ईमेल प्रविष्ट करा",
      passLabel: "पासवर्ड",
      pinLabel: "सुरक्षा पिन",
      pinHint: "तुमचा ४-अंकी पिन कोड प्रविष्ट करा",
      bioHint: "द्रुत प्रवेशासाठी बायोमेट्रिक्स वापरा",
      fingerprint: "फिंगरप्रिंट",
      facelock: "फेस लॉक",
      loginBtn: "लॉगिन",
      guestBtn: "अतिथी म्हणून सुरू ठेवा",
      forgotPass: "पासवर्ड विसरलात?",
      appTitle: "ज्योतिष शास्त्र",
      appSubtitle: "तुमच्या नशिबाचे आणि ग्रहांच्या स्थितीचे रहस्य उलगडा.",
      dobLabel: "जन्म तारीख",
      tobLabel: "जन्म वेळ",
      nameLabel: "तुमचे नाव",
      namePlaceholder: "येथे तुमचे नाव प्रविष्ट करा",
      calculateBtn: "कुंडली पहा",
      yourRashi: "तुमची राशी",
      yourNakshatra: "तुमचे नक्षत्र",
      interpretationTitle: "तुमचे भविष्य विश्लेषण",
      copyBtn: "कॉपी करा",
      copiedBtn: "कॉपी झाले",
      loadingInterpretation: "तुमच्या ग्रहांच्या स्थितीचे विश्लेषण करत आहे...",
      footer: "© २०२६ ज्योतिष शास्त्र - कॉस्मिक इनसाइट्स",
      tagline: "कॉस्मिक इनसाइट्स",
      card1Title: "अचूक गणना",
      card1Desc: "आधुनिक खगोलशास्त्र आणि वैदिक शास्त्रांचा संगम.",
      card2Title: "वैयक्तिक विश्लेषण",
      card2Desc: "तुमच्या जन्माच्या वेळेवर आधारित विशेष अहवाल.",
      card3Title: "गोपनीयता",
      card3Desc: "तुमचा डेटा पूर्णपणे सुरक्षित आहे आणि फक्त तुमच्यासाठी आहे.",
      calculationDetails: "गणना पद्धत: लाहिरी अयनांश",
      siderealMethod: "निरयण (Sidereal) पद्धत",
      birthChart: "जन्म कुंडली चक्र",
      locationError: "ठिकाण सापडले नाही. कृपया मॅन्युअली प्रविष्ट करा.",
      somethingWrong: "काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.",
      required: "आवश्यक",
      currentLocation: "तुमचे सध्याचे ठिकाण",
      currentDasha: "सध्याची दशा",
      endsOn: "संपेल",
      remaining: "उर्वरित वेळ",
      currentTimeLabel: "वर्तमान वेळ",
      bengaliDate: "बंगाली तारीख",
      dayOfWeek: "दिवस",
      history: "इतिहास",
      recentCalculations: "अलीकडील गणना",
      noHistory: "इतिहास नाही",
      clearHistory: "इतिहास साफ करा",
      chatTitle: "एआई ज्योतिषी चॅट",
      chatPlaceholder: "काहीही विचारा...",
      chatSend: "पाठवा",
      chatWelcome: "नमस्कार! मी तुमच्या ज्योतिषविषयक कोणत्याही प्रश्नाचे उत्तर देऊ शकतो. तुम्ही तुमच्या कुंडलीबद्दल किंवा इतर कशाबद्दलही विचारू शकता.",
      dailyHoroscope: "आजचे राशीभविष्य",
      effectsAndRemedies: "प्रभाव आणि उपाय",
      doshaAnalysis: "दशा/दोष विश्लेषण",
      close: "बंद करा",
      selectSign: "तुमची राशी निवडा",
      clearChat: "चॅट साफ करा"
    },
    gu: {
      loginTitle: "સુરક્ષિત પ્રવેશ",
      loginSubtitle: "તમારા જ્યોતિષ પ્રોફાઇલમાં પ્રવેશવા માટે ચકાસો",
      passwordTab: "પાસવર્ડ",
      pinTab: "પિન",
      bioTab: "બાયોમેટ્રિક",
      idLabel: "મોબાઇલ નંબર અથવા ઇમેઇલ આઈડી",
      idPlaceholder: "તમારો નંબર અથવા ઇમેઇલ દાખલ કરો",
      passLabel: "પાસવર્ડ",
      pinLabel: "સુરક્ષા પિન",
      pinHint: "તમારો 4-અંકનો પિન કોડ દાખલ કરો",
      bioHint: "ઝડપી પ્રવેશ માટે બાયોમેટ્રિક્સનો ઉપયોગ કરો",
      fingerprint: "ફિંગરપ્રિન્ટ",
      facelock: "ફેસ લોક",
      loginBtn: "લોગિન",
      guestBtn: "અતિથિ તરીકે ચાલુ રાખો",
      forgotPass: "પાસવર્ડ ભૂલી ગયા છો?",
      appTitle: "જ્યોતિષ શાસ્ત્ર",
      appSubtitle: "તમારા ભાગ્ય અને ગ્રહોની સ્થિતિના રહસ્યો ઉજાગર કરો.",
      dobLabel: "જન્મ તારીખ",
      tobLabel: "જન્મ સમય",
      nameLabel: "તમારું નામ",
      namePlaceholder: "અહીં તમારું નામ લખો",
      calculateBtn: "જન્માક્ષર જુઓ",
      yourRashi: "તમારી રાશિ",
      yourNakshatra: "તમારું નક્ષત્ર",
      interpretationTitle: "તમારું ભાગ્ય વિશ્લેષણ",
      copyBtn: "કોપી કરો",
      copiedBtn: "કોપી થઈ ગયું",
      loadingInterpretation: "તમારા ગ્રહોની સ્થિતિનું વિશ્લેષણ કરી રહ્યા છીએ...",
      footer: "© ૨૦૨૬ જ્યોતિષ શાસ્ત્ર - કોસ્મિક ઇનસાઇટ્સ",
      tagline: "કોસ્મિક ઇનસાઇટ્સ",
      card1Title: "ચોક્કસ ગણતરી",
      card1Desc: "આધુનિક ખગોળશાસ્ત્ર અને વૈદિક શાસ્ત્રોનું સંયોજન.",
      card2Title: "વ્યક્તિગત વિશ્લેષણ",
      card2Desc: "તમારા જન્મ સમયના આધારે બનાવેલ વિશેષ અહેવાલો.",
      card3Title: "ગોપનીયતા",
      card3Desc: "તમારો ડેટા સંપૂર્ણપણે સુરક્ષિત છે અને ફક્ત તમારા માટે છે.",
      calculationDetails: "ગણતરી પદ્ધતિ: લાહિરી અયનાંશ",
      siderealMethod: "નિરયણ (Sidereal) પદ્ધતિ",
      birthChart: "જન્મ કુંડળી ચક્ર",
      locationError: "સ્થળ મળ્યું નથી. કૃપા કરીને મેન્યુઅલી દાખલ કરો.",
      somethingWrong: "કંઈક ખોટું થયું. કૃપા કરીને ફરી પ્રયાસ કરો.",
      required: "જરૂરી",
      currentLocation: "તમારું વર્તમાન સ્થળ",
      currentDasha: "વર્તમાન દશા",
      endsOn: "સમાપ્ત થશે",
      remaining: "બાકી સમય",
      currentTimeLabel: "વર્તમાન સમય",
      bengaliDate: "બંગાળી તારીખ",
      dayOfWeek: "દિવસ",
      history: "ઇતિહાસ",
      recentCalculations: "તાજેતરની ગણતરી",
      noHistory: "કોઈ ઇતિહાસ નથી",
      clearHistory: "ઇતિહાસ સાફ કરો",
      chatTitle: "એઆઈ જ્યોતિષી ચેટ",
      chatPlaceholder: "કંઈપણ પૂછો...",
      chatSend: "મોકલો",
      chatWelcome: "નમસ્તે! હું તમારા જ્યોતિષ સંબંધી કોઈપણ પ્રશ્નનો જવાબ આપી શકું છું. તમે તમારા જન્માક્ષર અથવા અન્ય કોઈ બાબત વિશે પૂછી શકો છો.",
      dailyHoroscope: "આજનું રાશિફળ",
      effectsAndRemedies: "અસરો અને ઉપાયો",
      doshaAnalysis: "દશા/દોષ વિશ્લેષણ",
      close: "બંધ કરો",
      selectSign: "તમારી રાશિ પસંદ કરો",
      clearChat: "ચેટ સાફ કરો"
    },
    en: {
      loginTitle: "Secure Access",
      loginSubtitle: "Verify to access your astrology profile",
      passwordTab: "Password",
      pinTab: "PIN",
      bioTab: "Biometric",
      idLabel: "Mobile Number or Email ID",
      idPlaceholder: "Enter your number or email",
      passLabel: "Password",
      pinLabel: "Security PIN",
      pinHint: "Enter your 4-digit PIN code",
      bioHint: "Use biometrics for quick access",
      fingerprint: "Fingerprint",
      facelock: "Face Lock",
      loginBtn: "Login",
      guestBtn: "Continue as Guest",
      forgotPass: "Forgot Password?",
      appTitle: "Astrology Engine",
      appSubtitle: "Uncover the mysteries of your destiny and planetary positions.",
      dobLabel: "Date of Birth",
      tobLabel: "Time of Birth",
      nameLabel: "Your Name",
      namePlaceholder: "Enter your name here",
      calculateBtn: "View Horoscope",
      yourRashi: "Your Rashi",
      yourNakshatra: "Your Nakshatra",
      interpretationTitle: "Your Destiny Analysis",
      copyBtn: "Copy",
      copiedBtn: "Copied",
      loadingInterpretation: "Analyzing your planetary positions...",
      footer: "© 2026 Astrology Engine - Cosmic Insights",
      tagline: "Cosmic Insights",
      card1Title: "Accurate Calculations",
      card1Desc: "Combination of modern astronomy and Vedic scriptures.",
      card2Title: "Personalized Analysis",
      card2Desc: "Special reports created based on your birth time.",
      card3Title: "Privacy",
      card3Desc: "Your data is completely secure and for you only.",
      calculationDetails: "Calculation Method: Lahiri Ayanamsa",
      siderealMethod: "Sidereal Method",
      birthChart: "Birth Chart Wheel",
      locationError: "Location not found. Please enter manually.",
      somethingWrong: "Something went wrong. Please try again.",
      required: "required",
      currentLocation: "Your current location",
      currentDasha: "Current Dasha",
      endsOn: "Ends on",
      remaining: "Remaining",
      currentTimeLabel: "Current Time",
      bengaliDate: "Bengali Date",
      dayOfWeek: "Day",
      history: "History",
      recentCalculations: "Recent Calculations",
      noHistory: "No history yet",
      clearHistory: "Clear History",
      chatTitle: "AI Astrologer Chat",
      chatPlaceholder: "Ask anything...",
      chatSend: "Send",
      chatWelcome: "Hello! I can answer any of your astrology questions. You can ask about your horoscope or anything else.",
      dailyHoroscope: "Daily Horoscope",
      effectsAndRemedies: "Effects & Remedies",
      doshaAnalysis: "Dosha Analysis",
      close: "Close",
      selectSign: "Select Your Zodiac Sign",
      clearChat: "Clear Chat"
    },
    hi: {
      loginTitle: "सुरक्षित पहुंच",
      loginSubtitle: "अपनी ज्योतिष प्रोफ़ाइल तक पहुंचने के लिए सत्यापित करें",
      passwordTab: "पासवर्ड",
      pinTab: "पिन",
      bioTab: "बायोमेट्रिक",
      idLabel: "मोबाइल नंबर या ईमेल आईडी",
      idPlaceholder: "अपना नंबर या ईमेल दर्ज करें",
      passLabel: "पासवर्ड",
      pinLabel: "सुरक्षा पिन",
      pinHint: "अपना 4-अंकीय पिन कोड दर्ज करें",
      bioHint: "त्वरित पहुंच के लिए बायोमेट्रिक्स का उपयोग करें",
      fingerprint: "फिंगरप्रिंट",
      facelock: "फेस लॉक",
      loginBtn: "लॉगिन",
      guestBtn: "अतिथि के रूप में जारी रखें",
      forgotPass: "पासवर्ड भूल गए?",
      appTitle: "ज्योतिष शास्त्र",
      appSubtitle: "अपने भाग्य और ग्रहों की स्थिति के रहस्यों को उजागर करें।",
      dobLabel: "जन्म तिथि",
      tobLabel: "जन्म समय",
      nameLabel: "आपका नाम",
      namePlaceholder: "यहाँ अपना नाम लिखें",
      calculateBtn: "राशिफल देखें",
      yourRashi: "आपकी राशि",
      yourNakshatra: "आपका नक्षत्र",
      interpretationTitle: "आपका भाग्य विश्लेषण",
      copyBtn: "कॉपी करें",
      copiedBtn: "कॉपी हो गया",
      loadingInterpretation: "आपके ग्रहों की स्थिति का विश्लेषण किया जा रहा है...",
      footer: "© 2026 ज्योतिष शास्त्र - ब्रह्मांडीय अंतर्दृष्टि",
      tagline: "ब्रह्मांडीय अंतर्दृष्टि",
      card1Title: "सटीक गणना",
      card1Desc: "आधुनिक खगोल विज्ञान और वैदिक शास्त्रों का संयोजन।",
      card2Title: "व्यक्तिगत विश्लेषण",
      card2Desc: "आपके जन्म के समय के आधार पर बनाई गई विशेष रिपोर्ट।",
      card3Title: "गोपनीयता",
      card3Desc: "आपका डेटा पूरी तरह से सुरक्षित है और केवल आपके लिए है।",
      calculationDetails: "गणना पद्धति: लाहिड़ी अयनांश",
      siderealMethod: "निरयण (Sidereal) पद्धति",
      birthChart: "जन्म कुंडली चक्र",
      locationError: "स्थान नहीं मिला। कृपया मैन्युअल रूप से दर्ज करें।",
      somethingWrong: "कुछ गलत हो गया। कृपया पुनः प्रयास करें।",
      required: "आवश्यक",
      currentLocation: "आपका वर्तमान स्थान",
      currentDasha: "वर्तमान दशा",
      endsOn: "समाप्त होगा",
      remaining: "शेष समय",
      currentTimeLabel: "वर्तमान समय",
      bengaliDate: "बंगाली तिथि",
      dayOfWeek: "वार",
      history: "इतिहास",
      recentCalculations: "हाल की गणना",
      noHistory: "कोई इतिहास नहीं",
      clearHistory: "इतिहास साफ़ करें",
      chatTitle: "एआई ज्योतिषी चैट",
      chatPlaceholder: "कुछ भी पूछें...",
      chatSend: "भेजें",
      chatWelcome: "नमस्ते! मैं आपके ज्योतिष संबंधी किसी भी प्रश्न का उत्तर दे सकता हूँ। आप अपने राशिफल या किसी और चीज़ के बारे में पूछ सकते हैं।",
      dailyHoroscope: "आज का राशिफल",
      effectsAndRemedies: "प्रभाव और उपाय",
      doshaAnalysis: "दशा/दोष विश्लेषण",
      close: "बंद करें",
      selectSign: "अपनी राशि चुनें",
      clearChat: "चैट साफ़ करें"
    },
    ne: {
      loginTitle: "सुरक्षित पहुँच",
      loginSubtitle: "तपाईंको ज्योतिष प्रोफाइल पहुँच गर्न प्रमाणित गर्नुहोस्",
      passwordTab: "पासवर्ड",
      pinTab: "पिन",
      bioTab: "बायोमेट्रिक",
      idLabel: "मोबाइल नम्बर वा इमेल आईडी",
      idPlaceholder: "तपाईंको नम्बर वा इमेल प्रविष्ट गर्नुहोस्",
      passLabel: "पासवर्ड",
      pinLabel: "सुरक्षा पिन",
      pinHint: "तपाईंको ४-अङ्कको पिन कोड प्रविष्ट गर्नुहोस्",
      bioHint: "छिटो पहुँचको लागि बायोमेट्रिक्स प्रयोग गर्नुहोस्",
      fingerprint: "फिंगरप्रिन्ट",
      facelock: "फेस लक",
      loginBtn: "लगइन",
      guestBtn: "अतिथिको रूपमा जारी राख्नुहोस्",
      forgotPass: "पासवर्ड बिर्सनुभयो?",
      appTitle: "ज्योतिष शास्त्र",
      appSubtitle: "तपाईंको भाग्य र ग्रहहरूको स्थितिको रहस्यहरू पत्ता लगाउनुहोस्।",
      dobLabel: "जन्म मिति",
      tobLabel: "जन्म समय",
      nameLabel: "तपाईंको नाम",
      namePlaceholder: "यहाँ आफ्नो नाम लेख्नुहोस्",
      calculateBtn: "राशिफल हेर्नुहोस्",
      yourRashi: "तपाईंको राशि",
      yourNakshatra: "तपाईंको नक्षत्र",
      interpretationTitle: "तपाईंको भाग्य विश्लेषण",
      copyBtn: "प्रतिलिपि गर्नुहोस्",
      copiedBtn: "प्रतिलिपि गरियो",
      loadingInterpretation: "तपाईंको ग्रहहरूको स्थिति विश्लेषण गरिँदैछ...",
      footer: "© २०२६ ज्योतिष शास्त्र - ब्रह्माण्ड अन्तर्दृष्टि",
      tagline: "ब्रह्माण्ड अन्तर्दृष्टि",
      card1Title: "सटीक गणना",
      card1Desc: "आधुनिक खगोल विज्ञान र वैदिक शास्त्रहरूको संयोजन।",
      card2Title: "व्यक्तिगत विश्लेषण",
      card2Desc: "तपाईंको जन्म समयको आधारमा सिर्जना गरिएको विशेष रिपोर्टहरू।",
      card3Title: "गोपनीयता",
      card3Desc: "तपाईंको डाटा पूर्ण रूपमा सुरक्षित छ र तपाईंको लागि मात्र हो।",
      calculationDetails: "गणना विधि: लाहिरी अयनांश",
      siderealMethod: "निरयण (Sidereal) विधि",
      birthChart: "जन्म कुण्डली चक्र",
      locationError: "स्थान फेला परेन। कृपया म्यानुअल रूपमा प्रविष्ट गर्नुहोस्।",
      somethingWrong: "केही गलत भयो। कृपया फेरि प्रयास गर्नुहोस्।",
      required: "आवश्यक छ",
      currentLocation: "तपाईंको वर्तमान स्थान",
      currentDasha: "वर्तमान दशा",
      endsOn: "समाप्त हुने मिति",
      remaining: "बाँकी समय",
      currentTimeLabel: "वर्तमान समय",
      bengaliDate: "बंगाली मिति",
      dayOfWeek: "बार",
      history: "इतिहास",
      recentCalculations: "हालैका गणनाहरू",
      noHistory: "अझै कुनै इतिहास छैन",
      clearHistory: "इतिहास मेटाउनुहोस्",
      chatTitle: "एआई ज्योतिषी च्याट",
      chatPlaceholder: "केहि सोध्नुहोस्...",
      chatSend: "पठाउनुहोस्",
      chatWelcome: "नमस्ते! म तपाईंको ज्योतिष सम्बन्धी कुनै पनि प्रश्नको उत्तर दिन सक्छु। तपाईं आफ्नो राशिफल वा अन्य कुनै कुराको बारेमा सोध्न सक्नुहुन्छ।",
      dailyHoroscope: "आजको राशिफल",
      effectsAndRemedies: "प्रभाव र उपाय",
      doshaAnalysis: "दशा/दोष विश्लेषण",
      close: "बन्द गर्नुहोस्",
      selectSign: "आफ्नो राशि छान्नुहोस्",
      clearChat: "च्याट खाली गर्नुहोस्"
    },
    or: {
      loginTitle: "ସୁରକ୍ଷିତ ପ୍ରବେଶ",
      loginSubtitle: "ଆପଣଙ୍କ ଜ୍ୟୋତିଷ ପ୍ରୋଫାଇଲ୍ ପ୍ରବେଶ କରିବାକୁ ଯାଞ୍ଚ କରନ୍ତୁ",
      passwordTab: "ପାସୱାର୍ଡ",
      pinTab: "ପିନ୍",
      bioTab: "ବାୟୋମେଟ୍ରିକ୍",
      idLabel: "ମୋବାଇଲ୍ ନମ୍ବର କିମ୍ବା ଇମେଲ୍ ଆଇଡି",
      idPlaceholder: "ଆପଣଙ୍କ ନମ୍ବର କିମ୍ବା ଇମେଲ୍ ପ୍ରବେଶ କରନ୍ତୁ",
      passLabel: "ପାସୱାର୍ଡ",
      pinLabel: "ସୁରକ୍ଷା ପିନ୍",
      pinHint: "ଆପଣଙ୍କ ୪-ଅଙ୍କ ବିଶିଷ୍ଟ ପିନ୍ କୋଡ୍ ପ୍ରବେଶ କରନ୍ତୁ",
      bioHint: "ଶୀଘ୍ର ପ୍ରବେଶ ପାଇଁ ବାୟୋମେଟ୍ରିକ୍ସ ବ୍ୟବହାର କରନ୍ତୁ",
      fingerprint: "ଫିଙ୍ଗରପ୍ରିଣ୍ଟ",
      facelock: "ଫେସ୍ ଲକ୍",
      loginBtn: "ଲଗଇନ୍",
      guestBtn: "ଅତିଥି ଭାବରେ ଜାରି ରଖନ୍ତୁ",
      forgotPass: "ପାସୱାର୍ଡ ଭୁଲିଗଲେ କି?",
      appTitle: "ଜ୍ୟୋତିଷ ଶାସ୍ତ୍ର",
      appSubtitle: "ଆପଣଙ୍କ ଭାଗ୍ୟ ଏବଂ ଗ୍ରହମାନଙ୍କର ସ୍ଥିତିର ରହସ୍ୟ ଉନ୍ମୋଚନ କରନ୍ତୁ |",
      dobLabel: "ଜନ୍ମ ତାରିଖ",
      tobLabel: "ଜନ୍ମ ସମୟ",
      nameLabel: "ଆପଣଙ୍କ ନାମ",
      namePlaceholder: "ଏଠାରେ ଆପଣଙ୍କ ନାମ ଲେଖନ୍ତୁ",
      calculateBtn: "ରାଶିଫଳ ଦେଖନ୍ତୁ",
      yourRashi: "ଆପଣଙ୍କ ରାଶି",
      yourNakshatra: "ଆପଣଙ୍କ ନକ୍ଷତ୍ର",
      interpretationTitle: "ଆପଣଙ୍କ ଭାଗ୍ୟ ବିଶ୍ଳେଷଣ",
      copyBtn: "କପି କରନ୍ତୁ",
      copiedBtn: "କପି ହୋଇଗଲା",
      loadingInterpretation: "ଆପଣଙ୍କ ଗ୍ରହମାନଙ୍କର ସ୍ଥିତି ବିଶ୍ଳେଷଣ କରାଯାଉଛି ...",
      footer: "© ୨୦୨୬ ଜ୍ୟୋତିଷ ଶାସ୍ତ୍ର - ମହାଜାଗତିକ ଅନ୍ତର୍ଦୃଷ୍ଟି",
      tagline: "ମହାଜାଗତିକ ଅନ୍ତର୍ଦୃଷ୍ଟି",
      card1Title: "ସଠିକ୍ ଗଣନା",
      card1Desc: "ଆଧୁନିକ ଜ୍ୟୋତିର୍ବିଜ୍ଞାନ ଏବଂ ବୈଦିକ ଶାସ୍ତ୍ରର ମିଶ୍ରଣ |",
      card2Title: "ବ୍ୟକ୍ତିଗତ ବିଶ୍ଳେଷଣ",
      card2Desc: "ଆପଣଙ୍କ ଜନ୍ମ ସମୟ ଉପରେ ଆଧାର କରି ସୃଷ୍ଟି ହୋଇଥିବା ବିଶେଷ ରିପୋର୍ଟ |",
      card3Title: "ଗୋପନୀୟତା",
      card3Desc: "ଆପଣଙ୍କର ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ ଏବଂ କେବଳ ଆପଣଙ୍କ ପାଇଁ |",
      calculationDetails: "ଗଣନା ପଦ୍ଧତି: ଲାହିରି ଅୟନାଂଶ",
      siderealMethod: "ନିରୟଣ (Sidereal) ପଦ୍ଧତି",
      birthChart: "ଜନ୍ମ କୁଣ୍ଡଳୀ ଚକ୍ର",
      locationError: "ସ୍ଥାନ ମିଳିଲା ନାହିଁ | ଦୟାକରି ମାନୁଆଲ୍ ପ୍ରବେଶ କରନ୍ତୁ |",
      somethingWrong: "କିଛି ଭୁଲ୍ ହୋଇଗଲା | ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ |",
      required: "ଆବଶ୍ୟକ",
      currentLocation: "ଆପଣଙ୍କର ବର୍ତ୍ତମାନର ସ୍ଥାନ",
      currentDasha: "ବର୍ତ୍ତମାନର ଦଶା",
      endsOn: "ଶେଷ ହେବ",
      remaining: "ବାକି ସମୟ",
      currentTimeLabel: "ବର୍ତ୍ତମାନ ସମୟ",
      bengaliDate: "ବଙ୍ଗାଳୀ ତାରିଖ",
      dayOfWeek: "ବାର",
      history: "ଇତିହାସ",
      recentCalculations: "ସାମ୍ପ୍ରତିକ ଗଣନା",
      noHistory: "କୌଣସି ଇତିହାସ ନାହିଁ",
      clearHistory: "ଇତିହାସ ସଫା କରନ୍ତୁ",
      chatTitle: "ଏଆଇ ଜ୍ୟୋତିଷ ଚାଟ୍",
      chatPlaceholder: "ଯେକୌଣସି ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ ...",
      chatSend: "ପଠାନ୍ତୁ",
      chatWelcome: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ଜ୍ୟୋତିଷ ସମ୍ବନ୍ଧୀୟ ଯେକୌଣସି ପ୍ରଶ୍ନର ଉତ୍ତର ଦେଇପାରିବି | ଆପଣ ଆପଣଙ୍କର ରାଶିଫଳ କିମ୍ବା ଅନ୍ୟ କିଛି ବିଷୟରେ ପଚାରିପାରିବେ |",
      dailyHoroscope: "ଆଜିର ରାଶିଫଳ",
      effectsAndRemedies: "ପ୍ରଭାବ ଏବଂ ପ୍ରତିକାର",
      doshaAnalysis: "ଦଶା/ଦୋଷ ବିଶ୍ଳେଷଣ",
      close: "ବନ୍ଦ କରନ୍ତୁ",
      selectSign: "ଆପଣଙ୍କର ରାଶି ବାଛନ୍ତୁ",
      clearChat: "ଚାଟ୍ ସଫା କରନ୍ତୁ"
    }
  };

  const t = (key: keyof typeof translations['bn']) => {
    return translations[language || 'bn'][key];
  };

  const renderLocalized = (obj: any) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj[language || 'bn'] || obj.en || '';
  };

  const fetchDailyHoroscope = async (sign: string) => {
    setSelectedSign(sign);
    setIsDailyHoroscopeLoading(true);
    setDailyHoroscopeText('');
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write a daily horoscope for the zodiac sign ${sign} for today. Provide general predictions, lucky color, and lucky number. Language: ${language || 'bn'}.`,
      });
      setDailyHoroscopeText(response.text || '');
    } catch (err) {
      console.error(err);
      setDailyHoroscopeText(t('somethingWrong'));
    } finally {
      setIsDailyHoroscopeLoading(false);
    }
  };

  const fetchDoshaDetails = async (planetEn: string, planetLocalized: string, remainingTime: string) => {
    setSelectedDoshaPlanet(planetLocalized);
    setShowDoshaDetails(true);
    setIsDoshaLoading(true);
    setDoshaDetailsText('');
    try {
      const langMap = { bn: 'Bengali', en: 'English', hi: 'Hindi', ne: 'Nepali', or: 'Odia', mr: 'Marathi', gu: 'Gujarati' };
      const targetLang = langMap[language || 'bn'];

      const prompt = `
        As an expert Vedic Astrologer, provide a detailed analysis for the current planetary period (Vimshottari Dasha) of ${planetEn} (also known as ${planetLocalized}).
        The user is currently under this influence, and it will continue for another ${remainingTime}.
        
        User Details:
        Name: ${userName}
        Birth Date: ${dob}
        Birth Time: ${tob}
        
        Planetary Context:
        ${result?.planets.map((p: any) => `${p.name.en}: ${p.sign.en}`).join(', ')}

        Please provide a comprehensive report in ${targetLang} covering:
        1. Typical Effects & Symptoms: What changes in mindset, health, career, and relationships are expected?
        2. Astrological Reasons: Why does ${planetEn} behave this way in their chart?
        3. Mitigation & Remedies (Practical): Daily habits, behaviors, or lifestyle changes.
        4. Mitigation & Remedies (Astrological): Mantras, gemstones (with caution), or specific prayers/rituals.

        IMPORTANT: Write the entire response in ${targetLang}. Use Markdown for clear structure and readability. Use headings and bullet points.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setDoshaDetailsText(response.text || '');
    } catch (err) {
      console.error(err);
      setDoshaDetailsText(t('somethingWrong'));
    } finally {
      setIsDoshaLoading(false);
    }
  };

  const calculateHoroscope = async () => {
    if (!dob || !tob) {
      setError(t('dobLabel') + ' ' + t('required'));
      return;
    }

    setLoading(true);
    setError(null);
    setInterpretation('');

    try {
      const astroData = calculateAstrology({
        date: dob,
        time: tob,
        lat: location.lat,
        lon: location.lon
      });

      setResult(astroData);

      const langMap = { bn: 'Bengali', en: 'English', hi: 'Hindi', ne: 'Nepali', or: 'Odia', mr: 'Marathi', gu: 'Gujarati' };
      const targetLang = langMap[language || 'bn'];

      const now = currentTime;
      const currentDasha = astroData.dasha?.find((d: any) => now >= new Date(d.start) && now <= new Date(d.end));

      // Get Gemini Interpretation
      const bDate = getBengaliDate(dob);
      const dayName = getDayName(dob);
      const bDateStr = bDate ? `${bDate.day} ${bDate.month.en}, ${bDate.year}` : "Unknown";

      const prompt = `
        You are an expert Vedic Astrologer. 
        IMPORTANT: You MUST write the entire response in ${targetLang}. DO NOT use English unless it is a technical term that has no equivalent in ${targetLang}.
        
        Provide a detailed horoscope interpretation in ${targetLang} for a person named ${userName} born on ${dob} (Bengali Date: ${bDateStr}, Day: ${dayName}) at ${tob}.
        The calculated planetary positions (Sidereal/Vedic) are:
        ${astroData.planets.map((p: any) => `${p.name.en}: ${p.sign.en} sign`).join(', ')}.
        
        The current planetary period (Vimshottari Dasha) is: ${currentDasha ? currentDasha.planet : 'Unknown'}.
        
        Please include these sections with headings in ${targetLang}:
        1. General Personality (সামগ্রিক ব্যক্তিত্ব / General Personality) - mention the significance of the birth day (${dayName}) and the Bengali date if applicable.
        2. Career and Wealth (কর্মজীবন ও অর্থ / Career and Wealth)
        3. Health (স্বাস্থ্য / Health)
        4. Love and Relationships (প্রেম ও সম্পর্ক / Love and Relationships)
        5. Current Planetary Period Analysis (বর্তমান দশা বিশ্লেষণ / Current Dasha Analysis) - specifically interpret the effects of the ${currentDasha ? currentDasha.planet : 'current'} Dasha.
        6. A special advice for them (বিশেষ পরামর্শ / Special Advice)
        
        Keep the tone encouraging, mystical, and professional. Use beautiful, high-quality ${targetLang}.
        Format the output with clear Markdown headings.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInterpretation(response.text || t('loadingInterpretation'));

      // Save to history
      addToHistory({
        dob,
        tob,
        location,
        userName,
        moonRashi: astroData.moonRashi,
        moonNakshatra: astroData.moonNakshatra,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      setError(t('somethingWrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    // Simulate authentication
    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 1000);
  };

  const handleGuestLogin = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 800);
  };

  const handleBiometricLogin = () => {
    setAuthLoading(true);
    // Simulate biometric scan
    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className={cn(
        "min-h-screen font-sans flex items-center justify-center p-6 transition-colors duration-500",
        theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#f5f5f0] text-zinc-900"
      )}>
        {/* Language Selection Modal Overlay */}
        <AnimatePresence>
          {showLanguageModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className={cn(
                  "border rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl transition-all",
                  theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-black/5"
                )}
              >
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Languages className="text-emerald-500" />
                    Select Language
                  </h2>
                  <button 
                    onClick={() => setShowLanguageModal(false)}
                    className="p-2 rounded-full hover:bg-black/5 text-zinc-500 transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'bn', name: 'বাংলা', sub: 'Bengali' },
                    { id: 'en', name: 'English', sub: 'ইংরেজি' },
                    { id: 'hi', name: 'हिन्दी', sub: 'Hindi' },
                    { id: 'ne', name: 'नेपाली', sub: 'Nepali' },
                    { id: 'or', name: 'ଓଡ଼ିଆ', sub: 'Odia' },
                    { id: 'mr', name: 'मराठी', sub: 'Marathi' },
                    { id: 'gu', name: 'ગુજરાતી', sub: 'Gujarati' }
                  ].map((lang) => (
                    <button 
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id as any);
                        setShowLanguageModal(false);
                      }}
                      className={cn(
                        "p-4 rounded-2xl border transition-all text-left group",
                        language === lang.id 
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
                          : (theme === 'dark' ? "bg-black/40 border-white/5 hover:border-white/20 text-zinc-400" : "bg-zinc-100 border-black/5 hover:border-black/10 text-zinc-500")
                      )}
                    >
                      <div className="font-bold">{lang.name}</div>
                      <div className="text-[10px] uppercase tracking-wider opacity-50">{lang.sub}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Controls */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2.5 rounded-2xl border transition-all",
              theme === 'dark' 
                ? "bg-zinc-900/50 border-white/10 text-emerald-400 hover:bg-white/5" 
                : "bg-white border-black/5 text-emerald-600 hover:bg-black/5 shadow-sm"
            )}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setShowLanguageModal(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all",
              theme === 'dark'
                ? "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5"
                : "bg-white border-black/5 text-zinc-600 hover:bg-black/5 shadow-sm"
            )}
          >
            <Languages size={14} className="text-emerald-500" />
            {translations[language || 'bn'].tagline}
          </button>
        </div>

        {/* Background Atmosphere */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
            theme === 'dark' ? "bg-emerald-900/10" : "bg-emerald-500/5"
          )} />
          <div className={cn(
            "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
            theme === 'dark' ? "bg-indigo-900/10" : "bg-indigo-500/5"
          )} />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "w-full max-w-md backdrop-blur-2xl border rounded-[2.5rem] p-10 relative z-10 transition-all",
            theme === 'dark' ? "bg-zinc-900/50 border-white/10 shadow-2xl" : "bg-white border-black/5 shadow-xl"
          )}
        >
          <div className="text-center mb-10">
            <div className={cn(
              "inline-flex p-4 rounded-3xl border mb-6 transition-all",
              theme === 'dark' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-emerald-500/5 border-emerald-500/10"
            )}>
              <ShieldCheck className="text-emerald-500" size={32} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t('loginTitle')}</h1>
            <p className={cn("text-sm transition-colors", theme === 'dark' ? "text-zinc-500" : "text-zinc-400")}>{t('loginSubtitle')}</p>
          </div>

          {/* Tabs */}
          <div className={cn(
            "flex p-1 rounded-2xl mb-8 border transition-all",
            theme === 'dark' ? "bg-black/40 border-white/5" : "bg-zinc-100 border-black/5"
          )}>
            {[
              { id: 'password', label: t('passwordTab'), icon: Key },
              { id: 'pin', label: t('pinTab'), icon: Lock },
              { id: 'biometric', label: t('bioTab'), icon: Fingerprint }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setLoginMode(tab.id as any)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium transition-all",
                  loginMode === tab.id 
                    ? (theme === 'dark' ? "bg-emerald-500 text-black shadow-lg" : "bg-white text-emerald-600 shadow-sm")
                    : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence mode="wait">
              {loginMode === 'password' && (
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">{t('idLabel')}</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type="text"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder={t('idPlaceholder')}
                        className={cn(
                          "w-full rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                          theme === 'dark' ? "bg-black/50 border border-white/10 text-white" : "bg-zinc-100 border border-black/5 text-zinc-900"
                        )}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">{t('passLabel')}</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          "w-full rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                          theme === 'dark' ? "bg-black/50 border border-white/10 text-white" : "bg-zinc-100 border border-black/5 text-zinc-900"
                        )}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {loginMode === 'pin' && (
                <motion.div
                  key="pin"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 text-center block">{t('pinLabel')}</label>
                    <div className="flex justify-center gap-3 relative">
                      {[1, 2, 3, 4].map((i) => (
                        <div 
                          key={i}
                          className={cn(
                            "w-12 h-14 rounded-2xl border-2 flex items-center justify-center text-xl font-bold transition-all",
                            pin.length >= i 
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" 
                              : (theme === 'dark' ? "border-white/10 bg-black/50 text-zinc-700" : "border-black/5 bg-zinc-100 text-zinc-300")
                          )}
                        >
                          {pin.length >= i ? "•" : ""}
                        </div>
                      ))}
                      <input 
                        type="tel"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setPin(val);
                          if (val.length === 4) {
                            setTimeout(() => handleLogin(), 300);
                          }
                        }}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                        autoFocus
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 text-center uppercase tracking-widest">{t('pinHint')}</p>
                </motion.div>
              )}

              {loginMode === 'biometric' && (
                <motion.div
                  key="biometric"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="py-6 flex flex-col items-center gap-8"
                >
                  <div className="flex gap-6">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                       onClick={handleBiometricLogin}
                      className={cn(
                        "w-24 h-24 rounded-3xl border flex flex-col items-center justify-center gap-2 group transition-all",
                        theme === 'dark' ? "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-emerald-500/5 border-emerald-500/10 hover:bg-emerald-500/10 shadow-sm"
                      )}
                    >
                      <Fingerprint className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">{t('fingerprint')}</span>
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleBiometricLogin}
                      className={cn(
                        "w-24 h-24 rounded-3xl border flex flex-col items-center justify-center gap-2 group transition-all",
                        theme === 'dark' ? "bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20" : "bg-indigo-500/5 border-indigo-500/10 hover:bg-indigo-500/10 shadow-sm"
                      )}
                    >
                      <ScanFace className="text-indigo-500 group-hover:scale-110 transition-transform" size={32} />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500/70">{t('facelock')}</span>
                    </motion.button>
                  </div>
                  <p className="text-xs text-zinc-500 text-center font-medium">{t('bioHint')}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loginMode !== 'biometric' && (
              <button 
                type="submit"
                disabled={authLoading || (loginMode === 'pin' && pin.length < 4)}
                className={cn(
                  "w-full font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                  theme === 'dark'
                    ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl disabled:bg-emerald-900/50 disabled:text-emerald-500/30"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg disabled:bg-emerald-200"
                )}
              >
                {authLoading ? <Loader2 className="animate-spin" size={20} /> : t('loginBtn')}
              </button>
            )}
          </form>

          <div className={cn("mt-10 pt-6 border-t flex flex-col gap-4 items-center", theme === 'dark' ? "border-white/5" : "border-black/5")}>
            <button 
              type="button"
              onClick={handleGuestLogin}
              className="text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <Sparkles size={12} />
              {t('guestBtn')}
            </button>
            <button type="button" className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest hover:text-zinc-400 transition-colors">{t('forgotPass')}</button>
          </div>
        </motion.div>
      </div>
    );
  }

  const copyToClipboard = () => {
    if (!interpretation) return;
    navigator.clipboard.writeText(interpretation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = async () => {
    if (!interpretationRef.current) return;
    const canvas = await html2canvas(interpretationRef.current, {
      backgroundColor: theme === 'dark' ? '#050505' : '#f5f5f0',
      scale: 2,
      onclone: (clonedDoc) => {
        const element = clonedDoc.querySelector('[data-pdf-content]') as HTMLElement;
        if (element) {
          element.style.backgroundColor = theme === 'dark' ? '#050505' : '#f5f5f0';
          element.style.color = theme === 'dark' ? '#ffffff' : '#18181b';
          const allElements = element.querySelectorAll('*');
          allElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            htmlEl.style.backdropFilter = 'none';
          });
        }
      }
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Horoscope_${dob}.pdf`);
  };

  const downloadWord = () => {
    if (!interpretation) return;
    const bDate = getBengaliDate(dob);
    const dayName = getDayName(dob);
    const bDateStr = bDate ? (language === 'bn' ? `${bDate.day} ${bDate.month.bn}, ${bDate.year}` : `${bDate.day} ${bDate.month.en}, ${bDate.year}`) : "";

    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Horoscope</title></head><body>";
    const footer = "</body></html>";
    
    const birthInfo = `
      <div style='text-align: center; margin-bottom: 20px;'>
        <h1>${t('appTitle')}</h1>
        <p><strong>${t('nameLabel')}:</strong> ${userName}</p>
        <p><strong>${t('dobLabel')}:</strong> ${dob}</p>
        <p><strong>${t('tobLabel')}:</strong> ${tob}</p>
        <p><strong>${t('bengaliDate')}:</strong> ${bDateStr}</p>
        <p><strong>${t('dayOfWeek')}:</strong> ${dayName}</p>
        <hr>
      </div>
    `;

    const sourceHTML = header + birthInfo + interpretation.replace(/\n/g, '<br>') + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Horoscope_${dob}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  if (!language) {
    return (
      <div className={cn(
        "min-h-screen font-sans flex items-center justify-center p-6 overflow-hidden transition-colors duration-500",
        theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#f5f5f0] text-zinc-900"
      )}>
        {/* Background Atmosphere */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute top-[-10%] left-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000",
            theme === 'dark' ? "bg-emerald-900/10" : "bg-emerald-500/5"
          )} />
          <div className={cn(
            "absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] blur-[120px] rounded-full transition-colors duration-1000",
            theme === 'dark' ? "bg-indigo-900/10" : "bg-indigo-500/5"
          )} />
        </div>

        {/* Theme Toggle in Selection Screen */}
        <div className="absolute top-6 right-6 z-20">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              theme === 'dark' 
                ? "bg-zinc-900/50 border-white/10 text-emerald-400 hover:bg-white/5" 
                : "bg-white border-black/5 text-emerald-600 hover:bg-black/5 shadow-sm"
            )}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className={cn(
            "inline-flex p-5 rounded-[2.5rem] border mb-8 transition-all",
            theme === 'dark' 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : "bg-emerald-500/5 border-emerald-500/10"
          )}>
            <Globe className="text-emerald-500" size={48} />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {theme === 'dark' ? 'ভাষা নির্বাচন করুন' : 'Select Language'}
          </h1>
          <p className={cn(
            "mb-12 transition-colors",
            theme === 'dark' ? "text-zinc-500" : "text-zinc-600"
          )}>
            {theme === 'dark' ? 'Select your preferred language to continue' : 'আপনার পছন্দসই ভাষা নির্বাচন করুন'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'bn', name: 'বাংলা', sub: 'Bengali' },
              { id: 'en', name: 'English', sub: 'ইংরেজি' },
              { id: 'hi', name: 'हिन्दी', sub: 'Hindi' },
              { id: 'mr', name: 'मराठी', sub: 'Marathi' },
              { id: 'gu', name: 'ગુજરાતી', sub: 'Gujarati' },
              { id: 'ne', name: 'नेपाली', sub: 'Nepali' },
              { id: 'or', name: 'ଓଡ଼ିଆ', sub: 'Odia' }
            ].map((lang) => (
              <button 
                key={lang.id}
                onClick={() => setLanguage(lang.id as any)}
                className={cn(
                  "group relative overflow-hidden border p-5 rounded-3xl flex items-center justify-between transition-all",
                  theme === 'dark' 
                    ? "bg-zinc-900/50 border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/5" 
                    : "bg-white border-black/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 shadow-sm"
                )}
              >
                <div className="text-left">
                  <div className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-zinc-900")}>{lang.name}</div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{lang.sub}</div>
                </div>
                <ChevronRight className={cn(
                  "group-hover:text-emerald-500 group-hover:translate-x-1 transition-all",
                  theme === 'dark' ? "text-zinc-600" : "text-zinc-400"
                )} size={18} />
              </button>
            ))}
          </div>
          
          <div className={cn(
            "mt-12 text-[10px] uppercase tracking-widest transition-colors",
            theme === 'dark' ? "text-zinc-600" : "text-zinc-400"
          )}>
            Cosmic Insights • মহাজাগতিক অন্তর্দৃষ্টি
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-emerald-500/30 transition-colors duration-500",
      theme === 'dark' ? "bg-[#050505] text-white" : "bg-[#f5f5f0] text-zinc-900"
    )}>
      {/* Language Selection Modal Overlay */}
      <AnimatePresence>
        {showLanguageModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Languages className="text-emerald-400" />
                  Select Language
                </h2>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors"
                >
                  <RefreshCw size={20} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'bn', name: 'বাংলা', sub: 'Bengali' },
                  { id: 'en', name: 'English', sub: 'ইংরেজি' },
                  { id: 'hi', name: 'हिन्दी', sub: 'Hindi' },
                  { id: 'mr', name: 'मराठी', sub: 'Marathi' },
                  { id: 'gu', name: 'ગુજરાતી', sub: 'Gujarati' },
                  { id: 'ne', name: 'नेपाली', sub: 'Nepali' },
                  { id: 'or', name: 'ଓଡ଼ିଆ', sub: 'Odia' }
                ].map((lang) => (
                  <button 
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id as any);
                      setShowLanguageModal(false);
                    }}
                    className={cn(
                      "p-4 rounded-2xl border transition-all text-left group",
                      language === lang.id 
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400" 
                        : "bg-black/40 border-white/5 hover:border-white/20 text-zinc-400"
                    )}
                  >
                    <div className="font-bold">{lang.name}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-50">{lang.sub}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Horoscope Modal */}
      <AnimatePresence>
        {showDailyHoroscope && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "border rounded-[2.5rem] p-8 max-w-3xl w-full shadow-2xl my-8",
                theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-black/10"
              )}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Star className="text-amber-500" />
                  {t('dailyHoroscope')}
                </h2>
                <button 
                  onClick={() => setShowDailyHoroscope(false)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    theme === 'dark' ? "hover:bg-white/5 text-zinc-500" : "hover:bg-black/5 text-zinc-500"
                  )}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className={cn("text-sm font-medium mb-4", theme === 'dark' ? "text-zinc-400" : "text-zinc-600")}>
                  {t('selectSign')}
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {Object.entries(SIGNS_BN).map(([enName, bnName]) => {
                    const localizedName = language === 'bn' ? bnName : 
                                          language === 'hi' ? (SIGNS_BN as any)[enName] : // Assuming similar for now or use english
                                          enName; // Fallback to english for simplicity if not fully mapped
                    // Actually, we can use renderLocalized if we had a full map, but let's just use the english name for the API and display localized if available.
                    // For now, let's just use a simple map or English names for the buttons if we don't have full translations for all signs in all languages.
                    // Let's use the English name as the key, and display the Bengali name if language is 'bn', else English.
                    const displayName = language === 'bn' ? bnName : enName;
                    
                    return (
                      <button
                        key={enName}
                        onClick={() => fetchDailyHoroscope(enName)}
                        className={cn(
                          "p-3 rounded-xl border text-xs font-medium transition-all text-center",
                          selectedSign === enName
                            ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                            : theme === 'dark'
                              ? "bg-white/5 border-white/10 text-zinc-400 hover:border-amber-500/50"
                              : "bg-black/5 border-black/5 text-zinc-600 hover:border-amber-500/50"
                        )}
                      >
                        {displayName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedSign && (
                <div className={cn(
                  "p-6 rounded-2xl border",
                  theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
                )}>
                  {isDailyHoroscopeLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 text-amber-500">
                      <Loader2 size={32} className="animate-spin mb-4" />
                      <p className="text-sm font-medium animate-pulse">Loading...</p>
                    </div>
                  ) : (
                    <div className={cn("prose prose-sm max-w-none", theme === 'dark' ? "prose-invert" : "prose-zinc")}>
                      <Markdown>{dailyHoroscopeText}</Markdown>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {result && result.moonRashi && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 z-0"
            >
              <img 
                src={`https://picsum.photos/seed/${result.moonRashi.en.toLowerCase()}/1920/1080?blur=4`}
                alt="Zodiac Background"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className={cn(
                "absolute inset-0",
                theme === 'dark' 
                  ? "bg-gradient-to-b from-[#050505] via-transparent to-[#050505]" 
                  : "bg-gradient-to-b from-[#f5f5f0] via-transparent to-[#f5f5f0]"
              )} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cn(
          "absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
          theme === 'dark' ? "bg-emerald-900/20" : "bg-emerald-500/10"
        )} />
        <div className={cn(
          "absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full transition-colors duration-1000",
          theme === 'dark' ? "bg-indigo-900/20" : "bg-indigo-500/10"
        )} />
        <div className={cn(
          "absolute inset-0 opacity-20 transition-opacity duration-1000",
          theme === 'dark' ? "bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" : "bg-[url('https://www.transparenttextures.com/patterns/white-diamond.png')]"
        )} />
      </div>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {/* Top Controls */}
        <div className="absolute top-6 right-6 z-20 flex items-center gap-3">
          <button 
            onClick={() => setShowDailyHoroscope(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all",
              theme === 'dark'
                ? "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5"
                : "bg-white border-black/5 text-zinc-600 hover:bg-black/5 shadow-sm"
            )}
          >
            <Star size={14} className="text-amber-500" />
            <span className="hidden sm:inline">{t('dailyHoroscope')}</span>
          </button>
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-2.5 rounded-2xl border transition-all",
              theme === 'dark' 
                ? "bg-zinc-900/50 border-white/10 text-emerald-400 hover:bg-white/5" 
                : "bg-white border-black/5 text-emerald-600 hover:bg-black/5 shadow-sm"
            )}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button 
            onClick={() => setShowLanguageModal(true)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-medium transition-all",
              theme === 'dark'
                ? "bg-zinc-900/50 border-white/10 text-zinc-400 hover:bg-white/5"
                : "bg-white border-black/5 text-zinc-600 hover:bg-black/5 shadow-sm"
            )}
          >
            <Languages size={14} className="text-emerald-500" />
            {translations[language || 'bn'].tagline}
          </button>
        </div>

        {/* Header */}
        <header className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] mb-8 transition-all",
              theme === 'dark'
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
            )}
          >
            <Sparkles size={12} />
            {t('tagline')}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 flex justify-center"
          >
            <div className={cn(
              "p-4 rounded-[2rem] border transition-all",
              theme === 'dark'
                ? "bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border-white/10"
                : "bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border-black/5 shadow-lg"
            )}>
              <Compass size={48} className="text-emerald-500 animate-[spin_10s_linear_infinite]" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "text-5xl md:text-7xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent transition-all",
              theme === 'dark'
                ? "bg-gradient-to-b from-white to-white/50"
                : "bg-gradient-to-b from-zinc-900 to-zinc-500"
            )}
          >
            {t('appTitle')}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
              "inline-flex items-center gap-3 px-4 py-2 rounded-2xl border mb-6 transition-all",
              theme === 'dark' ? "bg-white/5 border-white/10 text-zinc-400" : "bg-black/5 border-black/5 text-zinc-600"
            )}
          >
            <Clock size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest">{t('currentTimeLabel')}:</span>
            <span className="text-sm font-mono font-bold text-emerald-500">
              {currentTime.toLocaleTimeString(language === 'bn' ? 'bn-BD' : language || 'en')}
            </span>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "text-lg max-w-xl mx-auto transition-colors",
              theme === 'dark' ? "text-zinc-400" : "text-zinc-600"
            )}
          >
            {t('appSubtitle')}
          </motion.p>
        </header>

        {/* Input Section */}
        <section className={cn(
          "backdrop-blur-xl border rounded-[2.5rem] p-10 mb-12 transition-all",
          theme === 'dark'
            ? "bg-zinc-900/50 border-white/10 shadow-2xl"
            : "bg-white border-black/5 shadow-xl"
        )}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div>
                <label className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 transition-colors",
                  theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                )}>
                  <User size={14} className="text-emerald-500" />
                  {t('nameLabel')}
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder={t('namePlaceholder')}
                    className={cn(
                      "w-full rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                      theme === 'dark'
                        ? "bg-black/50 border border-white/10 text-white"
                        : "bg-zinc-100 border border-black/5 text-zinc-900"
                    )}
                  />
                </div>
              </div>
              <div>
                <label className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 transition-colors",
                  theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                )}>
                  <Calendar size={14} className="text-emerald-500" />
                  {t('dobLabel')}
                </label>
                <input 
                  type="date" 
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                    theme === 'dark'
                      ? "bg-black/50 border border-white/10 text-white"
                      : "bg-zinc-100 border border-black/5 text-zinc-900"
                  )}
                />
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className={cn(
                  "flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-3 transition-colors",
                  theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                )}>
                  <Clock size={14} className="text-emerald-500" />
                  {t('tobLabel')}
                </label>
                <input 
                  type="time" 
                  value={tob}
                  onChange={(e) => setTob(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                    theme === 'dark'
                      ? "bg-black/50 border border-white/10 text-white"
                      : "bg-zinc-100 border border-black/5 text-zinc-900"
                  )}
                />
              </div>
              <div className="pt-7">
                <button 
                  onClick={calculateHoroscope}
                  disabled={loading}
                  className={cn(
                    "w-full font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98]",
                    theme === 'dark'
                      ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
                  )}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send size={20} />
                      {t('calculateBtn')}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-red-500 text-sm font-medium flex items-center gap-2 justify-center"
            >
              <Info size={16} />
              {error}
            </motion.p>
          )}
        </section>

        {/* History Section */}
        {history.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6 px-4">
              <div className="flex items-center gap-3">
                <History size={20} className="text-emerald-500" />
                <h2 className={cn("text-xl font-bold", theme === 'dark' ? "text-white" : "text-zinc-900")}>
                  {t('recentCalculations')}
                </h2>
              </div>
              <button 
                onClick={() => {
                  if (confirm('Are you sure you want to clear your history?')) {
                    setHistory([]);
                    localStorage.removeItem('astro_history');
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
              >
                {t('clearHistory')}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((item, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    setDob(item.dob);
                    setTob(item.tob);
                    setLocation(item.location);
                    setUserName(item.userName);
                    calculateHoroscope();
                  }}
                  className={cn(
                    "p-6 rounded-3xl border text-left transition-all group relative overflow-hidden",
                    theme === 'dark' 
                      ? "bg-zinc-900/40 border-white/5 hover:border-emerald-500/30" 
                      : "bg-white border-black/5 hover:border-emerald-500/20 shadow-sm"
                  )}
                >
                  <div className="relative z-10">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                      {new Date(item.timestamp).toLocaleDateString(language === 'bn' ? 'bn-BD' : language || 'en')}
                    </div>
                    <div className={cn("font-bold text-lg mb-1", theme === 'dark' ? "text-white" : "text-zinc-900")}>
                      {item.userName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="text-emerald-500 font-bold">{renderLocalized(item.moonRashi)}</span>
                      <span>•</span>
                      <span>{renderLocalized(item.moonNakshatra)}</span>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={16} className="text-emerald-500" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-16"
            >
              {/* Planetary Grid */}
              <div className={cn(
                "backdrop-blur-xl border rounded-[3rem] p-12 text-center transition-all",
                theme === 'dark'
                  ? "bg-zinc-900/50 border-white/10 shadow-2xl"
                  : "bg-white border-black/5 shadow-xl"
              )}>
                {/* Birth Details (Bengali Date & Day) */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-10">
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                    <Calendar size={16} className="text-emerald-500" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('bengaliDate')}</div>
                      <div className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-zinc-900")}>
                        {(() => {
                          const bDate = getBengaliDate(dob);
                          if (!bDate) return "";
                          return language === 'bn' 
                            ? `${bDate.day} ${bDate.month.bn}, ${bDate.year}`
                            : `${bDate.day} ${bDate.month.en}, ${bDate.year}`;
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                    <Clock size={16} className="text-indigo-500" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t('dayOfWeek')}</div>
                      <div className={cn("text-lg font-bold", theme === 'dark' ? "text-white" : "text-zinc-900")}>
                        {getDayName(dob)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-12">
                  <div className="space-y-2">
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{t('yourRashi')}</div>
                    <div className="text-4xl font-black text-emerald-500">
                      {renderLocalized(result.moonRashi)}
                    </div>
                  </div>
                  <div className={cn("w-px h-16 hidden md:block", theme === 'dark' ? "bg-white/10" : "bg-black/5")} />
                  <div className="space-y-2">
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">{t('yourNakshatra')}</div>
                    <div className="text-4xl font-black text-indigo-500">
                      {renderLocalized(result.moonNakshatra)}
                    </div>
                  </div>
                </div>

                {/* Dasha Information */}
                {result.dasha && (() => {
                  const now = currentTime;
                  const current = result.dasha.find((d: any) => now >= new Date(d.start) && now <= new Date(d.end));
                  if (!current) return null;
                  
                  const remainingDays = Math.ceil((new Date(current.end).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const remainingYears = Math.floor(remainingDays / 365.25);
                  const remainingMonths = Math.floor((remainingDays % 365.25) / 30.44);
                  const remainingDaysFinal = Math.floor(remainingDays % 30.44);

                  const planetNames = {
                    bn: PLANETS_BN[current.planet] || current.planet,
                    en: current.planet,
                    hi: PLANETS_HI[current.planet] || current.planet,
                    ne: PLANETS_NE[current.planet] || current.planet,
                    or: PLANETS_OR[current.planet] || current.planet,
                    mr: PLANETS_MR[current.planet] || current.planet,
                    gu: PLANETS_GU[current.planet] || current.planet
                  };

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "mb-12 p-8 border rounded-[2.5rem] inline-block mx-auto text-center transition-all",
                        theme === 'dark'
                          ? "bg-indigo-500/5 border-indigo-500/10"
                          : "bg-indigo-500/5 border-indigo-500/10 shadow-sm"
                      )}
                    >
                      <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">{t('currentDasha')}</div>
                      <div className="text-4xl font-black text-indigo-500 mb-4">
                        {renderLocalized(planetNames)}
                      </div>
                      <div className={cn(
                        "text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-4 mb-6",
                        theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                      )}>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-indigo-500" />
                          {t('endsOn')}: {new Date(current.end).toLocaleDateString(language === 'bn' ? 'bn-BD' : language || 'en')}
                        </span>
                        <span className={cn("w-1 h-1 rounded-full", theme === 'dark' ? "bg-white/10" : "bg-black/5")} />
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-indigo-500" />
                          {t('remaining')}: {remainingYears > 0 && `${remainingYears}y `}{remainingMonths > 0 && `${remainingMonths}m `}{remainingDaysFinal}d
                        </span>
                      </div>
                      
                      <button
                        onClick={() => fetchDoshaDetails(current.planet, renderLocalized(planetNames) as string, `${remainingYears > 0 ? remainingYears + ' years ' : ''}${remainingMonths > 0 ? remainingMonths + ' months ' : ''}${remainingDaysFinal} days`)}
                        className={cn(
                          "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 mx-auto",
                          theme === 'dark' 
                            ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20" 
                            : "bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100"
                        )}
                      >
                        <ShieldCheck size={14} />
                        {t('doshaAnalysis')}
                      </button>
                    </motion.div>
                  );
                })()}

                {/* Dosha Details Modal */}
                <AnimatePresence>
                  {showDoshaDetails && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 overflow-y-auto"
                    >
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={cn(
                          "border rounded-[2.5rem] p-8 max-w-2xl w-full shadow-2xl my-8 text-left",
                          theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-black/10"
                        )}
                      >
                        <div className="flex items-center justify-between mb-8">
                          <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ShieldCheck className="text-indigo-500" />
                            {t('doshaAnalysis')} {selectedDoshaPlanet && `(${selectedDoshaPlanet})`}
                          </h2>
                          <button 
                            onClick={() => setShowDoshaDetails(false)}
                            className={cn(
                              "p-2 rounded-full transition-colors",
                              theme === 'dark' ? "hover:bg-white/5 text-zinc-500" : "hover:bg-black/5 text-zinc-500"
                            )}
                          >
                            <X size={20} />
                          </button>
                        </div>
                        
                        <div className={cn(
                          "p-6 rounded-2xl border",
                          theme === 'dark' ? "bg-white/5 border-white/10" : "bg-black/5 border-black/5"
                        )}>
                          {isDoshaLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-indigo-500">
                              <Loader2 size={32} className="animate-spin mb-4" />
                              <p className="text-sm font-medium animate-pulse">Loading...</p>
                            </div>
                          ) : (
                            <div className={cn("prose prose-sm max-w-none", theme === 'dark' ? "prose-invert" : "prose-zinc")}>
                              <Markdown>{doshaDetailsText}</Markdown>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Birth Chart Visualization */}
                <div className="mb-16">
                  <BirthChart 
                    planets={result.planets} 
                    language={language || 'bn'} 
                    title={t('birthChart')}
                    theme={theme}
                    highlightPlanet={(() => {
                      const now = currentTime;
                      const current = result.dasha?.find((d: any) => now >= new Date(d.start) && now <= new Date(d.end));
                      return current?.planet;
                    })()}
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {(() => {
                    const now = currentTime;
                    const currentDashaPlanet = result.dasha?.find((d: any) => now >= new Date(d.start) && now <= new Date(d.end))?.planet;
                    
                    return result.planets.map((planet: any, idx: number) => {
                      const isCurrentDasha = planet.id === currentDashaPlanet;
                      return (
                        <motion.div
                          key={planet.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={cn(
                            "border rounded-3xl p-6 text-center transition-all group",
                            isCurrentDasha 
                              ? "border-indigo-500/50 bg-indigo-500/5 ring-1 ring-indigo-500/20" 
                              : (theme === 'dark' ? "bg-zinc-900/30 border-white/5 hover:border-emerald-500/30" : "bg-zinc-50 border-black/5 hover:border-emerald-500/30")
                          )}
                        >
                          <div className={cn(
                            "text-[10px] font-bold uppercase tracking-widest mb-2 transition-colors",
                            isCurrentDasha ? "text-indigo-500" : "text-zinc-500 group-hover:text-emerald-500"
                          )}>
                            {planet.id} {isCurrentDasha && "★"}
                          </div>
                          <div className={cn("text-2xl font-black mb-1", theme === 'dark' ? "text-white" : "text-zinc-900")}>
                            {renderLocalized(planet.name)}
                          </div>
                          <div className={cn(
                            "text-sm font-medium",
                            isCurrentDasha ? "text-indigo-400" : "text-emerald-400"
                          )}>
                            {renderLocalized(planet.sign)}
                          </div>
                          <div className="text-zinc-600 text-[10px] mt-2">
                            {Math.floor(planet.degree)}° {Math.floor((planet.degree % 1) * 60)}'
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Calculation Details */}
              <div className="text-center text-zinc-600 text-xs">
                {t('calculationDetails')} ({result.ayanamsa.toFixed(4)}°) • {t('siderealMethod')}
              </div>

              {/* Interpretation */}
              <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/10 flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-emerald-500/10 to-transparent gap-4">
                  <h2 className="text-2xl font-bold flex items-center gap-3">
                    <Star className="text-emerald-400" fill="currentColor" />
                    {t('interpretationTitle')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all text-zinc-400 hover:text-emerald-400 flex items-center gap-2 text-xs"
                      title="Copy to Clipboard"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? t('copiedBtn') : t('copyBtn')}
                    </button>
                    <button 
                      onClick={downloadPDF}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all text-zinc-400 hover:text-indigo-400 flex items-center gap-2 text-xs"
                      title="Download PDF"
                    >
                      <FileDown size={14} />
                      PDF
                    </button>
                    <button 
                      onClick={downloadWord}
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all text-zinc-400 hover:text-blue-400 flex items-center gap-2 text-xs"
                      title="Download Word"
                    >
                      <FileText size={14} />
                      Word
                    </button>
                  </div>
                </div>
                <div className="p-8" ref={interpretationRef} data-pdf-content>
                  {interpretation ? (
                    <div className="prose prose-invert prose-emerald max-w-none">
                      <Markdown>{interpretation}</Markdown>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                      <Loader2 className="animate-spin mb-4" size={32} />
                      <p>{t('loadingInterpretation')}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info */}
        {!result && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
          >
            {[
              { title: t('card1Title'), desc: t('card1Desc') },
              { title: t('card2Title'), desc: t('card2Desc') },
              { title: t('card3Title'), desc: t('card3Desc') }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/5">
                <h3 className="font-bold mb-2 text-emerald-400">{item.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </main>

      <footer className="relative z-10 py-12 text-center text-zinc-600 text-sm border-top border-white/5 mt-20">
        <p>{t('footer')}</p>
      </footer>

      {/* Floating AI Chat */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <AnimatePresence>
          {isChatOpen && (
              <motion.div
                drag
                dragListener={false}
                dragControls={dragControls}
                dragMomentum={false}
                onDragEnd={(e, info) => {
                  setChatPosition(prev => ({
                    x: prev.x + info.offset.x,
                    y: prev.y + info.offset.y
                  }));
                }}
                initial={{ opacity: 0, scale: 0.9, x: chatPosition.x, y: chatPosition.y + 20 }}
                animate={{ opacity: 1, scale: 1, x: chatPosition.x, y: chatPosition.y }}
                exit={{ opacity: 0, scale: 0.9, x: chatPosition.x, y: chatPosition.y + 20 }}
                className={cn(
                  "absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] border rounded-3xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl transition-all",
                  theme === 'dark' ? "bg-zinc-900 border-white/10" : "bg-white border-black/5"
                )}
              >
                {/* Chat Header */}
                <div 
                  onPointerDown={(e) => dragControls.start(e)}
                  className={cn(
                  "p-4 border-b flex items-center justify-between transition-all cursor-grab active:cursor-grabbing",
                  theme === 'dark' ? "border-white/10 bg-emerald-500/10" : "border-black/5 bg-emerald-500/5"
                )}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                      <Sparkles size={16} />
                    </div>
                    <div>
                      <h3 className={cn("text-sm font-bold", theme === 'dark' ? "text-white" : "text-zinc-900")}>{t('chatTitle')}</h3>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 relative">
                    {chatMessages.length > 0 && (
                      <div className="relative flex items-center mr-2">
                        <input
                          type="date"
                          value={chatDateFilter}
                          onChange={(e) => setChatDateFilter(e.target.value)}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={cn(
                            "text-xs px-2 py-1 rounded-md border outline-none transition-colors",
                            theme === 'dark' ? "bg-white/5 border-white/10 text-zinc-300" : "bg-zinc-100 border-black/10 text-zinc-700"
                          )}
                          title={language === 'bn' ? 'তারিখ অনুযায়ী ফিল্টার করুন' : 'Filter by date'}
                        />
                        {chatDateFilter && (
                          <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              setChatDateFilter('');
                            }}
                            className="absolute right-1 p-0.5 rounded-full bg-zinc-500/20 text-zinc-500 hover:text-zinc-700 hover:bg-zinc-500/40"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )}
                    {chatMessages.length > 0 && (
                      <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowClearConfirm(true);
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-full text-zinc-500 hover:text-red-500 transition-colors"
                        title={t('clearChat')}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <AnimatePresence>
                      {showClearConfirm && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={cn(
                            "absolute top-full right-0 mt-2 p-3 rounded-xl shadow-xl border w-48 z-50",
                            theme === 'dark' ? "bg-zinc-800 border-white/10" : "bg-white border-black/10"
                          )}
                        >
                          <p className={cn("text-xs mb-3 text-center", theme === 'dark' ? "text-zinc-300" : "text-zinc-600")}>
                            {language === 'bn' ? 'চ্যাট হিস্ট্রি মুছে ফেলবেন?' : 'Clear chat history?'}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowClearConfirm(false);
                              }}
                              className={cn(
                                "flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors",
                                theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-white" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                              )}
                            >
                              {language === 'bn' ? 'না' : 'No'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setChatMessages([]);
                                localStorage.removeItem('astro_chat_history');
                                setShowClearConfirm(false);
                              }}
                              className="flex-1 px-2 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                            >
                              {language === 'bn' ? 'হ্যাঁ' : 'Yes'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button 
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsChatOpen(false);
                      }}
                      className="p-2 hover:bg-black/5 rounded-full text-zinc-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-8 px-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all",
                        theme === 'dark' ? "bg-white/5 text-emerald-400" : "bg-zinc-100 text-emerald-600"
                      )}>
                        <MessageSquare size={24} />
                      </div>
                      <p className={cn("text-sm leading-relaxed transition-colors", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")}>
                        {t('chatWelcome')}
                      </p>
                    </div>
                  )}
                  {chatMessages.length > 0 && chatDateFilter && chatMessages.filter(msg => msg.timestamp && msg.timestamp.startsWith(chatDateFilter)).length === 0 && (
                    <div className="text-center py-8 px-4">
                      <p className={cn("text-sm leading-relaxed transition-colors", theme === 'dark' ? "text-zinc-400" : "text-zinc-500")}>
                        {language === 'bn' ? 'এই তারিখে কোনো চ্যাট পাওয়া যায়নি।' : 'No chats found for this date.'}
                      </p>
                    </div>
                  )}
                  {(chatDateFilter ? chatMessages.filter(msg => msg.timestamp && msg.timestamp.startsWith(chatDateFilter)) : chatMessages).map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-2xl text-sm transition-all relative group",
                        msg.role === 'user' 
                          ? "bg-emerald-500 text-black font-medium rounded-tr-none" 
                          : (theme === 'dark' ? "bg-white/5 border border-white/10 text-zinc-200 rounded-tl-none" : "bg-zinc-100 border border-black/5 text-zinc-800 rounded-tl-none")
                      )}>
                        <div className={cn("prose prose-sm max-w-none transition-all", theme === 'dark' ? "prose-invert" : "prose-zinc")}>
                          <Markdown>
                            {msg.text}
                          </Markdown>
                        </div>
                        {msg.timestamp && (
                          <span className={cn(
                            "text-[9px] absolute -bottom-4 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap",
                            msg.role === 'user' ? "right-0" : "left-0",
                            theme === 'dark' ? "text-zinc-500" : "text-zinc-400"
                          )}>
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="flex items-start mr-auto max-w-[85%]">
                      <div className={cn(
                        "p-3 rounded-2xl rounded-tl-none border transition-all",
                        theme === 'dark' ? "bg-white/5 border-white/10" : "bg-zinc-100 border-black/5"
                      )}>
                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className={cn(
                  "p-4 border-t transition-all",
                  theme === 'dark' ? "border-white/10 bg-black/20" : "border-black/5 bg-zinc-50"
                )}>
                  <form 
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="relative"
                  >
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t('chatPlaceholder')}
                      className={cn(
                        "w-full rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium",
                        theme === 'dark' ? "bg-white/5 border border-white/10 text-white" : "bg-white border border-black/10 text-zinc-900 shadow-sm"
                      )}
                    />
                    <button 
                      type="submit"
                      disabled={!chatInput.trim() || isChatLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg disabled:opacity-50 transition-all"
                    >
                      <SendHorizontal size={18} />
                    </button>
                  </form>
                </div>
              </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
            isChatOpen ? "bg-zinc-800 text-white" : "bg-emerald-500 text-black"
          )}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </motion.button>

        {/* Custom Alert */}
        <AnimatePresence>
          {alertMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 50, scale: 0.9, x: '-50%' }}
              className="fixed bottom-24 left-1/2 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 w-[90vw] max-w-md bg-zinc-900 text-white border border-white/10"
            >
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle size={18} />
              </div>
              <p className="text-sm font-medium leading-relaxed flex-1">{alertMessage}</p>
              <button 
                onClick={() => setAlertMessage(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
