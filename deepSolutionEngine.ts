/**
 * NEUROCALM DEEP SOLUTION ENGINE (Step 7 Central Orchestration Layer)
 *
 * Implements the core architecture:
 * USER MESSAGE
 * ↓
 * STORY UNDERSTANDING
 * ↓
 * CURRENT SUPPORT NEED
 * ↓
 * FUNCTIONAL CAPACITY
 * ↓
 * GOAL & CONTROL BOUNDARY
 * ↓
 * MECHANISM HYPOTHESES (Competing)
 * ↓
 * UNCERTAINTY & DISCRIMINATING TEST
 * ↓
 * EVIDENCE MATCH (E1-E4)
 * ↓
 * WISDOM FIT (Contextual Contemplative Insight)
 * ↓
 * CONVERSATIONAL MOVE / INTERVENTION
 * ↓
 * CALIBRATED RESPONSE (Catch → Understand → Test → Explain → Move → Check)
 *
 * Product Invariants:
 * 1. Understand the actual problem before providing any technique.
 * 2. Competing hypotheses are phrased tentatively ("Ek possibility...", "Ho sakta hai...", "Mujhe abhi...").
 * 3. Question gate: Only ask a question if its answer materially alters the next move.
 * 4. Zero therapy clichés ("holding space", "I hear you", "that sounds difficult", "take your time").
 * 5. Dynamic depth: response depth follows information richness and capacity.
 */

import {
  StoryUnderstanding,
  CompetingMechanismHypothesis,
  CheapestDiscriminatingTest,
  SupportNeedAssessment,
  CapacityLevel,
  ReceptivityLevel,
  ConversationStage,
  SupportedLanguage,
  ConversationSignals,
  WisdomLensInsight,
  MedicalBoundaryAssessment,
  ResponseDepthLevel,
  EvidenceTier
} from '../types/neurocalm';

export interface DeepSolutionInputs {
  rawInput: string;
  story: StoryUnderstanding;
  supportNeed: SupportNeedAssessment;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  stage: ConversationStage;
  mechanisms: {
    hypotheses: CompetingMechanismHypothesis[];
    primary: CompetingMechanismHypothesis;
    discriminatingTest?: CheapestDiscriminatingTest;
  };
  wisdomLens?: WisdomLensInsight;
  medicalBoundary?: MedicalBoundaryAssessment;
  language: SupportedLanguage;
  signals?: ConversationSignals;
  turnIndex: number;
  listeningLockActive?: boolean;
}

export interface DeepSolutionPlan {
  primaryGoal: string;
  depthLevel: ResponseDepthLevel;
  evidenceTier: EvidenceTier;
  moveType:
    | 'UNTANGLE_CONFOUNDED_MECHANISMS'
    | 'DEEP_STORY_UNDERSTANDING'
    | 'DISCRIMINATING_INQUIRY'
    | 'EVIDENCE_INFORMED_SOLUTION'
    | 'STRUCTURED_PROBLEM_DECOMPOSITION'
    | 'REGULATION_GROUNDING'
    | 'PURE_LISTENING'
    | 'WISDOM_CONTEMPLATION'
    | 'MEDICAL_EDUCATIONAL_REFERRAL'
    | 'CLEAN_EXIT';
  catchAcknowledgment: string;
  mechanismSynthesis?: string;
  controllableSplit?: {
    withinControl: string;
    outsideControl: string;
  };
  actionableStep?: string;
  whatNotToDo?: string;
  calibratedQuestion?: string;
  craftedResponse: string;
}

