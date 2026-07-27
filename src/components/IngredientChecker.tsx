import React, { useState } from 'react';
import { ArrowLeft, FlaskConical, CheckCircle2, AlertTriangle, XCircle, Loader2, Sparkles, HelpCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SkincareAnalysis, IngredientCheckResult } from '../types';
import { BrandedLoadingOverlay } from './BrandedLoadingOverlay';

interface IngredientCheckerProps {
  onBack: () => void;
  savedAnalyses: SkincareAnalysis[];
  activeProfileOverride?: SkincareAnalysis | null;
}

const SAMPLE_INGREDIENT_LISTS = [
  {
    title: 'Hydrating Gel Sunscreen',
    ingredients: 'Water, Ethylhexyl Methoxycinnamate, Niacinamide (5%), Glycerin, Sodium Hyaluronate, Centella Asiatica Extract, Carbomer, Phenoxyethanol',
  },
  {
    title: 'Heavy Fragranced Cream',
    ingredients: 'Water, Mineral Oil, Petrolatum, Isopropyl Myristate, Fragrance (Parfum), Denatured Alcohol, Linalool, Coconut Oil, Methylparaben',
  },
  {
    title: 'Exfoliating BHA Cleanser',
    ingredients: 'Water, Sodium Laureth Sulfate, Salicylic Acid (2%), Cocamidopropyl Betaine, Glycerin, Tea Tree Leaf Oil, Menthol, Citric Acid',
  },
];

export const IngredientChecker: React.FC<IngredientCheckerProps> = ({
  onBack,
  savedAnalyses,
  activeProfileOverride,
}) => {
  // Select active profile (override > first saved > fallback default)
  const [selectedProfileId, setSelectedProfileId] = useState<string>(
    activeProfileOverride?.id || (savedAnalyses.length > 0 ? savedAnalyses[0].id : '')
  );

  const activeProfile = savedAnalyses.find((p) => p.id === selectedProfileId) || activeProfileOverride || (savedAnalyses.length > 0 ? savedAnalyses[0] : null);

  const [ingredientsText, setIngredientsText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<IngredientCheckResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCheckIngredients = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientsText.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const response = await fetch('/api/gemini/check-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredientsText: ingredientsText.trim(),
          profile: activeProfile
            ? {
                skin_type: activeProfile.skin_type,
                top_concerns: activeProfile.top_concerns,
                sensitivity: activeProfile.userInputsSummary?.sensitivity || 'Medium',
              }
            : {
                skin_type: 'Combination',
                top_concerns: ['General Skin Health'],
                sensitivity: 'Medium',
              },
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze product ingredients.');
      }

      const data: IngredientCheckResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Error checking ingredients:', err);
      setErrorMessage(err.message || 'Failed to check ingredients. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSample = (sampleText: string) => {
    setIngredientsText(sampleText);
    setResult(null);
    setErrorMessage(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto pb-12 space-y-6"
    >
      {/* Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          id="checker-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
        <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
          Ingredient Checker
        </span>
      </div>

      {/* Main Workspace Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="bg-white rounded-3xl border border-rose-100/90 p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div>
          <h2 className="text-2xl font-serif font-semibold text-slate-800 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-emerald-700" />
            <span>Product Ingredient Safety Checker</span>
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1">
            Paste any product's ingredients list to evaluate its compatibility with your skin profile.
          </p>
        </div>

        {/* Profile Selection / Context Badge */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Evaluating Against Profile:
            </span>
            {savedAnalyses.length > 1 && (
              <select
                value={selectedProfileId}
                onChange={(e) => {
                  setSelectedProfileId(e.target.value);
                  setResult(null);
                }}
                id="select-profile-dropdown"
                className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                {savedAnalyses.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.skin_type} Skin ({new Date(p.timestamp).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {activeProfile ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                {activeProfile.skin_type} Skin
              </span>
              {activeProfile.top_concerns?.map((c, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-slate-200/70 text-slate-800 text-xs font-medium">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-amber-700 font-medium">
              No saved skin profile detected. Using standard sensitive/combination benchmark. (Complete a questionnaire first for tailored results!)
            </p>
          )}
        </div>

        {/* Form Input */}
        <form onSubmit={handleCheckIngredients} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700">
                Paste Ingredient List (from box, website, or bottle):
              </label>
            </div>

            <textarea
              rows={4}
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              placeholder="e.g. Aqua, Niacinamide, Glycerin, Salicylic Acid, Phenoxyethanol, Fragrance..."
              id="ingredients-textarea"
              className="w-full p-3.5 rounded-xl border border-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Preset Sample Buttons */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Try a sample ingredient list:</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_INGREDIENT_LISTS.map((sample, idx) => (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => loadSample(sample.ingredients)}
                  id={`sample-btn-${idx}`}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-600 cursor-pointer transition-colors"
                >
                  {sample.title}
                </motion.button>
              ))}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {errorMessage}
            </div>
          )}

          <motion.button
            whileHover={ingredientsText.trim() && !isLoading ? { scale: 1.01 } : undefined}
            whileTap={ingredientsText.trim() && !isLoading ? { scale: 0.99 } : undefined}
            type="submit"
            disabled={isLoading || !ingredientsText.trim()}
            id="check-ingredients-submit-btn"
            className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-medium text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Comparing Ingredients with Profile...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                <span>Check Compatibility</span>
              </>
            )}
          </motion.button>
        </form>

        {/* RESULTS CARD DISPLAY */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="pt-6 border-t border-slate-100 space-y-6"
          >
            {/* Verdict Header */}
            <div className={`p-5 rounded-2xl border flex items-start gap-4 ${
              result.verdict === 'Good fit'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : result.verdict === 'Use with caution'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-rose-50 border-rose-200 text-rose-950'
            }`}>
              {result.verdict === 'Good fit' && (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {result.verdict === 'Use with caution' && (
                <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
              )}
              {result.verdict === 'Avoid' && (
                <XCircle className="w-7 h-7 text-rose-600 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.verdict === 'Good fit'
                      ? 'bg-emerald-600 text-white'
                      : result.verdict === 'Use with caution'
                      ? 'bg-amber-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {result.verdict}
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed font-medium">{result.summary}</p>
              </div>
            </div>

            {/* Beneficial Ingredients */}
            {result.beneficial_ingredients?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Beneficial Actives Present ({result.beneficial_ingredients.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.beneficial_ingredients.map((b, i) => (
                    <div key={i} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs">
                      <p className="font-semibold text-emerald-900">{b.name}</p>
                      <p className="text-slate-600 mt-0.5">{b.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flagged / Irritant Ingredients */}
            {result.flagged_ingredients?.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Flagged Ingredients ({result.flagged_ingredients.length})</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {result.flagged_ingredients.map((f, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-amber-950">{f.name}</p>
                        <span className={`text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md ${
                          f.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : f.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {f.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1">{f.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            {result.recommendation && (
              <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1">
                <p className="font-semibold text-emerald-400">💡 Usage Recommendation:</p>
                <p className="text-slate-200 leading-relaxed">{result.recommendation}</p>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Branded Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <BrandedLoadingOverlay
            title="Analyzing Product Ingredients"
            subtitle="Cross-referencing formulation with active skin profile and sensitizers..."
            icon="droplet"
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
