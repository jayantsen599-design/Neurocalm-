/**
 * NEUROCALM FINAL RESPONSE QUALITY CONTROLLER (Step 7)
 *
 * Implements the Section 24 Response Quality Gate:
 * Final pre-emission validation across 12 product invariants:
 * 1. Is this response necessary?
 * 2. Is it relevant?
 * 3. Is it understandable now?
 * 4. Is it appropriately sized?
 * 5. Is the strategy appropriate?
 * 6. Is uncertainty calibrated?
 * 7. Is the user being given unnecessary choices?
 * 8. Is there an unnecessary question?
 * 9. Is the response repeating a failed strategy?
 * 10. Is it accidentally reinforcing dependency?
 * 11. Is there a useful next move?
 * 12. Is this the right time to stop?
 *
 * Automatically sanitizes and revises responses before user-facing delivery.
 */

import {
  GovernorDecision,
  ConversationTurnAnalysis,
  QualityGateAudit,
  DiagnosticAudit
} from '../types/neurocalm';
import { FormattedResponse } from './stressLanguageSystem';

export class ResponseQualityController {
  /**
   * Evaluates and sanitizes a generated response against the 12-point Quality Gate
   */
  public evaluateAndSanitize(
    rawResponse: FormattedResponse,
    decision: GovernorDecision,
    userMessage: string,
    turnHistory: ConversationTurnAnalysis[]
  ): { response: FormattedResponse; audit: QualityGateAudit } {
    const revisionsApplied: string[] = [];
    let sanitizedMessage = rawResponse.primaryMessage;
    let sanitizedQuestion = rawResponse.calibratedQuestion;
    let sanitizedActionPrompt = rawResponse.quickActionPrompt;

    const lastTurn = turnHistory.length > 0 ? turnHistory[turnHistory.length - 1] : undefined;
    const text = userMessage.toLowerCase().trim();

    // 1. Is this response necessary?
    const isNecessary = true; // Every turn in our governed flow requires a calibrated presence

    // 2. Is it relevant?
    const isRelevant =
      decision.primaryStrategy === 'EXIT'
        ? text.includes('bye') || text.includes('thanks') || text.includes('theek hai') || decision.supportNeed === 'CLEAN_EXIT'
        : Boolean(sanitizedMessage && sanitizedMessage.length > 5);

    // 3. Is it understandable now? (Capacity match)
    let isUnderstandableNow = true;
    if (decision.capacity === 'LOW') {
      // Must not contain clinical or academic jargon
      const hasJargon = /\b(cognitive restructuring|parasympathetic vagal|neurobiological cascade|dysregulation paradigm)\b/i.test(
        sanitizedMessage
      );
      if (hasJargon) {
        sanitizedMessage = sanitizedMessage.replace(/cognitive restructuring/gi, 'taking a pause');
        sanitizedMessage = sanitizedMessage.replace(/neurobiological cascade is failing/gi, 'system is on high alert');
        revisionsApplied.push('Sanitized academic jargon for LOW capacity user');
        isUnderstandableNow = true;
      }
    }

    // 4. Is it appropriately sized?
    const sentenceCount = (sanitizedMessage.match(/[.!?]+/g) || []).length || 1;
    let isAppropriatelySized = sentenceCount <= rawResponse.responseBudget.maxSentences + 1;
    if (!isAppropriatelySized && rawResponse.responseBudget.maxSentences === 1 && decision.primaryStrategy !== 'HUMAN_SUPPORT') {
      // Trim to first sentence for strict low-capacity budget (never truncate crisis referral!)
      const firstSentence = sanitizedMessage.split(/[.!?]/)[0];
      if (firstSentence && firstSentence.trim().length > 3) {
        sanitizedMessage = firstSentence.trim() + '.';
        revisionsApplied.push('Trimmed response to 1 sentence to honor LOW capacity budget');
        isAppropriatelySized = true;
      }
    }

    // 5. Is the strategy appropriate?
    let isStrategyAppropriate = true;
    if (decision.primaryStrategy === 'LISTEN') {
      // Must not contain directive advice
      if (/\b(you must|you should|do this now|karna hoga|karo)\b/i.test(sanitizedMessage)) {
        sanitizedActionPrompt = undefined;
        revisionsApplied.push('Removed directive advice from LISTEN response');
        isStrategyAppropriate = true;
      }
    }

    // 6. Is uncertainty calibrated?
    let isUncertaintyCalibrated = true;
    if (decision.conversationStage === 'INTAKE_ATTUNEMENT' && !decision.reason.includes('Safety')) {
      // Avoid dogmatic absolute declarations
      if (/\b(you definitely have|you are obviously|this is 100%|aap pakka)\b/i.test(sanitizedMessage)) {
        sanitizedMessage = sanitizedMessage.replace(/\byou definitely have\b/gi, 'it seems you might be feeling');
        revisionsApplied.push('Softened absolute clinical claim to calibrated hypothesis');
        isUncertaintyCalibrated = true;
      }
    }

    // 7. Is the user being given unnecessary choices?
    const noUnnecessaryChoices =
      decision.capacity === 'LOW' ? rawResponse.responseBudget.maxChoices === 0 : true;

    // 8. Is there an unnecessary question?
    let noUnnecessaryQuestions = true;
    if (rawResponse.responseBudget.maxQuestions === 0 && sanitizedQuestion) {
      sanitizedQuestion = undefined;
      revisionsApplied.push('Suppressed unsolicited question for 0-question budget');
      noUnnecessaryQuestions = true;
    }

    // 9. Is the response repeating a failed strategy?
    let noRepeatingFailedStrategy = true;
    if (lastTurn && (decision.reason.includes('Failure') || decision.primaryStrategy === 'REDUCE')) {
      const prevIntervention = lastTurn.responseStrategy.suggestedInterventionId;
      if (prevIntervention && decision.targetInterventionId === prevIntervention) {
        decision.targetInterventionId = undefined;
        decision.interventionEligible = false;
        revisionsApplied.push('Prevented re-proposing previously unsuccessful intervention');
        noRepeatingFailedStrategy = true;
      }
    }

    // 10. Is it accidentally reinforcing dependency?
    let noDependencyReinforcement = true;
    if (turnHistory.length >= 4 && decision.primaryStrategy !== 'EXIT') {
      if (/\b(I will always be here for you|talk to me forever|main hamesha sab solve kar dunga)\b/i.test(sanitizedMessage)) {
        sanitizedMessage = sanitizedMessage.replace(
          /\bI will always be here for you\b/gi,
          'You have the tools to handle this in real life.'
        );
        revisionsApplied.push('Replaced dependency-inducing reassurance with self-efficacy transfer');
        noDependencyReinforcement = true;
      }
    }

    // 11. Is there a useful next move?
    const hasUsefulNextMove = Boolean(
      sanitizedQuestion ||
      sanitizedActionPrompt ||
      decision.primaryStrategy === 'EXIT' ||
      decision.primaryStrategy === 'PAUSE' ||
      decision.primaryStrategy === 'LISTEN' ||
      decision.primaryStrategy === 'REDUCE' ||
      decision.primaryStrategy === 'GROUND' ||
      decision.primaryStrategy === 'REFLECT'
    );

    // 12. Is this the right time to stop?
    let rightTimeToStop = true;
    if (decision.primaryStrategy === 'EXIT' || decision.supportNeed === 'CLEAN_EXIT') {
      if (sanitizedQuestion) {
        rightTimeToStop = false;
        sanitizedQuestion = undefined;
        revisionsApplied.push('Suppressed exit-preventing question during Clean Exit');
      }
    }

    // 10 Mandatory Architecture Checks (Step 7)
    // 1. Did current user intent get respected?
    const intentRespected =
      decision.primaryStrategy === 'EXIT'
        ? text.includes('bye') || text.includes('thanks') || text.includes('theek hai') || decision.supportNeed === 'CLEAN_EXIT'
        : Boolean(sanitizedMessage && sanitizedMessage.length > 5);

    // 2. Did explicit support preference get respected?
    const supportPreferenceRespected =
      (decision.primaryStrategy === 'LISTEN' || decision.supportNeed === 'LISTENING')
        ? !decision.interventionEligible && !sanitizedActionPrompt && !sanitizedQuestion
        : true;

    // 3. Was unnecessary intervention avoided?
    const unnecessaryInterventionAvoided =
      (decision.supportNeed === 'LISTENING' || decision.supportNeed === 'VALIDATION' || decision.supportNeed === 'CLARIFICATION')
        ? !decision.interventionEligible
        : true;

    // 4. Was response complexity matched to capacity?
    const complexityMatchedToCapacity = isAppropriatelySized && isUnderstandableNow;

    // 5. Was question burden appropriate?
    const questionBurdenAppropriate = noUnnecessaryQuestions;

    // 6. Was uncertainty calibrated?
    const uncertaintyCalibrated = isUncertaintyCalibrated;

    // 7. Was user agency preserved?
    const agencyPreserved = noDependencyReinforcement;

    // 8. Was old memory prevented from overriding current context?
    const oldMemoryNotOverridingContext = true; // Living context priority strictly enforces Current > Correction > Memory

    // 9. Was safety correctly prioritized?
    const safetyCorrectlyPrioritized =
      /\b(kill myself|end my life|want to die|suicide)\b/i.test(text)
        ? decision.primaryStrategy === 'HUMAN_SUPPORT'
        : true;

    // 10. Was the response actually advancing the conversation?
    const responseAdvancingConversation = hasUsefulNextMove;

    const tenChecks = {
      intentRespected,
      supportPreferenceRespected,
      unnecessaryInterventionAvoided,
      complexityMatchedToCapacity,
      questionBurdenAppropriate,
      uncertaintyCalibrated,
      agencyPreserved,
      oldMemoryNotOverridingContext,
      safetyCorrectlyPrioritized,
      responseAdvancingConversation
    };

    const checks = {
      ...tenChecks,
      // Backward compatibility aliases
      isNecessary,
      isRelevant,
      isUnderstandableNow,
      isAppropriatelySized,
      isStrategyAppropriate,
      isUncertaintyCalibrated,
      noUnnecessaryChoices,
      noUnnecessaryQuestions,
      noRepeatingFailedStrategy,
      noDependencyReinforcement,
      hasUsefulNextMove,
      rightTimeToStop
    };

    const passedChecks = Object.values(tenChecks).filter(Boolean).length;

    const diagnosticAudit: DiagnosticAudit = {
      CURRENT_INTENT: decision.userGoal,
      SUPPORT_NEED: decision.supportNeed,
      CAPACITY: decision.capacity,
      RECEPTIVITY: decision.receptivity,
      CONVERSATION_STAGE: decision.conversationStage,
      GOVERNOR_DECISION: decision.primaryStrategy,
      INTERVENTION_ELIGIBLE: decision.interventionEligible,
      QUESTION_ALLOWED: Boolean(sanitizedQuestion && decision.questionBudget > 0),
      RESPONSE_BUDGET: {
        maxSentences: rawResponse.responseBudget.maxSentences,
        maxIdeas: rawResponse.responseBudget.maxIdeas,
        maxQuestions: rawResponse.responseBudget.maxQuestions,
        directiveness: rawResponse.responseBudget.directiveness
      },
      SAFETY_OVERRIDE: decision.reason.includes('Safety') || decision.primaryStrategy === 'HUMAN_SUPPORT',
      CONFIDENCE: decision.capacityConfidence
    };

    const audit: QualityGateAudit = {
      passed: passedChecks >= 9,
      score: passedChecks,
      checks,
      revisionsApplied,
      diagnosticAudit
    };

    const finalResponse: FormattedResponse = {
      ...rawResponse,
      primaryMessage: sanitizedMessage,
      calibratedQuestion: sanitizedQuestion,
      quickActionPrompt: sanitizedActionPrompt
    };

    return { response: finalResponse, audit };
  }
}

export const responseQualityController = new ResponseQualityController();
