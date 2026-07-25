import React, { useState } from 'react';
import { X, Sparkles, AlertCircle, Loader2, ThumbsUp, RefreshCw, ThumbsDown, Flame, MessageSquare, ArrowRight } from 'lucide-react';
import { SkincareAnalysis, SkinResponseOption } from '../types';

interface CheckInModalProps {
  analysis: SkincareAnalysis | null;
  isOpen: boolean;
  onClose: () => void;
  onCheckInComplete: (newAnalysis: SkincareAnalysis) => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onCheckInComplete,
}) => {
  const [responseOption, setResponseOption] = useState<SkinResponseOption>('Better');
  const [note, setNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !analysis) return null;

  const currentVersion = analysis.version || 1;

  const options: { option: SkinResponseOption; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
    {
      option: 'Better',
      label: 'Better',
      desc: 'Skin is improving, calmer, or clearer',
      icon: <ThumbsUp className="w-4 h-4 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-50 text-emerald-900',
    },
    {
      option: 'No change',
      label: 'No change',
      desc: 'Same as before, no noticeable difference yet',
      icon: <RefreshCw className="w-4 h-4 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/60 hover:bg-blue-50 text-blue-900',
    },
    {
      option: 'Worse',
      label: 'Worse',
      desc: 'Breakouts, dullness, or texture increased',
      icon: <ThumbsDown className="w-4 h-4 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/60 hover:bg-amber-50 text-amber-900',
    },
    {
      option: 'Irritated',
      label: 'Irritated',
      desc: 'Redness, stinging, tightness, or peeling',
      icon: <Flame className="w-4 h-4 text-rose-600" />,
      color: 'border-rose-200 bg-rose-50/60 hover:bg-rose-50 text-rose-900',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiRes = await fetch('/api/gemini/routine-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          previousAnalysis: analysis,
          feedbackResponse: responseOption,
          note: note.trim(),
        }),
      });

      if (!apiRes.ok) {
        const errorData = await apiRes.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to submit check-in feedback');
      }

      const result = await apiRes.json();

      const updatedAnalysis: SkincareAnalysis = {
        id: `routine-v${currentVersion + 1}-${Date.now()}`,
        timestamp: Date.now(),
        mode: 'check-in',
        skin_type: result.skin_type || analysis.skin_type,
        top_concerns: result.top_concerns || analysis.top_concerns,
        morning_routine: result.morning_routine || [],
        night_routine: result.night_routine || [],
        ingredients_to_look_for: result.ingredients_to_look_for || [],
        ingredients_to_avoid: result.ingredients_to_avoid || [],
        disclaimer: result.disclaimer || analysis.disclaimer,
        photoPreview: analysis.photoPreview,
        userInputsSummary: analysis.userInputsSummary,
        // Routine journey linkage
        parentAnalysisId: analysis.id,
        version: currentVersion + 1,
        feedback: {
          response: responseOption,
          note: note.trim() ? note.trim() : undefined,
          timestamp: Date.now(),
        },
        what_changed: result.what_changed,
      };

      onCheckInComplete(updatedAnalysis);
      onClose();
    } catch (err: any) {
      console.error('Error during check-in submit:', err);
      setError(err.message || 'Something went wrong while updating your routine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-lg w-full border border-rose-100 shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Routine Check-in • v{currentVersion} → v{currentVersion + 1}
              </span>
            </div>
            <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-400" />
              <span>How is your skin responding?</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Active Routine Info Pill */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">Checking in on: </span>
              <span>{analysis.skin_type} Skin Routine (Version {currentVersion})</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {new Date(analysis.timestamp).toLocaleDateString()}
            </span>
          </div>

          {/* Option Selection Grid */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Select Response Status <span className="text-rose-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((item) => {
                const isSelected = responseOption === item.option;
                return (
                  <button
                    key={item.option}
                    type="button"
                    onClick={() => setResponseOption(item.option)}
                    id={`checkin-option-${item.option.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/90 shadow-2xs ring-2 ring-emerald-500/30'
                        : 'border-slate-200/80 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white shadow-2xs shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />}
                      </p>
                      <p className="text-[11px] text-slate-500 leading-tight">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Text Note */}
          <div className="space-y-2">
            <label htmlFor="checkin-note" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Optional Details & Observations</span>
            </label>
            <textarea
              id="checkin-note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., My cheeks felt tight after 3 days, or forehead breakouts cleared up completely..."
              className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              id="submit-checkin-btn"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing & Updating Routine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Generate Updated Routine (v{currentVersion + 1})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
