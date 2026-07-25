import React, { useState } from 'react';
import { History, ArrowLeft, Trash2, ChevronRight, Search, AlertCircle, Plus, RefreshCw, MessageSquare } from 'lucide-react';
import { SkincareAnalysis } from '../types';

interface HistoryViewProps {
  onBack: () => void;
  history: SkincareAnalysis[];
  onSelectAnalysis: (analysis: SkincareAnalysis) => void;
  onDeleteAnalysis: (id: string) => void;
  onStartNew: () => void;
  onOpenCheckIn: (analysis: SkincareAnalysis) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  onBack,
  history,
  onSelectAnalysis,
  onDeleteAnalysis,
  onStartNew,
  onOpenCheckIn,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.skin_type.toLowerCase().includes(q) ||
      item.top_concerns.some((c) => c.toLowerCase().includes(q)) ||
      item.mode.toLowerCase().includes(q) ||
      (item.feedback?.response && item.feedback.response.toLowerCase().includes(q))
    );
  });

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteAnalysis(id);
  };

  const handleCheckInClick = (e: React.MouseEvent, item: SkincareAnalysis) => {
    e.stopPropagation();
    onOpenCheckIn(item);
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          id="history-back-btn"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={onStartNew}
          id="history-new-analysis-btn"
          className="px-3 py-1.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Routine</span>
        </button>
      </div>

      {/* Main Workspace Card */}
      <div className="bg-white rounded-3xl border border-rose-100/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-serif font-semibold text-slate-800 flex items-center gap-2">
              <History className="w-6 h-6 text-emerald-700" />
              <span>My Skin History & Progress</span>
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              Track your skincare journey over time. Select any routine to view or perform a check-in.
            </p>
          </div>

          {history.length > 0 && (
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="search-history-input"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 bg-slate-50/50"
              />
            </div>
          )}
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-slate-700 font-medium text-sm">
              {searchQuery ? 'No matching routines found.' : 'No saved routines found in history.'}
            </p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed">
              {searchQuery
                ? 'Try a different search query like "Oily" or "Better".'
                : 'Take a quick questionnaire or selfie scan to generate your first routine.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectAnalysis(item)}
                id={`history-card-${item.id}`}
                className="group relative bg-white rounded-2xl border border-slate-200/90 p-5 hover:border-emerald-400 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                        v{item.version || 1}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.mode === 'photo'
                          ? 'bg-rose-100 text-rose-800'
                          : item.mode === 'check-in'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.mode === 'photo' ? 'Selfie' : item.mode === 'check-in' ? 'Check-in Update' : 'Quiz'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-slate-400">
                        {new Date(item.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <button
                        onClick={(e) => handleDelete(e, item.id)}
                        id={`delete-history-btn-${item.id}`}
                        title="Delete record"
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif font-semibold text-slate-800 text-base group-hover:text-emerald-800 transition-colors">
                      {item.skin_type} Skin
                    </h3>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.top_concerns?.map((c, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px]">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Feedback response tag if present */}
                  {item.feedback && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-900 space-y-0.5">
                      <p className="font-semibold text-[11px] flex items-center gap-1 text-emerald-800">
                        <span>Response Feedback:</span>
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-900 font-bold">
                          {item.feedback.response}
                        </span>
                      </p>
                      {item.feedback.note && (
                        <p className="text-[11px] text-slate-600 line-clamp-1 italic">
                          "{item.feedback.note}"
                        </p>
                      )}
                    </div>
                  )}

                  {item.what_changed && !item.feedback && (
                    <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 line-clamp-2">
                      💡 {item.what_changed}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button
                    onClick={(e) => handleCheckInClick(e, item)}
                    id={`card-checkin-btn-${item.id}`}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-600" />
                    <span>Check in on this routine</span>
                  </button>

                  <div className="flex items-center gap-1 font-semibold text-slate-600 group-hover:text-emerald-700 transition-colors">
                    <span>View Routine</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
