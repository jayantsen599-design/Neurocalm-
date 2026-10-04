/**
 * NEUROCALM MULTI-TURN TRAJECTORY & ASSISTANCE DECAY ENGINE (Section 24 & 26)
 *
 * Tracks conversational evolution across turns:
 * 1. Distress trajectory
 * 2. Clarity trajectory
 * 3. Agency trajectory
 * 4. AI reliance score
 * 5. Reassurance & Looping detection
 * 6. Assistance decay progression:
 *    FULL_GUIDANCE → GUIDED_ACTION → SMALL_CUE → USER_CHOOSES → INDEPENDENT → NO_AI_REQUIRED
 */

import {
  MultiTurnTrajectory,
  AssistanceLevel,
  ConversationTurnAnalysis,
  OutcomeType
} from '../types/neurocalm';

export class MultiTurnTrajectoryEngine {
  /**
   * Evaluates the trajectory across turns and computes trend metrics
   */
  public evaluateTrajectory(
    currentTurnHistory: ConversationTurnAnalysis[],
    currentRawInput: string,
    currentDistress: number
  ): MultiTurnTrajectory {
    const text = currentRawInput.toLowerCase();
    const history = currentTurnHistory;

    const distressScores: number[] = history.map(t => t.emotionSignal.intensityEstimate);
    distressScores.push(currentDistress);

    // Estimate clarity: higher when user describes facts, specifies problem, or makes choices
    const clarityScores: number[] = history.map(t => {
      if (t.supportNeed.need === 'CLARIFICATION' || t.conversationSignals?.hasPataNahi) return 3;
      if (t.supportNeed.need === 'DECISION_SUPPORT' || t.supportNeed.need === 'ACTION') return 7;
      if (t.responseStrategy.strategy === 'CLEAN_EXIT') return 9;
      return 5;
    });
    const currentClarity = /\b(pata nahi|confused|unclear)\b/i.test(text) ? 3 : (text.length > 20 ? 7 : 5);
    clarityScores.push(currentClarity);

    // Estimate agency: higher when user acts, questions, corrects, or decides
    const agencyScores: number[] = history.map(t => {
      if (t.livingContext.status === 'USER_CORRECTED') return 9;
      if (t.supportNeed.need === 'ACTION' || t.supportNeed.need === 'SKILL_BUILDING') return 8;
      return 5;
    });
    const currentAgency = /^(nahi|no|main karunga|i will|main decide karunga)/i.test(text) ? 8 : 5;
    agencyScores.push(currentAgency);

    // Track reassurance seeking
    let reassuranceCount = 0;
    for (const t of history) {
      if (/\b(baar baar.*check|pakka na|sure ho|confirm kar do|will it be ok|are you sure)\b/i.test(t.userMessage)) {
        reassuranceCount++;
      }
    }
    if (/\b(baar baar.*check|pakka na|sure ho|confirm kar do|will it be ok|are you sure)\b/i.test(text)) {
      reassuranceCount++;
    }

    // Looping detection: repeated same complaints or repeated non-action
    const loopingDetected = reassuranceCount >= 2 || (history.length >= 3 && history.slice(-2).every(t => t.supportNeed.need === history[history.length - 1]?.supportNeed.need));

    // Calculate AI reliance score:
    // Rises if session is long, user repeatedly asks AI what to do without testing offline
    const sessionLength = history.length + 1;
    let aiRelianceScore = Math.min(1.0, (sessionLength * 0.08) + (reassuranceCount * 0.15));

    // Strategy repetition count
    let strategyRepetitionCount = 0;
    if (history.length >= 2) {
      const lastStrat = history[history.length - 1].governorDecision?.primaryStrategy;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].governorDecision?.primaryStrategy === lastStrat) {
          strategyRepetitionCount++;
        } else {
          break;
        }
      }
    }

    // Action readiness
    let actionReadiness: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
    if (currentDistress >= 8 || /\b(exhausted|can't think|drained)\b/i.test(text)) {
      actionReadiness = 'LOW';
    } else if (/\b(kya karu|steps|start|ready|solve|action)\b/i.test(text)) {
      actionReadiness = 'HIGH';
    }

    // Trend determination
    let trajectoryTrend: 'IMPROVING' | 'STAGNANT' | 'OVER_RELIANT' | 'ESCALATING' = 'STAGNANT';
    const recentDistress = distressScores.slice(-3);
    if (recentDistress.length >= 2 && recentDistress[recentDistress.length - 1] < recentDistress[0]) {
      if (aiRelianceScore > 0.6) {
        trajectoryTrend = 'OVER_RELIANT';
      } else {
        trajectoryTrend = 'IMPROVING';
      }
    } else if (recentDistress.length >= 2 && recentDistress[recentDistress.length - 1] > recentDistress[0]) {
      trajectoryTrend = 'ESCALATING';
    } else if (loopingDetected || aiRelianceScore > 0.7) {
      trajectoryTrend = 'OVER_RELIANT';
    }

    // Recommended shift
    let recommendedShift: 'INCREASE_INDEPENDENCE' | 'CHANGE_STRATEGY' | 'STEP_DOWN_LOAD' | 'MAINTAIN' = 'MAINTAIN';
    if (trajectoryTrend === 'OVER_RELIANT' || sessionLength >= 8) {
      recommendedShift = 'INCREASE_INDEPENDENCE';
    } else if (strategyRepetitionCount >= 2 || loopingDetected) {
      recommendedShift = 'CHANGE_STRATEGY';
    } else if (currentDistress >= 8) {
      recommendedShift = 'STEP_DOWN_LOAD';
    }

    return {
      distressScores,
      clarityScores,
      agencyScores,
      aiRelianceScore,
      loopingDetected,
      reassuranceCount,
      actionReadiness,
      strategyRepetitionCount,
      trajectoryTrend,
      recommendedShift
    };
  }

  /**
   * Calculates progressive assistance decay level based on user practice count and outcomes
   */
  public calculateAssistanceLevel(
    successfulPractices: number,
    currentCapacity: string,
    recentOutcome?: OutcomeType
  ): AssistanceLevel {
    if (currentCapacity === 'LOW' || recentOutcome === 'WORSE' || recentOutcome === 'NO_CHANGE') {
      return 'FULL_GUIDANCE';
    }
    if (successfulPractices >= 5) return 'USER_ACTS_WITHOUT_AI';
    if (successfulPractices >= 3) return 'USER_CHOOSES';
    if (successfulPractices >= 2) return 'CUE_ONLY';
    if (successfulPractices >= 1) return 'SHORT_REMINDER';
    return 'FULL_GUIDANCE';
  }
}

export const multiTurnTrajectoryEngine = new MultiTurnTrajectoryEngine();