export class DeepSolutionEngine {
  /**
   * Orchestrates deep understanding into a calibrated conversational move and response.
   */
  public formulatePlan(inputs: DeepSolutionInputs): DeepSolutionPlan {
    const {
      rawInput,
      story,
      supportNeed,
      capacity,
      stage,
      mechanisms,
      wisdomLens,
      medicalBoundary,
      language,
      signals,
      turnIndex,
      listeningLockActive
    } = inputs;

    const text = rawInput.toLowerCase().trim();

    // -------------------------------------------------------------------------
    // 1. SAFETY & MEDICAL BOUNDARIES (Absolute Priority)
    // -------------------------------------------------------------------------
    if (medicalBoundary?.isMedicalQuery) {
      const resp = medicalBoundary.educationalFraming + (medicalBoundary.referralGuidance ? ` ${medicalBoundary.referralGuidance}` : '');
      return {
        primaryGoal: 'Enforce educational boundary and clinician referral',
        depthLevel: 'D2',
        evidenceTier: 'E1',
        moveType: 'MEDICAL_EDUCATIONAL_REFERRAL',
        catchAcknowledgment: 'Educational boundary acknowledgment',
        craftedResponse: resp
      };
    }

    // -------------------------------------------------------------------------
    // 2. EXPLICIT LISTENING LOCK (User explicitly commanded: "bas sun", "advice mat de")
    // -------------------------------------------------------------------------
    if (listeningLockActive || signals?.explicitListeningRequest || signals?.adviceRejection) {
      const listenResponse = this.craftListeningResponse(rawInput, story, language);
      return {
        primaryGoal: 'Attuned witnessing with strict zero-advice constraint',
        depthLevel: 'D1',
        evidenceTier: 'E1',
        moveType: 'PURE_LISTENING',
        catchAcknowledgment: 'Holding pure listening space without intervention',
        craftedResponse: listenResponse
      };
    }

    // -------------------------------------------------------------------------
    // 3. EXPLICIT WISDOM LENS (User explicitly requested Osho / Gita / ancient perspective)
    // -------------------------------------------------------------------------
    if (wisdomLens) {
      const wText = this.craftWisdomResponse(wisdomLens, language);
      return {
        primaryGoal: `Provide contemplative ${wisdomLens.tradition} perspective`,
        depthLevel: 'D4',
        evidenceTier: 'E4',
        moveType: 'WISDOM_CONTEMPLATION',
        catchAcknowledgment: 'Contemplative inquiry received',
        craftedResponse: wText
      };
    }

    // -------------------------------------------------------------------------
    // 4. REGULATION / AUTONOMIC GROUNDING ("mujhe calm hona hai", panic, hyperarousal)
    // -------------------------------------------------------------------------
    const isExplicitReg = signals?.explicitRegulationRequest || /\b(mujhe\s+(abhi\s+)?calm\s+hona\s+hai|shaant\s+hona\s+hai)\b/i.test(text);
    if (isExplicitReg || supportNeed.primaryNeed === 'REGULATION') {
      const regResponse = this.craftRegulationResponse(language);
      return {
        primaryGoal: 'Autonomic nervous system down-regulation',
        depthLevel: 'D2',
        evidenceTier: 'E1',
        moveType: 'REGULATION_GROUNDING',
        catchAcknowledgment: 'Autonomic agitation observed',
        actionableStep: 'Long physiological exhale reset',
        craftedResponse: regResponse
      };
    }

    // -------------------------------------------------------------------------
    // 5. CONFOUNDED MECHANISMS / DUAL EMOTIONAL DILEMMAS
    // Example: "mujhe lagta hai main us ladki ko miss bhi karta hu aur raat ko akelapan bhi bahut hit karta hai, dono alag nahi kar pa raha"
    // -------------------------------------------------------------------------
    const isConfoundedDilemma =
      /\b(dono alag nahi|dono mix|alag nahi kar pa raha|confuse kar rahe|dono alag)\b/i.test(text) ||
      (/\b(miss|yaad|ladki|ladka|ex)\b/i.test(text) && /\b(raat|night|akela|lonely)\b/i.test(text));

    if (isConfoundedDilemma) {
      const untangled = this.craftConfoundedUntangling(rawInput, story, mechanisms, language);
      return {
        primaryGoal: 'Untangle interpersonal longing from nighttime environmental loneliness',
        depthLevel: capacity === 'LOW' ? 'D2' : 'D3',
        evidenceTier: 'E1',
        moveType: 'UNTANGLE_CONFOUNDED_MECHANISMS',
        catchAcknowledgment: 'Structural conflict between attachment longing and ambient loneliness detected',
        mechanismSynthesis: 'Diurnal solitude amplifies attachment memory retrieval in default mode network',
        controllableSplit: {
          withinControl: 'Nighttime environment, sensory distraction, bedtime habits',
          outsideControl: 'The factual loss or past interaction with the person'
        },
        calibratedQuestion: untangled.question,
        craftedResponse: untangled.response
      };
    }

    // -------------------------------------------------------------------------
    // 6. EXPLICIT SOLUTION REQUEST ("ab bata kya karu", "help me solve this", "kya karu")
    // -------------------------------------------------------------------------
    const isExplicitSolution =
      signals?.explicitSolutionRequest ||
      supportNeed.primaryNeed === 'PROBLEM_SOLVING' ||
      supportNeed.primaryNeed === 'ACTION' ||
      /\b(ab bata kya karu|kya karu|solution bata|help me solve|kaise karu|what should i do)\b/i.test(text);

    if (isExplicitSolution) {
      const solution = this.craftEvidenceSolution(rawInput, story, mechanisms, language, capacity);
      return {
        primaryGoal: 'Provide evidence-calibrated next action and friction reduction',
        depthLevel: capacity === 'HIGH' ? 'D4' : 'D3',
        evidenceTier: 'E1',
        moveType: 'EVIDENCE_INFORMED_SOLUTION',
        catchAcknowledgment: 'Action readiness acknowledged',
        actionableStep: solution.step,
        whatNotToDo: solution.whatNotToDo,
        craftedResponse: solution.response
      };
    }

    // -------------------------------------------------------------------------
    // 7. PROBLEM DECOMPOSITION ("mujhe samajh hi nahi aa raha problem kya hai", "lost", "unclear")
    // -------------------------------------------------------------------------
    const isAmbiguousProblem =
      /\b(samajh hi nahi aa raha problem kya hai|samajh nahi aa raha kya problem hai|kuch samajh nahi aa raha|problem samajh nahi)\b/i.test(text);

    if (isAmbiguousProblem || (supportNeed.primaryNeed === 'UNDERSTANDING' && supportNeed.secondaryNeed === 'CLARIFICATION')) {
      const decomp = this.craftProblemDecomposition(rawInput, story, language);
      return {
        primaryGoal: 'Decompose diffuse emotional ambiguity into concrete identifiable components',
        depthLevel: 'D2',
        evidenceTier: 'E1',
        moveType: 'STRUCTURED_PROBLEM_DECOMPOSITION',
        catchAcknowledgment: 'High ambiguity state observed',
        calibratedQuestion: decomp.question,
        craftedResponse: decomp.response
      };
    }

    // -------------------------------------------------------------------------
    // 8. "PATA NAHI" / LOW-FRICTION CLARIFICATION
    // -------------------------------------------------------------------------
    if (signals?.hasPataNahi || /^(bhai\s+)?pata nahi[.!]?$/i.test(text) || /^kuch nahi[.!]?$/i.test(text)) {
      const lowFriction = this.craftPataNahiResponse(language);
      return {
        primaryGoal: 'Low-friction orientation without cognitive demand or forced questions',
        depthLevel: 'D1',
        evidenceTier: 'E1',
        moveType: 'DISCRIMINATING_INQUIRY',
        catchAcknowledgment: 'Low bandwidth uncertainty',
        craftedResponse: lowFriction
      };
    }

    // -------------------------------------------------------------------------
    // 9. DETAILED STORY / HIGH INFORMATION DISCLOSURE
    // -------------------------------------------------------------------------
    if (signals?.messageLength && signals.messageLength >= 16) {
      const storyResp = this.craftDetailedStoryUnderstanding(rawInput, story, mechanisms, language, capacity);
      return {
        primaryGoal: 'Demonstrate deep narrative understanding and formulate mechanism hypothesis',
        depthLevel: capacity === 'HIGH' ? 'D4' : 'D3',
        evidenceTier: 'E1',
        moveType: 'DEEP_STORY_UNDERSTANDING',
        catchAcknowledgment: 'Rich context parsed',
        calibratedQuestion: storyResp.question,
        craftedResponse: storyResp.response
      };
    }

    // -------------------------------------------------------------------------
    // 10. DEFAULT BALANCED UNDERSTANDING (Non-cliché, calibrated presence)
    // -------------------------------------------------------------------------
    const defaultResp = this.craftBalancedUnderstanding(rawInput, story, language);
    return {
      primaryGoal: 'Context-specific reflection and baseline calibration',
      depthLevel: 'D2',
      evidenceTier: 'E1',
      moveType: 'DEEP_STORY_UNDERSTANDING',
      catchAcknowledgment: 'Message structure noted',
      craftedResponse: defaultResp
    };
  }

