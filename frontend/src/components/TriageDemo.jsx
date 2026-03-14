import React, { useState } from "react";
import { motion } from "framer-motion";
import { API_BASE } from "../config/api";

const initialForm = {
  symptoms: "Patient has chest pain, sweating, shortness of breath.",
  heart_rate: "110",
  blood_pressure: "150/90",
  oxygen: "92"
};

const TriageDemo = ({ onLatency }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        symptoms: form.symptoms,
        vitals: {
          heart_rate: Number(form.heart_rate) || undefined,
          blood_pressure: form.blood_pressure || undefined,
          oxygen: Number(form.oxygen) || undefined
        }
      };
      const res = await fetch(`${API_BASE}/triage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      const json = await res.json();
      setResult(json);
      if (json.latency && typeof onLatency === "function") {
        onLatency(json.latency);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const levelColor =
    result?.triage_level === "Critical"
      ? "text-danger"
      : result?.triage_level === "Urgent"
      ? "text-warning"
      : result?.triage_level === "Moderate"
      ? "text-accent"
      : "text-success";

  return (
    <section className="scroll-section bg-background">
      <div className="section-inner grid gap-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.1fr)] items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-textMuted">
            Live triage demo
          </p>
          <h2 className="mt-3 text-2xl md:text-4xl font-semibold">
            Try the assistant on a real case.
          </h2>
          <p className="mt-4 text-base text-textMuted">
            Enter symptoms and vitals, hit &ldquo;Run triage,&rdquo; and watch
            the system retrieve protocols, prune context, and surface a
            decision—without leaving the browser.
          </p>

          <form
            className="mt-6 card-surface rounded-xl p-5 space-y-4"
            onSubmit={handleSubmit}
          >
            <div>
              <label className="text-xs uppercase tracking-[0.18em] text-textMuted">
                Symptoms
              </label>
              <textarea
                name="symptoms"
                value={form.symptoms}
                onChange={handleChange}
                rows={3}
                className="mt-2 w-full rounded-lg bg-background border border-borderStrong px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Heart rate
                </label>
                <input
                  type="number"
                  name="heart_rate"
                  value={form.heart_rate}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg bg-background border border-borderStrong px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Blood pressure
                </label>
                <input
                  type="text"
                  name="blood_pressure"
                  value={form.blood_pressure}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg bg-background border border-borderStrong px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="120/80"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Oxygen %
                </label>
                <input
                  type="number"
                  name="oxygen"
                  value={form.oxygen}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-lg bg-background border border-borderStrong px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-accent text-sm font-semibold text-background disabled:opacity-60"
                >
                  {loading ? "Running triage…" : "Run triage"}
                </button>
                {error && (
                  <span className="text-xs text-danger">
                    {error}
                  </span>
                )}
              </div>
              {loading && (
                <p className="text-xs text-textMuted">
                  First request may take 20–40 seconds (Render free tier).
                </p>
              )}
            </div>
          </form>
        </div>

        <motion.div
          className="card-surface rounded-xl p-5 h-full"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20% 0px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center justify-between text-xs text-textMuted">
            <span>Triage result</span>
            <span>
              {result?.latency
                ? `${Math.round(result.latency.total_ms)} ms total`
                : "Awaiting input"}
            </span>
          </div>

          {result ? (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Triage level
                </div>
                <div className={`mt-1 text-xl font-semibold ${levelColor}`}>
                  {result.triage_level}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Next action
                </div>
                <p className="mt-1 text-textPrimary">{result.next_action}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
                    Confidence
                  </div>
                  <p className="mt-1 text-textPrimary">
                    {Math.round((result.confidence ?? 0) * 100)}%
                  </p>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
                    Risk snapshot
                  </div>
                  <p className="mt-1 text-textMuted">
                    Heart attack:{" "}
                    {Math.round((result.risk_profile?.heart_attack ?? 0) * 100)}%
                    <br />
                    Stroke:{" "}
                    {Math.round((result.risk_profile?.stroke ?? 0) * 100)}%
                  </p>
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.18em] text-textMuted">
                  Reasoning
                </div>
                <p className="mt-1 text-textMuted">{result.reasoning}</p>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm text-textMuted">
              Run a triage to see the assistant&apos;s decision, rationale, and
              latency breakdown.
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default TriageDemo;

