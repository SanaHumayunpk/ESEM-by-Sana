import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { QuestionnaireFlow } from './components/QuestionnaireFlow';
import { PhotoAnalysisFlow } from './components/PhotoAnalysisFlow';
import { AnalysisResultsView } from './components/AnalysisResultsView';
import { IngredientChecker } from './components/IngredientChecker';
import { HistoryView } from './components/HistoryView';
import { CheckInModal } from './components/CheckInModal';

import { SkincareAnalysis } from './types';
import { getSavedAnalyses, saveAnalysis, deleteAnalysis } from './lib/storage';

export default function App() {
  const [currentView, setCurrentView] = useState<
    'home' | 'questionnaire' | 'photo' | 'ingredient-checker' | 'history' | 'results'
  >('home');

  const [history, setHistory] = useState<SkincareAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<SkincareAnalysis | null>(null);
  const [checkerProfileOverride, setCheckerProfileOverride] = useState<SkincareAnalysis | null>(null);
  const [checkInTargetAnalysis, setCheckInTargetAnalysis] = useState<SkincareAnalysis | null>(null);

  // Load saved history on mount
  useEffect(() => {
    const loaded = getSavedAnalyses();
    setHistory(loaded);
  }, []);

  const handleAnalysisComplete = (analysis: SkincareAnalysis) => {
    const updatedHistory = saveAnalysis(analysis);
    setHistory(updatedHistory);
    setSelectedAnalysis(analysis);
    setCurrentView('results');
  };

  const handleDeleteAnalysis = (id: string) => {
    const updated = deleteAnalysis(id);
    setHistory(updated);
    if (selectedAnalysis?.id === id) {
      setSelectedAnalysis(null);
      setCurrentView('home');
    }
  };

  const handleOpenCheckerForAnalysis = (analysis: SkincareAnalysis) => {
    setCheckerProfileOverride(analysis);
    setCurrentView('ingredient-checker');
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view !== 'results') {
            setCheckerProfileOverride(null);
          }
        }}
        savedCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {currentView === 'home' && (
          <HomeScreen
            onStartQuestionnaire={() => setCurrentView('questionnaire')}
            onStartPhoto={() => setCurrentView('photo')}
            onOpenChecker={() => setCurrentView('ingredient-checker')}
            onOpenHistory={() => setCurrentView('history')}
            onSelectHistoryItem={(item) => {
              setSelectedAnalysis(item);
              setCurrentView('results');
            }}
            onOpenCheckIn={(item) => setCheckInTargetAnalysis(item)}
            history={history}
          />
        )}

        {currentView === 'questionnaire' && (
          <QuestionnaireFlow
            onBack={() => setCurrentView('home')}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'photo' && (
          <PhotoAnalysisFlow
            onBack={() => setCurrentView('home')}
            onAnalysisComplete={handleAnalysisComplete}
          />
        )}

        {currentView === 'results' && selectedAnalysis && (
          <AnalysisResultsView
            analysis={selectedAnalysis}
            onBack={() => setCurrentView('home')}
            onOpenIngredientChecker={handleOpenCheckerForAnalysis}
            onOpenCheckIn={(item) => setCheckInTargetAnalysis(item)}
            allAnalyses={history}
            onSelectAnalysis={(item) => setSelectedAnalysis(item)}
          />
        )}

        {currentView === 'ingredient-checker' && (
          <IngredientChecker
            onBack={() => setCurrentView('home')}
            savedAnalyses={history}
            activeProfileOverride={checkerProfileOverride}
          />
        )}

        {currentView === 'history' && (
          <HistoryView
            onBack={() => setCurrentView('home')}
            history={history}
            onSelectAnalysis={(item) => {
              setSelectedAnalysis(item);
              setCurrentView('results');
            }}
            onDeleteAnalysis={handleDeleteAnalysis}
            onStartNew={() => setCurrentView('questionnaire')}
            onOpenCheckIn={(item) => setCheckInTargetAnalysis(item)}
          />
        )}
      </main>

      {/* Routine Check-in Modal */}
      <CheckInModal
        analysis={checkInTargetAnalysis}
        isOpen={!!checkInTargetAnalysis}
        onClose={() => setCheckInTargetAnalysis(null)}
        onCheckInComplete={handleAnalysisComplete}
      />

      {/* Footer */}
      <footer className="border-t border-rose-100/60 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-serif font-medium text-slate-700">ESEM — AI-Powered Skincare Guidance</p>
          <p className="text-[11px] text-slate-400">
            Provides general cosmetic skincare recommendations. Not a substitute for professional medical advice or dermatology diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
