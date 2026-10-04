/**
 * NEUROCALM STRUCTURED MEMORY MANAGER
 * Privacy-governed local persistence.
 * CRITICAL RULE: Stores ONLY structured metadata. NEVER raw emotional text or narratives.
 * Personalization bounds: minimum -25, maximum +8.
 * Reversible, inspectable, correctable.
 */

import {
  StructuredMemory,
  ProblemCategory,
  FunctionalMechanism,
  OutcomeType,
  CapacityLevel,
  UserMicroCue,
  AssistanceLevel
} from '../types/neurocalm';

const STORAGE_KEY = 'neurocalm_structured_memory_v1';

export class MemoryManager {
  private memory: StructuredMemory;

  constructor() {
    this.memory = this.loadMemory();
  }

  private loadMemory(): StructuredMemory {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.history)) {
          return parsed;
        }
      }
    } catch {
      // Fallback safely if localStorage is disabled or corrupted
    }

    return {
      history: [],
      skillProgress: {},
      userCues: [],
      reassuranceCheckCount: 0
    };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.memory));
    } catch {
      // Graceful degradation if storage quota exceeded or disabled
    }
  }

  /**
   * Records structured outcome metadata. Notice NO user text is accepted here.
   */
  public recordOutcome(
    problem: ProblemCategory,
    mechanism: FunctionalMechanism,
    interventionId: string,
    outcome: OutcomeType,
    contextSetting: string,
    capacity: CapacityLevel
  ): void {
    // Sanitize and keep bounded history (last 50 events max)
    const entry = {
      id: 'evt_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      timestamp: Date.now(),
      problem,
      mechanism,
      interventionId,
      outcome,
      contextSetting: contextSetting.slice(0, 30),
      capacity
    };

    this.memory.history.unshift(entry);
    if (this.memory.history.length > 50) {
      this.memory.history.pop();
    }

    // Update skill progression strictly based on outcome types
    if (!this.memory.skillProgress[interventionId]) {
      this.memory.skillProgress[interventionId] = {
        practiceCount: 0,
        transferIntentions: 0,
        independentUses: 0,
        assistanceLevel: 'FULL_GUIDANCE'
      };
    }

    const sp = this.memory.skillProgress[interventionId];
    if (outcome === 'R2') {
      sp.practiceCount += 1;
    } else if (outcome === 'R3') {
      sp.transferIntentions += 1;
    } else if (outcome === 'R4') {
      sp.independentUses += 1;
    } else if (outcome === 'NO_CHANGE' || outcome === 'WORSE') {
      // Roll back assistance to fuller guidance if difficulty experienced
      sp.assistanceLevel = 'FULL_GUIDANCE';
    }

    this.persist();
  }

  /**
   * Calculates personalization score delta: strictly clamped to [-25, +8].
   * PRODUCT HEURISTIC: recency-weighted success/failure in similar contexts.
   */
  public getPersonalizationDelta(interventionId: string, contextSetting: string): number {
    const relevant = this.memory.history.filter(h => h.interventionId === interventionId);
    if (relevant.length === 0) return 0;

    let delta = 0;
    // Inspect recent 5 records for this intervention
    const recent = relevant.slice(0, 5);
    for (let i = 0; i < recent.length; i++) {
      const rec = recent[i];
      const recencyMultiplier = 1 / (i + 1); // 1, 0.5, 0.33...
      const isSameContext = rec.contextSetting === contextSetting;
      const contextWeight = isSameContext ? 1.5 : 0.8;

      if (rec.outcome === 'R0' || rec.outcome === 'R1' || rec.outcome === 'R2') {
        delta += 2 * recencyMultiplier * contextWeight;
      } else if (rec.outcome === 'R3' || rec.outcome === 'R4') {
        delta += 3 * recencyMultiplier * contextWeight;
      } else if (rec.outcome === 'NO_CHANGE') {
        delta -= 2 * recencyMultiplier * contextWeight;
      } else if (rec.outcome === 'WORSE') {
        delta -= 5 * recencyMultiplier * contextWeight;
      }
    }

    // Strict boundary enforcement: [-25, +8]
    return Math.max(-25, Math.min(8, Math.round(delta)));
  }

  /**
   * Contextual failure penalty (does NOT globally blacklist intervention)
   */
  public getContextualFailurePenalty(interventionId: string, contextSetting: string): number {
    const recentFailuresInContext = this.memory.history
      .slice(0, 10)
      .filter(h => h.interventionId === interventionId && h.contextSetting === contextSetting && (h.outcome === 'WORSE' || h.outcome === 'NO_CHANGE'))
      .length;

    // Up to -15 max contextual penalty
    return Math.min(15, recentFailuresInContext * 4);
  }

  public getSkillProgress(interventionId: string) {
    return this.memory.skillProgress[interventionId] || {
      practiceCount: 0,
      transferIntentions: 0,
      independentUses: 0,
      assistanceLevel: 'FULL_GUIDANCE' as AssistanceLevel
    };
  }

  public updateAssistanceLevel(interventionId: string, level: AssistanceLevel) {
    if (!this.memory.skillProgress[interventionId]) {
      this.memory.skillProgress[interventionId] = {
        practiceCount: 0,
        transferIntentions: 0,
        independentUses: 0,
        assistanceLevel: level
      };
    } else {
      this.memory.skillProgress[interventionId].assistanceLevel = level;
    }
    this.persist();
  }

  public getUserCues(): UserMicroCue[] {
    return [...this.memory.userCues];
  }

  public addUserCue(cue: Omit<UserMicroCue, 'id' | 'createdAt'>): UserMicroCue {
    const newCue: UserMicroCue = {
      ...cue,
      id: 'cue_' + Date.now(),
      createdAt: Date.now()
    };
    this.memory.userCues.unshift(newCue);
    this.persist();
    return newCue;
  }

  public deleteUserCue(cueId: string) {
    this.memory.userCues = this.memory.userCues.filter(c => c.id !== cueId);
    this.persist();
  }

  public getFullAuditSummary() {
    return {
      historyCount: this.memory.history.length,
      historySample: this.memory.history.slice(0, 5),
      trackedSkills: Object.keys(this.memory.skillProgress).length,
      cuesCount: this.memory.userCues.length
    };
  }

  public clearAll() {
    this.memory = {
      history: [],
      skillProgress: {},
      userCues: [],
      reassuranceCheckCount: 0
    };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

export const memoryManager = new MemoryManager();
