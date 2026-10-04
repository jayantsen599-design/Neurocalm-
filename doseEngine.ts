/**
 * NEUROCALM DOSE ENGINE
 * Sizes intervention duration, step complexity, and cognitive load.
 * Classified as PRODUCT HEURISTIC (not clinical prescription).
 * Enforces:
 * - LOW capacity / DEPLETED -> minimal dose, 1 micro-step
 * - LIMITED receptivity -> condensed version
 * - NOT_READY -> zero dose / safe pause
 */

import {
  Intervention,
  CapacityLevel,
  ReceptivityLevel,
  CurrentState
} from '../types/neurocalm';

export interface DosePlan {
  durationSeconds: number;
  formattedDuration: string;
  stepCount: number;
  guidanceStyle: 'CONDENSED' | 'MICRO_STEP' | 'STANDARD' | 'PAUSE';
  doseRationale: string;
}

export class DoseEngine {
  public calculateDose(
    intervention: Intervention,
    capacity: CapacityLevel,
    receptivity: ReceptivityLevel,
    state: CurrentState,
    intensity: number // 1 to 10
  ): DosePlan {
    // 1. Hard Gate: NOT_READY
    if (receptivity === 'NOT_READY') {
      return {
        durationSeconds: 0,
        formattedDuration: '0s (Pause)',
        stepCount: 0,
        guidanceStyle: 'PAUSE',
        doseRationale: 'User is not ready for intervention. Action paused to prevent pressure.'
      };
    }

    // 2. Depleted or Low Capacity
    if (capacity === 'LOW' || state === 'depleted') {
      const minimalDuration = Math.min(45, intervention.durationSeconds);
      return {
        durationSeconds: minimalDuration,
        formattedDuration: `${minimalDuration}s`,
        stepCount: 1,
        guidanceStyle: 'MICRO_STEP',
        doseRationale: 'Capacity is low/depleted. Condensed to 1 single low-load physical action.'
      };
    }

    // 3. Limited Receptivity or High Intensity
    if (receptivity === 'LIMITED' || intensity >= 8) {
      const condensedDuration = Math.min(60, Math.round(intervention.durationSeconds * 0.7));
      return {
        durationSeconds: condensedDuration,
        formattedDuration: `${condensedDuration}s`,
        stepCount: 1,
        guidanceStyle: 'CONDENSED',
        doseRationale: 'High intensity or limited receptivity. Condensed to reduce friction.'
      };
    }

    // 4. Standard Dose
    return {
      durationSeconds: intervention.durationSeconds,
      formattedDuration: `${intervention.durationSeconds}s`,
      stepCount: 2,
      guidanceStyle: 'STANDARD',
      doseRationale: 'Sufficient capacity. Standard calibrated dose applied.'
    };
  }
}

export const doseEngine = new DoseEngine();
