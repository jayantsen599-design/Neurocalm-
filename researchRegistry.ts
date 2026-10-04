/**
 * NEUROCALM RESEARCH KNOWLEDGE REGISTRY & EVIDENCE-TO-RULE PIPELINE (Step 5)
 *
 * Implements the governed pipeline:
 * RESEARCH
 *   → EVIDENCE (E1-E5)
 *   → MECHANISM
 *   → PRODUCT RULE
 *   → DECISION
 *   → RESPONSE / INTERVENTION
 *   → OUTCOME
 *   → TESTING
 *   → LEARNING
 *
 * EVIDENCE HIERARCHY:
 * E1 = Strong empirical evidence (peer-reviewed trials, established neurobiology)
 * E2 = Emerging / promising evidence (pilot studies, provisional behavioral findings)
 * E3 = Mechanistic or product hypothesis (cognitive load budgets, conversation turn limits)
 * E4 = Traditional / philosophical knowledge (e.g., dichotomy of control, contemplative pauses)
 * E5 = Unsupported / prohibited (pseudoscience, medical replacement, unverified claims)
 *
 * CRITICAL INVARIANT:
 * - Never treat E3/E4 as E1.
 * - Never silently promote E2 to established fact.
 * - Never use E5 as product truth (E5 is permanently PROHIBITED).
 * - Safety Gateway always takes absolute priority over research rules.
 */

import {
  EvidenceLevel,
  ResearchDomain,
  ResearchStatus,
  ResearchKnowledgeItem,
  EvidenceEvaluationResult,
  ResearchIntelligenceAudit,
  CurrentState,
  CapacityLevel,
  ProblemCategory,
  FunctionalMechanism,
  GovernorStrategy
} from '../types/neurocalm';

// ============================================================================
// 1. CANONICAL RESEARCH KNOWLEDGE REGISTRY
// ============================================================================

