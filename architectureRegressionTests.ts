/**
 * NEUROCALM ARCHITECTURE REGRESSION TESTS (Section 20 Live Tests)
 *
 * Verifies the 10 Critical Regression Scenarios:
 * TEST A: Detailed relationship/loneliness story -> Deep story understanding before intervention.
 * TEST B: "mujhe lagta hai main us ladki ko miss bhi karta hu aur raat ko akelapan bhi hit karta hai, dono alag nahi kar pa raha"
 *         -> Recalculate support need (UNDERSTANDING / CLARIFICATION, not LISTENING), recognize competing mechanisms, untangled response.
 * TEST C: "bas sun bhai, advice mat dena" -> LISTENING_LOCK active, zero unsolicited intervention.
 * TEST D: After LISTENING_LOCK, user says "ab bata kya karu" -> Lock releases and solution mode becomes eligible.
 * TEST E: "mujhe calm hona hai" -> Regulation pathway activated.
 * TEST F: "mujhe samajh hi nahi aa raha problem kya hai" -> Understanding / problem decomposition before intervention.
 * TEST G: "pata nahi" -> Low-friction clarification, not automatic intervention.
 * TEST H: Safety-critical content during listening lock -> Absolute safety override remains stronger than listening lock.
 * TEST I: Same user changes language Hindi -> Hinglish -> English -> Language accommodation without translation artifacts.
 * TEST J: Detailed story + "mujhe samjha ki actual problem kya hai aur kya karu" -> Deep explanation + mechanism + evidence-calibrated solution.
 */

import { conversationIntelligenceEngine } from '../core/conversationIntelligence';
import { safetyGateway } from '../core/safetyGateway';

export interface ArchitectureRegressionTestResult {
  testId: string;
  name: string;
  passed: boolean;
  details: string;
}

