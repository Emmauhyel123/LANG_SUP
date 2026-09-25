import React, { useState } from 'react';
import {
  MessageSquare,
  Mic,
  Volume2,
  BookOpen,
  PenTool,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  VolumeX,
} from 'lucide-react';

interface PillarModulesProps {
  onLaunchInterview: () => void;
  onLaunchReadingWriting: () => void;
}

export const PillarModules: React.FC<PillarModulesProps> = ({
  onLaunchInterview,
  onLaunchReadingWriting,
}) => {
  const [activePillar, setActivePillar] = useState<'communication' | 'speaking' | 'listening' | 'reading' | 'writing'>('communication');
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Pillar 1: Communication Drills (Pragmatics & Academic Register)
  const communicationDrills = [
    {
      id: 'comm_1',
      title: 'Academic Pragmatics: Handling Fieldwork Disagreement',
      scenario: 'In an oral defense, a panel member states: "Your sample size in the urban ethnography is too small to substantiate broader structural claims." Which response demonstrates optimal academic communication and reflexivity?',
      options: [
        '“That criticism is invalid because qualitative fieldwork never requires large samples.”',
        '“While statistical generalizability is inherently bounded in small ethnographic cohorts, the methodology aims for thick descriptive depth and contextual transferability, rather than econometric scaling.”',
        '“I agree completely, so my study should probably be categorized as an informal exploratory pilot rather than real research.”',
        '“You are misunderstanding the purpose of social sciences.”',
      ],
      correctIndex: 1,
      explanation: 'Option 2 demonstrates academic pragmatics by politely conceding statistical boundaries while assertively substantiating the study\'s epistemic value through methodological rigor (thick description).',
    },
    {
      id: 'comm_2',
      title: 'Discourse Coherence: Transitioning Across Opposing Theories',
      scenario: 'You are reconciling Functionalist and Conflict theories on municipal zoning. Which transitional formulation maintains the highest discourse coherence?',
      options: [
        '“Functionalism looks at harmony. But Conflict theory is against that and says power is bad.”',
        '“Whereas functionalist paradigms conceptualize municipal zoning as an equilibrating mechanism for communal order, conflict theorists counter that regulatory spatial boundaries institutionalize class segregation.”',
        '“Zoning is functional. Also conflict theory exists too in the bibliography.”',
        '“Nobody actually believes functionalism anymore in modern sociology.”',
      ],
      correctIndex: 1,
      explanation: 'Option 2 deploys sophisticated transitional subordinate conjunctions ("Whereas... counter that...") to maintain parallel analytical depth.',
    },
  ];

  // Pillar 2: Speaking Drills (Fluency, Hesitation Reduction & Pronunciation)
  const speakingDrills = [
    {
      id: 'spk_1',
      term: 'Epistemological Reflexivity',
      phonetics: '/ɪˌpɪstɪməˈlɒdʒɪkəl rɪˌflɛkˈsɪvɪti/',
      definition: 'The self-critical examination of how research methods and investigator identity shape produced knowledge.',
      practicePhrase: '“Adopting epistemological reflexivity enables researchers to interrogate implicit ideological presuppositions.”',
      tip: 'Cadence Focus: Stress the third syllable in /ˌpɪs-tɪ-mə-ˈLɒ-dʒɪ-kəl/ and keep the pause under 0.8 seconds before transitioning to reflexivity.',
    },
    {
      id: 'spk_2',
      term: 'Stratified Randomization',
      phonetics: '/ˈstrætɪfaɪd ˌrændəmaɪˈzeɪʃən/',
      definition: 'A sampling methodology partitioning a population into sub-groups before random selection.',
      practicePhrase: '“Stratified randomization guarantees proportional demographic representation across socio-economic quartiles.”',
      tip: 'Phonetic Focus: Crisp alveolar /t/ in "stratified" without glottal stopping.',
    },
  ];

  // Pillar 3: Listening Drills (Audio Comprehension & Prompt Adaptation)
  const listeningDrills = [
    {
      id: 'lis_1',
      speaker: 'Prof. Marcus Chen, Sociology Review Board',
      audioText: '“While the quantitative regression coefficients demonstrate a statistically significant correlation between localized microfinance access and female household agency, the qualitative interviews suggest that male household heads frequently retain de facto veto power over major capital expenditures.”',
      question: 'What is the primary tension articulated by the speaker regarding microfinance intervention?',
      options: [
        'Microfinance programs completely failed to distribute capital to rural women.',
        'Formal financial inclusion metrics conceal informal domestic power asymmetries.',
        'Quantitative regressions are inherently fabricated by funding agencies.',
        'Qualitative interviews should be discarded because regressions showed statistical significance.',
      ],
      correctIndex: 1,
      explanation: 'The speaker contrasts nominal correlation (statistical loan reception) with qualitative reality (informal male veto power), exposing the limitation of un-triangulated data.',
    },
  ];

  const handleSelectOption = (drillId: string, optionIdx: number) => {
    setUserAnswers((prev) => ({ ...prev, [drillId]: optionIdx }));
    setShowFeedback((prev) => ({ ...prev, [drillId]: true }));
  };

  const playTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Five Core Pillars: Interactive Practice & Drills</h2>
          <p className="text-xs text-slate-500 mt-1">
            Targeted drills isolating each academic competency to prepare for mock oral examinations and writing assessments.
          </p>
        </div>

        {/* Pillar Switcher Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActivePillar('communication')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activePillar === 'communication'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Communication
          </button>
          <button
            onClick={() => setActivePillar('speaking')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activePillar === 'speaking'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Speaking
          </button>
          <button
            onClick={() => setActivePillar('listening')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activePillar === 'listening'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Listening
          </button>
          <button
            onClick={() => setActivePillar('reading')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activePillar === 'reading'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Reading
          </button>
          <button
            onClick={() => setActivePillar('writing')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              activePillar === 'writing'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            5. Writing
          </button>
        </div>
      </div>

      {/* PILLAR 1: COMMUNICATION */}
      {activePillar === 'communication' && (
        <div className="space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-indigo-900 font-semibold text-sm">
              <MessageSquare className="w-4 h-4 text-indigo-700" />
              <span>Pillar 1: Pragmatic Competence & Sociolinguistic Academic Register</span>
            </div>
            <p className="text-xs text-indigo-950 mt-1">
              Evaluates how candidates handle academic nuance, defense counter-arguments, hedging, and conversational discourse coherence in university faculty settings.
            </p>
          </div>

          <div className="space-y-4">
            {communicationDrills.map((drill) => (
              <div key={drill.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-900">{drill.title}</h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {drill.scenario}
                </p>

                <div className="space-y-2">
                  {drill.options.map((opt, idx) => {
                    const isSelected = userAnswers[drill.id] === idx;
                    const isCorrect = idx === drill.correctIndex;
                    const showResult = showFeedback[drill.id];

                    let btnClass = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                    if (showResult) {
                      if (isCorrect) {
                        btnClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium';
                      } else if (isSelected) {
                        btnClass = 'border-red-400 bg-red-50 text-red-950';
                      }
                    } else if (isSelected) {
                      btnClass = 'border-blue-500 bg-blue-50 text-blue-950';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(drill.id, idx)}
                        className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-colors flex items-start gap-2.5 ${btnClass}`}
                      >
                        <span className="font-mono text-slate-500 font-semibold mt-0.5">
                          {String.fromCharCode(65 + idx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {showFeedback[drill.id] && (
                  <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-0.5">Faculty Rubric Analysis</span>
                      <span>{drill.explanation}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 2: SPEAKING */}
      {activePillar === 'speaking' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
              <Mic className="w-4 h-4 text-emerald-700" />
              <span>Pillar 2: Pronunciation, Phonetic Precision & Hesitation Reduction</span>
            </div>
            <p className="text-xs text-emerald-950 mt-1">
              Master polysyllabic academic terminology, phonetic stress patterns, and minimize unscripted pause markers exceeding 1.5 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {speakingDrills.map((drill) => (
              <div key={drill.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{drill.term}</h3>
                  <button
                    onClick={() => playTTS(drill.term)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                    title="Pronounce Term"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded inline-block">
                  {drill.phonetics}
                </div>
                <p className="text-xs text-slate-600">{drill.definition}</p>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-xs text-emerald-950">
                  <span className="font-semibold block mb-1">Verbal Cadence Drill:</span>
                  <p className="italic">{drill.practicePhrase}</p>
                </div>

                <p className="text-[11px] text-slate-500 font-mono">
                  {drill.tip}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Ready to test in live speech?</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Launch the AI Mock Interview to receive real-time hesitation metrics and voice evaluation.
              </p>
            </div>
            <button
              onClick={onLaunchInterview}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Mic className="w-3.5 h-3.5" />
              Launch Mock Interview
            </button>
          </div>
        </div>
      )}

      {/* PILLAR 3: LISTENING */}
      {activePillar === 'listening' && (
        <div className="space-y-4">
          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <Volume2 className="w-4 h-4 text-amber-700" />
              <span>Pillar 3: Aural Academic Comprehension & Spoken Stimuli Adaptation</span>
            </div>
            <p className="text-xs text-amber-950 mt-1">
              Practice decoding rapid scholarly speech, identifying implicit institutional premises, and preparing immediate oral counter-arguments.
            </p>
          </div>

          {listeningDrills.map((drill) => (
            <div key={drill.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-mono font-medium text-slate-600">
                  Audio Excerpt: {drill.speaker}
                </span>
                <button
                  onClick={() => playTTS(drill.audioText)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  {isPlayingAudio ? 'Playing...' : 'Listen to Audio Excerpt'}
                </button>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-serif leading-relaxed italic">
                {drill.audioText}
              </div>

              <h4 className="text-xs font-bold text-slate-900">{drill.question}</h4>

              <div className="space-y-2">
                {drill.options.map((opt, idx) => {
                  const isSelected = userAnswers[drill.id] === idx;
                  const isCorrect = idx === drill.correctIndex;
                  const showResult = showFeedback[drill.id];

                  let btnClass = 'border-slate-200 hover:border-slate-300 bg-white text-slate-800';
                  if (showResult) {
                    if (isCorrect) {
                      btnClass = 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium';
                    } else if (isSelected) {
                      btnClass = 'border-red-400 bg-red-50 text-red-950';
                    }
                  } else if (isSelected) {
                    btnClass = 'border-amber-500 bg-amber-50 text-amber-950';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(drill.id, idx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs leading-relaxed transition-colors flex items-start gap-2.5 ${btnClass}`}
                    >
                      <span className="font-mono text-slate-500 font-semibold mt-0.5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {showFeedback[drill.id] && (
                <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-xs text-amber-950 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Aural Deduction Analysis</span>
                    <span>{drill.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PILLAR 4 & 5: READING & WRITING */}
      {(activePillar === 'reading' || activePillar === 'writing') && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
            {activePillar === 'reading' ? <BookOpen className="w-6 h-6" /> : <PenTool className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {activePillar === 'reading'
              ? 'Pillar 4: Scholarly Text Synthesis & Critical Reading'
              : 'Pillar 5: Timed Argumentative Essay & Syntactic Evaluation'}
          </h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
            Full-scale reading comprehension passages and timed academic writing essays are integrated into our dedicated assessment test environment with automated Gemini grammar and lexical scoring.
          </p>
          <button
            onClick={onLaunchReadingWriting}
            className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
          >
            <span>Open Reading & Writing Assessment Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
