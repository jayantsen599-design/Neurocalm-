# NeuroCalm — Architecture Handoff & Production Readiness Specification

## A. Product Objective
NeuroCalm is a deterministic, rule-governed stress-reduction and behavioral momentum web system.
It provides calibrated, minimum-sufficient micro-interventions in moments of acute cognitive overload, hyperarousal, overthinking, and action paralysis.
**North Star**: *Useful real-world movement per unit of user effort.*

---

## B. Core Architecture Ownership Matrix

| System Responsibility | Source of Truth Module | Core Invariant |
|---|---|---|
| **Safety Screening & Crisis Escalation** | `src/core/safetyGateway.ts` | Upstream absolute priority; intercepts any turn; non-bypassable |
| **Living Context Tracking** | `src/core/conversationIntelligence.ts` (`LivingContext`) | User Statement > User Correction > Recent Context > Memory > Inference |
| **Functional Capacity Estimation** | `src/core/conversationIntelligence.ts` (`estimateFunctionalCapacity`) | Stress ≠ Low Capacity; LOW capacity strictly enforces 0–1 questions and minimal load |
| **User Receptivity Assessment** | `src/core/conversationIntelligence.ts` (`assessReceptivity`) | `NOT_READY` strictly forbids unsolicited advice and blocks false skill logging |
| **Support Need Determination** | `src/core/conversationIntelligence.ts` (`determineSupportNeed`) | 9 primary needs: LISTENING, CLARIFYING, REGULATION, SOLVING, DECISION_SUPPORT, ACTION, SKILL, HUMAN_SUPPORT, CLEAN_EXIT |
| **Adaptive Governor** | `src/core/adaptiveGovernor.ts` | Central decision authority answering: *"What is the most useful next move right now?"* |
| **Research Governance Registry** | `src/core/researchRegistry.ts` | Strict evidence levels (E1–E5); E5 pseudoscience permanently blocked |
| **Stress Language System** | `src/core/stressLanguageSystem.ts` | Dynamic response budgets; multi-language (en, hi, hinglish); anti-repetition rotation |
| **Final Quality Controller** | `src/core/qualityController.ts` | 12-point quality gate auto-sanitizing responses before user delivery |
| **Intervention Library & Eligibility**| `src/core/interventionLibrary.ts` | Authoritative library of 6 audited, calibrated somatic & cognitive interventions |
| **Intervention Scoring Engine** | `src/core/interventionScorer.ts` | Multi-factor weighted ranking (Mechanism match, state, capacity, history) |
| **Dose & Intensity Engine** | `src/core/doseEngine.ts` | Dynamic micro-dosing (120s – 300s) preventing cognitive fatigue |
| **Outcome & Idempotency Engine** | `src/core/outcomeEngine.ts` | Double-click lock, session token validation, hard gate rejecting NOT_READY progress |
| **Skill Library & Transfer Engine** | `src/core/skillLibrary.ts` | Portable skills, real-world cues, transfer levels (R0–R4), anti-dependency |
| **Memory & Privacy Manager** | `src/core/memoryManager.ts` | Local bounded storage; strict TTL; zero third-party telemetry; client-side only |

---

## C. Living Context & Memory Priority Hierarchy
In accordance with NeuroCalm Invariant 10:
$$\text{CURRENT USER STATEMENT} > \text{USER CORRECTION} > \text{RECENT VERIFIED CONTEXT} > \text{OLDER MEMORY} > \text{AI INFERENCE}$$
- Memory suggests; current state decides.
- No raw emotional diary stored. Only structured operational signals (problem pattern, strategy, outcome, correction, cue).

---

## D. Decision & Response Pipeline

