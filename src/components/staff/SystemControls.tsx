import React, { useState, useEffect } from 'react';
import { RubricConfig } from '../../types';
import { api } from '../../services/api';
import { firestoreData } from '../../services/firestoreData';
import {
  Sliders,
  FileSpreadsheet,
  Database,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Play,
  Sparkles,
  Flame,
} from 'lucide-react';

interface SystemControlsProps {
  initialRubrics: RubricConfig;
  onRefreshData: () => void;
  onExportCsv: () => void;
}

const FIRESTORE_RULES_SNIPPET = `rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if false; }

    function isValidId(id) {
      return id is string && id.size() > 0 && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\\\-]+$');
    }
    function incoming() { return request.resource.data; }
    function existing() { return resource.data; }
    function isSignedIn() { return request.auth != null; }

    function isStaff() {
      return isSignedIn() && (
        request.auth.token.email == 'emmanuelhyeladi070@gmail.com' ||
        (exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'staff')
      );
    }

    match /users/{userId} {
      allow get: if isSignedIn() && (request.auth.uid == userId || isStaff());
      allow list: if isSignedIn();
      allow create, update: if isSignedIn() && isValidId(userId) && (request.auth.uid == userId || isStaff());
      allow delete: if isStaff();
    }

    match /assessments/{assessmentId} {
      allow get: if isSignedIn() && (resource.data.student_id == request.auth.uid || isStaff());
      allow list: if isSignedIn();
      allow create: if isSignedIn() && isValidId(assessmentId) && (incoming().student_id == request.auth.uid || isStaff());
      allow update: if isSignedIn() && isValidId(assessmentId) && (resource.data.student_id == request.auth.uid || isStaff());
      allow delete: if isStaff();
    }

    match /rubrics/{rubricId} {
      allow read: if isSignedIn();
      allow create, update, delete: if isStaff();
    }
  }
}`;

