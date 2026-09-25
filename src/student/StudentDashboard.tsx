import React from 'react';
import { User, Assessment, Score } from '../../types';
import { PillarRadarChart } from '../common/PillarRadarChart';
import { calculateStudentBadges } from '../../services/badgeService';
import {
  Mic,
  BookOpen,
  MessageSquare,
  Volume2,
  PenTool,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  CalendarCheck,
  Layers,
  GraduationCap,
  ChevronRight,
  Lock,
} from 'lucide-react';

interface StudentDashboardProps {
  currentUser: User;
  assessments: Assessment[];
  onNavigate: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  currentUser,
  assessments,
  onNavigate,
}) => {
  // Find most recent completed assessment with score
  const completedAssessments = assessments
    .filter((a) => a.score)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const latestAssessment = completedAssessments[0];
  const latestScore: Score | undefined = latestAssessment?.score;

  // Average or latest scores across the 5 pillars
  const currentScores = {
    communication: latestScore?.communication_score ?? 72,
    speaking: latestScore?.speaking_score ?? 70,
    listening: latestScore?.listening_score ?? 76,
    reading: latestScore?.reading_score ?? 74,
    writing: latestScore?.writing_score ?? 69,
  };

  const overallAvg = latestScore?.overall_score
    ? Math.round(latestScore.overall_score)
    : Math.round(
        (currentScores.communication +
          currentScores.speaking +
          currentScores.listening +
          currentScores.reading +
          currentScores.writing) /
          5
      );

  const targetBenchmark = {
    communication: currentUser.academic_year === 1 ? 70 : currentUser.academic_year === 2 ? 80 : 90,
    speaking: currentUser.academic_year === 1 ? 70 : currentUser.academic_year === 2 ? 80 : 90,
    listening: currentUser.academic_year === 1 ? 75 : currentUser.academic_year === 2 ? 82 : 92,
    reading: currentUser.academic_year === 1 ? 72 : currentUser.academic_year === 2 ? 82 : 90,
    writing: currentUser.academic_year === 1 ? 70 : currentUser.academic_year === 2 ? 80 : 90,
  };

  const cefr = latestScore?.cefr_level || (currentUser.academic_year === 1 ? 'B1+' : currentUser.academic_year === 2 ? 'B2' : 'C1');

  // Gamification Badges calculation
  const badges = calculateStudentBadges(currentUser, assessments);
  const unlockedBadges = badges.filter((b) => b.unlocked);
  const totalHonorPoints = unlockedBadges.reduce((sum, b) => sum + b.academicPoints, 0);
  const nextMilestoneBadge = badges.find((b) => !b.unlocked);

  const getDashboardBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Mic': return <Mic className="w-4 h-4 text-emerald-600" />;
      case 'CalendarCheck': return <CalendarCheck className="w-4 h-4 text-amber-600" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-indigo-600" />;
      case 'Volume2': return <Volume2 className="w-4 h-4 text-amber-600" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-sky-600" />;
      case 'PenTool': return <PenTool className="w-4 h-4 text-purple-600" />;
      case 'Layers': return <Layers className="w-4 h-4 text-blue-600" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4 text-amber-600" />;
      default: return <Award className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Student Profile & Pilot Study Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-blue-100 border border-slate-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
                <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {currentUser.student_id_code}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">{currentUser.department}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                <span className="font-semibold text-blue-700">Academic Year {currentUser.academic_year} of 3</span>
                <span>·</span>
                <span>Enrolled {currentUser.enrolled_date}</span>
                <span>·</span>
                <span>{completedAssessments.length} Completed Pilot Milestones</span>
              </div>
            </div>
          </div>

          {/* Longitudinal Milestones Progress */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Assessed CEFR Level
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-blue-700 font-mono">{cefr}</span>
                <span className="text-xs text-slate-500">
                  Target: {currentUser.academic_year === 3 ? 'C1/C2 Capstone' : 'C1 Proficient'}
                </span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Composite Index
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {overallAvg}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Year Longitudinal Track Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
            <span className="font-medium">University Longitudinal Study Roadmap</span>
            <span className="text-slate-500 font-mono">Stage: Year {currentUser.academic_year} Assessment Cycle</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className={`p-2.5 rounded-lg border text-xs ${
              currentUser.academic_year >= 1
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Year 1: Foundation</span>
                {currentUser.academic_year >= 1 && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Baseline Diagnostic, Lexicon & Fluency</p>
            </div>

            <div className={`p-2.5 rounded-lg border text-xs ${
              currentUser.academic_year >= 2
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Year 2: Discourse</span>
                {currentUser.academic_year >= 2 && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Academic Pragmatics, Debate Defense</p>
            </div>

            <div className={`p-2.5 rounded-lg border text-xs ${
              currentUser.academic_year >= 3
                ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Year 3: Capstone</span>
                {currentUser.academic_year >= 3 && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">Thesis Defense & Grant Milestone</p>
            </div>
          </div>
        </div>

        {/* Academic Honors & Badges Shelf */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Academic Honors & Badges</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {unlockedBadges.length} of {badges.length} Unlocked · {totalHonorPoints} Points
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Pillars Mastery: Speaking ('Fluent Speaker'), Consistency ('Consistent Learner'), Communication, Reading & Writing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5 overflow-hidden">
              {unlockedBadges.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  title={`${b.title}: ${b.description}`}
                  className="w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center"
                >
                  {getDashboardBadgeIcon(b.iconName)}
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('student-badges')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 ml-2 transition-colors"
            >
              <span>View All Badges</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Five Core Pillars & Radar Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Pillars Detailed Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">
              The Five Core Pillars of Language Study
            </h3>
            <button
              onClick={() => onNavigate('student-pillars')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Practice Modules <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Communication */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentScores.communication}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-2">1. Communication</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Pragmatic competence, sociolinguistic register, and academic discourse coherence.
              </p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScores.communication}%` }}
                />
              </div>
            </div>

            {/* 2. Speaking */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentScores.speaking}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-2">2. Speaking</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Phonological accuracy, cadence, vocal fluency, and hesitation rate reduction.
              </p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScores.speaking}%` }}
                />
              </div>
            </div>

            {/* 3. Listening */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Volume2 className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentScores.listening}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-2">3. Listening</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Aural comprehension, rapid acoustic decoding, and contextual follow-up adaptation.
              </p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScores.listening}%` }}
                />
              </div>
            </div>

            {/* 4. Reading */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentScores.reading}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-2">4. Reading</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Academic research text synthesis, critical inference, and rapid skimming comprehension.
              </p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-sky-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScores.reading}%` }}
                />
              </div>
            </div>

            {/* 5. Writing (Full width on sm) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                  <PenTool className="w-4 h-4" />
                </div>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                  {currentScores.writing}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-slate-900 mt-2">5. Writing</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Scholarly syntax, nominalization, lexical diversity, and logical structural argumentation.
              </p>
              <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${currentScores.writing}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Radar Visualization & Quick Actions */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Pillar Competency Radar
              </h3>
              <span className="text-xs text-slate-500 font-mono">
                Year {currentUser.academic_year} Target Benchmark
              </span>
            </div>
            <PillarRadarChart scores={currentScores} benchmark={targetBenchmark} size={280} />
          </div>

          {/* Launch Assessment Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => onNavigate('student-interview')}
              className="p-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-left transition-all shadow-xs group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center mb-3">
                <Mic className="w-5 h-5 text-amber-300" />
              </div>
              <h4 className="text-sm font-bold flex items-center justify-between">
                AI Mock Interview
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h4>
              <p className="text-xs text-blue-100 mt-1">
                Real-time vocal interview with Dr. Vance evaluating Comm, Speaking & Listening.
              </p>
            </button>

            <button
              onClick={() => onNavigate('student-reading-writing')}
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left transition-all shadow-xs group"
            >
              <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                <BookOpen className="w-5 h-5 text-blue-300" />
              </div>
              <h4 className="text-sm font-bold flex items-center justify-between">
                Reading & Writing Test
                <ArrowUpRight className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Timed text prompts with instant AI evaluation of syntax, grammar, and comprehension.
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent AI Evaluator Diagnostic Feedback */}
      {latestScore && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Latest AI Evaluator Diagnostic & Constructive Feedback
            </h3>
            <span className="text-xs text-slate-500 ml-auto font-mono">
              Rubric {latestScore.rubric_version}
            </span>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
            {latestScore.ai_feedback_text}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Strengths */}
            <div className="p-3.5 rounded-lg border border-emerald-100 bg-emerald-50/40">
              <h4 className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Strengths Observed
              </h4>
              <ul className="mt-2 space-y-1.5">
                {latestScore.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Targeted Recommendations */}
            <div className="p-3.5 rounded-lg border border-amber-100 bg-amber-50/40">
              <h4 className="text-xs font-semibold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Targeted Remediation Areas
              </h4>
              <ul className="mt-2 space-y-1.5">
                {latestScore.weaknesses.map((w, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