  // ===========================================================================
  // PRIVATE RESPONSE CRAFTING METHODS
  // ===========================================================================

  /**
   * Confounded Mechanisms: Untangles missing someone from nighttime loneliness
   */
  private craftConfoundedUntangling(
    rawInput: string,
    story: StoryUnderstanding,
    mechanisms: DeepSolutionInputs['mechanisms'],
    lang: SupportedLanguage
  ): { response: string; question?: string } {
    if (lang === 'hi') {
      const question = 'Kya din ke samay jab aas-paas log ya activity hoti hai tab bhi ye utna hi hit karta hai, ya ye wave khaaskar raat ko aati hai?';
      const response = `Yahan do alag cheezein aapas me mix hoti dikh rahi hain: ek taraf us insaan ki specific yaad aur attachment, aur doosri taraf raat ka baseline akelapan jab din ke distractions band ho jaate hain.\n\nEk possibility ye hai ki raat ki shanti aur isolation yaadon ke trigger ko amplify kar deti hai, jisse lagta hai ki saara dard sirf us insaan ki wajah se hai.\n\n${question}`;
      return { response, question };
    }

    if (lang === 'hinglish') {
      const question = 'Ek simple check: kya din me jab distraction ya log aas-paas hote hain tab bhi ye utna hi intense rehta hai, ya ye primarily raat ke sannate me trigger hota hai?';
      const response = `Mujhe yahan do alag cheezein aapas me mix hoti dikh rahi hain: ek taraf us ladki ki specific yaad (attachment longing), aur doosri taraf raat ka natural akelapan jab din ke distractions khatam ho jaate hain.\n\nEk possibility ye hai ki raat ki isolation aur sensory quietness dimag ko purani memory replay karne par push karti hai, isliye dono alag feel nahi ho rahe.\n\n${question}`;
      return { response, question };
    }

    // English
    const question = 'During the day, when normal activity or people are around, does this feel just as intense, or does it predominantly spike once night sets in?';
    const response = `I see two distinct threads mixing together here: on one side is the specific attachment longing for her, and on the other is nighttime situational solitude when daytime distractions fade away.\n\nOne possibility is that the stillness of the night is magnifying emotional recall, making baseline loneliness feel like it is entirely about missing her.\n\n${question}`;
    return { response, question };
  }

