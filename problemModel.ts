/**
 * NEUROCALM PROBLEM MODEL & CLASSIFIER
 * Identifies functional problems, overthinking subtypes, and mechanism hypotheses.
 * No medical diagnoses. Purely functional problem-solving framework.
 */

import {
  ProblemCategory,
  OverthinkingSubtype,
  FunctionalMechanism,
  CurrentState,
  CapacityLevel
} from '../types/neurocalm';

export interface ProblemAnalysis {
  primaryProblem: ProblemCategory;
  confidence: number; // 0 to 1
  overthinkingSubtype?: OverthinkingSubtype;
  hypothesizedMechanism: FunctionalMechanism;
  inferredState: CurrentState;
  suggestedCapacity: CapacityLevel;
}

export class ProblemModel {
  /**
   * Evaluates text and extracts functional problem and mechanism hypothesis
   */
  public analyzeProblem(input: string, explicitProblem?: ProblemCategory): ProblemAnalysis {
    const text = input.toLowerCase();

    // If explicitly provided via UI chip or quick picker
    if (explicitProblem) {
      return {
        primaryProblem: explicitProblem,
        confidence: 0.95,
        hypothesizedMechanism: this.mapMechanismForProblem(explicitProblem),
        inferredState: this.inferStateFromText(text),
        suggestedCapacity: this.inferCapacityFromText(text),
        overthinkingSubtype: this.detectOverthinkingSubtype(text)
      };
    }

    // Keyword heuristics for English, Hindi, and Hinglish
    if (/\b(exam|padhai|study|syllabus|test|marks|college|school)\b/.test(text)) {
      return {
        primaryProblem: 'study_pressure',
        confidence: 0.88,
        hypothesizedMechanism: 'cognitive_overload',
        inferredState: 'overloaded',
        suggestedCapacity: 'MEDIUM',
        overthinkingSubtype: 'FUTURE_WORRY'
      };
    }

    if (/\b(procrastinat|kal karunga|taal raha|start nahi ho raha|delay|avoid)\b/.test(text)) {
      return {
        primaryProblem: 'procrastination',
        confidence: 0.9,
        hypothesizedMechanism: 'initiation_friction',
        inferredState: 'moderate_capacity',
        suggestedCapacity: 'LOW'
      };
    }

    if (/\b(rejection|mana kar diya|reject|left me|breakup|dil toot gaya|ignored)\b/.test(text)) {
      return {
        primaryProblem: 'rejection',
        confidence: 0.85,
        hypothesizedMechanism: 'identity_event_fusion',
        inferredState: 'elevated_stress',
        suggestedCapacity: 'LOW',
        overthinkingSubtype: 'SOCIAL_REPLAY'
      };
    }

    if (/\b(decision|choose|options|kya karun samajh nahi aa raha|confused|dilemma)\b/.test(text)) {
      return {
        primaryProblem: 'decision_overload',
        confidence: 0.87,
        hypothesizedMechanism: 'uncertainty_loop',
        inferredState: 'moderate_capacity',
        suggestedCapacity: 'MEDIUM',
        overthinkingSubtype: 'DECISION_LOOP'
      };
    }

    if (/\b(anger|gussa|furious|irritated|chidh|annoyed|ladai|fight)\b/.test(text)) {
      return {
        primaryProblem: 'anger',
        confidence: 0.9,
        hypothesizedMechanism: 'physiological_hyperarousal',
        inferredState: 'hyperaroused',
        suggestedCapacity: 'LOW'
      };
    }

    if (/\b(guilt|shame|meri galti|sharm|regret|pachtawa)\b/.test(text)) {
      return {
        primaryProblem: 'guilt',
        confidence: 0.85,
        hypothesizedMechanism: 'rumination_cascade',
        inferredState: 'depleted',
        suggestedCapacity: 'LOW',
        overthinkingSubtype: 'SELF_ATTACK'
      };
    }

    if (/\b(urge|craving|habit|smoking|scrolling|phone|addiction|talab)\b/.test(text)) {
      return {
        primaryProblem: 'urges',
        confidence: 0.88,
        hypothesizedMechanism: 'urge_response_coupling',
        inferredState: 'elevated_stress',
        suggestedCapacity: 'MEDIUM'
      };
    }

    if (/\b(sleep|insomnia|neend|raat|so nahi pa raha|tossing)\b/.test(text)) {
      return {
        primaryProblem: 'sleep_difficulty',
        confidence: 0.9,
        hypothesizedMechanism: 'physiological_hyperarousal',
        inferredState: 'depleted',
        suggestedCapacity: 'LOW'
      };
    }

    if (/\b(overthinking|dimag ghum raha|sochta rehta|thoughts won't stop|loop)\b/.test(text)) {
      const subtype = this.detectOverthinkingSubtype(text);
      return {
        primaryProblem: 'overthinking',
        confidence: 0.85,
        hypothesizedMechanism: 'working_memory_overload',
        inferredState: 'overloaded',
        suggestedCapacity: 'MEDIUM',
        overthinkingSubtype: subtype
      };
    }

    // Default fallback: acute_stress with uncertainty flagged
    return {
      primaryProblem: 'acute_stress',
      confidence: 0.6,
      hypothesizedMechanism: 'cognitive_overload',
      inferredState: this.inferStateFromText(text),
      suggestedCapacity: 'MEDIUM'
    };
  }

  public detectOverthinkingSubtype(text: string): OverthinkingSubtype {
    if (/\b(kyun kiya|woh din|past|galti hui thi|regret)\b/i.test(text)) return 'PAST_REPLAY';
    if (/\b(kya hoga|what if|future|kal|worst case)\b/i.test(text)) return 'FUTURE_WORRY';
    if (/\b(usne kya socha|what they think|embarrassing|log kya kahenge|said to me)\b/i.test(text)) return 'SOCIAL_REPLAY';
    if (/\b(option a|option b|choose|right or wrong|decision)\b/i.test(text)) return 'DECISION_LOOP';
    if (/\b(i am stupid|meri hi kami|worthless|loser|i ruined it)\b/i.test(text)) return 'SELF_ATTACK';
    if (/\b(agar aisa ho gaya toh aur fir|infinite|neverending)\b/i.test(text)) return 'INFINITE_WHAT_IF';
    return 'EMOTIONAL_HIT_LOOP';
  }

  public mapMechanismForProblem(problem: ProblemCategory): FunctionalMechanism {
    switch (problem) {
      case 'overthinking':
      case 'overload':
        return 'working_memory_overload';
      case 'acute_stress':
      case 'anger':
        return 'physiological_hyperarousal';
      case 'worry':
      case 'uncertainty':
      case 'decision_overload':
      case 'difficult_choices':
        return 'uncertainty_loop';
      case 'procrastination':
      case 'avoidance':
      case 'motivation_problems':
        return 'initiation_friction';
      case 'urges':
      case 'habits':
        return 'urge_response_coupling';
      case 'rejection':
      case 'shame':
      case 'self_criticism':
      case 'failure':
        return 'identity_event_fusion';
      case 'guilt':
      case 'conflict':
        return 'rumination_cascade';
      default:
        return 'cognitive_overload';
    }
  }

  public inferStateFromText(text: string): CurrentState {
    if (/\b(exhausted|drained|no energy|thak gaya|dead tired|empty)\b/i.test(text)) return 'depleted';
    if (/\b(panicking|heart racing|shaking|furious|extreme|freaking out)\b/i.test(text)) return 'hyperaroused';
    if (/\b(too much|overwhelmed|blast|heavy|phat raha hai)\b/i.test(text)) return 'overloaded';
    if (/\b(stressed|tense|anxious|pareshan|tension)\b/i.test(text)) return 'elevated_stress';
    return 'moderate_capacity';
  }

  public inferCapacityFromText(text: string): CapacityLevel {
    if (/\b(can't think|exhausted|too much|leave me alone|no energy|bas ho gaya)\b/i.test(text)) return 'LOW';
    if (/\b(want to solve|ready|tell me steps|guide me|planning)\b/i.test(text)) return 'HIGH';
    return 'MEDIUM';
  }
}

export const problemModel = new ProblemModel();
