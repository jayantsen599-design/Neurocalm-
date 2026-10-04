/**
 * NEUROCALM ADAPTIVE GOVERNOR TEST MATRIX (Section 40)
 *
 * Verifies the 20 distinct governor test scenarios:
 * A. Low capacity + listening
 * B. Low capacity + action
 * C. Medium capacity + clarification
 * D. High capacity + decision
 * E. High stress + high capacity
 * F. High stress + low capacity
 * G. "pata nahi"
 * H. "bas sun"
 * I. "advice mat de"
 * J. angry user
 * K. hurt/rejected user
 * L. rumination loop
 * M. uncertainty loop
 * N. repeated reassurance
 * O. user correction
 * P. NO_CHANGE
 * Q. WORSE
 * R. WANT_HUMAN
 * S. NOT_READY
 * T. clean exit
 */

import { adaptiveGovernor } from '../core/adaptiveGovernor';
import { stressLanguageSystem } from '../core/stressLanguageSystem';
import { GovernorContextInputs } from '../core/adaptiveGovernor';
import { TestResult } from './neurocalmTests';

export function runGovernorTestMatrix(): { results: TestResult[]; summary: { total: number; passed: number; failed: number } } {
  const results: TestResult[] = [];

  const record = (group: string, name: string, status: 'PASS' | 'FAIL', detail: string) => {
    results.push({ group, name, status, detail });
  };

  const createBaseInputs = (overrides: Partial<GovernorContextInputs>): GovernorContextInputs => {
    return {
      problem: 'acute_stress',
      state: 'elevated_stress',
      intensity: 6,
      rawInput: 'testing input',
      emotionSignal: {
        detectedEmotions: ['stress'],
        intensityEstimate: 6,
        confidence: 0.8,
        isHypothesis: true,
        calibrationNote: 'test hypothesis'
      },
      situationModel: {
        whatHappened: 'test event',
        whatUserThinksItMeans: 'test meaning',
        whatUserFeels: 'stress',
        whatUserWants: 'relief',
        isSeparated: true
      },
      livingContext: {
        id: 'ctx_test',
        status: 'CURRENT',
        confidence: 0.8,
        prioritySource: 'CURRENT_USER_STATEMENT',
        turnIndex: 1,
        timestamp: Date.now()
      },
      capacity: 'MEDIUM',
      receptivity: 'READY',
      supportNeed: 'REGULATION',
      conversationStage: 'GROUNDING',
      reassuranceCount: 0,
      sessionTurnCount: 1,
      ...overrides
    };
  };

  try {
    // ----------------------------------------------------
    // Scenario A: Low capacity + listening
    // ----------------------------------------------------
    const dA = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'LOW',
      supportNeed: 'LISTENING',
      rawInput: 'I just need to vent, feeling exhausted'
    }));
    const passA = dA.capacity === 'LOW' && (dA.primaryStrategy === 'REFLECT' || dA.primaryStrategy === 'LISTEN') && dA.questionBudget === 0;
    record('GOV.A', 'Low capacity + listening', passA ? 'PASS' : 'FAIL', `Strategy: ${dA.primaryStrategy}, QuestionBudget: ${dA.questionBudget}`);

    // ----------------------------------------------------
    // Scenario B: Low capacity + action
    // ----------------------------------------------------
    const dB = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'LOW',
      supportNeed: 'ACTION',
      rawInput: 'kya karu batao'
    }));
    const passB = dB.capacity === 'LOW' && dB.primaryStrategy === 'ACTIVATE' && dB.responseLength === 'TINY' && dB.questionBudget === 0;
    record('GOV.B', 'Low capacity + action', passB ? 'PASS' : 'FAIL', `Strategy: ${dB.primaryStrategy}, Length: ${dB.responseLength}, Target: ${dB.targetInterventionId}`);

    // ----------------------------------------------------
    // Scenario C: Medium capacity + clarification
    // ----------------------------------------------------
    const dC = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'MEDIUM',
      supportNeed: 'CLARIFICATION',
      rawInput: 'clarification needed on bottleneck'
    }));
    const passC = dC.primaryStrategy === 'CLARIFY' && dC.questionBudget === 1 && dC.communicationPolicy.directiveness === 'COLLABORATIVE';
    record('GOV.C', 'Medium capacity + clarification', passC ? 'PASS' : 'FAIL', `Strategy: ${dC.primaryStrategy}, QuestionBudget: ${dC.questionBudget}`);

    // ----------------------------------------------------
    // Scenario D: High capacity + decision
    // ----------------------------------------------------
    const dD = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'HIGH',
      supportNeed: 'DECISION_SUPPORT',
      rawInput: 'need to choose between option A and option B with trade-offs'
    }));
    const passD = dD.capacity === 'HIGH' && dD.primaryStrategy === 'EXPLORE' && dD.responseLength === 'EXPANDED';
    record('GOV.D', 'High capacity + decision', passD ? 'PASS' : 'FAIL', `Strategy: ${dD.primaryStrategy}, Length: ${dD.responseLength}`);

    // ----------------------------------------------------
    // Scenario E: High stress + high capacity (Section 7 stress rule)
    // ----------------------------------------------------
    const dE = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'HIGH',
      state: 'hyperaroused',
      intensity: 9,
      supportNeed: 'DECISION_SUPPORT',
      rawInput: 'High pressure executive dilemma requiring structured reasoning'
    }));
    const passE = dE.capacity === 'HIGH' && dE.cognitiveLoadBudget === 'MODERATE' && dE.primaryStrategy === 'EXPLORE';
    record('GOV.E', 'High stress + high capacity', passE ? 'PASS' : 'FAIL', `Capacity preserved: ${dE.capacity}, Strategy: ${dE.primaryStrategy}`);

    // ----------------------------------------------------
    // Scenario F: High stress + low capacity
    // ----------------------------------------------------
    const dF = adaptiveGovernor.evaluate(createBaseInputs({
      capacity: 'LOW',
      state: 'hyperaroused',
      intensity: 9,
      supportNeed: 'REGULATION',
      rawInput: 'cannot take it anymore, panic'
    }));
    const passF = dF.capacity === 'LOW' && dF.cognitiveLoadBudget === 'MINIMAL' && dF.questionBudget === 0;
    record('GOV.F', 'High stress + low capacity', passF ? 'PASS' : 'FAIL', `LoadBudget: ${dF.cognitiveLoadBudget}, QuestionBudget: ${dF.questionBudget}`);

    // ----------------------------------------------------
    // Scenario G: "pata nahi"
    // ----------------------------------------------------
    const dG = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'bhai pata nahi kya ho raha hai',
      conversationStage: 'INTAKE_ATTUNEMENT'
    }));
    const passG = dG.primaryStrategy === 'CLARIFY' && dG.uncertainty === 'HIGH' && dG.questionBudget === 1;
    record('GOV.G', '"pata nahi"', passG ? 'PASS' : 'FAIL', `Strategy: ${dG.primaryStrategy}, Uncertainty: ${dG.uncertainty}`);

    // ----------------------------------------------------
    // Scenario H: "bas sun"
    // ----------------------------------------------------
    const dH = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'bas sun',
      receptivity: 'NOT_READY'
    }));
    const passH = dH.primaryStrategy === 'LISTEN' && dH.interventionEligible === false && dH.questionBudget === 0;
    record('GOV.H', '"bas sun"', passH ? 'PASS' : 'FAIL', `Strategy: ${dH.primaryStrategy}, InterventionEligible: ${dH.interventionEligible}`);

    // ----------------------------------------------------
    // Scenario I: "advice mat de"
    // ----------------------------------------------------
    const dI = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'advice mat de bilkul bhi'
    }));
    const passI = dI.primaryStrategy === 'LISTEN' && dI.questionBudget === 0 && dI.interventionEligible === false;
    record('GOV.I', '"advice mat de"', passI ? 'PASS' : 'FAIL', `Strategy: ${dI.primaryStrategy}, QuestionBudget: ${dI.questionBudget}`);

    // ----------------------------------------------------
    // Scenario J: angry user
    // ----------------------------------------------------
    const dJ = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'gussa aa raha hai bahut tez',
      problem: 'anger',
      emotionSignal: {
        detectedEmotions: ['anger'],
        intensityEstimate: 9,
        confidence: 0.9,
        isHypothesis: true,
        calibrationNote: 'anger'
      }
    }));
    const passJ = dJ.targetInterventionId === 'thermal_distance_pause' && dJ.interventionEligible === true;
    record('GOV.J', 'angry user', passJ ? 'PASS' : 'FAIL', `Strategy: ${dJ.primaryStrategy}, Target: ${dJ.targetInterventionId}`);

    // ----------------------------------------------------
    // Scenario K: hurt/rejected user
    // ----------------------------------------------------
    const dK = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'usne mana kar diya, reject kar diya mujhe',
      problem: 'rejection',
      emotionSignal: {
        detectedEmotions: ['hurt'],
        intensityEstimate: 8,
        confidence: 0.85,
        isHypothesis: true,
        calibrationNote: 'hurt'
      }
    }));
    const passK = dK.primaryStrategy === 'REFLECT' && dK.targetInterventionId === 'identity_event_decoupling';
    record('GOV.K', 'hurt/rejected user', passK ? 'PASS' : 'FAIL', `Strategy: ${dK.primaryStrategy}, Target: ${dK.targetInterventionId}`);

    // ----------------------------------------------------
    // Scenario L: rumination loop
    // ----------------------------------------------------
    const dL = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'dimag ruk hi nahi raha, loop chal raha hai',
      problem: 'overthinking'
    }));
    const passL = dL.interventionEligible === true;
    record('GOV.L', 'rumination loop', passL ? 'PASS' : 'FAIL', `Eligible: ${dL.interventionEligible}, Strategy: ${dL.primaryStrategy}`);

    // ----------------------------------------------------
    // Scenario M: uncertainty loop
    // ----------------------------------------------------
    const dM = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'kya hoga kal, worst case scenario chinta ho rahi hai',
      supportNeed: 'DECISION_SUPPORT',
      problem: 'decision_overload'
    }));
    const passM = dM.targetInterventionId === 'controllable_split' && dM.uncertainty === 'HIGH';
    record('GOV.M', 'uncertainty loop', passM ? 'PASS' : 'FAIL', `Target: ${dM.targetInterventionId}, Uncertainty: ${dM.uncertainty}`);

    // ----------------------------------------------------
    // Scenario N: repeated reassurance
    // ----------------------------------------------------
    const dN = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'pakka theek hoga na? confirm kar do',
      reassuranceCount: 3
    }));
    const passN = dN.primaryStrategy === 'GROUND' && dN.targetInterventionId === 'controllable_split' && dN.questionBudget === 0;
    record('GOV.N', 'repeated reassurance', passN ? 'PASS' : 'FAIL', `Strategy: ${dN.primaryStrategy}, Target: ${dN.targetInterventionId}`);

    // ----------------------------------------------------
    // Scenario O: user correction
    // ----------------------------------------------------
    const dO = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'nahi main gussa nahi hu, sad hu',
      livingContext: {
        id: 'ctx_test',
        status: 'USER_CORRECTED',
        confidence: 0.95,
        prioritySource: 'USER_CORRECTION',
        turnIndex: 2,
        timestamp: Date.now()
      }
    }));
    const passO = dO.primaryStrategy === 'REFLECT' && dO.reason.includes('User correction');
    record('GOV.O', 'user correction', passO ? 'PASS' : 'FAIL', `Strategy: ${dO.primaryStrategy}, Reason: ${dO.reason}`);

    // ----------------------------------------------------
    // Scenario P: NO_CHANGE
    // ----------------------------------------------------
    const dP = adaptiveGovernor.evaluate(createBaseInputs({
      previousOutcome: 'NO_CHANGE',
      rawInput: 'kuch fark nahi pada'
    }));
    const passP = dP.primaryStrategy === 'REDUCE' && dP.capacity === 'LOW';
    record('GOV.P', 'NO_CHANGE', passP ? 'PASS' : 'FAIL', `Strategy: ${dP.primaryStrategy}, Capacity: ${dP.capacity}`);

    // ----------------------------------------------------
    // Scenario Q: WORSE
    // ----------------------------------------------------
    const dQ = adaptiveGovernor.evaluate(createBaseInputs({
      previousOutcome: 'WORSE',
      rawInput: 'aur bura lag raha hai'
    }));
    const passQ = dQ.primaryStrategy === 'REDUCE' && dQ.capacity === 'LOW';
    record('GOV.Q', 'WORSE', passQ ? 'PASS' : 'FAIL', `Strategy: ${dQ.primaryStrategy}, Capacity: ${dQ.capacity}`);

    // ----------------------------------------------------
    // Scenario R: WANT_HUMAN
    // ----------------------------------------------------
    const dR = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'want to end my life, kill myself',
      supportNeed: 'HUMAN_SUPPORT'
    }));
    const passR = dR.primaryStrategy === 'HUMAN_SUPPORT' && dR.humanSupportRelevant === true && dR.interventionEligible === false;
    record('GOV.R', 'WANT_HUMAN', passR ? 'PASS' : 'FAIL', `Strategy: ${dR.primaryStrategy}, HumanRelevant: ${dR.humanSupportRelevant}`);

    // ----------------------------------------------------
    // Scenario S: NOT_READY
    // ----------------------------------------------------
    const dS = adaptiveGovernor.evaluate(createBaseInputs({
      receptivity: 'NOT_READY',
      rawInput: 'kuch mat batao abhi'
    }));
    const passS = dS.interventionEligible === false && dS.primaryStrategy === 'LISTEN';
    record('GOV.S', 'NOT_READY', passS ? 'PASS' : 'FAIL', `Strategy: ${dS.primaryStrategy}, InterventionEligible: ${dS.interventionEligible}`);

    // ----------------------------------------------------
    // Scenario T: clean exit
    // ----------------------------------------------------
    const dT = adaptiveGovernor.evaluate(createBaseInputs({
      rawInput: 'theek hai ab, thank you, bye'
    }));
    const passT = dT.primaryStrategy === 'EXIT' && dT.exitEligible === true && dT.responseLength === 'TINY';
    record('GOV.T', 'clean exit', passT ? 'PASS' : 'FAIL', `Strategy: ${dT.primaryStrategy}, ExitEligible: ${dT.exitEligible}, Length: ${dT.responseLength}`);

  } catch (err: any) {
    record('GOV.ERROR', 'Governor test error', 'FAIL', err?.message || String(err));
  }

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;

  return {
    results,
    summary: {
      total: results.length,
      passed,
      failed
    }
  };
}
