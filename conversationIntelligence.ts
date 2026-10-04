/**
 * NEUROCALM CONVERSATION INTELLIGENCE LAYER
 * Sits directly ABOVE the existing intervention layer and routes into it.
 *
 * PHILOSOPHY:
 * SPEAK LESS. UNDERSTAND MORE. SOLVE BETTER.
 *
 * PIPELINE:
 * USER MESSAGE
 *   ↓
 * LIVING CONTEXT (Priority: Current Statement > User Correction > Recent Verified > Older Memory > AI Inference)
 *   ↓
 * EMOTION SIGNAL (Calibrated hypothesis, never claimed as absolute fact)
 *   ↓
 * SITUATION MODEL (Separates What Happened / What It Means / What User Feels / What User Wants)
 *   ↓
 * FUNCTIONAL CAPACITY (LOW | MEDIUM | HIGH - processing bandwidth, NOT intelligence or diagnosis)
 *   ↓
 * RECEPTIVITY (READY | LIMITED | NOT_READY - respects explicit refusal e.g. "bas sun, advice mat de")
 *   ↓
 * SUPPORT NEED (LISTENING | CLARIFICATION | REGULATION | SOLVING | DECISION_SUPPORT | ACTION | SKILL_BUILDING | HUMAN_SUPPORT | CLEAN_EXIT)
 *   ↓
 * CONVERSATION STAGE (INTAKE_ATTUNEMENT | CLARIFYING | GROUNDING | SOLVING | CLOSING)
 *   ↓
 * MECHANISM HYPOTHESIS (12 audited functional mechanisms)
 *   ↓
 * RESPONSE STRATEGY & ADAPTIVE GOVERNOR (Minimum Useful Response, max 1 question, no unsolicited advice)
 *   ↓
 * EXISTING NEUROCALM INTERVENTION ROUTER (When appropriate)
 */

import {
  LivingContext,
  ContextStatus,
  EmotionSignal,
  EmotionType,
  SituationModel,
  FunctionalCapacityAssessment,
  UserReceptivityAssessment,
  SupportNeedAssessment,
  SupportNeedType,
  ConversationStage,
  MechanismHypothesis,
  ResponseStrategyAssessment,
  ResponseStrategyType,
  ConversationTurnAnalysis,
  SupportedLanguage,
  CapacityLevel,
  ReceptivityLevel,
  FunctionalMechanism,
  ProblemCategory,
  CurrentState,
  GovernorDecision,
  OutcomeType,
  ConversationSignals
} from '../types/neurocalm';
import { CALIBRATED_INTERVENTIONS } from './interventionLibrary';
import { safetyGateway } from './safetyGateway';
import { adaptiveGovernor } from './adaptiveGovernor';
import { stressLanguageSystem } from './stressLanguageSystem';
import { responseQualityController } from './qualityController';
import { conversationSignalsProcessor } from './conversationSignals';

export class ConversationIntelligenceEngine {
  private livingContext: LivingContext;
  private turnHistory: ConversationTurnAnalysis[] = [];
  private listeningLock: boolean = false;

  constructor() {
    this.livingContext = this.createInitialContext();
  }

  private createInitialContext(): LivingContext {
    return {
      id: 'ctx_' + Date.now(),
      status: 'CURRENT',
      confidence: 0.5,
      prioritySource: 'CURRENT_USER_STATEMENT',
      turnIndex: 0,
      timestamp: Date.now()
    };
  }

  public reset(): void {
    this.livingContext = this.createInitialContext();
    this.turnHistory = [];
    this.listeningLock = false;
    safetyGateway.resetSession();
  }

  public getLivingContext(): LivingContext {
    return { ...this.livingContext };
  }

  public getTurnHistory(): ConversationTurnAnalysis[] {
    return [...this.turnHistory];
  }

