import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Clapperboard,
  Copy,
  Eye,
  Gauge,
  ListChecks,
  Moon,
  Pause,
  Play,
  RotateCcw,
  ScrollText,
  SkipBack,
  SkipForward,
  Sun,
  Type,
  Video,
} from "lucide-react";
import { Eyebrow } from "../components/ui";
import { useEco } from "../lib/store";

/* ------------------------------------------------------------------
   The shot list is the actual edit plan: timings drive the teleprompter,
   voice-over timings are measured against them, captions become SRT.
------------------------------------------------------------------- */
const SHOTS = [
  {
    screen: "Home · hero",
    dur: 10,
    action: "No clicks. Let the page breathe, then push in slowly.",
    motion: "Zoom 100 → 108% over 10s",
    caption: "A tonne and a half of CO₂",
    vo: "Before I show you a single screen, one number. A tonne and a half. That is what an average person can cut in a year without giving up anything they love. The problem is not that people do not care. It is that climate action is invisible.",
  },
  {
    screen: "Home · live chip + planet",
    dur: 16,
    action: "Hover the live chip, then sweep the floating action nodes.",
    motion: "Static, subtle parallax on hover",
    caption: "EcoSphere — small actions, made visible",
    vo: "EcoSphere makes it visible. This is the entry point, and that pill at the top is live. It is reading this device's own total. The planet is original vector artwork: forests, turbines, a solar array, commuters, and the six families of actions we track.",
  },
  {
    screen: "Home · stats band",
    dur: 14,
    action: "Scroll to the three counters, then hover the ticker twice.",
    motion: "Scroll at half speed, hold each counter",
    caption: "1.2M+ actions · 850K+ kg CO₂e · 75K+ champions",
    vo: "Below the fold, the community, no login needed to see it. And that ticker is individual actions stacking into a shared ledger. Jonas in Freiburg, one and a half kilos. Marta in Sao Paulo, six point eight.",
  },
  {
    screen: "Calculator · inputs",
    dur: 20,
    action: "Drag daily distance 14 to 40 km. Watch the right rail move. Then switch mode to bike and back.",
    motion: "Tighten to the live estimate card while dragging",
    caption: "Live estimate updates while you drag",
    vo: "Most calculators end at a guilt number. Ours starts there. Watch the right side while I move the slider. No submit, no loading. Four buckets, weighted from published factors: a hundred and ninety two grams per kilometre in a car, sixty two for a bus passenger, four hundred and twenty per kilowatt hour on an average grid.",
  },
  {
    screen: "Calculator · result",
    dur: 18,
    action: "Click Calculate, scroll to the donut, land on the green callout.",
    motion: "Stop on 'biggest opportunity' for 3s",
    caption: "Your biggest opportunity: Transportation",
    vo: "Three point eight tonnes a year, four slices, and one callout that matters. Your biggest opportunity is transportation. And immediately below it, the three actions in our library that hit that slice hardest, ranked by kilograms. A measurement that ends with good luck is a survey. A measurement that ends with a button is a product.",
  },
  {
    screen: "Climate Actions",
    dur: 22,
    action: "Type 'bike' in search, filter by Energy, then click Complete Action. Click it again for the daily cap.",
    motion: "Zoom to the card on click, then to the toast",
    caption: "One click: +70 points · 2.1 kg CO₂e",
    vo: "Twenty six actions, six categories, every card carrying an estimate, a difficulty, a time cost and points. I click. Toast, burst, points, kilograms. And if I click again it tells me it counts once a day, because honest numbers beat streak maximising.",
  },
  {
    screen: "Dashboard",
    dur: 24,
    action: "Trace the four stat cards, hover a chart bar, scroll to impact, then badges.",
    motion: "One slow scroll, no jump cuts inside this shot",
    caption: "Same state, four screens",
    vo: "Back on the dashboard, that bar grew. This is the whole argument of the product in one screen: the button and the dashboard are the same state. Weekly savings, a fourteen day activity ledger, water and waste in units people actually feel, and badges with their own progress bars. That is not a badge shop. That is a receipt.",
  },
  {
    screen: "Daily challenge · streak",
    dur: 14,
    action: "Point at the seven squares, hover one, then show the Skip button.",
    motion: "Hold on the streak strip",
    caption: "7-day streak · miss one day, the flame resets",
    vo: "One item, one day, thirty points. Beside it, seven squares, the days I kept. Miss a day and the flame resets, but your badges never do, because you keep what you earned.",
  },
  {
    screen: "Challenges",
    dur: 12,
    action: "Join Zero-Waste Week, then click Log day once.",
    motion: "Show the button state change",
    caption: "40 points a day · 700 at the finish",
    vo: "Six longer campaigns. Join one and a log day button appears: forty points per day, the full reward at the finish line, participants, days remaining, progress bar. Nothing here is decorative.",
  },
  {
    screen: "Leaderboard → Impact",
    dur: 14,
    action: "Flip Global to Friends, then cut to Impact and click a globe pin.",
    motion: "Two shots, hard cut on the tab click",
    caption: "96 countries · 1,240 cities",
    vo: "Rankings are friendly: points decide, CO2 breaks ties, my row is highlighted. And this is the slide a partner remembers. Four counters from one shared ledger, a rotating globe of live city activity, and growth by country.",
  },
  {
    screen: "EcoBuddy",
    dur: 12,
    action: "Open the launcher, type the commute line, let it reply fully.",
    motion: "Crop to the chat panel",
    caption: "It reads your data, not the weather",
    vo: "The assistant reads what I measured. I tell it an eight kilometre car commute and it answers with the swap, the kilograms, and the challenge that makes it a habit. Rule based and transparent, so a demo never invents a statistic.",
  },
  {
    screen: "Profile → responsive → close",
    dur: 12,
    action: "Show badges and level ring, squeeze the window to phone width, land back on the hero.",
    motion: "End on the headline, hold 2s",
    vo: "Everything persists on device, no backend, no keys, dark or light, any screen size. Small actions, made visible, become a different kind of normal.",
  },
];

