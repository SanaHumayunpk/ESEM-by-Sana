import React, { useState } from 'react';
import { Sun, Moon, CheckCircle2, AlertTriangle, ShieldCheck, ArrowLeft, Printer, FlaskConical, Check, Copy, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import { SkincareAnalysis } from '../types';
import { getAnalysisChain } from '../lib/storage';

interface AnalysisResultsViewProps {
  analysis: SkincareAnalysis;
  onBack: () => void;
  onOpenIngredientChecker: (analysis: SkincareAnalysis) => void;
  onOpenCheckIn: (analysis: SkincareAnalysis) => void;
  allAnalyses?: SkincareAnalysis[];
  onSelectAnalysis?: (analysis: SkincareAnalysis) => void;
}

export const AnalysisResultsView: React.FC<AnalysisResultsViewProps> = ({
  analysis,
  onBack,
  onOpenIngredientChecker,
  onOpenCheckIn,
  allAnalyses = [],
  onSelectAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'routine' | 'ingredients'>('routine');
  const [copied, setCopied] = useState<boolean>(false);

  const chain = getAnalysisChain(analysis, allAnalyses);

  const handleCopyRoutine = () => {
    const text = `
=== ESEM PERSONALIZED SKINCARE GUIDANCE (v${analysis.version || 1}) ===
Skin Type: ${analysis.skin_type}
Top Concerns: ${analysis.top_concerns?.join(', ')}
${analysis.what_changed ? `What Changed: ${analysis.what_changed}\n` : ''}
MORNING ROUTINE:
${analysis.morning_routine?.map((s) => `${s.step}. [${s.category}] ${s.title}: ${s.details}`).join('\n')}

NIGHT ROUTINE:
${analysis.night_routine?.map((s) => `${s.step}. [${s.category}] ${s.title}: ${s.details}`).join('\n')}

INGREDIENTS TO LOOK FOR:
${analysis.ingredients_to_look_for?.map((i) => `- ${i.name}: ${i.reason}`).join('\n')}

INGREDIENTS TO AVOID:
${analysis.ingredients_to_avoid?.map((i) => `- ${i.name}: ${i.reason}`).join('\n')}

Disclaimer: ${analysis.disclaimer}
`;
    navigator.clipboard.writeText(text.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-3xl mx-auto pb-16 space-y-6"
    >
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          onClick={onBack}
          id="results-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onOpenCheckIn(analysis)}
            id="results-checkin-btn"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-200" />
            <span>Check in on this routine</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCopyRoutine}
            id="copy-routine-btn"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Routine'}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePrint}
            id="print-routine-btn"
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </motion.button>
        </div>
      </div>

      {/* Main Analysis Results Card */}
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-sm overflow-hidden">
        {/* Banner Overview */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-slate-900 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {analysis.mode === 'photo'
                    ? 'Photo Scan Result'
                    : analysis.mode === 'check-in'
                    ? 'Updated Routine'
                    : 'Questionnaire Result'}
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-white/20 text-white">
                  Version {analysis.version || 1}
                </span>

                <span className="text-xs text-emerald-200/80">
                  {new Date(analysis.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-white">
                {analysis.skin_type} Skin Profile
              </h1>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {analysis.top_concerns?.map((concern, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-white/10 text-emerald-100 text-xs font-medium backdrop-blur-xs"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>

            {/* Thumbnail preview if photo mode */}
            {analysis.photoPreview && (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0 shadow-md">
                <img src={analysis.photoPreview} alt="Selfie preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </div>

        {/* Routine Journey Chain Selector */}
        {chain.length > 1 && (
          <div className="bg-slate-50 border-b border-slate-200/80 p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 print:hidden">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Skin Routine Version History:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
              {chain.map((step) => {
                const isCurrent = step.id === analysis.id;
                const ver = step.version || 1;
                return (
                  <button
                    key={step.id}
                    onClick={() => onSelectAnalysis?.(step)}
                    id={`journey-step-btn-${ver}`}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                    }`}
                  >
                    <span>v{ver}</span>
                    {step.feedback && <span className="text-[10px] opacity-80">({step.feedback.response})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* What Changed & Feedback Summary Banner */}
        {analysis.what_changed && (
          <div className="mx-6 mt-6 p-5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-200 text-emerald-900">
                Routine Update Explanation (Version {analysis.version || 2})
              </span>
              {analysis.feedback && (
                <span className="text-xs text-emerald-900 font-medium">
                  Response Feedback: <strong>{analysis.feedback.response}</strong>
                  {analysis.feedback.note ? ` ("${analysis.feedback.note}")` : ''}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed">
              💡 <strong>What Changed & Why:</strong> {analysis.what_changed}
            </p>
          </div>
        )}

        {/* Tab Toggle Navigation */}
        <div className="border-b border-slate-100 px-6 pt-4 flex gap-6 print:hidden">
          <button
            onClick={() => setActiveTab('routine')}
            id="tab-routine-btn"
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'routine' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Daily Routine (AM & PM)</span>
            {activeTab === 'routine' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('ingredients')}
            id="tab-ingredients-btn"
            className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === 'ingredients' ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span>Ingredients Guide</span>
            {activeTab === 'ingredients' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700 rounded-full" />
            )}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* TAB 1: DAILY ROUTINES */}
          {(activeTab === 'routine' || true) && (
            <div className={`space-y-8 ${activeTab !== 'routine' ? 'hidden print:block' : ''}`}>
              {/* Morning Routine Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-semibold text-lg">Morning Routine (AM)</h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {analysis.morning_routine?.map((step) => (
                    <div
                      key={step.step}
                      className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100/70 flex items-start gap-4"
                    >
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white border border-rose-200/60 text-slate-700">
                            {step.category}
                          </span>
                          <h4 className="font-semibold text-slate-800 text-sm">{step.title}</h4>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{step.details}</p>
                        {step.productTip && (
                          <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-100 mt-2 font-medium">
                            💡 Local Tip: {step.productTip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Night Routine Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-semibold text-lg">Night Routine (PM)</h3>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                  {analysis.night_routine?.map((step) => (
                    <div
                      key={step.step}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-4"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {step.step}
                      </div>

                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                            {step.category}
                          </span>
                          <h4 className="font-semibold text-slate-800 text-sm">{step.title}</h4>
                        </div>
                        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{step.details}</p>
                        {step.productTip && (
                          <p className="text-[11px] text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-2 font-medium">
                            💡 Local Tip: {step.productTip}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGREDIENTS TO LOOK FOR / AVOID */}
          {(activeTab === 'ingredients' || true) && (
            <div className={`space-y-6 ${activeTab !== 'ingredients' ? 'hidden print:block' : ''}`}>
              {/* Ingredients to Look For */}
              <div className="space-y-3">
                <h3 className="font-serif font-semibold text-slate-800 text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Key Ingredients to Look For</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.ingredients_to_look_for?.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 space-y-1"
                    >
                      <p className="font-semibold text-emerald-900 text-xs sm:text-sm">{ing.name}</p>
                      <p className="text-slate-600 text-xs">{ing.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ingredients to Avoid */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif font-semibold text-slate-800 text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span>Ingredients to Avoid or Use Cautiously</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {analysis.ingredients_to_avoid?.map((ing, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-1"
                    >
                      <p className="font-semibold text-amber-900 text-xs sm:text-sm">{ing.name}</p>
                      <p className="text-slate-600 text-xs">{ing.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Central Disclaimer Card */}
          <div className="bg-rose-50/80 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-xs text-rose-900 uppercase tracking-wider">Medical Disclaimer</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.disclaimer || "General guidance only, not a medical diagnosis. For severe or persistent skin conditions, please consult a dermatologist."}
              </p>
            </div>
          </div>

          {/* Bottom Check-In Prompt & Ingredient Checker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:hidden">
            <div className="bg-emerald-900 text-white rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <p className="font-serif font-medium text-base flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-300" />
                  <span>Track Skin Progress</span>
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Been using this routine? Check in to report how your skin is responding and get an updated routine.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenCheckIn(analysis)}
                id="bottom-checkin-btn"
                className="w-full py-2.5 rounded-xl bg-white text-emerald-950 font-semibold text-xs hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-emerald-700" />
                <span>Check in on this routine</span>
              </motion.button>
            </div>

            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <p className="font-serif font-medium text-base flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-emerald-400" />
                  <span>Test Product Safety</span>
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Paste any product's ingredient list to verify if it suits this {analysis.skin_type} profile.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenIngredientChecker(analysis)}
                id="results-test-ingredients-btn"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Check Ingredients Now</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