  /**
   * PRIMARY ENTRY POINT FOR CONVERSATION INTELLIGENCE
   *
   * Orchestration Pipeline (Mandatory Priority):
   * USER MESSAGE
   *   ↓
   * CONVERSATION SIGNALS (Observable message/language evidence)
   *   ↓
   * CURRENT USER INTENT & REPAIR CHECK
   *   ↓
   * SUPPORT NEED & LISTENING LOCK
   *   ↓
   * FUNCTIONAL CAPACITY (Updated turn-by-turn as hypothesis)
   *   ↓
   * RECEPTIVITY
   *   ↓
   * CONVERSATION STAGE
   *   ↓
   * ADAPTIVE GOVERNOR (Minimum Useful Move, Invariants Enforced)
   *   ↓
   * RESPONSE STRATEGY & RESPONSE BUDGET
   *   ↓
   * STRESS CONVERSATION LANGUAGE SYSTEM (Catch -> Fit -> Move -> Check)
   *   ↓
   * QUALITY GATE (10-Point Gate & Diagnostic Audit)
   *   ↓
   * OUTCOME & ADAPTATION
   */
  public processMessage(
    userMessage: string,
    language: SupportedLanguage = 'en'
  ): ConversationTurnAnalysis {
    const raw = userMessage.trim();
    const text = raw.toLowerCase();

    // 1. Language & Observable Conversation Signals
    const conversationSignals = conversationSignalsProcessor.extractSignals(raw, this.turnHistory);

    // 2. User Correction & Contradiction Check (Repair Engine)
    const correctionCheck = this.detectUserCorrection(text, conversationSignals);

    // 3. Update Listening Lock State
    // "bas sun", "sirf sun", "advice mat dena", "solution mat dena", "mujhe bas bolna hai"
    if (conversationSignals.explicitListeningRequest || conversationSignals.adviceRejection) {
      this.listeningLock = true;
    } else if (this.listeningLock) {
      // Lock remains active ONLY until:
      // A. User asks for advice/solution/action/clarification
      // B. User explicitly requests regulation
      // C. Safety requires override
      // D. User changes goal or clean exits
      const asksForAction =
        conversationSignals.explicitSolutionRequest ||
        conversationSignals.explicitRegulationRequest ||
        /\b(ab\s+bata\s+kya\s+karu|kya\s+karu|solution\s+do|advice\s+do|bata\s+kya\s+karu|how\s+to\s+fix|what\s+should\s+i\s+do|kaam|email|report|start|finish|pending|solution\s+bata|help\s+me\s+solve|dono\s+alag\s+nahi|samajh\s+nahi\s+aa\s+raha|problem\s+kya\s+hai)\b/i.test(text);

      const isCrisis =
        safetyGateway.screenInput(raw).level === 'CRISIS' ||
        /\b(kill myself|end my life|want to die|suicide)\b/i.test(text);

      const isExit =
        /\b(theek hai ab|all good|shukriya|thanks bye|sorted|handled it|see you|nikalta hu|bye)\b/i.test(text);

      const isGoalShift =
        /\b(exhausted|drained|cannot think|blast ho raha|fatigue|kuch fayda nahi|dimag waisa hi hai|dimag ruk hi nahi raha|heart calm hua)\b/i.test(text);

      if (asksForAction || isCrisis || isExit || isGoalShift) {
        this.listeningLock = false;
      }
    }

    // 4. Update Living Context Model according to Priority Hierarchy
    // Priority: CURRENT USER STATEMENT > USER CORRECTION > RECENT VERIFIED CONTEXT > OLDER MEMORY > AI INFERENCE
    const updatedContext = this.updateLivingContext(raw, correctionCheck);
    this.livingContext = updatedContext;

    // 5. Detect Calibrated Emotion Signal (Hypothesis, with multi-turn preservation)
    const emotionSignal = this.detectEmotionSignal(text);

    // 6. Build Separated Situation Model (What Happened / What Means / What Feels / What Wants)
    const situationModel = this.buildSituationModel(raw, emotionSignal, updatedContext, conversationSignals);

    // 7. Estimate Functional Capacity (LOW / MEDIUM / HIGH / UNKNOWN hypothesis)
    const capacityAssessment = this.estimateFunctionalCapacity(text, raw, emotionSignal, conversationSignals);

    // 8. Assess User Receptivity (Respects explicit refusal of advice)
    const receptivityAssessment = this.assessReceptivity(text, conversationSignals, this.listeningLock);

    // 9. Determine Primary Support Need
    const supportNeed = this.determineSupportNeed(
      text,
      emotionSignal,
      capacityAssessment,
      receptivityAssessment,
      updatedContext,
      conversationSignals,
      this.listeningLock
    );

    // 10. Track Conversation Stage
    const conversationStage = this.determineConversationStage(supportNeed, this.turnHistory.length);

    // 11. Formulate Mechanism Hypothesis (Audited mechanisms only when strictly evidenced)
    const mechanismHypothesis = this.formulateMechanismHypothesis(text, emotionSignal, supportNeed);

    // Track multi-turn reassurance seeking across session
    const multiTurnReassuranceCount =
      this.turnHistory.filter((t) =>
        /\b(baar baar.*check|pakka na|sure ho|confirm kar do|bar bar dekh raha|are you sure|will it be ok)\b/i.test(
          t.userMessage
        )
      ).length +
      (/\b(baar baar.*check|pakka na|sure ho|confirm kar do|bar bar dekh raha|are you sure|will it be ok)\b/i.test(
        raw
      )
        ? 1
        : 0);

    // Detect if user reported an outcome regarding previous move/step
    let previousOutcome: OutcomeType | undefined = undefined;
    if (
      /\b(kuch fayda nahi hua|kuch farak nahi|still not working|same as before|no change|didn't work|fayda nahi)\b/i.test(
        raw
      )
    ) {
      previousOutcome = 'NO_CHANGE';
    } else if (/\b(aur kharab|worse|getting worse|more anxious|chidh badh gayi)\b/i.test(raw)) {
      previousOutcome = 'WORSE';
    }

    // 12. Consult Adaptive Governor (Central Decision Layer)
    const governorDecision = adaptiveGovernor.evaluate({
      problem: this.inferProblemFromSupportNeed(supportNeed, mechanismHypothesis),
      state: this.inferStateFromEmotion(emotionSignal),
      intensity: emotionSignal.intensityEstimate,
      rawInput: raw,
      emotionSignal,
      situationModel,
      livingContext: updatedContext,
      capacity: capacityAssessment.capacity,
      receptivity: receptivityAssessment.receptivity,
      supportNeed: supportNeed.need,
      conversationStage,
      previousStrategy: this.turnHistory[this.turnHistory.length - 1]?.governorDecision?.primaryStrategy,
      previousOutcome,
      userCorrectionText: updatedContext.userCorrection,
      reassuranceCount: multiTurnReassuranceCount,
      sessionTurnCount: this.turnHistory.length,
      conversationSignals,
      listeningLock: this.listeningLock,
      isExplicitRegulationRequested: conversationSignals.explicitRegulationRequest,
      isExplicitSolutionRequested: conversationSignals.explicitSolutionRequest
    });

    // 13. Stress Conversation Language System (Catch -> Fit -> Move -> Check)
    const rawStressResponse = stressLanguageSystem.generateResponse(governorDecision, raw, language);

    // 14. Response Quality Controller (10-Point Quality Gate & Diagnostic Audit)
    const { response: validatedResponse, audit: qualityAudit } =
      responseQualityController.evaluateAndSanitize(
        rawStressResponse,
        governorDecision,
        raw,
        this.turnHistory
      );

    const responseStrategy: ResponseStrategyAssessment = {
      strategy: this.mapGovernorStrategyToResponseStrategy(governorDecision.primaryStrategy),
      minimumUsefulResponse: validatedResponse.primaryMessage,
      questionOrPrompt: validatedResponse.calibratedQuestion,
      shouldRouteToIntervention: governorDecision.interventionEligible,
      suggestedInterventionId: governorDecision.targetInterventionId,
      rationale: governorDecision.reason
    };

    const turnAnalysis: ConversationTurnAnalysis = {
      userMessage: raw,
      timestamp: Date.now(),
      livingContext: updatedContext,
      conversationSignals,
      emotionSignal,
      situationModel,
      storyUnderstanding: governorDecision.storyUnderstanding,
      capacity: capacityAssessment,
      receptivity: receptivityAssessment,
      supportNeed,
      conversationStage,
      mechanismHypothesis,
      competingMechanisms: governorDecision.competingMechanisms,
      discriminatingTest: governorDecision.discriminatingTest,
      wisdomLens: governorDecision.wisdomLens,
      multiTurnTrajectory: governorDecision.multiTurnTrajectory,
      responseStrategy,
      governorDecision,
      qualityGateAudit: qualityAudit
    };

    this.turnHistory.push(turnAnalysis);
    return turnAnalysis;
  }

