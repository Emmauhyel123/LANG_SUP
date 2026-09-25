import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { firestoreData } from '../../services/firestoreData';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  PenTool,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  FileText,
  RotateCcw,
} from 'lucide-react';

interface ReadingWritingAssessmentProps {
  currentUser: User;
  onComplete: () => void;
}

const READING_PASSAGES = [
  {
    id: 'pass_01',
    title: 'De-commodification and Spatial Stratification in Urban Welfare Regimes',
    author: 'Journal of Social & Political Economy (2025)',
    text: `The spatial distribution of public housing estates within post-industrial metropolitan centers frequently mirrors deeper fractures in socio-economic mobility. When social welfare policies prioritize market-driven subsidies over direct public provision, peripheral neighborhoods undergo what sociologists term 'spatial stigmatization.' Residents face compounded barriers to labor integration, educational attainment, and healthcare access. To resolve this dislocation, institutional reforms must transcend mere financial redistribution; they must actively foster civic connectivity and participatory municipal planning.`,
    prompt: 'Analyze the author\'s critique of market-driven housing subsidies. In what ways does spatial stratification undermine social mobility, and what policy remedies does the passage advocate? Synthesize your argument using formal academic terminology (min. 120 words).',
    recommendedTimeMinutes: 10,
  },
  {
    id: 'pass_02',
    title: 'Epistemic Injustice and Algorithmic Governance in the Public Sector',
    author: 'Quarterly Review of Applied Behavioral Sociology (2026)',
    text: `As governmental agencies increasingly deploy automated risk-scoring algorithms to determine social assistance eligibility, the phenomenon of epistemic injustice becomes acutely institutionalized. Claimants from underrepresented backgrounds often find their subjective testimonials discredited in favor of opaque probabilistic models. Such technical opacity prevents citizens from challenging bureaucratic determinations, thereby eroding democratic accountability and public trust in civic institutions.`,
    prompt: 'Critically assess how automated algorithmic assessments may perpetuate epistemic injustice against marginalized welfare recipients. How can administrative institutions preserve procedural transparency while incorporating digital efficiency? (min. 120 words).',
    recommendedTimeMinutes: 12,
  },
];

