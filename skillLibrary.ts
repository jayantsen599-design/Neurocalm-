/**
 * NEUROCALM PORTABLE SKILL LIBRARY & TRANSFER ENGINE (Part 2)
 * Manages portable skill extraction, micro-cues, reduced-guidance off-ramps,
 * and user agency anti-attribution.
 *
 * Distinguishes:
 * R0 = relief (relief alone does NOT equal R2)
 * R1 = action
 * R2 = skill practice
 * R3 = transfer intention (self-reported intent, not verified proof)
 * R4 = independence signal (HANDLED_MYSELF)
 */

import { Skill, AssistanceLevel, OutcomeType } from '../types/neurocalm';
import { memoryManager } from './memoryManager';

export const PORTABLE_SKILLS: Skill[] = [
  {
    id: 'skill_breath_brake',
    name: 'Autonomic Breath Brake',
    sourceInterventionId: 'autonomic_breath_brake',
    targetMechanism: 'physiological_hyperarousal',
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Controlled double-inhalation with extended exhalation down-regulates autonomic arousal.',
      isEmpirical: true
    },
    canonicalMicroCue: 'Double-inhale nose, slow release mouth.',
    safeUsageContext: 'Before speaking in anger, before sleep, during acute exam anxiety.',
    transferGuidance: 'Can be done silently in public without anyone noticing.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_controllable_split',
    name: 'Controllable Partitioning',
    sourceInterventionId: 'controllable_split',
    targetMechanism: 'uncertainty_loop',
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Separates agency from probabilistic external results.',
      isEmpirical: false
    },
    canonicalMicroCue: 'What is 100% in my hands in the next 10 minutes?',
    safeUsageContext: 'Decision overload, waiting for exam results, relationship anxiety.',
    transferGuidance: 'Mentally draw a vertical line: left is actions, right is outcomes.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_memory_offload',
    name: 'Working Memory Offload',
    sourceInterventionId: 'working_memory_offload',
    targetMechanism: 'working_memory_overload',
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Physical externalization clears loop recurrence.',
      isEmpirical: false
    },
    canonicalMicroCue: 'Externalize to paper in 120 seconds.',
    safeUsageContext: 'Late night overthinking, high task backlog, racing thoughts.',
    transferGuidance: 'Carry a physical pocket notepad or use a blank text file.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_urge_delay',
    name: 'Urge-Surfing Wave Pause',
    sourceInterventionId: 'urge_surfing_delay',
    targetMechanism: 'urge_response_coupling',
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Marlatt urge surfing protocol for craving decay.',
      isEmpirical: true
    },
    canonicalMicroCue: 'Delay for 10 minutes; urge will peak and subside.',
    safeUsageContext: 'Compulsive phone checking, smoking cravings, binge eating.',
    transferGuidance: 'Set a silent physical timer and watch the bodily urge dissolve.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_micro_starter',
    name: 'Micro-Friction 2-Minute Starter',
    sourceInterventionId: 'micro_friction_starter',
    targetMechanism: 'initiation_friction',
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Reduces activation energy to trigger momentum.',
      isEmpirical: false
    },
    canonicalMicroCue: 'Touch the task for 120 seconds, then decide.',
    safeUsageContext: 'Procrastinating on assignments, difficult emails, workouts.',
    transferGuidance: 'Lower the bar until refusal is impossible.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_identity_decoupling',
    name: 'Sakshi / Identity Decoupling',
    sourceInterventionId: 'identity_event_decoupling',
    targetMechanism: 'identity_event_fusion',
    evidence: {
      category: 'TRADITIONAL_CLAIM',
      sourceNote: 'Contemplative awareness principle: separating observer from event.',
      isEmpirical: false
    },
    canonicalMicroCue: 'I am the observer, not the temporary setback.',
    safeUsageContext: 'After receiving critical feedback, rejection, or making a mistake.',
    transferGuidance: 'Observe the emotion as weather passing across the sky.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_repair_pivot',
    name: 'Actionable Repair Pivot',
    sourceInterventionId: 'actionable_repair_pivot',
    targetMechanism: 'rumination_cascade',
    evidence: {
      category: 'BEHAVIORAL_RATIONALE',
      sourceNote: 'Redirects guilt toward constructive repair.',
      isEmpirical: false
    },
    canonicalMicroCue: 'Convert regret into 1 clean repair action.',
    safeUsageContext: 'After an argument, missed commitment, or relationship friction.',
    transferGuidance: 'Never apologize defensively; state the repair directly.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_thermal_pause',
    name: 'Thermal Distance Reset',
    sourceInterventionId: 'thermal_distance_pause',
    targetMechanism: 'physiological_hyperarousal',
    evidence: {
      category: 'SCIENTIFIC_EVIDENCE',
      sourceNote: 'Trigeminal cold stimulation (mammalian dive reflex).',
      isEmpirical: true
    },
    canonicalMicroCue: 'Cold water on face for 90-second physiological brake.',
    safeUsageContext: 'Rage, intense urge to retaliate, sudden fight-or-flight spike.',
    transferGuidance: 'Excuse yourself to the restroom and run cold water on wrists/face.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  },
  {
    id: 'skill_sensory_reset',
    name: 'Sensory Depletion Reset',
    sourceInterventionId: 'sensory_depletion_reset',
    targetMechanism: 'cognitive_overload',
    evidence: {
      category: 'PRODUCT_HYPOTHESIS',
      sourceNote: 'Zero-input low-stimulation rest hypothesis for depleted states.',
      isEmpirical: false
    },
    canonicalMicroCue: '3 minutes zero-input, eyes closed, screen face-down.',
    safeUsageContext: 'End-of-day exhaustion, study burnout, sensory overstimulation.',
    transferGuidance: 'Keep headphones nearby with zero audio playing.',
    userPracticeCount: 0,
    transferIntentionCount: 0,
    independentUseCount: 0,
    assistanceLevel: 'FULL_GUIDANCE'
  }
];

