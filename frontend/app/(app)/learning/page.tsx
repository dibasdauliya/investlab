"use client";

import React, { useState, useEffect } from "react";
import { LEARNING_MODULES } from "../../lib/curriculum-data"; 
import { BookOpen, CheckCircle, PlayCircle, ChevronRight, ChevronDown, RotateCcw, Award, Brain, Circle } from "lucide-react";

export default function LearningPage() {
  const [activeModuleId, setActiveModuleId] = useState<string>(LEARNING_MODULES[0].id);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(LEARNING_MODULES[0].lessons[0].id);
  const [quizMode, setQuizMode] = useState<boolean>(false);
  
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [moduleScores, setModuleScores] = useState<Record<string, number>>({});
  const [currentQuizAnswers, setCurrentQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem('fin_course_progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCompletedLessons(new Set(parsed.completedLessons || []));
        setModuleScores(parsed.moduleScores || {});
        setCurrentQuizAnswers(parsed.currentQuizAnswers || {});
        setQuizSubmitted(parsed.quizSubmitted || {});
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage whenever any progress changes
  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') return;
    
    const timer = setTimeout(() => {
      localStorage.setItem('fin_course_progress', JSON.stringify({
        completedLessons: Array.from(completedLessons),
        moduleScores,
        currentQuizAnswers,
        quizSubmitted
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [completedLessons, moduleScores, currentQuizAnswers, quizSubmitted, isHydrated]);

  // Scroll main content area to top when module or lesson changes
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }
  }, [activeModuleId, activeLessonId, quizMode]);

  const handleLessonComplete = (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
  };

  const handleQuizOptionSelect = (qId: string, optionIndex: number) => {
    if (quizSubmitted[activeModuleId]) return;
    setCurrentQuizAnswers(prev => ({...prev, [qId]: optionIndex}));
  };

  const submitQuiz = (moduleId: string) => {
    const module = LEARNING_MODULES.find(m => m.id === moduleId);
    if (!module) return;

    let score = 0;
    module.quiz.forEach((q) => {
      if (currentQuizAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });

    setModuleScores(prev => ({...prev, [moduleId]: Math.max(prev[moduleId] || 0, score)}));
    setQuizSubmitted(prev => ({...prev, [moduleId]: true}));
  };

  const resetQuiz = (moduleId: string) => {
    setQuizSubmitted(prev => ({...prev, [moduleId]: false}));
    const module = LEARNING_MODULES.find(m => m.id === moduleId);
    if (module) {
      const updatedAnswers = {...currentQuizAnswers};
      module.quiz.forEach(q => {
        delete updatedAnswers[q.id];
      });
      setCurrentQuizAnswers(updatedAnswers);
    }
  };

  const navigateToModule = (modId: string) => {
    setActiveModuleId(modId);
    setQuizMode(false);
    const mod = LEARNING_MODULES.find(m => m.id === modId);
    if (mod && mod.lessons.length > 0) {
      setActiveLessonId(mod.lessons[0].id);
    }
  };

  const activeModule = LEARNING_MODULES.find(m => m.id === activeModuleId);
  const activeLesson = activeModule?.lessons.find(l => l.id === activeLessonId);
  
  const totalLessons = LEARNING_MODULES.reduce((acc, m) => acc + m.lessons.length, 0);
  const progressPercent = Math.round((completedLessons.size / totalLessons) * 100);

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      {/* Progress Header */}
      <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-foreground">Learning Center</h1>
          <p className="mt-2 text-muted">Master the theory of markets before you trade.</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-muted mb-2">{progressPercent}% Complete</p>
          <div className="w-48 h-2 bg-input-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent transition-all duration-500" 
              style={{width: `${progressPercent}%`}} 
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SIDEBAR */}
        <aside className="lg:col-span-3 space-y-3 h-fit sticky top-6">
          {LEARNING_MODULES.map((module) => {
            const isActive = activeModuleId === module.id;
            const modScore = moduleScores[module.id];
            const isPassed = modScore >= 4;

            return (
              <div key={module.id}>
                <button
                  onClick={() => navigateToModule(module.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-card border-accent/50 shadow-sm'
                      : 'bg-card/50 border-border hover:border-border hover:bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${isActive ? 'text-accent' : 'text-muted opacity-50'}`}>
                        {module.icon}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-foreground">{module.title}</h3>
                        <p className="text-xs text-muted mt-1">{module.lessons.length} lessons</p>
                      </div>
                    </div>
                    {isPassed && <Award className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
                    {isActive ? <ChevronDown className="w-4 h-4 text-accent/50 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted/30 flex-shrink-0" />}
                  </div>
                </button>

                {isActive && (
                  <div className="ml-6 space-y-2 border-l-2 border-border pl-4 mt-2">
                    {module.lessons.map(lesson => {
                      const isComplete = completedLessons.has(lesson.id);
                      const isSelected = activeLessonId === lesson.id && !quizMode;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => { setActiveLessonId(lesson.id); setQuizMode(false); }}
                          className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-input-bg text-foreground font-medium'
                              : 'text-muted hover:text-foreground hover:bg-input-bg/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isComplete ? (
                              <CheckCircle size={16} className="text-accent-2 flex-shrink-0" />
                            ) : (
                              <Circle size={16} className="text-border flex-shrink-0" />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </div>
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setQuizMode(true)}
                      className={`w-full text-left text-sm py-2 px-3 rounded-lg transition-all flex items-center gap-2 mt-3 font-bold ${
                        quizMode
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                          : 'text-purple-400/70 hover:text-purple-400 hover:bg-purple-500/5 border border-purple-500/20'
                      }`}
                    >
                      <Brain size={16} />
                      <span>Module Quiz</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </aside>

        {/* RIGHT CONTENT - Scrollable Container */}
        <main className="lg:col-span-9 overflow-y-auto max-h-[calc(100vh-200px)]">
          {!quizMode && activeLesson && activeModule ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-2 text-sm font-mono text-muted mb-6">
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-md font-bold uppercase text-xs tracking-wide">
                  {activeModule.title.split(':')[0]}
                </span>
                <ChevronRight size={14} />
                <span>{activeLesson.duration} read</span>
              </div>

              <h1 className="text-4xl font-black mb-8 text-foreground tracking-tight">
                {activeLesson.title}
              </h1>

              <div className="prose dark:prose-invert max-w-none mb-12 text-foreground">
                {activeLesson.content}
              </div>

              <div className="border-t border-border pt-8 flex items-center justify-between">
                <p className="text-sm text-muted">
                  {completedLessons.has(activeLesson.id) 
                    ? '✓ Lesson completed' 
                    : 'Read the material to complete this lesson'}
                </p>
                <button
                  onClick={() => handleLessonComplete(activeLesson.id)}
                  disabled={completedLessons.has(activeLesson.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                    completedLessons.has(activeLesson.id)
                      ? 'bg-accent-2/10 text-accent-2 border border-accent-2/20 cursor-default'
                      : 'bg-accent-2 text-white hover:bg-accent-2/90 shadow-lg shadow-accent-2/20'
                  }`}
                >
                  {completedLessons.has(activeLesson.id) ? (
                    <>
                      <CheckCircle size={20} />
                      Completed
                    </>
                  ) : (
                    <>
                      <Circle size={20} />
                      Mark Complete
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : quizMode && activeModule ? (
            <div className="animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-black text-foreground">{activeModule.title}</h2>
                  <p className="text-muted mt-2">Test your knowledge (5 questions)</p>
                </div>
                {moduleScores[activeModule.id] >= 4 && (
                  <div className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg flex items-center gap-2 font-bold border border-yellow-500/20">
                    <Award size={20} />
                    Passed
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {activeModule.quiz.map((q, idx) => {
                  const selectedIndex = currentQuizAnswers[q.id];
                  const isCorrect = selectedIndex === q.correctIndex;
                  const hasAnswered = selectedIndex !== undefined;
                  const isSubmitted = quizSubmitted[activeModule.id];

                  return (
                    <div
                      key={q.id}
                      className={`p-6 rounded-xl border transition-all ${
                        isSubmitted
                          ? hasAnswered && isCorrect
                            ? 'border-accent-2/50 bg-accent-2/5'
                            : hasAnswered && !isCorrect
                            ? 'border-red-500/50 bg-red-500/5'
                            : 'border-border bg-card'
                          : 'border-border bg-card'
                      }`}
                    >
                      <h4 className="font-bold text-lg mb-4 text-foreground flex gap-3">
                        <span className="text-muted font-mono text-sm">{idx + 1}.</span>
                        {q.question}
                      </h4>

                      <div className="space-y-3">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = selectedIndex === optIdx;
                          const showCorrect = isSubmitted && optIdx === q.correctIndex;
                          const showIncorrect = isSubmitted && isSelected && optIdx !== q.correctIndex;

                          return (
                            <button
                              key={optIdx}
                              disabled={isSubmitted}
                              onClick={() => handleQuizOptionSelect(q.id, optIdx)}
                              className={`w-full text-left p-4 rounded-lg border transition-all ${
                                isSelected && !isSubmitted
                                  ? 'border-accent bg-accent/5 text-foreground font-medium'
                                  : 'border-border hover:border-border hover:bg-input-bg/50'
                              } ${showCorrect ? '!border-accent-2 !bg-accent-2/10' : ''} ${
                                showIncorrect ? '!border-red-500 !bg-red-500/10' : ''
                              }`}
                            >
                              <span className="text-foreground">{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && hasAnswered && (
                        <div className={`mt-4 text-sm p-3 rounded font-medium ${isCorrect ? 'text-accent-2' : 'text-red-500'}`}>
                          <strong>{isCorrect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
                          <p className="mt-1">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex gap-4 items-center">
                {!quizSubmitted[activeModule.id] ? (
                  <button
                    onClick={() => submitQuiz(activeModule.id)}
                    disabled={Object.keys(currentQuizAnswers).length < 5}
                    className="px-8 py-3 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => resetQuiz(activeModule.id)}
                      className="px-8 py-3 bg-input-bg hover:bg-border text-foreground font-bold rounded-xl flex items-center gap-2 border border-border transition-all"
                    >
                      <RotateCcw size={18} />
                      Retry
                    </button>
                    <div className="flex-1 text-right">
                      <p className="text-lg font-bold">
                        Score:{' '}
                        <span className={moduleScores[activeModule.id] >= 4 ? 'text-accent-2' : 'text-red-500'}>
                          {moduleScores[activeModule.id] || 0}/5
                        </span>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}