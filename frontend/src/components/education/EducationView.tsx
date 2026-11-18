import React, { useState, useEffect } from 'react';
import { 
  BookOpen, HelpCircle, CheckCircle, XCircle, 
  Sparkles, Award, ExternalLink, Lightbulb 
} from 'lucide-react';
import { api } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export const EducationView: React.FC = () => {
  const { language } = useLanguage();
  const [topics, setTopics] = useState<any[]>([]);
  const [quiz, setQuiz] = useState<any[]>([]);
  const [facts, setFacts] = useState<string[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function loadContent() {
      try {
        const [topData, qzData, fctData] = await Promise.all([
          api.getEducationalTopics(language),
          api.getQuiz(),
          api.getDailyFacts(),
        ]);
        setTopics(topData);
        if (topData.length > 0) setSelectedTopic(topData[0]);
        setQuiz(qzData);
        setFacts(fctData);
      } catch (e) {
        console.error(e);
      }
    }
    loadContent();
  }, [language]);

  const handleSelectOption = (index: number) => {
    if (isAnswerRevealed) return;
    setSelectedOption(index);
    setIsAnswerRevealed(true);
    if (index === quiz[currentQuizIdx].correct_index) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    if (currentQuizIdx < quiz.length - 1) {
      setCurrentQuizIdx(prev => prev + 1);
    } else {
      // Completed
      setCurrentQuizIdx(0);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex items-center space-x-3">
        <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-300 border border-teal-500/30">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-white">Educational Environmental Intelligence</h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Master atmospheric science: understand CPCB breakpoints, aerodynamic particulate diameters, and winter inversion physics
          </p>
        </div>
      </div>

      {/* Daily Atmospheric Facts Strip */}
      {facts.length > 0 && (
        <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
            <Lightbulb className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-xs text-teal-200 leading-relaxed">
            <strong className="text-white block mb-0.5">Daily Atmospheric Fact:</strong>
            {facts[0]}
          </div>
        </div>
      )}

      {/* Topics and Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topics List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="font-extrabold text-base text-white">Science Modules</h3>
          <div className="space-y-2">
            {topics.map((t) => {
              const isSelected = selectedTopic?.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-4 rounded-xl cursor-pointer transition border ${
                    isSelected
                      ? 'bg-neutral-800 border-teal-500 shadow-md'
                      : 'bg-neutral-900/80 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-teal-400 tracking-wider">
                    {t.category}
                  </span>
                  <h4 className="font-bold text-sm text-white mt-1">{t.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {t.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Topic Content */}
        <div className="lg:col-span-7">
          {selectedTopic && (
            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
              <div>
                <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">
                  {selectedTopic.category}
                </span>
                <h3 className="text-xl font-black text-white mt-1">{selectedTopic.title}</h3>
              </div>

              <div className="text-sm text-neutral-200 leading-relaxed whitespace-pre-line border-t border-neutral-800 pt-4">
                {selectedTopic.content}
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-mono">Reference: {selectedTopic.source}</span>
                <span className="text-teal-400 flex items-center space-x-1">
                  <span>Verified Science</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Knowledge Quiz */}
      {quiz.length > 0 && (
        <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-teal-400" />
              <h3 className="font-extrabold text-base text-white">ClearSky Knowledge Quiz</h3>
            </div>
            <div className="text-xs font-bold text-teal-400">
              Question {currentQuizIdx + 1} of {quiz.length} • Score: {score}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-bold text-white">
              {quiz[currentQuizIdx].question}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quiz[currentQuizIdx].options.map((opt: string, idx: number) => {
                let btnStyle = 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 text-neutral-200';
                if (isAnswerRevealed) {
                  if (idx === quiz[currentQuizIdx].correct_index) {
                    btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                  } else if (idx === selectedOption) {
                    btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswerRevealed}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition flex items-center justify-between ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswerRevealed && idx === quiz[currentQuizIdx].correct_index && (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    {isAnswerRevealed && idx === selectedOption && idx !== quiz[currentQuizIdx].correct_index && (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswerRevealed && (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2 animate-in fade-in">
                <span className="text-xs font-bold text-teal-400">Scientific Explanation:</span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {quiz[currentQuizIdx].explanation}
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition"
                  >
                    {currentQuizIdx < quiz.length - 1 ? 'Next Question →' : 'Restart Quiz'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
