"use client";

import * as React from "react";
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  systemNodes,
  systemFlows,
  getNode,
  type MapNode,
  type DataFlow,
} from "@/lib/shared/system-map";

/* ------------------------------------------------------------------ */
/* Tone palette (dark blueprint theme)                                */
/* ------------------------------------------------------------------ */

const TONE = {
  browser: { fill: "rgba(56,189,248,0.10)", stroke: "#38bdf8", text: "#7dd3fc" },
  edge: { fill: "rgba(129,140,248,0.10)", stroke: "#818cf8", text: "#a5b4fc" },
  app: { fill: "rgba(167,139,250,0.10)", stroke: "#a78bfa", text: "#c4b5fd" },
  service: { fill: "rgba(52,211,153,0.10)", stroke: "#34d399", text: "#6ee7b7" },
  data: { fill: "rgba(251,191,36,0.10)", stroke: "#fbbf24", text: "#fcd34d" },
  external: { fill: "rgba(251,113,133,0.10)", stroke: "#fb7185", text: "#fda4af" },
} as const;

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function edgePoints(a: MapNode, b: MapNode) {
  const acx = a.x + a.w / 2;
  const acy = a.y + a.h / 2;
  const bcx = b.x + b.w / 2;
  const bcy = b.y + b.h / 2;
  const dx = bcx - acx;
  const dy = bcy - acy;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  // Offset from centers to node borders (+ small gap).
  const off = (n: MapNode) => Math.min(n.w, n.h) / 2 + 14;
  const p0 = { x: acx + ux * off(a), y: acy + uy * off(a) };
  const p1 = { x: bcx - ux * off(b), y: bcy - uy * off(b) };
  // Quadratic control point: midpoint pushed perpendicular for an arc.
  const mx = (p0.x + p1.x) / 2;
  const my = (p0.y + p1.y) / 2;
  const px = -uy;
  const py = ux;
  const curve = 46;
  const c = { x: mx + px * curve, y: my + py * curve };
  return { p0, p1, c };
}

function bezier(p0: { x: number; y: number }, c: { x: number; y: number }, p1: { x: number; y: number }, t: number) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * c.x + t * t * p1.x,
    y: mt * mt * p0.y + 2 * mt * t * c.y + t * t * p1.y,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const STEP_MS = 2300;
const GAP_MS = 600;

