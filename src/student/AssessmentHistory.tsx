import React, { useState } from 'react';
import { Assessment } from '../../types';
import {
  FileText,
  Mic,
  BookOpen,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

interface AssessmentHistoryProps {
  assessments: Assessment[];
}

export const AssessmentHistory: React.FC<AssessmentHistoryProps> = ({ assessments }) => {
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Personal Assessment Archive & Longitudinal Logs</h2>
          <p className="text-xs text-slate-500 mt-1">
            Review past baseline diagnostics, oral mock interviews, and written evaluations recorded under your student ID.
          </p>
        </div>
        <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
          {assessments.length} Record{assessments.length !== 1 ? 's' : ''} Stored
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {assessments.map((asm) => {
          const score = asm.score;
          return (
            <div
              key={asm.id}
              onClick={() => setSelectedAssessment(asm)}
              className="bg-white border border-slate-200 hover:border-blue-400 rounded-xl p-4 shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  asm.type === 'interview' || asm.type === 'baseline'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-purple-50 text-purple-700'
                }`}>
                  {asm.type === 'interview' || asm.type === 'baseline' ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <BookOpen className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                      {asm.scenario_title}
                    </h3>
                    <span className="text-[10px] uppercase font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      Year {asm.academic_year}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(asm.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {Math.floor(asm.duration_seconds / 60)} min {asm.duration_seconds % 60}s
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Snapshot */}
              <div className="flex items-center gap-4 sm:ml-auto">
                {score ? (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono block">Composite</span>
                      <span className="text-lg font-bold font-mono text-blue-700 tabular-nums">
                        {Math.round(score.overall_score)}
                        <span className="text-[11px] text-slate-400 font-normal">/100</span>
                      </span>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-900 text-amber-300 text-xs font-mono font-bold">
                      {score.cefr_level}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Score Pending</span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Assessment Inspection Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-slate-200 p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] uppercase font-mono text-blue-700 font-semibold">
                  Assessment ID: {selectedAssessment.id} · Year {selectedAssessment.academic_year}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedAssessment.scenario_title}
                </h3>
                <p className="text-xs text-slate-500">
                  Completed on {new Date(selectedAssessment.timestamp).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssessment(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Grid if available */}
            {selectedAssessment.score && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 block font-medium">Communication</span>
                    <span className="text-base font-bold font-mono text-indigo-700">
                      {Math.round(selectedAssessment.score.communication_score)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 block font-medium">Speaking</span>
                    <span className="text-base font-bold font-mono text-emerald-700">
                      {Math.round(selectedAssessment.score.speaking_score)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 block font-medium">Listening</span>
                    <span className="text-base font-bold font-mono text-amber-700">
                      {Math.round(selectedAssessment.score.listening_score)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                    <span className="text-[10px] text-slate-500 block font-medium">Reading</span>
                    <span className="text-base font-bold font-mono text-sky-700">
                      {Math.round(selectedAssessment.score.reading_score)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block font-medium">Writing</span>
                    <span className="text-base font-bold font-mono text-purple-700">
                      {Math.round(selectedAssessment.score.writing_score)}
                    </span>
                  </div>
                </div>

                {/* AI Evaluator diagnostic text */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <span className="text-xs font-bold text-blue-950 uppercase flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-4 h-4 text-blue-600" /> AI Diagnostic Evaluation
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {selectedAssessment.score.ai_feedback_text}
                  </p>
                </div>
              </div>
            )}

            {/* Transcript if available */}
            {selectedAssessment.transcript && selectedAssessment.transcript.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Oral Defense Verbatim Transcript
                </h4>
                <div className="space-y-2.5 max-h-56 overflow-y-auto bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  {selectedAssessment.transcript.map((t, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <span className={`font-semibold font-mono text-[11px] ${
                        t.speaker === 'student' ? 'text-blue-700' : 'text-slate-800'
                      }`}>
                        {t.speaker === 'student' ? 'Candidate:' : 'Dr. Evelyn Vance:'}
                      </span>
                      <p className="text-slate-700 leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Written Submission if available */}
            {selectedAssessment.written_submission && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Candidate's Written Text Submission
                </h4>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-wrap">
                  {selectedAssessment.written_submission}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAssessment(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
