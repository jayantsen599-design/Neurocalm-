/**
 * NEUROCALM TWO-BRAIN ARCHITECTURE: LANGUAGE BRAIN (Layer A)
 *
 * Responsible for:
 * - Natural language expression (English, Hindi, Hinglish)
 * - Concise, warm, respectful phrasing
 * - Zero motivational fluff or fake emotional intimacy
 *
 * CRITICAL INVARIANT:
 * The Language Brain CANNOT override the Intervention Brain or Safety Gateway.
 * If Intervention Brain signals NOT_READY, Language Brain strictly generates a low-pressure pause.
 * If Safety Gateway signals CRISIS, Language Brain strictly defers to safety protocol.
 */

import {
  Intervention,
  SupportedLanguage,
  CurrentState,
  CapacityLevel,
  ReceptivityLevel,
  OutcomeType,
  ProblemCategory
} from '../types/neurocalm';

export interface PromptContext {
  language: SupportedLanguage;
  problem: ProblemCategory;
  state: CurrentState;
  capacity: CapacityLevel;
  receptivity: ReceptivityLevel;
  intensity: number;
}

export class LanguageBrain {
  /**
   * Generates opening intake/reflection based on user's entry problem
   */
  public generateIntakeResponse(problem: ProblemCategory, lang: SupportedLanguage): string {
    const templates = {
      en: {
        acute_stress: 'Your body feels caught in high gear right now. Let us stabilize your baseline first.',
        overthinking: 'Your working memory is looping through open questions. Let us externalize this off your shoulders.',
        worry: 'Separating what is certain from what is imagined will bring immediate relief.',
        procrastination: 'The initiation friction feels overwhelming right now. We only need to touch the task for 120 seconds.',
        anger: 'Your autonomic system is spiked. Before words or decisions, let us apply a physiological pause.',
        rejection: 'Rejection hits your nervous system hard. An event happened, but it does not define your identity.',
        guilt: 'Replaying past mistakes changes nothing. Let us pivot this into one direct repair action.',
        urges: 'The craving feels urgent, but urges naturally decay in 10 minutes like a wave.',
        sleep_difficulty: 'Your mind is resisting rest because of lingering vigilance. Let us down-regulate quietly.',
        study_pressure: 'Syllabus backlog creates working-memory congestion. One focused micro-action first.',
        decision_overload: 'Too many competing variables. Let us partition facts from uncontrollable outcomes.'
      },
      hi: {
        acute_stress: 'Aapka shareer abhi stress mein hai. Pehle physical baseline ko shaant karte hain.',
        overthinking: 'Dimag mein ek hi baat ghoom rahi hai. Is bojh ko thoda halka karte hain.',
        worry: 'Jo sach hai aur jo darr hai, dono ko alag karke dekhenge toh clarity aayegi.',
        procrastination: 'Shuruat karne mein aalas ya darr lag raha hai. Sirf 2 minute ka step lenge.',
        anger: 'Gussa ekdam tez hai. Koi decision lene se pehle 90 second ka pause zaroori hai.',
        rejection: 'Rejection ka asar gehra hota hai. Lekin kisi ke mana karne se aapki value kam nahi hoti.',
        guilt: 'Baar-baar khud ko kosne se kuch nahi badlega. Isse ek concrete action mein badlein.',
        urges: 'Talab tez hai, lekin yeh ek lehar ki tarah 10 minute mein shaant ho jayegi.',
        sleep_difficulty: 'Dimag abhi soni nahi de raha. Thoda shanti se system ko relax hone dein.',
        study_pressure: 'Padhai ka load zyada hai. Ek chhota step pehle karein.',
        decision_overload: 'Zyada options se confuse ho rahe hain. Controllable baatein alag karte hain.'
      },
      hinglish: {
        acute_stress: 'Body abhi high alert par hai. Pehle autonomic baseline ko down-regulate karte hain.',
        overthinking: 'Working memory mein loop chal raha hai. Thoughts ko dimag se bahar nikalte hain.',
        worry: 'Facts aur assumptions ko alag karke dekhte hain, tab anxiety kam hogi.',
        procrastination: 'Start karne ka friction high hai. Sirf 120 seconds ke liye touch karenge.',
        anger: 'System hyperaroused hai. React karne se pehle ek quick physiological pause zaroori hai.',
        rejection: 'Rejection hurtful lagta hai, par ek event tumhari whole identity ko define nahi karta.',
        guilt: 'Past ko replay karne se koi fix nahi hoga. Is guilt ko 1 clear repair action mein badalte hain.',
        urges: 'Urge abhi peak par hai. Yeh 10 mins mein naturally subside ho jayegi.',
        sleep_difficulty: 'Late night overthinking nervous system ko wakeful rakhti hai. Let us down-regulate quietly.',
        study_pressure: 'Exam ya syllabus ka pressure working memory overload kar raha hai. 1 single micro-step lo.',
        decision_overload: 'Decision paralysis ho rahi hai. Jo tumhare control mein hai, use alag karo.'
      }
    };

    const dict = templates[lang] || templates.en;
    return (dict as any)[problem] || (templates.en as any)[problem] || 'Let us address the immediate bottleneck step-by-step.';
  }

