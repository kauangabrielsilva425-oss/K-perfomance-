import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  History,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  SkipForward,
  Star,
  Trophy,
  Volume2,
  X,
  Zap,
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/initialData';
import { Exercise } from '../types';

export const LiveWorkout: React.FC = () => {
  const {
    activeWorkout,
    updateActiveWorkout,
    finishWorkout,
    cancelWorkout,
    activeRoutine,
    workoutHistory,
    setCurrentTab,
    playTimerBeep,
  } = useApp();

  // Exercise history lookup modal
  const [historyModalEx, setHistoryModalEx] = useState<Exercise | null>(null);

  // Finish Workout Summary Modal
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [recoveryRating, setRecoveryRating] = useState(4);
  const [sessionNotes, setSessionNotes] = useState('');

  if (!activeWorkout) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto mb-4 text-neutral-400">
          <Dumbbell className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-display text-white mb-2">
          Nenhum Treino em Andamento
        </h2>
        <p className="text-neutral-400 text-sm max-w-md mx-auto mb-6">
          Selecione uma sessão da sua rotina para iniciar o cronômetro, registrar cargas e acompanhar o descanso.
        </p>
        <button
          onClick={() => setCurrentTab('rotina')}
          className="px-6 py-3 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-lg"
        >
          Ver Minhas Sessões
        </button>
      </div>
    );
  }

  const currentSession = activeRoutine.sessions.find((s) => s.id === activeWorkout.sessionId) || {
    id: activeWorkout.sessionId,
    name: activeWorkout.sessionName,
    focusMuscles: [],
    exercises: EXERCISE_DATABASE.slice(0, 5),
    estimatedDurationMin: 60,
  };

  const currentExercise = currentSession.exercises[activeWorkout.currentExerciseIndex] || currentSession.exercises[0];
  const nextExercise = currentSession.exercises[activeWorkout.currentExerciseIndex + 1];

  const currentSets = activeWorkout.completedSets[currentExercise.id] || [];

  // Calculate overall progress (% of sets completed)
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let currentVolumeMoved = 0;

  Object.values(activeWorkout.completedSets).forEach((sets) => {
    totalSetsCount += sets.length;
    sets.forEach((s) => {
      if (s.completed) {
        completedSetsCount++;
        currentVolumeMoved += s.weightKg * s.reps;
      }
    });
  });

  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Format seconds to mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggleSet = (setIndex: number) => {
    updateActiveWorkout((prev) => {
      const sets = [...(prev.completedSets[currentExercise.id] || [])];
      if (!sets[setIndex]) return prev;

      const willBeCompleted = !sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: willBeCompleted };

      // If completing set, start rest timer automatically
      let restActive = prev.isRestActive;
      let restRemaining = prev.restSecondsRemaining;

      if (willBeCompleted) {
        restActive = true;
        restRemaining = currentExercise.suggestedRestSeconds || 90;
      }

      return {
        ...prev,
        completedSets: {
          ...prev.completedSets,
          [currentExercise.id]: sets,
        },
        isRestActive: restActive,
        restSecondsRemaining: restRemaining,
        restTargetSeconds: currentExercise.suggestedRestSeconds || 90,
      };
    });
  };

  const handleWeightChange = (setIndex: number, newWeight: number) => {
    updateActiveWorkout((prev) => {
      const sets = [...(prev.completedSets[currentExercise.id] || [])];
      if (sets[setIndex]) {
        sets[setIndex] = { ...sets[setIndex], weightKg: Math.max(0, newWeight) };
      }
      return {
        ...prev,
        completedSets: { ...prev.completedSets, [currentExercise.id]: sets },
      };
    });
  };

  const handleRepsChange = (setIndex: number, newReps: number) => {
    updateActiveWorkout((prev) => {
      const sets = [...(prev.completedSets[currentExercise.id] || [])];
      if (sets[setIndex]) {
        sets[setIndex] = { ...sets[setIndex], reps: Math.max(1, newReps) };
      }
      return {
        ...prev,
        completedSets: { ...prev.completedSets, [currentExercise.id]: sets },
      };
    });
  };

  const handleNextExercise = () => {
    if (activeWorkout.currentExerciseIndex < currentSession.exercises.length - 1) {
      updateActiveWorkout((prev) => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1,
      }));
    }
  };

  const handlePrevExercise = () => {
    if (activeWorkout.currentExerciseIndex > 0) {
      updateActiveWorkout((prev) => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex - 1,
      }));
    }
  };

  // Rest Timer Controls
  const setRestPreset = (seconds: number) => {
    updateActiveWorkout((prev) => ({
      ...prev,
      isRestActive: true,
      restSecondsRemaining: seconds,
      restTargetSeconds: seconds,
    }));
  };

  const toggleRestTimer = () => {
    updateActiveWorkout((prev) => ({
      ...prev,
      isRestActive: !prev.isRestActive,
    }));
  };

  const adjustRestTime = (delta: number) => {
    updateActiveWorkout((prev) => ({
      ...prev,
      restSecondsRemaining: Math.max(0, prev.restSecondsRemaining + delta),
    }));
  };

  const confirmFinish = () => {
    finishWorkout(recoveryRating, sessionNotes);
    setShowFinishModal(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Top Session Status Bar */}
      <div className="rounded-3xl p-5 bg-neutral-950 border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block">
            MODO TREINO AO VIVO
          </span>
          <h1 className="text-xl md:text-2xl font-bold font-display text-white">
            {activeWorkout.sessionName}
          </h1>
          <span className="text-xs text-neutral-400">
            Exercício {activeWorkout.currentExerciseIndex + 1} de {currentSession.exercises.length}
          </span>
        </div>

        {/* Big Stopwatch & Pause */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <Clock className="w-4 h-4 text-neutral-400" />
            <span className="text-2xl font-mono font-bold text-white tracking-wider">
              {formatTime(activeWorkout.elapsedSeconds)}
            </span>
          </div>

          <button
            onClick={() =>
              updateActiveWorkout((prev) => ({ ...prev, isPaused: !prev.isPaused }))
            }
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
              activeWorkout.isPaused
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title={activeWorkout.isPaused ? 'Retomar treino' : 'Pausar treino'}
          >
            {activeWorkout.isPaused ? <Play className="w-5 h-5 fill-amber-400" /> : <Pause className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setShowFinishModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase rounded-2xl transition-all cursor-pointer shadow-lg active:scale-95"
          >
            Finalizar Treino
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3">
        <div className="flex items-center justify-between text-xs font-mono text-neutral-400 mb-2">
          <span>Progresso da Sessão</span>
          <span className="text-white font-bold">{progressPercent}% Concluído ({completedSetsCount}/{totalSetsCount} séries)</span>
        </div>
        <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-white h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Focus: Current Exercise Card */}
      <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-white/10 shadow-2xl relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono uppercase bg-neutral-900 text-neutral-300 border border-neutral-800">
                {currentExercise.muscleGroup}
              </span>
              <span className="text-xs text-neutral-500 font-mono">
                {currentExercise.equipmentRequired}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
              {currentExercise.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryModalEx(currentExercise)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white text-xs font-mono hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5" />
              <span>Ver Cargas Anteriores</span>
            </button>
          </div>
        </div>

        {/* Biomechanical Cues Accordion / Highlights */}
        {currentExercise.formCues && currentExercise.formCues.length > 0 && (
          <div className="my-4 p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800/60 text-xs">
            <span className="text-neutral-400 font-mono uppercase text-[10px] block mb-1">
              Dicas de Execução & Conexão Mente-Músculo:
            </span>
            <div className="flex flex-wrap gap-2 text-neutral-300">
              {currentExercise.formCues.map((cue, idx) => (
                <span key={idx} className="bg-neutral-900 px-2.5 py-1 rounded-lg border border-neutral-800 text-[11px]">
                  • {cue}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sets & Reps Interactive Grid */}
        <div className="my-6 space-y-3">
          <div className="grid grid-cols-12 gap-2 text-[11px] font-mono uppercase text-neutral-500 px-3 pb-1">
            <span className="col-span-2 text-center">Série</span>
            <span className="col-span-4 text-center">Carga (kg)</span>
            <span className="col-span-3 text-center">Reps Feitas</span>
            <span className="col-span-3 text-center">Concluir</span>
          </div>

          {currentSets.map((set, sIdx) => (
            <div
              key={sIdx}
              className={`grid grid-cols-12 gap-2 items-center p-3 rounded-2xl border transition-all ${
                set.completed
                  ? 'bg-neutral-900/80 border-emerald-500/40 text-neutral-300'
                  : 'bg-neutral-900/30 border-neutral-800 hover:border-neutral-700 text-white'
              }`}
            >
              <div className="col-span-2 text-center font-mono font-bold text-sm">
                #{set.setNumber}
              </div>

              {/* Weight Adjustment */}
              <div className="col-span-4 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handleWeightChange(sIdx, set.weightKg - 2.5)}
                  className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={set.weightKg}
                  onChange={(e) => handleWeightChange(sIdx, parseFloat(e.target.value) || 0)}
                  className="w-16 bg-neutral-950 border border-neutral-700 rounded-lg py-1 text-center font-mono font-bold text-sm text-white"
                />
                <button
                  onClick={() => handleWeightChange(sIdx, set.weightKg + 2.5)}
                  className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Reps Adjustment */}
              <div className="col-span-3 flex items-center justify-center gap-1.5">
                <button
                  onClick={() => handleRepsChange(sIdx, set.reps - 1)}
                  className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center active:scale-95"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-mono font-bold text-sm text-white w-8 text-center">
                  {set.reps}
                </span>
                <button
                  onClick={() => handleRepsChange(sIdx, set.reps + 1)}
                  className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white flex items-center justify-center active:scale-95"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Completion Big Checkbox */}
              <div className="col-span-3 flex justify-center">
                <button
                  onClick={() => handleToggleSet(sIdx)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    set.completed
                      ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                      : 'bg-neutral-800 text-neutral-500 hover:text-neutral-200 border border-neutral-700'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Exercise Controls: Prev / Next / Notes */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevExercise}
              disabled={activeWorkout.currentExerciseIndex === 0}
              className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 disabled:opacity-40 text-xs font-mono hover:bg-neutral-900 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={handleNextExercise}
              disabled={activeWorkout.currentExerciseIndex >= currentSession.exercises.length - 1}
              className="px-4 py-2 rounded-xl border border-neutral-800 text-neutral-300 disabled:opacity-40 text-xs font-mono hover:bg-neutral-900 transition-colors"
            >
              Próximo →
            </button>
          </div>

          {nextExercise && (
            <div className="text-xs text-neutral-400 font-mono">
              A seguir:{' '}
              <strong className="text-white font-normal">{nextExercise.name}</strong>
            </div>
          )}
        </div>
      </div>

      {/* Rest Timer Module (with beep & presets) */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
            TEMPORIZADOR DE DESCANSO INTERSET
          </span>
          <div className="flex items-baseline gap-3">
            <span
              className={`text-4xl md:text-5xl font-mono font-extrabold ${
                activeWorkout.isRestActive && activeWorkout.restSecondsRemaining <= 5
                  ? 'text-red-400'
                  : 'text-white'
              }`}
            >
              {formatTime(activeWorkout.restSecondsRemaining)}
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              (Meta: {activeWorkout.restTargetSeconds}s)
            </span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {[45, 60, 90, 120, 180].map((sec) => (
            <button
              key={sec}
              onClick={() => setRestPreset(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                activeWorkout.restTargetSeconds === sec && activeWorkout.isRestActive
                  ? 'bg-white text-black font-bold border-white'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {sec}s
            </button>
          ))}
        </div>

        {/* Adjust controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustRestTime(-15)}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-mono text-neutral-400 hover:text-white"
          >
            -15s
          </button>
          <button
            onClick={toggleRestTimer}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-semibold"
          >
            {activeWorkout.isRestActive ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            onClick={() => adjustRestTime(15)}
            className="px-2.5 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900 text-xs font-mono text-neutral-400 hover:text-white"
          >
            +15s
          </button>
          <button
            onClick={playTimerBeep}
            className="p-2 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
            title="Testar som de aviso"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cancel workout option */}
      <div className="flex justify-center pt-2">
        <button
          onClick={cancelWorkout}
          className="text-xs text-neutral-500 hover:text-neutral-300 cursor-pointer"
        >
          Descartar treino atual sem salvar
        </button>
      </div>

      {/* Exercise History Lookup Modal */}
      {historyModalEx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold font-display text-white">
                Histórico: {historyModalEx.name}
              </h3>
              <button
                onClick={() => setHistoryModalEx(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {workoutHistory.filter((h) =>
                h.details.some((d) => d.exerciseName.toLowerCase().includes(historyModalEx.name.toLowerCase().slice(0, 8)))
              ).length === 0 ? (
                <p className="text-neutral-500 py-6 text-center">
                  Nenhum registro anterior localizado para este exercício ainda.
                </p>
              ) : (
                workoutHistory.map((h) => {
                  const matchingEx = h.details.find((d) =>
                    d.exerciseName.toLowerCase().includes(historyModalEx.name.toLowerCase().slice(0, 8))
                  );
                  if (!matchingEx) return null;
                  return (
                    <div key={h.id} className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800">
                      <div className="flex items-center justify-between text-neutral-400 mb-2 font-mono text-[11px]">
                        <span>{h.date}</span>
                        <span>{h.sessionName}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {matchingEx.sets.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-black border border-neutral-800 rounded-lg text-white font-mono text-xs"
                          >
                            #{idx + 1}: {s.weightKg}kg × {s.reps}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setHistoryModalEx(null)}
                className="px-4 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Finish Workout Summary Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <Trophy className="w-7 h-7" />
              </div>
              <h2 className="text-2xl font-bold font-display text-white">Sessão Concluída!</h2>
              <p className="text-neutral-400 text-xs mt-1">
                Excelente trabalho biomecânico e consistência preservada.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3 text-center my-6 text-xs">
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Duração</span>
                <span className="text-base font-bold font-mono text-white mt-1 block">
                  {Math.round(activeWorkout.elapsedSeconds / 60)} min
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Volume Total</span>
                <span className="text-base font-bold font-mono text-white mt-1 block">
                  {currentVolumeMoved.toLocaleString()} kg
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-neutral-900 border border-neutral-800">
                <span className="text-[10px] font-mono text-neutral-400 uppercase block">Séries</span>
                <span className="text-base font-bold font-mono text-white mt-1 block">
                  {completedSetsCount}
                </span>
              </div>
            </div>

            {/* Perceived Recovery / Energy (1-5 stars) */}
            <div className="my-4 text-xs">
              <label className="text-neutral-400 block mb-2 font-medium">
                Como você avalia sua recuperação e energia nesta sessão?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRecoveryRating(star)}
                    className="p-1 text-neutral-500 hover:text-amber-400 transition-colors"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= recoveryRating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="my-4 text-xs">
              <label className="text-neutral-400 block mb-1.5 font-medium">Observações Pessoais</label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Ex: Supino com boa retração escapular, sem dor nos ombros."
                rows={3}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-neutral-300 text-xs hover:bg-neutral-900"
              >
                Voltar ao Treino
              </button>
              <button
                type="button"
                onClick={confirmFinish}
                className="px-6 py-2 bg-white text-black font-bold text-xs uppercase rounded-full hover:bg-neutral-200 transition-all shadow-lg cursor-pointer"
              >
                Salvar no Histórico
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
