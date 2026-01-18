import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GamePhase, Scenario, Suspect, Clue, ChatMessage, GameMode, Difficulty, AutoDetectiveAction, Language } from './types';
import * as GeminiService from './services/geminiService';
import { RetroButton } from './components/RetroButton';
import { PixelCard } from './components/PixelCard';
import { TypewriterText } from './components/TypewriterText';
import { soundManager } from './utils/SoundManager';
import { Search, MessageSquare, AlertTriangle, Play, RefreshCw, Archive, Clock, Skull, FileText, Bot, User, ShieldAlert, MonitorPlay, Brain, Fingerprint, Globe, MapPin, Sword, Volume2, VolumeX } from 'lucide-react';

// Translations Dictionary
const t = {
  [Language.ENGLISH]: {
    title: "PIXEL NOIR",
    start: "START INVESTIGATION",
    mode: "GAME MODE",
    diff: "DIFFICULTY",
    lang: "LANGUAGE",
    detective: "DETECTIVE",
    victim: "VICTIM (SPECTATOR)",
    killer: "KILLER (EVADE)",
    detectiveDesc: "You solve the mystery.",
    victimDesc: "Watch the AI Detective solve your murder.",
    killerDesc: "You ARE the killer. Evade the AI Detective.",
    loading: "Consulting the Archives...",
    summoning: "Summoning AI Detective...",
    creating: "Creating Case...",
    visualizing: "Visualizing Crime Scene...",
    identifying: "Identifying Suspects...",
    error: "Connection Failed. Retrying...",
    shiftProgress: "Shift Progress",
    minsRemain: "mins remain",
    crimeScene: "Crime Scene",
    victimReport: "VICTIM REPORT",
    yourDeath: "YOUR DEATH",
    notebook: "Detective's Notebook",
    aiDeductions: "AI Deductions",
    suspects: "Case Board",
    evidenceLocker: "Evidence Locker",
    inspect: "Inspect Scene",
    interrogating: "Interrogating",
    leave: "Leave Interrogation",
    charge: "CHARGE WITH MURDER",
    caseClosed: "CASE FILE CLOSED",
    success: "SUCCESS",
    failure: "FAILURE",
    timeout: "OUT OF TIME",
    successMsg: "The city sleeps safer tonight.",
    successMsgVictim: "The detective avenged you.",
    successMsgKiller: "You got away with murder. The perfect crime.",
    failMsg: "The trail went cold.",
    failMsgKiller: "The Detective caught you! Justice is served.",
    report: "Investigator's Report",
    newCase: "New Case",
    aiThinking: "AI Logic Stream:",
    executing: "Executing",
    logicProcess: "AI LOGIC PROCESS",
    target: "TARGET",
    deductionStream: "Final Deduction Stream:",
    reveal: "REVEAL VERDICT",
    fileEvidence: "File Evidence",
    labReport: "LAB REPORT:",
    visualNote: "Visual Note:",
    initialScan: "Initial Scan:",
    noClues: "No clues collected yet...",
    analyzed: "Analyzed",
    unknown: "Unknown",
    unidentified: "Unidentified Object",
    thinking: "Thinking...",
    youAreKiller: "YOU ARE THE KILLER",
    yourSecret: "YOUR SECRET",
    evadeMsg: "Don't get caught.",
    talked: "TALKED",
    you: "YOU"
  },
  [Language.ARABIC]: {
    title: "بكسل نوار",
    start: "ابدأ التحقيق",
    mode: "طريقة اللعب",
    diff: "الصعوبة",
    lang: "اللغة",
    detective: "محقق",
    victim: "ضحية (مشاهد)",
    killer: "قاتل (هروب)",
    detectiveDesc: "أنت تحل اللغز.",
    victimDesc: "شاهد الذكاء الاصطناعي يحل جريمة قتلك.",
    killerDesc: "أنت القاتل. تجنب المحقق الآلي.",
    loading: "جاري مراجعة الأرشيف...",
    summoning: "استدعاء المحقق الآلي...",
    creating: "جاري إنشاء القضية...",
    visualizing: "تخيل مسرح الجريمة...",
    identifying: "تحديد المشتبه بهم...",
    error: "فشل الاتصال. إعادة المحاولة...",
    shiftProgress: "تقدم الوردية",
    minsRemain: "دقيقة متبقية",
    crimeScene: "مسرح الجريمة",
    victimReport: "تقرير الضحية",
    yourDeath: "وفاتك",
    notebook: "مفكرة المحقق",
    aiDeductions: "استنتاجات الذكاء الاصطناعي",
    suspects: "لوحة القضية",
    evidenceLocker: "خزانة الأدلة",
    inspect: "فحص الموقع",
    interrogating: "استجواب",
    leave: "مغادرة الاستجواب",
    charge: "اتهام بالقتل",
    caseClosed: "أغلقت القضية",
    success: "نجاح",
    failure: "فشل",
    timeout: "انتهى الوقت",
    successMsg: "المدينة تنام بأمان الليلة.",
    successMsgVictim: "المحقق انتقم لك.",
    successMsgKiller: "لقد نجوت بجريمة القتل. الجريمة الكاملة.",
    failMsg: "فقدنا الأثر.",
    failMsgKiller: "المحقق قبض عليك! تحققت العدالة.",
    report: "تقرير المحقق",
    newCase: "قضية جديدة",
    aiThinking: "تيار منطق الذكاء الاصطناعي:",
    executing: "تنفيذ",
    logicProcess: "عملية منطق الذكاء الاصطناعي",
    target: "الهدف",
    deductionStream: "تيار الاستنتاج النهائي:",
    reveal: "كشف الحكم",
    fileEvidence: "حفظ الدليل",
    labReport: "تقرير المختبر:",
    visualNote: "ملاحظة بصرية:",
    initialScan: "المسح الأولي:",
    noClues: "لم يتم جمع أدلة بعد...",
    analyzed: "تم التحليل",
    unknown: "مجهول",
    unidentified: "جسم غير محدد",
    thinking: "يفكر...",
    youAreKiller: "أنت القاتل",
    yourSecret: "سرك",
    evadeMsg: "لا تدعهم يمسكون بك.",
    talked: "تم استجوابه",
    you: "أنت"
  },
  [Language.DUTCH]: {
    title: "PIXEL NOIR",
    start: "START ONDERZOEK",
    mode: "SPELMODUS",
    diff: "MOEILIJKHEID",
    lang: "TAAL",
    detective: "DETECTIVE",
    victim: "SLACHTOFFER (TOESCHOUWER)",
    killer: "MOORDENAAR (ONTSNAP)",
    detectiveDesc: "Jij lost het mysterie op.",
    victimDesc: "Kijk hoe de AI Detective jouw moord oplost.",
    killerDesc: "Jij BENT de moordenaar. Ontwijk de AI Detective.",
    loading: "Archieven raadplegen...",
    summoning: "AI Detective oproepen...",
    creating: "Zaak aanmaken...",
    visualizing: "Plaats delict visualiseren...",
    identifying: "Verdachten identificeren...",
    error: "Verbinding mislukt. Opnieuw proberen...",
    shiftProgress: "Dienst Voortgang",
    minsRemain: "minuten over",
    crimeScene: "Plaats Delict",
    victimReport: "SLACHTOFFER RAPPORT",
    yourDeath: "JOUW DOOD",
    notebook: "Notitieboekje",
    aiDeductions: "AI Deducties",
    suspects: "Recherchebord",
    evidenceLocker: "Bewijskamer",
    inspect: "Inspecteer Locatie",
    interrogating: "Ondervraging",
    leave: "Verlaat Ondervraging",
    charge: "AANKLAGEN VOOR MOORD",
    caseClosed: "ZAAK GESLOTEN",
    success: "SUCCES",
    failure: "FALEN",
    timeout: "TIJD OP",
    successMsg: "De stad slaapt veiliger vannacht.",
    successMsgVictim: "De detective heeft je gewroken.",
    successMsgKiller: "Je bent weggekomen met moord. De perfecte misdaad.",
    failMsg: "Het spoor liep dood.",
    failMsgKiller: "De Detective heeft je gepakt! Gerechtigheid is geschied.",
    report: "Rapport van Onderzoeker",
    newCase: "Nieuwe Zaak",
    aiThinking: "AI Logica Stroom:",
    executing: "Uitvoeren",
    logicProcess: "AI LOGICA PROCES",
    target: "DOELWIT",
    deductionStream: "Eindconclusie Stroom:",
    reveal: "ONTHUL VONNIS",
    fileEvidence: "Bewijs Opslaan",
    labReport: "LAB RAPPORT:",
    visualNote: "Visuele Notitie:",
    initialScan: "Eerste Scan:",
    noClues: "Nog geen aanwijzingen verzameld...",
    analyzed: "Geanalyseerd",
    unknown: "Onbekend",
    unidentified: "Ongeïdentificeerd Object",
    thinking: "Denken...",
    youAreKiller: "JIJ BENT DE MOORDENAAR",
    yourSecret: "JOUW GEHEIM",
    evadeMsg: "Laat je niet pakken.",
    talked: "GESPROKEN",
    you: "JIJ"
  }
};

