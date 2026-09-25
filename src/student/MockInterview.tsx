import React, { useState, useEffect, useRef } from 'react';
import { User, TranscriptTurn } from '../../types';
import { api } from '../../services/api';
import { firestoreData } from '../../services/firestoreData';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Square,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Send,
  Loader2,
  User as UserIcon,
  Bot,
} from 'lucide-react';

interface MockInterviewProps {
  currentUser: User;
  onComplete: () => void;
}

const INTERVIEW_SCENARIOS = [
  {
    id: 'soc_ethics',
    title: 'Qualitative Fieldwork Ethics & Researcher Reflexivity',
    description: 'Defend your methodological protocol when negotiating informed consent in marginalized urban communities.',
    initialQuestion: 'Good day. In social science fieldwork, researchers must maintain acute reflexivity. How do you intend to acknowledge and mitigate your personal subjectivity when interpreting qualitative interview responses?',
  },
  {
    id: 'soc_methods',
    title: 'Triangulating Qualitative and Quantitative Datasets',
    description: 'Explain how mixed-methods designs resolve discrepancies between econometric regressions and ethnographic testimony.',
    initialQuestion: 'Welcome. When economic indicators contradict ethnographic observations in regional development studies, how do you synthesize these discordant findings into a cohesive academic argument?',
  },
  {
    id: 'soc_policy',
    title: 'Post-Colonial Institutionalism & Resource Governance',
    description: 'Critique institutional policies regarding agrarian rights and indigenous resource governance.',
    initialQuestion: 'Hello candidate. Discursive institutionalism argues that policy language actively constructs social realities. How do institutional terms such as "resource optimization" impact indigenous land tenure rights?',
  },
];

