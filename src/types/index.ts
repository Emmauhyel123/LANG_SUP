export type AcademicYear = 1 | 2 | 3;
export type UserRole = 'student' | 'staff';
export type AssessmentType = 'interview' | 'reading' | 'writing' | 'baseline';
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  academic_year: AcademicYear;
  department: string;
  student_id_code?: string;
  avatar?: string;
  enrolled_date: string;
}

export interface TranscriptTurn {
  speaker: 'interviewer' | 'student';
  text: string;
  hesitation_detected?: boolean;
  timestamp: number;
}

export interface Assessment {
  id: string;
  student_id: string;
  timestamp: string;
  type: AssessmentType;
  academic_year: AcademicYear;
  scenario_title: string;
  duration_seconds: number;
  status: 'completed' | 'in_progress';
  transcript?: TranscriptTurn[];
  written_submission?: string;
  reading_passage_id?: string;
  student?: User;
  score?: Score;
}

export interface Score {
  id: string;
  assessment_id: string;
  student_id: string;
  communication_score: number;
  speaking_score: number;
  listening_score: number;
  reading_score: number;
  writing_score: number;
  overall_score: number;
  ai_feedback_text: string;
  strengths: string[];
  weaknesses: string[];
  cefr_level: CEFRLevel;
  rubric_version: string;
  created_at: string;
}

export interface RubricConfig {
  communication_weight: number;
  speaking_weight: number;
  listening_weight: number;
  reading_weight: number;
  writing_weight: number;
  strictness_level: 'standard' | 'rigorous' | 'lenient';
  min_benchmark_score: number;
  target_cefr_for_year_3: string;
}

export interface YearStats {
  academic_year: number;
  total_students: number;
  assessment_count: number;
  averages: {
    communication: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    overall: number;
  };
}

export interface LongitudinalTrack {
  student: User;
  history: {
    assessment_id: string;
    timestamp: string;
    academic_year: AcademicYear;
    type: AssessmentType;
    title: string;
    overall_score: number;
    communication: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    cefr: CEFRLevel;
  }[];
  initialScore: number;
  currentScore: number;
  growthDelta: number;
}

export interface CohortSummary {
  totalStudents: number;
  totalAssessments: number;
  yearStats: YearStats[];
  longitudinalTracks: LongitudinalTrack[];
  rubricConfig: RubricConfig;
}

export type BadgeCategory = 'speaking' | 'communication' | 'listening' | 'reading' | 'writing' | 'overall' | 'progression';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Badge {
  id: string;
  title: string;
  category: BadgeCategory;
  pillarLabel: string;
  description: string;
  iconName: string;
  criteria: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 to 100 percentage
  currentMetricText: string;
  tier: BadgeTier;
  academicPoints: number;
}

