(function () {
  "use strict";
  const {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
  } = React;

  const STORAGE_KEYS = {
    profile: "archive.profile",
    lang: "archive.lang",
    sanity: "archive.sanity",
    sheet: "archive.sheet",
  };

  const Store = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        try {
          return JSON.parse(raw);
        } catch (e) {
          return raw;
        }
      } catch (e) {
        return fallback;
      }
    },
    write(key, value) {
      try {
        const v = typeof value === "string" ? value : JSON.stringify(value);
        localStorage.setItem(key, v);
      } catch (e) {}
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {}
    },
  };

  const ArchiveContext = createContext(null);

  function sanityStage(s) {
    if (s >= 76) return "normal";
    if (s >= 51) return "paranoia";
    if (s >= 26) return "distortion";
    return "madness";
  }

  function applySanityToDOM(s) {
    const root = document.documentElement;
    const body = document.body;
    const stage = sanityStage(s);
    body.setAttribute("data-sanity-stage", stage);
    root.style.setProperty("--sanity", String(s));

    const reduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    switch (stage) {
      case "normal":
        root.style.setProperty("--global-saturate", "1");
        root.style.setProperty("--global-tilt", "0deg");
        root.style.setProperty("--noise-opacity", "0.05");
        root.style.setProperty("--accent", "var(--biolum-purple)");
        root.style.setProperty("--accent-soft", "var(--biolum-purple-soft)");
        root.style.setProperty("--accent-rgb", "176, 124, 255");
        break;
      case "paranoia":
        root.style.setProperty("--global-saturate", "0.92");
        root.style.setProperty("--global-tilt", "0deg");
        root.style.setProperty("--noise-opacity", "0.08");
        root.style.setProperty("--accent", "var(--biolum-purple)");
        root.style.setProperty("--accent-soft", "var(--biolum-purple-soft)");
        root.style.setProperty("--accent-rgb", "176, 124, 255");
        break;
      case "distortion":
        root.style.setProperty("--global-saturate", "0.55");
        root.style.setProperty("--global-tilt", reduced ? "0deg" : "1deg");
        root.style.setProperty("--noise-opacity", "0.13");
        root.style.setProperty("--accent", "#9d62e0");
        root.style.setProperty("--accent-soft", "#c9a8ff");
        root.style.setProperty("--accent-rgb", "157, 98, 224");
        break;
      case "madness":
        root.style.setProperty("--global-saturate", "0.7");
        root.style.setProperty("--global-tilt", reduced ? "0deg" : "1deg");
        root.style.setProperty("--noise-opacity", "0.18");
        root.style.setProperty("--accent", "#c4122f");
        root.style.setProperty("--accent-soft", "#ff5a72");
        root.style.setProperty("--accent-rgb", "196, 18, 47");
        break;
    }
  }

  function useAbyssAudio(sanity) {
    const [audioEnabled, setAudioEnabled] = useState(false);
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const gainRef = useRef(null);

    useEffect(() => {
      if (!audioEnabled) {
        if (audioCtxRef.current) audioCtxRef.current.suspend();
        return;
      }

      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        audioCtxRef.current = new Ctx();
        oscRef.current = audioCtxRef.current.createOscillator();
        gainRef.current = audioCtxRef.current.createGain();

        oscRef.current.type = "sine";
        oscRef.current.frequency.value = 45;
        gainRef.current.gain.value = 0.05;

        oscRef.current.connect(gainRef.current);
        gainRef.current.connect(audioCtxRef.current.destination);
        oscRef.current.start();
      }

      audioCtxRef.current.resume();

      if (audioCtxRef.current && oscRef.current && gainRef.current) {
        const now = audioCtxRef.current.currentTime;
        let targetFreq = 45;
        let targetGain = 0.05;

        if (sanity < 25) {
          targetFreq = 65;
          targetGain = 0.15;
        } else if (sanity < 50) {
          targetFreq = 55;
          targetGain = 0.1;
        }

        oscRef.current.frequency.linearRampToValueAtTime(targetFreq, now + 1);
        gainRef.current.gain.linearRampToValueAtTime(targetGain, now + 1);
      }
    }, [audioEnabled, sanity]);

    useEffect(() => {
      return () => {
        if (audioCtxRef.current) audioCtxRef.current.close();
      };
    }, []);

    return { audioEnabled, setAudioEnabled };
  }

  function ArchiveProvider(props) {
    const [profile, setProfileState] = useState(() =>
      Store.read(STORAGE_KEYS.profile, null),
    );
    const [lang, setLangState] = useState(() =>
      Store.read(STORAGE_KEYS.lang, "pt"),
    );
    const [sanity, setSanityState] = useState(() => {
      const v = Store.read(STORAGE_KEYS.sanity, 100);
      return typeof v === "number" ? v : 100;
    });
    const [route, setRoute] = useState("bestiary");

    const { audioEnabled, setAudioEnabled } = useAbyssAudio(sanity);

    useEffect(() => {
      Store.write(STORAGE_KEYS.sanity, sanity);
      applySanityToDOM(sanity);
    }, [sanity]);

    useEffect(() => {
      Store.write(STORAGE_KEYS.lang, lang);
    }, [lang]);

    const setProfile = useCallback((p) => {
      setProfileState(p);
      Store.write(STORAGE_KEYS.profile, p);
      setRoute("bestiary");
    }, []);

    const clearProfile = useCallback(() => {
      setProfileState(null);
      Store.remove(STORAGE_KEYS.profile);
    }, []);

    const setLang = useCallback((l) => setLangState(l), []);

    const setSanity = useCallback((v) => {
      const clamped = Math.max(0, Math.min(100, Math.round(v)));
      setSanityState(clamped);
    }, []);

    const adjustSanity = useCallback((delta) => {
      setSanityState((prev) => Math.max(0, Math.min(100, prev + delta)));
    }, []);

    const t = window.ARCHIVE_DATA.I18N[lang] || window.ARCHIVE_DATA.I18N.pt;

    const value = {
      profile,
      setProfile,
      clearProfile,
      lang,
      setLang,
      t,
      sanity,
      setSanity,
      adjustSanity,
      sanityStage: sanityStage(sanity),
      route,
      setRoute,
      isMaster: profile === "master",
      isPlayer: profile === "player",
      data: window.ARCHIVE_DATA,
      Store,
      STORAGE_KEYS,
      audioEnabled,
      setAudioEnabled,
    };

    return React.createElement(
      ArchiveContext.Provider,
      { value },
      props.children,
    );
  }

  function useArchive() {
    const ctx = useContext(ArchiveContext);
    if (!ctx)
      throw new Error("useArchive deve ser usado dentro de ArchiveProvider");
    return ctx;
  }

  function announce(text, assertive) {
    const id = assertive ? "aria-live-oracle" : "aria-live-polite";
    const el = document.getElementById(id);
    if (el) {
      el.textContent = "";
      setTimeout(() => {
        el.textContent = text;
      }, 60);
    }
  }

  window.ArchiveProvider = ArchiveProvider;
  window.useArchive = useArchive;
  window.announce = announce;
})();