export function SystemMap() {
  const [flowId, setFlowId] = React.useState(systemFlows[0].id);
  const [playing, setPlaying] = React.useState(true);
  const [speed, setSpeed] = React.useState(1);
  const [autoCycle, setAutoCycle] = React.useState(true);
  const [anim, setAnim] = React.useState<{ idx: number; p: number }>({ idx: 0, p: 0 });
  const [selectedStep, setSelectedStep] = React.useState<number | null>(0);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);

  const flow = systemFlows.find((f) => f.id === flowId) ?? systemFlows[0];
  const startRef = React.useRef<number | null>(null);
  const lastAnimRef = React.useRef<string>("");

  React.useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const stepMs = STEP_MS / speed;
      const cycle = flow.steps.length * (stepMs + GAP_MS);
      const t = elapsed % cycle;
      const idx = Math.min(flow.steps.length - 1, Math.floor(t / (stepMs + GAP_MS)));
      const p = Math.min(1, (t - idx * (stepMs + GAP_MS)) / stepMs);
      const key = `${idx}:${p > 0.999 ? "1" : p.toFixed(3)}`;
      if (key !== lastAnimRef.current) {
        lastAnimRef.current = key;
        setAnim({ idx, p });
      }
      // Auto-cycle to the next flow after the last step completes.
      if (autoCycle && idx === flow.steps.length - 1 && p >= 1) {
        const idxFlow = systemFlows.findIndex((f) => f.id === flowId);
        const next = systemFlows[(idxFlow + 1) % systemFlows.length];
        startRef.current = now;
        lastAnimRef.current = "";
        setFlowId(next.id);
        setSelectedStep(0);
        setAnim({ idx: 0, p: 0 });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      startRef.current = null;
    };
  }, [playing, speed, flowId, autoCycle, flow.steps.length]);

  const activeStep = flow.steps[anim.idx];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-slate-200 shadow-2xl">
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {systemFlows.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              setFlowId(f.id);
              setSelectedStep(0);
              setSelectedNode(null);
              startRef.current = null;
            }}
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium transition " +
              (f.id === flowId
                ? "bg-sky-500 text-white"
                : "border border-slate-700 text-slate-400 hover:text-slate-200")
            }
          >
            {f.name}
          </button>
        ))}
        <span className="mx-2 h-4 w-px bg-slate-700" />
        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
        >
          {playing ? "❚❚ Pause" : "▶ Play"}
        </button>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          className="rounded-full border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:text-white"
        >
          {speed}×
        </button>
        <button
          type="button"
          onClick={() => setAutoCycle((v) => !v)}
          className={
            "rounded-full border px-3 py-1.5 text-xs " +
            (autoCycle ? "border-emerald-600 text-emerald-400" : "border-slate-700 text-slate-500")
          }
        >
          auto-cycle {autoCycle ? "on" : "off"}
        </button>
      </div>

      {/* Map */}
      <div className="relative overflow-x-auto rounded-xl border border-slate-800">
        <svg
          viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
          className="min-w-[900px] w-full"
          role="img"
          aria-label="System architecture map with animated data flow"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M32 0H0V32" fill="none" stroke="rgba(148,163,184,0.06)" strokeWidth="1" />
            </pattern>
            <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0L10 5L0 10z" fill="#94a3b8" />
            </marker>
          </defs>

          <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#grid)" />

          {/* Edges for the active flow */}
          {flow.steps.map((step, i) => {
            const from = getNode(step.from);
            const to = getNode(step.to);
            if (!from || !to) return null;
            const { p0, p1, c } = edgePoints(from, to);
            const active = i === anim.idx;
            const dot = bezier(p0, c, p1, anim.p);
            return (
              <g key={i}>
                <path
                  d={`M ${p0.x} ${p0.y} Q ${c.x} ${c.y} ${p1.x} ${p1.y}`}
                  fill="none"
                  stroke={active ? "#f8fafc" : "rgba(100,116,139,0.35)"}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={active ? "none" : "4 6"}
                  markerEnd="url(#arrow)"
                />
                {active && (
                  <>
                    <g
                      onClick={() => setSelectedStep(i)}
                      className="cursor-pointer"
                      style={{ transform: `translate(${dot.x}px, ${dot.y}px)` }}
                    >
                      <circle r="10" fill="rgba(56,189,248,0.25)">
                        <animate attributeName="r" values="8;12;8" dur="1.2s" repeatCount="indefinite" />
                      </circle>
                      <circle r="4.5" fill="#38bdf8" />
                      <title>{step.label}</title>
                    </g>
                    <text
                      x={c.x}
                      y={c.y - 10}
                      textAnchor="middle"
                      className="fill-sky-300 text-[11px] font-medium"
                      style={{ fontFamily: "ui-monospace, monospace" }}
                    >
                      {step.label}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {systemNodes.map((n) => {
            const tone = TONE[n.tone];
            const isSel = selectedNode === n.id;
            return (
              <g
                key={n.id}
                onClick={() => setSelectedNode(isSel ? null : n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedNode(isSel ? null : n.id);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSel}
                className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx={14}
                  fill={tone.fill}
                  stroke={isSel ? "#f8fafc" : tone.stroke}
                  strokeWidth={isSel ? 2 : 1.25}
                />
                <text x={n.x + 16} y={n.y + 30} className={isSel ? "fill-white text-[13px] font-semibold" : "fill-slate-100 text-[13px] font-semibold"}>
                  {n.label}
                </text>
                <text x={n.x + 16} y={n.y + 50} className="fill-slate-400 text-[10px]">
                  {n.subtitle}
                </text>
                <text x={n.x + 16} y={n.y + n.h - 14} className="fill-slate-500 text-[9px]">
                  {isSel ? "click again to close" : "click to inspect"}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g>
            {Object.entries(TONE).map(([k, t], i) => (
              <g key={k} transform={`translate(24, ${MAP_HEIGHT - 96 + i * 16})`}>
                <circle cx={6} cy={0} r={4} fill={t.stroke} />
                <text x={16} y={4} className="fill-slate-500 text-[10px] capitalize">{k}</text>
              </g>
            ))}
            <text x={24} y={MAP_HEIGHT - 104} className="fill-slate-600 text-[10px]">
              legend — data dots are clickable
            </text>
          </g>
        </svg>
      </div>

      {/* Inspector */}
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {selectedNode ? (
          (() => {
            const n = getNode(selectedNode);
            if (!n) return null;
            return (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <h3 className="text-sm font-semibold text-white">{n.label}</h3>
                <p className="mt-1 text-xs text-slate-400">{n.subtitle}</p>
                <p className="mt-3 text-xs leading-relaxed text-slate-300">{n.description}</p>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500">Key files</div>
                  <ul className="mt-1 space-y-0.5">
                    {n.files.map((f) => (
                      <li key={f} className="font-mono text-[11px] text-sky-300">{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })()
        ) : selectedStep !== null ? (
          (() => {
            const s = flow.steps[selectedStep];
            if (!s) return null;
            const from = getNode(s.from);
            const to = getNode(s.to);
            return (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                    step {selectedStep + 1}/{flow.steps.length}
                  </span>
                  <h3 className="font-mono text-xs font-semibold text-white">{s.label}</h3>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {from?.label} → {to?.label}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">{s.note}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-slate-950 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-emerald-400">request / data</div>
                    <pre className="mt-1 overflow-x-auto font-mono text-[10px] leading-relaxed text-emerald-200">{s.request}</pre>
                  </div>
                  <div className="rounded-lg bg-slate-950 p-3">
                    <div className="text-[10px] uppercase tracking-widest text-sky-400">response</div>
                    <pre className="mt-1 overflow-x-auto font-mono text-[10px] leading-relaxed text-sky-200">{s.response}</pre>
                  </div>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-xs text-slate-500">
            Click a data dot or a component to inspect it.
          </div>
        )}

        {/* Step list */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-white">{flow.name}</h3>
            <span className="text-[10px] text-slate-500">{flow.description}</span>
          </div>
          <ol className="space-y-1">
            {flow.steps.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStep(i);
                    setSelectedNode(null);
                  }}
                  className={
                    "w-full rounded-md px-2 py-1.5 text-left font-mono text-[11px] transition " +
                    (i === anim.idx
                      ? "bg-sky-500/15 text-sky-200"
                      : selectedStep === i
                        ? "bg-slate-800 text-slate-200"
                        : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300")
                  }
                >
                  <span className="mr-2 text-slate-600">{i + 1}.</span>
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Flow description */}
      <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-800/70 bg-slate-900/50 p-3 text-xs text-slate-400">
        <span className="mt-0.5 text-sky-400">●</span>
        <p className="leading-relaxed">
          {flow.description} The travelling dots carry the exact data that crosses each boundary — click any dot
          (or any step in the list) to inspect the payload, and click a component to see what implements it.
        </p>
      </div>
    </div>
  );
}