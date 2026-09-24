import React, { useState } from 'react';
import { User, Assessment, Score } from '../../types';
import { api } from '../../services/api';
import { calculateStudentBadges } from '../../services/badgeService';
import {
  Search,
  Filter,
  UserCheck,
  Calendar,
  Clock,
  Mic,
  BookOpen,
  Sparkles,
  TrendingUp,
  Award,
  ChevronRight,
  ArrowUpRight,
  PlusCircle,
  Play,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface StudentDrillDownProps {
  students: User[];
  assessments: Assessment[];
  onRefreshData: () => void;
}

export const StudentDrillDown: React.FC<StudentDrillDownProps> = ({
  students,
  assessments,
  onRefreshData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  // Filter students
  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (stu.student_id_code && stu.student_id_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      stu.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === 'all' || stu.academic_year === selectedYear;
    return matchesSearch && matchesYear;
  });

  const currentStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  // Assessments for this student, sorted chronologically
  const studentAssessments = assessments
    .filter((a) => a.student_id === currentStudent?.id)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const activeAssessment =
    studentAssessments.find((a) => a.id === selectedAssessmentId) ||
    studentAssessments[studentAssessments.length - 1];

  // Handle Promote Student (Year 1 -> Year 2 -> Year 3)
  const handlePromoteStudent = async () => {
    if (!currentStudent) return;
    setIsPromoting(true);
    try {
      await api.promoteStudent(currentStudent.id);

      // Generate a simulated follow-up assessment for the new year
      const nextYear = Math.min(3, currentStudent.academic_year + 1) as 1 | 2 | 3;
      await api.submitAssessment({
        student_id: currentStudent.id,
        type: 'interview',
        academic_year: nextYear,
        scenario_title: `Year ${nextYear} Longitudinal Defense: Institutional Pragmatics`,
        duration_seconds: 750,
        transcript: [
          { speaker: 'interviewer', text: 'Welcome to your next phase assessment. How have your methodological paradigms shifted since Year 1?', timestamp: 0 },
          { speaker: 'student', text: 'My research now explicitly triangulates quantitative regression data with qualitative lived experiences, minimizing researcher subjectivity.', timestamp: 18 }
        ],
        score_data: {
          communication_score: 82 + (nextYear * 4),
          speaking_score: 80 + (nextYear * 4),
          listening_score: 84 + (nextYear * 3),
          reading_score: 83 + (nextYear * 4),
          writing_score: 81 + (nextYear * 4),
          overall_score: 82 + (nextYear * 3.8),
          ai_feedback_text: `Demonstrates commendable academic progression into Year ${nextYear}. Shows heightened syntactic complexity and notable reduction in hesitation pauses.`,
          strengths: ['Enhanced terminology integration', 'Confident academic register'],
          weaknesses: ['Continue refining comparative welfare typologies'],
          cefr_level: nextYear === 2 ? 'B2' : 'C1',
        }
      });

      onRefreshData();
    } catch (err) {
      console.error('Failed to promote student:', err);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Individual Student Transcripts & Longitudinal Drill-Down</h2>
          <p className="text-xs text-slate-500 mt-1">
            Examine verbatim interview transcripts, acoustic pause markers, written submissions, and growth across Years 1 to 3.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student or ID..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {(['all', 1, 2, 3] as const).map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  selectedYear === yr
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {yr === 'all' ? 'All Years' : `Year ${yr}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Roster List */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2 max-h-[750px] overflow-y-auto">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 px-2 block mb-2">
            Cohort Directory ({filteredStudents.length})
          </span>

          {filteredStudents.map((stu) => {
            const isSelected = stu.id === currentStudent?.id;
            const stuAssessmentsCount = assessments.filter((a) => a.student_id === stu.id).length;

            return (
              <div
                key={stu.id}
                onClick={() => {
                  setSelectedStudentId(stu.id);
                  setSelectedAssessmentId(null);
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stu.avatar}
                    alt={stu.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{stu.name}</h4>
                    <p className="text-[11px] text-slate-500">{stu.student_id_code} · Year {stu.academic_year}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 block">
                    {stuAssessmentsCount} Record{stuAssessmentsCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Drill-Down Dossier */}
        <div className="lg:col-span-8 space-y-6">
          {currentStudent && (
            <>
              {/* Student Header Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={currentStudent.avatar}
                    alt={currentStudent.name}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-blue-100 border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{currentStudent.name}</h3>
                      <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {currentStudent.student_id_code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{currentStudent.department}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-semibold text-blue-700">Academic Year {currentStudent.academic_year} of 3</span>
                      <span>·</span>
                      <span>Enrolled {currentStudent.enrolled_date}</span>
                    </div>
                  </div>
                </div>

                {/* Longitudinal Progression Simulation Control */}
                {currentStudent.academic_year < 3 && (
                  <button
                    onClick={handlePromoteStudent}
                    disabled={isPromoting}
                    className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
                    title="Simulate student progressing to next academic year and completing next milestone"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>{isPromoting ? 'Advancing Year...' : `Advance to Year ${currentStudent.academic_year + 1} & Assess`}</span>
                  </button>
                )}
              </div>

              {/* Awarded Gamification Badges & Honors Card */}
              {(() => {
                const studentBadges = calculateStudentBadges(currentStudent, studentAssessments);
                const awarded = studentBadges.filter((b) => b.unlocked);
                const totalPoints = awarded.reduce((sum, b) => sum + b.academicPoints, 0);

                return (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-600" />
                        <h4 className="text-xs font-bold text-slate-900">
                          Institutional Badges & Commendations ({awarded.length} of {studentBadges.length} Awarded)
                        </h4>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-slate-600">
                        Total Honor Points: <span className="text-slate-900 font-bold">{totalPoints} pts</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {studentBadges.map((badge) => (
                        <div
                          key={badge.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 ${
                            badge.unlocked
                              ? 'bg-amber-50/40 border-amber-200/80 text-slate-800'
                              : 'bg-slate-50 border-slate-200/60 text-slate-400 opacity-70'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                            badge.unlocked ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-400'
                          }`}>
                            <Award className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-slate-900 truncate block">
                                {badge.title}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 shrink-0">
                                {badge.tier}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 truncate mt-0.5">
                              {badge.pillarLabel}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                              <span>{badge.unlocked ? 'Awarded' : badge.currentMetricText}</span>
                              <span className={badge.unlocked ? 'text-emerald-700 font-semibold' : ''}>
                                {badge.unlocked ? '100%' : `${badge.progress}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Assessment Timeline Chips */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 block">
                  Chronological Milestone Checkpoints ({studentAssessments.length})
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {studentAssessments.map((asm, i) => {
                    const isSelected = (activeAssessment?.id === asm.id);
                    return (
                      <button
                        key={asm.id}
                        onClick={() => setSelectedAssessmentId(asm.id)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors whitespace-nowrap text-left shrink-0 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-[10px] opacity-75 font-mono">
                          Year {asm.academic_year} · {new Date(asm.timestamp).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </div>
                        <div className="font-semibold truncate max-w-[180px]">
                          {asm.scenario_title.split(':')[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Assessment Inspection Panel */}
              {activeAssessment ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {activeAssessment.type.toUpperCase()} · Year {activeAssessment.academic_year}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">ID: {activeAssessment.id}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {activeAssessment.scenario_title}
                      </h4>
                    </div>

                    {activeAssessment.score && (
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block">Overall Score</span>
                          <span className="text-2xl font-bold font-mono text-blue-700">
                            {Math.round(activeAssessment.score.overall_score)}
                            <span className="text-xs text-slate-400 font-normal">/100</span>
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-slate-900 text-amber-300 text-xs font-mono font-bold rounded-md">
                          {activeAssessment.score.cefr_level}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 5 Pillars Score Breakdown */}
                  {activeAssessment.score && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-medium text-slate-500 block">Communication</span>
                        <span className="text-lg font-bold font-mono text-indigo-700">
                          {Math.round(activeAssessment.score.communication_score)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-medium text-slate-500 block">Speaking</span>
                        <span className="text-lg font-bold font-mono text-emerald-700">
                          {Math.round(activeAssessment.score.speaking_score)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-medium text-slate-500 block">Listening</span>
                        <span className="text-lg font-bold font-mono text-amber-700">
                          {Math.round(activeAssessment.score.listening_score)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-[10px] font-medium text-slate-500 block">Reading</span>
                        <span className="text-lg font-bold font-mono text-sky-700">
                          {Math.round(activeAssessment.score.reading_score)}
                        </span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-medium text-slate-500 block">Writing</span>
                        <span className="text-lg font-bold font-mono text-purple-700">
                          {Math.round(activeAssessment.score.writing_score)}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* AI Diagnostic Commentary */}
                  {activeAssessment.score && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        AI Language Evaluator Synthesis
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {activeAssessment.score.ai_feedback_text}
                      </p>
                    </div>
                  )}

                  {/* Transcript Display (for Interviews) */}
                  {activeAssessment.transcript && activeAssessment.transcript.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          Verbatim Interview Audio Transcript
                        </h5>
                        <span className="text-[11px] font-mono text-slate-500">
                          Hesitation markers tagged automatically
                        </span>
                      </div>

                      <div className="space-y-2.5 max-h-72 overflow-y-auto bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                        {activeAssessment.transcript.map((t, idx) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border ${
                              t.speaker === 'student'
                                ? 'bg-white border-blue-200 ml-4'
                                : 'bg-slate-100/70 border-slate-200 mr-4'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                              <span className="font-bold">
                                {t.speaker === 'student' ? `${currentStudent.name} (Candidate)` : 'Dr. Evelyn Vance (Interviewer)'}
                              </span>
                              <span>+{t.timestamp}s</span>
                            </div>
                            <p className="text-slate-800 leading-relaxed">{t.text}</p>
                            {t.hesitation_detected && (
                              <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                                [Hesitation: Pause duration &gt; 1.5s detected]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Written Submission Display (for Writing) */}
                  {activeAssessment.written_submission && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Written Submission Text
                      </h5>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-wrap">
                        {activeAssessment.written_submission}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">No assessments found for this student.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
