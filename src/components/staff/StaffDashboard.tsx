import React from 'react';
import { CohortSummary } from '../../types';
import { PillarRadarChart } from '../common/PillarRadarChart';
import {
  Users,
  Award,
  TrendingUp,
  FileSpreadsheet,
  Sliders,
  ArrowUpRight,
  ShieldCheck,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface StaffDashboardProps {
  cohortData: CohortSummary | null;
  onNavigate: (tab: string) => void;
  onExportCsv: () => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({
  cohortData,
  onNavigate,
  onExportCsv,
}) => {
  if (!cohortData) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500">Loading cohort longitudinal analytics...</p>
      </div>
    );
  }

  const { yearStats, longitudinalTracks, totalStudents, totalAssessments, rubricConfig } = cohortData;

  const y1Stats = yearStats.find((y) => y.academic_year === 1);
  const y2Stats = yearStats.find((y) => y.academic_year === 2);
  const y3Stats = yearStats.find((y) => y.academic_year === 3);

  const overallY1 = y1Stats?.averages.overall || 65;
  const overallY3 = y3Stats?.averages.overall || 88;
  const longitudinalDelta = Math.round((overallY3 - overallY1) * 10) / 10;

  return (
    <div className="space-y-8">
      {/* Research Grant Administrative Header */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Grant Active: Year 1 to 3 Pilot Study Tracking
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2 font-sans">
              Social Sciences Cohort Longitudinal Analytics
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Evaluating multi-pillar language competence across the five study dimensions. Tracking student progression from undergraduate matriculation to capstone oral thesis defense.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onExportCsv}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              Export Study CSV
            </button>
            <button
              onClick={() => onNavigate('staff-rubrics')}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              Adjust Rubrics
            </button>
          </div>
        </div>

        {/* High-Level Grant Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              Tracked Cohort Size
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalStudents}
              </span>
              <span className="text-xs text-slate-500">Students</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              Recorded Assessments
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                {totalAssessments}
              </span>
              <span className="text-xs text-slate-500">Milestones</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              Longitudinal Delta
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
                +{longitudinalDelta}%
              </span>
              <span className="text-xs text-slate-500">Y1 → Y3</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide block">
              CEFR Capstone Readiness
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-blue-700 font-mono">
                {rubricConfig.target_cefr_for_year_3}
              </span>
              <span className="text-xs text-slate-500">Target Level</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-200/80">
            <span className="text-[11px] font-medium text-amber-800 uppercase tracking-wide block">
              Gamification Badges
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-amber-900 font-mono tabular-nums">
                18+
              </span>
              <span className="text-xs text-amber-700">Awarded</span>
            </div>
            <span className="text-[10px] text-amber-700 font-mono block mt-0.5 truncate">
              Top: Fluent Speaker
            </span>
          </div>
        </div>
      </section>

      {/* Cohort Performance by Academic Year (Year 1 vs Year 2 vs Year 3) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Cross-Sectional Cohort Performance (Year 1 vs. Year 2 vs. Year 3)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical evidence of progressive linguistic maturation across the pilot study timeline.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Rubric Version: Standardized v1.2
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Year 1 Card */}
          <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">Stage 01</span>
                <h4 className="text-base font-bold text-slate-900">Year 1 Cohort</h4>
              </div>
              <span className="text-2xl font-bold font-mono text-slate-700">
                {Math.round(y1Stats?.averages.overall || 0)}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Foundational academic vocabulary, baseline speech diagnostics.</p>

            <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-600">Communication:</span>
                <span className="font-mono font-medium">{y1Stats?.averages.communication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Speaking:</span>
                <span className="font-mono font-medium">{y1Stats?.averages.speaking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Listening:</span>
                <span className="font-mono font-medium">{y1Stats?.averages.listening}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Reading:</span>
                <span className="font-mono font-medium">{y1Stats?.averages.reading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Writing:</span>
                <span className="font-mono font-medium">{y1Stats?.averages.writing}</span>
              </div>
            </div>
          </div>

          {/* Year 2 Card */}
          <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 uppercase">Stage 02</span>
                <h4 className="text-base font-bold text-slate-900">Year 2 Cohort</h4>
              </div>
              <span className="text-2xl font-bold font-mono text-blue-700">
                {Math.round(y2Stats?.averages.overall || 0)}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Methodological argumentation, reduced hesitation pauses.</p>

            <div className="space-y-2 text-xs pt-3 border-t border-blue-100">
              <div className="flex justify-between">
                <span className="text-slate-600">Communication:</span>
                <span className="font-mono font-medium">{y2Stats?.averages.communication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Speaking:</span>
                <span className="font-mono font-medium">{y2Stats?.averages.speaking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Listening:</span>
                <span className="font-mono font-medium">{y2Stats?.averages.listening}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Reading:</span>
                <span className="font-mono font-medium">{y2Stats?.averages.reading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Writing:</span>
                <span className="font-mono font-medium">{y2Stats?.averages.writing}</span>
              </div>
            </div>
          </div>

          {/* Year 3 Card */}
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-600 uppercase">Stage 03</span>
                <h4 className="text-base font-bold text-slate-900">Year 3 Capstone</h4>
              </div>
              <span className="text-2xl font-bold font-mono text-emerald-700">
                {Math.round(y3Stats?.averages.overall || 0)}
                <span className="text-xs font-normal text-slate-400">/100</span>
              </span>
            </div>
            <p className="text-xs text-slate-500">Publication-level syntax, oral defense mastery (CEFR C1/C2).</p>

            <div className="space-y-2 text-xs pt-3 border-t border-emerald-100">
              <div className="flex justify-between">
                <span className="text-slate-600">Communication:</span>
                <span className="font-mono font-medium">{y3Stats?.averages.communication}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Speaking:</span>
                <span className="font-mono font-medium">{y3Stats?.averages.speaking}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Listening:</span>
                <span className="font-mono font-medium">{y3Stats?.averages.listening}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Reading:</span>
                <span className="font-mono font-medium">{y3Stats?.averages.reading}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Writing:</span>
                <span className="font-mono font-medium">{y3Stats?.averages.writing}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Radar Comparison & Longitudinal Student Track */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Radar Comparison */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Year 3 Capstone Radar</h3>
            <span className="text-xs text-slate-500 font-mono">Vs. Year 1 Baseline</span>
          </div>
          <PillarRadarChart
            scores={{
              communication: y3Stats?.averages.communication || 90,
              speaking: y3Stats?.averages.speaking || 89,
              listening: y3Stats?.averages.listening || 92,
              reading: y3Stats?.averages.reading || 94,
              writing: y3Stats?.averages.writing || 91,
            }}
            benchmark={{
              communication: y1Stats?.averages.communication || 68,
              speaking: y1Stats?.averages.speaking || 66,
              listening: y1Stats?.averages.listening || 72,
              reading: y1Stats?.averages.reading || 70,
              writing: y1Stats?.averages.writing || 65,
            }}
            size={280}
          />
        </div>

        {/* Right: Longitudinal Trajectories */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Individual Student Longitudinal Growth Tracks
              </h3>
              <p className="text-xs text-slate-500">
                Tracking students across multiple assessment checkpoints.
              </p>
            </div>
            <button
              onClick={() => onNavigate('staff-students')}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1"
            >
              Full Roster <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {longitudinalTracks.map((track) => (
              <div
                key={track.student.id}
                onClick={() => onNavigate('staff-students')}
                className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={track.student.avatar}
                    alt={track.student.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {track.student.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {track.student.student_id_code} · Academic Year {track.student.academic_year} · {track.history.length} Assessments
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono block">Progression</span>
                    <span className="text-xs font-mono font-bold text-slate-800">
                      {track.initialScore} → <strong className="text-blue-700">{track.currentScore}</strong>
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    track.growthDelta >= 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {track.growthDelta >= 0 ? `+${track.growthDelta}` : track.growthDelta} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