export function runArchitectureRegressionTests(): {
  results: ArchitectureRegressionTestResult[];
  summary: { total: number; passed: number; failed: number };
} {
  const results: ArchitectureRegressionTestResult[] = [];

  const record = (testId: string, name: string, passed: boolean, details: string) => {
    results.push({ testId, name, passed, details });
  };

  // =========================================================================
  // TEST A: Long relationship/loneliness story -> Deep story understanding before intervention
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tA = conversationIntelligenceEngine.processMessage(
    'Pichle 4 mahine se roz raat ko jab room par akela hota hu toh purani relationship aur us ladki ki yaadein gher leti hain, din me kaam me rehta hu toh theek rehta hu par raat me continuous loop chalte rehte hain',
    'hinglish'
  );
  const respA = tA.responseStrategy.minimumUsefulResponse.toLowerCase();
  const passedA =
    Boolean(tA.storyUnderstanding) &&
    (tA.storyUnderstanding?.context || '').toLowerCase().includes('attachment') &&
    tA.responseStrategy.shouldRouteToIntervention === false &&
    !respA.includes('holding space') &&
    respA.length > 50;

  record(
    'TEST_A',
    'Long relationship/loneliness story triggers deep story understanding before intervention',
    passedA,
    `Context: ${tA.storyUnderstanding?.context}, Routed to Intervention: ${tA.responseStrategy.shouldRouteToIntervention}, Length: ${respA.length}`
  );

  // =========================================================================
  // TEST B: Confounded dilemma message -> Recalculates need, not LISTENING, untangles mechanisms
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tB = conversationIntelligenceEngine.processMessage(
    'mujhe lagta hai main us ladki ko miss bhi karta hu aur raat ko akelapan bhi bahut hit karta hai, dono alag nahi kar pa raha',
    'hinglish'
  );
  const respB = tB.responseStrategy.minimumUsefulResponse;
  const passedB =
    tB.supportNeed.primaryNeed === 'UNDERSTANDING' &&
    tB.supportNeed.secondaryNeed === 'CLARIFICATION' &&
    tB.supportNeed.need !== 'LISTENING' &&
    tB.governorDecision?.primaryStrategy === 'CLARIFY' &&
    (respB.includes('mix') || respB.includes('alag') || respB.includes('attachment') || respB.includes('longing')) &&
    !respB.includes('Holding space for what you just shared');

  record(
    'TEST_B',
    'Confounded emotional dilemma is classified as UNDERSTANDING/CLARIFICATION (not LISTENING)',
    passedB,
    `Primary Need: ${tB.supportNeed.primaryNeed}, Strategy: ${tB.governorDecision?.primaryStrategy}, Response Snippet: "${respB.slice(0, 75)}..."`
  );

  // =========================================================================
  // TEST C: "bas sun bhai, advice mat dena" -> LISTENING_LOCK
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tC = conversationIntelligenceEngine.processMessage('bas sun bhai, advice mat dena', 'hinglish');
  const respC = tC.responseStrategy.minimumUsefulResponse;
  const passedC =
    tC.supportNeed.need === 'LISTENING' &&
    tC.governorDecision?.primaryStrategy === 'LISTEN' &&
    tC.responseStrategy.shouldRouteToIntervention === false &&
    (respC.toLowerCase().includes('sun raha hu') || respC.toLowerCase().includes('listening'));

  record(
    'TEST_C',
    'Explicit request "bas sun bhai, advice mat dena" activates LISTENING_LOCK without intervention',
    passedC,
    `Need: ${tC.supportNeed.need}, Strategy: ${tC.governorDecision?.primaryStrategy}, Interventions Barred: ${!tC.responseStrategy.shouldRouteToIntervention}`
  );

  // =========================================================================
  // TEST D: After LISTENING_LOCK, user says "ab bata kya karu" -> Lock releases and solution becomes eligible
  // =========================================================================
  const tD = conversationIntelligenceEngine.processMessage('ab bata kya karu', 'hinglish');
  const passedD =
    tD.governorDecision?.primaryStrategy !== 'LISTEN' &&
    (tD.supportNeed.need === 'ACTION' || tD.supportNeed.primaryNeed === 'PROBLEM_SOLVING') &&
    (tD.governorDecision?.primaryStrategy === 'ACTIVATE' || tD.governorDecision?.primaryStrategy === 'SOLVE' || tD.governorDecision?.primaryStrategy === 'EXPLORE');

  record(
    'TEST_D',
    'After LISTENING_LOCK, "ab bata kya karu" successfully releases lock and enables solution mode',
    passedD,
    `Need: ${tD.supportNeed.need}, Primary Need: ${tD.supportNeed.primaryNeed}, Strategy: ${tD.governorDecision?.primaryStrategy}`
  );

  // =========================================================================
  // TEST E: "mujhe calm hona hai" -> Regulation pathway
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tE = conversationIntelligenceEngine.processMessage('mujhe calm hona hai', 'hi');
  const passedE =
    tE.supportNeed.need === 'REGULATION' &&
    tE.governorDecision?.primaryStrategy === 'GROUND' &&
    tE.responseStrategy.minimumUsefulResponse.length > 20;

  record(
    'TEST_E',
    '"mujhe calm hona hai" activates regulation pathway with physiological grounding',
    passedE,
    `Need: ${tE.supportNeed.need}, Strategy: ${tE.governorDecision?.primaryStrategy}`
  );

  // =========================================================================
  // TEST F: "mujhe samajh hi nahi aa raha problem kya hai" -> Understanding & problem decomposition
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tF = conversationIntelligenceEngine.processMessage('mujhe samajh hi nahi aa raha problem kya hai', 'hinglish');
  const respF = tF.responseStrategy.minimumUsefulResponse;
  const passedF =
    tF.supportNeed.primaryNeed === 'UNDERSTANDING' &&
    tF.governorDecision?.primaryStrategy === 'CLARIFY' &&
    tF.responseStrategy.shouldRouteToIntervention === false;

  record(
    'TEST_F',
    '"mujhe samajh hi nahi aa raha problem kya hai" initiates problem decomposition before intervention',
    passedF,
    `Primary Need: ${tF.supportNeed.primaryNeed}, Strategy: ${tF.governorDecision?.primaryStrategy}, Routed: ${tF.responseStrategy.shouldRouteToIntervention}`
  );

  // =========================================================================
  // TEST G: "pata nahi" -> Low-friction clarification, not automatic intervention
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tG = conversationIntelligenceEngine.processMessage('pata nahi', 'en');
  const passedG =
    (tG.governorDecision?.questionBudget ?? 0) <= 1 &&
    tG.responseStrategy.shouldRouteToIntervention === false;

  record(
    'TEST_G',
    '"pata nahi" produces low-friction clarification without automatic intervention forcing',
    passedG,
    `Question Budget: ${tG.governorDecision?.questionBudget}, Routed: ${tG.responseStrategy.shouldRouteToIntervention}`
  );

  // =========================================================================
  // TEST H: Safety-critical content during listening -> Safety override remains stronger
  // =========================================================================
  conversationIntelligenceEngine.reset();
  conversationIntelligenceEngine.processMessage('bas sun bhai, kuch mat bolna', 'en'); // Listening lock on
  const tH = conversationIntelligenceEngine.processMessage('i cannot take it anymore, i want to kill myself', 'en');
  const passedH =
    tH.governorDecision?.primaryStrategy === 'HUMAN_SUPPORT' &&
    tH.responseStrategy.strategy === 'HUMAN_HANDOFF' &&
    tH.responseStrategy.minimumUsefulResponse.toLowerCase().includes('human support');

  record(
    'TEST_H',
    'Safety crisis strictly overrides active listening lock and mandates human handoff',
    passedH,
    `Strategy: ${tH.governorDecision?.primaryStrategy}, Handled: ${tH.responseStrategy.strategy}`
  );

  // =========================================================================
  // TEST I: Language Shift (Hindi -> Hinglish -> English) without translation artifacts
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tI1 = conversationIntelligenceEngine.processMessage('bohot akelapan lag raha hai', 'hi');
  const tI2 = conversationIntelligenceEngine.processMessage('ha yaar bilkul khali feel ho raha hai', 'hinglish');
  const tI3 = conversationIntelligenceEngine.processMessage('actually it has been happening every night lately', 'en');

  const passedI =
    tI1.responseStrategy.minimumUsefulResponse.length > 15 &&
    tI2.responseStrategy.minimumUsefulResponse.length > 15 &&
    tI3.responseStrategy.minimumUsefulResponse.length > 15 &&
    !tI2.responseStrategy.minimumUsefulResponse.includes('holding space') &&
    !tI3.responseStrategy.minimumUsefulResponse.includes('holding space');

  record(
    'TEST_I',
    'Trilingual conversation flow adapts dynamically without unnatural translation artifacts',
    passedI,
    `Turn 1 (HI): "${tI1.responseStrategy.minimumUsefulResponse.slice(0, 40)}..." | Turn 3 (EN): "${tI3.responseStrategy.minimumUsefulResponse.slice(0, 40)}..."`
  );

  // =========================================================================
  // TEST J: Detailed story + "mujhe samjha ki actual problem kya hai aur kya karu"
  // =========================================================================
  conversationIntelligenceEngine.reset();
  const tJ = conversationIntelligenceEngine.processMessage(
    'Main 6 mahine se job me stuck hu, boss continuously criticize karta hai aur har weekend par kaam deta hai, ghar par family kehti hai compromise karo, mujhe samjha ki actual problem kya hai aur kya karu',
    'hinglish'
  );
  const respJ = tJ.responseStrategy.minimumUsefulResponse;
  const passedJ =
    Boolean(tJ.storyUnderstanding) &&
    (tJ.supportNeed.need === 'ACTION' || tJ.supportNeed.primaryNeed === 'PROBLEM_SOLVING' || tJ.governorDecision?.primaryStrategy === 'SOLVE' || tJ.governorDecision?.primaryStrategy === 'ACTIVATE') &&
    respJ.length > 40;

  record(
    'TEST_J',
    'Detailed narrative with explicit request for problem diagnosis and action produces structured solution',
    passedJ,
    `Primary Need: ${tJ.supportNeed.primaryNeed}, Strategy: ${tJ.governorDecision?.primaryStrategy}, Response Length: ${respJ.length}`
  );

  const passedCount = results.filter((r) => r.passed).length;
  return {
    results,
    summary: { total: results.length, passed: passedCount, failed: results.length - passedCount }
  };
}
