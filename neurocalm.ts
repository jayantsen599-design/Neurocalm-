/**
 * NEUROCALM DOMAIN TYPES & INTERFACES
 * Canonical Product Architecture Specification
 */

// 1. Evidence Governance Categories (Strictly 4 categories)
export type EvidenceCategory =
  | 'SCIENTIFIC_EVIDENCE'
  | 'BEHAVIORAL_RATIONALE'
  | 'TRADITIONAL_CLAIM'
  | 'PRODUCT_HYPOTHESIS';

export interface EvidenceMetadata {
  category: EvidenceCategory;
  sourceNote: string;
  isEmpirical: boolean;
}

// 2. Functional Mechanism Labels (No unsupported neurological claims)
export type FunctionalMechanism =
  | 'cognitive_overload'
  | 'attention_capture'
  | 'uncertainty_loop'
  | 'behavioral_avoidance'
  | 'working_memory_overload'
  | 'urge_response_coupling'
  | 'initiation_friction'
  | 'identity_event_fusion'
  | 'physiological_hyperarousal'
  | 'attentional_narrowing'
  | 'rumination_cascade'
  | 'action_paralysis';

// 3. Problem Categories
export type ProblemCategory =
  | 'acute_stress'
  | 'overload'
  | 'overthinking'
  | 'worry'
  | 'uncertainty'
  | 'rejection'
  | 'attachment'
  | 'loneliness'
  | 'social_pain'
  | 'conflict'
  | 'anger'
  | 'shame'
  | 'guilt'
  | 'self_criticism'
  | 'procrastination'
  | 'avoidance'
  | 'study_pressure'
  | 'career_pressure'
  | 'decision_overload'
  | 'checking_loops'
  | 'reassurance_loops'
  | 'urges'
  | 'habits'
  | 'sleep_difficulty'
  | 'exhaustion'
  | 'low_capacity'
  | 'communication_problems'
  | 'failure'
  | 'setback'
  | 'loss_of_control'
  | 'boredom'
  | 'emotional_confusion'
  | 'motivation_problems'
  | 'difficult_choices';

// 4. Overthinking Subtypes
export type OverthinkingSubtype =
  | 'PAST_REPLAY'
  | 'FUTURE_WORRY'
  | 'SOCIAL_REPLAY'
  | 'DECISION_LOOP'
  | 'SELF_ATTACK'
  | 'INFINITE_WHAT_IF'
  | 'EMOTIONAL_HIT_LOOP';

// 5. Functional Current State
export type CurrentState =
  | 'baseline'
  | 'elevated_stress'
  | 'overloaded'
  | 'hyperaroused'
  | 'depleted'
  | 'low_capacity'
  | 'moderate_capacity'
  | 'high_capacity';

// 6. Capacity & Receptivity
export type CapacityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
export type ReceptivityLevel = 'READY' | 'LIMITED' | 'NOT_READY';

// 7. Entry Paths
export type EntryPath =
  | 'QUICK_RELIEF'
  | 'FIGURE_IT_OUT'
  | 'STOP_THE_LOOP'
  | 'MAKE_A_DECISION'
  | 'TALK_IT_OUT'
  | 'BUILD_A_SKILL';

// 8. Supported Languages
export type SupportedLanguage = 'en' | 'hi' | 'hinglish';

// 9. Response Modes
export type ResponseMode =
  | 'REFLECT'
  | 'CLARIFY'
  | 'DIRECT'
  | 'CHALLENGE'
  | 'SOLVE'
  | 'ACTIVATE'
  | 'CONNECT'
  | 'PAUSE'
  | 'EXIT';

// 10. Outcomes
export type OutcomeType =
  | 'R0'          // Relief
  | 'R1'          // Action
  | 'R2'          // Skill Practice
  | 'R3'          // Transfer Intention
  | 'R4'          // Independence Signal (HANDLED_MYSELF)
  | 'NO_CHANGE'   // No change reported
  | 'WORSE'       // Reported worsening
  | 'WANT_HUMAN'  // Prefers human support
  | 'PAUSED';     // User paused session

// 11. Assistance Level (Off-ramp progression)
export type AssistanceLevel =
  | 'FULL_GUIDANCE'
  | 'SHORT_REMINDER'
  | 'CUE_ONLY'
  | 'USER_CHOOSES'
  | 'USER_ACTS_WITHOUT_AI';

