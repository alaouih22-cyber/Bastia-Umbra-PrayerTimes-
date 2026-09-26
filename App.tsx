/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  PRAYER_SCHEDULE_2026,
  getPrayerScheduleForDate,
  formatDateKey,
  HIJRI_NOTE,
} from "./prayerData";
import { MORNING_AZKAR, EVENING_AZKAR, ZikrItem } from "./data/azkar";
import { NAWAWI_HADITHS } from "./data/nawawiyah";

interface TrackerRecord {
  [dateKey: string]: [boolean, boolean, boolean, boolean, boolean];
}

const PRAYER_NAMES = [
  "🌅 الفجر",
  "☀️ الشروق",
  "🌞 الظهر",
  "🌤️ العصر",
  "🌇 المغرب",
  "🌌 العشاء",
];

const PRAYER_KEYS = ["fajr", "shuruk", "dhuhr", "asr", "maghrib", "ishaa"] as const;

const ALL_NAMES_OF_ALLAH = [
  "الرَّحْمَنُ", "الرَّحِيمُ", "الْمَلِكُ", "الْقُدُّوسُ", "السَّلَامُ",
  "الْمُؤْمِنُ", "الْمُهَيْمِنُ", "الْعَزِيزُ", "الْجَبَّارُ", "الْمُتَكَبِّرُ",
  "الْخَالِقُ", "الْبَارِئُ", "الْمُصَوِّرُ", "الْغَفَّارُ", "الْقَهَّارُ",
  "الْوَهَّابُ", "الرَّزَّاقُ", "الْفَتَّاحُ", "الْعَلِيمُ", "الْقَابِضُ",
  "الْبَاسِطُ", "الْخَافِضُ", "الرَّافِعُ", "الْمُعِزُّ", "الْمُذِلُّ",
  "السَّمِيعُ", "الْبَصِيرُ", "الْحَكَمُ", "الْعَدْلُ", "اللَّطِيفُ",
  "الْخَبِيرُ", "الْحَلِيمُ", "الْعَظِيمُ", "الْغَفُورُ", "الشَّكُورُ",
  "الْعَلِيُّ", "الْكَبِيرُ", "الْحَفِيظُ", "الْمُقِيتُ", "الْحَسِيبُ",
  "الْجَلِيلُ", "الْكَرِيمُ", "الرَّقِيبُ", "الْمُجِيبُ", "الْوَاسِعُ",
  "الْحَكِيمُ", "الْوَدُودُ", "الْمَجِيدُ", "الْبَاعِثُ", "الشَّهِيدُ",
  "الْحَقُّ", "الْوَكِيلُ", "الْقَوِيُّ", "الْمَتِينُ", "الْوَلِيُّ",
  "الْحَمِيدُ", "الْمُحْصِي", "الْمُبْدِئُ", "الْمُعِيدُ", "الْمُحْيِي",
  "الْمُمِيتُ", "الْحَيُّ", "الْقَيُّومُ", "الْوَاجِدُ", "الْمَاجِدُ",
  "الْوَاحِدُ", "الْأَحَدُ", "الصَّمَدُ", "الْقَادِرُ", "الْمُقْتَدِرُ",
  "الْمُقَدِّمُ", "الْمُؤَخِّرُ", "الْأَوَّلُ", "الْآخِرُ", "الظَّاهِرُ",
  "الْبَاطِنُ", "الْوَالِي", "الْمُتَعَالِي", "الْبَرُّ", "التَّوَّابُ",
  "الْمُنْتَقِمُ", "الْعَفُوُّ", "الرَّؤُوفُ", "مَالِكُ الْمُلْكِ", "ذُو الْجَلَالِ وَالإِكْرَامِ",
  "الْمُقْسِطُ", "الْجَامِعُ", "الْغَنِيُّ", "الْمُغْنِي", "الْمَانِعُ",
  "الضَّارُّ", "النَّافِعُ", "النُّورُ", "الْهَادِي", "الْبَدِيعُ",
  "الْبَاقِي", "الْوَارِثُ", "الرَّشِيدُ", "الصَّبُورُ"
];

const HADITHS = NAWAWI_HADITHS;

