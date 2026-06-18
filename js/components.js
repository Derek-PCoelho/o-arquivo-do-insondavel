(function () {
  "use strict";
  const { useState, useEffect, useRef, useMemo, useCallback } = React;
  const useArchive = window.useArchive;
  const announce = window.announce;

  function Portal() {
    const { lang, setLang, data, authLogin, authRegister } = useArchive();
    const t = data.I18N[lang];

    const [step, setStep] = useState(1);
    const [authAction, setAuthAction] = useState("");
    const [authRole, setAuthRole] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleActionSelect = (action) => {
      setAuthAction(action);
      setStep(2);
      setError("");
    };

    const handleRoleSelect = (role) => {
      setAuthRole(role);
      setStep(3);
      setError("");
    };

    const handleBack = () => {
      if (step === 3) setStep(2);
      else if (step === 2) setStep(1);
      setError("");
    };

    const handleAuth = async (e) => {
      if (e) e.preventDefault();
      setError("");

      if (!username.trim() || !password.trim()) {
        return setError("Preencha as credenciais para prosseguir.");
      }

      try {
        if (authAction === "login") {
          await authLogin(username, password);
        } else {
          await authRegister(username, password, authRole);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    return (
      <main className="portal" id="portal-screen">
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            marginBottom: "0.4rem",
          }}
        >
          <LangSelector />
        </div>
        <h1 className="portal-title ancient">{t.portalTitle}</h1>
        <p className="portal-sub">{t.portalSub}</p>

        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            margin: "2rem auto 0",
            minHeight: "400px",
          }}
        >
          {/* ETAPA 1: ESCOLHER A AÇÃO */}
          {step === 1 && (
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                justifyContent: "center",
                flexWrap: "wrap",
                animation: "dropIn 0.4s ease forwards",
              }}
            >
              <button
                className="oracle-invoke"
                onClick={() => handleActionSelect("login")}
                style={{ minWidth: "220px" }}
              >
                Entrar no Arquivo
              </button>
              <button
                className="oracle-invoke"
                onClick={() => handleActionSelect("register")}
                style={{
                  background: "var(--glass-bg)",
                  color: "var(--text-clinical)",
                  border: "1px solid var(--glass-border)",
                  minWidth: "220px",
                }}
              >
                Novo Cadastro
              </button>
            </div>
          )}

          {/* ETAPA 2: ESCOLHER A NATUREZA */}
          {step === 2 && (
            <div style={{ animation: "dropIn 0.4s ease forwards" }}>
              <button
                className="btn-ghost"
                onClick={handleBack}
                style={{ marginBottom: "1.5rem" }}
              >
                ← Voltar
              </button>
              <h2
                className="ancient"
                style={{ textAlign: "center", marginBottom: "2rem" }}
              >
                Declarar Natureza
              </h2>
              <section
                className="portal-choices"
                aria-label={t.portalTitle}
                style={{ margin: "0 auto" }}
              >
                <article
                  className="glass skewed choice-card master breathing"
                  role="button"
                  onClick={() => handleRoleSelect("master")}
                >
                  <span className="role-icon" aria-hidden="true">
                    🜏
                  </span>
                  <h3>{t.master}</h3>
                  <span className="entity-name-orig">{t.masterRole}</span>
                </article>
                <article
                  className="glass skewed-alt choice-card player breathing"
                  role="button"
                  onClick={() => handleRoleSelect("player")}
                >
                  <span className="role-icon" aria-hidden="true">
                    👁
                  </span>
                  <h3>{t.player}</h3>
                  <span className="entity-name-orig">{t.playerRole}</span>
                </article>
              </section>
            </div>
          )}

          {/* ETAPA 3: CREDENCIAIS */}
          {step === 3 && (
            <div
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                animation: "dropIn 0.4s ease forwards",
              }}
            >
              <button
                className="btn-ghost"
                onClick={handleBack}
                style={{ marginBottom: "1.5rem" }}
              >
                ← Voltar
              </button>

              <div
                className="glass skewed"
                style={{
                  padding: "2.5rem 2rem",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "8px",
                  boxShadow: "var(--shadow-purple)",
                }}
              >
                <h2
                  className="ancient"
                  style={{ textAlign: "center", marginBottom: "1.5rem" }}
                >
                  {authAction === "login" ? "Identificação" : "Novo Pacto"}
                </h2>

                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                  <span
                    className={
                      "profile-badge " +
                      (authRole === "master" ? "master" : "player")
                    }
                  >
                    {authRole === "master"
                      ? "🜏 " + t.masterRole
                      : "👁 " + t.playerRole}
                  </span>
                </div>

                {/* Removido o 'required' dos inputs e adicionado 'noValidate' ao form para evitar o erro de regex/pattern do navegador */}
                <form onSubmit={handleAuth} noValidate>
                  <div
                    className="field"
                    style={{ marginBottom: "1.2rem", textAlign: "left" }}
                  >
                    <label>
                      Nome do{" "}
                      {authRole === "master" ? "Guardião" : "Investigador"}
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={{ width: "100%", marginTop: "0.4rem" }}
                    />
                  </div>
                  <div
                    className="field"
                    style={{ marginBottom: "1.5rem", textAlign: "left" }}
                  >
                    <label>Palavra-Chave (Senha)</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ width: "100%", marginTop: "0.4rem" }}
                    />
                  </div>

                  {error && (
                    <p
                      style={{
                        color: "var(--anomaly-red)",
                        fontSize: "0.85rem",
                        textAlign: "center",
                        marginBottom: "1.2rem",
                        fontFamily: "var(--font-clinical)",
                      }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="oracle-invoke"
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    {authAction === "login"
                      ? "Atravessar o Limiar"
                      : "Selar Permissões"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    );
  }

  function LangSelector() {
    const { lang, setLang, data } = useArchive();
    return (
      <select
        className="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        aria-label="Idioma / Language / Idioma"
      >
        {Object.keys(data.I18N).map((k) => (
          <option key={k} value={k}>
            {data.I18N[k].langName}
          </option>
        ))}
      </select>
    );
  }

  function Header() {
    const {
      t,
      route,
      setRoute,
      isMaster,
      isPlayer,
      logout,
      currentUser,
      audioEnabled,
      setAudioEnabled,
    } = useArchive();

    const tabs = [
      { id: "bestiary", label: t.navBestiary, show: true },
      { id: "oracle", label: t.navOracle, show: isMaster },
      { id: "sheet", label: t.navSheet, show: isPlayer },
    ].filter((x) => x.show);

    return (
      <header className="site-header" role="banner">
        <div className="brand">
          <span className="brand-title">⛧ {t.portalTitle}</span>
          <span className="brand-sub">{t.brandSub}</span>
        </div>

        <nav
          className="nav-tabs"
          role="navigation"
          aria-label="Navegação principal"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={"nav-tab" + (route === tab.id ? " active" : "")}
              onClick={() => setRoute(tab.id)}
              aria-current={route === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="header-controls">
          <button
            className="btn-ghost"
            style={{
              color: audioEnabled ? "var(--anomaly-red)" : "var(--text-dim)",
            }}
            onClick={() => setAudioEnabled(!audioEnabled)}
            aria-label="Sintonizar Frequência Abissal"
            title="Sintonizar Frequência Abissal"
          >
            {audioEnabled ? "⏚ Sinal Ativo" : "⏚ Rádio Mudo"}
          </button>

          {isMaster && <SanityMini />}
          <span className={"profile-badge " + (isMaster ? "master" : "player")}>
            {currentUser} ({isMaster ? "🜏" : "👁"})
          </span>
          <LangSelector />
          <button
            className="btn-ghost"
            onClick={logout}
            aria-label={t.changeProfile}
          >
            Sair
          </button>
        </div>
      </header>
    );
  }

  function SanityMini() {
    const { sanity, adjustSanity, t, sanityStage } = useArchive();
    const color =
      sanityStage === "madness" ? "var(--anomaly-red)" : "var(--accent-soft)";
    return (
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        role="group"
        aria-label={t.sanityLabel}
      >
        <button
          className="radial-btn minus"
          style={{ width: 26, height: 26, fontSize: "0.9rem" }}
          onClick={() => adjustSanity(-5)}
          aria-label="-5 sanidade"
        >
          −
        </button>
        <span
          className="mono"
          style={{
            fontSize: "0.78rem",
            color,
            minWidth: 60,
            textAlign: "center",
          }}
        >
          {t.sanityLabel.split(" ")[0]} {sanity}
        </span>
        <button
          className="radial-btn"
          style={{ width: 26, height: 26, fontSize: "0.9rem" }}
          onClick={() => adjustSanity(5)}
          aria-label="+5 sanidade"
        >
          +
        </button>
      </div>
    );
  }

  function Bestiary() {
    const { t, isMaster, lang, data } = useArchive();
    const [visualQuery, setVisualQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("");
    const [isDecoding, setIsDecoding] = useState(false);

    useEffect(() => {
      setIsDecoding(true);
      const timer = setTimeout(() => {
        setActiveFilter(visualQuery);
        setIsDecoding(false);
      }, 400);

      return () => clearTimeout(timer);
    }, [visualQuery]);

    const list = useMemo(() => {
      const q = activeFilter.trim().toLowerCase();
      if (!q) return data.BESTIARY;

      return data.BESTIARY.filter((e) => {
        const hay = [e.name[lang], e.original, e.lore[lang]]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }, [activeFilter, lang, data.BESTIARY]);

    return (
      <section
        className="app-shell"
        id="bestiary"
        aria-labelledby="bestiary-title"
      >
        <div className="section-head">
          <h2 id="bestiary-title">{t.bestiaryTitle}</h2>
          <p>{isMaster ? t.bestiaryDescMaster : t.bestiaryDescPlayer}</p>
        </div>

        <div className="toolbar">
          <input
            className="search-box mono"
            type="search"
            value={visualQuery}
            onChange={(e) => setVisualQuery(e.target.value)}
            placeholder={t.search}
            aria-label={t.search}
          />
          <span
            className="mono"
            style={{ color: "var(--text-dim)", fontSize: "0.74rem" }}
          >
            {list.length} / {data.BESTIARY.length}
          </span>
        </div>

        {isDecoding ? (
          <div className="loading-shell" aria-live="polite">
            [ DECIFRANDO O NECRONOMICON... ]
          </div>
        ) : (
          <div className="bestiary-grid">
            {list.map((e) => (
              <EntityCard key={e.id} entity={e} />
            ))}
          </div>
        )}
      </section>
    );
  }

  function EntityCard({ entity }) {
    const { t, isMaster, lang } = useArchive();
    const e = entity;
    return (
      <article className="glass entity-card" aria-label={e.name[lang]}>
        <div className="entity-visual">
          <img
            className="creature-art"
            src={e.art}
            alt={"Ilustração: " + e.name[lang]}
            loading="lazy"
          />
          <span className="entity-cr-tag">CR {e.stats.cr}</span>
        </div>
        <div className="entity-body">
          <h3 className="entity-name">{e.name[lang]}</h3>
          <span className="entity-name-orig">{e.original}</span>

          <p className="entity-lore">{e.lore[lang]}</p>

          {isMaster ? (
            <div className="vital-stats" aria-label={t.vitalStats}>
              <div className="vital-stats-title">{t.vitalStats}</div>
              <div className="stat-row">
                <span className="label">{t.cr}</span>
                <span className="value">{e.stats.cr}</span>
              </div>
              <div className="stat-row">
                <span className="label">{t.hp}</span>
                <span className="value">{e.stats.hp}</span>
              </div>
              <div className="stat-row">
                <span className="label">{t.ca}</span>
                <span className="value">{e.stats.ca}</span>
              </div>
              <div className="stat-row">
                <span className="label">{t.attack}</span>
                <span className="value">{e.attack[lang]}</span>
              </div>
              <div className="stat-row">
                <span className="label">{e.special.kind}</span>
                <span className="value stat-danger">{e.special[lang]}</span>
              </div>
            </div>
          ) : (
            <div className="vital-locked" aria-label={t.locked}>
              <div className="blurred" aria-hidden="true">
                ▓▓▓▓ ███
                <br />
                ▓▓▓ ████ ██
                <br />
                ██ ▓▓▓▓▓ ███
                <br />
                ████ ▓▓ █████
              </div>
              <div className="lock-overlay">
                <span className="lock-icon" aria-hidden="true">
                  🔒
                </span>
                <strong style={{ letterSpacing: "0.12em" }}>{t.locked}</strong>
                <span>{t.lockedSub}</span>
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }

  function Oracle() {
    const { t, isMaster, lang, data } = useArchive();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [famine, setFamine] = useState(false);

    if (!isMaster) {
      return (
        <section
          className="app-shell access-denied"
          aria-labelledby="denied-title"
        >
          <span className="lock-big" aria-hidden="true">
            🔒
          </span>
          <h2 id="denied-title">{t.accessDenied}</h2>
          <p>{t.accessDeniedMsg}</p>
        </section>
      );
    }

    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const consult = useCallback(() => {
      if (loading) return;
      setLoading(true);
      setResult(null);

      setTimeout(() => {
        const geo = rand(data.ORACLE.geo);
        const threat = rand(data.BESTIARY);
        const insanity = rand(data.ORACLE.insanity);

        const mult = famine ? 2 : 1;
        const composed = {
          geo,
          threat: {
            ...threat,
            effHp: threat.stats.hp * mult,
            effCr: famine ? threat.stats.cr + 4 : threat.stats.cr,
          },
          insanity,
          famine,
        };
        setResult(composed);
        setLoading(false);

        announce(
          `${t.axisGeo}: ${geo[lang]}. ${t.axisThreat}: ${threat.name[lang]}. ${t.axisInsanity}: ${insanity[lang].t}.`,
          true,
        );
      }, 1500);
    }, [loading, famine, lang, data, t]);

    return (
      <section
        className="app-shell oracle-wrap"
        id="oracle"
        aria-labelledby="oracle-title"
      >
        <div className="section-head" style={{ textAlign: "center" }}>
          <h2 id="oracle-title">{t.oracleTitle}</h2>
          <p style={{ margin: "0.5rem auto 0" }}>{t.oracleDesc}</p>
        </div>

        <div
          className="oracle-toggles"
          role="group"
          aria-label={t.catastrophic}
        >
          <label className={"toggle-switch" + (famine ? " on" : "")}>
            <input
              type="checkbox"
              checked={famine}
              onChange={(e) => setFamine(e.target.checked)}
            />
            🩸 {t.famine}
          </label>
        </div>

        <button className="oracle-invoke" onClick={consult} disabled={loading}>
          {loading ? t.invoking : "◈ " + t.invoke}
        </button>

        {loading && (
          <div className="oracle-veil" aria-hidden="true">
            <span className="veil-text">{t.invoking}</span>
          </div>
        )}

        {result ? (
          <div className="oracle-result" key={Date.now()}>
            <article className="glass skewed oracle-card dropped">
              <span className="axis-label">{t.axisGeo}</span>
              <h3 className="axis-title">{result.geo[lang]}</h3>
            </article>

            <article className="glass skewed-alt oracle-card dropped">
              <span className="axis-label">{t.axisThreat}</span>
              <h3 className="axis-title">{result.threat.name[lang]}</h3>
              <img
                className="axis-art"
                src={result.threat.art}
                alt={result.threat.name[lang]}
              />
              <div className="axis-desc" style={{ marginTop: "0.6rem" }}>
                <div className="stat-row">
                  <span className="label">{t.cr}</span>
                  <span className="value">
                    {result.threat.effCr}
                    {result.famine ? " ☠" : ""}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="label">{t.hp}</span>
                  <span className="value stat-danger">
                    {result.threat.effHp}
                  </span>
                </div>
                <div className="stat-row">
                  <span className="label">{t.ca}</span>
                  <span className="value">{result.threat.stats.ca}</span>
                </div>
                <div className="stat-row">
                  <span className="label">{t.attack}</span>
                  <span className="value">{result.threat.attack[lang]}</span>
                </div>
              </div>
            </article>

            <article className="glass skewed oracle-card dropped insanity">
              <span className="axis-label">{t.axisInsanity}</span>
              <h3 className="axis-title">{result.insanity[lang].t}</h3>
              <p className="axis-desc">{result.insanity[lang].d}</p>
            </article>
          </div>
        ) : (
          !loading && (
            <p
              className="mono"
              style={{ color: "var(--text-dim)", marginTop: "2rem" }}
            >
              {t.noResult}
            </p>
          )
        )}
      </section>
    );
  }

  const SKILL_KEYS = ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7"];

  function defaultSheet() {
    return {
      identity: "",
      occupation: "",
      age: "",
      origin: "",
      attrs: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      maxHp: 20,
      sanity: 80,
      inventory: "",
      skills: {
        s0: false,
        s1: false,
        s2: false,
        s3: false,
        s4: false,
        s5: false,
        s6: false,
        s7: false,
      },
    };
  }

  function InvestigatorSheet() {
    const {
      t,
      isPlayer,
      lang,
      Store,
      STORAGE_KEYS,
      adjustSanity,
      currentUser,
    } = useArchive();
    const [sheet, setSheet] = useState(null);
    const [saved, setSaved] = useState(false);
    const saveTimer = useRef(null);
    const [rollState, setRollState] = useState({
      active: false,
      skill: null,
      result: null,
    });

    useEffect(() => {
      Store.read(STORAGE_KEYS.sheet, currentUser, defaultSheet()).then(
        (data) => {
          setSheet(
            data && typeof data === "object"
              ? { ...defaultSheet(), ...data }
              : defaultSheet(),
          );
        },
      );
    }, [Store, STORAGE_KEYS.sheet, currentUser]);

    useEffect(() => {
      if (sheet) {
        Store.write(STORAGE_KEYS.sheet, currentUser, sheet);
        setSaved(true);
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => setSaved(false), 1400);
      }
      return () => clearTimeout(saveTimer.current);
    }, [sheet, Store, STORAGE_KEYS.sheet, currentUser]);

    if (!isPlayer) {
      return (
        <section
          className="app-shell access-denied"
          aria-labelledby="denied-sheet"
        >
          <span className="lock-big" aria-hidden="true">
            🜏
          </span>
          <h2 id="denied-sheet">{t.accessDenied}</h2>
          <p>{t.sheetDeniedMsg}</p>
        </section>
      );
    }

    if (!sheet)
      return (
        <div className="loading-shell">
          [ RECUPERANDO FICHA DE {currentUser}... ]
        </div>
      );

    const setField = (key, val) => setSheet((s) => ({ ...s, [key]: val }));
    const setAttr = (key, val) =>
      setSheet((s) => ({ ...s, attrs: { ...s.attrs, [key]: val } }));
    const stepAttr = (key, d) =>
      setSheet((s) => ({
        ...s,
        attrs: {
          ...s.attrs,
          [key]: Math.max(1, Math.min(20, (parseInt(s.attrs[key]) || 0) + d)),
        },
      }));
    const stepHp = (d) =>
      setSheet((s) => ({ ...s, maxHp: Math.max(0, s.maxHp + d) }));
    const stepSan = (d) =>
      setSheet((s) => ({
        ...s,
        sanity: Math.max(0, Math.min(100, s.sanity + d)),
      }));
    const toggleSkill = (k) =>
      setSheet((s) => ({ ...s, skills: { ...s.skills, [k]: !s.skills[k] } }));

    const handleRoll = (skillKey) => {
      if (rollState.active) return;

      setRollState({ active: true, skill: skillKey, result: 0 });

      let counter = 0;
      const interval = setInterval(() => {
        setRollState((prev) => ({
          ...prev,
          result: Math.floor(Math.random() * 100) + 1,
        }));
        counter++;

        if (counter > 20) {
          clearInterval(interval);
          const finalResult = Math.floor(Math.random() * 100) + 1;
          setRollState({ active: false, skill: skillKey, result: finalResult });

          if (finalResult >= 95) {
            adjustSanity(-1);
            announce(`Falha Crítica: ${finalResult}. Sanidade drenada.`, true);
          } else if (finalResult <= 5) {
            announce(`Sucesso Crítico: ${finalResult}.`, true);
          }
        }
      }, 50);
    };

    const mod = (v) => {
      const m = Math.floor(((parseInt(v) || 0) - 10) / 2);
      return (m >= 0 ? "+" : "") + m;
    };
    const attrLabels = {
      str: t.str,
      dex: t.dex,
      con: t.con,
      int: t.int,
      wis: t.wis,
      cha: t.cha,
    };

    return (
      <section className="app-shell" id="sheet" aria-labelledby="sheet-title">
        <div className="section-head">
          <h2 id="sheet-title">{t.sheetTitle}</h2>
          <p>
            {t.sheetDesc}{" "}
            <span className={"save-flash" + (saved ? " show" : "")}>
              {t.saved}
            </span>
          </p>
        </div>

        <div className="sheet-grid">
          <div className="glass skewed sheet-header">
            <div className="field c6">
              <label htmlFor="f-id">{t.identity}</label>
              <input
                id="f-id"
                value={sheet.identity}
                onChange={(e) => setField("identity", e.target.value)}
              />
            </div>
            <div className="field c6">
              <label htmlFor="f-occ">{t.occupation}</label>
              <input
                id="f-occ"
                value={sheet.occupation}
                onChange={(e) => setField("occupation", e.target.value)}
              />
            </div>
            <div className="field c6">
              <label htmlFor="f-age">{t.age}</label>
              <input
                id="f-age"
                type="number"
                value={sheet.age}
                onChange={(e) => setField("age", e.target.value)}
              />
            </div>
            <div className="field c6">
              <label htmlFor="f-org">{t.origin}</label>
              <input
                id="f-org"
                value={sheet.origin}
                onChange={(e) => setField("origin", e.target.value)}
              />
            </div>
          </div>

          <div className="glass skewed-alt sheet-attrs">
            <h3 className="panel-title">{t.attributes}</h3>
            {Object.keys(attrLabels).map((k) => (
              <div className="attr-box" key={k}>
                <span className="attr-name">{attrLabels[k]}</span>
                <div className="attr-controls">
                  <button
                    className="radial-btn minus"
                    style={{ width: 28, height: 28, fontSize: "1rem" }}
                    onClick={() => stepAttr(k, -1)}
                    aria-label={"-1 " + attrLabels[k]}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={sheet.attrs[k]}
                    onChange={(e) => setAttr(k, e.target.value)}
                    aria-label={attrLabels[k]}
                  />
                  <button
                    className="radial-btn"
                    style={{ width: 28, height: 28, fontSize: "1rem" }}
                    onClick={() => stepAttr(k, 1)}
                    aria-label={"+1 " + attrLabels[k]}
                  >
                    +
                  </button>
                  <span className="mod-tag">{mod(sheet.attrs[k])}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="glass skewed sheet-vital">
            <h3 className="panel-title">{t.vitality}</h3>
            <div className="radials">
              <Radial
                label={t.maxHp}
                value={sheet.maxHp}
                max={100}
                color="var(--biolum-green)"
                onPlus={() => stepHp(1)}
                onMinus={() => stepHp(-1)}
              />
              <Radial
                label={t.curSanity}
                value={sheet.sanity}
                max={100}
                color={
                  sheet.sanity <= 25
                    ? "var(--anomaly-red)"
                    : "var(--biolum-purple)"
                }
                onPlus={() => stepSan(1)}
                onMinus={() => stepSan(-1)}
              />
            </div>
          </div>

          <div className="glass skewed-alt sheet-arsenal">
            <h3 className="panel-title">{t.arsenal}</h3>
            <div className="field c12">
              <label htmlFor="f-inv">{t.inventory}</label>
              <textarea
                id="f-inv"
                value={sheet.inventory}
                onChange={(e) => setField("inventory", e.target.value)}
                rows={4}
              ></textarea>
            </div>
            <div style={{ marginTop: "1rem" }}>
              <span className="vital-stats-title">{t.skills}</span>
              <div className="skill-list">
                {SKILL_KEYS.map((k, i) => {
                  const isRollingThis = rollState.skill === k;
                  const showResult =
                    !rollState.active &&
                    rollState.skill === k &&
                    rollState.result;

                  let resultColor = "var(--text-clinical)";
                  if (showResult && rollState.result <= 5)
                    resultColor = "var(--biolum-green)";
                  if (showResult && rollState.result >= 95)
                    resultColor = "var(--anomaly-red)";

                  return (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <label
                        className={
                          "skill-item" + (sheet.skills[k] ? " checked" : "")
                        }
                        style={{ flex: 1 }}
                      >
                        <input
                          type="checkbox"
                          checked={sheet.skills[k]}
                          onChange={() => toggleSkill(k)}
                        />
                        {t.skillList[i]}
                      </label>

                      <button
                        className="btn-ghost"
                        style={{
                          padding: "0.2rem 0.5rem",
                          fontSize: "0.65rem",
                        }}
                        onClick={() => handleRoll(k)}
                        disabled={rollState.active}
                      >
                        D100
                      </button>

                      <span
                        className="mono"
                        style={{
                          width: "25px",
                          textAlign: "center",
                          color: resultColor,
                          fontSize: "0.8rem",
                        }}
                      >
                        {isRollingThis
                          ? rollState.result
                          : showResult
                            ? rollState.result
                            : "--"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
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
  function Radial({ label, value, max, color, onPlus, onMinus }) {
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    const dialStyle = {
      background: `radial-gradient(closest-side, var(--abyss-edge) 72%, transparent 73% 100%),
                   conic-gradient(${color} ${pct}%, rgba(255,255,255,0.06) ${pct}% 100%)`,
      boxShadow: `0 0 22px ${color}`,
    };
    return (
      <div className="radial" role="group" aria-label={label}>
        <div className="radial-dial" style={dialStyle}>
          <span className="dial-value" style={{ color }}>
            {value}
          </span>
        </div>
        <span className="radial-label">{label}</span>
        <div className="radial-buttons">
          <button
            className="radial-btn minus"
            onClick={onMinus}
            aria-label={"-1 " + label}
          >
            −
          </button>
          <button
            className="radial-btn"
            onClick={onPlus}
            aria-label={"+1 " + label}
          >
            +
          </button>
        </div>
      </div>
    );
  }

  function Footer() {
    return (
      <footer className="footer" role="contentinfo">
        <p>
          <strong>O Arquivo do Insondável</strong> — Avaliação III · BGTech
          Experience
        </p>
        <p>
          Engenharia Front-End: <strong>Derek Pinheiro Coelho Batista</strong> ·
          Centro Universitário Farias Brito (FBUni) · Fortaleza, CE
        </p>
        <p style={{ opacity: 0.6 }}>
          React · API de Contexto Global · Web Storage · CSS · HTML · JS
        </p>
      </footer>
    );
  }

  window.ArchiveComponents = {
    Portal,
    Header,
    Bestiary,
    Oracle,
    InvestigatorSheet,
    Footer,
  };
})();