// 12. Context Representation
export interface UserContext {
  setting: 'studying' | 'work' | 'before_exam' | 'after_argument' | 'before_sleep' | 'commuting' | 'social' | 'alone' | 'general';
  timeAvailableMinutes: number;
}

// 13. Safety Classification
export interface SafetyAssessment {
  isSafe: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS';
  flaggedKeywords: string[];
  isReassuranceLoop: boolean;
  reassuranceCount: number;
  referralDetails?: {
    recommendedContact: string;
    helplines: Array<{ region: string; name: string; number: string }>;
  };
}

// 14. Intervention Definition
export interface Intervention {
  id: string;
  name: string;
  targetMechanism: FunctionalMechanism;
  primaryProblems: ProblemCategory[];
  evidence: EvidenceMetadata;
  baseScore: number;
  suitableStates: CurrentState[];
  minCapacity: CapacityLevel;
  instructions: {
    en: string;
    hi: string;
    hinglish: string;
  };
  actionableStep: {
    en: string;
    hi: string;
    hinglish: string;
  };
  durationSeconds: number;
  cognitiveLoad: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
  isPassiveOk: boolean;
}

// 15. Scoring Breakdown for Auditability
export interface ScoringAudit {
  interventionId: string;
  interventionName: string;
  baseScore: number;
  mechanismFit: number;
  contextFit: number;
  stateFit: number;
  capacityFit: number;
  receptivityFit: number;
  personalizationDelta: number;
  failurePenalty: number;
  repeatPenalty: number;
  finalScore: number;
  evidenceCategory: EvidenceCategory;
  isEligible: boolean;
  disqualificationReason?: string;
}

// 16. Portable Skill Definition
export interface Skill {
  id: string;
  name: string;
  sourceInterventionId: string;
  targetMechanism: FunctionalMechanism;
  evidence: EvidenceMetadata;
  canonicalMicroCue: string;
  safeUsageContext: string;
  transferGuidance: string;
  userPracticeCount: number;
  transferIntentionCount: number;
  independentUseCount: number;
  assistanceLevel: AssistanceLevel;
}

// 17. User-created micro cue
export interface UserMicroCue {
  id: string;
  skillId: string;
  cueText: string;
  contextTag: string;
  createdAt: number;
}

// 18. Structured Adaptive Memory (Strictly privacy-preserving: NO raw narratives)
export interface StructuredMemory {
  history: Array<{
    id: string;
    timestamp: number;
    problem: ProblemCategory;
    mechanism: FunctionalMechanism;
    interventionId: string;
    outcome: OutcomeType;
    contextSetting: string;
    capacity: CapacityLevel;
  }>;
  skillProgress: Record<string, {
    practiceCount: number;
    transferIntentions: number;
    independentUses: number;
    assistanceLevel: AssistanceLevel;
  }>;
  userCues: UserMicroCue[];
  reassuranceCheckCount: number;
}

// 19. Session State Machine Status
export type MachineStage =
  | 'IDLE'
  | 'SAFETY_CHECK'
  | 'ENTRY_PATH_SELECT'
  | 'INTENT_ASSESSMENT'
  | 'UNCERTAINTY_ANALYSIS'
  | 'INTERVENTION_DELIVERY'
  | 'ACTION_EXECUTION'
  | 'OUTCOME_EVALUATION'
  | 'ADAPTATION'
  | 'SKILL_EXTRACTION'
  | 'TRANSFER_OFFRAMP'
  | 'HUMAN_SUPPORT'
  | 'CONVERSATION'
  | 'EXIT_CLEAN';

// 20. Uncertainty Matrix
export interface UncertaintyAnalysis {
  knownFacts: string[];
  assumptions: string[];
  controllableActions: string[];
  uncontrollableOutcomes: string[];
}

// 21. Dose Plan
export interface DosePlan {
  durationSeconds: number;
  formattedDuration: string;
  stepCount: number;
  guidanceStyle: 'CONDENSED' | 'MICRO_STEP' | 'STANDARD' | 'PAUSE';
  doseRationale: string;
}

// 22. Conversation Intelligence Types
export type ContextStatus =
  | 'CURRENT'
  | 'STABLE'
  | 'CHANGED'
  | 'UNCERTAIN'
  | 'USER_CORRECTED'
  | 'OUTDATED';

export type ContextPrioritySource =
  | 'CURRENT_USER_STATEMENT'
  | 'USER_CORRECTION'
  | 'RECENT_VERIFIED_CONTEXT'
  | 'OLDER_MEMORY'
  | 'AI_INFERENCE';

