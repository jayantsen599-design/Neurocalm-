/**
 * NEUROCALM ADAPTIVE GOVERNOR (Step 3)
 *
 * Core Question Answered:
 * "ABHI IS USER KE LIYE SABSE USEFUL NEXT MOVE KYA HAI?"
 * (What is the most useful next move for this user right now?)
 *
 * Chooses the minimum useful assistance.
 * Does NOT replace existing interventions — it selects, routes into, defers, or rejects them.
 *
 * Priority Hierarchy (Section 39):
 * 1. SAFETY
 * 2. CURRENT USER STATE
 * 3. USER CORRECTION
 * 4. USER GOAL
 * 5. FUNCTIONAL CAPACITY
 * 6. SUPPORT NEED
 * 7. RECEPTIVITY
 * 8. UNCERTAINTY
 * 9. REVERSIBILITY / CONSEQUENCE
 * 10. PREVIOUS OUTCOME
 * 11. INTERVENTION FIT
 * 12. PERSONALIZATION
 * 13. COMMUNICATION STYLE
 */

import {
  CurrentState,
  CapacityLevel,
  ReceptivityLevel,
  SupportNeedType,
  ConversationStage,
  ProblemCategory,
  FunctionalMechanism,
  OutcomeType,
  GovernorStrategy,
  GovernorDecision,
  CommunicationPolicy,
  ResponseLengthPolicy,
  QuestionDensityPolicy,
  CognitiveComplexityPolicy,
  DirectivenessPolicy,
  WarmthPolicy,
  VocabularyPolicy,
  DetailLevelPolicy,
  ChoiceCountPolicy,
  PacingPolicy,
  ExplanationDepthPolicy,
  LivingContext,
  EmotionSignal,
  SituationModel,
  ConversationSignals
} from '../types/neurocalm';
import { CALIBRATED_INTERVENTIONS } from './interventionLibrary';
import { researchPolicyEngine } from './researchRegistry';
import { safetyGateway } from './safetyGateway';
import { conversationSignalsProcessor } from './conversationSignals';
import { wisdomLensEngine } from './wisdomLens';
import { storyUnderstandingEngine } from './storyUnderstanding';
import { mechanismExplorer } from './mechanismExplorer';
import { responseDepthEngine } from './responseDepthEngine';
import { directivenessDialEngine } from './directivenessDial';
import { multiTurnTrajectoryEngine } from './multiTurnTrajectory';
import { failureLearningEngine } from './failureLearning';
import { medicalBoundaryEngine } from './medicalBoundaries';
import {
  WisdomLensTradition,
  MedicalBoundaryEvaluation,
  ResponseDepthLevel,
  StoryUnderstanding
} from '../types/neurocalm';

export interface GovernorContextInputs {
  problem: ProblemCategory;
  state: CurrentState;
  intensity: number;
  rawInput: string;
  emotionSignal: EmotionSignal;
  situationModel: SituationModel;
  livingContext: LivingContext;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  supportNeed: SupportNeedType;
  conversationStage: ConversationStage;
  previousStrategy?: GovernorStrategy;
  previousOutcome?: OutcomeType;
  userCorrectionText?: string;
  reassuranceCount: number;
  sessionTurnCount: number;
  consecutiveAIDelegationCount?: number;
  consecutiveStrategyCount?: number;
  timeAvailableMinutes?: number;
  conversationSignals?: ConversationSignals;
  listeningLock?: boolean;
  isExplicitRegulationRequested?: boolean;
  isExplicitSolutionRequested?: boolean;
}

