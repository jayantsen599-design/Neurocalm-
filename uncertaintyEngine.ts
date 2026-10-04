/**
 * NEUROCALM UNCERTAINTY ENGINE
 * Distinguishes:
 * - KNOWN (facts) vs UNKNOWN (assumptions / imagined scenarios)
 * - CONTROLLABLE (direct next actions) vs UNCONTROLLABLE (external outcomes / other people)
 * Prevents manufacturing false certainty.
 */

import { UncertaintyAnalysis } from '../types/neurocalm';

export class UncertaintyEngine {
  /**
   * Structures a situation into the 4 quadrants
   */
  public parseSituation(situationText: string): UncertaintyAnalysis {
    const rawLines = situationText.split(/[.\n,]+/).map(s => s.trim()).filter(Boolean);

    const known: string[] = [];
    const assumptions: string[] = [];
    const controllable: string[] = [];
    const uncontrollable: string[] = [];

    // Analyze lines or populate initial functional scaffold
    for (const item of rawLines) {
      const lower = item.toLowerCase();
      if (/\b(might|maybe|what if|they think|future|will happen|probably)\b/.test(lower)) {
        assumptions.push(item);
      } else if (/\b(i can|my action|write|call|pause|breathe|do|start)\b/.test(lower)) {
        controllable.push(item);
      } else if (/\b(other person|boss|partner|result|exam score|weather|market)\b/.test(lower)) {
        uncontrollable.push(item);
      } else {
        known.push(item);
      }
    }

    // Ensure baseline clarity if input is very brief
    if (controllable.length === 0) {
      controllable.push('Your next 5-minute physical action or response pause');
    }
    if (uncontrollable.length === 0) {
      uncontrollable.push('How other people react or future external outcomes');
    }

    return {
      knownFacts: known.length > 0 ? known : ['What is directly in front of you right now'],
      assumptions: assumptions.length > 0 ? assumptions : ['Projected fears about future what-ifs'],
      controllableActions: controllable,
      uncontrollableOutcomes: uncontrollable
    };
  }
}

export const uncertaintyEngine = new UncertaintyEngine();
