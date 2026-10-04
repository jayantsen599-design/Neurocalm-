/**
 * NEUROCALM CALIBRATED INTERVENTION LIBRARY
 * Compact, verified interventions with strictly audited evidence governance.
 * Functional mechanism labels; deterministic classification.
 */

import { Intervention } from '../types/neurocalm';

export const CALIBRATED_INTERVENTIONS: Intervention[] = [
  {
    id: 'autonomic_breath_brake',
    name: 'Autonomic Breath Brake (Cyclic Sigh)',
    targetMechanism: 'physiological_hyperarousal',
    primaryProblems: ['acute_stress', 'anger', 'sleep_difficulty', 'overload'],
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Controlled breathwork with prolonged exhalation shows empirical down-regulation of autonomic arousal (Balban et al., Cell Reports Medicine, 2023).',
      isEmpirical: true
    },
    baseScore: 85,
    suitableStates: ['hyperaroused', 'elevated_stress', 'overloaded'],
    minCapacity: 'LOW',
    instructions: {
      en: 'Take two quick inhales through your nose (one deep, one short top-up), then release a slow, unforced exhalation through your mouth.',
      hi: 'Naak se do baar saans lein (pehle gehri, fir thodi aur), aur munh se dheere se poori saans chhod dein.',
      hinglish: 'Nose se double inhale lo (pehle deep, fir chhota top-up), fir mouth se slow exhalation chhod do.'
    },
    actionableStep: {
      en: 'Do 3 cycles right now. Inhale, top-up inhale, long slow exhale.',
      hi: 'Abhi sirf 3 baar karein: saans lein, thoda aur lein, aur dheere se chhod dein.',
      hinglish: 'Abhi 3 cycles karo: Inhale, top-up inhale, long slow release.'
    },
    durationSeconds: 45,
    cognitiveLoad: 'MINIMAL',
    isPassiveOk: true
  },
  {
    id: 'controllable_split',
    name: 'Controllable / Uncontrollable Split',
    targetMechanism: 'uncertainty_loop',
    primaryProblems: ['worry', 'uncertainty', 'decision_overload', 'difficult_choices'],
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Cognitive boundary partitioning reduces rumination by separating actionable agency from uncontrollable probabilistic outcomes.',
      isEmpirical: false
    },
    baseScore: 82,
    suitableStates: ['baseline', 'elevated_stress', 'moderate_capacity', 'high_capacity'],
    minCapacity: 'MEDIUM',
    instructions: {
      en: 'Draw an imaginary line between what is 100% in your physical control right now vs what depends on the world, the future, or others.',
      hi: 'Dhyan dein ki kaun si cheez 100% aapke haath mein hai, aur kaun si cheez doosron ya future par depend karti hai.',
      hinglish: 'Decide karo: Kaunsi cheez 100% tumhare control mein hai aur kaunsi cheez outside world ya future par.'
    },
    actionableStep: {
      en: 'Name ONE physical action you can do in the next 10 minutes for what is controllable.',
      hi: 'Jo aapke control mein hai, uske liye agle 10 minute mein ek chhota kaam chunein.',
      hinglish: 'Jo controllable hai, uske liye next 10 mins ka ek concrete physical action likho.'
    },
    durationSeconds: 90,
    cognitiveLoad: 'MODERATE',
    isPassiveOk: false
  },
  {
    id: 'working_memory_offload',
    name: '2-Minute Working Memory Offload',
    targetMechanism: 'working_memory_overload',
    primaryProblems: ['overthinking', 'overload', 'study_pressure', 'career_pressure'],
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Externalizing active cognitive loops onto physical medium relieves working memory bottleneck and decreases looping intrusive thoughts.',
      isEmpirical: false
    },
    baseScore: 84,
    suitableStates: ['overloaded', 'elevated_stress', 'moderate_capacity'],
    minCapacity: 'MEDIUM',
    instructions: {
      en: 'Stop keeping thoughts in active memory. Write every single open loop onto paper or screen without organizing or filtering.',
      hi: 'Dimag par bojh mat rakhein. Jo bhi thoughts chal rahe hain, bina filter kiye kagaz par utaar dein.',
      hinglish: 'Dimag ko hard-drive mat banao. Jo bhi pending hai, 2 minute mein bina organize kiye write down karo.'
    },
    actionableStep: {
      en: 'Jot down 3 raw bullet points of what is spinning in your head right now.',
      hi: 'Abhi sirf 3 baatein likhein jo aapke dimag mein ghoom rahi hain.',
      hinglish: 'Sirf 3 raw bullets note down karo jo abhi dimag mein ghoom rahe hain.'
    },
    durationSeconds: 120,
    cognitiveLoad: 'LOW',
    isPassiveOk: false
  },
  {
    id: 'urge_surfing_delay',
    name: '10-Minute Urge Wave Delay',
    targetMechanism: 'urge_response_coupling',
    primaryProblems: ['urges', 'habits', 'checking_loops', 'reassurance_loops'],
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Marlatt urge-surfing methodology: observing craving intensity peak and decay uncouples automatic stimulus-response behavior.',
      isEmpirical: true
    },
    baseScore: 80,
    suitableStates: ['elevated_stress', 'moderate_capacity', 'baseline'],
    minCapacity: 'MEDIUM',
    instructions: {
      en: 'An urge is a wave that peaks and naturally dissolves in 7-10 minutes. You do not need to fight it; simply defer acting for 10 minutes.',
      hi: 'Talab ya aadat ek lehar ki tarah hoti hai jo 10 minute mein shaant hoti hai. Ladna nahi hai, bas 10 minute ke liye action delay karein.',
      hinglish: 'Urge ek wave hai jo 10 min mein peak ho kar subside hoti hai. Fight mat karo, sirf action ko 10 min defer karo.'
    },
    actionableStep: {
      en: 'Set a 10-minute mental clock. Notice the physical sensation in your body without opening the app or taking the action.',
      hi: '10 minute ka timer sochein. Bina action liye sirf body mein us sensation ko mehsoos karein.',
      hinglish: '10 minute ka pause lo. Bina app open kiye ya action liye sirf impulse ko observe karo.'
    },
    durationSeconds: 60,
    cognitiveLoad: 'LOW',
    isPassiveOk: true
  },
  {
    id: 'micro_friction_starter',
    name: 'Micro-Friction 2-Minute Starter',
    targetMechanism: 'initiation_friction',
    primaryProblems: ['procrastination', 'avoidance', 'motivation_problems', 'boredom'],
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Reducing task initiation barrier to negligible cognitive load triggers behavioral momentum and overcomes initial dopamine aversion.',
      isEmpirical: false
    },
    baseScore: 83,
    suitableStates: ['baseline', 'low_capacity', 'moderate_capacity', 'depleted'],
    minCapacity: 'LOW',
    instructions: {
      en: 'Do not attempt to finish the whole task. Shrink the requirement down to just opening the file, book, or standing up for 120 seconds.',
      hi: 'Poora kaam karne ki zaroorat nahi hai. Sirf 2 minute ke liye book ya file open karein, ya khade ho jayein.',
      hinglish: 'Poora task complete karne ka pressure mat lo. Sirf 120 seconds ke liye initial file ya screen kholo.'
    },
    actionableStep: {
      en: 'Commit to touching the task for exactly 2 minutes. When 2 minutes are up, you are free to stop.',
      hi: 'Sirf 2 minute ka vaada karein. 2 minute ke baad aap rukne ke liye azaad hain.',
      hinglish: 'Sirf 2 minute touch karo. 2 minute ke baad chaho toh stop kar sakte ho.'
    },
    durationSeconds: 60,
    cognitiveLoad: 'MINIMAL',
    isPassiveOk: false
  },
  {
    id: 'identity_event_decoupling',
    name: 'Sakshi / Identity-Event Decoupling',
    targetMechanism: 'identity_event_fusion',
    primaryProblems: ['rejection', 'shame', 'self_criticism', 'failure', 'setback'],
    evidence: {
      category: 'TRADITIONAL_CLAIM',
      sourceNote: 'Contemplative awareness principle (Sakshi / Witnessing found in Upanishadic & Eastern traditions): separating the observing awareness from the observed temporary event.',
      isEmpirical: false
    },
    baseScore: 78,
    suitableStates: ['elevated_stress', 'depleted', 'moderate_capacity'],
    minCapacity: 'LOW',
    instructions: {
      en: 'An event happened; that is external data. Your identity is the awareness observing it, not the label attached by the outcome.',
      hi: 'Ek ghatna ghati hai; woh sirf ek event hai. Aap us ghatna ko dekhne wale sakshi hain, galti ya rejection aapki pehchan nahi hai.',
      hinglish: 'Ek event hua hai—woh outcome hai, tum nahi. You are the observer, not the failure.'
    },
    actionableStep: {
      en: 'Replace "I am a failure" with "I experienced a setback in this specific attempt."',
      hi: 'Khud se kahein: "Main bura nahi hoon, is baar result meri marzi ka nahi aaya."',
      hinglish: 'Statement change karo: "I am a failure" ki jagah "This specific event did not work out."'
    },
    durationSeconds: 60,
    cognitiveLoad: 'LOW',
    isPassiveOk: true
  },
  {
    id: 'actionable_repair_pivot',
    name: 'Actionable Guilt / Repair Pivot',
    targetMechanism: 'rumination_cascade',
    primaryProblems: ['guilt', 'conflict', 'social_pain', 'communication_problems'],
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Directing guilty rumination toward restorative pro-social action dissolves inward toxic punishment loops into outward resolution.',
      isEmpirical: false
    },
    baseScore: 77,
    suitableStates: ['elevated_stress', 'moderate_capacity', 'high_capacity'],
    minCapacity: 'MEDIUM',
    instructions: {
      en: 'Ruminating over an error repairs nothing. Guilt only has functional value if converted into a clean apology, restitution, or change.',
      hi: 'Baar-baar khud ko kosne se kuch theek nahi hota. Pachtawe ko ek saaf maafi ya sudhaar ke kadam mein badlein.',
      hinglish: 'Self-blame loop kisi ko help nahi karta. Is guilt ko ek clear apology ya concrete corrective action mein convert karo.'
    },
    actionableStep: {
      en: 'Draft a simple, non-defensive 1-sentence apology or fix, or state what you will do differently next time.',
      hi: 'Bina safaai diye 1 line ki sachhi maafi ya corrective action sochein.',
      hinglish: 'Ek non-defensive 1-line apology ya next step formulate karo.'
    },
    durationSeconds: 90,
    cognitiveLoad: 'MODERATE',
    isPassiveOk: false
  },
  {
    id: 'thermal_distance_pause',
    name: 'Thermal Distance Reset (Sensory Shift)',
    targetMechanism: 'physiological_hyperarousal',
    primaryProblems: ['anger', 'acute_stress', 'conflict', 'loss_of_control'],
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Trigeminal cold stimulation (mammalian dive reflex activation) produces rapid reduction in heart rate and sympathetic surge.',
      isEmpirical: true
    },
    baseScore: 82,
    suitableStates: ['hyperaroused', 'elevated_stress'],
    minCapacity: 'LOW',
    instructions: {
      en: 'Do not respond to the person or trigger for 90 seconds. Go splash cold water onto your face and temples or hold a cold object.',
      hi: 'Agla 90 second koi reply mat karein. Chehre par thande paani ke chheente maarein ya cold water bottle ko chuyein.',
      hinglish: '90 seconds ke liye text/talk pause karo. Apne face par thanda paani splash karo.'
    },
    actionableStep: {
      en: 'Step away from the screen or room and splash cold water on your eyes and forehead.',
      hi: 'Screen se door hatein aur aankhon par thande paani ke 3 chheente maarein.',
      hinglish: 'Screen se dur hato aur 3 baar cold water face par dalo.'
    },
    durationSeconds: 60,
    cognitiveLoad: 'MINIMAL',
    isPassiveOk: true
  },
  {
    id: 'sensory_depletion_reset',
    name: 'Sensory Depletion Reset (Zero-Input Rest)',
    targetMechanism: 'cognitive_overload',
    primaryProblems: ['exhaustion', 'low_capacity', 'overload', 'burnout' as any],
    evidence: {
      category: 'PRODUCT_HYPOTHESIS',
      sourceNote: 'NeuroCalm product heuristic: when capacity is depleted, removing ambient sensory input for 3 minutes allows cognitive recovery without effortful processing.',
      isEmpirical: false
    },
    baseScore: 75,
    suitableStates: ['depleted', 'low_capacity'],
    minCapacity: 'LOW',
    instructions: {
      en: 'Your nervous system is saturated. Do not try to solve anything or reflect right now. Close your eyes, dim screens, and lean back for 3 minutes.',
      hi: 'Aapki energy depleted hai. Kuch solve karne ki koshish mat karein. Aankhein band karein aur 3 minute bilkul shaant baithein.',
      hinglish: 'Tumhara system drain ho chuka hai. Abhi kuch fix mat karo. Screen band karo aur 3 minutes ke liye eyes close karke baith jao.'
    },
    actionableStep: {
      en: 'Put your phone face-down and close your eyes for 3 minutes. Zero input.',
      hi: 'Phone ulti taraf rakhein aur 3 minute aankhein band karke aaram karein.',
      hinglish: 'Phone side mein rakho aur 3 minutes ke liye zero-input pause lo.'
    },
    durationSeconds: 180,
    cognitiveLoad: 'MINIMAL',
    isPassiveOk: true
  }
];