export interface LivingContext {
  id: string;
  status: ContextStatus;
  whatHappened?: string;
  userInterpretation?: string;
  userGoal?: string;
  userCorrection?: string;
  confidence: number; // 0 to 1
  prioritySource: ContextPrioritySource;
  turnIndex: number;
  timestamp: number;
}

export type EmotionType =
  | 'stress'
  | 'overwhelm'
  | 'frustration'
  | 'anger'
  | 'hurt'
  | 'shame'
  | 'guilt'
  | 'confusion'
  | 'uncertainty'
  | 'loneliness'
  | 'fear'
  | 'sadness'
  | 'irritation'
  | 'emotional_exhaustion';

export interface EmotionSignal {
  detectedEmotions: EmotionType[];
  intensityEstimate: number; // 1-10
  confidence: number; // 0-1
  isHypothesis: true; // Strictly a hypothesis, never fact
  calibrationNote: string;
}

export interface SituationModel {
  whatHappened: string;
  whatUserThinksItMeans: string;
  whatUserFeels: string;
  whatUserWants: string;
  isSeparated: boolean;
}

export interface FunctionalCapacityAssessment {
  capacity: CapacityLevel;
  signals: string[];
  cognitiveLoadTolerance: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
  maxQuestionsAllowed: number;
  confidence: number;
  rationale: string;
}

export type FunctionalCapacityLevel = CapacityLevel;

export interface FunctionalCapacityState {
  level: FunctionalCapacityLevel;
  confidence: number;
  signals: string[];
  cognitiveLoadTolerance: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
  maxQuestionsAllowed: number;
  rationale: string;
}

export interface UserReceptivityAssessment {
  receptivity: ReceptivityLevel;
  explicitRefusalOfAdvice: boolean;
  signals: string[];
  confidence: number;
}

// 12 Real Support Functions
export type SupportFunctionType =
  | 'LISTENING'
  | 'VALIDATION'
  | 'UNDERSTANDING'
  | 'CLARIFICATION'
  | 'REGULATION'
  | 'PERSPECTIVE'
  | 'INFORMATION'
  | 'PROBLEM_SOLVING'
  | 'DECISION_SUPPORT'
  | 'ACTION'
  | 'SKILL_BUILDING'
  | 'SKILL'
  | 'HUMAN_CONNECTION'
  | 'MEANING'
  | 'PAUSE'
  | 'EXIT'
  // Backward compatibility aliases
  | 'SOLVING'
  | 'HUMAN_SUPPORT'
  | 'CLEAN_EXIT';

export type SupportNeedType = SupportFunctionType;

export interface SupportNeedAssessment {
  need: SupportNeedType;
  primaryNeed: SupportFunctionType;
  secondaryNeed?: SupportFunctionType;
  confidence: number;
  distribution?: Partial<Record<SupportFunctionType, number>>;
  rationale: string;
}

export interface SupportNeedState {
  primaryNeed: SupportFunctionType;
  confidence: number;
  confidences: Record<string, number>;
  listeningLock: boolean;
  rationale: string;
  explicitlyRequested: boolean;
}

export interface ConversationSignals {
  messageLength: number; // word count
  characterCount: number;
  fragmentation: boolean;
  suddenLengthChange?: 'SHORTENED' | 'LENGTHENED' | 'STABLE';
  repeatedWords: string[];
  repeatedQuestions: boolean;
  hasPataNahi: boolean;
  hasKuchNahi: boolean;
  hasChhodRehneDe: boolean;
  adviceRejection: boolean;
  explicitListeningRequest: boolean;
  explicitSolutionRequest: boolean;
  explicitRegulationRequest: boolean;
  urgency: 'NONE' | 'LOW' | 'HIGH';
  uncertaintyLanguage: boolean;
  contradictionOrCorrection: boolean;
  topicSwitching: boolean;
  languageRegister: 'en' | 'hi' | 'hinglish';
  codeSwitchDetected: boolean;
  emotionalVsAnalytical: 'EMOTIONAL' | 'ANALYTICAL' | 'BALANCED';
  questionDensity: number;
  detailDensity: 'LOW' | 'MEDIUM' | 'HIGH';
  withdrawalSignals: boolean;
  confidence: number;
}

export interface QuestionGateDecision {
  allowQuestion: boolean;
  expectedInformationGain: number; // 0 to 1
  cognitiveSocialEffort: number; // 0 to 1
  justification: string;
}

