import { User, Assessment, Badge } from '../types';

export const BADGE_DEFINITIONS: Omit<Badge, 'unlocked' | 'unlockedAt' | 'progress' | 'currentMetricText'>[] = [
  {
    id: 'fluent_speaker',
    title: 'Fluent Speaker',
    category: 'speaking',
    pillarLabel: 'Pillar 2: Speaking',
    description: 'Demonstrated consistent oral fluency and articulation in simulated academic interviews with minimal hesitation pauses.',
    iconName: 'Mic',
    criteria: 'Attain a Speaking score of 75+ in an oral interview or defense.',
    tier: 'silver',
    academicPoints: 150,
  },
  {
    id: 'consistent_learner',
    title: 'Consistent Learner',
    category: 'overall',
    pillarLabel: 'Longitudinal Dedication',
    description: 'Maintained continuous engagement across the academic study by completing multiple assessment milestones.',
    iconName: 'CalendarCheck',
    criteria: 'Complete at least 2 distinct assessment milestones across your academic calendar.',
    tier: 'bronze',
    academicPoints: 100,
  },
  {
    id: 'discourse_master',
    title: 'Discourse Master',
    category: 'communication',
    pillarLabel: 'Pillar 1: Communication',
    description: 'Mastered academic sociolinguistic registers, defense counter-hedging, and pragmatic reflexivity.',
    iconName: 'MessageSquare',
    criteria: 'Achieve a Communication score of 80+ in an assessment.',
    tier: 'gold',
    academicPoints: 200,
  },
  {
    id: 'attentive_scholar',
    title: 'Attentive Scholar',
    category: 'listening',
    pillarLabel: 'Pillar 3: Listening',
    description: 'Demonstrated rapid aural comprehension and immediate contextual adaptation to faculty counter-questions.',
    iconName: 'Volume2',
    criteria: 'Achieve a Listening comprehension score of 80+ in an interview or drill.',
    tier: 'silver',
    academicPoints: 150,
  },
  {
    id: 'critical_reader',
    title: 'Critical Reader',
    category: 'reading',
    pillarLabel: 'Pillar 4: Reading',
    description: 'Synthesized peer-reviewed sociological and policy literature with high conceptual accuracy.',
    iconName: 'BookOpen',
    criteria: 'Achieve a Reading comprehension score of 80+ in a timed text assessment.',
    tier: 'silver',
    academicPoints: 150,
  },
  {
    id: 'scholarly_scribe',
    title: 'Scholarly Scribe',
    category: 'writing',
    pillarLabel: 'Pillar 5: Writing',
    description: 'Authored arguments displaying syntactic variety, subordinate clause integration, and formal academic prose.',
    iconName: 'PenTool',
    criteria: 'Achieve a Writing & Syntax score of 78+ in a written assessment.',
    tier: 'silver',
    academicPoints: 150,
  },
  {
    id: 'phonetic_virtuoso',
    title: 'Phonetic Virtuoso',
    category: 'speaking',
    pillarLabel: 'Pillar 2: Speaking',
    description: 'Exhibited exceptional phonetic cadence and natural stress patterns during complex theoretical discourse.',
    iconName: 'Award',
    criteria: 'Attain a Speaking score of 88+ in an oral examination.',
    tier: 'gold',
    academicPoints: 250,
  },
  {
    id: 'quint_pillar_polymath',
    title: 'Quint-Pillar Polymath',
    category: 'overall',
    pillarLabel: 'All 5 Core Pillars',
    description: 'Balanced excellence across all five core language pillars with no single dimension lagging below benchmark.',
    iconName: 'Layers',
    criteria: 'Score 75+ across all 5 language pillars (Communication, Speaking, Listening, Reading, Writing) simultaneously.',
    tier: 'diamond',
    academicPoints: 350,
  },
  {
    id: 'longitudinal_pioneer',
    title: 'Longitudinal Pioneer',
    category: 'progression',
    pillarLabel: 'Cohort Progression',
    description: 'Successfully advanced academic years within the university longitudinal pilot study.',
    iconName: 'TrendingUp',
    criteria: 'Advance from Year 1 to Year 2 or Year 3 within the tracked cohort study.',
    tier: 'silver',
    academicPoints: 200,
  },
  {
    id: 'thesis_capstone_ready',
    title: 'Capstone Ready',
    category: 'overall',
    pillarLabel: 'CEFR Proficiency',
    description: 'Attained CEFR C1 or higher proficiency, qualifying for undergraduate thesis oral defense.',
    iconName: 'GraduationCap',
    criteria: 'Earn an assessed CEFR level of C1 or C2 in an evaluation.',
    tier: 'gold',
    academicPoints: 300,
  },
  {
    id: 'acoustic_reflexivity',
    title: 'Acoustic Precision',
    category: 'speaking',
    pillarLabel: 'Acoustic Cadence',
    description: 'Spoke with measured pacing, avoiding prolonged vocal hesitations or unnatural pauses during oral defense.',
    iconName: 'Sparkles',
    criteria: 'Complete an oral interview assessment with 0 flagged hesitation pauses.',
    tier: 'bronze',
    academicPoints: 120,
  },
  {
    id: 'lexical_architect',
    title: 'Lexical Architect',
    category: 'writing',
    pillarLabel: 'Pillar 5: Writing',
    description: 'Utilized academic word list (AWL) vocabulary with high lexical density and theoretical precision.',
    iconName: 'ScrollText',
    criteria: 'Attain a Writing score of 85+ on a textual assessment.',
    tier: 'gold',
    academicPoints: 250,
  },
];

