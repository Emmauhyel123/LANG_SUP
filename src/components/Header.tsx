import React from 'react';
import { User } from '../types';
import { useFirebase } from '../context/FirebaseContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  ChevronDown,
  BookOpen,
  Mic,
  BarChart3,
  Sliders,
  Database,
  Layers,
  Award,
  Flame,
  LogIn,
  LogOut,
  CheckCircle,
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  availableUsers: User[];
  onSwitchUser: (userId: string) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  availableUsers,
  onSwitchUser,
  activeTab,
  onTabChange,
}) => {
  const isStaff = currentUser.role === 'staff';
  const { firebaseUser, isConnected, signInWithGoogle, signOut } = useFirebase();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Academic Administrative Banner */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white tracking-wide">University of Social Sciences</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-300">Department of Applied Linguistics & Policy</span>
          <span className="text-slate-500 hidden md:inline">·</span>
          <span className="text-slate-400 hidden md:inline">Pilot Grant #SS-LANG-2024-03</span>
        </div>

        {/* Firebase Live Cloud Status & Auth Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-mono">
            <Flame className="w-3 h-3 text-amber-500" />
            <span className="text-slate-300">Firebase Firestore:</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {isConnected ? 'Live' : 'Connecting'}
            </span>
          </div>

          {/* Google Auth Button / User Profile */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              <span className="text-[11px] text-slate-300 max-w-[120px] truncate">
                {firebaseUser.email}
              </span>
              <button
                onClick={() => signOut()}
                title="Sign out of Firebase"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign in with Google</span>
            </button>
          )}

          {/* Persona Switcher for Longitudinal Testing */}
          <div className="flex items-center gap-1.5 border-l border-slate-750 pl-3">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono hidden sm:inline">Persona:</span>
            <div className="relative inline-block">
              <select
                value={currentUser.id}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="bg-slate-800 hover:bg-slate-750 text-white text-xs rounded px-2.5 py-1 pr-6 border border-slate-700 cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-blue-400"
              >
                <optgroup label="Faculty & Lead Evaluators (Staff Portal)">
                  {availableUsers
                    .filter((u) => u.role === 'staff')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} · Staff Evaluator
                      </option>
                    ))}
                </optgroup>
                <optgroup label="Undergraduate Cohort (Student Portal)">
                  {availableUsers
                    .filter((u) => u.role === 'student')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} · Year {u.academic_year}
                      </option>
                    ))}
                </optgroup>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between py-3 gap-3">
        {/* Brand & Portal Type */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-xs ${
            isStaff ? 'bg-slate-800' : 'bg-blue-700'
          }`}>
            {isStaff ? <ShieldCheck className="w-5 h-5 text-amber-400" /> : <GraduationCap className="w-5 h-5 text-white" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 font-sans">
                LinguaPilot
              </h1>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                isStaff 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}>
                {isStaff ? 'Faculty & Analytics Portal' : `Student Portal · Year ${currentUser.academic_year || 1}`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {isStaff
                ? 'Social Sciences Cohort Longitudinal Assessment & Research Evaluation'
                : 'Five Pillars Language Study & Real-time AI Mock Interview Engine'}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {isStaff ? (
            <>
              <button
                onClick={() => onTabChange('staff-overview')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'staff-overview'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Cohort Analytics
              </button>

              <button
                onClick={() => onTabChange('staff-students')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'staff-students'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Student Transcripts & Drill-Down
              </button>

              <button
                onClick={() => onTabChange('staff-rubrics')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'staff-rubrics'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Rubrics & Grant Controls
              </button>

              <button
                onClick={() => onTabChange('staff-schema')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'staff-schema'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                Database & Security Rules
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTabChange('student-dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-dashboard'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Dashboard & Radar
              </button>

              <button
                onClick={() => onTabChange('student-interview')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-interview'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-amber-300" />
                AI Mock Interview
              </button>

              <button
                onClick={() => onTabChange('student-pillars')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-pillars'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                5 Core Pillars
              </button>

              <button
                onClick={() => onTabChange('student-reading-writing')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-reading-writing'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Reading & Writing Assessment
              </button>

              <button
                onClick={() => onTabChange('student-history')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-history'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Archive ({currentUser.academic_year ? `Year ${currentUser.academic_year}` : 'All'})
              </button>

              <button
                onClick={() => onTabChange('student-badges')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  activeTab === 'student-badges'
                    ? 'bg-blue-700 text-white'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-amber-300" />
                Honors & Badges
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};
