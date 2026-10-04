/**
 * NEUROCALM CANONICAL STATE MACHINE
 *
 * Implements the full end-to-end engine:
 * USER INPUT
 *   ↓
 * PROBLEM
 *   ↓
 * CURRENT STATE & INTENSITY
 *   ↓
 * CAPACITY & RECEPTIVITY
 *   ↓
 * SAFETY GATEWAY (Stage 0)
 *   ↓
 * MECHANISM HYPOTHESIS
 *   ↓
 * INTERVENTION SELECTION & AUDIT SCORING (Stage 4)
 *   ↓
 * DOSE CALCULATION (Stage 5)
 *   ↓
 * DELIVERY & ACTION EXECUTION
 *   ↓
 * PROXIMAL OUTCOME (Stage 6)
 *   ↓
 * FAILURE / ADAPTATION / SKILL / TRANSFER / INDEPENDENCE / CLEAN EXIT
 */

import {
  MachineStage,
  EntryPath,
  ProblemCategory,
  CurrentState,
  CapacityLevel,
  ReceptivityLevel,
  UserContext,
  SafetyAssessment,
  Intervention,
  ScoringAudit,
  DosePlan,
  OutcomeType,
  UncertaintyAnalysis,
  SupportedLanguage
} from '../types/neurocalm';
import { safetyGateway } from './safetyGateway';
import { problemModel } from './problemModel';
import { uncertaintyEngine } from './uncertaintyEngine';
import { interventionScorer, ScoredSelection } from './interventionScorer';
import { doseEngine } from './doseEngine';
import { outcomeEngine, OutcomeResult } from './outcomeEngine';
import { languageBrain } from './languageBrain';
import { memoryManager } from './memoryManager';
import { conversationIntelligenceEngine } from './conversationIntelligence';
import { ConversationTurnAnalysis } from '../types/neurocalm';

export interface MachineState {
  stage: MachineStage;
  sessionToken: string;
  language: SupportedLanguage;
  entryPath: EntryPath;
  rawInput: string;
  problem: ProblemCategory;
  state: CurrentState;
  intensity: number;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  context: UserContext;
  safety: SafetyAssessment;
  uncertainty?: UncertaintyAnalysis;
  selectedIntervention?: Intervention;
  isFallback: boolean;
  audits: ScoringAudit[];
  dose?: DosePlan;
  sessionFailedInterventions: string[];
  lastOutcomeResult?: OutcomeResult;
  lastOutcomeType?: OutcomeType;
  agencyCreditText: string;
  exitMessage: string;
  conversationTurn?: ConversationTurnAnalysis;
  conversationHistory: ConversationTurnAnalysis[];
}

export class NeuroCalmMachine {
  private state: MachineState;
  private listeners: Array<(state: MachineState) => void> = [];

  constructor() {
    this.state = this.createInitialState();
  }

  private createInitialState(): MachineState {
    conversationIntelligenceEngine.reset();
    return {
      stage: 'CONVERSATION',
      sessionToken: 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      language: 'en',
      entryPath: 'TALK_IT_OUT',
      rawInput: '',
      problem: 'acute_stress',
      state: 'baseline',
      intensity: 5,
      capacity: 'MEDIUM',
      receptivity: 'READY',
      context: {
        setting: 'general',
        timeAvailableMinutes: 5
      },
      safety: {
        isSafe: true,
        riskLevel: 'NONE',
        flaggedKeywords: [],
        isReassuranceLoop: false,
        reassuranceCount: 0
      },
      isFallback: false,
      audits: [],
      sessionFailedInterventions: [],
      agencyCreditText: '',
      exitMessage: '',
      conversationHistory: []
    };
  }

  public getState(): MachineState {
    return { ...this.state };
  }

