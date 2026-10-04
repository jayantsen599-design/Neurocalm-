/**
 * NEUROCALM CONVERSATION SIGNALS PROCESSOR
 *
 * Extracts observable message/language evidence from user utterances.
 * These are NOT diagnoses, NOT personality traits, NOT clinical labels.
 * They are conversation-state evidence only.
 */

import { ConversationSignals, ConversationTurnAnalysis } from '../types/neurocalm';

export class ConversationSignalsProcessor {
  /**
   * Primary Signal Extraction Entry Point
   */
  public extractSignals(
    rawInput: string,
    turnHistory: ConversationTurnAnalysis[] = []
  ): ConversationSignals {
    const raw = rawInput.trim();
    const text = raw.toLowerCase();
    const words = raw.length > 0 ? raw.split(/\s+/).filter(Boolean) : [];
    const messageLength = words.length;
    const characterCount = raw.length;

    // 1. Fragmentation: very short, trailing ellipsis, broken words
    const hasEllipsis = /\.{2,}|…/.test(raw);
    const isVeryShort = messageLength <= 4;
    const isBrokenPhrase = isVeryShort && (hasEllipsis || /^(kuch|nahi|pata|chhod|bas|aur)\s*$/i.test(text));
    const fragmentation = isBrokenPhrase || (messageLength <= 3 && /\b(nahi|kyu|kya|pata|ruk)\b/i.test(text));

    // 2. Sudden Length Change relative to previous turn
    let suddenLengthChange: 'SHORTENED' | 'LENGTHENED' | 'STABLE' = 'STABLE';
    if (turnHistory.length > 0) {
      const prevLength = turnHistory[turnHistory.length - 1].userMessage.trim().split(/\s+/).length;
      if (prevLength >= 12 && messageLength <= 4) {
        suddenLengthChange = 'SHORTENED';
      } else if (prevLength <= 4 && messageLength >= 15) {
        suddenLengthChange = 'LENGTHENED';
      }
    }

    // 3. Repeated Words (e.g. "baar baar", "check check", "nahi nahi")
    const wordCounts: Record<string, number> = {};
    for (const w of words) {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/gi, '');
      if (clean.length >= 2) {
        wordCounts[clean] = (wordCounts[clean] || 0) + 1;
      }
    }
    const repeatedWords = Object.keys(wordCounts).filter(k => wordCounts[k] >= 2);

    // 4. Repeated Questions
    const questionMarkCount = (raw.match(/\?/g) || []).length;
    const questionWordsCount = (text.match(/\b(kya|kyu|kaise|kaha|kab|what|why|how|where|when|who)\b/gi) || []).length;
    const repeatedQuestions = questionMarkCount >= 2 || (questionMarkCount >= 1 && questionWordsCount >= 2);

