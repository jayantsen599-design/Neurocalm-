/**
 * NEUROCALM RESEARCH → PRODUCT INTELLIGENCE TEST SUITE (Step 5)
 *
 * Verifies that research is governed, evidence tiers (E1-E5) are strictly maintained,
 * E5 pseudoscience is blocked, and research rules correctly govern product behavior.
 */

import {
  RESEARCH_KNOWLEDGE_REGISTRY,
  ResearchPolicyEngine,
  researchPolicyEngine
} from '../core/researchRegistry';
import { adaptiveGovernor } from '../core/adaptiveGovernor';
import { conversationIntelligenceEngine } from '../core/conversationIntelligence';
import { EmotionSignal, SituationModel, LivingContext } from '../types/neurocalm';

export interface ResearchTestResult {
  name: string;
  passed: boolean;
  details: string;
}

export function runResearchTestSuite(): {
  results: ResearchTestResult[];
  summary: { passed: number; total: number };
} {
  const results: ResearchTestResult[] = [];

  function record(name: string, passed: boolean, details: string) {
    results.push({ name, passed, details });
  }

  const defaultEmotionSignal: EmotionSignal = {
    detectedEmotions: ['stress', 'overwhelm'],
    intensityEstimate: 7,
    confidence: 0.85,
    isHypothesis: true,
    calibrationNote: 'Calibrated from stress signals'
  };

  const defaultSituationModel: SituationModel = {
    whatHappened: 'Work overload',
    whatUserThinksItMeans: 'I cannot handle the pressure',
    whatUserFeels: 'Anxious and drained',
    whatUserWants: 'To calm down and reset',
    isSeparated: true
  };

  const defaultLivingContext: LivingContext = {
    id: 'ctx-test-1',
    status: 'CURRENT',
    whatHappened: 'Work overload',
    userGoal: 'Reduce panic and regain focus',
    confidence: 0.9,
    prioritySource: 'CURRENT_USER_STATEMENT',
    turnIndex: 1,
    timestamp: Date.now()
  };

  // --------------------------------------------------------------------------
  // TEST 1: Registry Integrity & Evidence Level Hierarchy
  // --------------------------------------------------------------------------
  const allItems = RESEARCH_KNOWLEDGE_REGISTRY;
  const hasE1 = allItems.some((i) => i.evidenceLevel === 'E1');
  const hasE2 = allItems.some((i) => i.evidenceLevel === 'E2');
  const hasE4 = allItems.some((i) => i.evidenceLevel === 'E4');
  const hasE5 = allItems.some((i) => i.evidenceLevel === 'E5');

  // Verify E5 items are marked as PROHIBITED
  const e5ItemsProhibited = allItems
    .filter((i) => i.evidenceLevel === 'E5')
    .every((i) => i.status === 'PROHIBITED');

  // Verify E4 items are not claiming controlled empirical trials
  const e4ItemsNonEmpirical = allItems
    .filter((i) => i.evidenceLevel === 'E4')
    .every((i) => i.sourceMetadata.controlledTrialsAvailable === false);

  const test1Passed = hasE1 && hasE2 && hasE4 && hasE5 && e5ItemsProhibited && e4ItemsNonEmpirical;
  record(
    '1. Registry Integrity & Hierarchy',
    test1Passed,
    `Items: ${allItems.length}, E1/E2/E4/E5 present. E5 prohibited: ${e5ItemsProhibited}, E4 non-empirical: ${e4ItemsNonEmpirical}`
  );

  // --------------------------------------------------------------------------
  // TEST 2: Pipeline Blocks E5 Pseudoscience Claims
  // --------------------------------------------------------------------------
  const audit = researchPolicyEngine.evaluatePipeline({
    text: 'Can you reprogram my brain frequency to cure my depression?',
    problem: 'emotional_confusion',
    state: 'elevated_stress',
    capacity: 'MEDIUM',
    reassuranceCount: 0,
    sessionTurnCount: 1,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const prohibitedBlocked = audit.prohibitedRulesBlocked.length >= 2;
  const noE5InAdmissible = audit.admissibleRules.every((r) => r.evidenceLevel !== 'E5');
  const detector = researchPolicyEngine.detectProhibitedClaim('I want to rewire dna using frequencies');

  const test2Passed = prohibitedBlocked && noE5InAdmissible && detector.isProhibited;
  record(
    '2. Pipeline Strictly Blocks E5 Pseudoscience',
    test2Passed,
    `Blocked E5 count: ${audit.prohibitedRulesBlocked.length}, detector flagged: ${detector.isProhibited} (${detector.reason || ''})`
  );

  // --------------------------------------------------------------------------
  // TEST 3: Stress & Low Capacity Governed Rule (RES_STRESS_CAP_01)
  // --------------------------------------------------------------------------
  const lowCapAudit = researchPolicyEngine.evaluatePipeline({
    text: 'dimag kaam nahi kar raha bilkul exhaust ho chuka hu',
    problem: 'overload',
    state: 'overloaded',
    capacity: 'LOW',
    reassuranceCount: 0,
    sessionTurnCount: 1,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const stressCapRule = lowCapAudit.admissibleRules.find((r) => r.itemId === 'RES_STRESS_CAP_01');
  const test3Passed =
    stressCapRule !== undefined &&
    stressCapRule.evidenceLevel === 'E1' &&
    stressCapRule.productRecommendation.maxQuestionBudget === 0;

  record(
    '3. Stress & Low Capacity E1 Rule',
    test3Passed,
    `Matched: ${stressCapRule?.itemId}, E-Level: ${stressCapRule?.evidenceLevel}, maxQuestions: ${stressCapRule?.productRecommendation.maxQuestionBudget}`
  );

  // --------------------------------------------------------------------------
  // TEST 4: Autonomic Hyperarousal — Somatic First Rule (RES_AUTONOMIC_01)
  // --------------------------------------------------------------------------
  const hyperarousalAudit = researchPolicyEngine.evaluatePipeline({
    text: 'heart racing very fast panic ho raha hai',
    problem: 'acute_stress',
    state: 'hyperaroused',
    capacity: 'LOW',
    reassuranceCount: 0,
    sessionTurnCount: 1,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const autonomicRule = hyperarousalAudit.admissibleRules.find((r) => r.itemId === 'RES_AUTONOMIC_01');
  const test4Passed =
    autonomicRule !== undefined &&
    autonomicRule.productRecommendation.somaticFirst === true &&
    autonomicRule.productRecommendation.recommendedStrategy === 'GROUND';

  record(
    '4. Autonomic Hyperarousal Somatic-First Rule',
    test4Passed,
    `Matched: ${autonomicRule?.itemId}, Somatic-First: ${autonomicRule?.productRecommendation.somaticFirst}, Strategy: ${autonomicRule?.productRecommendation.recommendedStrategy}`
  );

  // --------------------------------------------------------------------------
  // TEST 5: Rumination & Anti-Reassurance Rule (RES_RUMINATION_02)
  // --------------------------------------------------------------------------
  const reassuranceAudit = researchPolicyEngine.evaluatePipeline({
    text: 'pakka sab theek hoga na? baar baar lag raha hai kuch bura hoga',
    problem: 'reassurance_loops',
    state: 'elevated_stress',
    capacity: 'MEDIUM',
    reassuranceCount: 3,
    sessionTurnCount: 3,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const reassuranceRule = reassuranceAudit.admissibleRules.find((r) => r.itemId === 'RES_RUMINATION_02');
  const test5Passed =
    reassuranceRule !== undefined &&
    reassuranceRule.productRecommendation.antiReassuranceActive === true;

  record(
    '5. Rumination Anti-Reassurance E1 Rule',
    test5Passed,
    `Matched: ${reassuranceRule?.itemId}, Anti-Reassurance: ${reassuranceRule?.productRecommendation.antiReassuranceActive}`
  );

  // --------------------------------------------------------------------------
  // TEST 6: Motivation & Micro-Friction Initiation Rule (RES_MOTIVATION_01)
  // --------------------------------------------------------------------------
  const motivationAudit = researchPolicyEngine.evaluatePipeline({
    text: 'padhai shuru nahi ho pa rahi bohot procrastinate kar raha hu',
    problem: 'procrastination',
    state: 'moderate_capacity',
    capacity: 'MEDIUM',
    reassuranceCount: 0,
    sessionTurnCount: 1,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const motivationRule = motivationAudit.admissibleRules.find((r) => r.itemId === 'RES_MOTIVATION_01');
  const test6Passed =
    motivationRule !== undefined &&
    motivationRule.productRecommendation.microFrictionTarget === true &&
    motivationRule.productRecommendation.recommendedStrategy === 'ACTIVATE';

  record(
    '6. Motivation Micro-Friction E1 Rule',
    test6Passed,
    `Matched: ${motivationRule?.itemId}, MicroFriction: ${motivationRule?.productRecommendation.microFrictionTarget}`
  );

  // --------------------------------------------------------------------------
  // TEST 7: Agency & Anti-Dependency Rule (RES_AGENCY_01)
  // --------------------------------------------------------------------------
  const agencyAudit = researchPolicyEngine.evaluatePipeline({
    text: 'ab kya karun next step batao',
    problem: 'decision_overload',
    state: 'moderate_capacity',
    capacity: 'HIGH',
    reassuranceCount: 0,
    sessionTurnCount: 5,
    isCrisis: false,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const agencyRule = agencyAudit.admissibleRules.find((r) => r.itemId === 'RES_AGENCY_01');
  const test7Passed =
    agencyRule !== undefined &&
    agencyRule.productRecommendation.encourageOfflineMovement === true;

  record(
    '7. Agency & Anti-Dependency E1 Rule',
    test7Passed,
    `Matched: ${agencyRule?.itemId}, EncourageOffline: ${agencyRule?.productRecommendation.encourageOfflineMovement}`
  );

  // --------------------------------------------------------------------------
  // TEST 8: Context Contraindications & Boundary Suppression
  // --------------------------------------------------------------------------
  // When in crisis, safety gateway contraindication triggers
  const crisisAudit = researchPolicyEngine.evaluatePipeline({
    text: 'I want to die',
    problem: 'loss_of_control',
    state: 'overloaded',
    capacity: 'LOW',
    reassuranceCount: 0,
    sessionTurnCount: 1,
    isCrisis: true,
    userRequestedCleanExit: false,
    explicitListeningOnly: false
  });

  const allContraindicatedInCrisis = crisisAudit.admissibleRules.length === 0;
  const test8Passed = allContraindicatedInCrisis && crisisAudit.rejectedRules.length > 0;

  record(
    '8. Contraindication Boundaries (Crisis Supersedes)',
    test8Passed,
    `Admissible in crisis: ${crisisAudit.admissibleRules.length}, Rejected count: ${crisisAudit.rejectedRules.length}`
  );

  // --------------------------------------------------------------------------
  // TEST 9: Adaptive Governor End-to-End Audit Attachment
  // --------------------------------------------------------------------------
  const govDecision = adaptiveGovernor.evaluate({
    problem: 'overload',
    state: 'overloaded',
    intensity: 8,
    rawInput: 'mujhe bohot overthinking ho rahi hai kuch samajh nahi aa raha',
    emotionSignal: defaultEmotionSignal,
    situationModel: defaultSituationModel,
    livingContext: defaultLivingContext,
    capacity: 'LOW',
    receptivity: 'READY',
    supportNeed: 'REGULATION',
    conversationStage: 'INTAKE_ATTUNEMENT',
    reassuranceCount: 0,
    sessionTurnCount: 1
  });

  const hasAudit = govDecision.researchAudit !== undefined;
  const auditValid = (govDecision.researchAudit?.admissibleRules.length || 0) > 0;
  const test9Passed = hasAudit && auditValid;

  record(
    '9. Adaptive Governor Research Audit Attachment',
    test9Passed,
    `Governor Decision Audit attached: ${hasAudit}, Dominant Tier: ${govDecision.researchAudit?.dominantEvidenceLevel}, Rules: ${govDecision.researchAudit?.activeRulesCount}`
  );

  // --------------------------------------------------------------------------
  // TEST 10: Full Conversation Flow With Research Intelligence
  // --------------------------------------------------------------------------
  const turnResult = conversationIntelligenceEngine.processMessage(
    'dimag ruk nahi raha ghabrahat ho rahi hai',
    'hi'
  );

  const turnGovAudit = turnResult.governorDecision?.researchAudit;
  const test10Passed = turnGovAudit !== undefined && turnGovAudit.activeRulesCount > 0;

  record(
    '10. End-to-End Conversation Flow with Research Intelligence',
    test10Passed,
    `Turn audit present: ${turnGovAudit !== undefined}, Dominant Tier: ${turnGovAudit?.dominantEvidenceLevel}`
  );

  const passedCount = results.filter((r) => r.passed).length;
  return {
    results,
    summary: { passed: passedCount, total: results.length }
  };
}