export interface ValidationGateResult {
  validatedExperience: string;
  avoidedConclusions: string[];
  rationale: string;
}

export type ConversationStage =
  | 'INTAKE_ATTUNEMENT'
  | 'CLARIFYING'
  | 'GROUNDING'
  | 'SOLVING'
  | 'CLOSING';

export interface MechanismHypothesis {
  mechanism?: FunctionalMechanism;
  confidence: number;
  rationale: string;
  isEvidenced?: boolean;
}

export type ResponseStrategyType =
  | 'REFLECT_LISTEN'
  | 'CALIBRATED_QUESTION'
  | 'PROPOSE_INTERVENTION'
  | 'EXECUTE_INTERVENTION'
  | 'UNCERTAINTY_SPLIT'
  | 'HUMAN_HANDOFF'
  | 'CLEAN_EXIT'
  | 'PAUSE_SPACE';

export interface ResponseStrategyAssessment {
  strategy: ResponseStrategyType;
  minimumUsefulResponse: string;
  questionOrPrompt?: string;
  shouldRouteToIntervention: boolean;
  suggestedInterventionId?: string;
  rationale: string;
}

export interface DiagnosticAudit {
  CURRENT_INTENT: string;
  SUPPORT_NEED: SupportFunctionType;
  CAPACITY: CapacityLevel;
  RECEPTIVITY: ReceptivityLevel;
  CONVERSATION_STAGE: ConversationStage;
  GOVERNOR_DECISION: GovernorStrategy;
  INTERVENTION_ELIGIBLE: boolean;
  QUESTION_ALLOWED: boolean;
  RESPONSE_BUDGET: {
    maxSentences: number;
    maxIdeas: number;
    maxQuestions: number;
    directiveness: DirectivenessPolicy;
  };
  SAFETY_OVERRIDE: boolean;
  CONFIDENCE: number;
}

// 22b. Dynamic Response Depth (Section 2 Architecture)
export type ResponseDepthLevel = 'D0' | 'D1' | 'D2' | 'D3' | 'D4' | 'D5';

// 22c. Structured Story & Situation Representation (Section 4 Architecture)
export interface StoryUnderstanding {
  event: string;
  context: string;
  emotion: string;
  interpretation: string;
  need: string;
  desire: string;
  fear: string;
  urge: string;
  behavior: string;
  consequence: string;
  recurringPattern: string;
  actualProblem: string;
  userGoal: string;
  supportNeed: SupportNeedType;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';
  controlBoundary: 'WITHIN_CONTROL' | 'OUTSIDE_CONTROL' | 'MIXED';
  reversibility: 'HIGHLY_REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
  stake: 'LOW' | 'MODERATE' | 'HIGH';
  timePattern?: string;
  trigger?: string;
  userHypotheses?: string[];
  competingExplanations?: string[];
  isCalibratedHypothesis: true;
}

// 22d. Competing Mechanism Hypotheses & Discriminating Test (Section 8 & 9)
export type MechanismFamily =
  | 'repetitive_negative_thinking'
  | 'worry_uncertainty'
  | 'cognitive_overload'
  | 'attentional_capture'
  | 'behavioral_avoidance'
  | 'behavioral_activation'
  | 'emotion_regulation'
  | 'problem_solving'
  | 'decision_conflict'
  | 'reassurance_loops'
  | 'checking_loops'
  | 'habit_urge_loops'
  | 'social_disconnection'
  | 'interpersonal_conflict'
  | 'rejection_attachment'
  | 'sleep_stress'
  | 'depleted_capacity'
  | 'communication'
  | 'environmental';

export interface CompetingMechanismHypothesis {
  family: MechanismFamily;
  mechanism: FunctionalMechanism | string;
  likelihood: number; // 0.0 to 1.0
  supportingEvidence: string[];
  counterEvidence: string[];
  isPrimary: boolean;
}

export interface CheapestDiscriminatingTest {
  testType: 'QUESTION' | 'ACTION' | 'OBSERVATION';
  prompt: string;
  targetHypotheses: [string, string];
  cognitiveCost: 'MINIMAL' | 'LOW' | 'MEDIUM';
  rationale: string;
}

// 22e. Governed Wisdom Lens (Section 12 Architecture)
export type WisdomLensTradition =
  | 'OSHO'
  | 'BUDDHIST'
  | 'JAIN'
  | 'BHAGAVAD_GITA'
  | 'VEDANTA'
  | 'UPANISHADIC'
  | 'YOGA'
  | 'SANT'
  | 'NONE';