    // 5. "Pata Nahi" / Uncertainty
    const hasPataNahi = /\b(pata nahi|don't know|dont know|samajh nahi aa raha|kuch samajh nahi aa raha|no clue|no idea)\b/i.test(text);

    // 6. "Kuch Nahi" / Withdrawal
    const hasKuchNahi = /\b(kuch nahi|kuch ni|nothing|chhod|rehne de|rehne do|leave it|never mind)\b/i.test(text);
    const hasChhodRehneDe = /\b(chhod|rehne de|rehne do|leave it|chodo|let it be)\b/i.test(text);

    // 7. Advice Rejection & Explicit Listening Requests
    const adviceRejection = /\b((advice|solution|suggestion|gyan|lecture|mashwara|raay)\s*(mat|nahi|don't)\s*(dena|do|de|dein|dijiye)?|(don't|do not|no)\s+(give|offer|need|want)?\s*(any\s+)?(advice|solution|suggestions|lecture)|kuch\s+mat\s+(batao|samjhao|sikhao)|chup\s+raho)\b/i.test(text);

    const explicitListeningRequest = /\b(b[as]+\s+sun[a-z]*|sirf\s+sun[a-z]*|mujhe\s+(bas|sirf)\s*(bolna|kehna|vent|batana|baat karni)\s*(hai|h)?|just\s+listen|only\s+listen|listen\s+to\s+me|vent\s+karna|sun\s+le|koi\s+sunne\s+wala)\b/i.test(text);

    // 8. Explicit Solution & Regulation Requests
    const explicitSolutionRequest = /\b(bata\s+kya\s+karu|kya\s+karu|kaise\s+karu|solution\s+do|advice\s+do|what\s+should\s+i\s+do|tell\s+me\s+what\s+to\s+do|kya\s+karna\s+chahiye|steps\s+do|kaise\s+solve\s+karu|help\s+me\s+solve)\b/i.test(text);

    const explicitRegulationRequest = /\b(mujhe\s+(abhi\s+)?calm\s+hona\s+hai|calm\s+down\s+karna\s+hai|shaant\s+hona\s+hai|help\s+me\s+breathe|calm\s+me\s+down|breathe\s+karna\s+hai)\b/i.test(text);

    // 9. Urgency
    let urgency: 'NONE' | 'LOW' | 'HIGH' = 'NONE';
    if (/\b(emergency|right now|turant|jaldi|can't breathe|dying|fast)\b/i.test(text)) {
      urgency = 'HIGH';
    } else if (/\b(jaldi se|quick|asap)\b/i.test(text)) {
      urgency = 'LOW';
    }

    // 10. Uncertainty Language
    const uncertaintyLanguage = hasPataNahi || /\b(maybe|shayad|lag raha hai|doubt|confused|unclear|lost|kya karu)\b/i.test(text);

    // 11. Contradiction / Correction of AI
    const contradictionOrCorrection =
      /^(nahi|no|not)[,\s]/i.test(text) ||
      /\b(tu\s+samajh\s+nahi\s+raha|galat\s+samjhe|you\s+misunderstood|not\s+what\s+i\s+meant|aisa\s+nahi\s+hai|maine\s+ye\s+nahi\s+bola|gussa\s+nahi|not\s+angry|padhai\s+nahi)\b/i.test(text);

    // 12. Topic Switching
    const topicSwitching = /\b(chhod|leave that|dusri baat|dusra topic|anyway|kuch aur)\b/i.test(text);

    // 13. Language & Code-Switching
    const hindiWords = (text.match(/\b(bhai|yaar|hai|hu|humein|mera|meri|mujhe|kya|kyu|kaise|kar|raha|rahi|dimag|baat|nahi|bohot|boht|yrr)\b/gi) || []).length;
    const englishWords = (text.match(/\b(the|is|am|are|feel|feeling|think|overthinking|stress|help|just|listen|advice|what|why|how)\b/gi) || []).length;
    let languageRegister: 'en' | 'hi' | 'hinglish' = 'en';
    let codeSwitchDetected = false;
    if (hindiWords > 0 && englishWords > 0) {
      languageRegister = 'hinglish';
      codeSwitchDetected = true;
    } else if (hindiWords > 0) {
      languageRegister = 'hi';
    } else {
      languageRegister = 'en';
    }

    // 14. Emotional vs Analytical
    const emotionalHits = (text.match(/\b(feel|feelin|akela|lonely|sad|dukh|dard|hurt|dar|scared|gussa|angry|crying|rona|phat raha|heavy)\b/gi) || []).length;
    const analyticalHits = (text.match(/\b(decision|options|choose|process|plan|work|task|project|code|steps|analysis|priority)\b/gi) || []).length;
    let emotionalVsAnalytical: 'EMOTIONAL' | 'ANALYTICAL' | 'BALANCED' = 'BALANCED';
    if (emotionalHits > analyticalHits) emotionalVsAnalytical = 'EMOTIONAL';
    else if (analyticalHits > emotionalHits) emotionalVsAnalytical = 'ANALYTICAL';

    // 15. Detail Density
    let detailDensity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';
    if (messageLength <= 4) detailDensity = 'LOW';
    else if (messageLength >= 18) detailDensity = 'HIGH';

    // 16. Withdrawal signals
    const withdrawalSignals = hasKuchNahi || hasChhodRehneDe || /\b(chup raho|rehne do|kuch mat bolo|leave me alone)\b/i.test(text);

    return {
      messageLength,
      characterCount,
      fragmentation,
      suddenLengthChange,
      repeatedWords,
      repeatedQuestions,
      hasPataNahi,
      hasKuchNahi,
      hasChhodRehneDe,
      adviceRejection,
      explicitListeningRequest,
      explicitSolutionRequest,
      explicitRegulationRequest,
      urgency,
      uncertaintyLanguage,
      contradictionOrCorrection,
      topicSwitching,
      languageRegister,
      codeSwitchDetected,
      emotionalVsAnalytical,
      questionDensity: questionMarkCount + questionWordsCount,
      detailDensity,
      withdrawalSignals,
      confidence: 0.9
    };
  }
}

export const conversationSignalsProcessor = new ConversationSignalsProcessor();
