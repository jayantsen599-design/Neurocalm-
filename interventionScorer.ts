/**
 * NEUROCALM MULTI-FACTOR INTERVENTION SCORER
 * Conceptual formula:
 * finalScore = baseScore + mechanismFit + contextFit + stateFit + capacityFit + receptivityFit
 *              + boundedPersonalization - contextualFailurePenalty - sessionRepeatPenalty
 *
 * Enforces:
 * 1. NOT_READY hard gate (disqualifies normal selection)
 * 2. State suitability override (current state > historical memory)
 * 3. Bounded personalization [-25, +8]
 * 4. Safe fallback if no candidates or empty library
 */

import {
  Intervention,
  ProblemCategory,
  FunctionalMechanism,
  CurrentState,
  CapacityLevel,
  ReceptivityLevel,
  UserContext,
  ScoringAudit
} from '../types/neurocalm';
import { CALIBRATED_INTERVENTIONS, SAFE_FALLBACK_INTERVENTION } from './interventionLibrary';
import { memoryManager } from './memoryManager';

export interface ScoringParams {
  problem: ProblemCategory;
  mechanism: FunctionalMechanism;
  state: CurrentState;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  context: UserContext;
  sessionFailedInterventions: string[];
  customCatalog?: Intervention[];
}

export interface ScoredSelection {
  selectedIntervention: Intervention;
  isFallback: boolean;
  audits: ScoringAudit[];
  winningScore: number;
}

export class InterventionScorer {
  /**
   * Scores and ranks interventions
   */
  public selectBestIntervention(params: ScoringParams): ScoredSelection {
    const catalog = params.customCatalog || CALIBRATED_INTERVENTIONS;
    const audits: ScoringAudit[] = [];

    // HARD GATE 1: If Receptivity is NOT_READY, abort normal selection
    if (params.receptivity === 'NOT_READY') {
      return {
        selectedIntervention: SAFE_FALLBACK_INTERVENTION,
        isFallback: true,
        audits: [
          {
            interventionId: SAFE_FALLBACK_INTERVENTION.id,
            interventionName: SAFE_FALLBACK_INTERVENTION.name,
            baseScore: 0,
            mechanismFit: 0,
            contextFit: 0,
            stateFit: 0,
            capacityFit: 0,
            receptivityFit: 0,
            personalizationDelta: 0,
            failurePenalty: 0,
            repeatPenalty: 0,
            finalScore: 0,
            evidenceCategory: SAFE_FALLBACK_INTERVENTION.evidence.category,
            isEligible: false,
            disqualificationReason: 'NOT_READY hard gate active. Normal intervention withheld.'
          }
        ],
        winningScore: 0
      };
    }

    // EMPTY CATALOG GUARD: If catalog is empty, return safe fallback
    if (!catalog || catalog.length === 0) {
      return {
        selectedIntervention: SAFE_FALLBACK_INTERVENTION,
        isFallback: true,
        audits: [],
        winningScore: 0
      };
    }

    let topCandidate: Intervention | null = null;
    let highestScore = -999;

    for (const item of catalog) {
      // 1. Base Score
      const baseScore = item.baseScore;

      // 2. Mechanism Fit (+15 if direct target, +5 if secondary problem match, -15 if mismatch)
      let mechanismFit = 0;
      if (item.targetMechanism === params.mechanism) {
        mechanismFit += 18;
      }
      if (item.primaryProblems.includes(params.problem)) {
        mechanismFit += 12;
      }
      if (mechanismFit === 0) {
        mechanismFit = -15;
      }

      // 3. State Fit (CURRENT STATE MUST DOMINATE)
      let stateFit = 0;
      if (item.suitableStates.includes(params.state)) {
        stateFit = +15;
      } else {
        // Severe penalty for state mismatch (e.g. asking a depleted user to do high cognitive analysis)
        stateFit = -35;
      }

      // 4. Capacity Fit
      let capacityFit = 0;
      if (params.capacity === 'LOW') {
        if (item.cognitiveLoad === 'MINIMAL') capacityFit = +12;
        else if (item.cognitiveLoad === 'LOW') capacityFit = +5;
        else capacityFit = -25; // Block high cognitive load on low capacity
      } else if (params.capacity === 'HIGH') {
        capacityFit = +10;
      } else {
        // MEDIUM
        if (item.cognitiveLoad === 'HIGH') capacityFit = -10;
        else capacityFit = +8;
      }

      // 5. Context Fit
      let contextFit = 0;
      if (params.context.setting === 'before_sleep' && item.isPassiveOk) {
        contextFit = +10;
      } else if (params.context.setting === 'studying' && item.targetMechanism === 'working_memory_overload') {
        contextFit = +10;
      } else if (params.context.timeAvailableMinutes < 2 && item.durationSeconds > 90) {
        contextFit = -15;
      }

      // 6. Receptivity Fit
      let receptivityFit = 0;
      if (params.receptivity === 'LIMITED') {
        receptivityFit = item.cognitiveLoad === 'MINIMAL' ? +5 : -10;
      } else if (params.receptivity === 'READY') {
        receptivityFit = +10;
      }

      // 7. Bounded Personalization (Clamped to [-25, +8])
      const personalizationDelta = memoryManager.getPersonalizationDelta(item.id, params.context.setting);

      // 8. Contextual Failure Penalty
      const failurePenalty = memoryManager.getContextualFailurePenalty(item.id, params.context.setting);

      // 9. Session Repeat Penalty
      let repeatPenalty = 0;
      if (params.sessionFailedInterventions.includes(item.id)) {
        repeatPenalty = 22; // Strong penalty if tried and failed earlier in this same session
      }

      // Final score formula
      const finalScore =
        baseScore +
        mechanismFit +
        contextFit +
        stateFit +
        capacityFit +
        receptivityFit +
        personalizationDelta -
        failurePenalty -
        repeatPenalty;

      const isEligible = finalScore >= 50 && stateFit > -30;

      const audit: ScoringAudit = {
        interventionId: item.id,
        interventionName: item.name,
        baseScore,
        mechanismFit,
        contextFit,
        stateFit,
        capacityFit,
        receptivityFit,
        personalizationDelta,
        failurePenalty,
        repeatPenalty,
        finalScore,
        evidenceCategory: item.evidence.category,
        isEligible,
        disqualificationReason: !isEligible
          ? (stateFit <= -30 ? 'Current state unsuitable' : 'Score below threshold')
          : undefined
      };

      audits.push(audit);

      if (isEligible && finalScore > highestScore) {
        highestScore = finalScore;
        topCandidate = item;
      }
    }

    if (!topCandidate) {
      // Safe fallback route when no eligible intervention exists
      return {
        selectedIntervention: SAFE_FALLBACK_INTERVENTION,
        isFallback: true,
        audits,
        winningScore: 50
      };
    }

    return {
      selectedIntervention: topCandidate,
      isFallback: false,
      audits,
      winningScore: highestScore
    };
  }
}

export const interventionScorer = new InterventionScorer();