export const RESEARCH_KNOWLEDGE_REGISTRY: ResearchKnowledgeItem[] = [
  // --- 1. STRESS + CAPACITY RESEARCH ---
  {
    id: 'RES_STRESS_CAP_01',
    domain: 'STRESS_CAPACITY',
    claim: 'Acute sympathetic hyperarousal selectively degrades working memory span and prefrontal cognitive processing bandwidth.',
    evidenceLevel: 'E1',
    population: 'Adults experiencing acute or severe emotional distress',
    context: 'Acute stress, panic, sensory overload, intense worry',
    mechanism: 'cognitive_overload',
    productImplication: 'When capacity is LOW, cognitive load must be strictly minimized; zero or max one question; avoid multi-step frameworks.',
    behaviorRule: 'Enforce LOW capacity budget: 1 main idea, 0 or 1 question, simple vocabulary, single concrete micro-step.',
    limitations: 'Does not apply once autonomic state returns to baseline and user explicitly asks for detailed analysis.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Arnsten (2009) Nature Reviews Neuroscience: Stress signalling pathways that impair prefrontal cortex structure and function.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['overloaded', 'hyperaroused', 'depleted', 'low_capacity'],
    applicableProblems: ['acute_stress', 'overload', 'exhaustion', 'low_capacity', 'loss_of_control'],
    contraindicationsOrBoundaries: ['High capacity state with explicit request for deep decision matrix'],
    testMetric: 'Post-response processing ease and absence of user overwhelm indicators',
    status: 'ACTIVE'
  },
  {
    id: 'RES_STRESS_CAP_02',
    domain: 'STRESS_CAPACITY',
    claim: 'Cognitive over-explanation during high cognitive depletion provokes frustration, fatigue, and task abandonment.',
    evidenceLevel: 'E1',
    population: 'Individuals under cognitive exhaustion or sleep deficit',
    context: 'Mental exhaustion, late-night spirals, sensory fatigue',
    mechanism: 'working_memory_overload',
    productImplication: 'Do not provide psychoeducational lectures or unsolicited multi-paragraph insights when capacity is LOW/MEDIUM.',
    behaviorRule: 'Suppress educational lectures. Limit response length to minimal or focused; prioritize silence or single physical anchor.',
    limitations: 'User may later request psychoeducation after resting or regulating.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Sweller (2011) Cognitive Load Theory; Hockey (1997) Compensatory Control Model of mental fatigue.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['depleted', 'low_capacity', 'overloaded'],
    applicableProblems: ['exhaustion', 'low_capacity', 'sleep_difficulty', 'overload'],
    contraindicationsOrBoundaries: ['User explicitly asking "Explain the science behind this"'],
    testMetric: 'Zero user drop-off attributable to wall-of-text fatigue',
    status: 'ACTIVE'
  },

  // --- 2. AUTONOMIC & SOMATIC REGULATION RESEARCH ---
  {
    id: 'RES_AUTONOMIC_01',
    domain: 'AUTONOMIC_REGULATION',
    claim: 'Cyclic sighing with prolonged exhalation rapidly stimulates vagal parasympathetic afferents, reducing autonomic heart rate and arousal faster than cognitive reframing.',
    evidenceLevel: 'E1',
    population: 'General population experiencing acute physiological arousal or anxiety',
    context: 'Heart racing, chest tightness, restlessness, acute agitation',
    mechanism: 'physiological_hyperarousal',
    productImplication: 'Prioritize somatic / physiological regulation (Autonomic Breath Brake) before attempting cognitive problem solving.',
    behaviorRule: 'If state is hyperaroused, recommend Autonomic Breath Brake or Thermal Pause before introducing cognitive reframing.',
    limitations: 'May cause brief dizziness if performed forcefully; must be gentle.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Balban et al. (2023) Cell Reports Medicine: Brief structured respiration practices enhance mood and reduce physiological arousal.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['hyperaroused', 'elevated_stress', 'overloaded'],
    applicableProblems: ['acute_stress', 'overload', 'loss_of_control', 'urges'],
    contraindicationsOrBoundaries: ['Respiratory medical emergency (route to medical care immediately)'],
    testMetric: 'Down-regulation of intensity score within 120 seconds',
    status: 'ACTIVE'
  },
  {
    id: 'RES_AUTONOMIC_02',
    domain: 'AUTONOMIC_REGULATION',
    claim: 'Brief thermal stimulus (cool water on hands/face) induces mild mammalian dive reflex and sensory distraction to interrupt acute escalation.',
    evidenceLevel: 'E2',
    population: 'Individuals with acute emotional overwhelm or high somatic agitation',
    context: 'Intense anger, panic spike, overwhelming sensory flood',
    mechanism: 'physiological_hyperarousal',
    productImplication: 'Use Thermal Distance Pause as low-barrier somatic anchor when user cannot sit still to breathe.',
    behaviorRule: 'Route to Thermal Distance Pause when somatic agitation is high and breath focus feels suffocating.',
    limitations: 'Temperature extremes must be avoided; gentle room-temperature or cool water only.',
    uncertainty: 'MODERATE',
    sourceMetadata: {
      citationOrBasis: 'Linehan (2014) DBT Skills Training: TIPP temperature modulation mechanics; emerging vagal stimulation literature.',
      consensusLevel: 'EMERGING',
      controlledTrialsAvailable: true
    },
    applicableStates: ['hyperaroused', 'elevated_stress'],
    applicableProblems: ['anger', 'acute_stress', 'overload', 'urges'],
    contraindicationsOrBoundaries: ['Cold sensitivity or medical cardiovascular restrictions'],
    testMetric: 'Reduction in self-reported physical agitation',
    status: 'ACTIVE'
  },

  // --- 3. COGNITIVE OVERLOAD & RUMINATION CASCADE ---
  {
    id: 'RES_RUMINATION_01',
    domain: 'COGNITIVE_OVERLOAD_RUMINATION',
    claim: 'Abstract "Why" questioning perpetuates rumination networks; shifting to concrete "What / How / What next" questions engages prefrontal executive networks and reduces affective loops.',
    evidenceLevel: 'E1',
    population: 'Adults prone to depressive or anxious rumination',
    context: 'Overthinking past events, social replays, repetitive self-criticism',
    mechanism: 'rumination_cascade',
    productImplication: 'Never ask abstract "Why do you think that is?" questions during overthinking. Convert focus to concrete sensory or factual anchors.',
    behaviorRule: 'Replace abstract "Why" interrogations with concrete "What is happening right now?" or sensory grounding.',
    limitations: 'Insight-oriented therapy uses reflection, but acute overthinking requires concrete disruption.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Watkins (2008) Psychological Bulletin: Constructive and unconstructive repetitive thought; concrete vs abstract processing.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['elevated_stress', 'overloaded', 'low_capacity', 'moderate_capacity'],
    applicableProblems: ['overthinking', 'worry', 'self_criticism', 'social_pain', 'rejection'],
    contraindicationsOrBoundaries: ['Philosophical exploratory sessions where user explicitly requests abstract inquiry'],
    testMetric: 'Termination of repetitive looped statements within 2 turns',
    status: 'ACTIVE'
  },
  {
    id: 'RES_RUMINATION_02',
    domain: 'COGNITIVE_OVERLOAD_RUMINATION',
    claim: 'Repetitive reassurance seeking increases long-term uncertainty intolerance and reinforces checking compulsions.',
    evidenceLevel: 'E1',
    population: 'Individuals caught in checking loops, health anxiety, or relationship reassurance loops',
    context: 'User asking "Pakka na?", "Are you sure?", "Sab theek hoga na?" repeatedly',
    mechanism: 'uncertainty_loop',
    productImplication: 'Anti-Reassurance Rule: Do not provide repeated soothing guarantees; validate the discomfort of uncertainty and redirect to controllable action.',
    behaviorRule: 'Limit explicit reassurance to max 1 time; on subsequent turns, name the reassurance loop and offer the Controllable-Uncontrollable Split.',
    limitations: 'Initial warm acknowledgment is acceptable; rigid refusal to reassure must not feel punitive.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Salkovskis (1999) Behaviour Research and Therapy: Reassurance seeking and the maintenance of anxiety.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['elevated_stress', 'moderate_capacity', 'overloaded'],
    applicableProblems: ['checking_loops', 'reassurance_loops', 'worry', 'uncertainty'],
    contraindicationsOrBoundaries: ['Acute traumatic disorientation requiring factual orientation'],
    testMetric: 'Reduction in subsequent reassurance queries in same session',
    status: 'ACTIVE'
  },

  // --- 4. MOTIVATION & BEHAVIORAL MOMENTUM ---
  {
    id: 'RES_MOTIVATION_01',
    domain: 'MOTIVATION_BEHAVIORAL_MOMENTUM',
    claim: 'Procrastination and action paralysis stem from anticipatory emotional distress and task friction, not character flaw or lack of willpower.',
    evidenceLevel: 'E1',
    population: 'Students and professionals experiencing avoidance and task delays',
    context: 'Avoiding studying, delaying tough emails, paralysis before work',
    mechanism: 'initiation_friction',
    productImplication: 'Interventions must reduce initiation threshold to near-zero (2-minute micro starter) rather than lecturing on long-term consequences.',
    behaviorRule: 'Deploy Micro-Friction Starter: isolate the initial 120-second physical action; eliminate outcome pressure.',
    limitations: 'High-stake complex multi-day projects eventually require detailed planning once momentum is started.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Sirois & Pychyl (2013) Social and Personality Psychology Compass: Procrastination and the priority of short-term mood regulation.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['baseline', 'elevated_stress', 'low_capacity', 'moderate_capacity'],
    applicableProblems: ['procrastination', 'avoidance', 'study_pressure', 'career_pressure', 'motivation_problems'],
    contraindicationsOrBoundaries: ['Severe clinical apathy / major depressive episode requiring medical care'],
    testMetric: 'Reported commencement of target task within 5 minutes',
    status: 'ACTIVE'
  },

  // --- 5. DEPENDENCY, AGENCY & INDEPENDENCE ---
  {
    id: 'RES_AGENCY_01',
    domain: 'DEPENDENCY_AGENCY_INDEPENDENCE',
    claim: 'Digital mental health tools that foster dependency reduce long-term perceived self-efficacy; apps must actively transfer skills to the offline world and prompt clean exit.',
    evidenceLevel: 'E1',
    population: 'Users of conversational AI and self-help software',
    context: 'Long conversational sessions (>5 turns) where user delegates all life decisions to AI',
    mechanism: 'behavioral_avoidance',
    productImplication: 'Anti-Dependency Architecture: When user reaches regulation or has an action step, explicitly encourage stepping away from the app.',
    behaviorRule: 'Track AI delegation count; if >= 3, prompt user to test the step offline before discussing further. Treat Clean Exit as primary app success.',
    limitations: 'Must not prematurely cut off users during active acute distress.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Bandura (1997) Self-Efficacy: The Exercise of Control; Torous et al. (2021) Digital Health adherence and agency ethics.',
      consensusLevel: 'ESTABLISHED_EMPIRICAL',
      controlledTrialsAvailable: true
    },
    applicableStates: ['baseline', 'moderate_capacity', 'high_capacity', 'elevated_stress'],
    applicableProblems: ['loss_of_control', 'decision_overload', 'reassurance_loops'],
    contraindicationsOrBoundaries: ['Active acute crisis / safety gateway escalation'],
    testMetric: 'Successful voluntary session exit without relapse within 60 minutes',
    status: 'ACTIVE'
  },

  // --- 6. CULTURAL & LINGUISTIC ATTUNEMENT ---
  {
    id: 'RES_CULTURE_01',
    domain: 'CULTURAL_LINGUISTIC_ATTUNEMENT',
    claim: 'Emotional distress articulated in colloquial Hinglish/Hindi ("dimag phat raha hai", "ghabrahat") carries distinct affective nuances that clinical Western idioms misinterpret as psychosis or clinical severity.',
    evidenceLevel: 'E2',
    population: 'Bilingual / multilingual Indian youth and young professionals',
    context: 'Colloquial distress expressions in Hindi or Hinglish',
    mechanism: 'cognitive_overload',
    productImplication: 'Attune tone to colloquial idiom; mirror brevity and grounded warmth without pathologizing common colloquial metaphors.',
    behaviorRule: 'Support Hinglish/Hindi phrasing directly with matching culturally grounded empathy; do not diagnose or introduce diagnostic labels.',
    limitations: 'Must distinguish colloquial hyperbole ("dimag phat raha hai") from genuine medical complaints ("sir me severe sudden headache").',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Patel et al. (2018) The Lancet Commission on global mental health and sustainable development; cultural idioms of distress.',
      consensusLevel: 'EMERGING',
      controlledTrialsAvailable: true
    },
    applicableStates: ['elevated_stress', 'overloaded', 'low_capacity'],
    applicableProblems: ['acute_stress', 'overload', 'study_pressure', 'career_pressure', 'conflict'],
    contraindicationsOrBoundaries: ['True somatic physical symptoms requiring neurological triage'],
    testMetric: 'High user felt-understanding score in bilingual mode',
    status: 'ACTIVE'
  },

  // --- 7. PHILOSOPHICAL / TRADITIONAL PERSPECTIVE (E4) ---
  {
    id: 'RES_PHILOSOPHY_01',
    domain: 'UNCERTAINTY_INTOLERANCE',
    claim: 'Partitioning life events into what is directly within one\'s control versus what depends on external variables reduces acute distress regarding uncertain outcomes.',
    evidenceLevel: 'E4',
    population: 'Individuals facing systemic, organizational, or interpersonal uncertainty',
    context: 'Waiting for exam results, job interview outcomes, medical test results',
    mechanism: 'uncertainty_loop',
    productImplication: 'Use the Controllable vs Uncontrollable Split as a cognitive decision framework, labeled as a behavioral boundary tool rather than an empirical neurobiological cure.',
    behaviorRule: 'Present the Dichotomy of Control as a practical behavioral boundary tool; do not claim it alters neural architecture.',
    limitations: 'Can be misused to promote apathy or passive acceptance of unjust situations.',
    uncertainty: 'MODERATE',
    sourceMetadata: {
      citationOrBasis: 'Epictetus / Stoic Philosophy & Acceptance and Commitment Therapy (ACT) functional adaptations.',
      consensusLevel: 'TRADITIONAL',
      controlledTrialsAvailable: false
    },
    applicableStates: ['moderate_capacity', 'high_capacity', 'elevated_stress'],
    applicableProblems: ['uncertainty', 'worry', 'career_pressure', 'difficult_choices'],
    contraindicationsOrBoundaries: ['Acute trauma or situations requiring active immediate advocacy'],
    testMetric: 'Reported reduction in uncontrollable rumination',
    status: 'ACTIVE'
  },

  // --- 8. PROHIBITED PSEUDOSCIENCE (E5 - STRICTLY BLOCKED) ---
  {
    id: 'RES_PROHIBITED_01',
    domain: 'PROHIBITED_PSEUDOSCIENCE',
    claim: 'Specific sound frequencies or quantum brainwave realignment can permanently rewire DNA and cure clinical mood disorders without medical treatment.',
    evidenceLevel: 'E5',
    population: 'Universal (Strictly Prohibited)',
    context: 'Pseudoscience queries, magical thinking, replacing psychiatric medication',
    mechanism: 'action_paralysis',
    productImplication: 'NEVER substantiate or endorse frequency-based DNA rewiring, quantum cures, or stopping prescribed medical treatment.',
    behaviorRule: 'BLOCK rule adoption. Disclaim biological or curative claims gently, re-ground in reality, and route to licensed medical providers if user seeks medical replacement.',
    limitations: 'Permanent restriction. No exceptions.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Scientific and clinical consensus; FDA and psychiatric governance prohibitions on unverified curative claims.',
      consensusLevel: 'UNSUPPORTED',
      controlledTrialsAvailable: false
    },
    applicableStates: ['baseline', 'elevated_stress', 'overloaded'],
    applicableProblems: ['urges', 'emotional_confusion'],
    contraindicationsOrBoundaries: ['All contexts. Absolute product boundary.'],
    testMetric: 'Zero adoption of E5 claims across all system turns',
    status: 'PROHIBITED'
  },
  {
    id: 'RES_PROHIBITED_02',
    domain: 'PROHIBITED_PSEUDOSCIENCE',
    claim: 'AI conversation can replace licensed psychotherapy or crisis psychiatric intervention.',
    evidenceLevel: 'E5',
    population: 'Universal (Strictly Prohibited)',
    context: 'Users asking AI to act as their therapist or doctor',
    mechanism: 'action_paralysis',
    productImplication: 'NeuroCalm is an in-the-moment stress regulation and skill-building system, never a substitute for medical or psychiatric care.',
    behaviorRule: 'BLOCK rule adoption. State boundaries clearly; route severe clinical presentations to professional human support.',
    limitations: 'Permanent restriction.',
    uncertainty: 'LOW',
    sourceMetadata: {
      citationOrBasis: 'Clinical safety regulations; APA & WHO guidelines on AI in mental health.',
      consensusLevel: 'UNSUPPORTED',
      controlledTrialsAvailable: false
    },
    applicableStates: ['overloaded', 'depleted', 'hyperaroused'],
    applicableProblems: ['acute_stress', 'loss_of_control'],
    contraindicationsOrBoundaries: ['All contexts. Safety Gateway takes precedence.'],
    testMetric: 'Zero clinical diagnosis or prescription actions',
    status: 'PROHIBITED'
  }
];

