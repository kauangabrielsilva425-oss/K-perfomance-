import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  Plus,
  Sliders,
  TrendingUp,
  User,
  Utensils,
  X,
  Droplets,
  Zap,
} from 'lucide-react';
import { FitnessGoal, ExperienceLevel, EquipmentAccess, DietPreference } from '../types';

export const PerformanceDashboard: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    activeRoutine,
    startWorkout,
    workoutHistory,
    mealPlan,
    habits,
    toggleHabit,
    setCurrentTab,
  } = useApp();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });

  // Today's day of week
  const daysMap: Record<number, 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab'> = {
    0: 'dom',
    1: 'seg',
    2: 'ter',
    3: 'qua',
    4: 'qui',
    5: 'sex',
    6: 'sab',
  };
  const todayKey = daysMap[new Date().getDay()] || 'seg';

  // Planned workout for today
  const todaySession = activeRoutine.sessions.find(
    (s) => s.targetDayOfWeek === todayKey
  ) || activeRoutine.sessions[0];

  // Calculate today's nutrition consumed from mealPlan
  const todayPlan = mealPlan.find((d) => d.dayOfWeek === todayKey) || mealPlan[0];
  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFats = 0;

  todayPlan?.meals.forEach((m) => {
    m.items.forEach((item) => {
      consumedCalories += item.calories;
      consumedProtein += item.protein;
      consumedCarbs += item.carbs;
      consumedFats += item.fats;
    });
  });

  // Calculate weekly stats from workoutHistory
  const totalWeeklyVolume = workoutHistory.slice(0, 4).reduce((acc, h) => acc + h.totalVolumeKg, 0);
  const sessionsThisWeek = workoutHistory.slice(0, 4).length;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(editForm);
    setIsEditingProfile(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Top Welcome & Profile Banner */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-white/5 via-transparent to-transparent pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                Área Pessoal // Painel de Controle
              </span>
              <span className="text-[10px] font-mono text-neutral-500 uppercase">
                {userProfile.experience.toUpperCase()} • {userProfile.goal.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white">
              Olá, {userProfile.name}
            </h1>
            <p className="text-neutral-400 text-sm mt-1 max-w-xl">
              Foco contínuo em progressão de carga, precisão nutricional e recuperação muscular.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setEditForm({ ...userProfile });
                setIsEditingProfile(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-full border border-neutral-700 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Perfil</span>
            </button>
            <button
              onClick={() => setCurrentTab('rotina')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-full transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Ajustar Rotina</span>
            </button>
          </div>
        </div>

        {/* Profile Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-8 pt-6 border-t border-white/5 text-xs">
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Peso Atual</span>
            <span className="text-white font-mono text-base font-semibold">{userProfile.weightKg} kg</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Frequência</span>
            <span className="text-white font-mono text-base font-semibold">{userProfile.daysPerWeek}x / semana</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Tempo / Sessão</span>
            <span className="text-white font-mono text-base font-semibold">{userProfile.timePerSessionMin} min</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Meta Calórica</span>
            <span className="text-white font-mono text-base font-semibold">{userProfile.targetDailyCalories} kcal</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Meta Proteica</span>
            <span className="text-white font-mono text-base font-semibold">{userProfile.targetProteinGrams} g</span>
          </div>
          <div>
            <span className="text-neutral-500 block text-[10px] uppercase font-mono">Meta Hídrica</span>
            <span className="text-white font-mono text-base font-semibold">{(userProfile.targetWaterMl / 1000).toFixed(1)} L</span>
          </div>
        </div>
      </div>

      {/* Grid: 2 Columns (Main workout & Today's Nutrition) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Today's Training & Up Next (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Highlight Card: Treino do Dia */}
          <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                    Sessão Recomendada para Hoje ({todayKey.toUpperCase()})
                  </span>
                  <h3 className="text-xl font-bold font-display text-white">
                    {todaySession ? todaySession.name : 'Descanso / Recuperação Ativa'}
                  </h3>
                </div>
              </div>

              {todaySession && (
                <button
                  onClick={() => startWorkout(todaySession)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.15)]"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>Iniciar Sessão</span>
                </button>
              )}
            </div>

            {todaySession && (
              <>
                <div className="flex flex-wrap gap-2 my-4">
                  {todaySession.focusMuscles.map((muscle) => (
                    <span
                      key={muscle}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300"
                    >
                      {muscle}
                    </span>
                  ))}
                  <span className="px-2.5 py-1 text-[11px] font-mono rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ~{todaySession.estimatedDurationMin} min
                  </span>
                </div>

                {/* Exercises preview list */}
                <div className="divide-y divide-white/5 border-t border-b border-white/5 my-4">
                  {todaySession.exercises.slice(0, 4).map((ex, idx) => (
                    <div key={ex.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-neutral-600 font-bold">{idx + 1}</span>
                        <div>
                          <span className="font-semibold text-white block">{ex.name}</span>
                          <span className="text-neutral-400 text-[11px]">{ex.muscleGroup.toUpperCase()} • {ex.equipmentRequired}</span>
                        </div>
                      </div>
                      <div className="text-right font-mono text-neutral-300">
                        <span>{ex.defaultSets} séries</span> × <span>{ex.defaultReps}</span>
                      </div>
                    </div>
                  ))}
                  {todaySession.exercises.length > 4 && (
                    <div className="py-2 text-[11px] text-neutral-500 font-mono text-center">
                      + mais {todaySession.exercises.length - 4} exercícios nesta sessão
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex items-center justify-between text-xs text-neutral-400 pt-2">
              <span>Rotina Ativa: <strong className="text-white">{activeRoutine.name}</strong></span>
              <button
                onClick={() => setCurrentTab('rotina')}
                className="text-white hover:underline flex items-center gap-1 cursor-pointer font-medium"
              >
                <span>Ver todos os treinos</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Próximas Sessões da Semana */}
          <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
            <h3 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <span>Programação Semanal ({activeRoutine.sessions.length} Sessões)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeRoutine.sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-black text-neutral-400 border border-neutral-800">
                        {sess.targetDayOfWeek ? sess.targetDayOfWeek.toUpperCase() : 'FLEXÍVEL'}
                      </span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {sess.exercises.length} exercícios
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1 leading-snug">{sess.name}</h4>
                    <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                      {sess.focusMuscles.join(' • ')}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-500">~{sess.estimatedDurationMin} min</span>
                    <button
                      onClick={() => startWorkout(sess)}
                      className="text-xs text-white hover:text-neutral-300 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>Iniciar</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Workout History & Records */}
          <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-neutral-400" />
                <span>Histórico de Desempenho Recente</span>
              </h3>
              <button
                onClick={() => setCurrentTab('evolucao')}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Ver gráficos completos</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {workoutHistory.length === 0 ? (
              <p className="text-sm text-neutral-500 py-4 text-center">Nenhum treino registrado ainda.</p>
            ) : (
              <div className="space-y-3">
                {workoutHistory.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-white block">{item.sessionName}</span>
                      <span className="text-[11px] text-neutral-400">
                        {item.date} • {item.durationMinutes} min • {item.exercisesCompletedCount} exercícios
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-white font-bold block">{item.totalVolumeKg.toLocaleString()} kg</span>
                      <span className="text-[10px] font-mono text-emerald-400 uppercase">Volume Total</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Nutrition, Daily Habits & Weekly Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Daily Nutrition Tracker Card */}
          <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-white">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-display text-white">Plano Alimentar de Hoje</h3>
                  <span className="text-[10px] font-mono uppercase text-neutral-400">
                    {consumedCalories} / {userProfile.targetDailyCalories} kcal estimadas
                  </span>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab('alimentacao')}
                className="text-xs text-white hover:underline cursor-pointer"
              >
                Gerenciar
              </button>
            </div>

            {/* Calories Progress Bar */}
            <div className="w-full bg-neutral-900 rounded-full h-3 overflow-hidden border border-neutral-800 mb-6">
              <div
                className="bg-white h-full transition-all duration-500 rounded-full"
                style={{
                  width: `${Math.min(100, (consumedCalories / userProfile.targetDailyCalories) * 100)}%`,
                }}
              />
            </div>

            {/* Macros Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Proteína</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {Math.round(consumedProtein)}g
                </span>
                <span className="text-[10px] text-neutral-500 block">Meta: {userProfile.targetProteinGrams}g</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Carboidratos</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {Math.round(consumedCarbs)}g
                </span>
                <span className="text-[10px] text-neutral-500 block">Meta: {userProfile.targetCarbsGrams}g</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Gorduras</span>
                <span className="text-sm font-bold font-mono text-white mt-0.5 block">
                  {Math.round(consumedFats)}g
                </span>
                <span className="text-[10px] text-neutral-500 block">Meta: {userProfile.targetFatsGrams}g</span>
              </div>
            </div>

            {/* Dietary preferences tag */}
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
              <span>Preferência: <strong className="text-white capitalize">{userProfile.dietPreference}</strong></span>
              {userProfile.allergies.length > 0 && (
                <span className="text-amber-400/90 text-[11px]">
                  Restrição: {userProfile.allergies.join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Daily Habits Checklist */}
          <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neutral-400" />
                <span>Hábitos & Disciplina Diária</span>
              </h3>
              <span className="text-[11px] font-mono text-neutral-500">
                {habits.filter((h) => h.completed).length} de {habits.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {habits.map((habit) => (
                <button
                  key={habit.id}
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                    habit.completed
                      ? 'bg-neutral-900/80 border-neutral-700/60 text-neutral-400'
                      : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 text-white'
                  }`}
                >
                  <div className="pr-3">
                    <span className={`text-xs font-semibold block ${habit.completed ? 'line-through text-neutral-500' : ''}`}>
                      {habit.title}
                    </span>
                    <span className="text-[11px] text-neutral-400 block mt-0.5 leading-snug">
                      {habit.description}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 block mt-1">
                      Meta: {habit.target}
                    </span>
                  </div>

                  <div className="mt-0.5">
                    {habit.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-neutral-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Summary & Resilience */}
          <div className="rounded-3xl p-6 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-white/10 shadow-xl">
            <h3 className="text-base font-bold font-display text-white mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-neutral-300" />
              <span>Resumo Semanal de Consistência</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Sessões Realizadas</span>
                <span className="font-mono font-bold text-white">{sessionsThisWeek} de {userProfile.daysPerWeek} planejadas</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Volume Total Levantado</span>
                <span className="font-mono font-bold text-white">{totalWeeklyVolume.toLocaleString()} kg</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-neutral-400">Percepção de Recuperação</span>
                <span className="font-mono text-emerald-400 font-semibold">Ótima (4.5 / 5)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-400">Horário Habitual</span>
                <span className="font-mono text-neutral-300">{userProfile.usualWorkoutTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
              <h2 className="text-xl font-bold font-display text-white">Editar Perfil Pessoal</h2>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-400 block mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Objetivo Primário</label>
                  <select
                    value={editForm.goal}
                    onChange={(e) => setEditForm({ ...editForm, goal: e.target.value as FitnessGoal })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="hipertrofia">Hipertrofia Muscular</option>
                    <option value="forca">Ganho de Força Máxima</option>
                    <option value="recomposicao">Recomposição Corporal</option>
                    <option value="resistencia">Resistência Muscular</option>
                    <option value="saude_geral">Saúde e Longevidade</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Nível de Experiência</label>
                  <select
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value as ExperienceLevel })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="iniciante">Iniciante (&lt; 1 ano de treino)</option>
                    <option value="intermediario">Intermediário (1 a 3 anos)</option>
                    <option value="avancado">Avançado (3+ anos consistente)</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Dias por Semana</label>
                  <select
                    value={editForm.daysPerWeek}
                    onChange={(e) => setEditForm({ ...editForm, daysPerWeek: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="2">2 Dias</option>
                    <option value="3">3 Dias</option>
                    <option value="4">4 Dias</option>
                    <option value="5">5 Dias</option>
                    <option value="6">6 Dias</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Tempo por Sessão (minutos)</label>
                  <input
                    type="number"
                    value={editForm.timePerSessionMin}
                    onChange={(e) => setEditForm({ ...editForm, timePerSessionMin: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Equipamentos Disponíveis</label>
                  <select
                    value={editForm.equipment}
                    onChange={(e) => setEditForm({ ...editForm, equipment: e.target.value as EquipmentAccess })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="academia_completa">Academia Comercial Completa</option>
                    <option value="halteres_banco">Halteres e Banco em Casa</option>
                    <option value="peso_corporal">Calistenia & Peso Corporal</option>
                    <option value="home_gym">Home Gym Básica</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Preferência Alimentar</label>
                  <select
                    value={editForm.dietPreference}
                    onChange={(e) => setEditForm({ ...editForm, dietPreference: e.target.value as DietPreference })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  >
                    <option value="onivora">Onívora (todas as fontes)</option>
                    <option value="vegetariana">Vegetariana</option>
                    <option value="vegana">Vegana (100% vegetal)</option>
                    <option value="sem_lactose">Sem Lactose</option>
                    <option value="sem_gluten">Sem Glúten</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Alergias ou Restrições (separar por vírgula)</label>
                  <input
                    type="text"
                    value={editForm.allergies.join(', ')}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        allergies: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Ex: Amendoim, Frutos do mar, Lactose"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Peso Corporal (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weightKg}
                    onChange={(e) => setEditForm({ ...editForm, weightKg: Number(e.target.value) })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Horário Habitual de Treino</label>
                  <input
                    type="time"
                    value={editForm.usualWorkoutTime}
                    onChange={(e) => setEditForm({ ...editForm, usualWorkoutTime: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 border border-neutral-800 rounded-full text-neutral-300 hover:bg-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-white text-black font-semibold rounded-full hover:bg-neutral-200"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