  private inferProblemFromSupportNeed(
    supportNeed: SupportNeedAssessment,
    mechanism: MechanismHypothesis
  ): ProblemCategory {
    if (mechanism.mechanism === 'working_memory_overload') return 'overthinking';
    if (mechanism.mechanism === 'uncertainty_loop') return 'uncertainty';
    if (mechanism.mechanism === 'initiation_friction') return 'procrastination';
    if (mechanism.mechanism === 'identity_event_fusion') return 'rejection';
    if (mechanism.mechanism === 'urge_response_coupling') return 'urges';
    if (mechanism.mechanism === 'physiological_hyperarousal') return 'acute_stress';
    return 'acute_stress';
  }

  private inferStateFromEmotion(emotion: EmotionSignal): CurrentState {
    if (emotion.detectedEmotions.includes('anger') || emotion.intensityEstimate >= 8) return 'hyperaroused';
    if (emotion.detectedEmotions.includes('emotional_exhaustion')) return 'depleted';
    if (emotion.detectedEmotions.includes('overwhelm')) return 'overloaded';
    return 'elevated_stress';
  }

  private mapGovernorStrategyToResponseStrategy(strategy: string): ResponseStrategyType {
    switch (strategy) {
      case 'LISTEN':
      case 'REFLECT':
        return 'REFLECT_LISTEN';
      case 'CLARIFY':
      case 'UNDERSTAND':
        return 'CALIBRATED_QUESTION';
      case 'GROUND':
      case 'SOLVE':
      case 'ACTIVATE':
      case 'TEACH':
        return 'PROPOSE_INTERVENTION';
      case 'HUMAN_SUPPORT':
        return 'HUMAN_HANDOFF';
      case 'EXIT':
        return 'CLEAN_EXIT';
      case 'PAUSE':
      case 'REDUCE':
      case 'NO_ACTION':
        return 'PAUSE_SPACE';
      default:
        return 'REFLECT_LISTEN';
    }
  }

