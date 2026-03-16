import React, { useState } from "react";
import HeroSection from "../components/HeroSection.jsx";
import ProblemSection from "../components/ProblemSection.jsx";
import PruningVisualization from "../components/PruningVisualization.jsx";
import PipelineSection from "../components/PipelineSection.jsx";
import TriageDemo from "../components/TriageDemo.jsx";
import LatencyMeter from "../components/LatencyMeter.jsx";
import DisasterSimulation from "../components/DisasterSimulation.jsx";

const Home = () => {
  const [latency, setLatency] = useState(null);

  return (
    <main className="bg-background text-textPrimary">
      <HeroSection />
      <ProblemSection />
      <PruningVisualization />
      <PipelineSection />
      <TriageDemo onLatency={setLatency} />
      <LatencyMeter latency={latency} />
      <DisasterSimulation />
    </main>
  );
};

export default Home;