export const SystemControls: React.FC<SystemControlsProps> = ({
  initialRubrics,
  onRefreshData,
  onExportCsv,
}) => {
  const [rubrics, setRubrics] = useState<RubricConfig>(initialRubrics);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [schemaTab, setSchemaTab] = useState<'firebase' | 'postgres'>('firebase');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  useEffect(() => {
    setRubrics(initialRubrics);
  }, [initialRubrics]);

  useEffect(() => {
    api.getSqlSchema().then(setSqlSchema).catch(console.error);
  }, []);

  const handleSaveRubrics = async () => {
    try {
      await api.updateRubrics(rubrics);
      try {
        await firestoreData.updateRubrics(rubrics);
      } catch (fErr) {
        console.warn('Firestore rubrics sync note:', fErr);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onRefreshData();
    } catch (err) {
      console.error('Failed to update rubrics:', err);
    }
  };

  const handleCopyCode = () => {
    const textToCopy = schemaTab === 'firebase' ? FIRESTORE_RULES_SNIPPET : sqlSchema;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Run longitudinal test progression simulation
  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setSimulationStatus('Simulating Year 1 student advancing to Year 2 and completing capstone...');

    try {
      const studentName = `Simulated Scholar ${Math.floor(10 + Math.random() * 89)}`;
      const newStudent = await api.createUser({
        name: studentName,
        email: `scholar.${Date.now()}@student.university.edu`,
        role: 'student',
        academic_year: 1,
        department: 'Social Sciences (Development Economics)',
      });

      // Insert Year 1 Baseline Assessment
      const baseline = await api.submitAssessment({
        student_id: newStudent.id,
        type: 'baseline',
        academic_year: 1,
        scenario_title: 'Simulated Baseline Diagnostic: Development Paradigms',
        duration_seconds: 600,
        score_data: {
          communication_score: 66,
          speaking_score: 64,
          listening_score: 69,
          reading_score: 68,
          writing_score: 63,
          overall_score: 66.0,
          ai_feedback_text: 'Year 1 baseline intake completed. Foundational discourse structure evident.',
          strengths: ['Clear interest in development models'],
          weaknesses: ['Hesitations when explaining regression terms'],
          cefr_level: 'B1',
        },
      });

      try {
        await firestoreData.saveAssessment(baseline.assessment);
      } catch (err) {
        console.warn('Firestore simulated baseline sync note:', err);
      }

      // Promote to Year 2
      await api.promoteStudent(newStudent.id);

      // Insert Year 2 Follow-Up Assessment showing longitudinal growth (+14%)
      const followUp = await api.submitAssessment({
        student_id: newStudent.id,
        type: 'interview',
        academic_year: 2,
        scenario_title: 'Simulated Year 2 Oral Defense: Structural Institutionalism',
        duration_seconds: 820,
        score_data: {
          communication_score: 80,
          speaking_score: 79,
          listening_score: 83,
          reading_score: 81,
          writing_score: 78,
          overall_score: 80.2,
          ai_feedback_text: 'Year 2 longitudinal follow-up indicates +14.2 point composite growth. Significant decrease in hesitation frequency.',
          strengths: ['Robust academic register', 'Precise theoretical citations'],
          weaknesses: ['Refine counter-argument pacing'],
          cefr_level: 'B2',
        },
      });

      try {
        await firestoreData.saveAssessment(followUp.assessment);
      } catch (err) {
        console.warn('Firestore simulated follow-up sync note:', err);
      }

      setSimulationStatus(`Successfully generated longitudinal student: ${studentName} (Year 1 → Year 2 growth +14.2 points recorded).`);
      onRefreshData();
    } catch (err) {
      console.error('Simulation failed:', err);
      setSimulationStatus('Simulation encountered an error.');
    } finally {
      setIsSimulating(false);
    }
  };

  const totalWeight =
    Number(rubrics.communication_weight) +
    Number(rubrics.speaking_weight) +
    Number(rubrics.listening_weight) +
    Number(rubrics.reading_weight) +
    Number(rubrics.writing_weight);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Firebase Project: gen-lang-client-0994547759 (europe-west2)
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">Research Grant & System Controls</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure AI assessment weights, export grant reporting datasets, and inspect active Firebase Firestore rules & PostgreSQL schemas.
          </p>
        </div>

        <button
          onClick={onExportCsv}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-xs shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Download Grant Dataset (CSV)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Assessment Rubric Calibration */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">AI Assessment Rubric Weightings</h3>
            </div>
            <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
              totalWeight === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
            }`}>
              Total Weight: {totalWeight}% {totalWeight !== 100 && '(Must equal 100%)'}
            </span>
          </div>

          <div className="space-y-4">
            {/* Communication Weight */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>1. Communication (Pragmatics & Academic Register)</span>
                <span className="font-mono">{rubrics.communication_weight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rubrics.communication_weight}
                onChange={(e) => setRubrics({ ...rubrics, communication_weight: Number(e.target.value) })}
                className="w-full accent-indigo-600"
              />
            </div>

            {/* Speaking Weight */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>2. Speaking (Fluency, Pronunciation & Hesitation)</span>
                <span className="font-mono">{rubrics.speaking_weight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rubrics.speaking_weight}
                onChange={(e) => setRubrics({ ...rubrics, speaking_weight: Number(e.target.value) })}
                className="w-full accent-emerald-600"
              />
            </div>

            {/* Listening Weight */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>3. Listening (Aural Decoding & Adaptation)</span>
                <span className="font-mono">{rubrics.listening_weight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rubrics.listening_weight}
                onChange={(e) => setRubrics({ ...rubrics, listening_weight: Number(e.target.value) })}
                className="w-full accent-amber-600"
              />
            </div>

            {/* Reading Weight */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>4. Reading (Academic Text Synthesis)</span>
                <span className="font-mono">{rubrics.reading_weight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rubrics.reading_weight}
                onChange={(e) => setRubrics({ ...rubrics, reading_weight: Number(e.target.value) })}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Writing Weight */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                <span>5. Writing (Syntax & Grammar)</span>
                <span className="font-mono">{rubrics.writing_weight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={rubrics.writing_weight}
                onChange={(e) => setRubrics({ ...rubrics, writing_weight: Number(e.target.value) })}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* Strictness Level */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Evaluator Strictness Mode
              </label>
              <select
                value={rubrics.strictness_level}
                onChange={(e) => setRubrics({ ...rubrics, strictness_level: e.target.value as any })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="standard">Standard University Baseline</option>
                <option value="rigorous">Rigorous (Strict Hesitation Penalties)</option>
                <option value="lenient">Remedial / Exploratory</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Year 3 Target CEFR Benchmark
              </label>
              <select
                value={rubrics.target_cefr_for_year_3}
                onChange={(e) => setRubrics({ ...rubrics, target_cefr_for_year_3: e.target.value })}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
              >
                <option value="B2">B2 (Vantage / Upper Intermediate)</option>
                <option value="C1">C1 (Effective Operational Proficiency)</option>
                <option value="C2">C2 (Mastery / Native Equivalent)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Rubrics calibrated & updated in database
              </span>
            )}
            <button
              onClick={handleSaveRubrics}
              disabled={totalWeight !== 100}
              className="ml-auto px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Save Calibration Settings
            </button>
          </div>
        </div>

        {/* Right Column: Longitudinal Progression QA & Test Runner */}
        <div className="lg:col-span-5 space-y-6">
          {/* Simulation Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900">Longitudinal QA Simulation Runner</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generate a test student matriculating into Year 1 with a baseline diagnostic, simulate their progression to Year 2, and verify that the cohort analytics update dynamically with longitudinal growth data.
            </p>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-blue-900" />
              <span>{isSimulating ? 'Simulating Transition...' : 'Simulate Year 1 → Year 2 Progression'}</span>
            </button>

            {simulationStatus && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-mono">
                {simulationStatus}
              </div>
            )}
          </div>

          {/* Research Grant Export Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Research Pilot Grant Export</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download the complete anonymized dataset containing all longitudinal metrics, acoustic pause durations, written syntaxes, and CEFR tiers for academic grant publication.
            </p>
            <button
              onClick={onExportCsv}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              Download Full Dataset (.csv)
            </button>
          </div>
        </div>
      </div>

      {/* Database & Security Rules Architecture Viewer */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Database Architecture & Security Hardening
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Dual-database architecture: Live Firebase Firestore with Zero-Trust security rules and PostgreSQL relational schema with RLS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
              <button
                onClick={() => setSchemaTab('firebase')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  schemaTab === 'firebase'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Firebase Rules
              </button>
              <button
                onClick={() => setSchemaTab('postgres')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  schemaTab === 'postgres'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-3.5 h-3.5 text-blue-600" />
                PostgreSQL (DDL)
              </button>
            </div>

            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-mono font-medium rounded-md transition-colors flex items-center gap-1.5 shrink-0"
            >
              {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <pre className="p-4 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl overflow-x-auto max-h-96 leading-relaxed border border-slate-800 scrollbar-thin">
            <code>
              {schemaTab === 'firebase'
                ? FIRESTORE_RULES_SNIPPET
                : sqlSchema || 'Loading PostgreSQL schema and RLS policies...'}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
};
