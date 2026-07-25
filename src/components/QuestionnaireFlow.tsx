import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Check, ChevronRight, Loader2, Info } from 'lucide-react';
import { QuestionnaireInput, SkinFeel, MainConcern, SensitivityLevel, SkincareAnalysis } from '../types';

interface QuestionnaireFlowProps {
  onBack: () => void;
  onAnalysisComplete: (result: SkincareAnalysis) => void;
}

const SKIN_FEEL_OPTIONS: { label: SkinFeel; description: string; emoji: string }[] = [
  { label: 'Oily', description: 'Shiny all over, enlarged pores, prone to excess sebum', emoji: '✨' },
  { label: 'Dry', description: 'Feels tight, rough or flaky, lacks moisture', emoji: '🌾' },
  { label: 'Combination', description: 'Oily T-zone (forehead, nose), normal or dry cheeks', emoji: '⚖️' },
  { label: 'Normal', description: 'Balanced moisture levels, rarely breaks out', emoji: '🌸' },
  { label: 'Not sure', description: 'Changes with weather or unpredictable', emoji: '❓' },
];

const MAIN_CONCERN_OPTIONS: { label: MainConcern; description: string }[] = [
  { label: 'Acne / Breakouts', description: 'Pimples, whiteheads, blackheads, clogged pores' },
  { label: 'Dullness & Uneven Tone', description: 'Lack of glow, tired look, rough surface texture' },
  { label: 'Dark Spots & Pigmentation', description: 'Sun spots, post-acne marks, hyperpigmentation' },
  { label: 'Sensitivity & Redness', description: 'Easily irritated, burning, reactive skin' },
  { label: 'Aging & Fine Lines', description: 'Loss of firmness, fine lines, wrinkles' },
  { label: 'Pores & Texture', description: 'Visible enlarged pores, uneven bumpy skin' },
  { label: 'Other', description: 'General skin health & maintenance' },
];

const SENSITIVITY_OPTIONS: { label: SensitivityLevel; description: string }[] = [
  { label: 'Low', description: 'Tolerates most skincare products without redness or stinging' },
  { label: 'Medium', description: 'Occasional mild stinging or redness with active ingredients' },
  { label: 'High', description: 'Flushes easily, stings with fragrances, reacts quickly' },
];

const LOADING_TIPS = [
  "Evaluating skin barrier moisture levels...",
  "Selecting gentle, effective active ingredients...",
  "Curating routines accessible in local Pakistani pharmacies...",
  "Structuring morning SPF and evening repair steps...",
  "Finalizing ingredient safety match guidelines..."
];

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({
  onBack,
  onAnalysisComplete,
}) => {
  const [skinFeel, setSkinFeel] = useState<SkinFeel>('Combination');
  const [mainConcern, setMainConcern] = useState<MainConcern>('Acne / Breakouts');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('Medium');
  const [currentRoutine, setCurrentRoutine] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTipIndex, setLoadingTipIndex] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Rotate tips periodically
    const tipInterval = setInterval(() => {
      setLoadingTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 2000);

    try {
      const response = await fetch('/api/gemini/analyze-questionnaire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skinFeel,
          mainConcern,
          sensitivity,
          currentRoutine: currentRoutine.trim() || 'None / Just water and soap',
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to generate skincare analysis.');
      }

      const data = await response.json();

      const newAnalysis: SkincareAnalysis = {
        id: 'analysis_' + Date.now(),
        timestamp: Date.now(),
        mode: 'questionnaire',
        skin_type: data.skin_type || skinFeel,
        top_concerns: data.top_concerns || [mainConcern],
        morning_routine: data.morning_routine || [],
        night_routine: data.night_routine || [],
        ingredients_to_look_for: data.ingredients_to_look_for || [],
        ingredients_to_avoid: data.ingredients_to_avoid || [],
        disclaimer: data.disclaimer || 'General guidance only, not a medical diagnosis.',
        userInputsSummary: {
          skinFeel,
          mainConcern,
          sensitivity,
          currentRoutine: currentRoutine.trim(),
        },
      };

      onAnalysisComplete(newAnalysis);
    } catch (err: any) {
      console.error('Error submitting questionnaire:', err);
      setErrorMessage(err.message || 'An error occurred while analyzing your responses. Please try again.');
    } finally {
      clearInterval(tipInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      {/* Header Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          id="questionnaire-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
          Guided Questionnaire
        </span>
      </div>

      {/* Main Title Card */}
      <div className="bg-white rounded-2xl border border-rose-100/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-slate-800">
            Tell us about your skin
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            We use these details to formulate a personalized, non-medical routine suited to your budget and environment.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
            <Info className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1: Skin Feel */}
          <div className="space-y-3">
            <label className="block font-serif font-medium text-slate-800 text-sm sm:text-base">
              1. How does your skin typically feel by midday?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {SKIN_FEEL_OPTIONS.map((opt) => {
                const isSelected = skinFeel === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    id={`skin-feel-opt-${opt.label}`}
                    onClick={() => setSkinFeel(opt.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-lg shrink-0">{opt.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-xs sm:text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                          {opt.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 2: Main Concern */}
          <div className="space-y-3">
            <label className="block font-serif font-medium text-slate-800 text-sm sm:text-base">
              2. What is your primary skin concern right now?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MAIN_CONCERN_OPTIONS.map((opt) => {
                const isSelected = mainConcern === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    id={`main-concern-opt-${opt.label}`}
                    onClick={() => setMainConcern(opt.label)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <span className={`font-semibold text-xs sm:text-sm block ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}>
                        {opt.label}
                      </span>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 3: Sensitivity Level */}
          <div className="space-y-3">
            <label className="block font-serif font-medium text-slate-800 text-sm sm:text-base">
              3. What is your skin's sensitivity level?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {SENSITIVITY_OPTIONS.map((opt) => {
                const isSelected = sensitivity === opt.label;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    id={`sensitivity-opt-${opt.label}`}
                    onClick={() => setSensitivity(opt.label)}
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/80 font-bold text-emerald-900 shadow-2xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-semibold block">{opt.label}</span>
                    <span className="text-[10px] text-slate-500 font-normal hidden sm:block mt-1">
                      {opt.description.slice(0, 30)}...
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question 4: Current Routine (Optional Free Text) */}
          <div className="space-y-2">
            <label className="block font-serif font-medium text-slate-800 text-sm">
              4. Current skincare routine <span className="text-slate-400 font-normal text-xs">(optional)</span>
            </label>
            <input
              type="text"
              value={currentRoutine}
              onChange={(e) => setCurrentRoutine(e.target.value)}
              placeholder='e.g. "Facewash and moisturizer twice a day", or "just water and soap"'
              id="current-routine-input"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-500">
              Mentioning what you currently use helps Gemini avoid suggesting overlapping or harsh steps.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              id="submit-questionnaire-btn"
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Formulating Routine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Get My Custom Skincare Guidance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Loading Modal / Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-rose-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-semibold text-slate-800">
                Crafting Your Skincare Routine
              </h3>
              <p className="text-xs text-slate-500 min-h-[36px] flex items-center justify-center animate-fade-in">
                {LOADING_TIPS[loadingTipIndex]}
              </p>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
