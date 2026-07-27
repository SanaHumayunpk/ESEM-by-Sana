import React from 'react';
import { ClipboardList, Camera, FlaskConical, History, ArrowRight, ShieldCheck, Sparkles, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { SkincareAnalysis } from '../types';

interface HomeScreenProps {
  onStartQuestionnaire: () => void;
  onStartPhoto: () => void;
  onOpenChecker: () => void;
  onOpenHistory: () => void;
  onSelectHistoryItem: (analysis: SkincareAnalysis) => void;
  onOpenCheckIn: (analysis: SkincareAnalysis) => void;
  history: SkincareAnalysis[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onStartQuestionnaire,
  onStartPhoto,
  onOpenChecker,
  onOpenHistory,
  onSelectHistoryItem,
  onOpenCheckIn,
  history,
}) => {
  const latestAnalysis = history.length > 0 ? history[0] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8 pb-12"
    >
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50/90 via-white to-emerald-50/60 border border-rose-100/80 p-6 sm:p-10 shadow-xs">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-100/50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-rose-200/60 shadow-2xs text-xs font-semibold text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Powered Personal Skincare Assistant</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif text-slate-800 leading-tight font-medium">
            Personalized, honest skincare guidance made effortless.
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            No confusion, no generic advice. ESEM analyzes your skin type and concerns — delivering a safe, structured morning and night routine with ingredients readily available in local pharmacies.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Safe & Non-Medical
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free & Instant
            </span>
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Routine Progress Tracked
            </span>
          </div>
        </div>
      </section>

      {/* Two Main Core Flow Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-serif font-medium text-slate-800 flex items-center gap-2">
          <span>Choose how to start</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Option 1: Questionnaire */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            onClick={onStartQuestionnaire}
            id="start-questionnaire-card"
            className="group relative bg-white rounded-2xl border border-emerald-100/80 p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  Step-by-Step
                </span>
                <h3 className="text-xl font-serif font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors">
                  Answer a quick questionnaire
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Select your skin feel, primary concern, and sensitivity level in a 1-minute guided form.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:translate-x-1 transition-transform">
              <span>Start Questionnaire</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Option 2: Selfie Analysis */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            onClick={onStartPhoto}
            id="start-photo-card"
            className="group relative bg-white rounded-2xl border border-rose-100/80 p-6 sm:p-7 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-block mb-1">
                  AI Visual Scan
                </span>
                <h3 className="text-xl font-serif font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                  Analyze my skin with a photo
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Take or upload a clear selfie. AI scans for visual cues like surface texture, shine, or redness.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-700 group-hover:translate-x-1 transition-transform">
              <span>Upload or Take Photo</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Secondary Feature: Ingredient Checker & Quick Status */}
      <section className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold uppercase tracking-wider">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Product Safety Matcher</span>
          </div>
          <h3 className="text-xl font-serif font-medium">Check a product's ingredients before buying</h3>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Paste any skincare product's ingredient list. ESEM compares it against your saved skin profile to check for potential irritants or beneficial actives.
          </p>
          {latestAnalysis ? (
            <p className="text-xs text-emerald-400 font-medium pt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active profile loaded: {latestAnalysis.skin_type} Skin (v{latestAnalysis.version || 1})</span>
            </p>
          ) : (
            <p className="text-xs text-slate-400 font-medium pt-1">
              Tip: Complete a questionnaire or selfie scan first to get custom product matching!
            </p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenChecker}
          id="home-open-checker-btn"
          className="w-full md:w-auto px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
        >
          <span>Open Ingredient Checker</span>
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </section>

      {/* "My Skin History" Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-medium text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-emerald-700" />
            <span>My Skin History & Progress</span>
          </h2>
          {history.length > 0 && (
            <button
              onClick={onOpenHistory}
              id="view-all-history-btn"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({history.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <p className="text-slate-700 font-medium text-sm">No saved routines yet</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              Complete your first quick questionnaire or selfie analysis to generate and save your personalized skincare routine.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={onStartQuestionnaire}
                id="empty-history-start-quiz-btn"
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-medium hover:bg-emerald-800 transition-colors cursor-pointer"
              >
                Start Quiz
              </button>
              <button
                onClick={onStartPhoto}
                id="empty-history-start-photo-btn"
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Take Selfie
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {history.slice(0, 3).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
                onClick={() => onSelectHistoryItem(item)}
                id={`history-item-card-${item.id}`}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium">
                      {new Date(item.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.mode === 'photo' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      v{item.version || 1} • {item.mode === 'photo' ? 'Selfie' : item.mode === 'check-in' ? 'Check-in' : 'Quiz'}
                    </span>
                  </div>

                  <div className="pt-1">
                    <h4 className="font-serif font-semibold text-slate-800 text-base group-hover:text-emerald-800 transition-colors">
                      {item.skin_type} Skin
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.top_concerns?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCheckIn(item);
                    }}
                    id={`home-card-checkin-btn-${item.id}`}
                    className="px-2 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-600" />
                    <span>Check in</span>
                  </button>

                  <div className="flex items-center gap-1 font-semibold text-emerald-700">
                    <span>Routine</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
};