const App: React.FC = () => {
  // Settings
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.DETECTIVE);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.NORMAL);
  const [language, setLanguage] = useState<Language>(Language.ENGLISH);
  const [isMuted, setIsMuted] = useState(false);

  // Core State
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  
  // Gameplay State
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [maxTime, setMaxTime] = useState(480);
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect | null>(null);
  const [playerSuspectId, setPlayerSuspectId] = useState<string | null>(null); // For Killer Mode
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>("");
  const [discoveredClues, setDiscoveredClues] = useState<Set<string>>(new Set());
  const [interrogatedSuspects, setInterrogatedSuspects] = useState<Set<string>>(new Set());
  const [clueDetail, setClueDetail] = useState<Clue | null>(null);
  const [accuseError, setAccuseError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Auto-Detective State
  const [autoLogs, setAutoLogs] = useState<{text: string, type: 'thought'|'action'}[]>([]);
  const [aiAccusation, setAiAccusation] = useState<{ suspect: Suspect, thought: string } | null>(null);
  const autoLoopRef = useRef<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize Sound on Mount/Interaction
  useEffect(() => {
      // Browsers require interaction, so we rely on buttons calling init(),
      // but we update music based on phase
      if (phase === GamePhase.MENU) soundManager.setMusicPhase('MENU');
      else if (phase === GamePhase.PLAYING) soundManager.setMusicPhase('INVESTIGATION');
      else if (phase === GamePhase.INTERROGATING) soundManager.setMusicPhase('INTERROGATION');
      else if (phase === GamePhase.SOLVED) soundManager.setMusicPhase('CONCLUSION_WIN');
      else if (phase === GamePhase.FAILED || phase === GamePhase.TIMEOUT) soundManager.setMusicPhase('CONCLUSION_LOSS');
  }, [phase]);

  // Handle Mute Toggle
  const toggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
        soundManager.init(); // Try to resume if just unmuted
    }
  };

  // Effect to handle RTL and Font for Arabic
  useEffect(() => {
    if (language === Language.ARABIC) {
      document.body.classList.add('lang-arabic');
      document.body.dir = "rtl";
    } else {
      document.body.classList.remove('lang-arabic');
      document.body.dir = "ltr";
    }
  }, [language]);

  // Time Limit based on difficulty
  const getTimeLimit = (diff: Difficulty) => {
    switch(diff) {
      case Difficulty.EASY: return 720; // 12h
      case Difficulty.NORMAL: return 480; // 8h
      case Difficulty.HARD: return 360; // 6h
      default: return 480;
    }
  };

  // Helper: Format time
  const formatGameTime = (startStr: string = "09:00", minutesAdded: number) => {
    const [h, m] = startStr.split(':').map(Number);
    const totalMins = h * 60 + m + minutesAdded;
    const newH = Math.floor(totalMins / 60) % 24;
    const newM = totalMins % 60;
    const ampm = newH >= 12 ? 'PM' : 'AM';
    const displayH = newH > 12 ? newH - 12 : newH === 0 ? 12 : newH;
    return `${displayH}:${newM.toString().padStart(2, '0')} ${ampm}`;
  };

  const advanceTime = (minutes: number) => {
    const newTime = elapsedMinutes + minutes;
    if (newTime >= maxTime) {
      setElapsedMinutes(maxTime);
      setPhase(GamePhase.TIMEOUT);
    } else {
      setElapsedMinutes(newTime);
    }
  };

  // Start a new game
  const handleStartGame = useCallback(async () => {
    soundManager.init(); // Initialize audio context on start button click
    soundManager.playSFX('START');

    setPhase(GamePhase.LOADING);
    const txt = t[language];
    setLoadingMessage(gameMode === GameMode.DETECTIVE ? txt.loading : txt.summoning);
    setMaxTime(getTimeLimit(difficulty));
    
    try {
      // 1. Generate Scenario
      setLoadingMessage(`${txt.creating} (${difficulty})`);
      const newScenario = await GeminiService.generateMysteryScenario(difficulty, language);
      
      // Setup Player Identity for Killer Mode
      if (gameMode === GameMode.KILLER) {
          const killer = newScenario.suspects.find(s => s.isKiller);
          if (killer) {
            setPlayerSuspectId(killer.id);
          }
      } else {
        setPlayerSuspectId(null);
      }

      // 2. Generate Scene Image
      setLoadingMessage(txt.visualizing);
      const sceneImage = await GeminiService.generatePixelArt(
        `Wide angle shot, crime scene, ${newScenario.location}, ${newScenario.locationVisualDescription}. Dark, moody, noir atmosphere.`
      );
      newScenario.sceneImageUrl = sceneImage;

      // 3. Generate Suspect Portraits
      setLoadingMessage(txt.identifying);
      const suspectPromises = newScenario.suspects.map(async (s) => {
        const portrait = await GeminiService.generatePixelArt(
          `Close up pixel art portrait of a ${s.role}, ${s.visualDescription}. Expressive face, noir style.`
        );
        s.portraitUrl = portrait;
        return s;
      });
      await Promise.all(suspectPromises);

      setScenario(newScenario);
      setPhase(GamePhase.PLAYING);
      setDiscoveredClues(new Set());
      setInterrogatedSuspects(new Set());
      setChatHistory([]);
      setElapsedMinutes(0);
      setAutoLogs([]);
      setAiAccusation(null);

    } catch (error) {
      console.error(error);
      setLoadingMessage(t[language].error);
      soundManager.playSFX('FAIL');
      setTimeout(() => setPhase(GamePhase.MENU), 3000);
    }
  }, [difficulty, gameMode, language]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [autoLogs, phase]);

  // --- AUTO DETECTIVE LOGIC (VICTIM & KILLER MODE) ---
  useEffect(() => {
    // Only run if AI is Detective (Victim or Killer mode) and actively Playing
    if ((gameMode !== GameMode.VICTIM && gameMode !== GameMode.KILLER) || phase !== GamePhase.PLAYING || !scenario) return;
    
    // Simple state machine loop
    const runAutoStep = async () => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            // Delay for pacing
            await new Promise(r => setTimeout(r, 2000));
            
            const lastLog = autoLogs.length > 0 ? autoLogs[autoLogs.length - 1].text : "Start investigation.";
            const action = await GeminiService.getAutoDetectiveAction(
                scenario, 
                Array.from(discoveredClues), 
                Array.from(interrogatedSuspects),
                lastLog,
                language,
                chatHistory // Pass history so AI knows context of previous interrogations
            );

            // Log Thought
            setAutoLogs(prev => [...prev, { text: action.thought, type: 'thought' }]);
            await new Promise(r => setTimeout(r, 1500));

            // Execute Action
            if (action.type === 'INSPECT' && action.targetId) {
                const clue = scenario.clues.find(c => c.id === action.targetId);
                if (clue) {
                    setDiscoveredClues(prev => new Set(prev).add(clue.id));
                    setClueDetail(clue);
                    soundManager.playSFX('SUCCESS'); // Found clue sound
                    advanceTime(clue.analysisTimeCost);
                    setAutoLogs(prev => [...prev, { text: `${t[language].analyzed} ${clue.name}. ${clue.detail}`, type: 'action' }]);
                    // Wait then close modal automatically
                    await new Promise(r => setTimeout(r, 4000));
                    setClueDetail(null);
                }
            } else if (action.type === 'INTERROGATE' && action.targetId) {
                // Check if target is PLAYER (Killer Mode)
                if (gameMode === GameMode.KILLER && action.targetId === playerSuspectId) {
                     const suspect = scenario.suspects.find(s => s.id === action.targetId);
                     if (suspect) {
                        setInterrogatedSuspects(prev => new Set(prev).add(suspect.id));
                        setSelectedSuspect(suspect);
                        soundManager.playSFX('ALERT'); // Alert sound for player interaction
                        setPhase(GamePhase.INTERROGATING);
                        
                        // AI asks player a question
                        const question = action.question || "Where were you?";
                        setChatHistory(prev => [...prev, { sender: 'Detective', text: question }]);
                        setAutoLogs(prev => [...prev, { text: `Detective asks YOU: "${question}"`, type: 'action' }]);
                        
                        // Stop processing, wait for player input
                        setIsProcessing(false);
                        return; 
                     }
                }

                // Standard NPC Interrogation (Victim/Killer mode observing NPC)
                const suspect = scenario.suspects.find(s => s.id === action.targetId);
                if (suspect) {
                    setInterrogatedSuspects(prev => new Set(prev).add(suspect.id));
                    setSelectedSuspect(suspect);
                    setPhase(GamePhase.INTERROGATING);
                    setChatHistory([]);
                    
                    const question = action.question || "Where were you?";
                    setAutoLogs(prev => [...prev, { text: `${suspect.name}: "${question}"`, type: 'action' }]);
                    
                    const newHistory: ChatMessage[] = [{ sender: 'Detective', text: question }];
                    setChatHistory(newHistory);
                    
                    const foundClueNames = scenario.clues
                        .filter(c => discoveredClues.has(c.id))
                        .map(c => c.name);
                        
                    const response = await GeminiService.interrogateSuspect(scenario, suspect, newHistory, question, foundClueNames, language);
                    setChatHistory(prev => [...prev, { sender: 'Suspect', text: response }]);
                    advanceTime(15);

                    // Wait and exit
                    await new Promise(r => setTimeout(r, 5000));
                    setPhase(GamePhase.PLAYING);
                    setSelectedSuspect(null);
                }
            } else if (action.type === 'ACCUSE' && action.targetId) {
                const suspect = scenario.suspects.find(s => s.id === action.targetId);
                if (suspect) {
                    setAiAccusation({ suspect, thought: action.thought });
                    setPhase(GamePhase.DEDUCING);
                }
            }

        } catch (e) {
            console.error("Auto Detective Error", e);
        } finally {
            // If we returned early (Player Interrogation), isProcessing is already false.
            // If we didn't, we need to set it false to allow next tick.
            if (phase === GamePhase.PLAYING) {
               setIsProcessing(false);
            }
        }
    };

    if (!isProcessing) {
        // @ts-ignore
        autoLoopRef.current = setTimeout(runAutoStep, 1000);
    }
    
    return () => {
        if (autoLoopRef.current) clearTimeout(autoLoopRef.current);
    };
  }, [gameMode, phase, isProcessing, scenario, discoveredClues, interrogatedSuspects, autoLogs, language, chatHistory, playerSuspectId]);


  // --- PLAYER ACTIONS ---

  const handleInspectClue = (clue: Clue) => {
    // Disable manual inspection in AI modes
    if (gameMode !== GameMode.DETECTIVE) return; 
    
    if (phase !== GamePhase.PLAYING) return;
    
    if (discoveredClues.has(clue.id)) {
        setClueDetail(clue);
    } else {
        soundManager.playSFX('SUCCESS');
        advanceTime(clue.analysisTimeCost);
        setDiscoveredClues(prev => new Set(prev).add(clue.id));
        setClueDetail(clue);
    }
  };

  const handleOpenInterrogation = (suspect: Suspect) => {
    if (gameMode !== GameMode.DETECTIVE) return; // AI controls this in other modes
    if (phase !== GamePhase.PLAYING) return;
    advanceTime(15);
    setInterrogatedSuspects(prev => new Set(prev).add(suspect.id));
    setSelectedSuspect(suspect);
    setChatHistory([{ sender: 'System', text: `You corner ${suspect.name} for questioning. Time is ticking.` }]);
    setPhase(GamePhase.INTERROGATING);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedSuspect || !scenario) return;
    
    const userMsg = chatInput;
    setChatInput("");
    
    // KILLER MODE: Player responding to AI Detective
    if (gameMode === GameMode.KILLER) {
        const newHistory = [...chatHistory, { sender: 'Suspect', text: userMsg } as ChatMessage]; // Player IS the Suspect
        setChatHistory(newHistory);
        // Hand control back to AI logic immediately
        setPhase(GamePhase.PLAYING);
        advanceTime(10);
        setIsProcessing(false); // Ensure loop restarts
        return;
    }

    // DETECTIVE MODE: Player asking Suspect
    setIsProcessing(true);
    advanceTime(10); 
    
    const newHistory = [...chatHistory, { sender: 'Detective', text: userMsg } as ChatMessage];
    setChatHistory(newHistory);

    const foundClueNames = scenario.clues.filter(c => discoveredClues.has(c.id)).map(c => c.name);

    try {
      const response = await GeminiService.interrogateSuspect(scenario, selectedSuspect, newHistory, userMsg, foundClueNames, language);
      setChatHistory([...newHistory, { sender: 'Suspect', text: response }]);
    } catch (e) {
      setChatHistory([...newHistory, { sender: 'System', text: "The suspect stays silent..." }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccuse = (suspect: Suspect) => {
    if (!scenario) return;
    
    // Logic for Detective Mode (Player Accusing)
    if (gameMode === GameMode.DETECTIVE) {
        if (suspect.isKiller) {
            setPhase(GamePhase.SOLVED);
            soundManager.playSFX('SUCCESS');
        } else {
            setPhase(GamePhase.FAILED);
            soundManager.playSFX('FAIL');
            setAccuseError(`You arrested ${suspect.name}. But ${scenario.victimName}'s true killer watched from the shadows.`);
        }
    } 
    // Logic for AI Accusing (Victim/Killer Mode)
    else {
        // If Killer Mode, and AI accuses Killer (You) -> SOLVED = You Caught (Bad)
        // If Killer Mode, and AI accuses Incorrect -> FAILED = You Escaped (Good)
        if (suspect.isKiller) {
             setPhase(GamePhase.SOLVED);
             soundManager.playSFX(gameMode === GameMode.KILLER ? 'FAIL' : 'SUCCESS');
        } else {
             setPhase(GamePhase.FAILED);
             soundManager.playSFX(gameMode === GameMode.KILLER ? 'SUCCESS' : 'FAIL');
        }
    }
  };

  // --- RENDER ---
  const txt = t[language];

  return (
    <div className={gameMode === GameMode.VICTIM 
      ? "min-h-screen bg-slate-950 text-slate-200 p-4 flex flex-col gap-4 max-w-[1600px] mx-auto grayscale-[0.3] contrast-125 relative"
      : gameMode === GameMode.KILLER
      ? "min-h-screen bg-red-950 text-red-100 p-4 flex flex-col gap-4 max-w-[1600px] mx-auto relative border-l-8 border-r-8 border-red-900"
      : "min-h-screen bg-slate-950 text-slate-200 p-4 flex flex-col gap-4 max-w-[1600px] mx-auto"
    }>
      
      {/* Sound Toggle */}
      <button 
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 p-2 bg-slate-800 border-2 border-slate-600 rounded-full text-slate-400 hover:text-white hover:border-white transition-colors"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Menu Phase */}
      {phase === GamePhase.MENU && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-4 z-40 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black"></div>
        
        <h1 className="text-5xl md:text-8xl mb-4 text-center text-purple-500 font-pixel-header drop-shadow-[4px_4px_0_rgba(0,0,0,1)] animate-pulse">
          {txt.title}
        </h1>
        
        <div className="bg-slate-800 border-4 border-slate-600 p-8 max-w-4xl w-full flex flex-col gap-6 shadow-2xl z-10">
            {/* Settings UI... */}
            <div className="flex justify-center gap-2 mb-2">
                 {Object.values(Language).map((lang) => (
                     <button
                         key={lang}
                         onClick={() => { setLanguage(lang); soundManager.playSFX('CLICK'); }}
                         className={`px-3 py-1 text-sm border-2 font-bold uppercase transition-all ${language === lang ? 'border-blue-400 bg-blue-900/50 text-white' : 'border-slate-600 text-slate-500 hover:border-slate-400'}`}
                     >
                         {lang}
                     </button>
                 ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* MODE SELECT */}
                <div>
                   <h3 className="text-xl text-yellow-400 font-pixel-header mb-4 flex items-center gap-2"><MonitorPlay size={20}/> {txt.mode}</h3>
                   <div className="flex flex-col gap-2">
                       <button onClick={() => { setGameMode(GameMode.DETECTIVE); soundManager.playSFX('CLICK'); }} className={`p-4 border-2 text-start transition-all ${gameMode === GameMode.DETECTIVE ? 'border-green-500 bg-green-900/20 text-green-100' : 'border-slate-600 hover:border-slate-400 text-slate-400'}`}>
                           <div className="font-bold flex items-center gap-2"><User size={16}/> {txt.detective}</div>
                           <div className="text-sm opacity-70">{txt.detectiveDesc}</div>
                       </button>
                       <button onClick={() => { setGameMode(GameMode.VICTIM); soundManager.playSFX('CLICK'); }} className={`p-4 border-2 text-start transition-all ${gameMode === GameMode.VICTIM ? 'border-purple-500 bg-purple-900/20 text-purple-100' : 'border-slate-600 hover:border-slate-400 text-slate-400'}`}>
                           <div className="font-bold flex items-center gap-2"><Bot size={16}/> {txt.victim}</div>
                           <div className="text-sm opacity-70">{txt.victimDesc}</div>
                       </button>
                       <button onClick={() => { setGameMode(GameMode.KILLER); soundManager.playSFX('CLICK'); }} className={`p-4 border-2 text-start transition-all ${gameMode === GameMode.KILLER ? 'border-red-500 bg-red-900/20 text-red-100' : 'border-slate-600 hover:border-slate-400 text-slate-400'}`}>
                           <div className="font-bold flex items-center gap-2"><Sword size={16}/> {txt.killer}</div>
                           <div className="text-sm opacity-70">{txt.killerDesc}</div>
                       </button>
                   </div>
                </div>

                {/* DIFFICULTY SELECT */}
                <div>
                   <h3 className="text-xl text-red-400 font-pixel-header mb-4 flex items-center gap-2"><ShieldAlert size={20}/> {txt.diff}</h3>
                   <div className="flex flex-col gap-2">
                       {Object.values(Difficulty).map((diff) => (
                           <button key={diff} onClick={() => { setDifficulty(diff); soundManager.playSFX('CLICK'); }} className={`p-3 border-2 text-center transition-all font-mono uppercase font-bold ${difficulty === diff ? 'border-red-500 bg-red-900/20 text-red-100' : 'border-slate-600 hover:border-slate-400 text-slate-500'}`}>{diff}</button>
                       ))}
                   </div>
                </div>
            </div>
            
            <RetroButton onClick={handleStartGame} className="w-full py-4 text-xl mt-4">
              <span className="flex items-center justify-center gap-3"><Play size={24} /> {txt.start}</span>
            </RetroButton>
        </div>
      </div>
      )}

      {/* Loading Phase */}
      {phase === GamePhase.LOADING && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-purple-400 p-4 font-mono">
          <div className="w-64 h-64 border-4 border-purple-800 bg-black flex items-center justify-center mb-6 relative overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.2)]">
              <div className="absolute inset-0 bg-purple-900/20 animate-pulse"></div>
              <RefreshCw className="w-24 h-24 animate-spin" />
          </div>
          <div className="text-2xl uppercase tracking-widest animate-pulse">{loadingMessage}</div>
        </div>
      )}
  
      {/* Ghost Overlay */}
      {gameMode === GameMode.VICTIM && <div className="fixed inset-0 pointer-events-none z-0 bg-blue-900/5 mix-blend-overlay"></div>}
      
      {/* Header Info */}
      {scenario && (
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-800 pb-4 bg-slate-900/50 p-4 rounded-lg z-10">
        <div>
          <div className="flex items-center gap-3">
             <h2 className="text-3xl md:text-4xl text-purple-400 font-bold uppercase font-pixel-header mb-2">{scenario.title}</h2>
             {gameMode === GameMode.VICTIM && <span className="bg-purple-600 text-white text-xs px-2 py-1 uppercase font-bold rounded animate-pulse">Spectating</span>}
             {gameMode === GameMode.KILLER && <span className="bg-red-600 text-white text-xs px-2 py-1 uppercase font-bold rounded animate-pulse">EVADING</span>}
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono">
             <span className="flex items-center gap-2"><Clock size={16}/> {formatGameTime(scenario.startingTime, elapsedMinutes)}</span>
             <span className="text-slate-600">|</span>
             <span>{scenario.location}</span>
          </div>
        </div>
        
        {/* Time Bar */}
        <div className="w-full md:w-1/3 mt-4 md:mt-0">
            <div className="flex justify-between text-xs uppercase font-bold mb-1 text-red-400">
                <span>{txt.shiftProgress} ({difficulty})</span>
                <span>{maxTime - elapsedMinutes} {txt.minsRemain}</span>
            </div>
            <div className="h-6 w-full bg-slate-800 border-2 border-slate-600 relative">
                <div 
                    className={`h-full transition-all duration-500 ${Math.max(0, 100 - (elapsedMinutes / maxTime) * 100) < 20 ? 'bg-red-600 animate-pulse' : 'bg-green-600'}`} 
                    style={{ width: `${Math.max(0, 100 - (elapsedMinutes / maxTime) * 100)}%` }}
                ></div>
            </div>
        </div>
      </header>
      )}
      
      {/* AI THOUGHT STREAM */}
      {(gameMode === GameMode.VICTIM || gameMode === GameMode.KILLER) && autoLogs.length > 0 && phase !== GamePhase.SOLVED && phase !== GamePhase.FAILED && phase !== GamePhase.TIMEOUT && (
        <div className="z-20 bg-slate-900 border-2 border-purple-500 p-3 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center gap-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-purple-900/10 animate-pulse pointer-events-none"></div>
            <Brain className="text-purple-400 shrink-0" size={24} />
            <div className="font-mono text-purple-200 text-sm md:text-base flex-grow">
                <span className="font-bold ltr:mr-2 rtl:ml-2 text-purple-400 uppercase tracking-widest">{txt.aiThinking}</span>
                {autoLogs[autoLogs.length - 1].type === 'thought' ? (
                    <span className="italic text-slate-300">"{autoLogs[autoLogs.length - 1].text}"</span>
                ) : (
                    <span className="text-white font-bold">► {txt.executing}: {autoLogs[autoLogs.length - 1].text}</span>
                )}
            </div>
            {isProcessing && <RefreshCw size={16} className="animate-spin text-purple-500 shrink-0" />}
        </div>
      )}

      {/* Main Game Grid */}
      {scenario && phase !== GamePhase.MENU && phase !== GamePhase.LOADING && (
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 flex-grow z-10">
        
        {/* Left Col: Visuals */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          <PixelCard title={txt.crimeScene} className="aspect-video xl:aspect-square flex items-center justify-center bg-black p-0 overflow-hidden">
             {scenario.sceneImageUrl ? (
               <img src={scenario.sceneImageUrl} alt="Crime Scene" className="w-full h-full object-cover" style={{imageRendering: 'pixelated'}} />
             ) : (
               <div className="text-slate-600">No Image Data</div>
             )}
          </PixelCard>
          
          {/* KILLER IDENTITY CARD */}
          {gameMode === GameMode.KILLER && playerSuspectId && (
               <PixelCard title={txt.youAreKiller} className="bg-red-900/20 border-red-500 animate-pulse">
                   <div className="flex flex-col gap-2">
                       <div className="text-center font-bold text-red-400 text-lg">
                           {scenario.suspects.find(s => s.id === playerSuspectId)?.name}
                       </div>
                       <div className="text-xs text-red-200 font-mono">
                           <span className="font-bold">{txt.yourSecret}: </span>
                           {scenario.suspects.find(s => s.id === playerSuspectId)?.secret}
                       </div>
                       <div className="text-center text-xs bg-red-950 p-1 mt-2 text-red-500 font-bold uppercase">
                           {txt.evadeMsg}
                       </div>
                   </div>
               </PixelCard>
          )}

          <PixelCard title={gameMode === GameMode.VICTIM ? txt.yourDeath : txt.victimReport} className="bg-red-900/10 border-red-900/50">
             <div className="flex items-start gap-4">
                <Skull className="text-red-500 w-12 h-12 flex-shrink-0" />
                <div>
                    <div className="text-lg font-bold text-red-400">{scenario.victimName}</div>
                    <div className="text-sm text-slate-400 leading-tight mt-1">{scenario.causeOfDeath}</div>
                </div>
             </div>
          </PixelCard>
          
           {/* Log/Notebook */}
           <PixelCard title={gameMode !== GameMode.DETECTIVE ? txt.aiDeductions : txt.notebook} className="flex-grow bg-yellow-900/5 border-yellow-700/30">
              <div className="space-y-2 text-sm font-mono text-yellow-100/80 max-h-[300px] overflow-y-auto scrollbar-thin">
                 {gameMode !== GameMode.DETECTIVE ? (
                     // AI Log
                     <>
                        {autoLogs.map((log, i) => (
                             <div key={i} className={`pb-2 border-b border-yellow-800/20 ${log.type === 'thought' ? 'italic text-slate-400' : 'text-yellow-300 font-bold'}`}>
                                 {log.type === 'thought' ? '💭 ' : '► '}
                                 {log.text}
                             </div>
                        ))}
                        <div ref={logsEndRef} />
                     </>
                 ) : (
                     // Player Log
                     <>
                        {discoveredClues.size === 0 && <span className="italic opacity-50">{txt.noClues}</span>}
                        {Array.from(discoveredClues).map(id => {
                            const c = scenario.clues.find(cl => cl.id === id);
                            return c ? (
                                <div key={id} className="flex items-start gap-2 border-b border-yellow-800/30 pb-1">
                                    <span className="text-yellow-500">•</span>
                                    <span>{c.name}</span>
                                </div>
                            ) : null;
                        })}
                     </>
                 )}
              </div>
           </PixelCard>
        </div>

        {/* Middle Col: CASE BOARD */}
        <div className="xl:col-span-5 flex flex-col h-full relative" ref={boardRef}>
             <div className="absolute -top-3 left-4 z-10 bg-slate-900 px-2 border-2 border-yellow-600 text-yellow-500 uppercase font-bold tracking-widest shadow-md">
                {txt.suspects}
             </div>
             
             {/* Corkboard Background */}
             <div className="flex-grow bg-[#4a3b2a] border-8 border-[#2e2318] shadow-inner p-4 overflow-y-auto relative bg-[radial-gradient(#5c4a35_1px,transparent_1px)] [background-size:16px_16px]">
                
                <div className="flex flex-col gap-8 pb-8 min-h-full">
                    {/* Suspects Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {scenario.suspects.map((suspect, idx) => {
                        const isPlayer = gameMode === GameMode.KILLER && suspect.id === playerSuspectId;
                        const isInterrogated = interrogatedSuspects.has(suspect.id);

                        return (
                            <div 
                                key={suspect.id} 
                                className={`relative group transition-transform hover:scale-105 hover:z-20 ${gameMode === GameMode.DETECTIVE ? 'cursor-pointer' : 'cursor-default'} ${selectedSuspect?.id === suspect.id ? 'z-10 scale-105' : ''}`}
                                onClick={() => handleOpenInterrogation(suspect)}
                            >
                              {/* Pin */}
                              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full shadow-md z-20 bg-red-600 border border-black`}></div>
                              
                              {/* Photo Frame */}
                              <div className={`bg-white p-2 pb-8 shadow-[4px_4px_10px_rgba(0,0,0,0.5)] transform ${idx % 2 === 0 ? '-rotate-1' : 'rotate-2'} ${isPlayer ? 'ring-4 ring-red-500' : ''}`}>
                                 <div className={`aspect-square bg-slate-200 overflow-hidden relative grayscale contrast-125 brightness-90`}>
                                     {suspect.portraitUrl && (
                                       <img src={suspect.portraitUrl} alt={suspect.name} className="w-full h-full object-cover" style={{imageRendering: 'pixelated'}} />
                                     )}
                                     {isInterrogated && <div className="absolute inset-0 bg-yellow-500/20 mix-blend-multiply"></div>}
                                     {isPlayer && <div className="absolute inset-0 border-4 border-red-500 opacity-50"></div>}
                                 </div>
                                 <div className="mt-2 text-center">
                                     <div className="text-black font-bold font-mono text-xs uppercase leading-none">
                                         {isPlayer ? `${txt.you} (${suspect.name})` : suspect.name}
                                     </div>
                                     <div className="text-slate-500 font-mono text-[9px] uppercase">{suspect.role}</div>
                                 </div>
                              </div>
                              {/* Tags */}
                              {isInterrogated && (
                                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-red-500 bg-black/50 px-1 rounded whitespace-nowrap">
                                      {txt.talked}
                                  </div>
                              )}
                            </div>
                        );
                      })}
                    </div>
                    <div className="w-full border-t-2 border-dashed border-white/20 my-2"></div>
                    {/* Evidence Area */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-start content-start">
                        {discoveredClues.size === 0 && (
                            <div className="col-span-full text-center text-[#8c7458] font-mono italic p-4 border-2 border-dashed border-[#8c7458]/50">
                                {txt.noClues}
                            </div>
                        )}
                        {Array.from(discoveredClues).map((clueId, i) => {
                            const clue = scenario.clues.find(c => c.id === clueId);
                            if (!clue) return null;
                            const relatedSuspectIndex = clue.relatedSuspectId ? scenario.suspects.findIndex(s => s.id === clue.relatedSuspectId) : -1;
                            const colors = ["border-red-500", "border-blue-500", "border-green-500", "border-purple-500"];
                            const borderColor = relatedSuspectIndex >= 0 ? colors[relatedSuspectIndex % colors.length] : "border-transparent";

                            return (
                                <div 
                                    key={clue.id}
                                    className={`relative p-3 bg-yellow-200 shadow-[2px_4px_6px_rgba(0,0,0,0.3)] transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-2'} transition-transform hover:scale-110 hover:z-30 cursor-pointer`}
                                    onClick={() => handleInspectClue(clue)}
                                >
                                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-8 bg-yellow-400/50 -rotate-2"></div>
                                    <div className={`font-handwriting text-black text-xs font-bold leading-tight mb-1 ${relatedSuspectIndex >= 0 ? 'underline decoration-2 decoration-red-500' : ''}`}>
                                        {clue.name}
                                    </div>
                                    <div className="text-[9px] text-slate-800 leading-tight">
                                        {clue.description.substring(0, 40)}...
                                    </div>
                                    {relatedSuspectIndex >= 0 && (
                                         <div className={`absolute -right-1 -bottom-1 w-3 h-3 rounded-full border-2 border-white ${borderColor.replace('border', 'bg')}`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
        </div>

        {/* Right Col: Evidence & Chat */}
        <div className="xl:col-span-4 flex flex-col gap-6 h-full">
            
            {/* EVIDENCE PANEL */}
            {phase === GamePhase.PLAYING && (
               <PixelCard title={txt.evidenceLocker} className="flex-grow flex flex-col">
                 <div className="bg-black/30 p-4 border-2 border-slate-700 mb-4 font-mono text-green-300 text-sm h-48 overflow-y-auto scrollbar-thin">
                   <TypewriterText text={scenario.introduction} speed={5} />
                 </div>
                 
                 <h3 className="text-sm text-yellow-500 mb-2 uppercase font-bold flex items-center gap-2">
                     <Search size={16}/> {txt.inspect}
                 </h3>
                 <div className="grid grid-cols-1 gap-2 overflow-y-auto flex-grow ltr:pr-2 rtl:pl-2">
                     {scenario.clues.map(clue => {
                       const isFound = discoveredClues.has(clue.id);
                       return (
                         <button 
                           key={clue.id} 
                           onClick={() => handleInspectClue(clue)}
                           disabled={gameMode !== GameMode.DETECTIVE}
                           className={`p-3 border-l-4 text-start transition-all flex justify-between items-center group ${isFound ? 'border-green-500 bg-slate-800' : 'border-slate-600 bg-slate-900 hover:bg-slate-800'}`}
                         >
                           <div>
                               <div className={`font-bold ${isFound ? 'text-green-400' : 'text-slate-400'}`}>
                                   {isFound ? clue.name : txt.unidentified}
                               </div>
                               <div className="text-xs text-slate-500">
                                   {isFound ? txt.analyzed : txt.unknown}
                               </div>
                           </div>
                           {!isFound && <Search size={16} className="text-slate-600 group-hover:text-yellow-400" />}
                         </button>
                       );
                     })}
                 </div>
               </PixelCard>
            )}

            {/* INTERROGATION PANEL */}
            {phase === GamePhase.INTERROGATING && selectedSuspect && (
              <PixelCard title={`${txt.interrogating}: ${selectedSuspect.name}`} className="flex-grow flex flex-col h-[600px] border-yellow-600">
                <div className="flex-grow overflow-y-auto space-y-4 ltr:pr-2 rtl:pl-2 mb-4 bg-black/20 p-2 border border-slate-700">
                  {chatHistory.map((msg, idx) => {
                      // Styling logic...
                      let align = 'justify-start';
                      let bubbleStyle = 'border-slate-600 bg-slate-800 text-slate-400 italic text-xs';
                      if (gameMode === GameMode.DETECTIVE) {
                          if (msg.sender === 'Detective') { align = 'justify-end'; bubbleStyle = 'border-blue-500 bg-blue-900/30 text-blue-100 rounded-tl-lg rounded-bl-lg rounded-br-lg'; } 
                          else if (msg.sender === 'Suspect') { align = 'justify-start'; bubbleStyle = 'border-yellow-600 bg-yellow-900/30 text-yellow-100 rounded-tr-lg rounded-bl-lg rounded-br-lg'; }
                      } else if (gameMode === GameMode.KILLER) {
                           if (msg.sender === 'Detective') { align = 'justify-start'; bubbleStyle = 'border-blue-500 bg-blue-900/30 text-blue-100 rounded-tr-lg rounded-br-lg rounded-bl-lg'; } 
                           else if (msg.sender === 'Suspect') { align = 'justify-end'; bubbleStyle = 'border-yellow-600 bg-yellow-900/30 text-yellow-100 rounded-tl-lg rounded-bl-lg rounded-br-lg'; }
                      } else { 
                          if (msg.sender === 'Detective') { align = 'justify-end'; bubbleStyle = 'border-blue-500 bg-blue-900/30 text-blue-100'; }
                          if (msg.sender === 'Suspect') { align = 'justify-start'; bubbleStyle = 'border-yellow-600 bg-yellow-900/30 text-yellow-100'; }
                      }
                      return (
                        <div key={idx} className={`flex ${align}`}>
                          <div className={`max-w-[85%] p-3 border-2 shadow-lg text-sm font-mono ${bubbleStyle}`}>
                            <div className="text-[10px] uppercase font-bold mb-1 opacity-50 tracking-wider">{msg.sender === 'Detective' ? txt.detective : msg.sender === 'Suspect' ? selectedSuspect.name : 'System'}</div>
                            {msg.text}
                          </div>
                        </div>
                      );
                  })}
                  {isProcessing && <div className="text-xs text-slate-500 animate-pulse">{txt.thinking}</div>}
                </div>
                
                {/* Input Area */}
                {(gameMode === GameMode.DETECTIVE || gameMode === GameMode.KILLER) && (
                    <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
                            placeholder="..."
                            disabled={isProcessing}
                            className="flex-grow bg-slate-950 border-2 border-slate-600 p-3 text-white outline-none focus:border-yellow-500 font-mono text-sm"
                        />
                        <RetroButton onClick={handleSendMessage} disabled={isProcessing} className="px-3">
                            <MessageSquare size={18} />
                        </RetroButton>
                    </div>
                    {gameMode === GameMode.DETECTIVE && (
                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-700">
                            <button onClick={() => setPhase(GamePhase.PLAYING)} className="text-slate-400 hover:text-white uppercase text-xs font-bold flex items-center gap-1">← {txt.leave}</button>
                            <RetroButton variant="danger" className="text-xs py-2 px-4" onClick={() => handleAccuse(selectedSuspect)}>{txt.charge}</RetroButton>
                        </div>
                    )}
                    </div>
                )}
                {gameMode === GameMode.VICTIM && (<div className="text-center text-yellow-400 animate-pulse mt-4 font-mono text-sm">AI...</div>)}
              </PixelCard>
            )}

            {/* END GAME STATES */}
            {(phase === GamePhase.SOLVED || phase === GamePhase.FAILED || phase === GamePhase.TIMEOUT) && (
               <PixelCard title={txt.caseClosed} className={`flex-grow flex flex-col items-center justify-center text-center ${phase === GamePhase.SOLVED && gameMode !== GameMode.KILLER ? 'bg-green-900/20 border-green-500' : 'bg-red-900/20 border-red-500'}`}>
                  {/* ... End Game Logic ... */}
                  {(() => {
                      let title = txt.failure; let msg = txt.failMsg; let isSuccess = false;
                      if (gameMode === GameMode.DETECTIVE) {
                          if (phase === GamePhase.SOLVED) { title = txt.success; msg = txt.successMsg; isSuccess = true; }
                          else if (phase === GamePhase.TIMEOUT) { title = txt.timeout; msg = txt.failMsg; }
                          else { title = txt.failure; msg = accuseError || txt.failMsg; }
                      } else if (gameMode === GameMode.VICTIM) {
                          if (phase === GamePhase.SOLVED) { title = txt.success; msg = txt.successMsgVictim; isSuccess = true; }
                          else { title = txt.failure; msg = txt.failMsg; }
                      } else if (gameMode === GameMode.KILLER) {
                          if (phase === GamePhase.SOLVED) { title = txt.failure; msg = txt.failMsgKiller; isSuccess = false; } 
                          else { title = txt.success; msg = txt.successMsgKiller; isSuccess = true; } 
                      }
                      return (
                        <>
                            <h2 className={`text-4xl mb-2 font-pixel-header ${isSuccess ? 'text-green-400' : 'text-red-500'}`}>{title}</h2>
                            <p className="text-lg mb-6 text-slate-300">{msg}</p>
                        </>
                      );
                  })()}
                  <div className="bg-black p-6 border-2 border-slate-700 max-w-2xl text-start font-mono text-slate-300 mb-8 max-h-96 overflow-y-auto w-full">
                    <h4 className="uppercase font-bold mb-4 text-purple-400 border-b border-slate-700 pb-2">{txt.report}</h4>
                    <div className="whitespace-pre-wrap">{scenario.solutionExplanation}</div>
                  </div>
                  <RetroButton variant="primary" onClick={() => setPhase(GamePhase.MENU)}>{txt.newCase}</RetroButton>
               </PixelCard>
            )}
        </div>
      </div>
      )}
      
      {/* DEDUCTION SCREEN */}
      {phase === GamePhase.DEDUCING && aiAccusation && (
       <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-slate-200 p-4 font-mono">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none"></div>
           <div className="max-w-3xl w-full border-4 border-blue-500 bg-slate-900/90 shadow-[0_0_100px_rgba(59,130,246,0.3)] p-8 flex flex-col gap-8 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-blue-400 animate-pulse"></div>
               <div className="flex items-center justify-center gap-4 text-blue-400 animate-pulse">
                   <Brain size={48} />
                   <h2 className="text-3xl font-pixel-header uppercase">{txt.logicProcess}</h2>
               </div>
               <div className="flex flex-col md:flex-row gap-8 items-center">
                   <div className="w-48 h-48 border-4 border-blue-800 bg-black relative flex-shrink-0">
                       {aiAccusation.suspect.portraitUrl && (
                           <img src={aiAccusation.suspect.portraitUrl} className="w-full h-full object-cover grayscale opacity-80" alt="suspect" style={{imageRendering: 'pixelated'}} />
                       )}
                       <div className="absolute bottom-0 w-full bg-blue-900 text-center text-xs py-1 font-bold">{txt.target}: {aiAccusation.suspect.name}</div>
                   </div>
                   <div className="flex-grow space-y-4">
                       <div className="text-xs text-slate-500 uppercase tracking-widest mb-2">{txt.deductionStream}</div>
                       <div className="text-lg leading-relaxed text-blue-100 font-bold">
                           <span className="text-blue-500 ltr:mr-2 rtl:ml-2">»</span>
                           <TypewriterText text={aiAccusation.thought} speed={15} />
                       </div>
                   </div>
               </div>
               <div className="pt-6 border-t border-slate-700 flex justify-center">
                   <RetroButton onClick={() => handleAccuse(aiAccusation.suspect)} className="w-full md:w-auto animate-pulse hover:animate-none">
                       <span className="flex items-center gap-2"><Fingerprint /> {txt.reveal}</span>
                   </RetroButton>
               </div>
           </div>
       </div>
      )}

      {/* Clue Detail Modal Overlay */}
      {clueDetail && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => gameMode === GameMode.DETECTIVE && setClueDetail(null)}>
          <div className="bg-slate-900 border-4 border-yellow-500 p-8 max-w-xl w-full relative shadow-[0_0_100px_rgba(234,179,8,0.3)] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
             <div className="flex items-center gap-4 border-b border-slate-700 pb-4">
                 <div className="bg-yellow-500 text-black p-2 font-bold font-mono">EVIDENCE #{clueDetail.id}</div>
                 <h3 className="text-2xl text-yellow-100 font-bold uppercase tracking-wider">{clueDetail.name}</h3>
             </div>
             
             <div className="space-y-4 font-mono text-slate-300">
                 <p className="italic text-slate-500">{txt.initialScan} {clueDetail.description}</p>
                 <div className="bg-black p-4 border border-slate-700 text-green-400">
                    <span className="text-green-700 block text-xs mb-1">{txt.labReport}</span>
                    {clueDetail.detail}
                 </div>
                 <p className="text-xs text-slate-600">{txt.visualNote} {clueDetail.visualDescription}</p>
                 {clueDetail.relatedSuspectId && gameMode !== GameMode.DETECTIVE && (
                     <div className="text-red-400 font-bold animate-pulse">
                         AI NOTE: This links to {scenario.suspects.find(s => s.id === clueDetail.relatedSuspectId)?.name}
                     </div>
                 )}
             </div>

             {gameMode === GameMode.DETECTIVE && (
                 <RetroButton onClick={() => setClueDetail(null)} className="w-full mt-4">{txt.fileEvidence}</RetroButton>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;