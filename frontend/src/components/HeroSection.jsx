import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const containerRef = useRef(null);
  const indicatorRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
        },
      }
    );

    if (indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        y: 18,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        duration: 1.2,
      });
    }
  }, []);

  return (
    <section className="scroll-section bg-background">
      <div ref={containerRef} className="section-inner flex flex-col gap-10">
        <header className="flex items-center justify-between">
          <div className="text-xs tracking-[0.25em] uppercase text-textMuted">
            Real-Time Emergency Response
          </div>
          <div className="flex items-center gap-2 text-xs text-textMuted">
            <span className="w-2 h-2 rounded-full bg-success" />
            Live Prototype
          </div>
        </header>

        <div className="grid gap-10 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)] items-center">
          <div>
            <motion.h1
              className="headline text-4xl md:text-6xl font-semibold"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
            >
              Emergency decisions
              <br />
              in <span className="text-accent">under 500ms</span>.
            </motion.h1>
            <motion.p
              className="mt-6 max-w-xl text-base md:text-lg text-textMuted"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            >
              A real-time triage assistant that reads massive protocols, prunes
              irrelevant noise, and surfaces the next best emergency action—
              before a human could open the chart.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-4 text-xs text-textMuted"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderStrong">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Optimized for <span className="font-semibold">sub-500ms</span>{" "}
                latency
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-borderStrong">
                LangChain · Chroma · FastAPI
              </span>
            </motion.div>
          </div>

          <motion.div
            className="card-surface rounded-xl p-6 flex flex-col gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
          >
            <div className="flex justify-between items-center text-xs text-textMuted">
              <span>Latency snapshot</span>
              <span>Benchmarked demo</span>
            </div>
            <div className="mt-1 text-3xl font-semibold">
              310<span className="text-base font-normal text-textMuted"> ms</span>
            </div>
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-textMuted">Vector search</span>
                <span>120 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">Context pruning</span>
                <span>40 ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-textMuted">AI reasoning</span>
                <span>150 ms</span>
              </div>
            </div>
            <div className="mt-4 latency-gauge-track">
              <div
                className="latency-gauge-fill"
                style={{ width: "62%" }}
              ></div>
            </div>
            <p className="mt-3 text-xs text-textMuted">
              Designed for emergency rooms where every millisecond and every
              decision matters.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col items-center mt-4 text-xs text-textMuted">
          <span>Scroll to see how it works</span>
          <div className="mt-3 flex flex-col items-center gap-2">
            <div className="w-5 h-9 rounded-full border border-borderStrong flex items-start justify-center pt-1">
              <div ref={indicatorRef} className="indicator-dot" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

