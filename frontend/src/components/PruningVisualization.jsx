import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PruningVisualization = () => {
  const containerRef = useRef(null);
  const gridRef = useRef(null);
  const focusRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const grid = gridRef.current;
    const focus = focusRef.current;
    if (!container || !grid || !focus) return;

    const ctx = gsap.context(() => {
      const boxes = grid.querySelectorAll(".doc-box");
      gsap.set(boxes, { opacity: 0.18, scale: 0.9 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 70%",
          end: "bottom 40%",
          scrub: true,
        },
      });

      tl.to(boxes, {
        opacity: 0.08,
        scale: 0.7,
        stagger: {
          amount: 0.6,
          from: "random",
        },
      }).to(
        boxes,
        {
          opacity: 0,
          scale: 0.4,
          stagger: {
            amount: 0.6,
            from: "random",
          },
        },
        ">-=0.2"
      );

      tl.fromTo(
        focus,
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" },
        ">-=0.1"
      );
    }, container);

    return () => ctx.revert();
  }, []);

  const docs = Array.from({ length: 50 });

  return (
    <section className="scroll-section bg-background">
      <div ref={containerRef} className="section-inner grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Intelligent context pruning
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-semibold">
            From 500 documents
            <br />
            down to the 10 that matter.
          </h2>
          <p className="mt-4 text-base text-textMuted">
            The assistant doesn&apos;t just embed everything. It actively{" "}
            <span className="text-textPrimary">
              throws away irrelevant history
            </span>{" "}
            —dental work, old sprains, cosmetic notes—before the model ever
            sees the prompt.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-textMuted">
            <li>• Stage 1: keyword filtering of obvious noise.</li>
            <li>• Stage 2: MiniLM embedding similarity in ChromaDB.</li>
            <li>• Stage 3: relevance scoring against current symptoms.</li>
            <li>• Stage 4: final token budget pruning to 5–10 chunks.</li>
          </ul>
        </div>

        <div className="relative h-[320px] md:h-[360px]">
          <div
            ref={gridRef}
            className="absolute inset-0 grid grid-cols-8 gap-1 opacity-80"
          >
            {docs.map((_, i) => (
              <div
                key={i}
                className="doc-box bg-surface border border-borderStrong"
              />
            ))}
          </div>
          <motion.div
            ref={focusRef}
            className="absolute inset-6 md:inset-10 card-surface rounded-xl p-6 border border-accent"
            initial={{ opacity: 0 }}
          >
            <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
              Final context window
            </div>
            <div className="mt-3 text-lg font-semibold">
              Top 10 most relevant snippets
            </div>
            <p className="mt-3 text-sm text-textMuted">
              Only the highest-scoring protocol lines and patient notes make it
              into the model input, keeping inference fast and on-target.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-textMuted">
              <div className="rounded-lg border border-borderStrong bg-background px-3 py-2">
                • Cardiac protocol – chest pain block
              </div>
              <div className="rounded-lg border border-borderStrong bg-background px-3 py-2">
                • Stroke protocol – time window rules
              </div>
              <div className="rounded-lg border border-borderStrong bg-background px-3 py-2">
                • Trauma protocol – internal bleeding checks
              </div>
              <div className="rounded-lg border border-borderStrong bg-background px-3 py-2">
                • CPR protocol – arrest decision tree
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PruningVisualization;