  /**
   * Generates intervention instructions respecting language and receptivity
   */
  public formatInterventionText(
    intervention: Intervention,
    lang: SupportedLanguage,
    receptivity: ReceptivityLevel,
    isFallback: boolean
  ): { instruction: string; action: string } {
    // HARD GATE: If NOT_READY, LanguageBrain MUST NOT generate normal action
    if (receptivity === 'NOT_READY') {
      const pauseTexts = {
        en: {
          instruction: 'You indicated you are not ready for a solution right now. That is completely okay.',
          action: 'Put your screen aside, sit back, or pause here. No action is required.'
        },
        hi: {
          instruction: 'Aap abhi solution ke liye ready nahi hain. Yeh bilkul theek hai.',
          action: 'Screen side mein rakhein aur aaraam karein. Abhi kuch karne ki zaroorat nahi hai.'
        },
        hinglish: {
          instruction: 'Tum abhi intervention ke liye ready nahi ho, and that is totally fine.',
          action: 'Screen ko pause karo aur normal rest lo. Abhi koi task execute nahi karna.'
        }
      };
      return pauseTexts[lang] || pauseTexts.en;
    }

    if (isFallback) {
      return {
        instruction: intervention.instructions[lang] || intervention.instructions.en,
        action: intervention.actionableStep[lang] || intervention.actionableStep.en
      };
    }

    return {
      instruction: intervention.instructions[lang] || intervention.instructions.en,
      action: intervention.actionableStep[lang] || intervention.actionableStep.en
    };
  }

  /**
   * Generates exit message encouraging user to return to real life
   */
  public generateCleanExitMessage(outcome: OutcomeType, lang: SupportedLanguage): string {
    const exits = {
      en: {
        R0: 'Baseline stabilized. Step away from the screen and return to your day.',
        R1: 'Good execution. Take this momentum straight into your next activity.',
        R2: 'Skill logged for future recall. Return to real life.',
        R3: 'Transfer intention noted. You have the cue ready for the next time.',
        R4: 'Self-reliance is the goal. You handled this yourself; NeuroCalm is closing.',
        NO_CHANGE: 'Session closed. Sometimes a short walk or water is the most appropriate next step.',
        WORSE: 'Session halted. Prioritize rest or reach out to someone you trust.',
        WANT_HUMAN: 'Connecting with real people is a strength. We are closing NeuroCalm now.',
        PAUSED: 'Session paused. Return to your routine.'
      },
      hi: {
        R0: 'Aapki body relax ho gayi hai. Ab screen band karein aur apne din par lautein.',
        R1: 'Badhiya. Is momentum ke saath apna agla kaam shuru karein.',
        R2: 'Skill record ho gaya. Asli zindagi mein waapas jayein.',
        R3: 'Agli baar ke liye cue taiyar hai. All the best.',
        R4: 'Aapne khud handle kiya. Screen chhod kar life mein aage badhein.',
        NO_CHANGE: 'Session band ho raha hai. Thoda paani piyein aur break lein.',
        WORSE: 'Session yahin rokte hain. Aaraam karein ya kisi apne se baat karein.',
        WANT_HUMAN: 'Insano se baat karna sabse achha kadam hai. NeuroCalm close ho raha hai.',
        PAUSED: 'Session pause kar diya gaya hai.'
      },
      hinglish: {
        R0: 'System relax ho gaya. Screen off karo aur apne routine par return karo.',
        R1: 'Action complete. Ab is focus ko real task mein apply karo.',
        R2: 'Skill captured. AI par dwell mat karo, get back to life.',
        R3: 'Transfer intention saved. Real world mein is cue ko use karna.',
        R4: 'You did this yourself! NeuroCalm session exit ho raha hai.',
        NO_CHANGE: 'Session closed. Take a short walk or sip some water.',
        WORSE: 'Intervention stopped. Rest karo aur kisi trusted person se baat karo.',
        WANT_HUMAN: 'Real human support is best. Closing NeuroCalm now.',
        PAUSED: 'Session paused. Have a restful time.'
      }
    };

    const dict = exits[lang] || exits.en;
    return (dict as any)[outcome] || (exits.en as any)[outcome] || 'Session complete. Return to your day.';
  }
}

export const languageBrain = new LanguageBrain();