const CHECKLIST = [
  ["Browser", "One clean window, no extensions in the frame, bookmarks bar hidden (Cmd/Ctrl+Shift+B)."],
  ["Browser zoom", "110% so dashboard figures read on a projector or a phone feed."],
  ["Theme", "Light mode for projectors, dark mode for social clips. Pick one, never switch mid-take."],
  ["Data state", "Studio presets below: Blank before the first action, Full for the dashboard scenes."],
  ["Focus mode", "Turn it on for hero and page beauty shots, off whenever the navbar must be visible."],
  ["Cursor", "Record at 1x speed and enlarge the cursor in the editor; do not wiggle it while talking."],
  ["Sound", "Headphones on, mic 6 inches away, room tone recorded for 10 seconds for cleanup."],
  ["Capture", "OBS or Screenity at 1920x1080, 60 fps, hardware encoding, CRF 18-20."],
  ["Retakes", "Record each shot as its own clip. Editing five retakes beats one perfect take."],
  ["Accessibility", "Burn in captions. Most feeds autoplay muted; captions carry the video."],
];

const SPECS = [
  ["Master (YouTube / presentation)", "1920×1080 · 60 fps · H.264 · 12-16 Mbps", "2:45 – 3:15"],
  ["Vertical cut (Reels / Shorts)", "1080×1920 · 30 fps · crop to the acting area", "0:30 – 0:45"],
  ["Screen-only GIF (docs/README)", "1280×720 · 20 fps · 6-10 s loops", "3 loops max"],
  ["Audio", "48 kHz, mono VO, -16 LUFS, music ducked 12 dB under speech", "—"],
  ["Captions", "SRT burned in + sidecar file, 42 chars per line max", "—"],
  ["Thumbnail", "Dashboard chart + '42.6 kg saved' badge, 1280×720", "—"],
];

const pad = (n) => String(Math.floor(n)).padStart(2, "0");
const tc = (s) => `${pad(s / 60)}:${pad(s % 60)}`;
const words = (t) => t.trim().split(/\s+/).length;