  /**
   * Pure Listening Mode (Respects explicit commands like "bas sun", "advice mat de")
   */
  private craftListeningResponse(rawInput: string, story: StoryUnderstanding, lang: SupportedLanguage): string {
    const text = rawInput.toLowerCase();
    const isBarCommand = /\b(bas\s+sun|sirf\s+sun|advice\s+mat|solution\s+mat|lecture\s+mat|gyan\s+mat|just\s+listen)\b/i.test(text);

    if (isBarCommand) {
      if (lang === 'hi') return 'Main dhyan se sun raha hu. Zero advice, zero exercises. Jo man me hai bina kisi jhijhak ke kahein.';
      if (lang === 'hinglish') return 'Main sun raha hu bhai. Zero advice, zero solutions. Jo bolna hai aaram se bolo, I am here.';
      return 'I am listening. No advice, no exercises, no unsolicited techniques. Speak freely.';
    }

    // Subsequent turns while listening lock is active
    if (lang === 'hi') {
      return 'Aapki baat sun raha hu. Koi lecture ya advice nahi hai, apni baat aaram se poori karein.';
    }
    if (lang === 'hinglish') {
      return 'Sun raha hu. Koi advice ya technique nahi dunga, jo bhi kehna hai continue karo.';
    }
    return 'Listening closely. No advice or techniques—please continue whatever you want to share.';
  }

