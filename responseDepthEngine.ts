/**
 * NEUROCALM DYNAMIC RESPONSE DEPTH ENGINE (Section 2 Architecture)
 *
 * Replaces the false assumption that "SHORT RESPONSE = BETTER RESPONSE".
 * RESPONSE DEPTH = the minimum depth required to demonstrate understanding
 * and create useful movement.
 *
 * LEVELS:
 * D0 = acknowledgement only
 * D1 = specific reflection
 * D2 = reflection + clarification
 * D3 = structured understanding + hypothesis
 * D4 = understanding + evidence-informed solution
 * D5 = solution + reasoning + practice/transfer
 *
 * Depth factors:
 * - user goal
 * - current state
 * - functional capacity
 * - receptivity
 * - support need
 * - conversation stage
 * - information available (detail level)
 * - uncertainty
 * - problem complexity
 * - reversibility
 * - consequence
 * - user effort
 * - previous response outcome
 */

import {
  ResponseDepthLevel,
  CapacityLevel,
  ReceptivityLevel,
  SupportNeedType,
  ConversationStage,
  OutcomeType,
  ConversationSignals
} from '../types/neurocalm';

export interface DepthDecisionInputs {
  rawInput: string;
  supportNeed: SupportNeedType;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  conversationStage: ConversationStage;
  signals?: ConversationSignals;
  previousOutcome?: OutcomeType;
  turnIndex: number;
  isExplicitSolutionRequested?: boolean;
  isExplicitListeningRequested?: boolean;
}

export class ResponseDepthEngine {
  public selectDepth(inputs: DepthDecisionInputs): {
    depth: ResponseDepthLevel;
    rationale: string;
  } {
    const text = inputs.rawInput.toLowerCase().trim();
    const wordCount = inputs.rawInput.split(/\s+/).filter(Boolean).length;
    const isVeryShort = wordCount <= 4;
    const isRichNarrative = wordCount >= 18;

    // 1. Explicit Clean Exit / Brief Greeting
    if (/\b(theek hai ab|all good|shukriya|thanks bye|sorted|handled it|see you|nikalta hu|bye)\b/i.test(text)) {
      return {
        depth: 'D0',
        rationale: 'Clean exit or brief closure requires only courteous acknowledgment.'
      };
    }

    // 2. Listening constraint active ("bas sun", "advice mat dena")
    if (
      inputs.isExplicitListeningRequested ||
      inputs.supportNeed === 'LISTENING' ||
      /\b(bas sun|advice mat de|just listen)\b/i.test(text)
    ) {
      if (isRichNarrative) {
        return {
          depth: 'D1',
          rationale: 'User provided detailed story but requested listening; provide deep, specific context-grounded reflection without advice.'
        };
      }
      return {
        depth: 'D1',
        rationale: 'Listening mode active: specific empathetic reflection preserving meaning without unsolicited solutions.'
      };
    }

    // 3. Low Capacity / Extreme Fragmentation / Depleted
    // User says: "bhai pata nahi kya ho raha hai", "kuch nahi... pata nahi..."
    if (inputs.capacity === 'LOW' || (isVeryShort && /\b(pata nahi|kuch nahi|chhod)\b/i.test(text))) {
      if (/\b(kuch nahi|chhod|rehne de)\b/i.test(text) || (text.includes('...') && isVeryShort)) {
        return {
          depth: 'D1',
          rationale: 'Low functional bandwidth with verbal shutdown: minimal load (D1) to avoid overwhelming user.'
        };
      }
      if (/\b(pata nahi|don't know|samajh nahi aa raha)\b/i.test(text)) {
        return {
          depth: 'D2',
          rationale: 'Low capacity with ambiguity: provide gentle reflection plus 1 low-friction clarification move.'
        };
      }
      return {
        depth: 'D1',
        rationale: 'Low functional processing bandwidth: keep depth minimal to avoid cognitive overload.'
      };
    }

    // 4. Solution / Action requested ("bata kya karu", "help me solve this")
    if (
      inputs.isExplicitSolutionRequested ||
      inputs.supportNeed === 'ACTION' ||
      inputs.supportNeed === 'PROBLEM_SOLVING' ||
      inputs.supportNeed === 'DECISION_SUPPORT'
    ) {
      if (inputs.capacity === 'HIGH' || inputs.turnIndex >= 2) {
        return {
          depth: 'D4',
          rationale: 'User is ready for action with adequate capacity: provide structured understanding plus evidence-informed next move.'
        };
      }
      return {
        depth: 'D3',
        rationale: 'Action requested with medium capacity: structured understanding with single clear micro-step.'
      };
    }

    // 5. Skill building / transfer progression
    if (inputs.supportNeed === 'SKILL_BUILDING') {
      return {
        depth: 'D5',
        rationale: 'Skill transfer stage: present solution, behavioral reasoning, and independent practice cue.'
      };
    }

    // 6. High Information / Long Rich Story (Section 15 High Information Example)
    // User: "6 mahine se situation ye hai..., din me..., raat me..."
    if (isRichNarrative) {
      return {
        depth: 'D3',
        rationale: 'High-information narrative: reflect the actual complex pattern, formulate testable hypothesis, avoid generic acknowledgment.'
      };
    }

    // 7. Clarification Need ("dimag baar baar same baat pe ja raha hai...")
    if (inputs.supportNeed === 'CLARIFICATION' || inputs.conversationStage === 'CLARIFYING') {
      return {
        depth: 'D2',
        rationale: 'Clarifying stage: specific reflection paired with targeted, low-friction inquiry.'
      };
    }

    // Default: Specific reflection + calibrated perspective
    return {
      depth: 'D2',
      rationale: 'Nominal operational depth: validate current context and offer calibrated forward inquiry.'
    };
  }
}

export const responseDepthEngine = new ResponseDepthEngine();
