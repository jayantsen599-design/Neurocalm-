/**
 * NEUROCALM GOVERNED WISDOM LENS (Section 12 Architecture)
 *
 * Traditions:
 * - Osho (Awareness without condemnation, witness consciousness, anti-guilt)
 * - Buddhist (Anicca/impermanence, non-attachment, suffering as resistance, mindful presence)
 * - Jain (Anekantavada/multi-perspective truth, aparigraha/non-possessiveness, non-violence of thought)
 * - Bhagavad Gita (Nishkama Karma/action without clinging to outcome, swadharma)
 * - Vedanta / Upanishads (Dichotomy of seer vs seen, drashta/sakshi, transcendent stillness)
 * - Yoga Sutras (Chitta vritti nirodha, abhyasa & vairagya)
 * - Sant Traditions (Kabir/Nanak: simplicity, inner stillness, acceptance)
 *
 * STRICT GOVERNANCE INVARIANTS:
 * 1. Traditional wisdom is strictly categorized as Evidence Level E4.
 * 2. It is NEVER presented as clinical, medical, or empirical neurobiology.
 * 3. Never forced into every turn.
 * 4. Never dumps generic quotes or imitates historical personalities.
 * 5. If user explicitly asks for a spiritual / philosophical / Osho perspective, this lens activates.
 * 6. If science (E1) and wisdom (E4) offer divergent angles, they remain distinct and are never blended into false certainty.
 */

import {
  WisdomLensInsight,
  WisdomLensTradition,
  CurrentState,
  ProblemCategory,
  UserReceptivityAssessment
} from '../types/neurocalm';

export interface WisdomQueryContext {
  rawInput: string;
  problem: ProblemCategory;
  state: CurrentState;
  receptivity: UserReceptivityAssessment;
  userExplicitRequest?: boolean;
}

export class WisdomLensEngine {
  /**
   * Detects if the user is explicitly requesting ancient/philosophical/spiritual perspectives
   */
  public detectExplicitWisdomRequest(text: string): { requested: boolean; tradition: WisdomLensTradition } {
    const lower = text.toLowerCase();

    if (/\b(osho|rajneesh)\b/i.test(lower)) {
      return { requested: true, tradition: 'OSHO' };
    }
    if (/\b(buddha|buddhist|buddhism|zen|vipassana|dhammapada)\b/i.test(lower)) {
      return { requested: true, tradition: 'BUDDHIST' };
    }
    if (/\b(gita|bhagavad gita|krishna|nishkam karma|karma yog)\b/i.test(lower)) {
      return { requested: true, tradition: 'BHAGAVAD_GITA' };
    }
    if (/\b(jain|mahavira|anekantavada|syadvada|aparigraha)\b/i.test(lower)) {
      return { requested: true, tradition: 'JAIN' };
    }
    if (/\b(vedanta|upanishad|advaita|non-duality|sakshi|drashta)\b/i.test(lower)) {
      return { requested: true, tradition: 'VEDANTA' };
    }
    if (/\b(yoga sutra|patanjali|vairagya|abhyasa)\b/i.test(lower)) {
      return { requested: true, tradition: 'YOGA' };
    }
    if (/\b(kabir|sant|gurunanak|saint|doha)\b/i.test(lower)) {
      return { requested: true, tradition: 'SANT' };
    }
    if (/\b(spiritual perspective|philosophical perspective|spiritual view|ancient wisdom|adhyatmik|philosophy kya bolti)\b/i.test(lower)) {
      return { requested: true, tradition: 'VEDANTA' };
    }

    return { requested: false, tradition: 'NONE' };
  }

  /**
   * Evaluates whether a wisdom lens is appropriate and selects a governed, calibrated insight.
   */
  public evaluate(context: WisdomQueryContext): WisdomLensInsight | undefined {
    const text = context.rawInput.toLowerCase();
    const explicit = this.detectExplicitWisdomRequest(text);

    // Rule 1: Explicit user request activates the Wisdom Lens directly
    if (explicit.requested) {
      return this.selectGovernedInsight(explicit.tradition, context.problem, true);
    }

    // Rule 2: If NOT explicitly requested:
    // Only activate for existential/meaning/guilt/attachment conflicts when receptivity is not NOT_READY
    if (context.receptivity.receptivity === 'NOT_READY' || context.receptivity.explicitRefusalOfAdvice) {
      return undefined;
    }

    // Only apply in genuine philosophical fit contexts (attachment, guilt, loss of control, social pain)
    if (context.problem === 'attachment' || /\b(chhoot nahi raha|attach|clinging|possession)\b/i.test(text)) {
      return this.selectGovernedInsight('BUDDHIST', context.problem, false);
    }

    if (context.problem === 'guilt' || context.problem === 'self_criticism' || /\b(apne aap se nafrat|guilt ho raha|pachtawa)\b/i.test(text)) {
      return this.selectGovernedInsight('OSHO', context.problem, false);
    }

    if (context.problem === 'decision_overload' || /\b(fal ki chinta|result kya hoga|outcome)\b/i.test(text)) {
      return this.selectGovernedInsight('BHAGAVAD_GITA', context.problem, false);
    }

    if (context.problem === 'conflict' || /\b(wo galat hai main sahi|rigid|ek hi point of view)\b/i.test(text)) {
      return this.selectGovernedInsight('JAIN', context.problem, false);
    }

    return undefined;
  }

