import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  { id: 1, label: "Patient Input", description: "Symptoms + vitals in voice or text." },
  { id: 2, label: "Embedding Search", description: "MiniLM embeddings inside ChromaDB." },
  { id: 3, label: "Context Pruning", description: "Multi-stage pruning to top 5–10 chunks." },
  { id: 4, label: "AI Reasoning", description: "Rule-based, explainable triage logic." },
  { id: 5, label: "Triage Decision", description: "Level, next action, risk profile." }
];

const PipelineSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pipeline-step",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.18,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%"
          }
        }
      );

      gsap.to(".pipeline-rail", {
        scaleX: 1,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%"
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scroll-section bg-background">
      <div ref={containerRef} className="section-inner">
        <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
          Under the hood
        </p>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold">
          A latency-obsessed triage pipeline.
        </h2>
        <p className="mt-4 max-w-2xl text-base text-textMuted">
          Built as a RAG system on top of carefully pruned context, the engine
          trades black-box magic for deterministic, explainable rules—making it
          safe to demo in high-stakes environments.
        </p>

        <div className="relative mt-10">
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-px bg-borderStrong origin-left scale-x-0 pipeline-rail" />
          <div className="relative grid gap-6 md:grid-cols-5">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                className="pipeline-step card-surface rounded-xl px-4 py-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 text-xs text-textMuted">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-borderStrong text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="uppercase tracking-[0.18em]">{step.label}</span>
                </div>
                <p className="text-xs text-textMuted mt-1">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PipelineSection;

