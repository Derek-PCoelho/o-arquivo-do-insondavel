(function () {
  "use strict";
  const { useEffect } = React;
  const useArchive = window.useArchive;
  const { Portal, Header, Bestiary, Oracle, InvestigatorSheet, Footer } =
    window.ArchiveComponents;

  function Router() {
    const { profile, route, isMaster, isPlayer } = useArchive();

    if (!profile) return <Portal />;

    let view;
    if (route === "oracle" && isMaster) view = <Oracle />;
    else if (route === "sheet" && isPlayer) view = <InvestigatorSheet />;
    else if (route === "oracle" && !isMaster) view = <Oracle />;
    else if (route === "sheet" && !isPlayer) view = <InvestigatorSheet />;
    else view = <Bestiary />;

    return (
      <React.Fragment>
        <Header />
        {view}
        <Footer />
      </React.Fragment>
    );
  }

  function App() {
    useEffect(() => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      const handler = () => {
        const ev = new Event("storage");
        window.dispatchEvent(ev);
      };
      if (mq.addEventListener) mq.addEventListener("change", handler);
      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", handler);
      };
    }, []);

    return (
      <window.ArchiveProvider>
        <Router />
      </window.ArchiveProvider>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
})();
