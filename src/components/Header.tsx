import React from 'react';
import { Sparkles, ClipboardList, Camera, FlaskConical, History, Heart } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'questionnaire' | 'photo' | 'ingredient-checker' | 'history' | 'results';
  setCurrentView: (view: 'home' | 'questionnaire' | 'photo' | 'ingredient-checker' | 'history' | 'results') => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView, savedCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100/60 shadow-xs">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => setCurrentView('home')}
          id="brand-logo-btn"
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-100 via-rose-50 to-emerald-100 flex items-center justify-center text-emerald-800 shadow-xs border border-rose-200/50 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-semibold text-xl tracking-wide text-slate-800">ESEM</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                AI Skincare
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
              Honest, Personalized Guidance
            </p>
          </div>
        </button>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentView('home')}
            id="nav-home-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'home'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50/80'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Home</span>
          </button>

          <button
            onClick={() => setCurrentView('questionnaire')}
            id="nav-questionnaire-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'questionnaire'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Quiz</span>
          </button>

          <button
            onClick={() => setCurrentView('photo')}
            id="nav-photo-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'photo'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-emerald-50'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Selfie</span>
          </button>

          <button
            onClick={() => setCurrentView('ingredient-checker')}
            id="nav-ingredient-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              currentView === 'ingredient-checker'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50/80'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Checker</span>
          </button>

          <button
            onClick={() => setCurrentView('history')}
            id="nav-history-btn"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer relative ${
              currentView === 'history'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:bg-rose-50/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800">
                {savedCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