export interface WisdomLensInsight {
  tradition: WisdomLensTradition;
  principleName: string;
  insightSummary: string;
  evidenceLevel: 'E4'; // Strictly E4 traditional/philosophical wisdom
  isDistinctFromMedicalScience: true;
  culturalContext: string;
  applicationGuidance: string;
  attributionNote: string;
}

// 22f. Dynamic Directiveness Dial (Section 18 Architecture)
export interface DirectivenessDial {
  dialScore: number; // 0.0 (non-directive) to 1.0 (highly directive)
  mode: DirectivenessPolicy;
  rationale: string;
  reversibility: 'HIGHLY_REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
  stake: 'LOW' | 'MODERATE' | 'HIGH';
  preservesAgency: boolean;
}

// 22g. Multi-Turn Trajectory (Section 26 Architecture)
export interface MultiTurnTrajectory {
  distressScores: number[];
  clarityScores: number[];
  agencyScores: number[];
  aiRelianceScore: number; // 0.0 to 1.0
  loopingDetected: boolean;
  reassuranceCount: number;
  actionReadiness: 'LOW' | 'MODERATE' | 'HIGH';
  strategyRepetitionCount: number;
  trajectoryTrend: 'IMPROVING' | 'STAGNANT' | 'OVER_RELIANT' | 'ESCALATING';
  recommendedShift?: 'INCREASE_INDEPENDENCE' | 'CHANGE_STRATEGY' | 'STEP_DOWN_LOAD' | 'MAINTAIN';
}

// 22h. Failure Learning & Attribution (Section 22 Architecture)
export type FailureCause =
  | 'WRONG_PROBLEM_MODEL'
  | 'WRONG_MECHANISM'
  | 'WRONG_INTERVENTION'
  | 'WRONG_DOSE'
  | 'WRONG_TIMING'
  | 'LOW_CAPACITY'
  | 'LOW_RECEPTIVITY'
  | 'TOO_MUCH_FRICTION'
  | 'WRONG_GOAL'
  | 'WRONG_CONTEXT'
  | 'INSUFFICIENT_INFO'
  | 'RANDOM_VARIATION';

export interface FailureAttribution {
  cause: FailureCause;
  updatedHypothesis: string;
  cheapestRecoveryMove: string;
  disqualifiedInterventionId?: string;
}

// 22i. Medical Evidence Boundaries (Section 10 & 11)
export interface MedicalBoundaryEvaluation {
  isMedicalQuery: boolean;
  containsDiagnosticRequest: boolean;
  containsSymptomQuery: boolean;
  boundaryEnforced: boolean;
  educationalFraming: string;
  referralGuidance?: string;
}
export type MedicalBoundaryAssessment = MedicalBoundaryEvaluation;

export interface ConversationTurnAnalysis {
  userMessage: string;
  timestamp: number;
  livingContext: LivingContext;
  conversationSignals?: ConversationSignals;
  emotionSignal: EmotionSignal;
  situationModel: SituationModel;
  storyUnderstanding?: StoryUnderstanding;
  capacity: FunctionalCapacityAssessment;
  receptivity: UserReceptivityAssessment;
  supportNeed: SupportNeedAssessment;
  conversationStage: ConversationStage;
  mechanismHypothesis: MechanismHypothesis;
  competingMechanisms?: CompetingMechanismHypothesis[];
  discriminatingTest?: CheapestDiscriminatingTest;
  wisdomLens?: WisdomLensInsight;
  multiTurnTrajectory?: MultiTurnTrajectory;
  responseStrategy: ResponseStrategyAssessment;
  governorDecision?: GovernorDecision;
  qualityGateAudit?: QualityGateAudit;
}

// 23. Adaptive Governor Strategy & Communication Policy (Step 3)
export type GovernorStrategy =
  | 'NO_ACTION'
  | 'LISTEN'
  | 'REFLECT'
  | 'CLARIFY'
  | 'REDUCE'
  | 'GROUND'
  | 'UNDERSTAND'
  | 'EXPLORE'
  | 'SOLVE'
  | 'CHALLENGE'
  | 'ACTIVATE'
  | 'TEACH'
  | 'TRANSFER'
  | 'HUMAN_SUPPORT'
  | 'PAUSE'
  | 'EXIT';

