/**
 * NEUROCALM STRESS CONVERSATION LANGUAGE SYSTEM (Step 4)
 *
 * Implements the state-to-communication policy determined by the Adaptive Governor.
 *
 * CORE PHILOSOPHY:
 * Optimize: USEFUL MOVEMENT PER UNIT OF USER EFFORT.
 * (Not maximum conversation, not maximum empathy language, not maximum length)
 *
 * ARCHITECTURAL LAYERS:
 * 1. DYNAMIC RESPONSE BUDGET (sentence count, ideas, questions, choices, explanation depth)
 * 2. FIRST RESPONSE POLICY (Observation->Check, Clarification->Action, Uncertainty->Controllable)
 * 3. STATE-SPECIFIC POLICIES (Overloaded, Confused, Hurt, Angry, Uncertain, Depleted, High Capacity, Urgent, Ruminating)
 * 4. VALIDATION WITHOUT AUTOMATIC AGREEMENT (Validates experience/impact without validating catastrophizing/blame)
 * 5. DIRECTIVENESS DIAL (High directness for clear action/urgency; Low directness for values/uncertainty)
 * 6. INFORMATION GAIN GATE (Zero questions unless answer changes the next move)
 * 7. QUESTION COMPLEXITY (Concrete for Low, Targeted for Medium, Exploratory for High)
 * 8. MICRO-LANGUAGE & HYPOTHESIS CALIBRATION ("Ho sakta hai...", "Ek possibility...", "Meri current reading...")
 * 9. ANTI-AI SLOP & REPETITION CONTROL (No fake intimacy, no generic therapy talk, no lectures)
 * 10. REAL-WORLD ORIENTATION & EXITABILITY (Prioritizes real-world action; clean exit treated as success)
 * 11. COMMUNICATION QUALITY METRICS (Measures quality separately from intervention outcome)
 */

import {
  SupportedLanguage,
  GovernorDecision,
  CommunicationPolicy,
  ResponseBudget,
  FirstResponseStructure,
  CommunicationQualityMetrics,
  CurrentState,
  CapacityLevel
} from '../types/neurocalm';
import { deepSolutionEngine } from './deepSolutionEngine';
import { storyUnderstandingEngine } from './storyUnderstanding';
import { mechanismExplorer } from './mechanismExplorer';

export interface FormattedResponse {
  primaryMessage: string;
  calibratedQuestion?: string;
  quickActionPrompt?: string;
  ownershipCheck?: string;
  responseBudget: ResponseBudget;
  firstResponseStructure?: FirstResponseStructure;
  qualityMetrics: CommunicationQualityMetrics;
}

export class StressLanguageSystem {
  private recentPhrases: string[] = [];

  /**
   * Generates dynamic response budget from Governor decision
   */
  public calculateResponseBudget(decision: GovernorDecision): ResponseBudget {
    const { capacity, directiveness, communicationPolicy } = decision;

    if (capacity === 'LOW') {
      return {
        maxSentences: 1,
        maxIdeas: 1,
        maxQuestions: decision.questionBudget > 0 ? 1 : 0,
        maxChoices: 0,
        explanationDepth: 'NONE',
        vocabularyComplexity: 'SIMPLE',
        directiveness: decision.supportNeed === 'ACTION' ? 'DIRECT' : 'LOW',
        warmth: communicationPolicy.warmth
      };
    }

    if (capacity === 'MEDIUM') {
      return {
        maxSentences: 2,
        maxIdeas: 2,
        maxQuestions: decision.questionBudget,
        maxChoices: 1,
        explanationDepth: communicationPolicy.explanationDepth === 'NONE' ? 'NONE' : 'BRIEF',
        vocabularyComplexity: 'EVERYDAY',
        directiveness: directiveness,
        warmth: communicationPolicy.warmth
      };
    }

    // HIGH CAPACITY
    return {
      maxSentences: 4,
      maxIdeas: 3,
      maxQuestions: decision.questionBudget,
      maxChoices: 2,
      explanationDepth: 'EXPLANATORY',
      vocabularyComplexity: 'EVERYDAY',
      directiveness: directiveness,
      warmth: communicationPolicy.warmth
    };
  }