export const MockInterview: React.FC<MockInterviewProps> = ({
  currentUser,
  onComplete,
}) => {
  const [selectedScenario, setSelectedScenario] = useState(INTERVIEW_SCENARIOS[0]);
  const [interviewState, setInterviewState] = useState<'idle' | 'in_progress' | 'evaluating' | 'completed'>('idle');
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hesitationCount, setHesitationCount] = useState(0);
  const [turnIndex, setTurnIndex] = useState(1);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);
  const [audioMuted, setAudioMuted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const fullText = finalTranscript || interimTranscript;
        if (fullText) {
          setCurrentInput((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${fullText.trim()}` : fullText.trim();
          });
        }

        // Reset hesitation timer whenever speech is detected
        if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
        pauseTimerRef.current = setTimeout(() => {
          if (isRecording) {
            setHesitationCount((c) => c + 1);
          }
        }, 1800);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error/notice:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (timerRef.current) clearInterval(timerRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript, isAiSpeaking, isAiThinking]);

  // Timer while interview is active
  useEffect(() => {
    if (interviewState === 'in_progress') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewState]);

  // Voice output for AI questions (TTS)
  const speakText = (text: string) => {
    if (audioMuted) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select a natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (v) => (v.lang.includes('en-GB') || v.lang.includes('en-US')) && v.name.toLowerCase().includes('natural')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (englishVoice) utterance.voice = englishVoice;

      utterance.onstart = () => setIsAiSpeaking(true);
      utterance.onend = () => setIsAiSpeaking(false);
      utterance.onerror = () => setIsAiSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Start interview
  const handleStartInterview = () => {
    setInterviewState('in_progress');
    setElapsedSeconds(0);
    setHesitationCount(0);
    setTurnIndex(1);
    const initialTurn: TranscriptTurn = {
      speaker: 'interviewer',
      text: selectedScenario.initialQuestion,
      timestamp: 0,
    };
    setTranscript([initialTurn]);
    speakText(selectedScenario.initialQuestion);
  };

  // Toggle Microphone Recording
  const handleToggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (e) {
          console.warn('Recognition start exception:', e);
        }
      }
    }
  };

  // Submit student turn
  const handleSubmitTurn = async () => {
    const studentText = currentInput.trim();
    if (!studentText) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    window.speechSynthesis?.cancel();
    setIsAiSpeaking(false);

    const studentTurn: TranscriptTurn = {
      speaker: 'student',
      text: studentText,
      timestamp: elapsedSeconds,
      hesitation_detected: hesitationCount > 2,
    };

    const updatedTranscript = [...transcript, studentTurn];
    setTranscript(updatedTranscript);
    setCurrentInput('');
    setIsAiThinking(true);

    // If 4 turns have concluded, proceed to final evaluation
    if (turnIndex >= 3) {
      setIsAiThinking(false);
      handleFinishInterview(updatedTranscript);
      return;
    }

    try {
      const response = await api.getNextInterviewTurn({
        scenario: selectedScenario.title,
        history: updatedTranscript.map((t) => ({ speaker: t.speaker, text: t.text })),
        studentResponse: studentText,
        turnIndex: turnIndex + 1,
      });

      setIsAiThinking(false);
      const aiTurn: TranscriptTurn = {
        speaker: 'interviewer',
        text: response.text,
        timestamp: elapsedSeconds + 1,
      };

      setTranscript((prev) => [...prev, aiTurn]);
      setTurnIndex((t) => t + 1);
      speakText(response.text);
    } catch (error) {
      setIsAiThinking(false);
      const fallbackAiTurn: TranscriptTurn = {
        speaker: 'interviewer',
        text: 'Thank you. Considering the counter-arguments within institutional sociology, what empirical safeguards would you present to defend your core thesis?',
        timestamp: elapsedSeconds + 1,
      };
      setTranscript((prev) => [...prev, fallbackAiTurn]);
      setTurnIndex((t) => t + 1);
      speakText(fallbackAiTurn.text);
    }
  };

  // Finalize and trigger multi-pillar AI assessment
  const handleFinishInterview = async (finalTranscript: TranscriptTurn[]) => {
    setInterviewState('evaluating');
    if (timerRef.current) clearInterval(timerRef.current);
    window.speechSynthesis?.cancel();

    try {
      const evalData = await api.evaluateInterview({
        transcript: finalTranscript,
        scenario: selectedScenario.title,
        studentYear: currentUser.academic_year,
        durationSeconds: elapsedSeconds,
      });

      setEvaluationResult(evalData);

      // Save assessment to database
      const savedRes = await api.submitAssessment({
        student_id: currentUser.id,
        type: 'interview',
        academic_year: currentUser.academic_year,
        scenario_title: selectedScenario.title,
        duration_seconds: elapsedSeconds,
        transcript: finalTranscript,
        score_data: evalData,
      });

      // Also persist to Firebase Firestore
      try {
        if (savedRes && savedRes.assessment) {
          await firestoreData.saveAssessment(savedRes.assessment);
        }
      } catch (fErr) {
        console.warn('Firestore sync note:', fErr);
      }

      setInterviewState('completed');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error('Failed to finalize assessment:', err);
      setInterviewState('completed');
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">AI Mock Interview Engine</h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Live Voice Simulated Examination
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simultaneously evaluates Communication (pragmatics), Speaking (fluency/cadence), and Listening (adaptation).
          </p>
        </div>

        {interviewState === 'in_progress' && (
          <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                {formatTime(elapsedSeconds)}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span className="text-xs text-slate-600 font-medium">Turn {turnIndex} of 3</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <button
              onClick={() => setAudioMuted(!audioMuted)}
              className="text-slate-500 hover:text-slate-900 transition-colors"
              title={audioMuted ? 'Unmute AI voice' : 'Mute AI voice'}
            >
              {audioMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* IDLE STATE: Scenario Selection */}
      {interviewState === 'idle' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-slate-900">Select Academic Oral Defense Scenario</h3>
            <p className="text-xs text-slate-500 mt-1">
              Scenarios are calibrated to university Social Sciences coursework and grant study assessment benchmarks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INTERVIEW_SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedScenario.id === scenario.id
                    ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
                    Scenario #{scenario.id.split('_')[1]}
                  </span>
                  {selectedScenario.id === scenario.id && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <h4 className="text-sm font-semibold text-slate-900">{scenario.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{scenario.description}</p>
              </div>
            ))}
          </div>

          {/* Evaluator Persona Showcase */}
          <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
              alt="Dr. Evelyn Vance"
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Dr. Evelyn Vance</span>
                <span className="text-[11px] text-slate-500 font-mono">Lead Faculty Oral Evaluator</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                "Speak in full academic prose. I will assess your conceptual reflexivity, verbal cadence, and syntactic precision."
              </p>
            </div>
            <button
              onClick={handleStartInterview}
              className="ml-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              Begin Vocal Interview
            </button>
          </div>
        </div>
      )}

      {/* IN-PROGRESS STATE: Real-Time Vocal Interview Arena */}
      {interviewState === 'in_progress' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Real-time Transcript & Live Dialogue */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col h-[560px] shadow-xs">
            {/* Conversation Stream */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {transcript.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[88%] ${
                    item.speaker === 'student' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                      item.speaker === 'student'
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-amber-300'
                    }`}
                  >
                    {item.speaker === 'student' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                      item.speaker === 'student'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1 text-[10px] opacity-75 font-mono">
                      <span>{item.speaker === 'student' ? currentUser.name : 'Dr. Evelyn Vance'}</span>
                      <span>{formatTime(item.timestamp)}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{item.text}</p>
                    {item.hesitation_detected && (
                      <span className="inline-block mt-1 text-[10px] text-amber-200 font-mono">
                        [Fluency Note: Pause &gt;1.5s detected]
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {isAiThinking && (
                <div className="flex gap-3 max-w-[80%] mr-auto">
                  <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-slate-100 p-3.5 rounded-xl rounded-tl-none border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Dr. Vance is formulating analytical response...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Live Vocal Input & Microphone Controls */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 rounded-b-xl space-y-3">
              {/* Animated Vocal Waveform when recording */}
              {isRecording && (
                <div className="flex items-center justify-center gap-1 py-1">
                  {[40, 75, 95, 60, 85, 30, 90, 70, 45, 80, 55, 95, 65, 35].map((h, i) => (
                    <span
                      key={i}
                      className="w-1 bg-blue-600 rounded-full animate-pulse"
                      style={{
                        height: `${Math.max(12, h * 0.35)}px`,
                        animationDelay: `${i * 70}ms`,
                      }}
                    />
                  ))}
                  <span className="text-[11px] font-mono text-blue-700 ml-2 font-medium">
                    Listening & Transcribing...
                  </span>
                </div>
              )}

              {/* Input text field (populated by speech recognition or typing) */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitTurn()}
                  placeholder={
                    isRecording
                      ? 'Speaking now... your words will appear here automatically'
                      : 'Speak via microphone or type your academic defense...'
                  }
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                {/* Microphone Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleRecording}
                  disabled={!speechSupported}
                  className={`p-2.5 rounded-lg text-white font-medium text-xs transition-all shadow-xs flex items-center gap-1.5 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  title={isRecording ? 'Stop Recording' : 'Start Vocal Speech Recognition'}
                >
                  {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  <span className="hidden sm:inline">{isRecording ? 'Stop Mic' : 'Speak'}</span>
                </button>

                {/* Submit Turn Button */}
                <button
                  type="button"
                  onClick={handleSubmitTurn}
                  disabled={!currentInput.trim()}
                  className="p-2.5 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Send Turn</span>
                </button>
              </div>

              {/* Helper text */}
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  {speechSupported
                    ? 'Tip: Click "Speak" and articulate clearly. The AI evaluates cadence & pauses.'
                    : 'Web Speech recognition not detected; you may type responses directly.'}
                </span>
                <button
                  onClick={() => handleFinishInterview(transcript)}
                  className="text-red-600 hover:text-red-700 underline font-medium"
                >
                  End & Evaluate Early
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Evaluator Status & Live Metrics */}
          <div className="lg:col-span-4 space-y-4">
            {/* Evaluator Persona Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-center">
              <div className="relative inline-block mx-auto mb-3">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
                  alt="Dr. Evelyn Vance"
                  className={`w-20 h-20 rounded-full object-cover border-2 ${
                    isAiSpeaking ? 'border-amber-400 ring-4 ring-amber-100' : 'border-slate-200'
                  }`}
                />
                {isAiSpeaking && (
                  <span className="absolute bottom-0 right-0 w-5 h-5 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center text-white">
                    <Volume2 className="w-3 h-3 animate-bounce" />
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-slate-900">Dr. Evelyn Vance</h4>
              <p className="text-xs text-slate-500">Lead Faculty Oral Evaluator</p>

              <div className="mt-4 pt-4 border-t border-slate-100 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Interviewer Status:</span>
                  <span className={`font-medium ${isAiSpeaking ? 'text-amber-600' : 'text-slate-700'}`}>
                    {isAiSpeaking ? 'Speaking Prompt...' : isAiThinking ? 'Analyzing Discourse...' : 'Listening to Candidate'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Hesitations Counted:</span>
                  <span className="font-mono font-semibold text-slate-800">{hesitationCount}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Academic Scenario:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[140px]" title={selectedScenario.title}>
                    {selectedScenario.title}
                  </span>
                </div>
              </div>
            </div>

            {/* Rubric Criteria Active During Interview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2.5">
              <h5 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
                Target Assessment Criteria
              </h5>
              <div className="space-y-1.5 text-slate-600">
                <div className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-bold">•</span>
                  <span><strong>Communication:</strong> Academic framing & dialectical rigor.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Speaking:</strong> Pauses &lt;1.5s, natural prosody, technical phonology.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Listening:</strong> Addressing the interviewer's specific counter-question.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EVALUATING STATE */}
      {interviewState === 'evaluating' && (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-900">Dr. Vance is evaluating your verbal transcript...</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Synthesizing Speech-to-Text records, calculating hesitation penalties, verifying sociolinguistic register, and formulating multi-pillar scorecards.
          </p>
        </div>
      )}

      {/* COMPLETED STATE: Detailed Scorecard & Diagnostics */}
      {interviewState === 'completed' && evaluationResult && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Assessment Successfully Recorded & Stored
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Oral Defense Scorecard & Evaluation Summary
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[11px] text-slate-500 uppercase font-mono block">Overall Composite</span>
                <span className="text-2xl font-extrabold text-blue-700 font-mono">
                  {Math.round(evaluationResult.overall_score)}
                  <span className="text-xs text-slate-400 font-normal"> / 100</span>
                </span>
              </div>
              <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-center font-mono">
                <span className="text-[10px] uppercase text-slate-400 block">CEFR Level</span>
                <span className="text-base font-bold text-amber-300">{evaluationResult.cefr_level}</span>
              </div>
            </div>
          </div>

          {/* Scores Grid for the 5 Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Communication</span>
              <span className="text-xl font-bold font-mono text-indigo-700 tabular-nums">
                {Math.round(evaluationResult.communication_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Speaking</span>
              <span className="text-xl font-bold font-mono text-emerald-700 tabular-nums">
                {Math.round(evaluationResult.speaking_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Listening</span>
              <span className="text-xl font-bold font-mono text-amber-700 tabular-nums">
                {Math.round(evaluationResult.listening_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-medium text-slate-500 block">Reading</span>
              <span className="text-xl font-bold font-mono text-sky-700 tabular-nums">
                {Math.round(evaluationResult.reading_score)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-medium text-slate-500 block">Writing</span>
              <span className="text-xl font-bold font-mono text-purple-700 tabular-nums">
                {Math.round(evaluationResult.writing_score)}
              </span>
            </div>
          </div>

          {/* AI Evaluator Narrative */}
          <div className="p-4 rounded-xl bg-blue-50/40 border border-blue-100">
            <h4 className="text-xs font-bold text-blue-950 uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Dr. Vance's Evaluative Summary
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed">
              {evaluationResult.ai_feedback_text}
            </p>
            {evaluationResult.hesitation_analysis && (
              <p className="text-[11px] text-slate-500 font-mono mt-2 pt-2 border-t border-blue-200/50">
                Acoustic Cadence Analysis: {evaluationResult.hesitation_analysis}
              </p>
            )}
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50/40 border border-emerald-100">
              <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Strengths
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {evaluationResult.strengths?.map((str: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-500">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-amber-50/40 border border-amber-100">
              <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Concrete Next Steps
              </h5>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {evaluationResult.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-500">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gamification Badge Unlocked Alert */}
          {evaluationResult.speaking_score >= 75 && (
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-400 text-slate-900 flex items-center justify-center font-bold shrink-0 shadow-xs">
                ★
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Academic Honor Criteria Met: 'Fluent Speaker'</span>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900">
                    +150 pts
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Speaking benchmark exceeded ({Math.round(evaluationResult.speaking_score)} pts). Recorded to your permanent student achievements dossier.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                setInterviewState('idle');
                setTranscript([]);
                setEvaluationResult(null);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Another Scenario
            </button>

            <button
              onClick={onComplete}
              className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