// ============================================================================
// 2. EVIDENCE-TO-PRODUCT-RULE PIPELINE ENGINE
// ============================================================================

export interface PipelineEvaluationInput {
  text: string;
  problem: ProblemCategory;
  state: CurrentState;
  capacity: CapacityLevel;
  reassuranceCount: number;
  sessionTurnCount: number;
  isCrisis: boolean;
  userRequestedCleanExit: boolean;
  explicitListeningOnly: boolean;
}

export class ResearchPolicyEngine {
  private registry: ResearchKnowledgeItem[];

  constructor(customRegistry: ResearchKnowledgeItem[] = RESEARCH_KNOWLEDGE_REGISTRY) {
    this.registry = customRegistry;
  }

  /**
   * Retrieves all items in the registry
   */
  public getAllItems(): ResearchKnowledgeItem[] {
    return [...this.registry];
  }

  /**
   * Pipeline Execution:
   * CLAIM
   *   → EVIDENCE CHECK
   *   → CONTEXT MATCH
   *   → MECHANISM
   *   → LIMITATION CHECK
   *   → PRODUCT FIT
   *   → BEHAVIOR RULE
   *   → AUDIT
   */
  public evaluatePipeline(input: PipelineEvaluationInput): ResearchIntelligenceAudit {
    const admissibleRules: EvidenceEvaluationResult[] = [];
    const rejectedRules: { itemId: string; reason: string }[] = [];
    const prohibitedRulesBlocked: string[] = [];

    for (const item of this.registry) {
      // 1. EVIDENCE CHECK: E5 / PROHIBITED is strictly blocked
      if (item.evidenceLevel === 'E5' || item.status === 'PROHIBITED') {
        prohibitedRulesBlocked.push(item.id);
        rejectedRules.push({
          itemId: item.id,
          reason: `Evidence Level E5 / Status PROHIBITED: "${item.claim.slice(0, 50)}..."`
        });
        continue;
      }

      // 2. STATUS CHECK
      if (item.status === 'DEPRECATED') {
        rejectedRules.push({
          itemId: item.id,
          reason: `Status is DEPRECATED`
        });
        continue;
      }

      // 3. CONTEXT MATCH
      const stateMatches = item.applicableStates.includes(input.state);
      const problemMatches = item.applicableProblems.includes(input.problem);
      
      // Match if either state or problem directly matches
      if (!stateMatches && !problemMatches) {
        rejectedRules.push({
          itemId: item.id,
          reason: `Context mismatch: State (${input.state}) and Problem (${input.problem}) not in applicable scopes.`
        });
        continue;
      }

      // 4. LIMITATION & BOUNDARY CHECK
      let contraindicationTriggered: string | undefined;

      if (input.isCrisis) {
        contraindicationTriggered = 'Active Crisis: Safety Gateway escalation supersedes research rules';
      } else if (input.userRequestedCleanExit && item.id !== 'RES_AGENCY_01') {
        contraindicationTriggered = 'User requested clean exit: Interventions suppressed';
      } else if (input.explicitListeningOnly && item.domain === 'MOTIVATION_BEHAVIORAL_MOMENTUM') {
        contraindicationTriggered = 'User requested explicit listening only: Action push suppressed';
      }

      if (contraindicationTriggered) {
        rejectedRules.push({
          itemId: item.id,
          reason: `Contraindication: ${contraindicationTriggered}`
        });
        continue;
      }

      // 5. PRODUCT FIT & BEHAVIOR RULE GENERATION
      const recommendation: EvidenceEvaluationResult['productRecommendation'] = {};

      // STRESS_CAP_01 rule
      if (item.id === 'RES_STRESS_CAP_01' && input.capacity === 'LOW') {
        recommendation.maxQuestionBudget = 0;
        recommendation.recommendedStrategy = 'REDUCE';
      }

      // AUTONOMIC_01 rule: Somatic first when hyperaroused
      if (item.id === 'RES_AUTONOMIC_01' && (input.state === 'hyperaroused' || input.state === 'elevated_stress')) {
        recommendation.somaticFirst = true;
        recommendation.recommendedStrategy = 'GROUND';
      }

      // RUMINATION_02 rule: Anti-reassurance
      if (item.id === 'RES_RUMINATION_02' && input.reassuranceCount >= 2) {
        recommendation.antiReassuranceActive = true;
        recommendation.recommendedStrategy = 'CHALLENGE';
      }

      // MOTIVATION_01 rule: Micro-friction starter
      if (item.id === 'RES_MOTIVATION_01' && (input.problem === 'procrastination' || input.problem === 'avoidance')) {
        recommendation.microFrictionTarget = true;
        recommendation.recommendedStrategy = 'ACTIVATE';
      }

      // AGENCY_01 rule: Encourage clean exit / offline movement
      if (item.id === 'RES_AGENCY_01' && input.sessionTurnCount >= 4) {
        recommendation.encourageOfflineMovement = true;
      }

      // E4 traditional humility flag
      if (item.evidenceLevel === 'E4') {
        recommendation.humilityFlag = true;
      }

      admissibleRules.push({
        itemId: item.id,
        matched: true,
        evidenceLevel: item.evidenceLevel,
        admissible: true,
        contraindicationTriggered,
        governedRule: item.behaviorRule,
        productRecommendation: recommendation
      });
    }

    // Determine dominant evidence level
    const hasE1 = admissibleRules.some((r) => r.evidenceLevel === 'E1');
    const hasE2 = admissibleRules.some((r) => r.evidenceLevel === 'E2');
    const hasE3 = admissibleRules.some((r) => r.evidenceLevel === 'E3');
    const dominantEvidenceLevel: EvidenceLevel = hasE1 ? 'E1' : hasE2 ? 'E2' : hasE3 ? 'E3' : 'E4';

    const guidanceConfidence = admissibleRules.length > 0 ? (hasE1 ? 0.95 : hasE2 ? 0.8 : 0.65) : 0.5;

    return {
      activeRulesCount: admissibleRules.length,
      admissibleRules,
      rejectedRules,
      prohibitedRulesBlocked,
      dominantEvidenceLevel,
      guidanceConfidence
    };
  }

  /**
   * Checks if an incoming statement contains prohibited pseudoscience claims
   */
  public detectProhibitedClaim(text: string): { isProhibited: boolean; reason?: string } {
    const prohibitedPatterns = [
      {
        pattern: /\b(rewir(e|ing) dna|frequency heal(ing)?|quantum heal(ing)?|subliminal.*cure)\b/i,
        reason: 'E5 Prohibited: Unsupported pseudoscientific biological claims.'
      },
      {
        pattern: /\b(stop taking (meds|medication|antidepressants)|doctor ki zaroorat nahi hai)\b/i,
        reason: 'E5 Prohibited: Unauthorized medical countermanding.'
      },
      {
        pattern: /\b(100% cure for (depression|bipolar|schizophrenia|ptsd))\b/i,
        reason: 'E5 Prohibited: Unverified universal medical cure claims.'
      }
    ];

    for (const p of prohibitedPatterns) {
      if (p.pattern.test(text)) {
        return { isProhibited: true, reason: p.reason };
      }
    }

    return { isProhibited: false };
  }
}

export const researchPolicyEngine = new ResearchPolicyEngine();
