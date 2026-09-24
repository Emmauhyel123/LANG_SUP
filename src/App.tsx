import React, { useState, useEffect, useCallback } from 'react';
import { User, Assessment, CohortSummary, RubricConfig } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { StudentDashboard } from './components/student/StudentDashboard';
import { MockInterview } from './components/student/MockInterview';
import { ReadingWritingAssessment } from './components/student/ReadingWritingAssessment';
import { PillarModules } from './components/student/PillarModules';
import { AssessmentHistory } from './components/student/AssessmentHistory';
import { GamificationBadges } from './components/student/GamificationBadges';
import { StaffDashboard } from './components/staff/StaffDashboard';
import { StudentDrillDown } from './components/staff/StudentDrillDown';
import { SystemControls } from './components/staff/SystemControls';
import { FirebaseProvider } from './context/FirebaseContext';
import { firestoreData } from './services/firestoreData';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('student-dashboard');
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [cohortData, setCohortData] = useState<CohortSummary | null>(null);
  const [rubrics, setRubrics] = useState<RubricConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Load Initial Session & Data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const session = await api.getSession();
      setCurrentUser(session.user);
      setAvailableUsers(session.availableUsers);

      const [asmRes, cohortRes, rubricRes] = await Promise.all([
        api.getAssessments(),
        api.getCohortAnalytics(),
        api.getRubrics(),
      ]);

      setAssessments(asmRes.assessments);
      setCohortData(cohortRes.cohortSummary);
      setRubrics(rubricRes);

      // Default active tab based on user role
      if (session.user.role === 'staff') {
        setActiveTab('staff-overview');
      } else {
        setActiveTab('student-dashboard');
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle switching personas (Faculty vs Student)
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.user);

      if (res.user.role === 'staff') {
        setActiveTab('staff-overview');
      } else {
        setActiveTab('student-dashboard');
      }

      // Refresh assessments for the updated user context
      refreshAllData();
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  // Refresh all application datasets
  const refreshAllData = async () => {
    try {
      const [asmRes, cohortRes, rubricRes, usersRes] = await Promise.all([
        api.getAssessments(),
        api.getCohortAnalytics(),
        api.getRubrics(),
        api.getUsers(),
      ]);
      setAssessments(asmRes.assessments);
      setCohortData(cohortRes.cohortSummary);
      setRubrics(rubricRes);
      setAvailableUsers(usersRes.users);

      // Refresh current user object in case of promotion
      if (currentUser) {
        const updated = usersRes.users.find((u) => u.id === currentUser.id);
        if (updated) setCurrentUser(updated);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Synchronize new assessment to Firestore
  const handleAssessmentCompleted = async () => {
    await refreshAllData();
    setActiveTab('student-dashboard');
  };

  // CSV Export for Research Grant Reporting
  const handleExportCsv = () => {
    window.location.href = '/api/export/csv';
  };

  if (loading || !currentUser || !rubrics) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-700 mb-3" />
        <p className="text-xs font-mono text-slate-600">Initializing University Pilot Study Environment...</p>
      </div>
    );
  }

  const isStaff = currentUser.role === 'staff';
  const studentAssessments = assessments.filter((a) => a.student_id === currentUser.id);
  const allStudents = availableUsers.filter((u) => u.role === 'student');

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Universal Top Academic Bar & Navigation */}
      <Header
        currentUser={currentUser}
        availableUsers={availableUsers}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* STUDENT PORTAL VIEWS */}
        {!isStaff && (
          <>
            {activeTab === 'student-dashboard' && (
              <StudentDashboard
                currentUser={currentUser}
                assessments={studentAssessments}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'student-interview' && (
              <MockInterview
                currentUser={currentUser}
                onComplete={handleAssessmentCompleted}
              />
            )}

            {activeTab === 'student-pillars' && (
              <PillarModules
                onLaunchInterview={() => setActiveTab('student-interview')}
                onLaunchReadingWriting={() => setActiveTab('student-reading-writing')}
              />
            )}

            {activeTab === 'student-reading-writing' && (
              <ReadingWritingAssessment
                currentUser={currentUser}
                onComplete={handleAssessmentCompleted}
              />
            )}

            {activeTab === 'student-history' && (
              <AssessmentHistory assessments={studentAssessments} />
            )}

            {activeTab === 'student-badges' && (
              <GamificationBadges
                currentUser={currentUser}
                assessments={studentAssessments}
                onNavigateToInterview={() => setActiveTab('student-interview')}
                onNavigateToWriting={() => setActiveTab('student-reading-writing')}
                onNavigateToPillars={() => setActiveTab('student-pillars')}
              />
            )}
          </>
        )}

        {/* STAFF / ADMIN PORTAL VIEWS */}
        {isStaff && (
          <>
            {activeTab === 'staff-overview' && (
              <StaffDashboard
                cohortData={cohortData}
                onNavigate={setActiveTab}
                onExportCsv={handleExportCsv}
              />
            )}

            {activeTab === 'staff-students' && (
              <StudentDrillDown
                students={allStudents}
                assessments={assessments}
                onRefreshData={refreshAllData}
              />
            )}

            {(activeTab === 'staff-rubrics' || activeTab === 'staff-schema') && (
              <SystemControls
                initialRubrics={rubrics}
                onRefreshData={refreshAllData}
                onExportCsv={handleExportCsv}
              />
            )}
          </>
        )}
      </main>

      {/* Academic Institutional Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">LinguaPilot Assessment System</span>
            <span>·</span>
            <span>Social Sciences Longitudinal Pilot (Years 1–3)</span>
            <span>·</span>
            <span className="font-mono text-[11px]">Grant #SS-LANG-2024-03</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Firebase Firestore Active
            </span>
            <span>·</span>
            <span>PostgreSQL RLS</span>
            <span>·</span>
            <span>Voice & Audio: WebSpeech + Gemini TTS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [syncedUser, setSyncedUser] = useState<User | null>(null);

  return (
    <FirebaseProvider onUserAuthenticated={(user) => setSyncedUser(user)}>
      <AppContent />
    </FirebaseProvider>
  );
}