  public subscribe(listener: (state: MachineState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const s = this.getState();
    this.listeners.forEach(fn => fn(s));
  }

  public setLanguage(lang: SupportedLanguage) {
    this.state.language = lang;
    this.notify();
  }

  public startEntryPath(path: EntryPath) {
    this.state.entryPath = path;
    if (path === 'BUILD_A_SKILL') {
      this.processInput('Accessing portable skill library', 'baseline', 'HIGH', 'READY');
      this.state.stage = 'SKILL_EXTRACTION';
    } else if (path === 'STOP_THE_LOOP' || path === 'MAKE_A_DECISION') {
      this.state.stage = 'UNCERTAINTY_ANALYSIS';
    } else if (path === 'TALK_IT_OUT' || path === 'QUICK_RELIEF' || path === 'FIGURE_IT_OUT') {
      this.state.stage = 'CONVERSATION';
    } else {
      this.state.stage = 'CONVERSATION';
    }
    this.notify();
  }

  public openCapabilities() {
    this.state.stage = 'ENTRY_PATH_SELECT';
    this.notify();
  }

  public deliverInterventionDirectly(intervention: Intervention) {
    this.state.selectedIntervention = intervention;
    this.state.isFallback = false;
    this.state.dose = doseEngine.calculateDose(
      intervention,
      this.state.capacity,
      this.state.receptivity,
      this.state.state,
      this.state.intensity
    );
    this.state.stage = 'INTERVENTION_DELIVERY';
    this.notify();
  }

  /**
   * Conversation Intelligence intake & turn progression
   */
  public submitConversationMessage(message: string): ConversationTurnAnalysis {
    this.state.rawInput = message;

    // Upstream Safety Check
    const safetyCheck = safetyGateway.evaluateInput(message, this.state.safety.reassuranceCount);
    this.state.safety = safetyCheck;

    if (!safetyCheck.isSafe || safetyCheck.riskLevel === 'CRISIS') {
      this.state.stage = 'HUMAN_SUPPORT';
      this.notify();
      return conversationIntelligenceEngine.processMessage(message, this.state.language);
    }

    // Process via Conversation Intelligence Layer
    const turn = conversationIntelligenceEngine.processMessage(message, this.state.language);
    this.state.conversationTurn = turn;
    this.state.conversationHistory = conversationIntelligenceEngine.getTurnHistory();

    // Sync capacity and receptivity
    this.state.capacity = turn.capacity.capacity;
    this.state.receptivity = turn.receptivity.receptivity;

    // Check for Clean Exit or Human Handoff triggers
    if (turn.responseStrategy.strategy === 'CLEAN_EXIT') {
      this.exitClean();
      return turn;
    }

    if (turn.responseStrategy.strategy === 'HUMAN_HANDOFF') {
      this.state.stage = 'HUMAN_SUPPORT';
      this.notify();
      return turn;
    }

    // If strategy is uncertainty split
    if (turn.responseStrategy.strategy === 'UNCERTAINTY_SPLIT') {
      this.state.uncertainty = uncertaintyEngine.parseSituation(message);
    }

    this.notify();
    return turn;
  }

  /**
   * Primary intake processing step
   */
  public processInput(
    input: string,
    stateOverride?: CurrentState,
    capacityOverride?: CapacityLevel,
    receptivityOverride?: ReceptivityLevel,
    problemOverride?: ProblemCategory
  ) {
    this.state.rawInput = input;

    // STEP 1: UPSTREAM SAFETY GATEWAY
    const safetyCheck = safetyGateway.evaluateInput(input, this.state.safety.reassuranceCount);
    this.state.safety = safetyCheck;

    if (!safetyCheck.isSafe || safetyCheck.riskLevel === 'CRISIS') {
      this.state.stage = 'HUMAN_SUPPORT';
      this.notify();
      return;
    }

    // Consult Conversation Intelligence Layer
    const convTurn = conversationIntelligenceEngine.processMessage(input, this.state.language);
    this.state.conversationTurn = convTurn;
    this.state.conversationHistory = conversationIntelligenceEngine.getTurnHistory();

    // STEP 2: PROBLEM & CAPACITY & STATE CLASSIFICATION
    const analysis = problemModel.analyzeProblem(input, problemOverride);
    this.state.problem = problemOverride || analysis.primaryProblem;
    this.state.state = stateOverride || analysis.inferredState;
    this.state.capacity = capacityOverride || convTurn.capacity.capacity || analysis.suggestedCapacity;
    this.state.receptivity = receptivityOverride || (convTurn.receptivity.explicitRefusalOfAdvice ? 'NOT_READY' : this.state.receptivity);

    // Check for Clean Exit
    if (convTurn.responseStrategy.strategy === 'CLEAN_EXIT') {
      this.exitClean();
      return;
    }

    // Check for Human Handoff
    if (convTurn.responseStrategy.strategy === 'HUMAN_HANDOFF') {
      this.state.stage = 'HUMAN_SUPPORT';
      this.notify();
      return;
    }

    // If reassurance loop detected or uncertainty strategy
    if (safetyCheck.isReassuranceLoop || convTurn.responseStrategy.strategy === 'UNCERTAINTY_SPLIT') {
      this.state.uncertainty = uncertaintyEngine.parseSituation(input);
      if (this.state.entryPath === 'STOP_THE_LOOP' || this.state.entryPath === 'MAKE_A_DECISION') {
        this.state.stage = 'UNCERTAINTY_ANALYSIS';
        this.notify();
        return;
      }
    }

    // Natural conversation is the primary destination!
    // The Governor controls whether an intervention is proposed/suggested, which renders
    // as an optional route button in ConversationView without hijacking the chat.
    this.state.stage = 'CONVERSATION';
    this.notify();
  }

  public proceedFromUncertainty() {
    this.executeInterventionSelection();
  }

  public setCapacity(capacity: CapacityLevel) {
    this.state.capacity = capacity;
    this.notify();
  }

  public setReceptivity(receptivity: ReceptivityLevel) {
    this.state.receptivity = receptivity;
    this.notify();
  }

  public setIntensity(val: number) {
    this.state.intensity = val;
    this.notify();
  }

  public setContextSetting(setting: UserContext['setting']) {
    this.state.context.setting = setting;
    this.notify();
  }

  /**
   * STEP 3: INTERVENTION SELECTION & DOSE
   */
  public executeInterventionSelection() {
    const mechanism = problemModel.mapMechanismForProblem(this.state.problem);

    const selection: ScoredSelection = interventionScorer.selectBestIntervention({
      problem: this.state.problem,
      mechanism,
      state: this.state.state,
      capacity: this.state.capacity,
      receptivity: this.state.receptivity,
      context: this.state.context,
      sessionFailedInterventions: this.state.sessionFailedInterventions
    });

    this.state.selectedIntervention = selection.selectedIntervention;
    this.state.isFallback = selection.isFallback;
    this.state.audits = selection.audits;

    // Dose Calculation
    this.state.dose = doseEngine.calculateDose(
      selection.selectedIntervention,
      this.state.capacity,
      this.state.receptivity,
      this.state.state,
      this.state.intensity
    );

    this.state.stage = 'INTERVENTION_DELIVERY';
    this.notify();
  }

  public proceedToAction() {
    this.state.stage = 'ACTION_EXECUTION';
    this.notify();
  }

  public proceedToOutcomeEvaluation() {
    this.state.stage = 'OUTCOME_EVALUATION';
    this.notify();
  }

  /**
   * STEP 4: SUBMIT OUTCOME
   */
  public submitOutcome(outcome: OutcomeType): OutcomeResult {
    const mechanism = problemModel.mapMechanismForProblem(this.state.problem);
    const interventionId = this.state.selectedIntervention?.id || 'safe_grounding_fallback';

    const result = outcomeEngine.submitOutcome(
      {
        sessionToken: this.state.sessionToken,
        outcome,
        problem: this.state.problem,
        mechanism,
        interventionId,
        contextSetting: this.state.context.setting,
        capacity: this.state.capacity,
        receptivity: this.state.receptivity
      },
      this.state.sessionToken
    );

    this.state.lastOutcomeResult = result;
    this.state.lastOutcomeType = outcome;
    this.state.agencyCreditText = result.agencyCreditText;

    if (result.success) {
      if (outcome === 'NO_CHANGE' || outcome === 'WORSE') {
        this.state.sessionFailedInterventions.push(interventionId);
        this.state.stage = 'ADAPTATION';
      } else if (outcome === 'R3' || outcome === 'R4') {
        this.state.stage = 'TRANSFER_OFFRAMP';
      } else if (outcome === 'R2') {
        this.state.stage = 'SKILL_EXTRACTION';
      } else if (outcome === 'WANT_HUMAN') {
        this.state.stage = 'HUMAN_SUPPORT';
      } else {
        // R0, R1, PAUSED
        this.state.exitMessage = languageBrain.generateCleanExitMessage(outcome, this.state.language);
        this.state.stage = 'EXIT_CLEAN';
      }
    }

    this.notify();
    return result;
  }

  public adaptAndTryAnother() {
    // Re-run selection with failed interventions penalized in session
    this.executeInterventionSelection();
  }

  public exitClean() {
    this.state.exitMessage = languageBrain.generateCleanExitMessage(
      this.state.lastOutcomeType || 'R0',
      this.state.language
    );
    this.state.stage = 'EXIT_CLEAN';
    this.notify();
  }

  public resetSession() {
    safetyGateway.resetReassurance();
    this.state = this.createInitialState();
    this.notify();
  }
}

export const neuroCalmMachine = new NeuroCalmMachine();