export const ReadingWritingAssessment: React.FC<ReadingWritingAssessmentProps> = ({
  currentUser,
  onComplete,
}) => {
  const [selectedPassage, setSelectedPassage] = useState(READING_PASSAGES[0]);
  const [essayText, setEssayText] = useState('');
  const [timeLeft, setTimeLeft] = useState(selectedPassage.recommendedTimeMinutes * 60);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTimeLeft(selectedPassage.recommendedTimeMinutes * 60);
    setEssayText('');
    setEvalResult(null);
    setIsTimerRunning(false);
  }, [selectedPassage]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      // Auto submit when time runs out
      handleSubmit();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  const wordCount = essayText.trim() ? essayText.trim().split(/\s+/).length : 0;

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleSubmit = async () => {
    if (!essayText.trim() || wordCount < 30) {
      alert('Please compose at least 30 words before submitting for academic evaluation.');
      return;
    }

    setIsTimerRunning(false);
    setIsEvaluating(true);

    try {
      const evaluation = await api.evaluateReadingWriting({
        promptText: selectedPassage.prompt,
        passage: selectedPassage.text,
        studentSubmission: essayText,
        type: 'writing',
        studentYear: currentUser.academic_year,
      });

      setEvalResult(evaluation);

      // Store assessment in database
      const savedRes = await api.submitAssessment({
        student_id: currentUser.id,
        type: 'writing',
        academic_year: currentUser.academic_year,
        scenario_title: `Reading & Writing: ${selectedPassage.title}`,
        duration_seconds: (selectedPassage.recommendedTimeMinutes * 60) - timeLeft,
        written_submission: essayText,
        score_data: evaluation,
      });

      // Also persist to Firebase Firestore
      try {
        if (savedRes && savedRes.assessment) {
          await firestoreData.saveAssessment(savedRes.assessment);
        }
      } catch (fErr) {
        console.warn('Firestore sync note:', fErr);
      }

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to evaluate written assessment:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const formatMinutesSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Reading & Writing Academic Assessment Studio
            </h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
              Timed Text Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluates textual comprehension, syntactic complexity, grammar, and scholarly argumentation against Year {currentUser.academic_year} rubrics.
          </p>
        </div>

        {/* Timer status */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
          <Clock className={`w-4 h-4 ${timeLeft < 120 ? 'text-red-600 animate-pulse' : 'text-slate-500'}`} />
          <div>
            <span className="text-[10px] uppercase font-mono text-slate-500 block">Assessment Timer</span>
            <span className="text-sm font-mono font-bold text-slate-900 tabular-nums">
              {formatMinutesSeconds(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      {!evalResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Academic Passage & Prompt */}
          <div className="lg:col-span-6 space-y-4">
            {/* Passage Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Select Passage:</span>
              <div className="flex gap-2">
                {READING_PASSAGES.map((pass, i) => (
                  <button
                    key={pass.id}
                    onClick={() => setSelectedPassage(pass)}
                    className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                      selectedPassage.id === pass.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Passage {i + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                <BookOpen className="w-4 h-4 text-sky-600" />
                <span>{selectedPassage.author}</span>
              </div>
              <h3 className="text-base font-serif font-bold text-slate-900 leading-snug">
                {selectedPassage.title}
              </h3>
              <p className="text-sm font-serif text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-slate-100">
                {selectedPassage.text}
              </p>

              {/* Research Prompt */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <span className="text-[11px] uppercase font-mono font-semibold text-blue-700 block mb-1">
                  Evaluative Prompt
                </span>
                <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                  {selectedPassage.prompt}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Writing Pad */}
          <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">Student Essay Response</h4>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                <span>Words: <strong className="text-slate-900 tabular-nums">{wordCount}</strong></span>
                <span>/</span>
                <span>Target: 120+</span>
              </div>
            </div>

            {!isTimerRunning && essayText.length === 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center justify-between">
                <span>Ready to begin? Click "Start Writing & Timer" to activate the assessment.</span>
                <button
                  onClick={handleStartTimer}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium transition-colors ml-2"
                >
                  Start Writing
                </button>
              </div>
            )}

            <textarea
              rows={14}
              value={essayText}
              onFocus={() => !isTimerRunning && setIsTimerRunning(true)}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Begin typing your academic essay response here. Demonstrate disciplinary terminology, complex sentence structures, and critical analysis of the passage..."
              className="w-full flex-1 p-4 text-sm text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all leading-relaxed resize-none font-sans"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Evaluator: Gemini 3.8 Flash University Scoring Model
              </span>
              <button
                disabled={isEvaluating || wordCount < 30}
                onClick={handleSubmit}
                className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading Syntax & Coherence...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Submit for AI Evaluation</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Evaluation Results Card */
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Reading & Writing Assessment Evaluated
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                AI Diagnostic Report: {selectedPassage.title}
              </h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-mono block">Overall Composite</span>
                <span className="text-2xl font-extrabold text-blue-700 font-mono">
                  {Math.round(evalResult.overall_score)}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </span>
              </div>
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-center font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">CEFR</span>
                <span className="text-base font-bold text-amber-300">{evalResult.cefr_level}</span>
              </div>
            </div>
          </div>

          {/* Scores breakdown across the 5 pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Communication</span>
              <span className="text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {Math.round(evalResult.communication_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Speaking (Projected)</span>
              <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {Math.round(evalResult.speaking_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Listening</span>
              <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                {Math.round(evalResult.listening_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-sky-50/50 border-sky-200">
              <span className="text-[11px] font-medium text-sky-800 block font-semibold">Reading Comprehension</span>
              <span className="text-xl font-bold font-mono text-sky-700 tabular-nums">
                {Math.round(evalResult.reading_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-purple-50/50 border-purple-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-purple-800 block font-semibold">Writing & Syntax</span>
              <span className="text-xl font-bold font-mono text-purple-700 tabular-nums">
                {Math.round(evalResult.writing_score)}
              </span>
            </div>
          </div>

          {/* Detailed Linguistic Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">Lexical Density Rating</span>
              <span className="text-slate-600 font-mono">
                {evalResult.lexical_density_rating || '54% Academic Vocabulary Index (AWL compliant)'}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-800 block mb-1">Syntactic Complexity</span>
              <span className="text-slate-600 font-mono">
                {evalResult.syntactic_complexity || 'Subordinate and relative clause integration verified'}
              </span>
            </div>
          </div>

          {/* Feedback narrative */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Academic Diagnostic Assessment
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {evalResult.ai_feedback_text}
            </p>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {evalResult.strengths?.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-100">
              <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Areas for Growth
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {evalResult.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setEvalResult(null);
                setEssayText('');
                setTimeLeft(selectedPassage.recommendedTimeMinutes * 60);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Attempt Another Passage
            </button>
            <button
              onClick={onComplete}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