export type ResponseLengthPolicy = 'TINY' | 'SHORT' | 'BALANCED' | 'EXPANDED';
export type QuestionDensityPolicy = 'ZERO' | 'ONE' | 'TWO';
export type CognitiveComplexityPolicy = 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
export type DirectivenessPolicy = 'LOW' | 'COLLABORATIVE' | 'DIRECT';
export type WarmthPolicy = 'NEUTRAL' | 'WARM' | 'ATTUNED';
export type VocabularyPolicy = 'SIMPLE' | 'EVERYDAY' | 'TECHNICAL';
export type DetailLevelPolicy = 'MINIMAL' | 'FOCUSED' | 'DETAILED';
export type ChoiceCountPolicy = 'ZERO' | 'ONE' | 'LIMITED';
export type PacingPolicy = 'SLOW_PAUSE' | 'CALIBRATED' | 'DIRECT';
export type ExplanationDepthPolicy = 'NONE' | 'BRIEF' | 'EXPLANATORY';

export interface CommunicationPolicy {
  responseLength: ResponseLengthPolicy;
  questionDensity: QuestionDensityPolicy;
  cognitiveComplexity: CognitiveComplexityPolicy;
  directiveness: DirectivenessPolicy;
  warmth: WarmthPolicy;
  vocabulary: VocabularyPolicy;
  detailLevel: DetailLevelPolicy;
  choiceCount: ChoiceCountPolicy;
  pacing: PacingPolicy;
  explanationDepth: ExplanationDepthPolicy;
}

export interface GovernorDecision {
  state: CurrentState;
  capacity: CapacityLevel;
  capacityConfidence: number;
  receptivity: ReceptivityLevel;
  supportNeed: SupportNeedType;
  conversationStage: ConversationStage;
  userGoal: string;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH';
  reversibility: 'HIGHLY_REVERSIBLE' | 'PARTIALLY_REVERSIBLE' | 'IRREVERSIBLE';
  primaryStrategy: GovernorStrategy;
  responseLength: ResponseLengthPolicy;
  questionBudget: number;
  directiveness: DirectivenessPolicy;
  cognitiveLoadBudget: CognitiveComplexityPolicy;
  frictionBudget: 'MINIMAL' | 'LOW' | 'MODERATE';
  interventionEligible: boolean;
  targetInterventionId?: string;
  exitEligible: boolean;
  humanSupportRelevant: boolean;
  reason: string;
  communicationPolicy: CommunicationPolicy;
  shape: {
    catchSignal: string;
    fitFunction: string;
    nextMove: string;
    outcomeCheck?: string;
  };
  researchAudit?: ResearchIntelligenceAudit;
  responseDepth?: ResponseDepthLevel;
  storyUnderstanding?: StoryUnderstanding;
  competingMechanisms?: CompetingMechanismHypothesis[];
  discriminatingTest?: CheapestDiscriminatingTest;
  wisdomLens?: WisdomLensInsight;
  directivenessDial?: DirectivenessDial;
  multiTurnTrajectory?: MultiTurnTrajectory;
  medicalBoundary?: MedicalBoundaryEvaluation;
  failureAttribution?: FailureAttribution;
}

// 24. Stress Conversation Language System (Step 4)
export interface ResponseBudget {
  maxSentences: number;
  maxIdeas: number;
  maxQuestions: number;
  maxChoices: number;
  explanationDepth: ExplanationDepthPolicy;
  vocabularyComplexity: VocabularyPolicy;
  directiveness: DirectivenessPolicy;
  warmth: WarmthPolicy;
}

export type FirstResponseStructure =
  | 'OBSERVATION_CHECK'
  | 'REFLECTION_QUESTION'
  | 'REFLECTION_SMALL_SHIFT'
  | 'CLARIFICATION_ACTION'
  | 'PATTERN_VERIFICATION'
  | 'REDUCE_PAUSE'
  | 'UNCERTAINTY_CONTROLLABLE'
  | 'DECISION_SIMPLIFY_CHOOSE';

export interface CommunicationQualityMetrics {
  feltUnderstanding: number;
  understandingAccuracy: number;
  questionUtility: number;
  responseFriction: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH';
  conversationIntrusion: 'NONE' | 'LOW' | 'HIGH';
  strategyTransitionAccuracy: number;
  repairSuccess: boolean;
  userCorrectionAcceptance: boolean;
  agencyPreserved: boolean;
  exitability: boolean;
}

