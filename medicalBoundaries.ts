/**
 * NEUROCALM MEDICAL & CLINICAL EVIDENCE BOUNDARIES (Section 10 & 11)
 *
 * INVARIANTS:
 * 1. NeuroCalm NEVER diagnoses physical or mental health disorders.
 * 2. NeuroCalm NEVER claims to cure mental illness.
 * 3. NeuroCalm NEVER replaces qualified physicians, psychiatrists, or therapists.
 * 4. Medical informational queries receive evidence-based factual framing with strict non-diagnostic referral boundaries.
 */

import { MedicalBoundaryEvaluation } from '../types/neurocalm';

export class MedicalBoundaryEngine {
  /**
   * Evaluates user input for diagnostic, clinical, or medical queries.
   */
  public evaluate(rawInput: string): MedicalBoundaryEvaluation {
    const text = rawInput.toLowerCase();

    // Check for diagnostic requests
    const containsDiagnosticRequest =
      /\b(kya mujhe.*depression|do i have.*depression|am i bipolar|diagnos[a-z]*|kya ye adhd|kya main pagal|mental illness diagnosis|what is my diagnosis)\b/i.test(text);

    // Check for medical symptom inquiries
    const containsSymptomQuery =
      /\b(heart attack symptoms|chest pain reason|seizure|neurological disorder|side effects of medication|dosage of|anti-depressant)\b/i.test(text);

    const isMedicalQuery = containsDiagnosticRequest || containsSymptomQuery;

    if (!isMedicalQuery) {
      return {
        isMedicalQuery: false,
        containsDiagnosticRequest: false,
        containsSymptomQuery: false,
        boundaryEnforced: false,
        educationalFraming: ''
      };
    }

    let educationalFraming = '';
    let referralGuidance: string | undefined = undefined;

    if (containsDiagnosticRequest) {
      educationalFraming =
        'Clinical diagnoses require comprehensive evaluation by a qualified medical professional or psychiatrist. While low mood, racing thoughts, and fatigue are common human responses to prolonged stress, NeuroCalm does not diagnose or categorize clinical conditions.';
      referralGuidance =
        'If you are seeking a formal diagnostic assessment, consulting a licensed mental health professional or physician is recommended.';
    } else if (containsSymptomQuery) {
      educationalFraming =
        'Physical symptoms like chest tightness, dizziness, and rapid heartbeat can occur during acute nervous system arousal, but they can also stem from medical conditions. NeuroCalm cannot evaluate physical medical symptoms or advise on medications.';
      referralGuidance =
        'For physical symptoms or medication questions, always consult a medical doctor or visit an urgent care center.';
    }

    return {
      isMedicalQuery: true,
      containsDiagnosticRequest,
      containsSymptomQuery,
      boundaryEnforced: true,
      educationalFraming,
      referralGuidance
    };
  }
}

export const medicalBoundaryEngine = new MedicalBoundaryEngine();
