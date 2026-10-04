/**
 * NEUROCALM COMPETING MECHANISM EXPLORER & CHEAPEST DISCRIMINATING TEST (Section 8 & 9)
 *
 * Implements:
 * 1. Multi-Hypothesis Mechanism Evaluation (19 mechanism families)
 * 2. Competing Hypotheses Tracking (Likelihood, Supporting Evidence, Counter Evidence)
 * 3. The Cheapest Discriminating Test:
 *    When multiple explanations are plausible, never interrogate the user.
 *    Propose the smallest useful distinction or smallest reversible action
 *    to separate competing hypotheses with minimal cognitive load.
 */

import {
  MechanismFamily,
  CompetingMechanismHypothesis,
  CheapestDiscriminatingTest,
  EmotionSignal,
  SupportNeedAssessment,
  ConversationSignals
} from '../types/neurocalm';

export class MechanismExplorer {
  /**
   * Formulates competing mechanism hypotheses based on observable input signals and context.
   */
  public evaluateCompetingMechanisms(
    text: string,
    emotion: EmotionSignal,
    need: SupportNeedAssessment,
    signals?: ConversationSignals
  ): {
    hypotheses: CompetingMechanismHypothesis[];
    primary: CompetingMechanismHypothesis;
    discriminatingTest?: CheapestDiscriminatingTest;
  } {
    const lower = text.toLowerCase();
    const hypotheses: CompetingMechanismHypothesis[] = [];

    // Family 1: Repetitive Negative Thinking / Rumination
    const hasRuminationSignals =
      /\b(dimag ruk hi nahi raha|baar baar wahi|past|replay|kyu bola|sochta rehta hu|loop)\b/i.test(lower);
    hypotheses.push({
      family: 'repetitive_negative_thinking',
      mechanism: 'rumination_cascade',
      likelihood: hasRuminationSignals ? 0.85 : 0.2,
      supportingEvidence: hasRuminationSignals ? ['Repeated thoughts of past events or uncontrollable loop reported'] : [],
      counterEvidence: lower.includes('what should i do now') ? ['Focus is oriented to immediate future action'] : [],
      isPrimary: false
    });

    // Family 2: Worry / Uncertainty Loop
    const hasWorrySignals =
      /\b(kya hoga|what if|uncertain|future|pata nahi kya hone wala|doubt|dar lag raha hai)\b/i.test(lower);
    hypotheses.push({
      family: 'worry_uncertainty',
      mechanism: 'uncertainty_loop',
      likelihood: hasWorrySignals ? 0.85 : 0.25,
      supportingEvidence: hasWorrySignals ? ['Anticipatory forecasting of future uncertainty'] : [],
      counterEvidence: hasRuminationSignals ? ['Content leans toward past rumination'] : [],
      isPrimary: false
    });

    // Family 3: Cognitive Overload
    const hasOverloadSignals =
      /\b(too much|overwhelmed|blast ho raha|exhausted|drained|cannot think|sab ek sath)\b/i.test(lower) ||
      (signals?.fragmentation ?? false);
    hypotheses.push({
      family: 'cognitive_overload',
      mechanism: 'working_memory_overload',
      likelihood: hasOverloadSignals ? 0.9 : 0.3,
      supportingEvidence: hasOverloadSignals ? ['Report of mental exhaustion or cognitive saturation'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 4: Behavioral Avoidance / Initiation Friction
    const hasAvoidanceSignals =
      /\b(taal raha|procrastinat|start nahi ho raha|man nahi kar raha|postpone|stuck)\b/i.test(lower);
    hypotheses.push({
      family: 'behavioral_avoidance',
      mechanism: 'initiation_friction',
      likelihood: hasAvoidanceSignals ? 0.88 : 0.15,
      supportingEvidence: hasAvoidanceSignals ? ['Task delayed despite clear deadline or intent'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 5: Decision Conflict
    const hasDecisionSignals =
      /\b(decision|choose|choice|options|accept karun ya|karna chahiye ya|karu ya na)\b/i.test(lower);
    hypotheses.push({
      family: 'decision_conflict',
      mechanism: 'action_paralysis',
      likelihood: hasDecisionSignals ? 0.92 : 0.1,
      supportingEvidence: hasDecisionSignals ? ['Competing alternatives creating paralysis'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 6: Reassurance / Checking Loop
    const hasCheckingSignals =
      /\b(baar baar.*check|same cheez check|confirm kar do|pakka na|sure ho)\b/i.test(lower);
    hypotheses.push({
      family: 'reassurance_loops',
      mechanism: 'uncertainty_loop',
      likelihood: hasCheckingSignals ? 0.95 : 0.05,
      supportingEvidence: hasCheckingSignals ? ['Compulsive re-verification to relieve anxiety'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 7: Physiological Hyperarousal
    const hasArousalSignals =
      /\b(heart racing|ghabrahat|trembling|panic|breath|chhati me|hyper|gussa)\b/i.test(lower);
    hypotheses.push({
      family: 'emotion_regulation',
      mechanism: 'physiological_hyperarousal',
      likelihood: hasArousalSignals ? 0.9 : 0.2,
      supportingEvidence: hasArousalSignals ? ['Somatic autonomic activation reported'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 8: Attachment Longing / Interpersonal Loss
    const hasAttachmentSignals =
      /\b(ladki|ladka|miss|yaad|crush|ex|breakup|pyaar|chhod diya|alag|relationship)\b/i.test(lower);
    hypotheses.push({
      family: 'rejection_attachment',
      mechanism: 'attachment_longing',
      likelihood: hasAttachmentSignals ? 0.88 : 0.1,
      supportingEvidence: hasAttachmentSignals ? ['Longing or unresolved bond to a specific person reported'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 9: Situational Social Disconnection / Loneliness
    const hasIsolationSignals =
      /\b(akela|akelapan|lonely|alone|isolated|koi nahi|solitude|empty)\b/i.test(lower);
    hypotheses.push({
      family: 'social_disconnection',
      mechanism: 'social_isolation',
      likelihood: hasIsolationSignals ? 0.86 : 0.15,
      supportingEvidence: hasIsolationSignals ? ['Current acute state of aloneness or lack of connection'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Family 10: Diurnal / Nighttime Vulnerability
    const hasDiurnalSignals =
      /\b(raat|night|late night|bed pe|neend|so nahi pa raha)\b/i.test(lower);
    hypotheses.push({
      family: 'sleep_stress',
      mechanism: 'diurnal_rumination_amplification',
      likelihood: hasDiurnalSignals ? 0.84 : 0.1,
      supportingEvidence: hasDiurnalSignals ? ['Nighttime context with reduced sensory distraction exacerbating mental replay'] : [],
      counterEvidence: [],
      isPrimary: false
    });

    // Sort by likelihood descending
    hypotheses.sort((a, b) => b.likelihood - a.likelihood);
    const primary = hypotheses[0];
    primary.isPrimary = true;

    // Check if we have two close competing hypotheses requiring a Discriminating Test
    let discriminatingTest: CheapestDiscriminatingTest | undefined = undefined;
    const secondary = hypotheses[1];

    if (secondary && Math.abs(primary.likelihood - secondary.likelihood) < 0.25 && secondary.likelihood > 0.6) {
      discriminatingTest = this.designCheapestTest(primary, secondary);
    }

    return {
      hypotheses: hypotheses.slice(0, 5),
      primary,
      discriminatingTest
    };
  }

  /**
   * Generates the cheapest discriminating question or move between two competing hypotheses
   */
  private designCheapestTest(
    hypA: CompetingMechanismHypothesis,
    hypB: CompetingMechanismHypothesis
  ): CheapestDiscriminatingTest {
    // Example: Overload vs Unresolved Problem
    if (
      (hypA.family === 'cognitive_overload' && hypB.family === 'problem_solving') ||
      (hypA.family === 'problem_solving' && hypB.family === 'cognitive_overload')
    ) {
      return {
        testType: 'QUESTION',
        prompt: 'Kya abhi dimag itna thaka hai ki sochna mushkil hai, ya samne ek specific uljhan hai jiska hal nikalna hai?',
        targetHypotheses: [hypA.family, hypB.family],
        cognitiveCost: 'MINIMAL',
        rationale: 'Distinguishes between raw prefrontal depletion (needs pause) vs specific blocked task (needs micro-step).'
      };
    }

    // Example: Rumination loop vs Future Worry
    if (
      (hypA.family === 'repetitive_negative_thinking' && hypB.family === 'worry_uncertainty') ||
      (hypA.family === 'worry_uncertainty' && hypB.family === 'repetitive_negative_thinking')
    ) {
      return {
        testType: 'QUESTION',
        prompt: 'Kya dimag kisi purani baat ko baar-baar repeat kar raha hai, ya aage aane wali kisi chinta pe atka hai?',
        targetHypotheses: [hypA.family, hypB.family],
        cognitiveCost: 'MINIMAL',
        rationale: 'Distinguishes between retrospective replay (needs attention externalization) vs prospective worry (needs uncertainty split).'
      };
    }

    // Example: Somatic Hyperarousal vs Cognitive Overthinking
    if (
      (hypA.family === 'emotion_regulation' && hypB.family === 'repetitive_negative_thinking') ||
      (hypA.family === 'repetitive_negative_thinking' && hypB.family === 'emotion_regulation')
    ) {
      return {
        testType: 'OBSERVATION',
        prompt: 'Body me tez ghabrahat ya agitation feel ho rahi hai, ya sirf dimag me thoughts tez chal rahe hain?',
        targetHypotheses: [hypA.family, hypB.family],
        cognitiveCost: 'MINIMAL',
        rationale: 'Somatic-first rule requires autonomic regulation before cognitive reframing if physical arousal is dominant.'
      };
    }

    // Example: Attachment Longing vs Situational Loneliness / Nighttime vulnerability
    if (
      (hypA.family === 'rejection_attachment' && (hypB.family === 'social_disconnection' || hypB.family === 'sleep_stress')) ||
      (hypB.family === 'rejection_attachment' && (hypA.family === 'social_disconnection' || hypA.family === 'sleep_stress'))
    ) {
      return {
        testType: 'OBSERVATION',
        prompt: 'Ek possibility ye ho sakti hai ki raat ka akelapan us insaan ki yaad ko intensify kar raha hai—kya din me jab distraction hoti hai tab bhi ye utna hi hit karta hai?',
        targetHypotheses: [hypA.family, hypB.family],
        cognitiveCost: 'MINIMAL',
        rationale: 'Separates specific interpersonal attachment grief from ambient nighttime loneliness.'
      };
    }

    // Default Low-friction test
    return {
      testType: 'QUESTION',
      prompt: 'Abhi sabse zyada zaroorat kis cheez ki lagti hai: thoda theherna, ya aage ka rasta dekhna?',
      targetHypotheses: [hypA.family, hypB.family],
      cognitiveCost: 'MINIMAL',
      rationale: 'Safely separates pause/decompression from structured problem solving.'
    };
  }
}

export const mechanismExplorer = new MechanismExplorer();