```
USER INPUT
   ↓
[1. SAFETY GATEWAY SCREENING] (Intercepts crisis immediately)
   ↓
[2. LIVING CONTEXT & CORRECTION CHECK]
   ↓
[3. EMOTION & SITUATION MODELING] (Hypothesis formulation)
   ↓
[4. FUNCTIONAL CAPACITY & RECEPTIVITY] (LOW / MEDIUM / HIGH; READY / LIMITED / NOT_READY)
   ↓
[5. PRIMARY SUPPORT NEED] (Regulation, Action, Listening, Decision, etc.)
   ↓
[6. ADAPTIVE GOVERNOR] (16 Strategy outputs, minimum-sufficient assistance)
   ↓
[7. RESEARCH / EVIDENCE GOVERNANCE] (E1-E5 rule evaluation, limitation & contraindication check)
   ↓
[8. STRESS CONVERSATION LANGUAGE SYSTEM] (Dynamic sentence/question/choice budget)
   ↓
[9. 12-POINT QUALITY CONTROLLER GATE] (Pre-emission validation & auto-sanitization)
   ↓
[10. USER-FACING RESPONSE & ACTION ROUTE]
   ↓
[11. OUTCOME & TRANSFER ENGINE] (R0, R1, R2, R3, R4)
   ↓
[12. INDEPENDENCE & CLEAN EXIT] (Success = returning to offline life)
```

---

## E. Research Governance Invariants (E1–E5)

- **E1 (Strong Empirical Evidence)**: Peer-reviewed clinical trials (e.g. cyclic sighing vagal tone activation, working memory degradation under acute stress). High-confidence behavioral boundaries.
- **E2 (Emerging / Promising Evidence)**: Culturally attuned idioms, digital micro-dosing. Provisional and humble framing.
- **E3 (Product Hypotheses)**: Internal conversation pacing heuristics, question density gates.
- **E4 (Traditional / Philosophical Knowledge)**: Dichotomy of control, contemplative pauses. **Explicitly classified as behavioral framing, never misrepresented as empirical neuroscience.**
- **E5 (Unsupported / Prohibited)**: Pseudoscience, frequency/DNA realignment, universal cure-alls, or medical countermanding. **Strictly and permanently blocked from system adoption.**

---

## F. 12-Point Response Quality Controller
Evaluates every turn against:
1. `isNecessary`: Validates conversational necessity.
2. `isRelevant`: Aligns with current state and context.
3. `isUnderstandableNow`: Strips jargon when capacity is LOW.
4. `isAppropriatelySized`: Enforces sentence count budgets.
5. `isStrategyAppropriate`: Enforces non-directive presence for LISTEN.
6. `isUncertaintyCalibrated`: Softens dogmatic claims to hypotheses.
7. `noUnnecessaryChoices`: 0 choices when capacity is LOW.
8. `noUnnecessaryQuestions`: Suppresses questions for 0-question budget.
9. `noRepeatingFailedStrategy`: Blocks re-proposing failed interventions.
10. `noDependencyReinforcement`: Replaces dependency promises with self-efficacy transfer.
11. `hasUsefulNextMove`: Guarantees clear action anchor or clean pause.
12. `rightTimeToStop`: Releases user cleanly on exit.

---

## G. Testing Architecture & Verification

The codebase includes **84 automated tests** across 6 distinct suites:
1. **Foundation Tests (`A` through `X`)**: Safety Gateway, scoring, dose, memory, outcome, skills, transfer.
2. **Conversation Intelligence (`Y`, `Z`)**: Living context, user correction priority, intervention routing, clean exit.
3. **Adaptive Governor 20-Scenario Matrix (`GOV.A` through `GOV.T`)**: Exhaustive coverage of stress, capacity, anger, hurt, pata nahi, and dependency transitions.
4. **Stress Language System (`LANG.1` through `LANG.16`)**: Budget enforcement, directiveness dial, validation without agreement, Hindi/Hinglish cultural phrasing.
5. **Research Governance (`RESEARCH.A` through `RESEARCH.J`)**: Hierarchy enforcement, E5 blocking, somatic-first, anti-reassurance, micro-friction initiation.
6. **Final Integration & Production Readiness (`INTEGRATION.1` through `INTEGRATION.12`)**: 12-point Quality Gate, 9 canonical user flows, multi-turn endurance, and transfer invariants.