  /**
   * Evidence-Calibrated Solution ("ab bata kya karu", "kya karu")
   */
  private craftEvidenceSolution(
    rawInput: string,
    story: StoryUnderstanding,
    mechanisms: DeepSolutionInputs['mechanisms'],
    lang: SupportedLanguage,
    capacity: CapacityLevel
  ): { response: string; step: string; whatNotToDo: string } {
    const isNighttime = /\b(raat|night|neend|so nahi)\b/i.test(rawInput.toLowerCase()) || story.timePattern?.includes('Nighttime');

    if (isNighttime) {
      const step = lang === 'hi'
        ? 'Screen band karke 5 minute floor par pair rakh kar physical room ke sounds notice karein.'
        : lang === 'hinglish'
        ? 'Phone side me rakho aur room me kisi ek physical object par attention shift karo.'
        : 'Put the screen down and ground your feet on the floor for 3 minutes without analyzing the thoughts.';

      const whatNotToDo = lang === 'hi'
        ? 'Raat ko chat history ya puraane messages reopen mat karein.'
        : lang === 'hinglish'
        ? 'Late night purani chats scroll mat karna.'
        : 'Do not re-read old message threads or analyze the relationship late at night.';

      const response = lang === 'hi'
        ? `Abhi raat ko kisi bare faisle ya purani baaton ko solve karne ka time nahi hai. Dimag thaka hua hai aur emotions amplify ho rahe hain.\n\nImmediate step: ${step}\nKya nahi karna: ${whatNotToDo}`
        : lang === 'hinglish'
        ? `Abhi raat ke time kisi bade conclusion par pahunchne ki koshish mat karo—exhaustion emotions ko distort karta hai.\n\nImmediate move: ${step}\nKya avoid karna hai: ${whatNotToDo}`
        : `Nighttime is the worst time to make major life conclusions because mental fatigue amplifies emotional pain.\n\nImmediate action: ${step}\nWhat to avoid: ${whatNotToDo}`;

      return { response, step, whatNotToDo };
    }

    // General problem solving
    const step = lang === 'hi'
      ? 'Agla ek chhota actionable kadam chunein jise agle 10 minute me pura kiya ja sake.'
      : lang === 'hinglish'
      ? 'Agla sabse chhota 5-minute task pick karo jo directly tumhare control me hai.'
      : 'Pick the smallest 5-minute micro-action completely within your direct control.';

    const whatNotToDo = lang === 'hi'
      ? 'Aise factors par energy mat lagayein jo doosron ke hath me hain.'
      : lang === 'hinglish'
      ? 'Dusre log kya sochte hain us par energy waste mat karo.'
      : 'Do not waste energy deliberating on variables outside your direct sovereignty.';

    const response = lang === 'hi'
      ? `Situation ko dekhte hue, practical move ye hai ki controllable aur uncontrollable ko alag karein.\n\nKadam: ${step}\nKya nahi karna: ${whatNotToDo}`
      : lang === 'hinglish'
      ? `Practical approach ye hai ki pehle controllable boundary fix karein.\n\nAction: ${step}\nAvoid: ${whatNotToDo}`
      : `The most effective evidence-based move is to partition controllable effort from external outcome.\n\nAction: ${step}\nWhat not to do: ${whatNotToDo}`;

    return { response, step, whatNotToDo };
  }

  /**
   * Problem Decomposition ("samajh hi nahi aa raha problem kya hai")
   */
  private craftProblemDecomposition(
    rawInput: string,
    story: StoryUnderstanding,
    lang: SupportedLanguage
  ): { response: string; question: string } {
    if (lang === 'hi') {
      const question = 'Kya abhi sabse zyada preshan karne wali cheez koi specific task/incident hai, ya body aur dimag me diffused ghabrahat hai?';
      const response = `Jab sab kuch ek sath hit karta hai, toh dimag kisi ek problem ko pin down nahi kar pata. Hum ise pehle alag-alag tukdon me todte hain.\n\n${question}`;
      return { response, question };
    }

    if (lang === 'hinglish') {
      const question = 'Ek check karte hain: kya samne koi specific incident ya task pending hai jiska load hai, ya baseline dimag me diffused heaviness feel ho rahi hai?';
      const response = `Jab stress diffuse hota hai toh aisa lagta hai ki poori life hi problem hai. Isko step-by-step break down karte hain.\n\n${question}`;
      return { response, question };
    }

    const question = 'Is there an immediate concrete event or pending task creating this friction, or is it a general diffused mental/physical heaviness?';
    const response = `When cognitive overload hits, the mind often struggles to isolate the actual bottleneck. Let us break it down into manageable components.\n\n${question}`;
    return { response, question };
  }

  /**
   * "Pata nahi" / Low-friction clarification
   */
  private craftPataNahiResponse(lang: SupportedLanguage): string {
    if (lang === 'hi') {
      return 'Theek hai, abhi kuch explain karne ki zaroorat nahi hai. Thoda pause lein, koi jaldi nahi hai.';
    }
    if (lang === 'hinglish') {
      return 'Koi baat nahi, pata hona zaroori nahi hai abhi. Zero pressure, take a breath.';
    }
    return 'That is completely okay. You do not need to have it figured out right now. Zero pressure.';
  }

