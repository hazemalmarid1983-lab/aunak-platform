import { useCallback, useEffect, useState } from 'react';
import { fetchStudents } from '../lib/airtable';
import {
  buildParentAssessmentView,
  buildTreatmentMetrics,
  fetchParentSessionLedger,
  sessionAttendanceSummary,
} from '../lib/parentDashboardEngine';

export function useParentDashboard(student, lang = 'ar') {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [studentFresh, setStudentFresh] = useState(student);
  const [refreshing, setRefreshing] = useState(false);

  const assessment = buildParentAssessmentView(studentFresh ?? student, lang);
  const treatment = buildTreatmentMetrics(studentFresh ?? student, lang);
  const attendance = sessionAttendanceSummary(sessions, lang);

  const reloadSessions = useCallback(async () => {
    const row = studentFresh ?? student;
    if (!row?.name) {
      setSessions([]);
      return;
    }
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const rows = await fetchParentSessionLedger(row);
      setSessions(rows);
      setSessionsError('');
    } catch {
      setSessions([]);
      setSessionsError('');
    } finally {
      setSessionsLoading(false);
    }
  }, [student, studentFresh]);

  const refreshAll = useCallback(async () => {
    const id = (studentFresh ?? student)?.id;
    if (!id) return;
    setRefreshing(true);
    try {
      const list = await fetchStudents();
      const row = list.find((s) => s.id === id) ?? student;
      setStudentFresh(row);
      const rows = await fetchParentSessionLedger(row);
      setSessions(rows);
    } catch {
      setSessionsError('');
    } finally {
      setRefreshing(false);
    }
  }, [student, studentFresh]);

  useEffect(() => {
    setStudentFresh(student);
  }, [student]);

  useEffect(() => {
    reloadSessions();
  }, [reloadSessions]);

  return {
    assessment,
    treatment,
    sessions,
    attendance,
    sessionsLoading,
    sessionsError,
    refreshing,
    refreshAll,
    reloadSessions,
  };
}