/**
 * Calculates badges for a given student based on their profile and completed assessments.
 */
export function calculateStudentBadges(student: User, assessments: Assessment[]): Badge[] {
  const studentAssessments = assessments
    .filter((a) => a.student_id === student.id && a.score)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Aggregate metrics
  const assessmentCount = studentAssessments.length;

  let maxSpeaking = 0;
  let maxCommunication = 0;
  let maxListening = 0;
  let maxReading = 0;
  let maxWriting = 0;
  let hasPolymathScore = false;
  let hasC1OrHigher = false;
  let hasZeroHesitationInterview = false;

  for (const asm of studentAssessments) {
    if (!asm.score) continue;
    const s = asm.score;
    if (s.speaking_score > maxSpeaking) maxSpeaking = s.speaking_score;
    if (s.communication_score > maxCommunication) maxCommunication = s.communication_score;
    if (s.listening_score > maxListening) maxListening = s.listening_score;
    if (s.reading_score > maxReading) maxReading = s.reading_score;
    if (s.writing_score > maxWriting) maxWriting = s.writing_score;

    if (
      s.communication_score >= 75 &&
      s.speaking_score >= 75 &&
      s.listening_score >= 75 &&
      s.reading_score >= 75 &&
      s.writing_score >= 75
    ) {
      hasPolymathScore = true;
    }

    if (s.cefr_level === 'C1' || s.cefr_level === 'C2') {
      hasC1OrHigher = true;
    }

    // Check transcript for hesitation
    if (asm.transcript && asm.transcript.length > 0) {
      const hasHesitation = asm.transcript.some((t) => t.hesitation_detected);
      if (!hasHesitation) {
        hasZeroHesitationInterview = true;
      }
    }
  }

  return BADGE_DEFINITIONS.map((def) => {
    let unlocked = false;
    let progress = 0;
    let currentMetricText = '';
    let unlockedAt: string | undefined = undefined;

    switch (def.id) {
      case 'fluent_speaker': {
        const target = 75;
        progress = Math.min(100, Math.round((maxSpeaking / target) * 100));
        unlocked = maxSpeaking >= target;
        currentMetricText = `${Math.round(maxSpeaking)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.speaking_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'consistent_learner': {
        const target = 2;
        progress = Math.min(100, Math.round((assessmentCount / target) * 100));
        unlocked = assessmentCount >= target;
        currentMetricText = `${assessmentCount} / ${target} milestones`;
        if (unlocked && studentAssessments[1]) {
          unlockedAt = studentAssessments[1].timestamp;
        }
        break;
      }

      case 'discourse_master': {
        const target = 80;
        progress = Math.min(100, Math.round((maxCommunication / target) * 100));
        unlocked = maxCommunication >= target;
        currentMetricText = `${Math.round(maxCommunication)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.communication_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'attentive_scholar': {
        const target = 80;
        progress = Math.min(100, Math.round((maxListening / target) * 100));
        unlocked = maxListening >= target;
        currentMetricText = `${Math.round(maxListening)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.listening_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'critical_reader': {
        const target = 80;
        progress = Math.min(100, Math.round((maxReading / target) * 100));
        unlocked = maxReading >= target;
        currentMetricText = `${Math.round(maxReading)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.reading_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'scholarly_scribe': {
        const target = 78;
        progress = Math.min(100, Math.round((maxWriting / target) * 100));
        unlocked = maxWriting >= target;
        currentMetricText = `${Math.round(maxWriting)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.writing_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'phonetic_virtuoso': {
        const target = 88;
        progress = Math.min(100, Math.round((maxSpeaking / target) * 100));
        unlocked = maxSpeaking >= target;
        currentMetricText = `${Math.round(maxSpeaking)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.speaking_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'quint_pillar_polymath': {
        unlocked = hasPolymathScore;
        const lowestOfMax = Math.min(maxCommunication, maxSpeaking, maxListening, maxReading, maxWriting);
        progress = Math.min(100, Math.round((lowestOfMax / 75) * 100));
        currentMetricText = unlocked ? 'All 5 Pillars 75+' : `Lowest Pillar: ${Math.round(lowestOfMax)} / 75`;
        if (unlocked) {
          unlockedAt = studentAssessments[studentAssessments.length - 1]?.timestamp;
        }
        break;
      }

      case 'longitudinal_pioneer': {
        unlocked = student.academic_year >= 2;
        progress = student.academic_year === 1 ? 50 : 100;
        currentMetricText = `Year ${student.academic_year} of 3`;
        if (unlocked) {
          unlockedAt = student.enrolled_date;
        }
        break;
      }

      case 'thesis_capstone_ready': {
        unlocked = hasC1OrHigher;
        progress = hasC1OrHigher ? 100 : student.academic_year === 2 ? 75 : 50;
        currentMetricText = hasC1OrHigher ? 'CEFR C1 Attained' : 'Target: C1';
        if (unlocked) {
          const matching = studentAssessments.find(
            (a) => a.score?.cefr_level === 'C1' || a.score?.cefr_level === 'C2'
          );
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'acoustic_reflexivity': {
        unlocked = hasZeroHesitationInterview;
        progress = hasZeroHesitationInterview ? 100 : assessmentCount > 0 ? 50 : 0;
        currentMetricText = unlocked ? 'Zero Hesitations' : 'Target: 0 pauses >1.5s';
        if (unlocked) {
          unlockedAt = studentAssessments[0]?.timestamp;
        }
        break;
      }

      case 'lexical_architect': {
        const target = 85;
        progress = Math.min(100, Math.round((maxWriting / target) * 100));
        unlocked = maxWriting >= target;
        currentMetricText = `${Math.round(maxWriting)} / ${target} pts`;
        if (unlocked) {
          const matching = studentAssessments.find((a) => (a.score?.writing_score ?? 0) >= target);
          unlockedAt = matching ? matching.timestamp : studentAssessments[0]?.timestamp;
        }
        break;
      }

      default:
        break;
    }

    return {
      ...def,
      unlocked,
      unlockedAt,
      progress,
      currentMetricText,
    };
  });
}
