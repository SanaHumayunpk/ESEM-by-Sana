/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SkinFeel = 'Oily' | 'Dry' | 'Combination' | 'Normal' | 'Not sure';
export type MainConcern = 'Acne / Breakouts' | 'Dullness & Uneven Tone' | 'Aging & Fine Lines' | 'Sensitivity & Redness' | 'Dark Spots & Pigmentation' | 'Pores & Texture' | 'Other';
export type SensitivityLevel = 'Low' | 'Medium' | 'High';

export type SkinResponseOption = 'Better' | 'No change' | 'Worse' | 'Irritated';

export interface RoutineFeedback {
  response: SkinResponseOption;
  note?: string;
  timestamp: number;
}

export interface QuestionnaireInput {
  skinFeel: SkinFeel;
  mainConcern: MainConcern;
  sensitivity: SensitivityLevel;
  currentRoutine?: string;
}

export interface RoutineStep {
  step: number;
  category: 'Cleanser' | 'Treatment' | 'Moisturizer' | 'SPF' | 'Special Care' | string;
  title: string;
  details: string;
  productTip?: string;
}

export interface IngredientInfo {
  name: string;
  reason: string;
}

export interface SkincareAnalysis {
  id: string;
  timestamp: number;
  mode: 'questionnaire' | 'photo' | 'check-in';
  skin_type: string;
  top_concerns: string[];
  morning_routine: RoutineStep[];
  night_routine: RoutineStep[];
  ingredients_to_look_for: IngredientInfo[];
  ingredients_to_avoid: IngredientInfo[];
  disclaimer: string;
  photoPreview?: string;
  userInputsSummary?: {
    skinFeel?: string;
    mainConcern?: string;
    sensitivity?: string;
    currentRoutine?: string;
  };
  // Routine check-in & skin journey versioning
  parentAnalysisId?: string;
  version?: number;
  feedback?: RoutineFeedback;
  what_changed?: string;
}

export interface IngredientCheckResult {
  verdict: 'Good fit' | 'Use with caution' | 'Avoid';
  summary: string;
  beneficial_ingredients: { name: string; reason: string }[];
  flagged_ingredients: { name: string; reason: string; severity: 'mild' | 'moderate' | 'high' }[];
  recommendation: string;
}
