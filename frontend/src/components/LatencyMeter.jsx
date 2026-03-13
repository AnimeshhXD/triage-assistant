import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const LatencyMeter = ({ latency }) => {
  const gaugeRef = useRef(null);

  const vectorMs = latency?.vector_search_ms ?? 120;
  const reasoningMs = latency?.reasoning_ms ?? 150;
  const totalMs = latency?.total_ms ?? 310;

  const normalized = Math.min(totalMs / 500, 1);

  useEffect(() => {
    if (!gaugeRef.current) return;
    const el = gaugeRef.current;
    el.style.transform = `scaleX(${normalized || 0.2})`;
    if (normalized < 0.5) {
      el.style.backgroundColor = "#22C55E";
    } else if (normalized < 0.9) {
      el.style.backgroundColor = "#FACC15";
    } else {
      el.style.backgroundColor = "#EF4444";
    }
  }, [normalized]);

  return (
    <section className="scroll-section bg-background">
      <div className="section-inner grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Latency meter
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-semibold">
            See the speed budget in real time.
          </h2>
          <p className="mt-4 text-base text-textMuted">
            Every request is broken down into vector search, pruning, and
            reasoning windows to prove the system consistently answers under our
            500ms target.
          </p>
          <ul className="mt-5 space-y-2 text-sm text-textMuted">
            <li>• Green: comfortably within budget.</li>
            <li>• Yellow: approaching the 500ms ceiling.</li>
            <li>• Red: over budget—time to optimize.</li>
          </ul>
        </div>

        <div className="card-surface rounded-xl p-6 space-y-4">
          <div className="flex justify-between text-xs text-textMuted">
            <span>Vector search</span>
            <span>{Math.round(vectorMs)} ms</span>
          </div>
          <div className="flex justify-between text-xs text-textMuted">
            <span>AI reasoning</span>
            <span>{Math.round(reasoningMs)} ms</span>
          </div>
          <div className="flex justify-between text-xs text-textMuted">
            <span>Total</span>
            <span className="font-semibold text-textPrimary">
              {Math.round(totalMs)} ms
            </span>
          </div>
          <div className="mt-3 latency-gauge-track">
            <div ref={gaugeRef} className="latency-gauge-fill" />
          </div>
          <motion.p
            className="mt-3 text-xs text-textMuted"
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20% 0px" }}
            transition={{ duration: 0.6 }}
          >
            This gauge updates live after each triage request in the demo
            below, turning your scroll into a performance dashboard.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default LatencyMeter;