  private selectGovernedInsight(
    tradition: WisdomLensTradition,
    problem: ProblemCategory,
    explicitlyRequested: boolean
  ): WisdomLensInsight {
    switch (tradition) {
      case 'OSHO':
        return {
          tradition: 'OSHO',
          principleName: 'Witnessing (Sakshi) & Non-Condemnation',
          insightSummary: 'Watching thoughts and feelings as passing weather without fighting or condemning oneself for having them.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Contemporary Indian contemplative commentary',
          applicationGuidance: 'Observe internal turbulence from the position of an uninvolved witness; stop fueling the conflict by fighting it.',
          attributionNote: 'Contemplative perspective from modern existential-contemplative traditions (Osho). Distinct from clinical therapy.'
        };

      case 'BUDDHIST':
        return {
          tradition: 'BUDDHIST',
          principleName: 'Anicca (Impermanence) & Dukkha as Resistance',
          insightSummary: 'Suffering increases when we demand that fluid, changing realities remain permanently static or controllable.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Early Buddhist psychology & Vipassana tradition',
          applicationGuidance: 'Recognize that sensations and worries rise, crest, and dissolve on their own if not held tightly.',
          attributionNote: 'Buddhist philosophical inquiry. Distinct from clinical protocols.'
        };

      case 'BHAGAVAD_GITA':
        return {
          tradition: 'BHAGAVAD_GITA',
          principleName: 'Nishkama Karma (Right Action without Clinging to Result)',
          insightSummary: 'You have jurisdiction over your current effort, never absolute sovereignty over the fruit or future outcome.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Classical Indian philosophical literature (Bhagavad Gita 2.47)',
          applicationGuidance: 'Focus entirely on the integrity of the next micro-step; release the emotional burden of forecasting the distant verdict.',
          attributionNote: 'Philosophical lens from classical Indian thought. Practical cognitive boundary, Distinct from medical science and not a clinical guarantee.'
        };

      case 'JAIN':
        return {
          tradition: 'JAIN',
          principleName: 'Anekantavada (Multi-Faceted Nature of Truth) & Aparigraha',
          insightSummary: 'No single perception captures reality in its entirety; releasing rigid cognitive grasping softens interpersonal friction.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Jain epistemological tradition',
          applicationGuidance: 'Hold current assumptions with humility; recognize that an impasse often dissolves when we permit alternative viewpoints.',
          attributionNote: 'Jain contemplative philosophy. Contemplative heuristic, separate from empirical science.'
        };

      case 'VEDANTA':
      case 'UPANISHADIC':
        return {
          tradition: 'VEDANTA',
          principleName: 'Drashta (The Perceiver is Not the Perceived)',
          insightSummary: 'You are the conscious space in which anxiety and thoughts arise, not the thoughts themselves.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Classical Upanishadic & Advaita philosophy',
          applicationGuidance: 'Create a micro-distance between the conscious self and the temporary mental chatter.',
          attributionNote: 'Classical Vedantic contemplative tradition. Level E4 traditional wisdom.'
        };

      case 'YOGA':
        return {
          tradition: 'YOGA',
          principleName: 'Abhyasa & Vairagya (Steadfast Practice with Detached Equanimity)',
          insightSummary: 'Internal balance comes from steady small efforts paired with letting go of frantic grasping.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Patanjali Yoga Sutras',
          applicationGuidance: 'Take one grounded action today without the emotional agitation of demanding instant resolution.',
          attributionNote: 'Classical Yoga philosophy. Level E4 traditional insight.'
        };

      case 'SANT':
      default:
        return {
          tradition: 'SANT',
          principleName: 'Sahajta (Natural Simplicity and Grounded Acceptance)',
          insightSummary: 'Rushing to force mental stillness creates more waves. The quiet settles naturally when excessive meddling stops.',
          evidenceLevel: 'E4',
          isDistinctFromMedicalScience: true,
          culturalContext: 'Indian Sant traditions (Kabir)',
          applicationGuidance: 'Allow the present moment to settle without forcing synthetic solutions.',
          attributionNote: 'Sant tradition contemplative literature. Level E4 traditional insight.'
        };
    }
  }
}

export const wisdomLensEngine = new WisdomLensEngine();
