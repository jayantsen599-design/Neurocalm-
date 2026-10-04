/**
 * NEUROCALM FAILURE LEARNING & ATTRIBUTION ENGINE (Section 22 Architecture)
 *
 * When an intervention or response does not help (NO_CHANGE or WORSE):
 * Classifies the failure cause rather than blaming user effort:
 * - WRONG_PROBLEM_MODEL
 * - WRONG_MECHANISM
 * - WRONG_INTERVENTION
 * - WRONG_DOSE
 * - WRONG_TIMING
 * - LOW_CAPACITY
 * - LOW_RECEPTIVITY
 * - TOO_MUCH_FRICTION
 * - WRONG_GOAL
 * - WRONG_CONTEXT
 * - INSUFFICIENT_INFO
 * - RANDOM_VARIATION
 *
 * Updates the hypothesis and generates the cheapest useful recovery move.
 */

import {
  FailureAttribution,
  FailureCause,
  OutcomeType,
  ProblemCategory,
  FunctionalMechanism,
  CapacityLevel
} from '../types/neurocalm';

export interface FailureContext {
  outcome: OutcomeType;
  problem: ProblemCategory;
  mechanism?: FunctionalMechanism;
  interventionId?: string;
  capacity: CapacityLevel;
  userFeedbackText?: string;
  sessionFailedInterventions: string[];
}

export class FailureLearningEngine {
  public analyzeFailure(context: FailureContext): FailureAttribution {
    const text = (context.userFeedbackText || '').toLowerCase();

    // 1. Friction / Execution failure
    if (/\b(too long|mushkil tha|hard|nahi ho paya|bored|adhura chhod diya)\b/i.test(text)) {
      return {
        cause: 'TOO_MUCH_FRICTION',
        updatedHypothesis: 'Cognitive friction exceeded processing threshold; micro-dose required.',
        cheapestRecoveryMove: 'Reduce task duration to under 60 seconds; isolate single physical sensory anchor.',
        disqualifiedInterventionId: context.interventionId
      };
    }

    // 2. Low Capacity Mismatch
    if (context.capacity === 'LOW' || /\b(thak gaya|exhausted|headache|cannot think)\b/i.test(text)) {
      return {
        cause: 'LOW_CAPACITY',
        updatedHypothesis: 'User is experiencing acute ego depletion; active problem solving is contraindicated.',
        cheapestRecoveryMove: 'Zero-demand pause: allow somatic settling without any mental exercises.',
        disqualifiedInterventionId: context.interventionId
      };
    }

    // 3. Wrong Problem Model
    if (/\b(ye problem nahi hai|galat samjhe|issue kuch aur hai|problem is different)\b/i.test(text)) {
      return {
        cause: 'WRONG_PROBLEM_MODEL',
        updatedHypothesis: 'Prior problem hypothesis invalidated by direct user correction.',
        cheapestRecoveryMove: 'Accept correction immediately; invite user to state the single core friction point.',
        disqualifiedInterventionId: context.interventionId
      };
    }

    // 4. Repeated failure with same intervention
    if (context.interventionId && context.sessionFailedInterventions.filter(id => id === context.interventionId).length >= 1) {
      return {
        cause: 'WRONG_INTERVENTION',
        updatedHypothesis: `Intervention [${context.interventionId}] has failed repeatedly in current session.`,
        cheapestRecoveryMove: 'Disqualify intervention globally for this session and pivot to alternative mechanism family.',
        disqualifiedInterventionId: context.interventionId
      };
    }

    // 5. Default No-Change outcome
    return {
      cause: 'WRONG_MECHANISM',
      updatedHypothesis: 'Current mechanism hypothesis did not produce proximal relief; shift from cognitive to somatic/attentional.',
      cheapestRecoveryMove: 'Step down cognitive complexity by one tier and test low-friction attention shift.',
      disqualifiedInterventionId: context.interventionId
    };
  }
}

export const failureLearningEngine = new FailureLearningEngine();
