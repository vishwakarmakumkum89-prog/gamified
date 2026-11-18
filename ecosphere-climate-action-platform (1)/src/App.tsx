// @ts-nocheck
import { useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { EcoProvider, useEco } from "./lib/store";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import EcoBuddy from "./components/EcoBuddy";
import { SuccessBurst, ToastHost } from "./components/Feedback";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Calculator from "./pages/Calculator";
import Actions from "./pages/Actions";
import Challenges from "./pages/Challenges";
import Leaderboard from "./pages/Leaderboard";
import Impact from "./pages/Impact";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Studio from "./pages/Studio";

function ScrollTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }, [pathname, hash]);
  return null;
}

/** Wraps the app in studio chrome: UI zoom + focus mode (hides nav, footer and launcher for clean captures). */
function StudioFrame({ chrome, children }) {
  const zoom = chrome?.zoom || 1;
  const focus = !!chrome?.focus;
  return (
    <div className="flex min-h-screen flex-col" style={zoom !== 1 ? { zoom } : undefined}>
      {!focus && <Navbar />}
      <main className="flex-1">{children}</main>
      {!focus && <Footer />}
      {!focus && <EcoBuddy />}
      {focus && (
        <a
          href="#/studio"
          className="btn fixed bottom-4 left-4 z-[68] border border-[var(--c-line)] bg-[#0a2419] text-[#a8dcbc] shadow-[0_16px_30px_-16px_rgba(0,0,0,.8)]"
        >
          <span className="h-2 w-2 rounded-full bg-[#7fdcae]" /> Focus mode on
        </a>
      )}
    </div>
  );
}

function Shell() {
  const eco = useEco();
  return (
    <StudioFrame chrome={eco.studio}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/actions" element={<Actions />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/about" element={<About />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/login" element={<Auth mode="login" />} />
        <Route path="/signup" element={<Auth mode="signup" />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </StudioFrame>
  );
}

export default function App() {
  return (
    <EcoProvider>
      <HashRouter>
        <ScrollTop />
        <Shell />
        <ToastHost />
        <SuccessBurst />
      </HashRouter>
    </EcoProvider>
  );
}