export class TransferEngine {
  /**
   * Retrieves enriched skill list with user practice stats
   */
  public getSkills(): Skill[] {
    return PORTABLE_SKILLS.map(skill => {
      const progress = memoryManager.getSkillProgress(skill.sourceInterventionId);
      return {
        ...skill,
        userPracticeCount: progress.practiceCount,
        transferIntentionCount: progress.transferIntentions,
        independentUseCount: progress.independentUses,
        assistanceLevel: progress.assistanceLevel
      };
    });
  }

  /**
   * Evaluates if user qualifies for a Transfer Opportunity (Part 2C)
   * NO FAKE MASTERY: strictly framed as "opportunity to try independently".
   */
  public evaluateTransferOpportunity(interventionId: string): {
    eligible: boolean;
    reason: string;
    currentAssistance: AssistanceLevel;
    suggestedAssistance: AssistanceLevel;
  } {
    const progress = memoryManager.getSkillProgress(interventionId);

    // If user experienced worse or no change recently, rollback
    if (progress.assistanceLevel === 'FULL_GUIDANCE' && progress.practiceCount >= 2) {
      return {
        eligible: true,
        reason: 'You have practiced this step multiple times. You may want to try it with a lighter prompt.',
        currentAssistance: 'FULL_GUIDANCE',
        suggestedAssistance: 'SHORT_REMINDER'
      };
    }

    if (progress.assistanceLevel === 'SHORT_REMINDER' && progress.transferIntentions >= 1) {
      return {
        eligible: true,
        reason: 'You can use just your micro-cue next time without reading full instructions.',
        currentAssistance: 'SHORT_REMINDER',
        suggestedAssistance: 'CUE_ONLY'
      };
    }

    if (progress.assistanceLevel === 'CUE_ONLY' && progress.independentUses >= 1) {
      return {
        eligible: true,
        reason: 'You have practiced applying this yourself in real life.',
        currentAssistance: 'CUE_ONLY',
        suggestedAssistance: 'USER_ACTS_WITHOUT_AI'
      };
    }

    return {
      eligible: false,
      reason: 'Continue practicing with full guidance.',
      currentAssistance: progress.assistanceLevel,
      suggestedAssistance: progress.assistanceLevel
    };
  }

  /**
   * Generates anti-attribution user agency text
   */
  public getAgencyPreservingPraise(outcome: OutcomeType): string {
    switch (outcome) {
      case 'R4':
        return 'You initiated and executed this step independently. Real-life competence comes from your own action.';
      case 'R3':
        return 'You identified where to apply this next. Bringing this into real life is entirely your work.';
      case 'R2':
      case 'R1':
        return 'You took the practical step. The shift in state came from your execution.';
      case 'R0':
        return 'Your system down-regulated through your own breathing and physical pause.';
      default:
        return 'You handled the next step.';
    }
  }
}

export const transferEngine = new TransferEngine();
