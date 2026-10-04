/**
 * NEUROCALM VOICE ENGINE
 * Delivery layer using native browser SpeechSynthesis.
 * Explicit user opt-in only. Never autoplays.
 * Stops immediately on session exit or cancel.
 */

import { CapacityLevel, SupportedLanguage } from '../types/neurocalm';

class VoiceEngine {
  private isSpeaking = false;

  public speak(
    text: string,
    lang: SupportedLanguage,
    capacity: CapacityLevel,
    onEnd?: () => void
  ) {
    this.stop();
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Set voice language code
    if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-US';
    }

    // Adapt speech rate to user capacity
    if (capacity === 'LOW') {
      utterance.rate = 0.85; // Slower, calmer cadence
    } else {
      utterance.rate = 1.0;
    }

    utterance.pitch = 0.95;

    utterance.onend = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      onEnd?.();
    };

    this.isSpeaking = true;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceEngine = new VoiceEngine();