  /**
   * LAYER 1: USER CORRECTION DETECTOR
   * User correction strictly overrides AI inference.
   */
  private detectUserCorrection(
    text: string,
    signals?: ConversationSignals
  ): { isCorrection: boolean; correctedDetail?: string } {
    // Only detect correction if explicitly countering prior inference or starting with negation
    const explicitCorrectionPatterns = [
      /^(nahi|no|not)[,\s]/i,
      /\b(galat samjhe|you misunderstood|that's not what i meant|samjhe nahi|matlab ye nahi tha|maine ye nahi bola|aisa nahi hai|ye nahi bola|not what i said|wrong assumption)\b/i,
      /\b(gussa nahi|not angry|padhai nahi|not study|sad hu gussa nahi)\b/i,
      /\b(nahi yaar|nahi main|i'm not|main.*nahi hu)\b/i
    ];

    // Exclude descriptive negatives like "ruk hi nahi raha", "samajh nahi aa raha", "so nahi pa raha"
    const isDescriptiveNegativeOnly = /^(dimag|neend|kaam|kuch)\s+(ruk|aa|so|kar|chal)\s+(hi\s+)?nahi/i.test(text);
    if (isDescriptiveNegativeOnly) {
      return { isCorrection: false };
    }

    const hasCorrection = explicitCorrectionPatterns.some(pat => pat.test(text));
    if (hasCorrection) {
      let correctedDetail = 'User indicated previous interpretation was incorrect.';
      if (/\b(gussa nahi|not angry)\b/i.test(text)) {
        correctedDetail = 'User clarified: NOT angry.';
      } else if (/\b(padhai nahi|not study)\b/i.test(text)) {
        correctedDetail = 'User clarified: NOT about studying.';
      } else if (/\b(sad|dukh|upset)\b/i.test(text)) {
        correctedDetail = 'User clarified: experiencing sadness/hurt rather than anger.';
      }
      return { isCorrection: true, correctedDetail };
    }

    return { isCorrection: false };
  }

  /**
   * LAYER 2: LIVING CONTEXT MODEL
   * Priority:
   * CURRENT USER STATEMENT > USER CORRECTION > RECENT VERIFIED CONTEXT > OLDER MEMORY > AI INFERENCE
   */
  private updateLivingContext(
    rawMessage: string,
    correction: { isCorrection: boolean; correctedDetail?: string }
  ): LivingContext {
    const turnIndex = this.turnHistory.length + 1;
    let status: ContextStatus = 'CURRENT';
    let prioritySource: LivingContext['prioritySource'] = 'CURRENT_USER_STATEMENT';
    let confidence = 0.8;

    if (correction.isCorrection) {
      status = 'USER_CORRECTED';
      prioritySource = 'USER_CORRECTION';
      // User correction overrides previous inference; high confidence in user's direct word
      confidence = 0.95;
      return {
        id: this.livingContext.id,
        status,
        whatHappened: this.livingContext.whatHappened,
        userInterpretation: correction.correctedDetail,
        userCorrection: rawMessage,
        confidence,
        prioritySource,
        turnIndex,
        timestamp: Date.now()
      };
    }

    // Checking if message signals stable continuation or changed topic
    if (this.turnHistory.length > 0) {
      const prev = this.turnHistory[this.turnHistory.length - 1];
      if (/\b(aur|also|and|wahi|same|still|bhi)\b/i.test(rawMessage)) {
        status = 'STABLE';
        confidence = Math.min(prev.livingContext.confidence + 0.05, 0.9);
      } else if (/\b(chhod|leave that|dusri baat|anyway|kuch aur)\b/i.test(rawMessage)) {
        status = 'CHANGED';
        confidence = 0.7;
      }
    }

    return {
      id: this.livingContext.id,
      status,
      whatHappened: rawMessage,
      userInterpretation: undefined,
      confidence,
      prioritySource,
      turnIndex,
      timestamp: Date.now()
    };
  }

  /**
   * LAYER 3: EMOTION SIGNAL
   * Strictly calibrated hypothesis. Never claim absolute certainty.
   */
  private detectEmotionSignal(text: string): EmotionSignal {
    const detected: EmotionType[] = [];
    let intensity = 5;

    // Pattern heuristics for emotions (English, Hindi, Hinglish)
    // Explicit negated anger check
    const isNegatedAnger = /\b(gussa nahi|not angry|rage nahi|anger nahi)\b/i.test(text);

    if (/\b(gussa|angry|rage|furious|chidh|annoyed|irritat)\b/.test(text) && !isNegatedAnger) {
      detected.push('anger');
      detected.push('irritation');
      intensity = Math.max(intensity, 8);
    }
    if (/\b(darr|scared|fear|afraid|panic|freaking|ghabrahat)\b/.test(text)) {
      detected.push('fear');
      intensity = Math.max(intensity, 8);
    }
    if (/\b(pata nahi|samajh nahi aa raha|confused|confusion|lost|kya karu)\b/.test(text)) {
      detected.push('confusion');
      detected.push('uncertainty');
    }
    if (/\b(overwhelm|dimag ruk hi nahi raha|blast|phat raha|too much|drowning)\b/.test(text)) {
      detected.push('overwhelm');
      detected.push('stress');
      intensity = Math.max(intensity, 8);
    }
    if (/\b(hurt|dard|dukh|sad|sadness|rejection|reject|mana kar diya|dil toot|ignored|cut off)\b/.test(text)) {
      detected.push('hurt');
      detected.push('sadness');
      intensity = Math.max(intensity, 7);
    }
    if (/\b(alone|lonely|akela|koi nahi hai|isolated)\b/.test(text)) {
      detected.push('loneliness');
    }
    if (/\b(shame|sharm|guilt|pachtawa|regret|meri galti)\b/.test(text)) {
      detected.push('guilt');
      detected.push('shame');
    }
    if (/\b(exhausted|drained|thak gaya|dead tired|energy nahi|so nahi pa raha)\b/.test(text)) {
      detected.push('emotional_exhaustion');
      intensity = Math.max(intensity, 7);
    }
    if (/\b(frustrat|fas gaya|stuck|tang aa gaya)\b/.test(text)) {
      detected.push('frustration');
    }

    if (detected.length === 0) {
      detected.push('stress');
      detected.push('uncertainty');
      intensity = 5;
    }

    return {
      detectedEmotions: Array.from(new Set(detected)),
      intensityEstimate: intensity,
      confidence: 0.75,
      isHypothesis: true,
      calibrationNote: 'Calibrated emotional interpretation formulated as hypothesis. Not verified fact.'
    };
  }

  /**
   * LAYER 4: SITUATION MODEL
   * Separates:
   * WHAT HAPPENED vs WHAT THE USER THINKS IT MEANS vs WHAT THE USER FEELS vs WHAT THE USER WANTS
   */
  private buildSituationModel(
    rawMessage: string,
    emotionSignal: EmotionSignal,
    context: LivingContext,
    conversationSignals?: ConversationSignals
  ): SituationModel {
    const text = rawMessage.toLowerCase();

    // 1. What Happened (Physical event / circumstances)
    let whatHappened = rawMessage;
    if (context.whatHappened && context.status === 'USER_CORRECTED') {
      whatHappened = context.whatHappened;
    }

    // 2. What User Thinks It Means (Cognitive appraisal / interpretations)
    let whatUserThinksItMeans = 'Unspecified cognitive appraisal';
    if (/\b(khatam|ruined|hamesha mere sath|sab meri galti|i am stupid|never change)\b/i.test(text)) {
      whatUserThinksItMeans = 'Global catastrophe or identity fusion hypothesis';
    } else if (/\b(mana kar diya|ignored|left me)\b/i.test(text)) {
      whatUserThinksItMeans = 'Interpreting social friction or rejection as personal deficit';
    } else if (/\b(pata nahi kya ho raha hai)\b/i.test(text)) {
      whatUserThinksItMeans = 'Experiencing unexplained internal dysregulation';
    }

    // 3. What User Feels (Emotional / physiological state)
    const whatUserFeels = emotionSignal.detectedEmotions.join(', ') + ` (Intensity ~${emotionSignal.intensityEstimate}/10)`;

    // 4. What User Wants (Goal / desire)
    let whatUserWants = 'Clarity and baseline balance';
    if (/\b(bas sun|advice mat de|just listen|don't give advice)\b/i.test(text)) {
      whatUserWants = 'Non-evaluative listening without unsolicited advice';
    } else if (/\b(kya karu|batao|solve|solution|steps)\b/i.test(text)) {
      whatUserWants = 'Direct actionable guidance';
    } else if (/\b(dimag ruk hi nahi raha|calm|shaant)\b/i.test(text)) {
      whatUserWants = 'Down-regulation of racing cognitive loop';
    } else if (/\b(theek hai|bye|done|handled)\b/i.test(text)) {
      whatUserWants = 'Clean exit and return to life';
    }

    return {
      whatHappened,
      whatUserThinksItMeans,
      whatUserFeels,
      whatUserWants,
      isSeparated: true
    };
  }

  /**
   * LAYER 5: FUNCTIONAL PROCESSING CAPACITY
   * LOW | MEDIUM | HIGH
   * (NOT intelligence, NOT a diagnosis, NOT a personality trait)
   */
  private estimateFunctionalCapacity(
    text: string,
    rawMessage: string,
    emotion: EmotionSignal,
    conversationSignals?: ConversationSignals
  ): FunctionalCapacityAssessment {
    const signals: string[] = [];
    let capacity: CapacityLevel = 'MEDIUM';
    let cognitiveLoadTolerance: FunctionalCapacityAssessment['cognitiveLoadTolerance'] = 'LOW';
    let maxQuestionsAllowed = 1;

    // Signal: Fragmented message / very short or trailing
    const wordCount = rawMessage.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount <= 4 && (conversationSignals?.fragmentation || /\b(nahi|pata nahi|kuch nahi|chhod|kya|kyu)\b/.test(text))) {
      signals.push('Fragmented utterance');
    }

    if (conversationSignals?.hasKuchNahi || conversationSignals?.hasChhodRehneDe || /\b(chhod|rehne de|kuch nahi)\b/.test(text)) {
      signals.push('Withdrawal / verbal shutdown');
    }

    // Signal: Repeated uncertainty ("pata nahi", "don't know")
    if (/\b(pata nahi|don't know|kuch samajh nahi aa raha|confused|no idea)\b/.test(text)) {
      signals.push('Explicit uncertainty / confusion');
    }

    // Signal: High urgency or acute activation
    if (/\b(jaldi|emergency|right now|turant|fast|can't breathe|shaking)\b/.test(text)) {
      signals.push('High physiological urgency');
    }

    // Signal: Self-reported overwhelm
    if (/\b(blast|phat raha|too much|exhausted|drained|can't think|bas ho gaya|thak gaya)\b/.test(text)) {
      signals.push('Cognitive depletion / sensory overload');
    }

    // If multiple fatigue/overload signals present OR intensity >= 8 with fragmentation OR withdrawal + uncertainty
    if (
      signals.includes('Cognitive depletion / sensory overload') ||
      signals.includes('High physiological urgency') ||
      (signals.includes('Withdrawal / verbal shutdown') && signals.includes('Explicit uncertainty / confusion')) ||
      (conversationSignals?.withdrawalSignals && (conversationSignals?.hasKuchNahi || conversationSignals?.hasChhodRehneDe)) ||
      (signals.includes('Fragmented utterance') && signals.includes('Withdrawal / verbal shutdown')) ||
      (signals.includes('Fragmented utterance') && signals.includes('Explicit uncertainty / confusion') && (conversationSignals?.hasKuchNahi || conversationSignals?.hasChhodRehneDe)) ||
      (signals.length >= 2 && emotion.intensityEstimate >= 8) ||
      /\b(exhausted|drained|cannot think|so tired)\b/.test(text)
    ) {
      capacity = 'LOW';
      cognitiveLoadTolerance = 'MINIMAL';
      maxQuestionsAllowed = 0; // ZERO questions when capacity is low!
    } else if (
      (/\b(ready|tell me what to do|kya karu batao|steps do|plan|solve|evaluating|architectural|trade-offs|tradeoff|constraints|latency|system performance)\b/.test(text) ||
       conversationSignals?.emotionalVsAnalytical === 'ANALYTICAL') &&
      emotion.intensityEstimate < 8
    ) {
      capacity = 'HIGH';
      cognitiveLoadTolerance = 'MODERATE';
      maxQuestionsAllowed = 1;
    } else {
      capacity = 'MEDIUM';
      cognitiveLoadTolerance = 'LOW';
      maxQuestionsAllowed = 1;
    }

    return {
      capacity,
      signals,
      cognitiveLoadTolerance,
      maxQuestionsAllowed,
      confidence: 0.85,
      rationale: `Functional capacity estimated as ${capacity} based on [${signals.join('; ') || 'nominal baseline'}]. Stress does not automatically mean low intelligence.`
    };
  }

  /**
   * LAYER 6: USER RECEPTIVITY
   * READY | LIMITED | NOT_READY
   */
  private assessReceptivity(
    text: string,
    conversationSignals?: ConversationSignals,
    listeningLock?: boolean
  ): UserReceptivityAssessment {
    const signals: string[] = [];

    // Explicit refusal of advice (e.g. "bas sun, advice mat de", listening lock)
    const hasAdviceRefusal =
      Boolean(listeningLock) ||
      Boolean(conversationSignals?.explicitListeningRequest) ||
      Boolean(conversationSignals?.adviceRejection) ||
      /\b(bas sun|advice mat de|just listen|don't give advice|lecture mat de|gyan mat de|chup raho|kuch mat batao)\b/i.test(text);

    if (hasAdviceRefusal) {
      signals.push('Explicit refusal of advice or intervention');
      return {
        receptivity: 'NOT_READY',
        explicitRefusalOfAdvice: true,
        signals,
        confidence: 0.98
      };
    }

    if (/\b(not now|leave me alone|baad mein|kuch nahi karna|man nahi hai)\b/i.test(text)) {
      signals.push('Explicit reluctance to engage');
      return {
        receptivity: 'NOT_READY',
        explicitRefusalOfAdvice: false,
        signals,
        confidence: 0.9
      };
    }

    if (/\b(shuru karein|tell me|let's do it|kya karu batao|ready|solution do)\b/i.test(text)) {
      signals.push('Direct readiness for action');
      return {
        receptivity: 'READY',
        explicitRefusalOfAdvice: false,
        signals,
        confidence: 0.92
      };
    }

    signals.push('Receptive with low friction requirement');
    return {
      receptivity: 'LIMITED',
      explicitRefusalOfAdvice: false,
      signals,
      confidence: 0.75
    };
  }

  /**
   * LAYER 7: SUPPORT NEED
   */
  private determineSupportNeed(
    text: string,
    emotion: EmotionSignal,
    capacity: FunctionalCapacityAssessment,
    receptivity: UserReceptivityAssessment,
    context: LivingContext,
    conversationSignals?: ConversationSignals,
    listeningLock?: boolean
  ): SupportNeedAssessment {
    // 1. Clean exit requested (only when user is actually exiting, NOT asking what to do next)
    const isAskingNextMove = /\b(kya karu|bata|solution|kya karna|how to|what next|help)\b/i.test(text);
    if (!isAskingNextMove && (
      /\b(theek hai ab|all good|shukriya|thanks bye|sorted|handled it|see you|nikalta hu|bye)\b/i.test(text) ||
      /^(theek hai|thanks|shukriya|all good|sorted)[.!]?$/i.test(text.trim())
    )) {
      return {
        need: 'CLEAN_EXIT',
        primaryNeed: 'CLEAN_EXIT',
        confidence: 0.95,
        distribution: { CLEAN_EXIT: 0.95 },
        rationale: 'User indicated completion or readiness to return to daily life.'
      };
    }

    // 2. Crisis / Human Support
    if (/\b(kill myself|end it all|die|helpline|therapist|human|insan se baat)\b/i.test(text)) {
      return {
        need: 'HUMAN_SUPPORT',
        primaryNeed: 'HUMAN_SUPPORT',
        confidence: 0.99,
        distribution: { HUMAN_SUPPORT: 0.99 },
        rationale: 'Safety threshold triggered or user explicitly requested human connection.'
      };
    }

    // 3. User explicitly wants listening only ("bas sun, advice mat de", explicit listening lock)
    // NOTE: Emotional disclosure != explicit listening request!
    const isExplicitListen =
      conversationSignals?.explicitListeningRequest ||
      conversationSignals?.adviceRejection ||
      receptivity.explicitRefusalOfAdvice ||
      /\b(bas\s+sun\b|sirf\s+sun\b|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|just\s+listen|mujhe\s+bas\s+bolne\s+de)\b/i.test(text);

    if (isExplicitListen) {
      return {
        need: 'LISTENING',
        primaryNeed: 'LISTENING',
        confidence: 0.98,
        distribution: { LISTENING: 0.98, VALIDATION: 0.7 },
        rationale: 'User explicitly requested listening without unsolicited solutions.'
      };
    }

    // 4. Explicit Decision Overload & Choice dilemmas ("decision", "kya karna chahiye", "options")
    if (/\b(kya\s+karna\s+chahiye|decision|choose|choice|options|accept karun ya|karna chahiye ya|karu ya na|decision lene me help kar)\b/i.test(text)) {
      return {
        need: 'DECISION_SUPPORT',
        primaryNeed: 'DECISION_SUPPORT',
        secondaryNeed: 'PROBLEM_SOLVING',
        confidence: 0.95,
        distribution: { DECISION_SUPPORT: 0.95, PROBLEM_SOLVING: 0.8 },
        rationale: 'User is facing a choice dilemma; requires reversible/irreversible partition and ownership preservation.'
      };
    }

    // 5. Solving / Action / Task Execution (explicit solution requests)
    if (
      conversationSignals?.explicitSolutionRequest ||
      /\b(ab\s+bata\s+kya\s+karu|bata\s+kya\s+karu|kya\s+karu|kaise\s+karu|what\s+should\s+i\s+do|solution\s+bata|help\s+me\s+solve|steps\s+do|taal\s+raha|procrastinat|kaam\s+ruk\s+gaya|pending\s+task)\b/i.test(text)
    ) {
      return {
        need: 'ACTION',
        primaryNeed: 'PROBLEM_SOLVING',
        secondaryNeed: 'ACTION',
        confidence: 0.95,
        distribution: { PROBLEM_SOLVING: 0.95, ACTION: 0.9 },
        rationale: 'User is navigating specific task execution or explicitly requested problem solution.'
      };
    }

    // 6. Regulation (Body hyperarousal, panic, racing thoughts, explicit calm request)
    if (
      conversationSignals?.explicitRegulationRequest ||
      /\b(dimag ruk hi nahi raha|heart racing|hyper|gussa aa raha hai|panic|trembling|mujhe calm hona hai|calm hona hai)\b/i.test(text) ||
      emotion.detectedEmotions.includes('anger') ||
      emotion.detectedEmotions.includes('fear')
    ) {
      return {
        need: 'REGULATION',
        primaryNeed: 'REGULATION',
        confidence: 0.9,
        distribution: { REGULATION: 0.9 },
        rationale: 'Autonomic nervous system activation flagged; physiological baseline reset useful.'
      };
    }

    // 7. Confounded Mechanisms & Problem Clarification ("dono alag nahi kar pa raha", "samajh hi nahi aa raha problem kya hai")
    if (
      /\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|samajh hi nahi aa raha problem kya hai|mujhe lagta hai.*miss.*raat|dono alag|kyu hota hai|samajh nahi pa raha)\b/i.test(text)
    ) {
      return {
        need: 'CLARIFICATION',
        primaryNeed: 'UNDERSTANDING',
        secondaryNeed: 'CLARIFICATION',
        confidence: 0.92,
        distribution: { UNDERSTANDING: 0.92, CLARIFICATION: 0.88, VALIDATION: 0.6 },
        rationale: 'User expresses ambiguity or confounded emotional drivers; untangling required before action.'
      };
    }

    // 8. Checking loops / reassurance seeking
    if (/\b(baar baar.*check|same cheez check|confirm kar do|bar bar|doubt ho raha hai)\b/i.test(text)) {
      return {
        need: 'DECISION_SUPPORT',
        primaryNeed: 'DECISION_SUPPORT',
        secondaryNeed: 'CLARIFICATION',
        confidence: 0.9,
        distribution: { DECISION_SUPPORT: 0.9, CLARIFICATION: 0.7 },
        rationale: 'Repetitive verification pattern detected; requires uncertainty breakdown rather than false reassurance.'
      };
    }

    // 8. General Clarification ("pata nahi kya ho raha hai", "I don't know why I'm feeling like this")
    if (/\b(pata nahi kya ho raha hai|don't know why|samajh nahi aa raha|unclear|confused)\b/i.test(text)) {
      return {
        need: 'CLARIFICATION',
        primaryNeed: 'CLARIFICATION',
        secondaryNeed: 'UNDERSTANDING',
        confidence: 0.88,
        distribution: { CLARIFICATION: 0.88, UNDERSTANDING: 0.8 },
        rationale: 'User expresses ambiguity about internal state; untangling required before action.'
      };
    }

    // 9. Physical Pause / Fatigue
    if (/\b(fatigue|thak gaya|exhausted|drained|tired|need a break|break liya|stretch)\b/i.test(text)) {
      return {
        need: 'PAUSE',
        primaryNeed: 'PAUSE',
        confidence: 0.9,
        distribution: { PAUSE: 0.9 },
        rationale: 'User signaled fatigue or break; pause holding space required.'
      };
    }

    // 10. Validation / Progress settling ("heart thoda calm hua", "settled", "better", "draft kar liya")
    if (/\b(calm hua|settled|behtar|relief|ho gaya|done|draft kar liya|break liya)\b/i.test(text)) {
      return {
        need: 'VALIDATION',
        primaryNeed: 'VALIDATION',
        confidence: 0.85,
        distribution: { VALIDATION: 0.85 },
        rationale: 'User reported subjective settling or step completion; brief validation appropriate.'
      };
    }

    // 11. Narrative / Emotional disclosure fallback
    // NOTE: Emotional disclosure does NOT equal listening request!
    return {
      need: 'CLARIFICATION',
      primaryNeed: 'UNDERSTANDING',
      secondaryNeed: 'VALIDATION',
      confidence: 0.8,
      distribution: { UNDERSTANDING: 0.8, VALIDATION: 0.7, LISTENING: 0.5 },
      rationale: 'Emotional disclosure received; establishing structural understanding without unsolicited pressure.'
    };
  }

  /**
   * LAYER 8: CONVERSATION STAGE
   */
  private determineConversationStage(
    supportNeed: SupportNeedAssessment,
    turnCount: number
  ): ConversationStage {
    if (supportNeed.need === 'CLEAN_EXIT') return 'CLOSING';
    if (supportNeed.need === 'REGULATION') return 'GROUNDING';
    if (supportNeed.need === 'SOLVING' || supportNeed.need === 'ACTION') return 'SOLVING';
    if (supportNeed.need === 'CLARIFICATION') return 'CLARIFYING';
    return turnCount === 0 ? 'INTAKE_ATTUNEMENT' : 'CLARIFYING';
  }

  /**
   * LAYER 9: MECHANISM HYPOTHESIS
   * Uses strictly the 12 audited functional mechanisms.
   */
  private formulateMechanismHypothesis(
    text: string,
    emotion: EmotionSignal,
    supportNeed: SupportNeedAssessment
  ): MechanismHypothesis {
    if (/\b(baar baar.*check|check kar raha|reassurance|doubt)\b/i.test(text)) {
      return {
        mechanism: 'uncertainty_loop',
        confidence: 0.9,
        rationale: 'Compulsive checking indicates intolerance of uncertainty and feedback loop.'
      };
    }

    if (/\b(dimag ruk hi nahi raha|sochta rehta|thoughts.*stop|loop)\b/i.test(text)) {
      return {
        mechanism: 'working_memory_overload',
        confidence: 0.9,
        rationale: 'Active working memory congestion keeping cognitive loops spinning.'
      };
    }

    if (/\b(gussa|anger|rage|heart racing|shivering|furious)\b/i.test(text)) {
      return {
        mechanism: 'physiological_hyperarousal',
        confidence: 0.92,
        rationale: 'Autonomic nervous system sympathetic spike.'
      };
    }

    if (/\b(procrastinat|taal raha|start nahi ho raha|friction)\b/i.test(text)) {
      return {
        mechanism: 'initiation_friction',
        confidence: 0.9,
        rationale: 'Task start barrier caused by working memory burden or affective avoidance.'
      };
    }

    if (/\b(rejection|mana kar diya|breakup|hurt|log kya kahenge)\b/i.test(text)) {
      return {
        mechanism: 'identity_event_fusion',
        confidence: 0.85,
        rationale: 'External social event conflated with global personal identity.'
      };
    }

    if (/\b(urge|craving|smoking|phone|scroll|addiction)\b/i.test(text)) {
      return {
        mechanism: 'urge_response_coupling',
        confidence: 0.88,
        rationale: 'Conditioned cue-to-action coupling requiring distress tolerance.'
      };
    }

    if (supportNeed.need === 'CLARIFICATION') {
      return {
        mechanism: 'cognitive_overload',
        confidence: 0.8,
        rationale: 'Diffuse unpartitioned signals causing functional stall.'
      };
    }

    return {
      mechanism: 'cognitive_overload',
      confidence: 0.7,
      rationale: 'Baseline cognitive load elevation.'
    };
  }

  /**
   * LAYER 10: RESPONSE STRATEGY & ADAPTIVE GOVERNOR
   * Minimum useful response.
   * Speak Less. Understand More. Solve Better.
   */
  private formulateResponseStrategy(
    rawMessage: string,
    language: SupportedLanguage,
    context: LivingContext,
    emotion: EmotionSignal,
    situation: SituationModel,
    capacity: FunctionalCapacityAssessment,
    receptivity: UserReceptivityAssessment,
    supportNeed: SupportNeedAssessment,
    stage: ConversationStage,
    mechanism: MechanismHypothesis
  ): ResponseStrategyAssessment {
    // A. CRISIS / HUMAN SUPPORT
    if (supportNeed.need === 'HUMAN_SUPPORT') {
      const response = {
        en: 'I hear the weight you are carrying. This is beyond what an app can handle alone. Please connect with human support.',
        hi: 'Aap jo mehsoos kar rahe hain woh bohot bhaari hai. Is samay kisi insaan ya helpline se baat karna zaroori hai.',
        hinglish: 'I hear you. Yeh weight akele carry mat karo. Please human support ya helpline se connect karo right now.'
      }[language];

      return {
        strategy: 'HUMAN_HANDOFF',
        minimumUsefulResponse: response,
        shouldRouteToIntervention: false,
        rationale: 'Safety gateway requirement: immediate bypass to human support.'
      };
    }

    // B. CLEAN EXIT
    if (supportNeed.need === 'CLEAN_EXIT') {
      const response = {
        en: 'Understood. Step away from the screen and carry on with your day.',
        hi: 'Theek hai. Screen band karein aur apne din par aage badhein.',
        hinglish: 'Understood. Screen off karo aur apne din par aage badho.'
      }[language];

      return {
        strategy: 'CLEAN_EXIT',
        minimumUsefulResponse: response,
        shouldRouteToIntervention: false,
        rationale: 'Clean exit honored immediately. Self-reliance prioritized.'
      };
    }

    // C. USER CORRECTION ACKNOWLEDGEMENT
    if (context.status === 'USER_CORRECTED') {
      const response = {
        en: `Understood, my mistake. Taking note of that directly.`,
        hi: `Samajh gaya, meri galti. Aapki baat note kar li.`,
        hinglish: `Understood, my mistake. Tumhari baat note kar li.`
      }[language];

      // If user wants to just talk or clarify
      const question = capacity.maxQuestionsAllowed > 0 ? (
        language === 'hi'
          ? 'Kya chal raha hai, bata sakte hain?'
          : language === 'hinglish'
          ? 'What is the actual issue right now?'
          : 'What is happening right now?'
      ) : undefined;

      return {
        strategy: 'REFLECT_LISTEN',
        minimumUsefulResponse: response,
        questionOrPrompt: question,
        shouldRouteToIntervention: false,
        rationale: 'User correction overridden previous hypothesis. Acknowledged cleanly.'
      };
    }

    // D. USER EXPLICITLY WANTS LISTENING ONLY ("bas sun, advice mat de")
    if (supportNeed.need === 'LISTENING' && receptivity.explicitRefusalOfAdvice) {
      const response = {
        en: 'I am listening. No advice, no exercises. Say whatever you need to say.',
        hi: 'Main sun raha hu. Koi advice ya exercise nahi dunga. Jo kehna hai kahein.',
        hinglish: 'Main sun raha hu. Zero advice, zero exercises. Jo bolna hai bolo, I am here.'
      }[language];

      return {
        strategy: 'REFLECT_LISTEN',
        minimumUsefulResponse: response,
        questionOrPrompt: undefined, // ZERO questions when user asked to just listen
        shouldRouteToIntervention: false,
        rationale: 'User explicitly barred advice. Strict attunement without unsolicited solutions.'
      };
    }

    // E. LOW CAPACITY GOVERNOR
    // If capacity is LOW: minimum words, NO complex questions, minimal cognitive load!
    if (capacity.capacity === 'LOW') {
      const responses = {
        en: 'You are carrying a lot right now. We can pause here for a moment.',
        hi: 'Load bohot zyada lag raha hai. Yahin ek second ka pause le sakte hain.',
        hinglish: 'Load bohot heavy lag raha hai abhi. Yahin ek second pause lete hain.'
      };

      return {
        strategy: 'PAUSE_SPACE',
        minimumUsefulResponse: responses[language],
        questionOrPrompt: undefined,
        shouldRouteToIntervention: false,
        rationale: 'Capacity governor active: low processing bandwidth prohibits questions or multi-step logic.'
      };
    }

    // F. CHECKING LOOP / REASSURANCE DETECTED
    if (/\b(baar baar.*check|same cheez check|reassurance)\b/i.test(rawMessage)) {
      const responses = {
        en: 'Checking repeatedly feeds the anxiety loop. Let us look at what is certain vs what is fear.',
        hi: 'Baar-baar check karne se loop aur badhta hai. Controllable baat alag karte hain.',
        hinglish: 'Baar-baar check karne se loop badhta hai. Facts aur darr ko separate karte hain.'
      };

      return {
        strategy: 'UNCERTAINTY_SPLIT',
        minimumUsefulResponse: responses[language],
        shouldRouteToIntervention: true,
        suggestedInterventionId: 'controllable_split',
        rationale: 'Anti-reassurance rule: break loop via controllable splitting.'
      };
    }

    // G. CLARIFICATION ("bhai pata nahi kya ho raha hai", "I don't know why I'm feeling like this")
    if (supportNeed.need === 'CLARIFICATION') {
      const responses = {
        en: 'It is okay not to have words for it right now. Is this mostly physical tension or mental racing?',
        hi: 'Abhi sab clear na hona normal hai. Yeh zyada shareer mein bechaini hai ya dimag mein?',
        hinglish: 'It is okay agar abhi samajh nahi aa raha. Physical tension zyada hai ya dimag mein shor?'
      };

      return {
        strategy: 'CALIBRATED_QUESTION',
        minimumUsefulResponse: responses[language],
        questionOrPrompt: undefined,
        shouldRouteToIntervention: false,
        rationale: 'Single calibrated clarifying question to isolate physiological vs cognitive mechanism.'
      };
    }

    // H. REGULATION ("dimag ruk hi nahi raha", "gussa aa raha hai")
    if (supportNeed.need === 'REGULATION') {
      const targetIntervention = emotion.detectedEmotions.includes('anger')
        ? 'thermal_distance_pause'
        : 'autonomic_breath_brake';

      const responses = {
        en: 'The nervous system is running high. We can apply a quick physical brake to steady the baseline.',
        hi: 'Dimag aur shareer tez speed par hain. Pehle ek chhota physical pause le sakte hain.',
        hinglish: 'System abhi high gear par hai. Ek fast physical pause lagate hain taaki baseline normal ho.'
      };

      return {
        strategy: 'PROPOSE_INTERVENTION',
        minimumUsefulResponse: responses[language],
        shouldRouteToIntervention: true,
        suggestedInterventionId: targetIntervention,
        rationale: 'Direct routing into calibrated physiological down-regulation.'
      };
    }

    // I. SOLVING / ACTION ("mujhe samajh nahi aa raha kya karu", "kaam taal raha hu")
    if (supportNeed.need === 'SOLVING' || supportNeed.need === 'ACTION') {
      const responses = {
        en: 'When facing friction, we only need to touch the task for 120 seconds.',
        hi: 'Jab kaam shuru karne mein rukawat ho, toh sirf 2 minute ka micro-step kaafi hota hai.',
        hinglish: 'Jab start karne ka friction high ho, toh sirf 120 seconds ke liye touch karte hain.'
      };

      return {
        strategy: 'PROPOSE_INTERVENTION',
        minimumUsefulResponse: responses[language],
        shouldRouteToIntervention: true,
        suggestedInterventionId: 'micro_friction_starter',
        rationale: 'Direct routing to initiation friction intervention.'
      };
    }

    // Default Attunement
    const defaultResponse = {
      en: 'I hear you. Take your time.',
      hi: 'Main sun raha hu. Araam se batayein.',
      hinglish: 'Main sun raha hu. Take your time.'
    }[language];

    return {
      strategy: 'REFLECT_LISTEN',
      minimumUsefulResponse: defaultResponse,
      shouldRouteToIntervention: false,
      rationale: 'Low-pressure attunement.'
    };
  }

  /**
   * Helper: Maps a support need and mechanism to the best existing NeuroCalm intervention ID
   */
  public getMatchingInterventionId(
    supportNeed: SupportNeedType,
    mechanism: FunctionalMechanism
  ): string {
    const match = CALIBRATED_INTERVENTIONS.find(i => i.targetMechanism === mechanism);
    if (match) return match.id;
    return 'autonomic_breath_brake';
  }
}

export const conversationIntelligenceEngine = new ConversationIntelligenceEngine();
