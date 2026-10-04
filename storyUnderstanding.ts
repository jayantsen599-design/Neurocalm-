/**
 * NEUROCALM STRUCTURED STORY & DEEP SITUATION MODEL (Section 4 Architecture)
 *
 * Implements the 18-element deep narrative representation:
 * 1. EVENT
 * 2. CONTEXT
 * 3. EMOTION
 * 4. INTERPRETATION
 * 5. NEED
 * 6. DESIRE
 * 7. FEAR
 * 8. URGE
 * 9. BEHAVIOR
 * 10. CONSEQUENCE
 * 11. RECURRING_PATTERN
 * 12. ACTUAL_PROBLEM
 * 13. USER_GOAL
 * 14. SUPPORT_NEED
 * 15. UNCERTAINTY
 * 16. CONTROL_BOUNDARY
 * 17. REVERSIBILITY
 * 18. STAKE
 *
 * CORE INVARIANT:
 * - "Unknown is better than invented."
 * - Calibrated hypotheses, never asserted as absolute verified truths.
 */

import {
  StoryUnderstanding,
  EmotionSignal,
  SupportNeedAssessment,
  ConversationSignals,
  LivingContext
} from '../types/neurocalm';

export class StoryUnderstandingEngine {
  /**
   * Deconstructs a user narrative into the 18-element structured understanding model.
   */
  public buildStoryModel(
    rawInput: string,
    emotionSignal: EmotionSignal,
    supportNeed: SupportNeedAssessment,
    context: LivingContext,
    signals?: ConversationSignals
  ): StoryUnderstanding {
    const raw = rawInput.trim();
    const text = raw.toLowerCase();

    // 1. EVENT: What actually happened? (Observable factual occurrence)
    let event = 'Observable triggering event not explicitly stated';
    if (/\b(manager ne|boss ne|friend ne|usne|parents ne|exam|interview|result|call|message|breakup|fight)\b/i.test(text)) {
      const match = raw.match(/([^.!?\n]*(?:manager|boss|friend|usne|parents|exam|interview|result|call|message|breakup|fight)[^.!?\n]*)/i);
      if (match) event = match[0].trim();
    } else if (raw.length > 5 && raw.length <= 120) {
      event = raw;
    }

    // 2. CONTEXT: Setting, timeline, environment
    let situationContext = 'General daily life';
    if (/\b(office|work|job|boss|colleague|client|meeting|presentation)\b/i.test(text)) {
      situationContext = 'Workplace / professional context';
    } else if (/\b(exam|study|college|school|syllabus|grades|marks|neet|jee|upsc)\b/i.test(text)) {
      situationContext = 'Academic / evaluative study context';
    } else if (/\b(ghar|family|mummy|papa|parents|bhai|behen|wife|husband|shaadi)\b/i.test(text)) {
      situationContext = 'Family / domestic environment';
    } else if (/\b(relationship|girlfriend|boyfriend|partner|date|ex|ladki|ladka|crush|pyaar|miss|trust break)\b/i.test(text)) {
      situationContext = 'Interpersonal / romantic relationship & attachment';
    } else if (/\b(raat|sleep|neend|bed|subah|morning|night)\b/i.test(text)) {
      situationContext = 'Sleep / diurnal cycle context';
    }

    // Secondary context note if diurnal + romantic overlap
    if (/\b(raat|night)\b/i.test(text) && /\b(ladki|ladka|miss|yaad|ex|crush)\b/i.test(text)) {
      situationContext = 'Attachment longing amplified by nighttime isolation';
    }

    // 3. EMOTION: Calibrated emotional experience
    const emotion = emotionSignal.detectedEmotions.length > 0
      ? `${emotionSignal.detectedEmotions.join(', ')} (~${emotionSignal.intensityEstimate}/10)`
      : 'Diffused internal activation';

    // 4. INTERPRETATION: Cognitive appraisal / narrative meaning
    let interpretation = 'Unspecified cognitive appraisal';
    if (/\b(sab barbaad|i am a failure|kuch nahi ho sakta|everyone thinks|meri galti|hopeless)\b/i.test(text)) {
      interpretation = 'High catastrophic meaning: User views this as defining self-worth or future outcome';
    } else if (/\b(unfair|kyu kiya mere saath|dhokha|cheated)\b/i.test(text)) {
      interpretation = 'Appraisal of injustice or boundary violation';
    } else if (/\b(pata nahi kya hoga|kya hone wala hai|if this happens)\b/i.test(text)) {
      interpretation = 'Anticipatory threat forecasting';
    }

    // 5. NEED: Core psychological / regulatory requirement
    let need = 'Equilibrium & clarity';
    if (supportNeed.need === 'LISTENING') need = 'Attuned listening without unsolicited intervention';
    else if (supportNeed.need === 'REGULATION') need = 'Autonomic down-regulation & nervous system settling';
    else if (supportNeed.need === 'DECISION_SUPPORT') need = 'Choice partitioning & uncertainty containment';
    else if (supportNeed.need === 'ACTION') need = 'Friction reduction & initiation of initial step';

    // 6. DESIRE: Explicit or implicit want
    let desire = 'Resolution of immediate bottleneck';
    if (/\b(shaanti|calm|peace|relief|chhutkara)\b/i.test(text)) {
      desire = 'Immediate somatic and cognitive relief';
    } else if (/\b(clarity|decide|choose|faisla)\b/i.test(text)) {
      desire = 'Firm decision and elimination of second-guessing';
    } else if (/\b(sun le|baat karni|vent)\b/i.test(text)) {
      desire = 'Genuine human witnessing without judgment';
    }

    // 7. FEAR: Anticipated catastrophe or threat
    let fear = 'General discomfort with present uncertainty';
    if (/\b(fail|reject|chhod dega|akela reh jaunga|kuch nahi bachega|fired)\b/i.test(text)) {
      fear = 'Social rejection, abandonment, or professional failure';
    } else if (/\b(kabhi theek nahi hoga|permanent|always)\b/i.test(text)) {
      fear = 'Permanence of distress or chronic entrapment';
    }

    // 8. URGE: Immediate behavioral impulse
    let urge = 'Passive waiting or ruminative analysis';
    if (/\b(bhaagne|leave|chhod du|give up|quit|block)\b/i.test(text)) {
      urge = 'Avoidance / escape impulse';
    } else if (/\b(check| baar baar dekh|confirm|call karu)\b/i.test(text)) {
      urge = 'Compulsive reassurance or checking urge';
    } else if (/\b(chilla|break|blast|marne ka)\b/i.test(text)) {
      urge = 'Aggressive discharge or confrontation urge';
    }

    // 9. BEHAVIOR: What user has actually been doing
    let behavior = 'Mental replay or ongoing deliberation';
    if (/\b(taal raha|procrastinat|scrolling|phone dekh raha|kuch nahi kiya)\b/i.test(text)) {
      behavior = 'Task avoidance or displacement scrolling';
    } else if (/\b(baar baar check|bar bar dekh|asking everyone)\b/i.test(text)) {
      behavior = 'Repeated checking or verification behavior';
    } else if (/\b(bed pe pada|soya raha|isolate)\b/i.test(text)) {
      behavior = 'Physical withdrawal or behavioral hypoactivity';
    }

    // 10. CONSEQUENCE: Real-world or emotional fallout
    let consequence = 'Cognitive fatigue & lost bandwidth';
    if (/\b(kaam ruk gaya|missed deadline|fight ho gayi|ruined)\b/i.test(text)) {
      consequence = 'Delayed obligations and amplified friction';
    }

    // 11. RECURRING PATTERN: Is this an ongoing loop?
    let recurringPattern = 'Isolated turn / unknown frequency';
    if (/\b(har baar|always|roz ka hai|pattern|again|phir se|same thing)\b/i.test(text)) {
      recurringPattern = 'Confirmed recurring cognitive or behavioral loop';
    } else if (/\b(6 mahine|months|years|saal se|din se)\b/i.test(text)) {
      recurringPattern = 'Chronic ongoing situational state';
    }

    // 12. ACTUAL PROBLEM: Bottleneck underlying the distress
    let actualProblem = 'Cognitive/emotional overload';
    if (/\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|dono alag)\b/i.test(text)) {
      actualProblem = 'Confounded emotional drivers: Difficulty untangling interpersonal longing from environmental loneliness';
    } else if (/\b(baar baar.*check|reassurance)\b/i.test(text)) {
      actualProblem = 'Intolerance of uncertainty maintaining verification loop';
    } else if (/\b(decision|choose|options|kya karu)\b/i.test(text)) {
      actualProblem = 'Choice paralysis due to mixed consequence uncertainty';
    } else if (/\b(dimag ruk hi nahi raha|overthinking)\b/i.test(text)) {
      actualProblem = 'Working memory capture by unexecuted loops';
    } else if (/\b(start nahi ho raha|procrastinat)\b/i.test(text)) {
      actualProblem = 'High initiation friction on ambiguous task';
    }

