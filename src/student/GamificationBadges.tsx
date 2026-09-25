import React, { useState } from 'react';
import { User, Assessment, Badge, BadgeCategory, BadgeTier } from '../../types';
import { calculateStudentBadges } from '../../services/badgeService';
import {
  Award,
  Mic,
  CalendarCheck,
  MessageSquare,
  Volume2,
  BookOpen,
  PenTool,
  Layers,
  TrendingUp,
  GraduationCap,
  Sparkles,
  ScrollText,
  CheckCircle2,
  Lock,
  ArrowUpRight,
  Shield,
  X,
  Target,
} from 'lucide-react';

interface GamificationBadgesProps {
  currentUser: User;
  assessments: Assessment[];
  onNavigateToInterview: () => void;
  onNavigateToWriting: () => void;
  onNavigateToPillars: () => void;
}

export const GamificationBadges: React.FC<GamificationBadgesProps> = ({
  currentUser,
  assessments,
  onNavigateToInterview,
  onNavigateToWriting,
  onNavigateToPillars,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unlocked' | BadgeCategory>('all');
  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);

  const badges = calculateStudentBadges(currentUser, assessments);

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalPoints = badges
    .filter((b) => b.unlocked)
    .reduce((sum, b) => sum + b.academicPoints, 0);

  const filteredBadges = badges.filter((b) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unlocked') return b.unlocked;
    return b.category === selectedFilter;
  });

  const getBadgeIcon = (iconName: string, className: string = 'w-6 h-6') => {
    switch (iconName) {
      case 'Mic':
        return <Mic className={className} />;
      case 'CalendarCheck':
        return <CalendarCheck className={className} />;
      case 'MessageSquare':
        return <MessageSquare className={className} />;
      case 'Volume2':
        return <Volume2 className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'PenTool':
        return <PenTool className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'ScrollText':
        return <ScrollText className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getTierColors = (tier: BadgeTier, unlocked: boolean) => {
    if (!unlocked) {
      return {
        cardBg: 'bg-slate-50/70 border-slate-200',
        badgeBg: 'bg-slate-200 text-slate-500',
        ring: 'ring-slate-100',
        tagBg: 'text-slate-500',
      };
    }
    switch (tier) {
      case 'bronze':
        return {
          cardBg: 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-800 border border-amber-300',
          ring: 'ring-amber-200',
          tagBg: 'text-amber-800',
        };
      case 'silver':
        return {
          cardBg: 'bg-slate-50 border-slate-300 hover:border-slate-400',
          badgeBg: 'bg-slate-200 text-slate-800 border border-slate-300',
          ring: 'ring-slate-200',
          tagBg: 'text-slate-700',
        };
      case 'gold':
        return {
          cardBg: 'bg-amber-50/60 border-amber-300 hover:border-amber-400',
          badgeBg: 'bg-amber-400 text-slate-900 border border-amber-500 shadow-xs',
          ring: 'ring-amber-300',
          tagBg: 'text-amber-900',
        };
      case 'diamond':
        return {
          cardBg: 'bg-sky-50/50 border-sky-300 hover:border-sky-400',
          badgeBg: 'bg-sky-600 text-white border border-sky-400 shadow-xs',
          ring: 'ring-sky-200',
          tagBg: 'text-sky-800',
        };
    }
  };

  return (
    <div className="space-y-8">
      {/* Gamification Honors Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Academic Honors & Language Mastery Badges
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2 font-sans">
              Five Pillars Gamification & Competency System
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Earn institutional commendations as you achieve linguistic milestones across Communication, Speaking, Listening, Reading, and Writing throughout the 3-year pilot study.
            </p>
          </div>

          {/* Points & Total Unlocked Showcase */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-lg p-3.5 shrink-0">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Honors Unlocked
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-blue-700 font-mono tabular-nums">
                  {unlockedCount}
                </span>
                <span className="text-xs text-slate-500">/ {badges.length}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div className="text-center sm:text-left">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 block">
                Scholar Honor Points
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {totalPoints}
                </span>
                <span className="text-xs text-slate-500">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pillar Mastery Progress Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Cumulative Gamification Completion</span>
            <span className="font-mono text-blue-700 font-bold">
              {Math.round((unlockedCount / badges.length) * 100)}% Completed
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-700"
              style={{ width: `${(unlockedCount / badges.length) * 100}%` }}
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Honors ({badges.length})
        </button>

        <button
          onClick={() => setSelectedFilter('unlocked')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'unlocked'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Unlocked ({unlockedCount})
        </button>

        <button
          onClick={() => setSelectedFilter('speaking')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'speaking'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Speaking
        </button>

        <button
          onClick={() => setSelectedFilter('communication')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'communication'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Communication
        </button>

        <button
          onClick={() => setSelectedFilter('listening')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'listening'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Listening
        </button>

        <button
          onClick={() => setSelectedFilter('reading')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'reading'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Reading
        </button>

        <button
          onClick={() => setSelectedFilter('writing')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'writing'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Writing
        </button>

        <button
          onClick={() => setSelectedFilter('overall')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
            selectedFilter === 'overall'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          Consistency & Overall
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const style = getTierColors(badge.tier, badge.unlocked);

          return (
            <div
              key={badge.id}
              onClick={() => setInspectingBadge(badge)}
              className={`p-5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between shadow-xs hover:shadow-sm ${style.cardBg}`}
            >
              <div>
                {/* Top bar on badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${style.badgeBg}`}
                  >
                    {getBadgeIcon(badge.iconName, 'w-6 h-6')}
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider block text-slate-400">
                      {badge.tier}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      +{badge.academicPoints} pts
                    </span>
                  </div>
                </div>

                {/* Title & Pillar */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <span>{badge.pillarLabel}</span>
                  {badge.unlocked && (
                    <>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Unlocked
                      </span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{badge.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Bottom Progress or Unlocked Stamp */}
              <div className="mt-4 pt-3 border-t border-slate-200/60">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-mono">Criteria Met</span>
                    <span className="font-mono text-emerald-700 font-semibold">100%</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>{badge.currentMetricText}</span>
                      </span>
                      <span className="font-mono font-semibold text-slate-700">{badge.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Action Bar for Next Milestone */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Accelerate Your Gamification Progress</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete an AI Mock Interview or Reading & Writing evaluation to unlock 'Fluent Speaker' and 'Discourse Master' badges.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToInterview}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Mic className="w-3.5 h-3.5" />
            Launch AI Mock Interview
          </button>
          <button
            onClick={onNavigateToWriting}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <PenTool className="w-3.5 h-3.5" />
            Take Writing Test
          </button>
        </div>
      </section>

      {/* Badge Inspection Modal */}
      {inspectingBadge && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    getTierColors(inspectingBadge.tier, inspectingBadge.unlocked).badgeBg
                  }`}
                >
                  {getBadgeIcon(inspectingBadge.iconName, 'w-6 h-6')}
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    {inspectingBadge.tier} Tier · {inspectingBadge.pillarLabel}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{inspectingBadge.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setInspectingBadge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {inspectingBadge.description}
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-semibold text-slate-800 block">Earning Criteria:</span>
              <p className="text-slate-600 leading-relaxed">{inspectingBadge.criteria}</p>
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Award Value:</span>
                <span className="font-mono font-bold text-slate-900">+{inspectingBadge.academicPoints} Academic Points</span>
              </div>
            </div>

            {inspectingBadge.unlocked ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">Honor Officially Awarded</span>
                  <span className="text-[11px] text-emerald-800">
                    Recorded in your student permanent transcript.
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium">Current Progress:</span>
                  <span className="font-mono font-bold text-blue-700">{inspectingBadge.currentMetricText} ({inspectingBadge.progress}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${inspectingBadge.progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectingBadge(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
