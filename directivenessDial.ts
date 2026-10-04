/**
 * NEUROCALM DYNAMIC DIRECTIVENESS DIAL (Section 18 Architecture)
 *
 * Factors evaluated:
 * - User request (explicit demand for steps vs open reflection)
 * - Capacity (LOW/MEDIUM/HIGH)
 * - Uncertainty (LOW/MODERATE/HIGH)
 * - Reversibility (HIGHLY_REVERSIBLE / PARTIALLY_REVERSIBLE / IRREVERSIBLE)
 * - Consequence / Stakes (LOW/MODERATE/HIGH)
 * - User Agency (preservation of choice ownership)
 * - Urgency (NONE/LOW/HIGH)
 *
 * POLICY RULES:
 * - Low-stakes + reversible + clear: more direct can be appropriate.
 * - High-stakes + irreversible + uncertain: non-directive; increase clarification and protect user ownership.
 * - Never silently hijack or dictate the user's life choices.
 */

import {
  DirectivenessDial,
  DirectivenessPolicy,
  CapacityLevel,
  SupportNeedType
} from '../types/neurocalm';

export interface DirectivenessInputs {
  rawInput: string;
  supportNeed: SupportNeedType;
  capacity: CapacityLevel;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
  reversibility: 'HIGHLY_REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
  stake: 'LOW' | 'MODERATE' | 'HIGH';
  isExplicitSolutionRequested?: boolean;
  isExplicitListeningRequested?: boolean;
}

export class DirectivenessDialEngine {
  public computeDial(inputs: DirectivenessInputs): DirectivenessDial {
    const text = inputs.rawInput.toLowerCase();

    // Invariant 1: If user wants listening, directiveness must be strictly LOW
    if (
      inputs.supportNeed === 'LISTENING' ||
      inputs.isExplicitListeningRequested ||
      /\b(bas sun|advice mat de|just listen)\b/i.test(text)
    ) {
      return {
        dialScore: 0.1,
        mode: 'LOW',
        rationale: 'Listening / validation constraint active; unsolicited directiveness prohibited.',
        reversibility: inputs.reversibility,
        stake: inputs.stake,
        preservesAgency: true
      };
    }

    // Invariant 2: High stakes + Irreversible (e.g. resigning, divorce, permanent conflict)
    // Directiveness must be non-directive to collaborative; ownership remains 100% with the user.
    if (inputs.reversibility === 'IRREVERSIBLE' || inputs.stake === 'HIGH') {
      return {
        dialScore: 0.35,
        mode: 'COLLABORATIVE',
        rationale: 'High stake / irreversible choice; system must preserve user agency and offer partition, never prescribe action.',
        reversibility: inputs.reversibility,
        stake: inputs.stake,
        preservesAgency: true
      };
    }

    // Invariant 3: Low capacity + high urgency (panic / acute overwhelm)
    // Calm, clear grounding instructions (DIRECT execution support for somatic brake)
    if (inputs.capacity === 'LOW' && inputs.supportNeed === 'REGULATION') {
      return {
        dialScore: 0.8,
        mode: 'DIRECT',
        rationale: 'Autonomic regulation during acute depletion benefits from simple, singular, direct sensory guidance.',
        reversibility: 'HIGHLY_REVERSIBLE',
        stake: 'LOW',
        preservesAgency: true
      };
    }

    // Invariant 4: Explicit request for actionable step ("bata kya karu", "what should i do")
    // Reversible + Low/Moderate stake
    if (
      inputs.isExplicitSolutionRequested ||
      inputs.supportNeed === 'ACTION' ||
      /\b(bata kya karu|tell me what to do|kya karu)\b/i.test(text)
    ) {
      return {
        dialScore: 0.75,
        mode: 'DIRECT',
        rationale: 'User explicitly requested direct operational momentum on a manageable step.',
        reversibility: inputs.reversibility,
        stake: inputs.stake,
        preservesAgency: true
      };
    }

    // Default: Collaborative partnership
    return {
      dialScore: 0.5,
      mode: 'COLLABORATIVE',
      rationale: 'Balanced collaborative pacing: offer structured perspective while leaving determination to the user.',
      reversibility: inputs.reversibility,
      stake: inputs.stake,
      preservesAgency: true
    };
  }
}

export const directivenessDialEngine = new DirectivenessDialEngine();