// 25. Research Governance & Knowledge Registry (Step 5)
export type EvidenceLevel = 'E1' | 'E2' | 'E3' | 'E4' | 'E5';
export type EvidenceTier = EvidenceLevel;

export type ResearchDomain =
  | 'STRESS_CAPACITY'
  | 'AUTONOMIC_REGULATION'
  | 'COGNITIVE_OVERLOAD_RUMINATION'
  | 'MOTIVATION_BEHAVIORAL_MOMENTUM'
  | 'DEPENDENCY_AGENCY_INDEPENDENCE'
  | 'CULTURAL_LINGUISTIC_ATTUNEMENT'
  | 'UNCERTAINTY_INTOLERANCE'
  | 'PROHIBITED_PSEUDOSCIENCE';

export type ResearchStatus = 'ACTIVE' | 'PROVISIONAL' | 'DEPRECATED' | 'PROHIBITED';

export interface ResearchKnowledgeItem {
  id: string;
  domain: ResearchDomain;
  claim: string;
  evidenceLevel: EvidenceLevel;
  population: string;
  context: string;
  mechanism: FunctionalMechanism;
  productImplication: string;
  behaviorRule: string;
  limitations: string;
  uncertainty: 'LOW' | 'MODERATE' | 'HIGH';
  sourceMetadata: {
    citationOrBasis: string;
    consensusLevel: 'ESTABLISHED_EMPIRICAL' | 'EMERGING' | 'THEORETICAL' | 'TRADITIONAL' | 'UNSUPPORTED';
    controlledTrialsAvailable: boolean;
  };
  applicableStates: CurrentState[];
  applicableProblems: ProblemCategory[];
  contraindicationsOrBoundaries: string[];
  testMetric: string;
  status: ResearchStatus;
}

export interface EvidenceEvaluationResult {
  itemId: string;
  matched: boolean;
  evidenceLevel: EvidenceLevel;
  admissible: boolean;
  contraindicationTriggered?: string;
  governedRule: string;
  productRecommendation: {
    recommendedStrategy?: GovernorStrategy;
    maxQuestionBudget?: number;
    somaticFirst?: boolean;
    antiReassuranceActive?: boolean;
    microFrictionTarget?: boolean;
    encourageOfflineMovement?: boolean;
    humilityFlag?: boolean;
    rejectionReason?: string;
  };
}

export interface ResearchIntelligenceAudit {
  activeRulesCount: number;
  admissibleRules: EvidenceEvaluationResult[];
  rejectedRules: { itemId: string; reason: string }[];
  prohibitedRulesBlocked: string[];
  dominantEvidenceLevel: EvidenceLevel;
  guidanceConfidence: number;
}

// 26. Final Response Quality Controller (Step 7 Architecture)
export interface QualityGateAudit {
  passed: boolean;
  score: number; // 0 to 10
  checks: {
    // 10 Mandatory Quality Gate checks
    intentRespected: boolean; // 1. Did current user intent get respected?
    supportPreferenceRespected: boolean; // 2. Did explicit support preference get respected?
    unnecessaryInterventionAvoided: boolean; // 3. Was unnecessary intervention avoided?
    complexityMatchedToCapacity: boolean; // 4. Was response complexity matched to capacity?
    questionBurdenAppropriate: boolean; // 5. Was question burden appropriate?
    uncertaintyCalibrated: boolean; // 6. Was uncertainty calibrated?
    agencyPreserved: boolean; // 7. Was user agency preserved?
    oldMemoryNotOverridingContext: boolean; // 8. Was old memory prevented from overriding current context?
    safetyCorrectlyPrioritized: boolean; // 9. Was safety correctly prioritized?
    responseAdvancingConversation: boolean; // 10. Was the response actually advancing the conversation?
    // Backward compatibility aliases
    isNecessary?: boolean;
    isRelevant?: boolean;
    isUnderstandableNow?: boolean;
    isAppropriatelySized?: boolean;
    isStrategyAppropriate?: boolean;
    isUncertaintyCalibrated?: boolean;
    noUnnecessaryChoices?: boolean;
    noUnnecessaryQuestions?: boolean;
    noRepeatingFailedStrategy?: boolean;
    noDependencyReinforcement?: boolean;
    hasUsefulNextMove?: boolean;
    rightTimeToStop?: boolean;
  };
  revisionsApplied: string[];
  diagnosticAudit?: DiagnosticAudit;
}

