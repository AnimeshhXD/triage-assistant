import React, { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Stat = ({ label, value, suffix, delay }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });

  useEffect(() => {
    if (inView && ref.current) {
      const el = ref.current;
      const target = Number(value);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.5,
        ease: "power3.out",
        onUpdate: () => {
          if (el) {
            el.innerText = Math.round(obj.val).toLocaleString();
          }
        },
        delay,
      });
    }
  }, [inView, value, delay]);

  return (
    <div className="card-surface rounded-xl px-6 py-5 flex flex-col gap-2">
      <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
        {label}
      </div>
      <div className="flex items-baseline gap-1 text-3xl font-semibold">
        <span ref={ref}>0</span>
        {suffix && (
          <span className="text-base font-normal text-textMuted">{suffix}</span>
        )}
      </div>
    </div>
  );
};

const ProblemSection = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".problem-copy",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.15,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scroll-section bg-background">
      <div ref={containerRef} className="section-inner">
        <div className="max-w-3xl problem-copy">
          <h2 className="text-2xl md:text-4xl font-semibold">
            The cognitive load inside a modern emergency room is{" "}
            <span className="text-accent">brutal</span>.
          </h2>
          <p className="mt-4 text-base md:text-lg text-textMuted">
            Doctors juggle thousands of pages of records, protocols, and
            guidelines—while a critical patient waits. Every second spent
            searching is a second not spent saving a life.
          </p>
        </div>

        <div className="grid gap-6 mt-10 md:grid-cols-3 problem-copy">
          <Stat
            label="Records a single ER doctor may reference in a shift"
            value={3200}
            suffix="+"
            delay={0.1}
          />
          <Stat
            label="Target decision window for critical cases"
            value={15}
            suffix="seconds"
            delay={0.3}
          />
          <Stat
            label="Time budget for our AI to respond"
            value={500}
            suffix="ms"
            delay={0.5}
          />
        </div>

        <p className="mt-8 max-w-2xl text-sm md:text-base text-textMuted problem-copy">
          The question: how do you compress thousands of records into just the
          few lines that matter for this patient, right now—without ever slowing
          the team down?
        </p>
      </div>
    </section>
  );
};

export default ProblemSection;

