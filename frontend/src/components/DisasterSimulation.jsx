import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const basePatients = [
  {
    id: "A",
    name: "Patient A",
    level: "Critical",
    summary: "Chest pain, shortness of breath, hypotension.",
  },
  {
    id: "B",
    name: "Patient B",
    level: "Urgent",
    summary: "Headache, slurred speech, elevated blood pressure.",
  },
  {
    id: "C",
    name: "Patient C",
    level: "Stable",
    summary: "Mild ankle injury, normal vitals.",
  },
];

const priorityScore = (level) => {
  switch (level) {
    case "Critical":
      return 3;
    case "Urgent":
      return 2;
    case "Moderate":
      return 1;
    default:
      return 0;
  }
};

const DisasterSimulation = () => {
  const [shuffled, setShuffled] = useState(basePatients);
  const [sorted, setSorted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 70%",
        onEnter: () => {
          setShuffled((prev) => [...prev].sort(() => Math.random() - 0.5));
          setTimeout(() => setSorted(true), 600);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const ordered = useMemo(() => {
    if (!sorted) return shuffled;
    return [...shuffled].sort(
      (a, b) => priorityScore(b.level) - priorityScore(a.level)
    );
  }, [shuffled, sorted]);

  return (
    <section className="scroll-section bg-background">
      <div ref={containerRef} className="section-inner">
        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
          Disaster mode simulation
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold">
          When three critical patients arrive at once.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-textMuted">
          In disaster mode, the assistant triages multiple patients in
          parallel—ranking them by severity so the team immediately sees who
          needs the next bed, scan, or code team.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <AnimatePresence>
            {ordered.map((p, idx) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="card-surface rounded-xl p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between text-xs text-textMuted">
                  <span>{p.name}</span>
                  <span>Priority {idx + 1}</span>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    p.level === "Critical"
                      ? "text-danger"
                      : p.level === "Urgent"
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {p.level}
                </div>
                <p className="text-xs text-textMuted">{p.summary}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default DisasterSimulation;