export default function Studio() {
  const eco = useEco();
  const [tab, setTab] = useState("shots");
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState([]);
  const timer = useRef(null);

  const starts = useMemo(() => {
    let acc = 0;
    return SHOTS.map((s) => {
      const start = acc;
      acc += s.dur;
      return start;
    });
  }, []);
  const total = starts[starts.length - 1] + SHOTS[SHOTS.length - 1].dur;
  const current = Math.max(0, starts.filter((s) => elapsed >= s).length - 1);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => setElapsed((e) => Math.min(total + 4, +(e + 0.1).toFixed(1))), 100);
    return () => clearInterval(timer.current);
  }, [playing, total]);

  useEffect(() => {
    if (count <= 0) return;
    const id = setTimeout(() => setCount((c) => c - 1), 800);
    return () => clearTimeout(id);
  }, [count]);

  const jump = useCallback((i) => setElapsed(starts[Math.max(0, Math.min(SHOTS.length - 1, i))]), [starts]);

  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      if (e.code === "Space") {
        e.preventDefault();
        setPlaying((p) => !p);
      }
      if (e.key === "ArrowRight") jump(current + 1);
      if (e.key === "ArrowLeft") jump(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, jump]);

  const copy = (text, label) => {
    const fallback = () => eco.toast({ tone: "info", icon: "📋", title: "Clipboard blocked", body: "Select the text on screen and copy it manually." });
    try {
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => eco.toast({ tone: "success", icon: "📋", title: label || "Copied", body: "Paste it into your editor or notes." }),
          fallback
        );
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok
          ? eco.toast({ tone: "success", icon: "📋", title: label || "Copied", body: "Paste it into your editor or notes." })
          : fallback();
      }
    } catch {
      fallback();
    }
  };

  const srt = SHOTS.map((s, i) => {
    const a = starts[i];
    const b = starts[i] + s.dur;
    const stamp = (sec) => `00:${pad(sec / 60)}:${pad(sec % 60)},000`;
    return `${i + 1}\n${stamp(a)} --> ${stamp(b)}\n${s.caption}\n`;
  }).join("\n");

  const fullVo = SHOTS.map((s, i) => `[${tc(starts[i])} · ${s.screen}]\n${s.vo}`).join("\n\n");

  return (
    <section className="relative overflow-hidden grad-dark-eco py-12 min-h-screen text-[#dcefe2]">
      <div className="pointer-events-none absolute inset-0 topo opacity-25" />
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full blur-3xl" style={{ background: "radial-gradient(circle, rgba(43,159,214,.3), transparent 66%)" }} />

      <div className="relative mx-auto max-w-[1240px] px-5 sm:px-6">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="chip bg-white/12 uppercase text-[#a8dcbc]">
              <Clapperboard size={12} /> Studio · recording deck
            </span>
            <h1 className="font-display mt-4 text-[clamp(2rem,5.2vw,3.3rem)] font-semibold leading-[1.02] text-white">
              How It Works — film it in twelve shots.
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[#a9c9b8]">
              The timings below run a teleprompter, the voice-over is measured so it fits its shot, and the captions
              export as SRT. Presets re-seed the app so every take starts from the right state.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-3">
              <span className={`h-2.5 w-2.5 rounded-full ${playing ? "bg-[#f0605c]" : "bg-white/25"}`} style={{ animation: playing ? "pulseRing 1.4s ease-out infinite" : "none" }} />
              <span className="font-mono text-[22px] font-bold text-white">{tc(elapsed)}</span>
              <span className="font-mono text-[12px] text-[#8fb6a1]">/ {tc(total)}</span>
            </span>
            <button onClick={() => setPlaying((p) => !p)} className="btn bg-[#7fdcae] font-bold text-[#062018] hover:bg-[#96e9bd]">
              {playing ? <Pause size={16} /> : <Play size={16} />} {playing ? "Pause" : "Roll"}
            </button>
          </div>
        </div>

        {/* transport + countdown */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="card overflow-hidden !border-white/12 bg-white/[.06]">
            <div className="flex flex-wrap items-center gap-3 p-3.5">
              <button onClick={() => jump(current - 1)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-[#cfe6d8]" aria-label="Previous shot">
                <SkipBack size={15} />
              </button>
              <button onClick={() => jump(current + 1)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-[#cfe6d8]" aria-label="Next shot">
                <SkipForward size={15} />
              </button>
              <button onClick={() => { setElapsed(0); setPlaying(false); }} className="grid h-9 w-9 place-items-center rounded-xl border border-white/15 text-[#cfe6d8]" aria-label="Reset to zero">
                <RotateCcw size={15} />
              </button>
              <span className="mx-1 hidden h-6 w-px bg-white/15 sm:block" />
              <button onClick={() => setCount(3)} className="btn border border-white/18 bg-white/5 text-[#dcefe2] hover:bg-white/12">
                <Camera size={15} /> 3 · 2 · 1 cue
              </button>
              <span className="text-[11.5px] text-[#8fb6a1]">Space = play/pause · ← → = prev/next shot</span>
              <span className="ml-auto font-mono text-[11.5px] text-[#8fb6a1]">
                target 3:00 · {total > 180 ? `+${total - 180}s` : `${total - 180}s`}
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10">
              <div className="h-full" style={{ width: `${Math.min(100, (elapsed / total) * 100)}%`, background: "linear-gradient(90deg,#7fdcae,#7cc7ef)", transition: "width .12s linear" }} />
            </div>
          </div>

          <div className="card grid grid-cols-2 gap-3 p-4 !border-white/12 bg-white/[.06] sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {[
              { k: "clean", l: "Blank profile", d: "0 pts · empty charts" },
              { k: "demo", l: "Demo state", d: "1,850 pts · 12-day streak" },
              { k: "rich", l: "Full profile", d: "3 badges · live challenges" },
            ].map((p) => (
              <button key={p.k} onClick={() => eco.applyPreset(p.k)} className="col-span-1 rounded-2xl border border-white/15 bg-white/5 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7fdcae]">
                <span className="block text-[12.5px] font-bold text-white">{p.l}</span>
                <span className="mt-1 block text-[11px] leading-snug text-[#8fb6a1]">{p.d}</span>
              </button>
            ))}
            <button
              onClick={() => eco.setStudio({ focus: !eco.studio?.focus })}
              className={`col-span-1 rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 ${eco.studio?.focus ? "border-[#7fdcae] bg-[#1c5d45]" : "border-white/15 bg-white/5 hover:border-[#7fdcae]"}`}
            >
              <span className="flex items-center gap-1.5 text-[12.5px] font-bold text-white">
                <Eye size={13} /> {eco.studio?.focus ? "Focus: on" : "Focus mode"}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-[#8fb6a1]">Hides nav, footer, launcher</span>
            </button>
          </div>
        </div>

        {count > 0 && (
          <div className="pointer-events-none fixed inset-0 z-[80] grid place-items-center">
            <span key={count} className="font-display animate-pop text-[clamp(6rem,22vw,14rem)] font-semibold text-white/90 drop-shadow-[0_18px_50px_rgba(0,0,0,.6)]">
              {count}
            </span>
          </div>
        )}

        {/* tabs */}
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          {[
            { id: "shots", label: "Shot list", Icon: Video },
            { id: "vo", label: "Voice-over", Icon: ScrollText },
            { id: "prep", label: "Prep checklist", Icon: ListChecks },
            { id: "specs", label: "Capture specs", Icon: Gauge },
            { id: "set", label: "Scene setup", Icon: Type },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-[12.5px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                tab === t.id ? "border-[#7fdcae] bg-[#1c5d45] text-white" : "border-white/15 bg-white/5 text-[#a9c9b8]"
              }`}
            >
              <t.Icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {/* ------- SHOT LIST ------- */}
        {tab === "shots" && (
          <ol className="mt-6 space-y-3">
            {SHOTS.map((s, i) => {
              const active = i === current;
              const past = elapsed >= starts[i] + s.dur;
              const shotProg = active ? Math.min(1, (elapsed - starts[i]) / s.dur) : past ? 1 : 0;
              const est = Math.round(words(s.vo) / 2.4);
              const fits = est <= s.dur;
              return (
                <li key={s.screen}>
                  <button
                    onClick={() => jump(i)}
                    className={`card w-full overflow-hidden text-left transition-all duration-300 !border-white/12 ${active ? "ring-2 ring-[#7fdcae]" : "hover:border-[#7fdcae]/50"}`}
                    style={{ background: active ? "rgba(28,93,69,.42)" : "rgba(255,255,255,.05)" }}
                  >
                    <div className="grid gap-4 p-4 sm:grid-cols-[86px_1fr_auto] sm:items-start">
                      <span className="font-mono">
                        <span className={`block text-[17px] font-bold ${active ? "text-[#7fdcae]" : "text-white/80"}`}>{tc(starts[i])}</span>
                        <span className="block text-[11px] text-[#8fb6a1]">{s.dur}s · #{i + 1}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[16.5px] font-semibold text-white">{s.screen}</span>
                        <span className="mt-1 block text-[12.5px] leading-relaxed text-[#cfe6d8]">
                          <strong className="font-bold text-[#7fdcae]">Click: </strong>
                          {s.action}
                        </span>
                        <span className="mt-1.5 block text-[12px] leading-relaxed text-[#a9c9b8]">
                          <strong className="font-bold text-[#7cc7ef]">VO: </strong>
                          {s.vo}
                        </span>
                      </span>
                      <span className="flex shrink-0 flex-col items-end gap-1.5 sm:items-end">
                        <span className="chip bg-white/8 text-[#8fb6a1]">{s.motion}</span>
                        <span className={`font-mono text-[11px] ${fits ? "text-[#7fdcae]" : "text-[#f0b25c]"}`}>
                          reads ~{est}s / {s.dur}s {fits ? "✓" : "· tight"}
                        </span>
                        <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#8fb6a1]">cap: {s.caption}</span>
                      </span>
                    </div>
                    <span className="block h-1 w-full bg-white/8">
                      <span className="block h-full" style={{ width: `${shotProg * 100}%`, background: "linear-gradient(90deg,#7fdcae,#7cc7ef)", transition: "width .12s linear" }} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        )}

        {/* ------- VO ------- */}
        {tab === "vo" && (
          <div className="mt-6 card p-6 !border-white/12 bg-white/[.06]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Eyebrow tone="dark" icon={ScrollText}>Continuous read · {words(fullVo)} words · ~{Math.round(words(fullVo) / 2.4)}s at 2.4 w/s</Eyebrow>
              <button onClick={() => copy(fullVo, "Voice-over copied")} className="btn border border-white/18 bg-white/5 text-[#dcefe2] hover:bg-white/12">
                <Copy size={14} /> Copy full script
              </button>
            </div>
            <div className="mt-5 space-y-5">
              {SHOTS.map((s, i) => (
                <p key={s.screen} className={`border-l-2 pl-4 text-[14.5px] leading-[1.65] transition-colors duration-300 ${i === current ? "border-[#7fdcae] text-white" : "border-white/15 text-[#b7d6c4]"}`}>
                  <span className="mr-2 font-mono text-[11.5px] text-[#8fb6a1]">{tc(starts[i])}</span>
                  {s.vo}
                </p>
              ))}
            </div>
            <p className="mt-6 text-[12px] text-[#8fb6a1]">
              Read it aloud once before recording. Any line that runs past its shot: cut words, don't speed up — pacing is what makes a demo feel calm.
            </p>
          </div>
        )}

        {/* ------- CHECKLIST ------- */}
        {tab === "prep" && (
          <ul className="mt-6 grid gap-3 lg:grid-cols-2">
            {CHECKLIST.map(([k, v], i) => {
              const checked = done.includes(i);
              return (
                <li key={k}>
                  <button
                    onClick={() => setDone((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}
                    className={`card flex w-full items-start gap-3 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 !border-white/12 ${checked ? "bg-[#1c5d45]/50" : "bg-white/[.06]"}`}
                  >
                    <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${checked ? "border-[#7fdcae] bg-[#7fdcae] text-[#062018]" : "border-white/25"}`}>
                      {checked && <Check size={14} strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block text-[11px] font-bold uppercase tracking-[0.16em] text-[#7fdcae]">{k}</span>
                      <span className="mt-1 block text-[13.5px] leading-relaxed text-[#cfe6d8]">{v}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            <li className="card flex items-center justify-between gap-3 p-4 !border-white/12 bg-white/[.06] lg:col-span-2">
              <span className="text-[13px] font-semibold text-[#a9c9b8]">{done.length}/{CHECKLIST.length} ready</span>
              <button onClick={() => setDone([])} className="btn border border-white/18 bg-white/5 text-[#dcefe2] hover:bg-white/12">
                Clear ticks
              </button>
            </li>
          </ul>
        )}

        {/* ------- SPECS ------- */}
        {tab === "specs" && (
          <div className="mt-6 card overflow-hidden !border-white/12 bg-white/[.06]">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[10.5px] uppercase tracking-[0.16em] text-[#8fb6a1]">
                  <th className="px-5 py-3 font-bold">Deliverable</th>
                  <th className="px-5 py-3 font-bold">Settings</th>
                  <th className="px-5 py-3 font-bold">Length</th>
                </tr>
              </thead>
              <tbody>
                {SPECS.map(([a, b, c]) => (
                  <tr key={a} className="border-t border-white/10 transition-colors hover:bg-white/5">
                    <td className="px-5 py-3.5 font-bold text-white">{a}</td>
                    <td className="px-5 py-3.5 font-mono text-[12px] text-[#cfe6d8]">{b}</td>
                    <td className="px-5 py-3.5 text-[#8fb6a1]">{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="grid gap-4 border-t border-white/10 p-5 sm:grid-cols-3">
              {[
                ["Free capture", "OBS Studio (Win/mac/Linux) or the Screenity Chrome extension. Kap on Mac for short loops."],
                ["Free edit", "DaVinci Resolve for timing + captions; CapCut if you want auto-captions fast."],
                ["No-edit fallback", "One continuous take, 3:00, teleprompter running on a second screen. Cuts are optional; clarity is not."],
              ].map(([t, d]) => (
                <div key={t} className="rounded-2xl border border-white/12 bg-white/5 p-4">
                  <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#7fdcae]">{t}</p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#a9c9b8]">{d}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------- SCENE SETUP ------- */}
        {tab === "set" && (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div className="card p-6 !border-white/12 bg-white/[.06]">
              <Eyebrow tone="dark" icon={Gauge}>Capture chrome</Eyebrow>
              <label className="mt-5 block">
                <span className="flex items-center justify-between text-[12.5px] font-bold text-[#cfe6d8]">
                  UI zoom for the recording <span className="font-mono text-[#7fdcae]">{(eco.studio?.zoom || 1).toFixed(2)}×</span>
                </span>
                <input
                  type="range"
                  min="0.9"
                  max="1.35"
                  step="0.05"
                  value={eco.studio?.zoom || 1}
                  onChange={(e) => eco.setStudio({ zoom: Number(e.target.value) })}
                  className="mt-3"
                  style={{ "--pct": `${Math.min(100, Math.max(0, (((eco.studio?.zoom || 1) - 0.9) / 0.45) * 100))}%` }}
                />
                <span className="mt-2 block text-[11.5px] text-[#8fb6a1]">
                  Scales the whole interface so numbers stay legible on a phone feed. Reset to 1.00 for wide screen-grabs.
                </span>
              </label>
              <div className="mt-5 flex flex-wrap gap-2">
                <button onClick={eco.toggleTheme} className="btn border border-white/18 bg-white/5 text-[#dcefe2] hover:bg-white/12">
                  {eco.theme === "dark" ? <Sun size={15} /> : <Moon size={15} />} {eco.theme === "dark" ? "Light take" : "Dark take"}
                </button>
                <button onClick={() => eco.setStudio({ zoom: 1, focus: false })} className="btn border border-white/18 bg-white/5 text-[#dcefe2] hover:bg-white/12">
                  <RotateCcw size={15} /> Reset chrome
                </button>
              </div>
            </div>

            <div className="card p-6 !border-white/12 bg-white/[.06]">
              <Eyebrow tone="dark" icon={ArrowRight}>Walk to the scene</Eyebrow>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  ["/", "Home"],
                  ["/calculator", "Calculator"],
                  ["/actions", "Actions"],
                  ["/dashboard", "Dashboard"],
                  ["/challenges", "Challenges"],
                  ["/leaderboard", "Leaderboard"],
                  ["/impact", "Impact"],
                  ["/profile", "Profile"],
                ].map(([to, label]) => (
                  <Link key={to} to={to} className="chip border border-white/15 bg-white/5 text-[#dcefe2] transition-colors hover:border-[#7fdcae]">
                    {label}
                  </Link>
                ))}
              </div>
              <p className="mt-5 text-[12.5px] leading-relaxed text-[#a9c9b8]">
                Focus mode keeps toasts alive — the completion toast and the leaf burst are the payoff of the whole
                video, so film them, don't hide them. Leave Studio to turn focus off, or use the button that appears
                bottom-left while it's on.
              </p>
              <button onClick={() => copy(srt, "SRT copied")} className="btn mt-5 w-full bg-[#7fdcae] font-bold text-[#062018] hover:bg-[#96e9bd]">
                <Copy size={14} /> Copy captions as SRT ({SHOTS.length} cues)
              </button>
            </div>
          </div>
        )}

        <p className="mt-8 text-[12px] text-[#8fb6a1]">
          Nothing here is uploaded. Presets and focus mode are written to this browser's storage alongside your climate
          data — reset them any time from <Link to="/profile" className="font-bold text-[#7fdcae] hover:underline">Profile → Preferences</Link>.
        </p>
      </div>
    </section>
  );
}