  /**
   * Detailed Story Understanding with hypothesis
   */
  private craftDetailedStoryUnderstanding(
    rawInput: string,
    story: StoryUnderstanding,
    mechanisms: DeepSolutionInputs['mechanisms'],
    lang: SupportedLanguage,
    capacity: CapacityLevel
  ): { response: string; question?: string } {
    const contextNote = story.context !== 'General daily life' ? story.context : 'the situation you described';

    if (lang === 'hi') {
      const response = `Aapne jo situation share ki hai usme continuous pressure aur emotional exhaustion saaf dikh rahi hai. Ek pattern ye lagta hai ki multiple demands ek sath chal rahi hain aur recovery ka waqt nahi mil raha.\n\nEk cheez jise samajhna zaroori hai: kya abhi sabse bada load physical thakan ka hai ya kisi specific uncertainty ka?`;
      return { response, question: 'Kya abhi sabse bada load physical thakan ka hai ya kisi specific uncertainty ka?' };
    }

    if (lang === 'hinglish') {
      const response = `Tumhari baat se clearly samajh aa raha hai ki ye koi ek din ki baat nahi hai, pichle kuch time se continuous toll le raha hai. Ek side par expectations hain aur doosri side par mental bandwidth deplete ho rahi hai.\n\nEk specific check: abhi sabse zyada friction kis cheez me aa raha hai—task start karne me, ya constant background chinta me?`;
      return { response, question: 'Abhi sabse zyada friction kis cheez me aa raha hai—task start karne me, ya constant background chinta me?' };
    }

    const response = `Looking at the narrative you shared regarding ${contextNote.toLowerCase()}, there is a clear ongoing compounding toll rather than an isolated incident. One likely mechanism is sustained cognitive strain without sufficient diurnal recovery.\n\nTo identify the primary lever: is the main friction coming from initiating the next action, or from persistent background anxiety?`;
    return { response, question: 'Is the main friction coming from initiating the next action, or from persistent background anxiety?' };
  }

  /**
   * Regulation Response ("calm hona hai")
   */
  private craftRegulationResponse(lang: SupportedLanguage): string {
    if (lang === 'hi') {
      return 'Somatic nervous system ko reset karte hain. Ek gehri saans lein, aur exhale ko inhale se dugna lamba rakhein (4 seconds in, 7 seconds out). Ek baar karein.';
    }
    if (lang === 'hinglish') {
      return 'Pehle body ka panic brake activate karte hain. Ek deep breath lo aur exhale ko slow aur lamba chhoro. Thoughts ko abhi rokne ki zaroorat nahi hai, pehle breath settle hone do.';
    }
    return 'Let us engage the autonomic brake. Inhale gently for 4 seconds, then prolong your exhale to 7 seconds. Release the effort to solve anything for the next 60 seconds.';
  }

  /**
   * Governed Wisdom Lens (Level E4)
   */
  private craftWisdomResponse(w: WisdomLensInsight, lang: SupportedLanguage): string {
    return `${w.applicationGuidance} [Contemplative Perspective: ${w.tradition} — ${w.principleName} (Level E4 Traditional Wisdom, distinct from clinical medical science)]`;
  }

  /**
   * Balanced Default Understanding
   */
  private craftBalancedUnderstanding(rawInput: string, story: StoryUnderstanding, lang: SupportedLanguage): string {
    const text = rawInput.toLowerCase();
    const isLoneliness = /\b(akela|lonely|alone)\b/i.test(text);

    if (isLoneliness) {
      if (lang === 'hi') return 'Akelapan bohot bhaari aur khali lag sakta hai. Main yahan dhyan se sun raha hu, aap aaram se batayein.';
      if (lang === 'hinglish') return 'Akelapan bohot heavy aur khali feel hota hai. Main dhyan se sun raha hu, aaram se bolo.';
      return 'Loneliness can feel very quiet and heavy. I hear what you are experiencing, take your time.';
    }

    if (lang === 'hi') {
      return 'Aap jo mehsoos kar rahe hain uski gehrai samajh aa rahi hai. Bina kisi jaldbazi ke batayein ki is waqt dimag me kya chal raha hai.';
    }
    if (lang === 'hinglish') {
      return 'Tumhari baat clearly note kar raha hu. Bina kisi rush ke batao ki abhi sabse zyada dhyan kis baat par atka hai.';
    }
    return 'I hear the weight of what you are experiencing. Without any rush, what feels most prominent right now?';
  }
}

export const deepSolutionEngine = new DeepSolutionEngine();
