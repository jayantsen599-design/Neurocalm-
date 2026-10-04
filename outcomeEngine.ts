/**
 * NEUROCALM OUTCOME ENGINE
 * Handles outcome evaluation, duplicate event locks, stale session checking,
 * and state adaptation.
 *
 * Enforces:
 * 1. Double-click prevention (atomic session submission lock)
 * 2. Stale session validation (token matching)
 * 3. NOT_READY prohibits false skill/transfer/independence recording
 * 4. User agency attribution
 */

import {
  OutcomeType,
  ProblemCategory,
  FunctionalMechanism,
  CapacityLevel,
  ReceptivityLevel
} from '../types/neurocalm';
import { memoryManager } from './memoryManager';

export interface OutcomeSubmission {
  sessionToken: string;
  outcome: OutcomeType;
  problem: ProblemCategory;
  mechanism: FunctionalMechanism;
  interventionId: string;
  contextSetting: string;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
}

export interface OutcomeResult {
  success: boolean;
  status: 'RECORDED' | 'DUPLICATE_BLOCKED' | 'STALE_SESSION_BLOCKED' | 'HARD_GATE_REJECTED';
  message: string;
  suggestedNextStep: 'EXIT' | 'SKILL_OFFRAMP' | 'ADAPT_INTERVENTION' | 'HUMAN_SUPPORT' | 'PAUSE';
  agencyCreditText: string;
}

export class OutcomeEngine {
  // Track submitted session tokens to guarantee idempotency and block double-clicks
  private processedSessionTokens = new Set<string>();

  public submitOutcome(submission: OutcomeSubmission, activeSessionToken: string): OutcomeResult {
    // 1. Stale session check
    if (!submission.sessionToken || submission.sessionToken !== activeSessionToken) {
      return {
        success: false,
        status: 'STALE_SESSION_BLOCKED',
        message: 'This session has expired or is invalid. Stale submission rejected.',
        suggestedNextStep: 'EXIT',
        agencyCreditText: ''
      };
    }

    // 2. Double-click / duplicate submission lock
    if (this.processedSessionTokens.has(submission.sessionToken)) {
      return {
        success: false,
        status: 'DUPLICATE_BLOCKED',
        message: 'This outcome was already submitted. Duplicate tap blocked.',
        suggestedNextStep: 'EXIT',
        agencyCreditText: ''
      };
    }

    // 3. HARD GATE: NOT_READY must NOT create skill/transfer/independence success
    if (submission.receptivity === 'NOT_READY') {
      if (submission.outcome === 'R2' || submission.outcome === 'R3' || submission.outcome === 'R4') {
        return {
          success: false,
          status: 'HARD_GATE_REJECTED',
          message: 'User was in NOT_READY state. Cannot record false skill/transfer progression.',
          suggestedNextStep: 'PAUSE',
          agencyCreditText: 'Take a break whenever you need.'
        };
      }
    }

    // Lock session token
    this.processedSessionTokens.add(submission.sessionToken);

    // 4. Record to memory manager (privacy-governed structured metadata)
    memoryManager.recordOutcome(
      submission.problem,
      submission.mechanism,
      submission.interventionId,
      submission.outcome,
      submission.contextSetting,
      submission.capacity
    );

    // 5. Determine agency text & next route
    let agencyCreditText = 'You took the next step.';
    let suggestedNextStep: 'EXIT' | 'SKILL_OFFRAMP' | 'ADAPT_INTERVENTION' | 'HUMAN_SUPPORT' | 'PAUSE' = 'EXIT';

    if (submission.outcome === 'R4') {
      agencyCreditText = 'You handled this directly in your real life. Credit belongs to your own agency.';
      suggestedNextStep = 'SKILL_OFFRAMP';
    } else if (submission.outcome === 'R3') {
      agencyCreditText = 'You chose where to apply this next. You are bridging this into your daily routine.';
      suggestedNextStep = 'SKILL_OFFRAMP';
    } else if (submission.outcome === 'R2' || submission.outcome === 'R1' || submission.outcome === 'R0') {
      agencyCreditText = 'You executed this action. Your nervous system responded to your deliberate choice.';
      suggestedNextStep = 'EXIT';
    } else if (submission.outcome === 'NO_CHANGE') {
      agencyCreditText = 'Recognizing when a specific tool does not fit is valuable feedback.';
      suggestedNextStep = 'ADAPT_INTERVENTION';
    } else if (submission.outcome === 'WORSE') {
      agencyCreditText = 'Let us pause this intervention immediately. Stepping back is the right choice.';
      suggestedNextStep = 'ADAPT_INTERVENTION';
    } else if (submission.outcome === 'WANT_HUMAN') {
      agencyCreditText = 'Choosing to connect with a trusted person or professional is an active, healthy choice.';
      suggestedNextStep = 'HUMAN_SUPPORT';
    } else if (submission.outcome === 'PAUSED') {
      agencyCreditText = 'Pausing is completely safe. Return to life whenever you are ready.';
      suggestedNextStep = 'PAUSE';
    }

    return {
      success: true,
      status: 'RECORDED',
      message: 'Outcome verified and registered.',
      suggestedNextStep,
      agencyCreditText
    };
  }

  public resetTokens() {
    this.processedSessionTokens.clear();
  }
}

export const outcomeEngine = new OutcomeEngine();
