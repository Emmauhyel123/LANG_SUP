import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Assessment, User, RubricConfig } from '../types';

export const firestoreData = {
  // Save or update assessment
  async saveAssessment(assessment: Assessment): Promise<void> {
    const path = `assessments/${assessment.id}`;
    try {
      await setDoc(doc(db, 'assessments', assessment.id), {
        id: assessment.id,
        student_id: assessment.student_id,
        academic_year: assessment.academic_year,
        type: assessment.type,
        scenario_title: assessment.scenario_title,
        timestamp: assessment.timestamp || new Date().toISOString(),
        duration_seconds: assessment.duration_seconds,
        score: assessment.score || null,
        transcript: assessment.transcript || [],
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Save or update user profile
  async saveUser(user: User): Promise<void> {
    const path = `users/${user.id}`;
    try {
      await setDoc(doc(db, 'users', user.id), {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        academic_year: user.academic_year || 1,
        department: user.department || 'Social Sciences',
        enrolled_date: user.enrolled_date || new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // Listen to assessments
  listenToAssessments(
    userId: string,
    isStaff: boolean,
    onUpdate: (assessments: Assessment[]) => void
  ): () => void {
    const path = 'assessments';
    try {
      const assessmentsRef = collection(db, 'assessments');
      const q = isStaff
        ? query(assessmentsRef, orderBy('timestamp', 'desc'))
        : query(assessmentsRef, where('student_id', '==', userId));

      return onSnapshot(
        q,
        (snapshot) => {
          const items: Assessment[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            items.push(data as Assessment);
          });
          onUpdate(items);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, path);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return () => {};
    }
  },

  // Listen to rubrics
  listenToRubrics(onUpdate: (rubrics: RubricConfig) => void): () => void {
    const path = 'rubrics/default';
    try {
      return onSnapshot(
        doc(db, 'rubrics', 'default'),
        (snapshot) => {
          if (snapshot.exists()) {
            onUpdate(snapshot.data() as RubricConfig);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return () => {};
    }
  },

  // Update rubrics
  async updateRubrics(rubrics: RubricConfig): Promise<void> {
    const path = 'rubrics/default';
    try {
      await setDoc(doc(db, 'rubrics', 'default'), {
        communication_weight: rubrics.communication_weight,
        speaking_weight: rubrics.speaking_weight,
        listening_weight: rubrics.listening_weight,
        reading_weight: rubrics.reading_weight,
        writing_weight: rubrics.writing_weight,
        strictness_level: rubrics.strictness_level,
        target_cefr_for_year_3: rubrics.target_cefr_for_year_3,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },
};