    // 13. USER GOAL: What user is aiming for in this conversation
    const userGoal = context.userGoal || (supportNeed.need === 'LISTENING'
      ? 'Be heard and understood without unsolicited intervention'
      : (supportNeed.need === 'UNDERSTANDING' || supportNeed.need === 'CLARIFICATION'
        ? 'Untangle confusing emotions and clarify actual problem'
        : 'Obtain functional clarity and next step'));

    // 14. SUPPORT NEED:
    const needType = supportNeed.need;

    // 15. UNCERTAINTY:
    let uncertainty: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN' = 'MODERATE';
    if (/\b(pata nahi|kuch samajh nahi|confused|lost|unclear|alag nahi kar pa raha)\b/i.test(text)) {
      uncertainty = 'HIGH';
    } else if (/\b(sab pata hai|clear hai|faisla lena hai)\b/i.test(text)) {
      uncertainty = 'LOW';
    }

    // 16. CONTROL BOUNDARY: What is within vs outside control?
    let controlBoundary: 'WITHIN_CONTROL' | 'OUTSIDE_CONTROL' | 'MIXED' = 'MIXED';
    if (/\b(dusre log|wo kya sochenge|manager ne|society|luck|kismat|us ladki|ex|usne)\b/i.test(text)) {
      controlBoundary = 'OUTSIDE_CONTROL';
    } else if (/\b(mera response|main kya karu|my action|next move)\b/i.test(text)) {
      controlBoundary = 'WITHIN_CONTROL';
    }

