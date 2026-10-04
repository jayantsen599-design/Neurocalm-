/**
 * NEUROCALM SAFETY GATEWAY (Stage 0)
 * Upstream Guardian: Evaluates all incoming input before intervention processing.
 * Strictly non-bypassable by Language Brain.
 */

import { SafetyAssessment } from '../types/neurocalm';

// Direct Crisis patterns (self-harm, suicide, severe violence, immediate medical emergency)
const DIRECT_CRISIS_PATTERNS = [
  /\b(kill myself|want to die|suicide|end my life|slit my wrist|take all my pills|end it all|can't go on living)\b/i,
  /\b(mar jana chahta|jaan dena|jeena nahi|khatam karna chahta|suicide karna|khud ko nuksan)\b/i,
  /\b(hurt others|kill them|violence|stab|poison)\b/i
];

// Indirect High-Risk Signals
const INDIRECT_CRISIS_PATTERNS = [
  /\b(better off without me|no reason to wake up|nobody would care if i died|want to disappear forever|giving away my things)\b/i,
  /\b(ab jeene ka koi matlab nahi|kisi ko meri zaroorat nahi hai|duniya se chala jau|sab khatam hone do)\b/i
];

// Ambiguous High-Risk Language
const AMBIGUOUS_HIGH_RISK_PATTERNS = [
  /\b(sab khatam karna hai|want everything to stop forever|cannot take this existence anymore)\b/i
];

// Explicit Safety Clarifications (De-escalation / Safe Recovery)
const SAFETY_CLARIFICATION_PATTERNS = [
  /\b(i am safe|not going to hurt myself|just venting|was just an expression|was just a metaphor|figurative|talking about (my job|work|code|game)|safe hu|sirf bol raha tha)\b/i,
  /\b(physically okay|not suicidal|calmed down now|i am alright physically)\b/i
];

// Reassurance-seeking phrases
const REASSURANCE_PATTERNS = [
  /\b(tell me again|are you sure|will everything be ok|promise me|please reassure me|am i going to be fine|say it one more time)\b/i,
  /\b(kya sab theek hoga|ek baar aur batao|pakka na|promise karo|mujhe darr lag raha hai dobara batao)\b/i,
  /\b(decide for me|what should i choose tell me exactly|tell me what to do)\b/i
];

// Human support requests
const HUMAN_SUPPORT_PATTERNS = [
  /\b(human support|talk to a human|talk to a real person|connect me to someone|need a counselor|doctor se baat|therapist)\b/i
];

export class SafetyGateway {
  private sessionReassuranceCount = 0;
  private readonly REASSURANCE_THRESHOLD = 3;
  private sessionRiskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRISIS' = 'NONE';
  private lastCrisisTurn = 0;
  private currentTurnIndex = 0;

  /**
   * Screen input check without mutating multi-turn session state.
   * Useful for stateless checks by AdaptiveGovernor, gates, and tests.
   */
  public screenInput(input: string): SafetyAssessment & { level: string } {
    const text = input.trim();
    for (const pattern of SAFETY_CLARIFICATION_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isSafe: true,
          riskLevel: 'LOW',
          flaggedKeywords: ['clarified_safe'],
          isReassuranceLoop: false,
          reassuranceCount: this.sessionReassuranceCount,
          level: 'LOW'
        };
      }
    }
    for (const pattern of DIRECT_CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        const assessment = this.generateCrisisAssessment([pattern.source]);
        return { ...assessment, level: 'CRISIS' };
      }
    }
    for (const pattern of INDIRECT_CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        const assessment = this.generateCrisisAssessment([pattern.source]);
        return { ...assessment, level: 'CRISIS' };
      }
    }
    for (const pattern of AMBIGUOUS_HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isSafe: false,
          riskLevel: 'HIGH',
          flaggedKeywords: [pattern.source],
          isReassuranceLoop: false,
          reassuranceCount: this.sessionReassuranceCount,
          referralDetails: this.getCrisisReferralDetails(),
          level: 'HIGH'
        };
      }
    }
    if (this.sessionRiskLevel === 'CRISIS') {
      const assessment = this.generateCrisisAssessment(['active_session_crisis_unresolved']);
      return { ...assessment, level: 'CRISIS' };
    }

    return {
      isSafe: true,
      riskLevel: 'NONE',
      flaggedKeywords: [],
      isReassuranceLoop: false,
      reassuranceCount: this.sessionReassuranceCount,
      level: 'NONE'
    };
  }

  /**
   * Evaluates text for safety concerns with stateful multi-turn tracking
   */
  public evaluateInput(input: string, priorReassuranceCount: number = 0): SafetyAssessment {
    const text = input.trim();
    this.currentTurnIndex += 1;
    this.sessionReassuranceCount = priorReassuranceCount;

    // 1. Check for Safe Recovery / Explicit Clarification
    for (const pattern of SAFETY_CLARIFICATION_PATTERNS) {
      if (pattern.test(text)) {
        this.sessionRiskLevel = 'NONE';
        return {
          isSafe: true,
          riskLevel: 'LOW',
          flaggedKeywords: ['clarified_safe'],
          isReassuranceLoop: false,
          reassuranceCount: this.sessionReassuranceCount
        };
      }
    }

    // 2. Direct High-Risk / Crisis
    for (const pattern of DIRECT_CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        this.sessionRiskLevel = 'CRISIS';
        this.lastCrisisTurn = this.currentTurnIndex;
        return this.generateCrisisAssessment([pattern.source]);
      }
    }

    // 3. Indirect High-Risk Signals
    for (const pattern of INDIRECT_CRISIS_PATTERNS) {
      if (pattern.test(text)) {
        this.sessionRiskLevel = 'CRISIS';
        this.lastCrisisTurn = this.currentTurnIndex;
        return this.generateCrisisAssessment([pattern.source]);
      }
    }

    // 4. Ambiguous High-Risk Language
    for (const pattern of AMBIGUOUS_HIGH_RISK_PATTERNS) {
      if (pattern.test(text)) {
        this.sessionRiskLevel = 'HIGH';
        return {
          isSafe: false,
          riskLevel: 'HIGH',
          flaggedKeywords: [pattern.source],
          isReassuranceLoop: false,
          reassuranceCount: this.sessionReassuranceCount,
          referralDetails: this.getCrisisReferralDetails()
        };
      }
    }

    // 5. Continuation attempt after unclarified Crisis (Section 5.G)
    // If user previously triggered CRISIS in this session and has not clarified safety,
    // prevent normal conversation continuation from bypassing the safety gate.
    if (this.sessionRiskLevel === 'CRISIS') {
      return this.generateCrisisAssessment(['active_session_crisis_unresolved']);
    }

    // 6. Check for Human Support Request (Non-crisis)
    for (const pattern of HUMAN_SUPPORT_PATTERNS) {
      if (pattern.test(text)) {
        return {
          isSafe: true,
          riskLevel: 'LOW',
          flaggedKeywords: ['human_support_requested'],
          isReassuranceLoop: false,
          reassuranceCount: this.sessionReassuranceCount,
          referralDetails: this.getCrisisReferralDetails()
        };
      }
    }

    // 7. Check for Reassurance Seeking loops
    for (const pattern of REASSURANCE_PATTERNS) {
      if (pattern.test(text)) {
        this.sessionReassuranceCount += 1;
        break;
      }
    }

    const isReassuranceLoop = this.sessionReassuranceCount >= this.REASSURANCE_THRESHOLD;

    return {
      isSafe: true,
      riskLevel: isReassuranceLoop ? 'MEDIUM' : 'NONE',
      flaggedKeywords: [],
      isReassuranceLoop,
      reassuranceCount: this.sessionReassuranceCount
    };
  }

  private generateCrisisAssessment(flagged: string[]): SafetyAssessment {
    return {
      isSafe: false,
      riskLevel: 'CRISIS',
      flaggedKeywords: flagged,
      isReassuranceLoop: false,
      reassuranceCount: this.sessionReassuranceCount,
      referralDetails: this.getCrisisReferralDetails()
    };
  }

  private getCrisisReferralDetails() {
    return {
      recommendedContact: 'Immediate crisis response / human support',
      helplines: [
        { region: 'India', name: 'Tele-MANAS (Govt 24/7)', number: '14416 / 1800-891-4416' },
        { region: 'India', name: 'Vandrevala Foundation', number: '+91 9999 666 555' },
        { region: 'US / Canada', name: 'Suicide & Crisis Lifeline', number: '988' },
        { region: 'UK', name: 'Samaritans', number: '116 123' },
        { region: 'Global / International', name: 'Befrienders Worldwide', number: 'https://www.befrienders.org' }
      ]
    };
  }

  public resetReassurance() {
    this.sessionReassuranceCount = 0;
  }

  /**
   * Resets session safety state so new independent sessions do NOT inherit stale crisis state (Section 5.I & 5.J)
   */
  public resetSession() {
    this.sessionReassuranceCount = 0;
    this.sessionRiskLevel = 'NONE';
    this.lastCrisisTurn = 0;
    this.currentTurnIndex = 0;
  }
}

export const safetyGateway = new SafetyGateway();