export class AdaptiveGovernor {
  /**
   * Primary Evaluation Entry Point
   *
   * MANDATORY PRIORITY ORDER:
   * SAFETY_CRITICAL_OVERRIDE
   * > EXPLICIT_CURRENT_USER_INTENT (Exit, Correction)
   * > EXPLICIT_SUPPORT_REQUEST (Listening Lock, Explicit Solution, Explicit Regulation)
   * > CURRENT_CONVERSATION_STAGE
   * > SUPPORT_NEED
   * > USER_GOAL
   * > FUNCTIONAL_CAPACITY
   * > RECEPTIVITY
   * > CURRENT_STATE
   * > CURRENT_CONVERSATION_SIGNALS
   * > INFERRED_EMOTION
   * > OLD_MEMORY
   * > DEFAULT_INTERVENTION (NEVER AUTOMATIC)
   */
  public evaluate(inputs: GovernorContextInputs): GovernorDecision {
    const text = inputs.rawInput.toLowerCase().trim();
    const signals = inputs.conversationSignals || conversationSignalsProcessor.extractSignals(inputs.rawInput);

    let decision: GovernorDecision;

    // ---------------------------------------------------------
    // 1. SAFETY GATE (Absolute Priority 1)
    // Safety can override any conversational preference.
    // ---------------------------------------------------------
    const isCrisis =
      safetyGateway.screenInput(inputs.rawInput).level === 'CRISIS' ||
      /\b(kill myself|end my life|want to die|suicide|commit suicide|harm myself)\b/i.test(text);

    if (isCrisis) {
      decision = this.buildCrisisDecision(inputs);
    } else {
      // ---------------------------------------------------------
      // 2. EXPLICIT CURRENT USER INTENT: CLEAN EXIT
      // ---------------------------------------------------------
      const wantsExit =
        /\b(theek hai ab|all good|shukriya|thanks bye|sorted|handled it|see you|nikalta hu|bye)\b/i.test(text) ||
        inputs.supportNeed === 'CLEAN_EXIT' ||
        inputs.supportNeed === 'EXIT';

      if (wantsExit) {
        decision = this.buildCleanExitDecision(inputs);
      } else if (
        inputs.livingContext.status === 'USER_CORRECTED' ||
        signals.contradictionOrCorrection ||
        Boolean(inputs.userCorrectionText)
      ) {
        // ---------------------------------------------------------
        // 3. EXPLICIT CURRENT USER INTENT: USER CORRECTION
        // (Priority 3: Overrides all AI inferences, decreases confidence)
        // ---------------------------------------------------------
        decision = this.buildUserCorrectionDecision(inputs);
      } else if (
        medicalBoundaryEngine.evaluate(inputs.rawInput).isMedicalQuery &&
        medicalBoundaryEngine.evaluate(inputs.rawInput).containsDiagnosticRequest
      ) {
        // ---------------------------------------------------------
        // 3b. MEDICAL EVIDENCE & DIAGNOSTIC BOUNDARIES (Section 10 & 11)
        // ---------------------------------------------------------
        decision = this.buildMedicalBoundaryDecision(inputs, medicalBoundaryEngine.evaluate(inputs.rawInput));
      } else if (wisdomLensEngine.detectExplicitWisdomRequest(text).requested) {
        // ---------------------------------------------------------
        // 3c. EXPLICIT WISDOM LENS REQUEST (Section 12)
        // ---------------------------------------------------------
        decision = this.buildWisdomLensDecision(inputs, wisdomLensEngine.detectExplicitWisdomRequest(text).tradition);
      } else if (inputs.previousOutcome === 'NO_CHANGE' || inputs.previousOutcome === 'WORSE') {
        // ---------------------------------------------------------
        // 4. FAILURE RECOVERY (Step down cognitive demand)
        // ---------------------------------------------------------
        decision = this.buildFailureRecoveryDecision(inputs);
      } else if (
        (inputs.listeningLock && !/\b(ab\s+bata\s+kya\s+karu|kya\s+karu|bata|solution|help|dono alag nahi|samajh nahi aa raha)\b/i.test(text)) ||
        signals.explicitListeningRequest ||
        signals.adviceRejection ||
        /\b(bas\s+sun|sirf\s+sun|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|don't\s+give\s+advice|just\s+listen|mujhe\s+bas\s+bolne\s+de)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 5. EXPLICIT SUPPORT REQUEST: LISTENING LOCK & PURE LISTENING
        // (Prohibits SOLVE/CHALLENGE/ACTIVATE/TEACH/TRANSFER)
        // (Zero unsolicited intervention, zero unsolicited technique)
        // ---------------------------------------------------------
        decision = this.buildExplicitListeningDecision(inputs);
      } else if (
        inputs.isExplicitRegulationRequested ||
        signals.explicitRegulationRequest
      ) {
        // ---------------------------------------------------------
        // 6. EXPLICIT SUPPORT REQUEST: REGULATION ("mujhe calm hona hai")
        // ---------------------------------------------------------
        decision = this.buildExplicitRegulationDecision(inputs);
      } else if (
        inputs.reassuranceCount >= 2 ||
        /\b(baar baar.*check|pakka na|sure ho|confirm|bar bar dekh raha)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6b. DEPENDENCY & REASSURANCE LOOP GOVERNOR (Anti-Dependency)
        // ---------------------------------------------------------
        decision = this.buildAntiReassuranceDecision(inputs);
      } else if (
        inputs.supportNeed === 'DECISION_SUPPORT' ||
        inputs.problem === 'decision_overload' ||
        /\b(decision|choose|option|kya karun samajh nahi aa raha|kya karna chahiye)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6c. DECISION OVERLOAD & UNCERTAINTY SPLIT
        // ---------------------------------------------------------
        decision = this.buildDecisionSupportDecision(inputs);
      } else if (
        inputs.emotionSignal.detectedEmotions.includes('anger') ||
        inputs.problem === 'anger' ||
        /\b(gussa|furious|rage|chidh|annoyed)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6d. ANGER EMOTION RULE (Anger != Calm Down)
        // ---------------------------------------------------------
        decision = this.buildAngerGovernorDecision(inputs);
      } else if (
        inputs.emotionSignal.detectedEmotions.includes('hurt') ||
        inputs.problem === 'rejection' ||
        /\b(rejection|reject|dil toot|mana kar diya|ignored|left me)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6e. HURT / REJECTION / SOCIAL PAIN RULE
        // ---------------------------------------------------------
        decision = this.buildHurtRejectionDecision(inputs);
      } else if (
        signals?.hasPataNahi ||
        /^(bhai\s+)?pata nahi(\s+kya ho raha hai)?$/i.test(text) ||
        /\b(pata nahi|kuch samajh nahi aa raha|no clue)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6f. "PATA NAHI" UNCERTAINTY RESOLVER
        // ---------------------------------------------------------
        decision = this.buildPataNahiDecision(inputs);
      } else if (
        /\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|samajh hi nahi aa raha problem kya hai|mujhe lagta hai.*miss.*raat|dono alag)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6g. CONFOUNDED MECHANISMS / DEEP UNDERSTANDING & CLARIFICATION
        // ---------------------------------------------------------
        decision = this.buildClarificationAndUnderstandingDecision(inputs);
      } else if (
        inputs.isExplicitSolutionRequested ||
        signals.explicitSolutionRequest ||
        /\b(ab\s+bata\s+kya\s+karu|kya\s+karu|solution\s+bata|help\s+me\s+solve|bata\s+kya\s+karu)\b/i.test(text)
      ) {
        // ---------------------------------------------------------
        // 6h. EXPLICIT SUPPORT REQUEST: SOLVING ("bata kya karu")
        // ---------------------------------------------------------
        decision = this.buildSolvingDecision(inputs);
      } else if ((inputs.consecutiveAIDelegationCount || 0) >= 3) {
        // ---------------------------------------------------------
        // 8. AUTONOMY PROTECTION: AI DELEGATION REDUCTION
        // ---------------------------------------------------------
        decision = this.buildDependencyReductionDecision(inputs);
      } else {
        // ---------------------------------------------------------
        // 14. FUNCTIONAL CAPACITY x SUPPORT NEED MATRIX
        // ---------------------------------------------------------
        decision = this.buildMatrixDecision(inputs);
      }
    }

    // ---------------------------------------------------------
    // CRITICAL GOVERNOR INVARIANTS (Enforced in Code)
    // ---------------------------------------------------------
    const isSafetyOverride = isCrisis;
    const isExplicitListening =
      (Boolean(inputs.listeningLock) && !/\b(ab\s+bata\s+kya\s+karu|kya\s+karu|bata|solution|help|dono alag nahi|samajh nahi aa raha)\b/i.test(text)) ||
      Boolean(signals.explicitListeningRequest) ||
      Boolean(signals.adviceRejection) ||
      /\b(bas\s+sun|sirf\s+sun|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|just\s+listen|mujhe\s+bas\s+bolne\s+de)\b/i.test(text);

    // Invariant 1: While LISTENING is active, Governor MUST NOT select SOLVE / CHALLENGE / ACTIVATE / TEACH / TRANSFER
    if (!isSafetyOverride && isExplicitListening) {
      const forbiddenStrategies: GovernorStrategy[] = ['SOLVE', 'CHALLENGE', 'ACTIVATE', 'TEACH', 'TRANSFER'];
      if (forbiddenStrategies.includes(decision.primaryStrategy)) {
        decision.primaryStrategy = 'LISTEN';
        decision.reason = 'Governor Invariant Enforced: LISTENING mode active. Forbidden SOLVE/ACTIVATE/TEACH/TRANSFER overridden to non-evaluative listening.';
      }
      decision.interventionEligible = false;
      decision.targetInterventionId = undefined;
      decision.questionBudget = 0;
    }

    // Invariant 2: Receptivity & Non-Intervention Hard Gate
    // Zero unsolicited intervention when user is NOT_READY, exiting, or in pure listening mode
    if (!isSafetyOverride) {
      if (
        isExplicitListening ||
        inputs.receptivity === 'NOT_READY' ||
        decision.primaryStrategy === 'LISTEN' ||
        decision.primaryStrategy === 'EXIT' ||
        decision.primaryStrategy === 'HUMAN_SUPPORT'
      ) {
        decision.interventionEligible = false;
        decision.targetInterventionId = undefined;
      }
    }

    // Attach Step 5 Research Intelligence Audit
    const wantsExit =
      /\b(theek hai ab|all good|shukriya|thanks bye|sorted|handled it|see you|nikalta hu|bye)\b/i.test(text) ||
      inputs.supportNeed === 'CLEAN_EXIT';
    const explicitListening =
      inputs.receptivity === 'NOT_READY' ||
      /\b(bas sun|advice mat de|just listen|don't give advice|lecture mat de|gyan mat de)\b/i.test(text);

    decision.researchAudit = researchPolicyEngine.evaluatePipeline({
      text,
      problem: inputs.problem,
      state: inputs.state,
      capacity: inputs.capacity,
      reassuranceCount: inputs.reassuranceCount,
      sessionTurnCount: inputs.sessionTurnCount,
      isCrisis,
      userRequestedCleanExit: wantsExit,
      explicitListeningOnly: explicitListening
    });

    // Dynamic Response Depth (Section 2 Architecture)
    const depthResult = responseDepthEngine.selectDepth({
      rawInput: inputs.rawInput,
      supportNeed: decision.supportNeed,
      capacity: decision.capacity,
      receptivity: decision.receptivity,
      conversationStage: decision.conversationStage,
      signals,
      previousOutcome: inputs.previousOutcome,
      turnIndex: inputs.sessionTurnCount,
      isExplicitSolutionRequested: inputs.isExplicitSolutionRequested,
      isExplicitListeningRequested: isExplicitListening
    });
    decision.responseDepth = depthResult.depth;

    // Dynamic Directiveness Dial (Section 18 Architecture)
    decision.directivenessDial = directivenessDialEngine.computeDial({
      rawInput: inputs.rawInput,
      supportNeed: decision.supportNeed,
      capacity: decision.capacity,
      uncertainty: decision.uncertainty,
      reversibility: decision.reversibility,
      stake: inputs.rawInput.length > 80 ? 'MODERATE' : 'LOW',
      isExplicitSolutionRequested: inputs.isExplicitSolutionRequested,
      isExplicitListeningRequested: isExplicitListening
    });

    // Competing Mechanism Hypotheses & Discriminating Test (Section 8 & 9)
    const mechanismEval = mechanismExplorer.evaluateCompetingMechanisms(
      inputs.rawInput,
      inputs.emotionSignal,
      { need: decision.supportNeed, primaryNeed: decision.supportNeed, confidence: 0.85, rationale: '' },
      signals
    );
    decision.competingMechanisms = mechanismEval.hypotheses;
    decision.discriminatingTest = mechanismEval.discriminatingTest;

    // Structured Story & Deep Situation Model (Section 4)
    decision.storyUnderstanding = storyUnderstandingEngine.buildStoryModel(
      inputs.rawInput,
      inputs.emotionSignal,
      { need: decision.supportNeed, primaryNeed: decision.supportNeed, confidence: 0.85, rationale: '' },
      inputs.livingContext,
      signals
    );

    // Multi-Turn Trajectory (Section 26)
    decision.multiTurnTrajectory = multiTurnTrajectoryEngine.evaluateTrajectory(
      [],
      inputs.rawInput,
      inputs.intensity
    );

    // Governed Wisdom Lens (if not already set and applicable)
    if (!decision.wisdomLens) {
      decision.wisdomLens = wisdomLensEngine.evaluate({
        rawInput: inputs.rawInput,
        problem: inputs.problem,
        state: inputs.state,
        receptivity: { receptivity: inputs.receptivity, explicitRefusalOfAdvice: Boolean(inputs.listeningLock), signals: [], confidence: 0.8 },
        userExplicitRequest: false
      });
    }

    // Failure Learning Attribution (Section 22)
    if (inputs.previousOutcome === 'NO_CHANGE' || inputs.previousOutcome === 'WORSE') {
      decision.failureAttribution = failureLearningEngine.analyzeFailure({
        outcome: inputs.previousOutcome,
        problem: inputs.problem,
        mechanism: 'working_memory_overload',
        interventionId: decision.targetInterventionId,
        capacity: inputs.capacity,
        userFeedbackText: inputs.rawInput,
        sessionFailedInterventions: []
      });
    }

    return decision;
  }

  // -----------------------------------------------------------
  // DECISION BUILDERS
  // -----------------------------------------------------------

  private buildCrisisDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'DIRECT',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ZERO',
      pacing: 'DIRECT',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: 'LOW',
      capacityConfidence: 0.99,
      receptivity: 'NOT_READY',
      supportNeed: 'HUMAN_SUPPORT',
      conversationStage: 'CLOSING',
      userGoal: 'Immediate safety & human connection',
      uncertainty: 'LOW',
      reversibility: 'IRREVERSIBLE',
      primaryStrategy: 'HUMAN_SUPPORT',
      responseLength: 'SHORT',
      questionBudget: 0,
      directiveness: 'DIRECT',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: true,
      reason: 'Safety Gateway triggered: immediate human support referral required.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Severe crisis or life-safety keyword detected',
        fitFunction: 'Immediate safety protocol',
        nextMove: 'Direct bypass to human support and helplines',
        outcomeCheck: 'Verify user is connecting to real person'
      }
    };
  }

  private buildCleanExitDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'TINY',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'DIRECT',
      warmth: 'WARM',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ZERO',
      pacing: 'DIRECT',
      explanationDepth: 'NONE'
    };

    return {
      state: 'baseline',
      capacity: inputs.capacity,
      capacityConfidence: 0.9,
      receptivity: 'READY',
      supportNeed: 'CLEAN_EXIT',
      conversationStage: 'CLOSING',
      userGoal: 'Return to real-world life',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'EXIT',
      responseLength: 'TINY',
      questionBudget: 0,
      directiveness: 'DIRECT',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: true,
      humanSupportRelevant: false,
      reason: 'User signaled session completion. Clean exit treated as genuine success.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Completion or exit keyword',
        fitFunction: 'Autonomous off-ramp',
        nextMove: 'Release user back to life without manufactured follow-ups',
        outcomeCheck: 'Session concluded'
      }
    };
  }

  private buildMedicalBoundaryDecision(inputs: GovernorContextInputs, medical: MedicalBoundaryEvaluation): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'BALANCED',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: 'ZERO',
      pacing: 'CALIBRATED',
      explanationDepth: 'BRIEF'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.9,
      receptivity: inputs.receptivity,
      supportNeed: 'INFORMATION',
      conversationStage: 'CLARIFYING',
      userGoal: 'Medical inquiry boundary clarification',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'REFLECT',
      responseLength: 'BALANCED',
      questionBudget: 0,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: true,
      reason: 'Medical inquiry: evidence-based informational framing with strict referral boundaries without diagnosis.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Medical diagnosis or clinical query',
        fitFunction: 'Educational non-diagnostic boundary enforcement',
        nextMove: 'Clarify tool scope and direct to clinical practitioner',
        outcomeCheck: 'User informed of clinical boundaries'
      },
      medicalBoundary: medical
    };
  }

  private buildWisdomLensDecision(inputs: GovernorContextInputs, tradition: WisdomLensTradition): GovernorDecision {
    const wisdomInsight = wisdomLensEngine.evaluate({
      rawInput: inputs.rawInput,
      problem: inputs.problem,
      state: inputs.state,
      receptivity: { receptivity: inputs.receptivity, explicitRefusalOfAdvice: Boolean(inputs.listeningLock), signals: [], confidence: 0.9 },
      userExplicitRequest: true
    });

    const policy: CommunicationPolicy = {
      responseLength: 'BALANCED',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'EVERYDAY',
      detailLevel: 'FOCUSED',
      choiceCount: 'ZERO',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'BRIEF'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.85,
      receptivity: inputs.receptivity,
      supportNeed: 'PERSPECTIVE',
      conversationStage: 'CLARIFYING',
      userGoal: 'Philosophical / contemplative wisdom inquiry',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'REFLECT',
      responseLength: 'BALANCED',
      questionBudget: 0,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: `Wisdom Lens activated: User explicitly requested ${tradition} perspective. Level E4 traditional wisdom provided distinctly from medical evidence.`,
      communicationPolicy: policy,
      shape: {
        catchSignal: `Explicit request for ${tradition} tradition insight`,
        fitFunction: 'Contemplative inquiry',
        nextMove: 'Present Level E4 wisdom without medical claims or quote dumping',
        outcomeCheck: 'Reflective integration'
      },
      wisdomLens: wisdomInsight
    };
  }

  private buildUserCorrectionDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: inputs.capacity === 'LOW' ? 'ZERO' : 'ONE',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: 'ZERO',
      pacing: 'CALIBRATED',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.95,
      receptivity: inputs.receptivity,
      supportNeed: 'CLARIFICATION',
      conversationStage: 'CLARIFYING',
      userGoal: 'Correct previous AI misinterpretation',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'REFLECT',
      responseLength: 'SHORT',
      questionBudget: inputs.capacity === 'LOW' ? 0 : 1,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'User correction strictly overrides AI inference. Acknowledge cleanly and realign.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'User explicit correction of AI interpretation',
        fitFunction: 'Immediate epistemic realignment',
        nextMove: 'Acknowledge correction and ask at most 1 clarifying question',
        outcomeCheck: 'Confirm alignment with user statement'
      }
    };
  }

  private buildAntiReassuranceDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'LOW',
      directiveness: 'DIRECT',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: 'BRIEF'
    };

    return {
      state: 'overloaded',
      capacity: inputs.capacity,
      capacityConfidence: 0.85,
      receptivity: 'LIMITED',
      supportNeed: 'REGULATION',
      conversationStage: 'GROUNDING',
      userGoal: 'Escape reassurance checking loop',
      uncertainty: 'HIGH',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'GROUND',
      responseLength: 'SHORT',
      questionBudget: 0,
      directiveness: 'DIRECT',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'LOW',
      interventionEligible: true,
      targetInterventionId: 'controllable_split',
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'Reassurance loop detected. Anti-reassurance governor halts endless comfort and routes to uncertainty split.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Repeated checking / reassurance query',
        fitFunction: 'Loop disruption via uncertainty partition',
        nextMove: 'Separate controllable facts from uncontrollable worry',
        outcomeCheck: 'Check if urge to re-check subsides'
      }
    };
  }

  private buildDependencyReductionDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ONE',
      cognitiveComplexity: 'LOW',
      directiveness: 'LOW',
      warmth: 'WARM',
      vocabulary: 'EVERYDAY',
      detailLevel: 'FOCUSED',
      choiceCount: 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.8,
      receptivity: 'READY',
      supportNeed: 'ACTION',
      conversationStage: 'CLOSING',
      userGoal: 'Real-world autonomy',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'TRANSFER',
      responseLength: 'SHORT',
      questionBudget: 1,
      directiveness: 'LOW',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: true,
      humanSupportRelevant: false,
      reason: 'Dependency Protection triggered: AI reliance rising without skill transfer. Encourage real-world move.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Consecutive decision delegations to AI',
        fitFunction: 'Autonomy handoff',
        nextMove: 'Prompt user for their own judgment and step away',
        outcomeCheck: 'User acts without AI validation'
      }
    };
  }

  private buildExplicitListeningDecision(inputs: GovernorContextInputs): GovernorDecision {
    const isLowCap = inputs.capacity === 'LOW';
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'LOW',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ZERO',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.98,
      receptivity: 'NOT_READY',
      supportNeed: 'LISTENING',
      conversationStage: 'INTAKE_ATTUNEMENT',
      userGoal: 'Vent / be heard without unsolicited advice',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: isLowCap ? 'PAUSE' : 'LISTEN',
      responseLength: 'SHORT',
      questionBudget: 0,
      directiveness: 'LOW',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: isLowCap
        ? 'Low capacity governor active: low processing bandwidth prohibits questions. Holding quiet space.'
        : 'User explicitly barred advice/solutions ("bas sun"). Governor enforces pure listening mode.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Explicit refusal of advice or intervention',
        fitFunction: 'Non-evaluative attentive presence',
        nextMove: 'Acknowledge presence without advice, exercises, or questions',
        outcomeCheck: 'Wait for user to signal next move'
      }
    };
  }

  private buildExplicitRegulationDecision(inputs: GovernorContextInputs): GovernorDecision {
    const targetId =
      CALIBRATED_INTERVENTIONS.find((i) => i.primaryProblems.includes(inputs.problem))?.id ||
      'autonomic_breath_brake';
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'DIRECT',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ZERO',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.9,
      receptivity: 'READY',
      supportNeed: 'REGULATION',
      conversationStage: 'GROUNDING',
      userGoal: 'Immediate physiological stabilization (explicitly requested)',
      uncertainty: 'LOW',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'GROUND',
      responseLength: 'SHORT',
      questionBudget: 0,
      directiveness: 'DIRECT',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: true,
      targetInterventionId: targetId,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'User explicitly requested regulation ("mujhe calm hona hai"). Calibrated grounding intervention enabled.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Explicit regulation request',
        fitFunction: 'Immediate physiological down-regulation',
        nextMove: 'Deliver calibrated regulation technique',
        outcomeCheck: 'Observe baseline steadiness'
      }
    };
  }

  private buildSolvingDecision(inputs: GovernorContextInputs): GovernorDecision {
    const isLowCapacity = inputs.capacity === 'LOW' || inputs.supportNeed === 'ACTION';
    if (isLowCapacity) {
      const lowPolicy: CommunicationPolicy = {
        responseLength: 'TINY',
        questionDensity: 'ZERO',
        cognitiveComplexity: 'MINIMAL',
        directiveness: 'DIRECT',
        warmth: 'ATTUNED',
        vocabulary: 'SIMPLE',
        detailLevel: 'MINIMAL',
        choiceCount: 'ZERO',
        pacing: 'SLOW_PAUSE',
        explanationDepth: 'NONE'
      };

      return {
        state: inputs.state,
        capacity: 'LOW',
        capacityConfidence: 0.9,
        receptivity: 'READY',
        supportNeed: 'ACTION',
        conversationStage: 'SOLVING',
        userGoal: 'Single low-effort micro-step without analysis',
        uncertainty: 'LOW',
        reversibility: 'HIGHLY_REVERSIBLE',
        primaryStrategy: 'ACTIVATE',
        responseLength: 'TINY',
        questionBudget: 0,
        directiveness: 'DIRECT',
        cognitiveLoadBudget: 'MINIMAL',
        frictionBudget: 'MINIMAL',
        interventionEligible: true,
        targetInterventionId: 'micro_friction_starter',
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'Low capacity action requested. Governor reduces friction to single micro-step (120s starter).',
        communicationPolicy: lowPolicy,
        shape: {
          catchSignal: 'Low capacity action demand',
          fitFunction: 'Micro-friction activation',
          nextMove: 'Touch task for 120 seconds',
          outcomeCheck: 'User begins without cognitive overload'
        }
      };
    }

    const isHighCapacity = inputs.capacity === 'HIGH';
    const policy: CommunicationPolicy = {
      responseLength: isHighCapacity ? 'EXPANDED' : 'BALANCED',
      questionDensity: 'ONE',
      cognitiveComplexity: isHighCapacity ? 'MODERATE' : 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'EVERYDAY',
      detailLevel: 'FOCUSED',
      choiceCount: 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: 'BRIEF'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.85,
      receptivity: 'READY',
      supportNeed: 'PROBLEM_SOLVING',
      conversationStage: 'SOLVING',
      userGoal: 'Actionable steps to resolve current bottleneck',
      uncertainty: 'MODERATE',
      reversibility: 'PARTIALLY_REVERSIBLE',
      primaryStrategy: 'SOLVE',
      responseLength: isHighCapacity ? 'EXPANDED' : 'BALANCED',
      questionBudget: 1,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: isHighCapacity ? 'MODERATE' : 'LOW',
      frictionBudget: 'LOW',
      interventionEligible: false,
      targetInterventionId: undefined,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'User explicitly requested solution ("bata kya karu"). Governor transitions to collaborative problem solving.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Explicit solution request',
        fitFunction: 'Actionable bottleneck resolution',
        nextMove: 'Propose direct, low-friction next step',
        outcomeCheck: 'User confirms readiness to act'
      }
    };
  }

  private buildFailureRecoveryDecision(inputs: GovernorContextInputs): GovernorDecision {
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: 'ZERO',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ONE',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'NONE'
    };

    // If previous intervention failed, step down to low friction or pause
    return {
      state: 'depleted',
      capacity: 'LOW',
      capacityConfidence: 0.9,
      receptivity: 'LIMITED',
      supportNeed: 'REGULATION',
      conversationStage: 'GROUNDING',
      userGoal: 'Recovery from ineffective intervention',
      uncertainty: 'MODERATE',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'REDUCE',
      responseLength: 'SHORT',
      questionBudget: 0,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: true,
      targetInterventionId: 'sensory_depletion_reset',
      exitEligible: false,
      humanSupportRelevant: false,
      reason: `Previous strategy yielded ${inputs.previousOutcome}. Reducing cognitive demand and offering low-friction pause.`,
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Reported lack of change or worsening',
        fitFunction: 'Cheapest useful recovery step',
        nextMove: 'Reduce task demand and pause without repeating failed action',
        outcomeCheck: 'Check if strain subsides'
      }
    };
  }

  private buildPataNahiDecision(inputs: GovernorContextInputs): GovernorDecision {
    // "Pata nahi" rule: do NOT treat as low intelligence, anxiety, or need for breathing. Treat as genuine uncertainty.
    // When repeated: reduce conversational demand, zero questions!
    const isRepeated =
      (inputs.sessionTurnCount >= 2 && inputs.previousStrategy === 'CLARIFY') ||
      Boolean(inputs.conversationSignals?.repeatedWords.includes('pata'));

    const questionBudget = isRepeated ? 0 : (inputs.capacity === 'LOW' ? 0 : 1);
    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: questionBudget === 0 ? 'ZERO' : 'ONE',
      cognitiveComplexity: 'MINIMAL',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: questionBudget === 0 ? 'ZERO' : 'ONE',
      pacing: isRepeated ? 'SLOW_PAUSE' : 'CALIBRATED',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity === 'LOW' ? 'LOW' : 'MEDIUM',
      capacityConfidence: 0.8,
      receptivity: 'LIMITED',
      supportNeed: 'CLARIFICATION',
      conversationStage: 'CLARIFYING',
      userGoal: 'Untangle diffuse, unexplained sensations with minimum friction',
      uncertainty: 'HIGH',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: isRepeated ? 'PAUSE' : 'CLARIFY',
      responseLength: 'SHORT',
      questionBudget,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: false,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: isRepeated
        ? 'Repeated "pata nahi". Governor decreases conversational demand and holds quiet space with zero questions.'
        : 'User signaled "pata nahi". Governor treats this as uncertainty and applies low-friction clarification without intervention.',
      communicationPolicy: policy,
      shape: {
        catchSignal: '"Pata nahi" / diffuse uncertainty',
        fitFunction: 'Low-friction physical vs cognitive partition',
        nextMove: isRepeated ? 'Hold calm space without questioning' : 'Ask one simple distinguishing question',
        outcomeCheck: 'Isolate if bottleneck is bodily tension or thoughts'
      }
    };
  }

  private buildAngerGovernorDecision(inputs: GovernorContextInputs): GovernorDecision {
    // Anger rule: Anger != "Calm Down". Determine what happened, reversibility, and provide structured pause.
    const isEscalating = inputs.intensity >= 8 || /\b(chidh|rage|mar dunga|phod dunga)\b/i.test(inputs.rawInput);

    const policy: CommunicationPolicy = {
      responseLength: 'SHORT',
      questionDensity: isEscalating ? 'ZERO' : 'ONE',
      cognitiveComplexity: 'MINIMAL',
      directiveness: isEscalating ? 'DIRECT' : 'COLLABORATIVE',
      warmth: 'NEUTRAL',
      vocabulary: 'SIMPLE',
      detailLevel: 'MINIMAL',
      choiceCount: 'ZERO',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'NONE'
    };

    const targetId = 'thermal_distance_pause';

    return {
      state: 'hyperaroused',
      capacity: inputs.capacity,
      capacityConfidence: 0.85,
      receptivity: 'LIMITED',
      supportNeed: 'REGULATION',
      conversationStage: 'GROUNDING',
      userGoal: 'Prevent irreversible action during sympathetic spike',
      uncertainty: 'LOW',
      reversibility: 'PARTIALLY_REVERSIBLE',
      primaryStrategy: isEscalating ? 'GROUND' : 'REFLECT',
      responseLength: 'SHORT',
      questionBudget: isEscalating ? 0 : 1,
      directiveness: isEscalating ? 'DIRECT' : 'COLLABORATIVE',
      cognitiveLoadBudget: 'MINIMAL',
      frictionBudget: 'MINIMAL',
      interventionEligible: true,
      targetInterventionId: targetId,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'Anger detected. Governor avoids patronizing "calm down" and offers immediate 90-second physiological pause.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Anger / autonomic spike',
        fitFunction: 'Physiological distance before irreversible words/actions',
        nextMove: 'Apply 90-second temperature/distance pause',
        outcomeCheck: 'Assess if urge to react impulsively decreases'
      }
    };
  }

  private buildHurtRejectionDecision(inputs: GovernorContextInputs): GovernorDecision {
    // Section 15: No "think positive", "move on", "forget them". Distinguish experience + meaning.
    const policy: CommunicationPolicy = {
      responseLength: 'BALANCED',
      questionDensity: inputs.capacity === 'LOW' ? 'ZERO' : 'ONE',
      cognitiveComplexity: 'LOW',
      directiveness: 'LOW',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: 'ZERO',
      pacing: 'SLOW_PAUSE',
      explanationDepth: 'BRIEF'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.85,
      receptivity: 'LIMITED',
      supportNeed: 'CLARIFICATION',
      conversationStage: 'CLARIFYING',
      userGoal: 'Process social rejection without global identity damage',
      uncertainty: 'MODERATE',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'REFLECT',
      responseLength: 'BALANCED',
      questionBudget: inputs.capacity === 'LOW' ? 0 : 1,
      directiveness: 'LOW',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'MINIMAL',
      interventionEligible: true,
      targetInterventionId: 'identity_event_decoupling',
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'Rejection/hurt detected. Governor separates the painful event from personal identity without toxic positivity.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Rejection / social pain',
        fitFunction: 'Event vs identity decoupling',
        nextMove: 'Validate hurt and separate what happened from self-worth',
        outcomeCheck: 'Observe if shame/self-attack diminishes'
      }
    };
  }

  private buildDecisionSupportDecision(inputs: GovernorContextInputs): GovernorDecision {
    // Section 18: Decision Support - Options -> Priorities -> Trade-offs -> Uncertainty -> Next Step.
    // Decision Ownership Check: User retains ownership.
    const isHighCapacity = inputs.capacity === 'HIGH';

    const policy: CommunicationPolicy = {
      responseLength: isHighCapacity ? 'EXPANDED' : 'BALANCED',
      questionDensity: 'ONE',
      cognitiveComplexity: isHighCapacity ? 'MODERATE' : 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: isHighCapacity ? 'EVERYDAY' : 'SIMPLE',
      detailLevel: isHighCapacity ? 'DETAILED' : 'FOCUSED',
      choiceCount: isHighCapacity ? 'LIMITED' : 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: isHighCapacity ? 'EXPLANATORY' : 'BRIEF'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.9,
      receptivity: 'READY',
      supportNeed: 'DECISION_SUPPORT',
      conversationStage: 'SOLVING',
      userGoal: 'Clarify trade-offs while retaining personal ownership',
      uncertainty: 'HIGH',
      reversibility: 'PARTIALLY_REVERSIBLE',
      primaryStrategy: isHighCapacity ? 'EXPLORE' : 'SOLVE',
      responseLength: isHighCapacity ? 'EXPANDED' : 'BALANCED',
      questionBudget: 1,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: isHighCapacity ? 'MODERATE' : 'LOW',
      frictionBudget: 'LOW',
      interventionEligible: true,
      targetInterventionId: 'controllable_split',
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'Decision loop flagged. Governor partitions known facts from future uncertainty and prompts user ownership.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Dilemma / analysis paralysis',
        fitFunction: 'Decision matrix with ownership check',
        nextMove: 'Isolate reversible vs irreversible stakes',
        outcomeCheck: 'User expresses preference based on priorities'
      }
    };
  }

  private buildClarificationAndUnderstandingDecision(inputs: GovernorContextInputs): GovernorDecision {
    const isHighCapacity = inputs.capacity === 'HIGH';
    const isConfounded = /\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|dono alag)\b/i.test(inputs.rawInput);

    const policy: CommunicationPolicy = {
      responseLength: isHighCapacity || isConfounded ? 'EXPANDED' : 'BALANCED',
      questionDensity: 'ONE',
      cognitiveComplexity: isHighCapacity ? 'MODERATE' : 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'EVERYDAY',
      detailLevel: 'FOCUSED',
      choiceCount: 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: 'EXPLANATORY'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.9,
      receptivity: 'READY',
      supportNeed: 'CLARIFICATION',
      conversationStage: 'CLARIFYING',
      userGoal: 'Untangle confounding emotional drivers and clarify core mechanism',
      uncertainty: 'HIGH',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: 'CLARIFY',
      responseLength: inputs.capacity === 'LOW' ? 'SHORT' : (isHighCapacity || isConfounded ? 'EXPANDED' : 'BALANCED'),
      questionBudget: inputs.capacity === 'LOW' ? 0 : 1,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'LOW',
      interventionEligible: false,
      targetInterventionId: undefined,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: 'User is untangling confounding emotional drivers. Governor enforces deep story understanding and targeted clarification before intervention.',
      communicationPolicy: policy,
      shape: {
        catchSignal: 'Confounded emotional triggers or diffuse ambiguity',
        fitFunction: 'Mechanism untangling & problem decomposition',
        nextMove: 'Untangle intertwined factors and offer one discriminating check',
        outcomeCheck: 'User confirms separation of mechanisms'
      }
    };
  }

  private buildMatrixDecision(inputs: GovernorContextInputs): GovernorDecision {
    const { capacity, supportNeed } = inputs;

    // LOW CAPACITY (All support needs: Minimal cognitive load, 0 questions)
    if (capacity === 'LOW') {
      const isAction = supportNeed === 'ACTION' || supportNeed === 'SOLVING';
      const isExhausted = /\b(exhausted|drained|cannot think|blast|so tired|overwhelm)\b/i.test(inputs.rawInput);

      const policy: CommunicationPolicy = {
        responseLength: isAction ? 'TINY' : 'SHORT',
        questionDensity: 'ZERO',
        cognitiveComplexity: 'MINIMAL',
        directiveness: isAction ? 'DIRECT' : 'LOW',
        warmth: 'ATTUNED',
        vocabulary: 'SIMPLE',
        detailLevel: 'MINIMAL',
        choiceCount: 'ZERO',
        pacing: 'SLOW_PAUSE',
        explanationDepth: 'NONE'
      };

      const targetId = isAction
        ? 'micro_friction_starter'
        : (supportNeed === 'REGULATION' && !isExhausted ? 'autonomic_breath_brake' : undefined);

      const isExplicitListen = /\b(bas sun|advice mat de|just listen|vent)\b/i.test(inputs.rawInput);
      const strategy: GovernorStrategy = isAction
        ? 'ACTIVATE'
        : (isExplicitListen ? 'REFLECT' : (isExhausted ? 'PAUSE' : 'REFLECT'));

      return {
        state: inputs.state,
        capacity: 'LOW',
        capacityConfidence: 0.9,
        receptivity: inputs.receptivity,
        supportNeed,
        conversationStage: isAction ? 'SOLVING' : 'GROUNDING',
        userGoal: isAction ? 'Single low-friction starter step' : 'Minimal cognitive demand',
        uncertainty: 'LOW',
        reversibility: 'HIGHLY_REVERSIBLE',
        primaryStrategy: strategy,
        responseLength: isAction ? 'TINY' : 'SHORT',
        questionBudget: 0,
        directiveness: isAction ? 'DIRECT' : 'LOW',
        cognitiveLoadBudget: 'MINIMAL',
        frictionBudget: 'MINIMAL',
        interventionEligible: Boolean(targetId),
        targetInterventionId: targetId,
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'Low capacity governor active. Minimal cognitive load budget, zero questions, reduced friction.',
        communicationPolicy: policy,
        shape: {
          catchSignal: 'Low processing capacity',
          fitFunction: 'Cognitive load minimization',
          nextMove: targetId ? 'Offer 1 low-friction step' : 'Hold quiet space',
          outcomeCheck: 'Observe baseline recovery'
        }
      };
    }

    // C. MEDIUM CAPACITY + CLARIFICATION
    if (capacity === 'MEDIUM' && supportNeed === 'CLARIFICATION') {
      const policy: CommunicationPolicy = {
        responseLength: 'BALANCED',
        questionDensity: 'ONE',
        cognitiveComplexity: 'LOW',
        directiveness: 'COLLABORATIVE',
        warmth: 'ATTUNED',
        vocabulary: 'EVERYDAY',
        detailLevel: 'FOCUSED',
        choiceCount: 'ONE',
        pacing: 'CALIBRATED',
        explanationDepth: 'BRIEF'
      };

      return {
        state: inputs.state,
        capacity: 'MEDIUM',
        capacityConfidence: 0.85,
        receptivity: 'READY',
        supportNeed: 'CLARIFICATION',
        conversationStage: 'CLARIFYING',
        userGoal: 'Identify actionable bottleneck',
        uncertainty: 'MODERATE',
        reversibility: 'HIGHLY_REVERSIBLE',
        primaryStrategy: 'CLARIFY',
        responseLength: 'BALANCED',
        questionBudget: 1,
        directiveness: 'COLLABORATIVE',
        cognitiveLoadBudget: 'LOW',
        frictionBudget: 'LOW',
        interventionEligible: false,
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'Medium capacity + clarification. Propose one reflection plus one targeted check.',
        communicationPolicy: policy,
        shape: {
          catchSignal: 'Moderate ambiguity with functional bandwidth',
          fitFunction: 'Bottleneck isolation',
          nextMove: 'Clarify central tension',
          outcomeCheck: 'User confirms primary bottleneck'
        }
      };
    }

    // D. HIGH CAPACITY + HIGH STRESS (Section 7 stress rule)
    if (capacity === 'HIGH') {
      const policy: CommunicationPolicy = {
        responseLength: 'EXPANDED',
        questionDensity: 'ONE',
        cognitiveComplexity: 'MODERATE',
        directiveness: 'COLLABORATIVE',
        warmth: 'ATTUNED',
        vocabulary: 'EVERYDAY',
        detailLevel: 'DETAILED',
        choiceCount: 'LIMITED',
        pacing: 'CALIBRATED',
        explanationDepth: 'EXPLANATORY'
      };

      return {
        state: inputs.state,
        capacity: 'HIGH',
        capacityConfidence: 0.88,
        receptivity: 'READY',
        supportNeed: supportNeed,
        conversationStage: 'SOLVING',
        userGoal: 'Deep reasoning, structural planning, and trade-off mapping',
        uncertainty: 'MODERATE',
        reversibility: 'PARTIALLY_REVERSIBLE',
        primaryStrategy: 'EXPLORE',
        responseLength: 'EXPANDED',
        questionBudget: 1,
        directiveness: 'COLLABORATIVE',
        cognitiveLoadBudget: 'MODERATE',
        frictionBudget: 'MODERATE',
        interventionEligible: true,
        targetInterventionId: 'controllable_split',
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'High capacity verified. Stress does not equal low capacity. Deep exploration and reasoning permitted.',
        communicationPolicy: policy,
        shape: {
          catchSignal: 'Complex scenario with high processing bandwidth',
          fitFunction: 'Structured trade-off exploration',
          nextMove: 'Map competing variables and next step',
          outcomeCheck: 'User formulates strategic next move'
        }
      };
    }

    // LISTENING / VALIDATION (Non-evaluative presence, zero forced intervention)
    if (supportNeed === 'LISTENING' || supportNeed === 'VALIDATION') {
      const isExplicitListen = inputs.listeningLock || Boolean(inputs.conversationSignals?.explicitListeningRequest);
      const listenPolicy: CommunicationPolicy = {
        responseLength: 'SHORT',
        questionDensity: 'ZERO',
        cognitiveComplexity: 'MINIMAL',
        directiveness: 'LOW',
        warmth: 'ATTUNED',
        vocabulary: 'SIMPLE',
        detailLevel: 'MINIMAL',
        choiceCount: 'ZERO',
        pacing: 'SLOW_PAUSE',
        explanationDepth: 'NONE'
      };

      return {
        state: inputs.state,
        capacity: inputs.capacity,
        capacityConfidence: 0.9,
        receptivity: isExplicitListen ? 'NOT_READY' : inputs.receptivity,
        supportNeed,
        conversationStage: 'INTAKE_ATTUNEMENT',
        userGoal: 'Be heard and understood without unsolicited intervention',
        uncertainty: 'LOW',
        reversibility: 'HIGHLY_REVERSIBLE',
        primaryStrategy: isExplicitListen ? 'LISTEN' : 'REFLECT',
        responseLength: 'SHORT',
        questionBudget: 0,
        directiveness: 'LOW',
        cognitiveLoadBudget: 'MINIMAL',
        frictionBudget: 'MINIMAL',
        interventionEligible: false,
        targetInterventionId: undefined,
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'Support need is LISTENING/VALIDATION. Governor holds attentive space without forced intervention.',
        communicationPolicy: listenPolicy,
        shape: {
          catchSignal: 'Emotional sharing or listening request',
          fitFunction: 'Non-evaluative attentive presence',
          nextMove: 'Reflect and validate without unsolicited techniques',
          outcomeCheck: 'Observe user pace and readiness'
        }
      };
    }

    // Medium Regulation (only eligible if regulation was explicitly indicated or physiological hyperarousal)
    if (supportNeed === 'REGULATION') {
      const isExplicit = inputs.isExplicitRegulationRequested || Boolean(inputs.conversationSignals?.explicitRegulationRequest);
      const targetId = CALIBRATED_INTERVENTIONS.find(i => i.primaryProblems.includes(inputs.problem))?.id || 'autonomic_breath_brake';
      const regPolicy: CommunicationPolicy = {
        responseLength: 'SHORT',
        questionDensity: 'ZERO',
        cognitiveComplexity: 'MINIMAL',
        directiveness: isExplicit ? 'DIRECT' : 'COLLABORATIVE',
        warmth: 'ATTUNED',
        vocabulary: 'SIMPLE',
        detailLevel: 'MINIMAL',
        choiceCount: 'ZERO',
        pacing: 'SLOW_PAUSE',
        explanationDepth: 'NONE'
      };

      return {
        state: inputs.state,
        capacity: inputs.capacity,
        capacityConfidence: 0.85,
        receptivity: inputs.receptivity,
        supportNeed: 'REGULATION',
        conversationStage: 'GROUNDING',
        userGoal: 'Immediate physiological stabilization',
        uncertainty: 'LOW',
        reversibility: 'HIGHLY_REVERSIBLE',
        primaryStrategy: 'GROUND',
        responseLength: 'SHORT',
        questionBudget: 0,
        directiveness: isExplicit ? 'DIRECT' : 'COLLABORATIVE',
        cognitiveLoadBudget: 'MINIMAL',
        frictionBudget: 'MINIMAL',
        interventionEligible: (isExplicit || inputs.intensity >= 8 || inputs.problem === 'overthinking' || /\b(dimag ruk hi nahi|loop|racing|overthink|panic)\b/i.test(inputs.rawInput)) && inputs.receptivity !== 'NOT_READY',
        targetInterventionId: ((isExplicit || inputs.intensity >= 8 || inputs.problem === 'overthinking' || /\b(dimag ruk hi nahi|loop|racing|overthink|panic)\b/i.test(inputs.rawInput)) && inputs.receptivity !== 'NOT_READY') ? targetId : undefined,
        exitEligible: false,
        humanSupportRelevant: false,
        reason: 'Regulation need identified. Applying grounding with zero question burden.',
        communicationPolicy: regPolicy,
        shape: {
          catchSignal: 'Autonomic nervous system activation',
          fitFunction: 'Immediate physiological brake',
          nextMove: 'Deliver calibrated regulation intervention',
          outcomeCheck: 'Observe baseline steadiness'
        }
      };
    }

    // Default Medium Intake Attunement & Reflection
    const isExplicitSolveRequested = inputs.isExplicitSolutionRequested || Boolean(inputs.conversationSignals?.explicitSolutionRequest);
    const defaultStrategy: GovernorStrategy = isExplicitSolveRequested ? 'SOLVE' : 'REFLECT';
    const canIntervene = isExplicitSolveRequested && inputs.receptivity === 'READY';
    const defaultTarget = canIntervene
      ? CALIBRATED_INTERVENTIONS.find(i => i.primaryProblems.includes(inputs.problem))?.id
      : undefined;

    const defaultPolicy: CommunicationPolicy = {
      responseLength: 'BALANCED',
      questionDensity: 'ONE',
      cognitiveComplexity: 'LOW',
      directiveness: 'COLLABORATIVE',
      warmth: 'ATTUNED',
      vocabulary: 'SIMPLE',
      detailLevel: 'FOCUSED',
      choiceCount: 'ONE',
      pacing: 'CALIBRATED',
      explanationDepth: 'NONE'
    };

    return {
      state: inputs.state,
      capacity: inputs.capacity,
      capacityConfidence: 0.8,
      receptivity: inputs.receptivity,
      supportNeed: isExplicitSolveRequested ? 'PROBLEM_SOLVING' : supportNeed,
      conversationStage: isExplicitSolveRequested ? 'SOLVING' : 'INTAKE_ATTUNEMENT',
      userGoal: isExplicitSolveRequested ? 'Stabilize and solve immediate bottleneck' : 'Explore situation with calibrated reflection',
      uncertainty: 'MODERATE',
      reversibility: 'HIGHLY_REVERSIBLE',
      primaryStrategy: defaultStrategy,
      responseLength: 'BALANCED',
      questionBudget: 1,
      directiveness: 'COLLABORATIVE',
      cognitiveLoadBudget: 'LOW',
      frictionBudget: 'LOW',
      interventionEligible: canIntervene,
      targetInterventionId: defaultTarget,
      exitEligible: false,
      humanSupportRelevant: false,
      reason: isExplicitSolveRequested
        ? 'Explicit solution requested: offering actionable bottleneck steps.'
        : 'Attuned conversational reflection. Intervention not automatic; waiting for user readiness or request.',
      communicationPolicy: defaultPolicy,
      shape: {
        catchSignal: 'Conversational input',
        fitFunction: 'Non-interventional attunement',
        nextMove: 'Reflect situation and observe readiness',
        outcomeCheck: 'Verify user direction'
      }
    };
  }
}

export const adaptiveGovernor = new AdaptiveGovernor();