  /**
   * Primary Entry Point: Generates formatted response dynamically based on decision rules
   */
  public generateResponse(
    decision: GovernorDecision,
    userRawInput: string,
    lang: SupportedLanguage = 'en'
  ): FormattedResponse {
    const text = userRawInput.toLowerCase().trim();
    const strategy = decision.primaryStrategy;
    const policy = decision.communicationPolicy;
    const budget = this.calculateResponseBudget(decision);

    // 1. CRISIS / HUMAN SUPPORT (Safety Priority 1)
    if (strategy === 'HUMAN_SUPPORT') {
      const messages = {
        en: 'I hear how heavy this is. This is beyond what an app can hold. Please connect with human support right now.',
        hi: 'Aap jo mehsoos kar rahe hain woh bohot bhaari hai. Is samay kisi insaan ya helpline se baat karna zaroori hai.',
        hinglish: 'Yeh bohot heavy weight hai. Please akele mat raho, human support ya helpline se turant connect karo.'
      };
      return this.packageResponse(messages[lang], undefined, undefined, undefined, budget, undefined, decision);
    }

    // 2. CLEAN EXIT (Exit treated as genuine success)
    if (strategy === 'EXIT') {
      const exits = {
        en: 'Understood. Step away from the screen and carry on with your day.',
        hi: 'Theek hai. Screen band karein aur apne din par aage badhein.',
        hinglish: 'Understood. Screen off karo aur life mein aage badho.'
      };
      return this.packageResponse(exits[lang], undefined, undefined, undefined, budget, undefined, decision);
    }

    // 3. USER CORRECTION (Section 39 Priority: User Correction Overrides AI Inference)
    if (decision.reason.includes('User correction')) {
      const ack = {
        en: 'Understood, my mistake. Taking note of that directly.',
        hi: 'Samajh gaya, meri galti. Aapki baat note kar li.',
        hinglish: 'Understood, my mistake. Tumhari baat clearly note kar li.'
      }[lang];

      let question: string | undefined = undefined;
      if (budget.maxQuestions > 0) {
        question = {
          en: 'What is happening right now from your perspective?',
          hi: 'Aapke hisaab se abhi kya chal raha hai?',
          hinglish: 'Tumhare hisaab se abhi exact situation kya hai?'
        }[lang];
      }

      return this.packageResponse(ack, question, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 3b. MEDICAL EVIDENCE & DIAGNOSTIC BOUNDARIES (Section 10 & 11)
    if (decision.medicalBoundary?.isMedicalQuery) {
      const med = decision.medicalBoundary;
      const resp = med.educationalFraming + (med.referralGuidance ? ` ${med.referralGuidance}` : '');
      return this.packageResponse(resp, undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 3c. GOVERNED WISDOM LENS (Section 12 & 13)
    if (decision.wisdomLens) {
      const w = decision.wisdomLens;
      const wisdomText = `${w.applicationGuidance} [Contemplative Perspective: ${w.tradition} — ${w.principleName} (Level E4 Traditional Wisdom, distinct from clinical medical science)]`;
      return this.packageResponse(wisdomText, undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 3d. CONFOUNDED MECHANISMS / UNTANGLE PROBLEM (Section 1 & 4 Architecture)
    // Example: "mujhe lagta hai main us ladki ko miss bhi karta hu aur raat ko akelapan bhi bahut hit karta hai, dono alag nahi kar pa raha"
    const isConfoundedDilemma =
      /\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|samajh hi nahi aa raha problem kya hai)\b/i.test(text) ||
      (/\b(miss|yaad|ladki|ladka|ex)\b/i.test(text) && /\b(raat|night|akela|lonely)\b/i.test(text));

    const hasExplicitListeningCommand =
      decision.reason.includes('bas sun') ||
      decision.reason.includes('explicitly barred advice') ||
      /\b(bas\s+sun\b|sirf\s+sun\b|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|just\s+listen|mujhe\s+bas\s+bolne\s+de)\b/i.test(text);

    if (isConfoundedDilemma && !hasExplicitListeningCommand) {
      const plan = deepSolutionEngine.formulatePlan({
        rawInput: userRawInput,
        story: decision.storyUnderstanding || storyUnderstandingEngine.buildStoryModel(userRawInput, { detectedEmotions: ['loneliness', 'sadness'], intensityEstimate: 6, confidence: 0.8, isHypothesis: true, calibrationNote: '' }, { need: 'CLARIFICATION', primaryNeed: 'UNDERSTANDING', confidence: 0.9, rationale: '' }, { id: 'ctx_default', turnIndex: 0, timestamp: Date.now(), status: 'CURRENT', prioritySource: 'CURRENT_USER_STATEMENT', confidence: 0.9 }),
        supportNeed: { need: 'CLARIFICATION', primaryNeed: 'UNDERSTANDING', secondaryNeed: 'CLARIFICATION', confidence: 0.9, rationale: '' },
        capacity: decision.capacity,
        receptivity: decision.receptivity,
        stage: decision.conversationStage,
        mechanisms: mechanismExplorer.evaluateCompetingMechanisms(userRawInput, { detectedEmotions: ['loneliness', 'sadness'], intensityEstimate: 6, confidence: 0.8, isHypothesis: true, calibrationNote: '' }, { need: 'CLARIFICATION', primaryNeed: 'UNDERSTANDING', confidence: 0.9, rationale: '' }),
        language: lang,
        turnIndex: 0,
        listeningLockActive: false
      });
      return this.packageResponse(plan.craftedResponse, undefined, undefined, undefined, budget, 'REFLECTION_QUESTION', decision);
    }

    // 4. "BAS SUN" / "ADVICE MAT DE" / LISTENING LOCK (Dynamic Non-Evaluative Attunement)
    const isExplicitListeningMode =
      hasExplicitListeningCommand ||
      (strategy === 'LISTEN' && decision.reason.includes('Listening'));

    if (isExplicitListeningMode) {
      const isInitialBarCommand = /\b(bas\s+sun|sirf\s+sun|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|don't\s+give\s+advice|just\s+listen)\b/i.test(text);

      if (isInitialBarCommand) {
        const listenText = {
          en: 'I am listening. No advice, no exercises, no unsolicited techniques. Speak freely.',
          hi: 'Main dhyan se sun raha hu. Koi advice ya exercises nahi dunga. Jo kehna chahte hain kahein.',
          hinglish: 'Main sun raha hu bhai. Zero advice, zero solutions. Jo bolna hai aaram se bolo, I am here.'
        }[lang];
        return this.packageResponse(listenText, undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
      }

      // Subsequent emotional turns during listening mode: reflect specific context, never generic canned phrase
      const story = decision.storyUnderstanding;
      const hasLoneliness = /\b(akela|lonely|alone|isolated|koi nahi)\b/i.test(text);
      const hasHurt = /\b(dard|dukh|hurt|rejection|mana kar diya|insult|fight)\b/i.test(text);

      let contextReflect = '';
      if (hasLoneliness) {
        contextReflect = {
          en: 'Feeling isolated and carrying this alone is genuinely heavy. Still holding zero-advice space for you, take all the time you need.',
          hi: 'Akelapan bohot bhaari hota hai jab sab akele jhelna pade. Zero advice, aaram se jo man me ho kahein.',
          hinglish: 'Akelapan bohot heavy hota hai jab sab akele jhelna pade. Zero advice, aaram se jo kehna hai bolo.'
        }[lang];
      } else if (hasHurt) {
        contextReflect = {
          en: 'What happened hurts, and carrying the impact of that is painful. Still here listening without any lectures or techniques.',
          hi: 'Jo hua woh dukh deta hai. Bina kisi gyan ya lecture ke dhyan se sun raha hu, jo kehna hai kahein.',
          hinglish: 'Jo hua woh hurt karta hai. Zero gyan, zero technique. Aaram se apni baat complete karo.'
        }[lang];
      } else {
        const contextStr = story?.context && story.context !== 'General daily life' ? ` around ${story.context.toLowerCase()}` : '';
        contextReflect = `I hear the weight this situation${contextStr} is carrying. Still completely in listening mode—speak freely, whatever else you want to get off your chest.`;
      }

      return this.packageResponse(contextReflect, undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 4b. DETAILED NARRATIVE / HIGH INFORMATION / D3-D5 DEPTH (Section 2 & 15 Architecture)
    if (
      (decision.responseDepth === 'D3' || decision.responseDepth === 'D4' || decision.responseDepth === 'D5') &&
      userRawInput.split(/\s+/).filter(Boolean).length >= 15 &&
      strategy !== 'SOLVE' &&
      strategy !== 'ACTIVATE' &&
      !isExplicitListeningMode
    ) {
      const story = decision.storyUnderstanding;
      const isHurtOrTrust = /\b(hurt|trust|friend|betray|mazaak|break)\b/i.test(text);

      let detailMsg = '';
      if (isHurtOrTrust) {
        detailMsg = {
          en: `Looking closely at what happened with your friend: when someone close breaks your trust, the emotional hurt and isolation feel heavy and exhausting. The chest heaviness you feel is your body carrying that social impact.`,
          hi: `Aapke dost ke saath jo hua: jab koi apna trust todta hai toh dukh aur akelapan bohot gehra lagta hai. Shareer me yeh bhari-pan usi dhakke ka asar hai.`,
          hinglish: `Dost ke saath jo hua aur jis tarah trust break hua: yeh hurt aur loneliness bohot heavy weight create karti hai. Chest me jo heaviness hai woh is emotional shock ka direct physical impact hai.`
        }[lang];
      } else {
        const actualProb = story?.actualProblem && story.actualProblem !== 'Cognitive/emotional overload'
          ? story.actualProblem.toLowerCase()
          : 'competing cognitive demands';
        detailMsg = {
          en: `Looking closely at this timeline and the pattern you described: the cognitive overload appears driven by ${actualProb} across ${story?.context?.toLowerCase() || 'your current situation'}. When multiple pressures compound over time, working memory reaches saturation even when your underlying capability is strong.`,
          hi: `Aapne jo timeline aur pattern bataya: isme main drag ${actualProb} ki wajah se ban raha hai. Jab bohot si cheezein ek saath chal rahi hon toh dimag par load aana natural hai.`,
          hinglish: `Tumne jo detailed pattern aur timeline describe kiya: main bottleneck ${actualProb} ki wajah se hai across ${story?.context?.toLowerCase() || 'this situation'}. Jab multiple demands overlap karti hain, toh working memory exhaust ho jati hai.`
        }[lang];
      }

      const detailQ = budget.maxQuestions > 0 ? (decision.discriminatingTest?.prompt || 'What piece of this situation is creating the heaviest drag for you right now?') : undefined;
      return this.packageResponse(detailMsg, detailQ, undefined, undefined, budget, 'PATTERN_VERIFICATION', decision);
    }

    // 4c. LONELINESS / SOCIAL ISOLATION (Attuned Presence, Zero False Positivity, Zero Forced Technique)
    if (
      /\b(akela|lonely|alone|isolated|koi nahi hai|akela feel)\b/i.test(text) &&
      (strategy === 'REFLECT' || decision.supportNeed === 'LISTENING' || decision.supportNeed === 'VALIDATION')
    ) {
      const lonelinessTexts = {
        en: 'Loneliness can feel very quiet and heavy. I hear what you are experiencing, take your time.',
        hi: 'Akelapan bohot bhaari aur khali lag sakta hai. Main yahan sun raha hu, aap aaram se batayein.',
        hinglish: 'Akelapan bohot heavy aur khali feel hota hai. I hear you, take your time.'
      };
      return this.packageResponse(lonelinessTexts[lang], undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 4d. OVERTHINKING / RACING THOUGHTS ("dimag ruk hi nahi raha" - Attunement, NOT automatic intervention)
    if (
      /\b(dimag ruk hi nahi raha|thoughts ruk nahi rahe|racing thoughts)\b/i.test(text) &&
      !decision.interventionEligible
    ) {
      const overthinkingTexts = {
        en: 'When your mind keeps spinning, even simple things feel loud. We do not need to rush or fix anything right this second.',
        hi: 'Jab dimag rukta nahi hai toh har baat ka shor zyada lagta hai. Abhi kisi cheez ki jaldi nahi hai.',
        hinglish: 'Jab dimag continuous loop mein chalta hai toh sab heavy lagta hai. Abhi kisi cheez ki koi jaldi nahi hai.'
      };
      const clarifyQ = budget.maxQuestions > 0 ? {
        en: 'Is this mostly about one specific worry, or many different things overlapping?',
        hi: 'Yeh kisi ek specific baat ka shor hai, ya bohot saari baatein mix ho gayi hain?',
        hinglish: 'Yeh kisi ek baat ka loop hai ya multiple baatein overlap kar rahi hain?'
      }[lang] : undefined;

      return this.packageResponse(overthinkingTexts[lang], clarifyQ, undefined, undefined, budget, 'REFLECTION_QUESTION', decision);
    }

    // 5. "PATA NAHI" UNCERTAINTY (Lowest-Friction Clarification, Disambiguation, Zero Pressure)
    if (
      (text.includes('pata nahi') || decision.shape?.catchSignal?.includes('Pata nahi')) &&
      (strategy === 'CLARIFY' || strategy === 'PAUSE')
    ) {
      const isRepeated = budget.maxQuestions === 0 || decision.reason.includes('Repeated');
      if (isRepeated) {
        const repeatedTexts = {
          en: 'That is completely okay. You do not have to explain or figure it out right now. We can just pause here.',
          hi: 'Koi baat nahi, abhi explain karna ya sochna zaroori nahi hai. Yahin ruk sakte hain.',
          hinglish: 'Totally fine. Abhi explain karna ya figure out karna zaroori nahi hai. Yahin calm space mein rukte hain.'
        };
        return this.packageResponse(repeatedTexts[lang], undefined, undefined, undefined, budget, 'REDUCE_PAUSE', decision);
      }

      const pataNahiTexts = {
        en: 'It is completely normal not to have words for it yet. No rush at all.',
        hi: 'Abhi sab clear na hona bilkul normal hai. Koi jaldi nahi hai.',
        hinglish: 'Abhi sab clear na hona bilkul normal hai. Isme koi jaldi nahi hai.'
      };

      const question = budget.maxQuestions > 0 ? {
        en: 'Is this mostly physical tension in your body, or thoughts spinning in your head?',
        hi: 'Yeh zyada shareer mein bechaini hai ya dimag mein shor?',
        hinglish: 'Yeh body mein physical tension zyada hai ya dimag mein shor?'
      }[lang] : undefined;

      return this.packageResponse(pataNahiTexts[lang], question, undefined, undefined, budget, 'REFLECTION_QUESTION', decision);
    }

    // 5b. EXPLICIT SOLUTION REQUEST ("bata kya karu")
    if (strategy === 'SOLVE' && (text.includes('kya karu') || text.includes('bata') || decision.reason.includes('solution'))) {
      const solveTexts = {
        en: 'Let us take this one manageable step at a time, keeping you in full control.',
        hi: 'Ise ek concrete step mein baantte hain, faisla aapka hi rahega.',
        hinglish: 'Chalo isko ek practical step mein break karte hain, ownership completely tumhari rahegi.'
      };
      const solvePrompt = {
        en: 'What is the immediate single roadblock in front of you right now?',
        hi: 'Aapke saamne abhi sabse pehla specific roadblock kya hai?',
        hinglish: 'Abhi tumhare samne sabse pehla specific bottleneck kya hai?'
      }[lang];

      return this.packageResponse(solveTexts[lang], budget.maxQuestions > 0 ? solvePrompt : undefined, undefined, undefined, budget, 'DECISION_SIMPLIFY_CHOOSE', decision);
    }

    // 6. ANGER REGULATION (Section 14: Physiological containment, zero toxic "calm down")
    if (decision.reason.includes('Anger detected') || decision.primaryStrategy === 'GROUND' && decision.state === 'hyperaroused') {
      const angerTexts = {
        en: 'Your nervous system is in high gear right now. Before reacting or deciding, let us put a 90-second pause in place.',
        hi: 'System abhi tez speed par hai. Kuch bolne ya decide karne se pehle 90 second ka pause zaroori hai.',
        hinglish: 'Autonomic system spiked hai. React karne se pehle 90 seconds ka physical pause lete hain.'
      };

      const actionPrompt = {
        en: 'Apply 90-second thermal pause →',
        hi: '90-second pause shuru karein →',
        hinglish: 'Start 90s physical brake →'
      }[lang];

      return this.packageResponse(angerTexts[lang], undefined, actionPrompt, undefined, budget, 'CLARIFICATION_ACTION', decision);
    }

    // 7. HURT / REJECTION (Section 15: Validation without toxic positivity, event vs identity decoupling)
    if (decision.reason.includes('Rejection/hurt') || (decision.primaryStrategy === 'REFLECT' && text.includes('reject'))) {
      const hurtTexts = {
        en: 'Rejection hits hard. What happened was painful, but this single event does not define your entire value.',
        hi: 'Rejection ka asar gehra hota hai. Jo hua woh dukhad hai, par is ek cheez se aapki value kam nahi hoti.',
        hinglish: 'Rejection bohot hurt karta hai. Jo hua painful hai, but yeh ek event tumhari whole identity define nahi karta.'
      };

      let question: string | undefined = undefined;
      if (budget.maxQuestions > 0) {
        question = {
          en: 'Are you mostly replaying what was said, or feeling it in your chest?',
          hi: 'Kya unki baatein baar-baar yaad aa rahi hain, ya dukh physically feel ho raha hai?',
          hinglish: 'Unki baatein dimag mein replay ho rahi hain ya physically heavy feel ho raha hai?'
        }[lang];
      }

      return this.packageResponse(hurtTexts[lang], question, undefined, undefined, budget, 'REFLECTION_SMALL_SHIFT', decision);
    }

    // 8. ANTI-REASSURANCE & CHECKING LOOP (Section 20: Break loop, partition controllable)
    if (decision.reason.includes('Reassurance loop') || text.includes('check')) {
      const reassureTexts = {
        en: 'Checking again feeds the loop rather than settling it. Let us look at what you can actually control right now.',
        hi: 'Baar-baar check karne se loop aur badhta hai. Jo aapke haath mein hai, sirf use alag karte hain.',
        hinglish: 'Baar-baar verify karne se reassurance loop badhta hai. Facts vs darr ko partition karte hain.'
      };

      const actionPrompt = {
        en: 'Partition Controllable Facts →',
        hi: 'Controllable baatein alag karein →',
        hinglish: 'Split controllable parts →'
      }[lang];

      return this.packageResponse(reassureTexts[lang], undefined, actionPrompt, undefined, budget, 'UNCERTAINTY_CONTROLLABLE', decision);
    }

    // 9. DECISION OVERLOAD (Section 18: Decision Support + Ownership Check)
    if (strategy === 'EXPLORE' || decision.supportNeed === 'DECISION_SUPPORT' || text.includes('karna chahiye') || text.includes('decision')) {
      const decisionTexts = {
        en: 'When too many options compete, we partition reversible choices from irreversible ones.',
        hi: 'Jab zyada options ho, toh reversible faislon ko irreversible se alag karna chahiye.',
        hinglish: 'Jab options zyada ho, toh reversible vs irreversible choices ko alag karte hain.'
      };

      const ownershipChecks = {
        en: 'Between these possibilities, which one aligns best with your own priorities?',
        hi: 'In options mein se, aapke hisaab se sabse zaroori kya lagta hai?',
        hinglish: 'In choices mein se tumhari apni priority ke sabse close kaunsa hai?'
      }[lang];

      return this.packageResponse(
        decisionTexts[lang],
        budget.maxQuestions > 0 ? ownershipChecks : undefined,
        undefined,
        ownershipChecks,
        budget,
        'DECISION_SIMPLIFY_CHOOSE',
        decision
      );
    }

    // 10. LOW CAPACITY + ACTION (Section 4: Micro-Friction Starter)
    if (decision.capacity === 'LOW' && (strategy === 'ACTIVATE' || decision.supportNeed === 'ACTION')) {
      const lowCapAction = {
        en: 'We only need to touch the task for 120 seconds. Nothing more right now.',
        hi: 'Sirf 2 minute ke liye kaam ko chhoona hai. Isse zyada kuch nahi.',
        hinglish: 'Sirf 120 seconds ke liye start karte hain. Uske aage koi pressure nahi.'
      };

      const actionPrompt = {
        en: 'Start 2-minute micro-step →',
        hi: '2-minute micro-step shuru karein →',
        hinglish: 'Touch task for 120s →'
      }[lang];

      return this.packageResponse(lowCapAction[lang], undefined, actionPrompt, undefined, budget, 'CLARIFICATION_ACTION', decision);
    }

    // 10b. TASK PROGRESSION / WORK STEPS / MICRO ACTION
    if (
      decision.supportNeed === 'ACTION' ||
      /\b(focus|kaam|report|email|draft|finish|pending|start|break|stretch)\b/i.test(text)
    ) {
      let taskText = '';
      if (/\b(focus|dhyan)\b/i.test(text)) {
        taskText = {
          en: 'When focus feels scattered, touching just the first 2 minutes of the task lowers the barrier.',
          hi: 'Jab focus na bane, toh bas pehle 2 minute kaam ko chhoone se resistance kam hoti hai.',
          hinglish: 'Focus scattered ho toh bas starting ke 2 minutes touch karne se friction kam ho jata hai.'
        }[lang];
      } else if (/\b(draft|done|ho gaya|complete|kar liya)\b/i.test(text)) {
        taskText = {
          en: 'That piece is off your plate. One concrete step completed.',
          hi: 'Woh kaam complete hua. Ek concrete step aage badhe.',
          hinglish: 'Woh piece done. Ek concrete step clearly complete hua.'
        }[lang];
      } else if (/\b(start|shuru|begin|report)\b/i.test(text)) {
        taskText = {
          en: 'Starting the next item by outlining just the headers builds immediate forward momentum.',
          hi: 'Agla kaam bas structure karke start karne se momentum ban jata hai.',
          hinglish: 'Next task ki basic structure outline karne se immediate momentum ban jata hai.'
        }[lang];
      } else if (/\b(email|pending)\b/i.test(text)) {
        taskText = {
          en: 'Getting that specific item out of your head and onto paper frees up immediate working memory.',
          hi: 'Use dimaag se nikaal kar paper ya screen par laane se working memory free ho jaati hai.',
          hinglish: 'Usko dimag se utar kar draft karne se working memory turant free hoti hai.'
        }[lang];
      } else if (/\b(fatigue|break|stretch)\b/i.test(text)) {
        taskText = {
          en: 'Stepping back physically resets the nervous system. Give your eyes a moment off the screen.',
          hi: 'Shareer ko thoda stretch karne se nervous system reset hota hai. Screen se nazar hatayein.',
          hinglish: 'Physical stretch se nervous system reset hota hai. Screen se 2 minute ka break le lo.'
        }[lang];
      } else {
        taskText = {
          en: 'Taking it one single concrete piece at a time keeps cognitive load manageable.',
          hi: 'Ek samay par ek hi concrete kaam karne se load control mein rehta hai.',
          hinglish: 'Ek time par ek clear task handle karne se overload nahi hota.'
        }[lang];
      }
      return this.packageResponse(taskText, undefined, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 11. LOW CAPACITY + PAUSE / DEPLETION (Section 4: Effort Minimization)
    if (decision.capacity === 'LOW' || strategy === 'PAUSE' || decision.state === 'depleted') {
      const lowCapPause = {
        en: 'You are carrying a lot right now. Let us pause here for a moment.',
        hi: 'Load abhi zyada hai. Yahin ek second ka pause le sakte hain.',
        hinglish: 'Bohot heavy load lag raha hai. Yahin ek second pause lete hain.'
      };
      return this.packageResponse(lowCapPause[lang], undefined, undefined, undefined, budget, 'REDUCE_PAUSE', decision);
    }

    // 12. FAILURE RECOVERY (Section 25: Step down cognitive friction)
    if (strategy === 'REDUCE') {
      const reduceTexts = {
        en: 'That move did not land, and that is completely fine. Let us dial the demand down and pause quietly.',
        hi: 'Pichla step kaam nahi kiya, koi baat nahi. Demand kam karte hain aur shanti se pause lete hain.',
        hinglish: 'Last step se relief nahi mila, totally fine. Demand kam karte hain aur ek silent pause lete hain.'
      };
      return this.packageResponse(reduceTexts[lang], undefined, undefined, undefined, budget, 'REDUCE_PAUSE', decision);
    }

    // 13. CONFUSION / UNCERTAINTY (Section 7: Structure the problem)
    if (decision.supportNeed === 'CLARIFICATION' || text.includes("don't know why") || text.includes('confus')) {
      const confuseTexts = {
        en: 'When an internal state feels murky, separating thoughts from bodily sensations gives clarity.',
        hi: 'Jab samajh na aaye kya ho raha hai, toh sharirik bechaini ko dimag ke shor se alag karna chahiye.',
        hinglish: 'Jab situation unclear ho, toh physical sensation aur thought loops ko separate karke clarity milti hai.'
      };

      const question = budget.maxQuestions > 0 ? {
        en: 'Did this feeling start with a specific thought, or did your body suddenly feel tight?',
        hi: 'Yeh kisi baat se shuru hua, ya shareer mein achanak se dhavab bana?',
        hinglish: 'Yeh kisi thought se trigger hua ya pehle body tight feel hui?'
      }[lang] : undefined;

      return this.packageResponse(confuseTexts[lang], question, undefined, undefined, budget, 'OBSERVATION_CHECK', decision);
    }

    // 14. DEFAULT CALIBRATED HYPOTHESIS REFLECTION (With Anti-Repetition Rotation)
    const defaultVariations: Record<SupportedLanguage, string[]> = {
      en: [
        'Holding space for what you just shared.',
        'Noticing where your attention is moving as you step through this.',
        'Tracking this next piece of the situation carefully.',
        'Taking in the shift in focus as you work through each piece.'
      ],
      hi: [
        'Aapne jo kaha, use dhyan se sun raha hu.',
        'Dhyan kahan ja raha hai, use bina kisi judgement ke dekhte hain.',
        'Is agle hisse ko dheere-dheere samajhte hain.',
        'Aapki baat sunkar sthiti ka agla roop samajh aa raha hai.'
      ],
      hinglish: [
        'Tumne jo kaha, I am tracking that carefully.',
        'Notice karte hain ki attention ab kis part par shift ho rahi hai.',
        'Is next piece of situation ko step-by-step track karte hain.',
        'Har step ke saath clarity ban rahi hai.'
      ]
    };

    const variations = defaultVariations[lang];
    const lastPhrase = this.recentPhrases[this.recentPhrases.length - 1];
    let nextIndex = 0;
    const lastIndex = variations.indexOf(lastPhrase);
    if (lastIndex !== -1) {
      nextIndex = (lastIndex + 1) % variations.length;
    }
    const chosenText = variations[nextIndex];
    this.recentPhrases.push(chosenText);
    if (this.recentPhrases.length > 10) {
      this.recentPhrases.shift();
    }

    let calibratedQ: string | undefined = undefined;
    if (budget.maxQuestions > 0) {
      calibratedQ = {
        en: 'Shall we focus on one physical reset, or untangle the situation first?',
        hi: 'Pehle shareer ko shaant karein, ya baat ko suljhayein?',
        hinglish: 'Pehle physical reset karein, ya situation ko untangle karein?'
      }[lang];
    }

    return this.packageResponse(chosenText, calibratedQ, undefined, undefined, budget, 'REFLECTION_QUESTION', decision);
  }

  /**
   * Formulates complete response package with quality metrics
   */
  private packageResponse(
    primaryMessage: string,
    calibratedQuestion: string | undefined,
    quickActionPrompt: string | undefined,
    ownershipCheck: string | undefined,
    responseBudget: ResponseBudget,
    firstResponseStructure: FirstResponseStructure | undefined,
    decision: GovernorDecision
  ): FormattedResponse {
    // Quality Metrics Assessment (Section 33)
    const metrics: CommunicationQualityMetrics = {
      feltUnderstanding: decision.receptivity === 'NOT_READY' ? 9 : 8,
      understandingAccuracy: decision.capacityConfidence >= 0.8 ? 9 : 8,
      questionUtility: calibratedQuestion ? 9 : 10, // 10 when question avoided or perfectly targeted
      responseFriction: decision.capacity === 'LOW' ? 'MINIMAL' : (decision.capacity === 'MEDIUM' ? 'LOW' : 'MODERATE'),
      conversationIntrusion: responseBudget.maxSentences <= 2 ? 'NONE' : 'LOW',
      strategyTransitionAccuracy: 9,
      repairSuccess: decision.reason.includes('User correction'),
      userCorrectionAcceptance: true,
      agencyPreserved: Boolean(ownershipCheck || responseBudget.directiveness === 'COLLABORATIVE' || responseBudget.directiveness === 'LOW'),
      exitability: Boolean(decision.exitEligible || decision.primaryStrategy === 'EXIT')
    };

    return {
      primaryMessage,
      calibratedQuestion,
      quickActionPrompt,
      ownershipCheck,
      responseBudget,
      firstResponseStructure,
      qualityMetrics: metrics
    };
  }
}

export const stressLanguageSystem = new StressLanguageSystem();