export default function App() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Settings
  const [notifMode, setNotifMode] = useState<string>("athan");
  const [athanVoice, setAthanVoice] = useState<string>(
    "https://ia800203.us.archive.org/8/items/AdhanMorocco/Adhan%20Morocco.mp3"
  );
  const [zakatInput, setZakatInput] = useState<string>("");
  const [zakatResult, setZakatResult] = useState<string>("€ 0.00");

  // Azkar state
  const [azkarTab, setAzkarTab] = useState<"sabah" | "masaa">("sabah");
  const [azkarCounts, setAzkarCounts] = useState<Record<string, number>>({});

  const decrementZkr = (id: string, initialCount: number) => {
    setAzkarCounts((prev) => {
      const current = prev[id] !== undefined ? prev[id] : initialCount;
      if (current <= 0) return prev;
      return { ...prev, [id]: current - 1 };
    });
  };

  const resetAzkarCounters = () => {
    setAzkarCounts({});
  };

  // Tracker state
  const [tracker, setTracker] = useState<TrackerRecord>({});
  const [compassHeading, setCompassHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [compassPermissionNeeded, setCompassPermissionNeeded] = useState<boolean>(false);
  const [compassPermissionGranted, setCompassPermissionGranted] = useState<boolean>(false);
  const smoothedHeadingRef = useRef<number>(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioUnlockedRef = useRef<boolean>(false);

  // Load preferences
  useEffect(() => {
    const savedMode = localStorage.getItem("nMode");
    if (savedMode) setNotifMode(savedMode);

    const savedVoice = localStorage.getItem("athanVoice");
    if (savedVoice) setAthanVoice(savedVoice);

    const savedTracker = localStorage.getItem("mpTracker");
    if (savedTracker) {
      try {
        setTracker(JSON.parse(savedTracker));
      } catch (e) {
        // ignore error
      }
    }

    // Interval to update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Device orientation for Qibla compass with high precision smoothing & iOS 13+ support
  const requestOrientationPermission = async () => {
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === "granted") {
          setCompassPermissionGranted(true);
          setCompassPermissionNeeded(false);
          startCompassListener();
        }
      } catch (err) {
        console.error("Compass permission error:", err);
      }
    } else {
      startCompassListener();
    }
  };

  const startCompassListener = () => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      let heading: number | null = null;
      if (typeof (e as any).webkitCompassHeading !== "undefined" && (e as any).webkitCompassHeading !== null) {
        heading = (e as any).webkitCompassHeading;
      } else if (e.alpha !== null && e.alpha !== undefined) {
        // standard android/desktop alpha
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        setHasCompassSensor(true);
        // Exponential smoothing for ultra-smooth needle rendering without jitter
        const prev = smoothedHeadingRef.current;
        let diff = heading - prev;
        while (diff < -180) diff += 360;
        while (diff > 180) diff -= 360;
        const smoothed = (prev + diff * 0.35 + 360) % 360;
        smoothedHeadingRef.current = smoothed;
        setCompassHeading(Math.round(smoothed * 10) / 10);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
      // Also try deviceorientationabsolute for Chrome Android high-accuracy sensor
      window.addEventListener("deviceorientationabsolute" as any, handleOrientation, true);
    }
  };

  useEffect(() => {
    if (
      typeof (DeviceOrientationEvent as any) !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function"
    ) {
      setCompassPermissionNeeded(true);
    } else {
      startCompassListener();
    }
  }, []);

  // Audio unlock helper
  const unlockAudio = () => {
    if (!isAudioUnlockedRef.current && silentAudioRef.current) {
      silentAudioRef.current.play().catch(() => {});
      isAudioUnlockedRef.current = true;
    }
    // Try screen wakeLock if supported
    if ("wakeLock" in navigator && (navigator as any).wakeLock?.request) {
      (navigator as any).wakeLock.request("screen").catch(() => {});
    }
  };

  const handleSaveNotifMode = (mode: string) => {
    setNotifMode(mode);
    localStorage.setItem("nMode", mode);
  };

  const handleSelectAthanVoice = (voiceUrl: string) => {
    setAthanVoice(voiceUrl);
    localStorage.setItem("athanVoice", voiceUrl);
    unlockAudio();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = voiceUrl;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Get current day's schedule from the official Bastia Umbra timetable
  const todaySchedule = getPrayerScheduleForDate(currentTime);
  const todayKey = formatDateKey(currentTime);

  // Prayer times array for today
  const prayerTimesArr: string[] = [
    todaySchedule.fajr,
    todaySchedule.shuruk,
    todaySchedule.dhuhr,
    todaySchedule.asr,
    todaySchedule.maghrib,
    todaySchedule.ishaa,
  ];

  // Calculate next prayer and countdown
  let nextIndex = -1;
  let minDiff = Infinity;
  const nowMs = currentTime.getTime();

  for (let i = 0; i < 6; i++) {
    const [h, m] = prayerTimesArr[i].split(":").map(Number);
    const pDate = new Date(currentTime);
    pDate.setHours(h, m, 0, 0);
    const diff = pDate.getTime() - nowMs;

    if (diff > 0 && diff < minDiff) {
      minDiff = diff;
      nextIndex = i;
    }
  }

  // If all prayers today have passed, the next prayer is Fajr tomorrow
  let remainingMs = minDiff;
  if (nextIndex === -1) {
    nextIndex = 0; // Fajr
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowSchedule = getPrayerScheduleForDate(tomorrow);
    const [h, m] = tomorrowSchedule.fajr.split(":").map(Number);
    tomorrow.setHours(h, m, 0, 0);
    remainingMs = tomorrow.getTime() - nowMs;
  }

  if (remainingMs < 0) remainingMs = 0;
  const rh = Math.floor((remainingMs % 86400000) / 3600000);
  const rm = Math.floor((remainingMs % 3600000) / 60000);
  const rs = Math.floor((remainingMs % 60000) / 1000);
  const countdownStr = `${rh.toString().padStart(2, "0")}:${rm
    .toString()
    .padStart(2, "0")}:${rs.toString().padStart(2, "0")}`;

  const totalInterval = 12 * 3600000;
  let progressPerc = 100 - (remainingMs / totalInterval) * 100;
  if (progressPerc > 100) progressPerc = 100;
  if (progressPerc < 0) progressPerc = 0;

  // City display time
  const timeFormatted = currentTime.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Hijri display
  const hijriText = `${todaySchedule.hijriDay} ربيع الآخر 1448`;

  // Zakat Calculator
  const calculateZakat = () => {
    const val = parseFloat(zakatInput);
    if (isNaN(val) || val <= 0) {
      setZakatResult("€ 0.00");
    } else {
      const z = val * 0.025;
      setZakatResult("Zakat dovuta: € " + z.toFixed(2));
    }
  };

  // Tracker toggle
  const currentTracker = tracker[todayKey] || [false, false, false, false, false];
  const toggleTrackerPrayer = (idx: number, val: boolean) => {
    const updated: [boolean, boolean, boolean, boolean, boolean] = [...currentTracker];
    updated[idx] = val;
    const newTracker = { ...tracker, [todayKey]: updated };
    setTracker(newTracker);
    localStorage.setItem("mpTracker", JSON.stringify(newTracker));
  };

  const realPrayerNamesForTracker = [
    "🌅 الفجر",
    "🌞 الظهر",
    "🌤️ العصر",
    "🌇 المغرب",
    "🌌 العشاء",
  ];

  return (
    <div
      className="flex flex-col h-screen w-full overflow-hidden select-none"
      onClick={unlockAudio}
    >
      {/* Audio elements */}
      <audio
        ref={silentAudioRef}
        loop
        src="https://github.com/anars/blank-audio/raw/master/10-seconds-of-silence.mp3"
      />
      <audio ref={audioRef} preload="auto" />

      {/* HEADER */}
      <header className="header" id="app-header">
        <button
          className="menu-btn bg-transparent border-0"
          onClick={(e) => {
            e.stopPropagation();
            setSidebarOpen(true);
          }}
          aria-label="Apri menu"
          id="btn-open-sidebar"
        >
          ☰
        </button>
        <div className="app-title" id="app-title-text">
          Muslim Pro Bastia
        </div>
        <div className="header-logo" id="header-logo-icon">
          <svg
            viewBox="0 0 24 24"
            width="28"
            height="28"
            fill="currentColor"
            className="text-amber-300"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.3 0 4.41-.78 6.1-2.09-4.88-.63-8.68-4.79-8.68-9.91 0-4.04 2.37-7.53 5.82-9.15C14.18 2.31 13.12 2 12 2z" />
            <polygon points="19,5 20,7.5 22.5,8 20.5,10 21,12.5 19,11 17,12.5 17.5,10 15.5,8 18,7.5" />
          </svg>
        </div>
      </header>

      {/* HEADER AYA */}
      <div className="header-aya" id="header-aya-banner">
        <span>إِنَّ مَعَ الْعُسْرِ يُسْرًا | In verità con la difficoltà c'è la facilità</span>
      </div>

      {/* DASHBOARD */}
      <div className="dashboard" id="main-dashboard">
        <div className="dash-info">
          <div style={{ textAlign: "right" }}>
            <div className="timer-main" id="timer-next">
              {countdownStr}
            </div>
            <div
              style={{ fontSize: "10px", fontWeight: 800, color: "var(--mp-gold)" }}
              id="next-name"
            >
              PROSSIMA: {PRAYER_NAMES[nextIndex].toUpperCase()}
            </div>
          </div>
          <div className="date-box" style={{ textAlign: "left" }}>
            <div className="date-hijri" id="hijri-txt">
              {hijriText}
            </div>
            <div className="city-label" id="city-display">
              BASTIA UMBRA: {timeFormatted}
            </div>
          </div>
        </div>

        {/* ACTION BUBBLES */}
        <div className="action-bubbles" id="action-bubbles-container">
          <button
            className="bubble-item"
            onClick={() => setActiveModal("tracker-modal")}
            id="bubble-diary"
          >
            <div className="bubble-circle">✅</div>
            <span className="bubble-label">Diary</span>
          </button>
          <button
            className="bubble-item"
            onClick={() => setActiveModal("azkar-modal")}
            id="bubble-azkar"
          >
            <div className="bubble-circle">🤲</div>
            <span className="bubble-label">Azkar</span>
          </button>
          <button
            className="bubble-item"
            onClick={() => setActiveModal("names-modal")}
            id="bubble-names"
          >
            <div className="bubble-circle">✨</div>
            <span className="bubble-label">Nomi 99</span>
          </button>
          <button
            className="bubble-item"
            onClick={() => setActiveModal("timetable-modal")}
            id="bubble-timetable"
          >
            <div className="bubble-circle">📅</div>
            <span className="bubble-label">Calendario</span>
          </button>
          <button
            className="bubble-item"
            onClick={() => setActiveModal("qibla-modal")}
            id="bubble-qibla"
          >
            <div className="bubble-circle">🧭</div>
            <span className="bubble-label">Qibla</span>
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="progress-container">
          <div
            className="progress-bar"
            id="p-bar"
            style={{ width: `${progressPerc}%` }}
          ></div>
        </div>
      </div>

      {/* PRAYER LIST */}
      <div className="prayer-list" id="list-container">
        {PRAYER_NAMES.map((name, i) => {
          const isActive = i === nextIndex;
          return (
            <div
              key={name}
              className={`prayer-card ${isActive ? "active" : ""}`}
              id={`prayer-card-${i}`}
            >
              <span className="p-name">
                {name} {isActive ? "🟢" : ""}
              </span>
              <span className="p-time">{prayerTimesArr[i]}</span>
            </div>
          );
        })}
      </div>

      {/* HADITH FOOTER MARQUEE */}
      <div className="hadith-footer" id="hadith-footer">
        <div className="hadith-track" id="h-track">
          <span className="hadith-text">
            {HADITHS.join("  •  ")} &nbsp;•&nbsp; {HADITHS.join("  •  ")}
          </span>
        </div>
      </div>

      {/* SIDEBAR */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`sidebar ${sidebarOpen ? "open" : ""}`} id="sidebar">
        <h2>Muslim Pro Menu</h2>
        <button
          className="sidebar-btn btn-gold"
          onClick={() => {
            window.open(
              "https://quran.ksu.edu.sa/m.php?l=ar#aya=1_1&m=hafs&qaree=husary&trans=ar_mu",
              "_blank"
            );
          }}
          id="btn-moshaf"
        >
          📖 المصحف الملون (ورش)
        </button>

        <button
          className="sidebar-btn btn-gold"
          style={{ marginTop: "10px" }}
          onClick={() => {
            setSidebarOpen(false);
            setActiveModal("zakat-modal");
          }}
          id="btn-zakat"
        >
          💰 Calcola Zakat
        </button>

        <button
          className="sidebar-btn"
          style={{ background: "white", color: "black", marginTop: "10px" }}
          onClick={() => {
            window.open("https://www.google.com/maps/search/mosque+near+me", "_blank");
          }}
          id="btn-mosque-near"
        >
          🕌 Trova Moschea
        </button>

        <button
          className="sidebar-btn"
          style={{
            background: "var(--mp-gold)",
            color: "var(--mp-dark)",
            marginTop: "10px",
          }}
          onClick={() => {
            setSidebarOpen(false);
            setActiveModal("timetable-modal");
          }}
          id="btn-open-calendar-sidebar"
        >
          📅 Visualizza Calendario Mese
        </button>

        <hr style={{ margin: "20px 0", opacity: 0.15 }} />

        {/* NOTIFICATION MODE */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            padding: "15px",
            borderRadius: "15px",
          }}
        >
          <label
            htmlFor="notif-type"
            style={{ fontSize: "12px", color: "var(--mp-gold)", display: "block" }}
          >
            🔔 Modalità Sveglia
          </label>
          <select
            id="notif-type"
            value={notifMode}
            onChange={(e) => handleSaveNotifMode(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              background: "#222",
              color: "white",
              borderRadius: "10px",
              border: "1px solid var(--mp-gold)",
              marginTop: "8px",
            }}
          >
            <option value="athan">Athan Completo + Banner</option>
            <option value="bip">Solo Bip + Banner</option>
          </select>
        </div>

        {/* ATHAN VOICE */}
        <label
          htmlFor="athan-voice"
          style={{
            fontSize: "12px",
            color: "var(--mp-gold)",
            display: "block",
            marginTop: "15px",
          }}
        >
          🔊 Voce Athan
        </label>
        <select
          id="athan-voice"
          value={athanVoice}
          onChange={(e) => handleSelectAthanVoice(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            background: "#222",
            color: "white",
            borderRadius: "12px",
            border: "1px solid var(--mp-gold)",
            marginTop: "8px",
          }}
        >
          <option value="https://ia800203.us.archive.org/8/items/AdhanMorocco/Adhan%20Morocco.mp3">
            Marocco (Casablanca - Stile Maghrebi autentico)
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan1.mp3">
            Makkah (La Mecca)
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan2.mp3">
            Madinah (Medina)
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan3.mp3">
            Al-Aqsa (Gerusalemme)
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan4.mp3">
            Egitto (Il Cairo)
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan5.mp3">
            Abdul Basit Abdus Samad
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan6.mp3">
            Mishary Rashid Alafasy
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan7.mp3">
            Athan Maghribi Traditional
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan8.mp3">
            Nasser Al-Qatami
          </option>
          <option value="https://www.islamcan.com/audio/adhan/azan9.mp3">
            Ali Ibn Ahmed Al-Mulla
          </option>
          <option value="https://cdn.islamic.network/astronomical/adhan.mp3">
            Stile Maghrebino / Nord Africa (Standard CDN)
          </option>
        </select>

        <button
          className="sidebar-btn"
          style={{
            background: "transparent",
            border: "1px solid white",
            color: "white",
            marginTop: "30px",
          }}
          onClick={() => setSidebarOpen(false)}
          id="btn-close-sidebar"
        >
          CHIUDI
        </button>
      </div>

      {/* MODAL: CALENDARIO MENSILE COMPLETO (ORARIO PREGHIERE BASTIA UMBRA) */}
      {activeModal === "timetable-modal" && (
        <div className="modal-overlay" id="timetable-modal">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                BASTIA UMBRA 2026 - 1448
              </span>
              <h3
                style={{
                  color: "var(--mp-dark)",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                مواقيت الصلاة - ربيع الآخر 1448
              </h3>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Settembre - Ottobre 2026 (Associazione Islamica Arrahma)
            </p>

            <div className="timetable-scroll">
              <table className="timetable-view" id="monthly-table">
                <thead>
                  <tr>
                    <th>اليوم</th>
                    <th>ربيع الآخر</th>
                    <th>Data</th>
                    <th>الفجر</th>
                    <th>الشروق</th>
                    <th>الظهر</th>
                    <th>العصر</th>
                    <th>المغرب</th>
                    <th>العشاء</th>
                  </tr>
                </thead>
                <tbody id="monthly-body">
                  {PRAYER_SCHEDULE_2026.map((row) => {
                    const isToday = row.dateKey === todayKey;
                    return (
                      <tr
                        key={row.dateKey}
                        className={isToday ? "current-day-row" : ""}
                        style={
                          isToday
                            ? { backgroundColor: "#FFFCF5", fontWeight: "bold" }
                            : {}
                        }
                      >
                        <td className="font-bold">
                          {row.dayAr} <span className="text-gray-400 font-normal">({row.dayIt})</span>
                        </td>
                        <td className="font-bold text-amber-700">{row.hijriDayAr}</td>
                        <td className="text-gray-700">{row.dayShort}</td>
                        <td className="font-semibold">{row.fajr}</td>
                        <td>{row.shuruk}</td>
                        <td>{row.dhuhr}</td>
                        <td>{row.asr}</td>
                        <td className="font-semibold text-emerald-900">{row.maghrib}</td>
                        <td>{row.ishaa}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Note on Fajr & Imsak as printed on the flyer */}
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[10px] leading-relaxed text-right">
              {HIJRI_NOTE}
            </div>

            <button
              className="sidebar-btn btn-gold"
              style={{ marginTop: "16px" }}
              onClick={() => setActiveModal(null)}
              id="btn-close-timetable"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* MODAL: 99 NOMI DI ALLAH */}
      {activeModal === "names-modal" && (
        <div className="modal-overlay" id="names-modal">
          <div className="modal-card">
            <h3 style={{ color: "var(--mp-dark)", fontWeight: "bold", fontSize: "17px" }}>
              I 99 Nomi di Allah (أسماء الله الحسنى)
            </h3>
            <div className="names-grid" id="names-grid">
              {ALL_NAMES_OF_ALLAH.map((name, idx) => (
                <div key={name} className="gold-item">
                  <b>{name}</b>
                  <span>{idx + 1}</span>
                </div>
              ))}
            </div>
            <button
              className="sidebar-btn btn-gold"
              style={{ marginTop: "16px" }}
              onClick={() => setActiveModal(null)}
              id="btn-close-names"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* MODAL: QIBLA COMPASS */}
      {activeModal === "qibla-modal" && (
        <div className="modal-overlay" id="qibla-modal">
          <div className="modal-card" style={{ maxWidth: "460px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <h3
                style={{
                  color: "var(--mp-dark)",
                  margin: 0,
                  fontWeight: "bold",
                  fontSize: "18px"
                }}
              >
                🧭 Direzione Qibla (اتجاه القبلة)
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888" }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-around", background: "#f8f9fa", borderRadius: "12px", padding: "8px 12px", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontWeight: "bold" }}>QIBLA BASTIA</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--mp-dark)" }}>131° SE</div>
              </div>
              <div style={{ borderLeft: "1px solid #ddd" }}></div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontWeight: "bold" }}>DIREZIONE ATTUALE</div>
                <div style={{ fontSize: "16px", fontWeight: "900", color: "var(--mp-gold)" }}>{Math.round(compassHeading)}°</div>
              </div>
              <div style={{ borderLeft: "1px solid #ddd" }}></div>
              <div>
                <div style={{ fontSize: "10px", color: "#666", fontWeight: "bold" }}>STATO</div>
                <div style={{ fontSize: "13px", fontWeight: "800", color: Math.abs(((compassHeading - 131 + 540) % 360) - 180) <= 5 ? "#16a34a" : "#ca8a04" }}>
                  {Math.abs(((compassHeading - 131 + 540) % 360) - 180) <= 5 ? "✓ ALLINEATO" : "Ruota"}
                </div>
              </div>
            </div>

            {compassPermissionNeeded && !compassPermissionGranted && (
              <div style={{ marginBottom: "12px" }}>
                <button
                  onClick={requestOrientationPermission}
                  className="sidebar-btn btn-gold"
                  style={{ margin: 0, padding: "10px", fontSize: "13px" }}
                >
                  ⚡ Attiva Sensore Bussola (Richiesto su iOS/iPhone)
                </button>
              </div>
            )}

            <div className="compass-ui">
              <div className="compass-center-indicator"></div>
              <div className={`compass-aligned-ring ${Math.abs(((compassHeading - 131 + 540) % 360) - 180) <= 5 ? "active" : ""}`}></div>
              
              <div
                id="compass-disk"
                style={{
                  transform: `rotate(${-(compassHeading)}deg)`,
                }}
              >
                {/* Dial Cardinals */}
                <div style={{ fontSize: "13px", fontWeight: "900", color: "#ef4444", letterSpacing: "1px" }}>N (شمال)</div>
                
                {/* 131 deg Qibla Pointer inside the rotating dial */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%) rotate(131deg)",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingTop: "14px"
                  }}
                >
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.8))"
                  }}>
                    <span style={{ fontSize: "26px", lineHeight: "1" }}>🕋</span>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: "900",
                      background: "var(--mp-gold)",
                      color: "var(--mp-dark)",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      marginTop: "2px"
                    }}>
                      القبلة 131°
                    </span>
                  </div>
                </div>

                <div style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "var(--mp-gold)",
                  border: "2px solid #fff",
                  boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                  zIndex: 5
                }}></div>

                <div style={{ fontSize: "12px", fontWeight: "bold", color: "#9ca3af" }}>S (جنوب)</div>
              </div>
            </div>

            <p style={{ fontSize: "12px", color: "#555", marginTop: "14px", marginBottom: "4px" }}>
              {hasCompassSensor 
                ? "Gira il telefono finché l'icona della Kaaba 🕋 non è perfettamente allineata in alto con la freccia rossa."
                : "Posiziona il dispositivo in orizzontale su una superficie piana e orientalo verso Sud-Est (131°)."}
            </p>

            <button
              className="sidebar-btn btn-gold"
              onClick={() => setActiveModal(null)}
              style={{ marginTop: "14px" }}
              id="btn-close-qibla"
            >
              Chiudi / إغلاق
            </button>
          </div>
        </div>
      )}

      {/* MODAL: CALCOLO ZAKAT */}
      {activeModal === "zakat-modal" && (
        <div className="modal-overlay" id="zakat-modal">
          <div className="modal-card">
            <h3
              style={{
                color: "var(--mp-dark)",
                marginBottom: "10px",
                fontWeight: "bold",
              }}
            >
              Calcolo Zakat Al-Mal (حساب زكاة المال)
            </h3>
            <p style={{ fontSize: "12px", marginBottom: "15px", color: "#555" }}>
              Inserisci il totale dei tuoi risparmi in Euro che hanno superato il Nisab e l'Houl (1 anno).
            </p>
            <input
              type="number"
              id="zakat-input"
              value={zakatInput}
              onChange={(e) => setZakatInput(e.target.value)}
              placeholder="Totale risparmi (€)"
              style={{
                width: "100%",
                padding: "14px",
                border: "2px solid var(--mp-gold)",
                borderRadius: "12px",
                fontSize: "18px",
                textAlign: "center",
                outline: "none",
              }}
            />
            <button
              className="sidebar-btn btn-gold"
              onClick={calculateZakat}
              style={{ marginTop: "12px" }}
              id="btn-calc-zakat"
            >
              Calcola (2.5%)
            </button>
            <h2
              id="zakat-result"
              style={{
                color: "var(--mp-dark)",
                marginTop: "15px",
                fontWeight: "bold",
                fontSize: "20px",
              }}
            >
              {zakatResult}
            </h2>
            <button
              className="sidebar-btn"
              style={{ background: "#eee", color: "#333", marginTop: "14px" }}
              onClick={() => setActiveModal(null)}
              id="btn-close-zakat"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}

      {/* MODAL: TRACKER DIARIO PREGHIERE */}
      {activeModal === "tracker-modal" && (
        <div className="modal-overlay" id="tracker-modal">
          <div className="modal-card">
            <h3
              style={{
                color: "var(--mp-dark)",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              Diario Preghiere di Oggi ({todaySchedule.dayIt} {todaySchedule.dayShort})
            </h3>
            <div id="tracker-list" style={{ textAlign: "right" }}>
              {realPrayerNamesForTracker.map((pName, idx) => {
                const isChecked = !!currentTracker[idx];
                return (
                  <label
                    key={pName}
                    style={{
                      padding: "12px 10px",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ fontWeight: "bold", color: "var(--mp-dark)" }}>
                      {pName}
                    </span>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => toggleTrackerPrayer(idx, e.target.checked)}
                      style={{ transform: "scale(1.4)", cursor: "pointer" }}
                      id={`tracker-check-${idx}`}
                    />
                  </label>
                );
              })}
            </div>
            <button
              className="sidebar-btn btn-gold"
              onClick={() => setActiveModal(null)}
              style={{ marginTop: "20px" }}
              id="btn-close-tracker"
            >
              Salva & Chiudi
            </button>
          </div>
        </div>
      )}

      {/* MODAL: AZKAR AL-SABAH & AL-MASAA */}
      {activeModal === "azkar-modal" && (
        <div className="modal-overlay" id="azkar-modal">
          <div
            className="modal-card"
            style={{
              maxWidth: "520px",
              textAlign: "right",
              maxHeight: "88vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "2px solid var(--mp-gold)",
                paddingBottom: "8px",
                marginBottom: "10px",
              }}
            >
              <h3
                style={{
                  color: "var(--mp-dark)",
                  margin: 0,
                  fontSize: "19px",
                  fontFamily: "'Amiri', serif",
                  fontWeight: "bold",
                }}
              >
                🤲 حصن المسلم - أذكار الصباح والمساء
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#888",
                  padding: "0 5px",
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexShrink: 0 }}>
              <button
                onClick={() => setAzkarTab("sabah")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: `1.5px solid ${azkarTab === "sabah" ? "var(--mp-gold)" : "#ddd"}`,
                  background: azkarTab === "sabah" ? "var(--mp-dark)" : "#f8f9fa",
                  color: azkarTab === "sabah" ? "var(--mp-gold)" : "#555",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                id="tab-sabah-btn"
              >
                🌅 أذكار الصباح
              </button>
              <button
                onClick={() => setAzkarTab("masaa")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "12px",
                  border: `1.5px solid ${azkarTab === "masaa" ? "var(--mp-gold)" : "#ddd"}`,
                  background: azkarTab === "masaa" ? "var(--mp-dark)" : "#f8f9fa",
                  color: azkarTab === "masaa" ? "var(--mp-gold)" : "#555",
                  fontWeight: 800,
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "0.2s",
                }}
                id="tab-masaa-btn"
              >
                🌇 أذكار المساء
              </button>
            </div>

            <div
              style={{
                flexGrow: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                padding: "4px 6px",
                direction: "rtl",
                textAlign: "right",
              }}
              id="azkar-list-container"
            >
              {(azkarTab === "sabah" ? MORNING_AZKAR : EVENING_AZKAR).map((item) => {
                const currentCount =
                  azkarCounts[item.id] !== undefined ? azkarCounts[item.id] : item.count;
                const isCompleted = currentCount === 0;

                return (
                  <div
                    key={item.id}
                    style={{
                      background: "#fff",
                      border: `1.5px solid ${isCompleted ? "#bbf7d0" : "#eedbb7"}`,
                      borderRadius: "14px",
                      padding: "12px 14px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Amiri', serif",
                        fontSize: "16px",
                        lineHeight: "1.8",
                        color: "#1a1a1a",
                        whiteSpace: "pre-line",
                        marginBottom: "8px",
                      }}
                    >
                      {item.text}
                    </div>

                    {item.virtue && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#666",
                          background: "#f9fafb",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          marginBottom: "8px",
                          lineHeight: "1.4",
                        }}
                      >
                        ✨ {item.virtue}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "1px dashed #eee",
                        paddingTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "var(--mp-gold)",
                        }}
                      >
                        التكرار المطلوب: {item.count}
                      </span>
                      <button
                        onClick={() => decrementZkr(item.id, item.count)}
                        style={{
                          background: isCompleted ? "#15803d" : "var(--mp-dark)",
                          color: isCompleted ? "#ffffff" : "var(--mp-gold)",
                          border: `1.5px solid ${isCompleted ? "#15803d" : "var(--mp-gold)"}`,
                          borderRadius: "20px",
                          padding: "5px 16px",
                          fontWeight: "bold",
                          fontSize: "14px",
                          cursor: "pointer",
                          minWidth: "65px",
                          transition: "all 0.15s ease",
                        }}
                        id={`btn-zkr-${item.id}`}
                      >
                        {isCompleted ? "تم ✓" : currentCount}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "12px", flexShrink: 0 }}>
              <button
                className="sidebar-btn"
                style={{ background: "#eee", color: "#333", margin: 0, flex: 1 }}
                onClick={resetAzkarCounters}
                id="btn-reset-azkar"
              >
                🔄 إعادة التصفير
              </button>
              <button
                className="sidebar-btn btn-gold"
                style={{ margin: 0, flex: 2 }}
                onClick={() => setActiveModal(null)}
                id="btn-close-azkar"
              >
                إغلاق / Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
