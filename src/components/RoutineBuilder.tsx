import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Info,
  Play,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { EXERCISE_DATABASE } from '../data/initialData';
import { WorkoutSession, Exercise } from '../types';

export const RoutineBuilder: React.FC = () => {
  const {
    routines,
    activeRoutine,
    setActiveRoutineId,
    saveCustomRoutine,
    generateSuggestedRoutine,
    startWorkout,
    userProfile,
  } = useApp();

  // Generator form state
  const [days, setDays] = useState<number>(userProfile.daysPerWeek || 4);
  const [experience, setExperience] = useState<string>(userProfile.experience || 'intermediario');
  const [goal, setGoal] = useState<string>(userProfile.goal || 'hipertrofia');
  const [time, setTime] = useState<number>(userProfile.timePerSessionMin || 60);
  const [equipment, setEquipment] = useState<string>(userProfile.equipment || 'academia_completa');

  // Currently expanded session in the view
  const [expandedSessionId, setExpandedSessionId] = useState<string>(
    activeRoutine.sessions[0]?.id || ''
  );

  // Substitute exercise modal state
  const [substituteModal, setSubstituteModal] = useState<{
    sessionId: string;
    exerciseIndex: number;
    currentExercise: Exercise;
  } | null>(null);

  // Add exercise modal
  const [addExerciseModal, setAddExerciseModal] = useState<{ sessionId: string } | null>(null);
  const [exerciseFilterMuscle, setExerciseFilterMuscle] = useState<string>('todos');

  // Toast feedback
  const [savedNotification, setSavedNotification] = useState(false);

  const handleGenerate = () => {
    const generated = generateSuggestedRoutine({
      days,
      experience,
      goal,
      time,
      equipment,
    });
    setExpandedSessionId(generated.sessions[0]?.id || '');
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const handleSubstituteExercise = (newEx: Exercise) => {
    if (!substituteModal) return;
    const { sessionId, exerciseIndex } = substituteModal;

    const updatedSessions = activeRoutine.sessions.map((sess) => {
      if (sess.id !== sessionId) return sess;
      const exList = [...sess.exercises];
      exList[exerciseIndex] = newEx;
      return { ...sess, exercises: exList };
    });

    saveCustomRoutine({
      ...activeRoutine,
      sessions: updatedSessions,
    });
    setSubstituteModal(null);
  };

  const handleAddExerciseToSession = (ex: Exercise) => {
    if (!addExerciseModal) return;
    const { sessionId } = addExerciseModal;

    const updatedSessions = activeRoutine.sessions.map((sess) => {
      if (sess.id !== sessionId) return sess;
      return {
        ...sess,
        exercises: [...sess.exercises, ex],
      };
    });

    saveCustomRoutine({
      ...activeRoutine,
      sessions: updatedSessions,
    });
    setAddExerciseModal(null);
  };

  const handleRemoveExercise = (sessionId: string, exIndex: number) => {
    const updatedSessions = activeRoutine.sessions.map((sess) => {
      if (sess.id !== sessionId) return sess;
      return {
        ...sess,
        exercises: sess.exercises.filter((_, idx) => idx !== exIndex),
      };
    });

    saveCustomRoutine({
      ...activeRoutine,
      sessions: updatedSessions,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
            Ferramenta Interativa // Divisões & Volume
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mt-2">
            Minha Rotina
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Gere, personalize e organize seus treinos semanais com base em evidências científicas,
            tempo disponível e equipamentos acessíveis.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-500/50 rounded-full text-xs font-mono text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Rotina salva com sucesso!</span>
          </div>
        )}
      </div>

      {/* Routine Configuration Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-neutral-950 border border-white/10 shadow-2xl">
        <h2 className="text-lg font-bold font-display text-white mb-4 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-neutral-400" />
          <span>Configurar Parâmetros de Treino</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="text-neutral-400 block mb-1.5 font-medium">Frequência Semanal</label>
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="2">2 Dias (Full Body)</option>
              <option value="3">3 Dias (Full Body / Híbrido)</option>
              <option value="4">4 Dias (Upper / Lower)</option>
              <option value="5">5 Dias (Push / Pull / Legs +)</option>
              <option value="6">6 Dias (PPL 2x)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5 font-medium">Nível de Experiência</label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white"
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5 font-medium">Objetivo Principal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white capitalize"
            >
              <option value="hipertrofia">Hipertrofia Muscular</option>
              <option value="forca">Ganho de Força</option>
              <option value="recomposicao">Recomposição Corporal</option>
              <option value="resistencia">Resistência Muscular</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5 font-medium">Tempo por Sessão</label>
            <select
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white font-mono"
            >
              <option value="40">40 minutos</option>
              <option value="50">50 minutos</option>
              <option value="60">60 minutos (Padrão)</option>
              <option value="75">75 minutos</option>
              <option value="90">90 minutos</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1.5 font-medium">Equipamento</label>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-white"
            >
              <option value="academia_completa">Academia Completa</option>
              <option value="halteres_banco">Halteres & Banco</option>
              <option value="peso_corporal">Peso Corporal</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Alternar entre rotinas salvas:</span>
            <div className="flex gap-2">
              {routines.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveRoutineId(r.id)}
                  className={`px-3 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                    r.isCurrentActive
                      ? 'bg-neutral-800 border-white text-white font-medium'
                      : 'border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {r.name.split(':')[0]}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Gerar Sugestão de Rotina</span>
          </button>
        </div>
      </div>

      {/* Active Routine Information */}
      <div className="rounded-3xl p-6 bg-gradient-to-r from-neutral-900/90 via-neutral-950 to-black border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block mb-1">
            Rotina Ativa no seu Perfil
          </span>
          <h2 className="text-2xl font-bold font-display text-white">{activeRoutine.name}</h2>
          <p className="text-neutral-400 text-xs mt-1 max-w-2xl">{activeRoutine.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
            {activeRoutine.sessions.length} sessões semanais
          </span>
        </div>
      </div>

      {/* Routine Sessions Accordion */}
      <div className="space-y-4">
        {activeRoutine.sessions.map((session, sIdx) => {
          const isExpanded = expandedSessionId === session.id;

          return (
            <div
              key={session.id}
              className="rounded-3xl bg-neutral-950 border border-white/10 overflow-hidden shadow-xl"
            >
              {/* Session Header Bar */}
              <div
                onClick={() => setExpandedSessionId(isExpanded ? '' : session.id)}
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-neutral-900/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center font-mono text-xs font-bold text-white">
                    {String.fromCharCode(65 + sIdx)}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">{session.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span className="font-mono text-[11px] text-neutral-300">
                        {session.exercises.length} exercícios
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-neutral-300">
                        ~{session.estimatedDurationMin} min
                      </span>
                      <span>•</span>
                      <span className="text-neutral-400 hidden sm:inline">
                        {session.focusMuscles.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startWorkout(session);
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black text-xs font-bold uppercase rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span className="hidden sm:inline">Iniciar Treino</span>
                  </button>
                  <button className="p-1 text-neutral-400 hover:text-white">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Session Exercise Content (when expanded) */}
              {isExpanded && (
                <div className="px-5 pb-6 border-t border-white/5 space-y-4 pt-4">
                  <div className="space-y-3">
                    {session.exercises.map((ex, exIdx) => (
                      <div
                        key={`${ex.id}_${exIdx}`}
                        className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                      >
                        <div className="space-y-1.5 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-neutral-500 font-bold">{exIdx + 1}.</span>
                            <h4 className="font-bold text-sm text-white">{ex.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-neutral-800 text-neutral-300">
                              {ex.muscleGroup}
                            </span>
                          </div>

                          <p className="text-neutral-400 text-[11px] leading-relaxed">
                            {ex.executionInstructions[0]}
                          </p>

                          {/* Biomechanical Cues */}
                          {ex.formCues && ex.formCues.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {ex.formCues.map((cue, cIdx) => (
                                <span
                                  key={cIdx}
                                  className="text-[10px] text-neutral-300 bg-neutral-800/70 border border-neutral-700/50 px-2 py-0.5 rounded-md"
                                >
                                  ✓ {cue}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Prescribed Sets & Reps */}
                        <div className="flex flex-wrap items-center gap-4 text-right">
                          <div className="font-mono text-left md:text-right">
                            <div className="text-white font-bold text-sm">
                              {ex.defaultSets} séries × {ex.defaultReps}
                            </div>
                            <div className="text-neutral-500 text-[11px]">
                              Descanso: {ex.suggestedRestSeconds}s
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                setSubstituteModal({
                                  sessionId: session.id,
                                  exerciseIndex: exIdx,
                                  currentExercise: ex,
                                })
                              }
                              className="px-2.5 py-1 text-[11px] rounded-lg border border-neutral-800 hover:border-neutral-600 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                              title="Substituir por alternativa"
                            >
                              Substituir
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(session.id, exIdx)}
                              className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Remover exercício"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Exercise to Session button */}
                  <div className="pt-2 flex justify-start">
                    <button
                      onClick={() => setAddExerciseModal({ sessionId: session.id })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed border-neutral-700 text-neutral-300 hover:text-white hover:border-neutral-500 text-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Exercício a esta Sessão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ethical & Scientific Guidance Notice */}
      <div className="rounded-3xl p-6 bg-neutral-950 border border-neutral-800/70 text-xs text-neutral-400 space-y-2 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-white font-semibold text-sm mb-1">
            Diretriz Ética & Segurança K Performance
          </h4>
          <p>
            As sugestões de treinamento são calculadas com base em princípios validados pela literatura
            científica esportiva (progressão de carga, sobrecarga progressiva e recuperação neuromuscular de 48h a 72h).
            Não prometemos resultados milagrosos ou prazos irrealistas.
          </p>
          <p className="mt-1">
            Priorize a técnica e a execução biomecânica impecável antes de aumentar cargas. Caso possua
            lesões articulares prévias, procure a supervisão presencial de um profissional de Educação Física habilitado.
          </p>
        </div>
      </div>

      {/* Substitute Exercise Modal */}
      {substituteModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2">
              Substituir: {substituteModal.currentExercise.name}
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Escolha uma alternativa com padrão motor similar para o grupo muscular{' '}
              <strong className="text-white uppercase">{substituteModal.currentExercise.muscleGroup}</strong>:
            </p>

            <div className="space-y-2.5">
              {EXERCISE_DATABASE.filter(
                (ex) =>
                  ex.muscleGroup === substituteModal.currentExercise.muscleGroup &&
                  ex.id !== substituteModal.currentExercise.id
              ).map((altEx) => (
                <div
                  key={altEx.id}
                  onClick={() => handleSubstituteExercise(altEx)}
                  className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-white transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block text-sm">{altEx.name}</span>
                    <span className="text-[11px] text-neutral-400">{altEx.equipmentRequired}</span>
                  </div>
                  <span className="px-3 py-1 bg-white text-black font-semibold rounded-full text-[11px]">
                    Selecionar
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSubstituteModal(null)}
                className="px-4 py-2 border border-neutral-800 text-neutral-300 rounded-full text-xs hover:bg-neutral-900"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {addExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-3">
              Adicionar Exercício da Biblioteca
            </h3>

            {/* Muscle Group Filter */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {['todos', 'peitoral', 'dorsais', 'ombros', 'quadriceps', 'posteriores', 'biceps', 'triceps', 'panturrilhas'].map((group) => (
                <button
                  key={group}
                  onClick={() => setExerciseFilterMuscle(group)}
                  className={`px-3 py-1 text-xs rounded-full uppercase font-mono transition-all cursor-pointer ${
                    exerciseFilterMuscle === group
                      ? 'bg-white text-black font-semibold'
                      : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {EXERCISE_DATABASE.filter(
                (ex) => exerciseFilterMuscle === 'todos' || ex.muscleGroup === exerciseFilterMuscle
              ).map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => handleAddExerciseToSession(ex)}
                  className="p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block text-sm">{ex.name}</span>
                    <span className="text-[11px] text-neutral-400">
                      {ex.muscleGroup.toUpperCase()} • {ex.equipmentRequired}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-white text-black font-semibold rounded-full text-[11px]">
                    + Adicionar
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setAddExerciseModal(null)}
                className="px-4 py-2 border border-neutral-800 text-neutral-300 rounded-full text-xs hover:bg-neutral-900"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