export const SAFE_FALLBACK_INTERVENTION: Intervention = {
  id: 'safe_grounding_fallback',
  name: 'Simple Sensory Grounding Pause',
  targetMechanism: 'attention_capture',
  primaryProblems: ['acute_stress', 'overload'],
  evidence: {
    category: 'PRODUCT_HYPOTHESIS',
    sourceNote: 'NeuroCalm verified safe fallback route when candidate scoring is below threshold or context is malformed.',
    isEmpirical: false
  },
  baseScore: 50,
  suitableStates: ['baseline', 'elevated_stress', 'overloaded', 'hyperaroused', 'depleted', 'low_capacity', 'moderate_capacity', 'high_capacity'],
  minCapacity: 'LOW',
  instructions: {
    en: 'Notice your feet on the floor and take one smooth, steady breath. Nothing needs to be fixed this second.',
    hi: 'Apne pairon ko zameen par mehsoos karein aur ek aaraamdaayee saans lein. Abhi turant kuch solve nahi karna hai.',
    hinglish: 'Notice your feet on the ground and take one slow, steady breath. Abhi kuch rush karne ki zaroorat nahi hai.'
  },
  actionableStep: {
    en: 'Feel your shoulders drop down away from your ears for 10 seconds.',
    hi: 'Apne kandhon ko dheela chhod dein aur 10 second aaraam karein.',
    hinglish: 'Apne shoulders ko relax hone do for 10 seconds.'
  },
  durationSeconds: 30,
  cognitiveLoad: 'MINIMAL',
  isPassiveOk: true
};
