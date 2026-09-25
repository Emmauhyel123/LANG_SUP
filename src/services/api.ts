import { User, Assessment, Score, CohortSummary, RubricConfig } from '../types';

export const api = {
  // Session / Authentication
  async getSession(): Promise<{ user: User; availableUsers: User[] }> {
    const res = await fetch('/api/session');
    if (!res.ok) throw new Error('Failed to fetch session');
    return res.json();
  },

  async switchUser(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/session/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch user');
    return res.json();
  },

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(data: Partial<User>): Promise<User> {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    return res.json();
  },

  async promoteStudent(id: string): Promise<User> {
    const res = await fetch(`/api/users/${id}/promote`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to promote student');
    return res.json();
  },

  // Assessments
  async getAssessments(studentId?: string): Promise<{ assessments: Assessment[] }> {
    const url = studentId ? `/api/assessments?studentId=${studentId}` : '/api/assessments';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch assessments');
    return res.json();
  },

  async getAssessment(id: string): Promise<{ assessment: Assessment; score?: Score; student?: User }> {
    const res = await fetch(`/api/assessments/${id}`);
    if (!res.ok) throw new Error('Failed to fetch assessment');
    return res.json();
  },

  async submitAssessment(payload: {
    student_id: string;
    type: string;
    academic_year: number;
    scenario_title: string;
    duration_seconds: number;
    transcript?: any[];
    written_submission?: string;
    score_data?: any;
  }): Promise<{ assessment: Assessment }> {
    const res = await fetch('/api/assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to submit assessment');
    return res.json();
  },

  // Analytics & Cohort Data
  async getCohortAnalytics(): Promise<{ cohortSummary: CohortSummary }> {
    const res = await fetch('/api/analytics/cohort');
    if (!res.ok) throw new Error('Failed to fetch cohort analytics');
    return res.json();
  },

  // AI Evaluation Endpoints
  async getNextInterviewTurn(payload: {
    scenario: string;
    history: { speaker: string; text: string }[];
    studentResponse: string;
    turnIndex: number;
  }): Promise<{ text: string }> {
    const res = await fetch('/api/ai/interview-turn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate interview turn');
    return res.json();
  },

  async evaluateInterview(payload: {
    transcript: any[];
    scenario: string;
    studentYear: number;
    durationSeconds: number;
  }): Promise<{
    communication_score: number;
    speaking_score: number;
    listening_score: number;
    reading_score: number;
    writing_score: number;
    overall_score: number;
    ai_feedback_text: string;
    strengths: string[];
    weaknesses: string[];
    cefr_level: 'B1' | 'B2' | 'C1' | 'C2';
    hesitation_analysis?: string;
  }> {
    const res = await fetch('/api/ai/evaluate-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to evaluate interview');
    return res.json();
  },

  async evaluateReadingWriting(payload: {
    promptText: string;
    passage?: string;
    studentSubmission: string;
    type: 'reading' | 'writing';
    studentYear: number;
  }): Promise<{
    communication_score: number;
    speaking_score: number;
    listening_score: number;
    reading_score: number;
    writing_score: number;
    overall_score: number;
    ai_feedback_text: string;
    strengths: string[];
    weaknesses: string[];
    cefr_level: 'B1' | 'B2' | 'C1' | 'C2';
    lexical_density_rating?: string;
    syntactic_complexity?: string;
  }> {
    const res = await fetch('/api/ai/evaluate-reading-writing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to evaluate reading/writing');
    return res.json();
  },

  async requestTTS(text: string): Promise<{ audioBase64?: string; fallbackToWebSpeech?: boolean }> {
    const res = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  // Rubrics & Controls
  async getRubrics(): Promise<RubricConfig> {
    const res = await fetch('/api/rubrics');
    return res.json();
  },

  async updateRubrics(rubrics: Partial<RubricConfig>): Promise<RubricConfig> {
    const res = await fetch('/api/rubrics', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rubrics),
    });
    return res.json();
  },

  // Schema and Export
  async getSqlSchema(): Promise<string> {
    const res = await fetch('/api/schema/sql');
    return res.text();
  },
};
