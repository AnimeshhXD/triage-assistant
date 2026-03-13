from dataclasses import dataclass
from typing import List, Dict, Any, Tuple

from .context_pruning import ContextChunk


TRIAGE_LEVELS = ["Critical", "Urgent", "Moderate", "Stable"]


@dataclass
class RiskProfile:
    heart_attack: float
    stroke: float
    internal_bleeding: float
    shock: float


def _basic_rules(symptoms: str, vitals: Dict[str, Any]) -> Tuple[str, str, float, str, RiskProfile]:
    text = symptoms.lower()
    hr = vitals.get("heart_rate")
    bp = vitals.get("blood_pressure", "")
    spo2 = vitals.get("oxygen", vitals.get("spo2"))

    level = "Moderate"
    action = "Monitor patient, obtain full vitals, and prepare basic diagnostics."
    confidence = 0.7
    reasoning_parts: List[str] = []

    def high_bp() -> bool:
        if isinstance(bp, str) and "/" in bp:
            try:
                sys = int(bp.split("/")[0])
                return sys >= 180
            except Exception:
                return False
        return False

    if "chest pain" in text or ("shortness of breath" in text and "sweat" in text):
        level = "Critical"
        action = "Activate cardiac protocol, perform ECG immediately, give aspirin if not contraindicated, and prepare for possible PCI."
        confidence = 0.9
        reasoning_parts.append("Chest pain with dyspnea and diaphoresis strongly suggests acute coronary syndrome.")
    elif "stroke" in text or "face drooping" in text or "slurred speech" in text or "weakness" in text:
        level = "Urgent"
        action = "Activate stroke protocol, obtain CT head urgently, check glucose, and record time last known well."
        confidence = 0.85
        reasoning_parts.append("Focal neurologic deficit symptoms indicate possible stroke.")
    elif "bleeding" in text or "trauma" in text or "car accident" in text:
        level = "Urgent"
        action = "Apply direct pressure, start IV access, check hemodynamic stability, and prepare for imaging."
        confidence = 0.8
        reasoning_parts.append("Reported trauma or bleeding suggests risk of internal injury.")
    elif "burn" in text:
        level = "Moderate"
        action = "Cool the burn, assess TBSA and depth, provide analgesia, and consider fluid resuscitation if extensive."
        confidence = 0.75
        reasoning_parts.append("Burn injury requires assessment of extent and depth.")

    if hr is not None:
        try:
            hr_val = float(hr)
            if hr_val > 130 or hr_val < 40:
                level = "Critical"
                reasoning_parts.append("Extreme heart rate indicates hemodynamic instability.")
        except Exception:
            pass

    if spo2 is not None:
        try:
            spo2_val = float(spo2)
            if spo2_val < 90:
                if level != "Critical":
                    level = "Urgent"
                reasoning_parts.append("Low oxygen saturation indicates respiratory compromise.")
        except Exception:
            pass

    if high_bp():
        if level != "Critical":
            level = "Urgent"
        reasoning_parts.append("Severely elevated blood pressure increases stroke and cardiac risk.")

    if not reasoning_parts:
        reasoning_parts.append("Symptoms do not clearly map to a single emergency category; defaulting to moderate triage.")

    reasoning = " ".join(reasoning_parts)

    def prob(condition_keywords: List[str]) -> float:
        base = 0.05
        for k in condition_keywords:
            if k in text:
                base += 0.25
        if "Critical" in level:
            base += 0.2
        elif "Urgent" in level:
            base += 0.1
        return min(base, 0.98)

    risk = RiskProfile(
        heart_attack=prob(["chest pain", "shortness of breath"]),
        stroke=prob(["stroke", "slurred speech", "weakness", "face drooping"]),
        internal_bleeding=prob(["bleeding", "trauma", "fall", "car accident"]),
        shock=prob(["shock", "cold", "clammy", "dizzy"]),
    )

    return level, action, confidence, reasoning, risk


def explainable_from_evidence(evidence: List[ContextChunk], symptoms: str) -> List[Dict[str, Any]]:
    highlighted: List[Dict[str, Any]] = []
    terms = [w for w in symptoms.lower().split() if len(w) > 3]

    for c in evidence:
        text = c.text
        lower = text.lower()
        hits = [t for t in terms if t in lower]
        highlighted.append(
            {
                "protocol": c.source,
                "score": c.score,
                "text": text,
                "highlight_terms": hits,
                "metadata": c.extra.get("metadata", {}),
            }
        )
    return highlighted


def triage_patient(
    symptoms: str,
    vitals: Dict[str, Any],
    evidence: List[ContextChunk],
) -> Dict[str, Any]:
    level, action, confidence, reasoning, risk = _basic_rules(symptoms, vitals)

    evidence_payload = explainable_from_evidence(evidence, symptoms)

    return {
        "triage_level": level,
        "next_action": action,
        "confidence": confidence,
        "reasoning": reasoning,
        "evidence": evidence_payload,
        "risk_profile": {
            "heart_attack": risk.heart_attack,
            "stroke": risk.stroke,
            "internal_bleeding": risk.internal_bleeding,
            "shock": risk.shock,
        },
    }

