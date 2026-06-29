import { useState, useRef, useCallback, useEffect } from "react";
import {
  fetchStudents,
  hasActiveCameraPermission,
  parseHarmonyScore,
  saveStudentFaceBiometric,
  createCameraAccessPermission,
  studentNeedsReferenceCapture,
  REFERENCE_CAPTURE_APPROVED_STATUS,
} from "../lib/airtable";
import {
  detectFaceDescriptor,
  ensureBiometricModels,
  matchStudentByFaceDescriptor,
  matchLiveToReference,
  captureStableDescriptor,
  descriptorToJson,
  getStudentFaceDescriptor,
  assertFaceUniqueInRegistry,
  FACE_DUPLICATE_BLOCKED,
  SOVEREIGN_MATCH_CONFIDENCE,
  ENROLLMENT_MATCH_CONFIDENCE,
} from "../lib/biometricMatch";
import { playSuccessChime } from "../lib/sovereignAudio";
import { deriveChildCode } from "../lib/auth";
import { resolveEnrollmentAccess } from "../lib/plans";
import { getStudentEnrollmentStatus } from "../lib/sovereignLogin";

const DETECT_INTERVAL_MS = 500;
const MAX_SCAN_MS = 45000;
const ENROLLMENT_MAX_SCAN_MS = 25000;
const MIN_FACE_SCORE = 0.5;