    // 17. REVERSIBILITY:
    let reversibility: 'HIGHLY_REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE' = 'PARTIALLY_REVERSIBLE';
    if (/\b(job chhod du|resign|breakup|divorce|quit permanent)\b/i.test(text)) {
      reversibility = 'IRREVERSIBLE';
    } else if (/\b(draft|soch raha|breathe|pause|email reply|talk to)\b/i.test(text)) {
      reversibility = 'HIGHLY_REVERSIBLE';
    }

    // 18. STAKE:
    let stake: 'LOW' | 'MODERATE' | 'HIGH' = 'MODERATE';
    if (/\b(life ruined|career khatam|everything lost|critical)\b/i.test(text) || reversibility === 'IRREVERSIBLE') {
      stake = 'HIGH';
    } else if (/\b(small thing|choti baat|draft|routine)\b/i.test(text)) {
      stake = 'LOW';
    }

    // Extra narrative features: timePattern, trigger, userHypotheses, competingExplanations
    let timePattern: string | undefined = undefined;
    if (/\b(raat|night|late night|bed pe)\b/i.test(text)) {
      timePattern = 'Nighttime exacerbation: Solitude and reduced sensory distraction amplify ruminative thoughts';
    } else if (/\b(subah|morning)\b/i.test(text)) {
      timePattern = 'Morning cortisol/anticipatory surge';
    }

    let trigger: string | undefined = undefined;
    if (/\b(miss|yaad|ladki|ladka|photo|message|call|alone|akela)\b/i.test(text)) {
      trigger = 'Intrusive memory of person paired with situational solitude';
    }

    const userHypotheses: string[] = [];
    if (/\b(miss.*karta|yaad aa rahi)\b/i.test(text)) {
      userHypotheses.push('Missing the person specifically (attachment longing)');
    }
    if (/\b(akela|lonely|aloneness)\b/i.test(text)) {
      userHypotheses.push('General situational loneliness hitting at night');
    }
    if (/\b(dono alag nahi|confuse)\b/i.test(text)) {
      userHypotheses.push('Uncertainty whether distress is about the person or about baseline loneliness');
    }

    const competingExplanations = [
      'Mechanism A: Attachment-related longing and grief for the specific connection',
      'Mechanism B: Situational loneliness/social isolation magnified by nighttime stillness',
      'Mechanism C: Nighttime context + reduced sensory distraction triggering ruminative loops'
    ];

    return {
      event,
      context: situationContext,
      emotion,
      interpretation,
      need,
      desire,
      fear,
      urge,
      behavior,
      consequence,
      recurringPattern,
      actualProblem,
      userGoal,
      supportNeed: needType,
      uncertainty,
      controlBoundary,
      reversibility,
      stake,
      timePattern,
      trigger,
      userHypotheses: userHypotheses.length > 0 ? userHypotheses : undefined,
      competingExplanations,
      isCalibratedHypothesis: true
    };
  }
}

export const storyUnderstandingEngine = new StoryUnderstandingEngine();