export function useBiometricScan({
  lang = "ar",
  onSovereignMatch,
  playChimeOnMatch = true,
  selectedStudentId = null,
  requireStudentSelection = false,
  /** JSON descriptor from same-session capture — skips Airtable round-trip. */
  enrollmentReferenceDescriptor = null,
  enrollmentMode = false,
} = {}) {
  const [scanState, setScanState] = useState("idle");
  const [similarityPercent, setSimilarityPercent] = useState(0);
  const [faceScore, setFaceScore] = useState(0);
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const runningRef = useRef(false);
  const scanStartedAtRef = useRef(0);
  const studentsRef = useRef([]);
  const referenceCaptureRef = useRef(false);
  const referenceCaptureSavingRef = useRef(false);
  const enrollmentReferenceRef = useRef(enrollmentReferenceDescriptor);

  useEffect(() => {
    enrollmentReferenceRef.current = enrollmentReferenceDescriptor;
  }, [enrollmentReferenceDescriptor]);

  const messages = {
    ar: {
      errorCamera: "فشل في التعرف - الكاميرا مغلقة أو الطالب غير مسجل",
      errorModel: "فشل تحميل نماذج التعرف. تحقق من الاتصال بالإنترنت.",
      errorRegistryEmpty: "لا توجد سجلات طلاب في Airtable",
      errorNoBiometric: "لا توجد بصمات وجه مسجلة",
      errorTimeout: "انتهت مهلة المسح دون مطابقة سيادية",
      errorPermission: "صلاحية الكاميرا غير مفعلة لهذا الطالب",
      errorMatch: "لم تتحقق عتبة الثقة السيادية (94.7%)",
      errorMismatch: "بصمة الوجه لا تطابق اللقطة المرجعية — أعد المحاولة",
      errorDuplicate: "رفض — الوجه مسجّل لطالب آخر. تم حظر العملية.",
      errorEnrollmentTimeout: "انتهت مهلة التحقق — تأكد من الإضاءة وواجه الكاميرا ثم أعد المحاولة",
      errorNoSelection: "اختر اسم الطالب أولاً قبل المسح البيومتري",
      errorStatusBlocked: "حالة الطالب غير نشطة — تواصل مع المركز",
      referenceCapture: "جاري التقاط اللقطة المرجعية الأولى وحفظها...",
      referenceCaptureFailed: "تعذر حفظ اللقطة المرجعية — أعد المحاولة",
    },
    en: {
      errorCamera: "Recognition failed — camera closed or student not registered",
      errorModel: "Failed to load recognition models. Check your internet connection.",
      errorRegistryEmpty: "No student records in Airtable",
      errorNoBiometric: "No enrolled face biometrics",
      errorTimeout: "Scan timed out without sovereign match",
      errorPermission: "Camera permission is not active for this student",
      errorMatch: "Sovereign confidence threshold (94.7%) not met",
      errorMismatch: "Face does not match the reference capture — try again",
      errorDuplicate: "Denied — face already registered to another student. Blocked.",
      errorEnrollmentTimeout: "Verification timed out — face the camera with good lighting and retry",
      errorNoSelection: "Select a student name before starting the biometric scan",
      errorStatusBlocked: "Student status inactive — contact the center",
      referenceCapture: "Capturing first smart reference frame and saving...",
      referenceCaptureFailed: "Could not save reference capture — try again",
    },
  };

  const copy = messages[lang] ?? messages.ar;

  const stopCamera = useCallback(() => {
    runningRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const failScan = useCallback(
    (message) => {
      stopCamera();
      setMatchedStudent(null);
      setScanState("error");
      setErrorMsg(message || copy.errorCamera);
    },
    [stopCamera, copy.errorCamera]
  );

  const isCameraLive = useCallback(() => {
    const track = streamRef.current?.getVideoTracks?.()?.[0];
    return Boolean(track && track.readyState === "live" && !track.muted);
  }, []);

  const reset = useCallback(() => {
    stopCamera();
    setScanState("idle");
    setSimilarityPercent(0);
    setFaceScore(0);
    setMatchedStudent(null);
    setErrorMsg("");
    setPermissionDenied(false);
    referenceCaptureRef.current = false;
    referenceCaptureSavingRef.current = false;
  }, [stopCamera]);

  const selectedStudentRef = useRef(selectedStudentId);

  useEffect(() => {
    selectedStudentRef.current = selectedStudentId;
  }, [selectedStudentId]);

  const startScan = useCallback(async () => {
    if (requireStudentSelection && !selectedStudentRef.current) {
      failScan(copy.errorNoSelection);
      return;
    }

    setScanState("loading");
    setSimilarityPercent(0);
    setFaceScore(0);
    setMatchedStudent(null);
    setErrorMsg("");
    setPermissionDenied(false);

    let registry;
    try {
      registry = await fetchStudents();
    } catch {
      registry = [];
    }
    const list = Array.isArray(registry) ? registry : [];
    studentsRef.current = list;
    if (!list.length) {
      failScan(copy.errorRegistryEmpty);
      return;
    }

    const scanPool =
      requireStudentSelection && selectedStudentRef.current
        ? list.filter((row) => row?.id === selectedStudentRef.current)
        : list;

    const targetStudent =
      requireStudentSelection && selectedStudentRef.current
        ? list.find((row) => row?.id === selectedStudentRef.current) ?? null
        : null;

    const localReference = enrollmentMode ? enrollmentReferenceRef.current : null;

    const needsReference =
      !localReference &&
      Boolean(targetStudent) &&
      studentNeedsReferenceCapture(targetStudent);

    referenceCaptureRef.current = needsReference;

    if (!needsReference && !localReference) {
      const enrolled = scanPool.filter(
        (row) => getStudentFaceDescriptor(row) || row?.faceBiometric
      );
      if (!enrolled.length) {
        failScan(requireStudentSelection ? copy.errorMismatch : copy.errorNoBiometric);
        return;
      }
    }

    if (enrollmentMode && !localReference && targetStudent) {
      const stored = getStudentFaceDescriptor(targetStudent) || targetStudent?.faceBiometric;
      if (stored) enrollmentReferenceRef.current = stored;
    }

    try {
      await ensureBiometricModels();
    } catch {
      failScan(copy.errorModel);
      return;
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
    } catch {
      failScan(copy.errorCamera);
      return;
    }

    streamRef.current = stream;

    const attachVideo = async () => {
      if (!videoRef.current) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      if (!videoRef.current) return false;
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => false);
      return isCameraLive();
    };

    if (!(await attachVideo())) {
      failScan(copy.errorCamera);
      return;
    }

    if (!isCameraLive()) {
      failScan(copy.errorCamera);
      return;
    }

    setScanState("scanning");
    runningRef.current = true;
    scanStartedAtRef.current = Date.now();

    const completeMatch = async (match, { referenceCapture = false } = {}) => {
      const minConfidence = enrollmentMode ? ENROLLMENT_MATCH_CONFIDENCE : SOVEREIGN_MATCH_CONFIDENCE;

      if (!referenceCapture && match.similarityPercent < minConfidence) {
        failScan(enrollmentMode ? copy.errorMismatch : copy.errorMatch);
        return;
      }

      if (!enrollmentMode && !referenceCapture) {
        const allowed = await hasActiveCameraPermission(match.student);
        if (!allowed) {
          try {
            await createCameraAccessPermission(match.student.id, match.student.name);
          } catch {
            /* try gate anyway after reference capture */
          }
          const allowedAfter = await hasActiveCameraPermission(match.student);
          if (!allowedAfter && !referenceCapture) {
            setPermissionDenied(true);
            setSimilarityPercent(match.similarityPercent);
            failScan(copy.errorPermission);
            return;
          }
        }
      }

      const enrollmentAccess = resolveEnrollmentAccess(
        getStudentEnrollmentStatus(match.student)
      );
      if (!enrollmentAccess.allowed) {
        failScan(copy.errorStatusBlocked);
        return;
      }

      runningRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const harmony = parseHarmonyScore(match.student.harmonyScore);
      const payload = {
        student: match.student,
        similarityPercent: match.similarityPercent,
        harmonyScore: harmony,
        childCode: deriveChildCode(match.student),
        referenceCapture,
      };

      setSimilarityPercent(match.similarityPercent);
      setMatchedStudent(payload);
      setScanState("success");
      if (playChimeOnMatch) playSuccessChime();
      onSovereignMatch?.(payload);
    };

    const maxScanMs = enrollmentMode ? ENROLLMENT_MAX_SCAN_MS : MAX_SCAN_MS;

    timerRef.current = setInterval(async () => {
      if (!runningRef.current || !videoRef.current) return;
      if (!isCameraLive()) {
        failScan(copy.errorCamera);
        return;
      }
      if (Date.now() - scanStartedAtRef.current > maxScanMs) {
        failScan(
          referenceCaptureRef.current
            ? copy.referenceCaptureFailed
            : enrollmentMode
              ? copy.errorEnrollmentTimeout
              : requireStudentSelection
                ? copy.errorMismatch
                : copy.errorTimeout
        );
        return;
      }

      if (referenceCaptureRef.current) {
        if (referenceCaptureSavingRef.current) return;
        let face;
        try {
          face = await detectFaceDescriptor(videoRef.current, MIN_FACE_SCORE);
        } catch {
          return;
        }
        if (!face) {
          setFaceScore(0);
          return;
        }
        setFaceScore(face.score);
        setScanState("scanning");
        setErrorMsg(copy.referenceCapture);

        referenceCaptureSavingRef.current = true;
        try {
          const stable = await captureStableDescriptor(videoRef.current);
          if (!stable?.descriptor) {
            referenceCaptureSavingRef.current = false;
            return;
          }
          const student =
            studentsRef.current.find((s) => s.id === selectedStudentRef.current) ?? targetStudent;
          if (!student?.id) {
            referenceCaptureSavingRef.current = false;
            failScan(copy.referenceCaptureFailed);
            return;
          }
          const descriptorJson = descriptorToJson(stable.descriptor);
          try {
            assertFaceUniqueInRegistry(
              studentsRef.current,
              stable.descriptor,
              student.id,
              lang
            );
          } catch (dupErr) {
            referenceCaptureSavingRef.current = false;
            failScan(
              dupErr?.code === FACE_DUPLICATE_BLOCKED ? dupErr.message : copy.errorDuplicate
            );
            return;
          }
          await saveStudentFaceBiometric(student.id, descriptorJson, {
            captureStatus: REFERENCE_CAPTURE_APPROVED_STATUS,
          });
          await createCameraAccessPermission(student.id, student.name);
          student.faceBiometric = descriptorJson;
          referenceCaptureRef.current = false;
          referenceCaptureSavingRef.current = false;
          await completeMatch(
            { student, similarityPercent: 100 },
            { referenceCapture: true }
          );
        } catch {
          referenceCaptureSavingRef.current = false;
          failScan(copy.referenceCaptureFailed);
        }
        return;
      }

      let face;
      try {
        face = await detectFaceDescriptor(videoRef.current, MIN_FACE_SCORE);
      } catch {
        return;
      }
      if (!face) {
        setFaceScore(0);
        return;
      }
      setFaceScore(face.score);

      const localRef = enrollmentMode ? enrollmentReferenceRef.current : null;
      if (localRef) {
        const result = matchLiveToReference(face.descriptor, localRef);
        if (result?.similarityPercent != null) {
          setSimilarityPercent(result.similarityPercent);
        }
        if (!result?.matched) return;

        const student =
          studentsRef.current.find((s) => s.id === selectedStudentRef.current) ?? targetStudent;
        if (!student?.id) {
          failScan(copy.errorMismatch);
          return;
        }
        await completeMatch({ student, similarityPercent: result.similarityPercent });
        return;
      }

      const matchId = requireStudentSelection ? selectedStudentRef.current : null;
      const match = matchStudentByFaceDescriptor(studentsRef.current, face.descriptor, matchId);
      if (!match?.student) {
        setSimilarityPercent(0);
        return;
      }

      if (requireStudentSelection && match.student.id !== selectedStudentRef.current) {
        failScan(copy.errorMismatch);
        return;
      }

      await completeMatch(match);
    }, DETECT_INTERVAL_MS);
  }, [failScan, isCameraLive, onSovereignMatch, playChimeOnMatch, copy, requireStudentSelection, enrollmentMode]);

  return {
    videoRef,
    scanState,
    similarityPercent,
    faceScore,
    matchedStudent,
    errorMsg,
    permissionDenied,
    startScan,
    stopCamera,
    reset,
    sovereignThreshold: SOVEREIGN_MATCH_CONFIDENCE,
  };
}
