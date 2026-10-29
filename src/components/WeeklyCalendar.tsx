import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Info,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { CalendarWorkout, WorkoutSession } from '../types';

export const WeeklyCalendar: React.FC = () => {
  const {
    calendarWorkouts,
    addCalendarWorkout,
    updateCalendarWorkout,
    toggleCalendarWorkoutStatus,
    deleteCalendarWorkout,
    startWorkout,
    habits,
    toggleHabit,
    activeRoutine,
    setCurrentTab,
  } = useApp();

  // Current Calendar Date Navigation (Defaulting to current date: Oct 2026 or real system date)
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal'>('mensal');
  const [selectedDateISO, setSelectedDateISO] = useState<string>(() => today.toISOString().split('T')[0]);

  // Day Inspector Modal
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [isAddWorkoutFormOpen, setIsAddWorkoutFormOpen] = useState(false);

  // New Workout Form state
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<CalendarWorkout['type']>('hipertrofia');
  const [newDuration, setNewDuration] = useState<number>(60);
  const [newNotes, setNewNotes] = useState('');
  const [newExercisesText, setNewExercisesText] = useState('Supino Reto (4x8), Puxada Alta (4x10)');

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToday = () => {
    const now = new Date();
    setCurrentMonthDate(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDateISO(now.toISOString().split('T')[0]);
  };

  // Month information
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const currentMonthLabel = `${monthNames[month]} ${year}`;

  // Grid calculation: Seg(0) to Dom(6)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const daysGrid = useMemo(() => {
    const days: { dateISO: string; dayNum: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
    const todayISO = today.toISOString().split('T')[0];

    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const iso = prevDate.toISOString().split('T')[0];
      days.push({ dateISO: iso, dayNum: d, isCurrentMonth: false, isToday: iso === todayISO });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateISO: iso, dayNum: d, isCurrentMonth: true, isToday: iso === todayISO });
    }

    // Next month padding to fill grid
    const remaining = 35 - days.length > 0 ? 35 - days.length : (42 - days.length > 0 ? 42 - days.length : 0);
    for (let d = 1; d <= remaining; d++) {
      const nextDate = new Date(year, month + 1, d);
      const iso = nextDate.toISOString().split('T')[0];
      days.push({ dateISO: iso, dayNum: d, isCurrentMonth: false, isToday: iso === todayISO });
    }

    return days;
  }, [year, month, daysInMonth, firstDayIndex, today]);

  // Current selected day workouts
  const selectedDayWorkouts = useMemo(() => {
    return calendarWorkouts.filter((w) => w.dateISO === selectedDateISO);
  }, [calendarWorkouts, selectedDateISO]);

  // Weekly view days calculation: 7 days of the current week surrounding selectedDateISO
  const weekDays = useMemo(() => {
    const base = new Date(selectedDateISO + 'T12:00:00');
    const dayOfWeek = (base.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(base);
    monday.setDate(base.getDate() - dayOfWeek);

    const result = [];
    const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      result.push({
        name: dayNames[i],
        short: ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'][i],
        dayNum: d.getDate(),
        dateISO: iso,
        isToday: iso === today.toISOString().split('T')[0],
      });
    }
    return result;
  }, [selectedDateISO, today]);

  const handleOpenDayModal = (iso: string) => {
    setSelectedDateISO(iso);
    setIsDayModalOpen(true);
  };

  const handleCreateWorkout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Parse simple exercise list
    const exercisesList = newExercisesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((exName) => ({
        name: exName,
        sets: 4,
        reps: '8-10',
        weightKg: 20,
        completed: false,
      }));

    const newWorkout: CalendarWorkout = {
      id: `w_${Date.now()}`,
      dateISO: selectedDateISO,
      title: newTitle.trim(),
      type: newType,
      status: 'programado',
      durationMinutes: newDuration,
      exercises: exercisesList.length > 0 ? exercisesList : [{ name: 'Sessão Livre', sets: 3, reps: '10', completed: false }],
      notes: newNotes.trim() || undefined,
    };

    addCalendarWorkout(newWorkout);
    setNewTitle('');
    setNewNotes('');
    setIsAddWorkoutFormOpen(false);
  };

  const handleStartWorkoutFromCalendar = (workout: CalendarWorkout) => {
    // Convert calendar workout to a live session
    const syntheticSession: WorkoutSession = {
      id: `live_${workout.id}`,
      name: workout.title,
      focusMuscles: ['Corpo Inteiro'],
      estimatedDurationMin: workout.durationMinutes || 60,
      exercises: workout.exercises.map((ex, idx) => ({
        id: `ex_cal_${idx}_${Date.now()}`,
        name: ex.name,
        muscleGroup: 'peitoral',
        equipmentRequired: 'Halteres / Máquina',
        defaultSets: ex.sets || 3,
        defaultReps: ex.reps || '10',
        suggestedRestSeconds: 90,
        executionInstructions: ['Executar mantendo contração e técnica constante.'],
        formCues: ['Movimento controlado.'],
        alternatives: [],
        targetWeightKg: ex.weightKg || 20,
      })),
    };

    setIsDayModalOpen(false);
    startWorkout(syntheticSession);
    setCurrentTab('treino_vivo');
  };

  const formatDisplayDate = (iso: string) => {
    const parts = iso.split('-');
    if (parts.length < 3) return iso;
    const [y, m, d] = parts;
    const mName = monthNames[parseInt(m, 10) - 1];
    return `${d} de ${mName} de ${y}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
              Planejamento & Aderência // Calendário Interativo
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Mês & Semana</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Calendário de Treinos
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
            Monitore suas sessões programadas, treinos concluídos e dias de descanso. Alterne entre a grade mensal e o cronograma semanal com status visual instantâneo.
          </p>
        </div>

        {/* View Switcher + Today Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 text-xs">
            <button
              onClick={() => setViewMode('mensal')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                viewMode === 'mensal' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Grade Mensal
            </button>
            <button
              onClick={() => setViewMode('semanal')}
              className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                viewMode === 'semanal' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Linha da Semana
            </button>
          </div>

          <button
            onClick={handleGoToday}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-mono rounded-2xl transition-colors cursor-pointer"
            title="Voltar para a data de hoje"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
            <span>Hoje</span>
          </button>
        </div>
      </div>

      {/* Month Navigator Bar */}
      <div className="flex items-center justify-between p-4 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl">
        <button
          onClick={handlePrevMonth}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Mês Anterior</span>
        </button>

        <div className="flex items-center gap-2.5">
          <CalendarIcon className="w-4 h-4 text-neutral-400" />
          <h2 className="text-base md:text-lg font-bold font-display text-white tracking-wide">
            {currentMonthLabel}
          </h2>
        </div>

        <button
          onClick={handleNextMonth}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Próximo Mês</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Status Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-400 px-2">
        <span className="text-[10px] uppercase text-neutral-500">Legenda de Cores:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="text-emerald-300">Concluído</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
          <span className="text-white">Programado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
          <span className="text-neutral-400">Descanso</span>
        </div>
      </div>

      {/* VIEW MODE 1: MONTHLY GRID */}
      {viewMode === 'mensal' ? (
        <div className="rounded-3xl bg-neutral-950 border border-neutral-800 p-4 md:p-6 shadow-2xl overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-mono text-neutral-400 font-semibold border-b border-neutral-900 pb-3">
            <span>SEG</span>
            <span>TER</span>
            <span>QUA</span>
            <span>QUI</span>
            <span>SEX</span>
            <span className="text-neutral-500">SÁB</span>
            <span className="text-neutral-500">DOM</span>
          </div>

          {/* Days Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {daysGrid.map((day, idx) => {
              const dayWorkouts = calendarWorkouts.filter((w) => w.dateISO === day.dateISO);
              const hasCompleted = dayWorkouts.some((w) => w.status === 'concluido');
              const hasScheduled = dayWorkouts.some((w) => w.status === 'programado');
              const isRest = dayWorkouts.some((w) => w.status === 'descanso');
              const isSelected = selectedDateISO === day.dateISO;

              return (
                <button
                  key={`${day.dateISO}-${idx}`}
                  type="button"
                  onClick={() => handleOpenDayModal(day.dateISO)}
                  className={`min-h-[85px] md:min-h-[105px] p-2 md:p-2.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                    day.isToday
                      ? 'border-white/40 bg-neutral-900/80 shadow-md ring-1 ring-white/20'
                      : isSelected
                      ? 'border-neutral-500 bg-neutral-900/50'
                      : day.isCurrentMonth
                      ? 'border-neutral-900 bg-neutral-950/60 hover:bg-neutral-900/60 hover:border-neutral-800'
                      : 'border-transparent bg-neutral-950/20 opacity-30 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs md:text-sm font-mono font-bold ${
                        day.isToday
                          ? 'w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[11px]'
                          : day.isCurrentMonth
                          ? 'text-neutral-200'
                          : 'text-neutral-600'
                      }`}
                    >
                      {day.dayNum}
                    </span>

                    {/* Status Pill Dot */}
                    {dayWorkouts.length > 0 && (
                      <div className="flex items-center gap-1">
                        {hasCompleted && (
                          <span
                            className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"
                            title="Treino Concluído"
                          />
                        )}
                        {hasScheduled && (
                          <span
                            className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.7)]"
                            title="Treino Programado"
                          />
                        )}
                        {isRest && (
                          <span className="w-2 h-2 rounded-full bg-neutral-600" title="Dia de Descanso" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Workout Title Chips in Cell */}
                  <div className="space-y-1 w-full overflow-hidden">
                    {dayWorkouts.slice(0, 2).map((w) => (
                      <div
                        key={w.id}
                        className={`px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-mono truncate ${
                          w.status === 'concluido'
                            ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                            : w.status === 'descanso'
                            ? 'bg-neutral-900 border border-neutral-800 text-neutral-400'
                            : 'bg-neutral-900 border border-neutral-700 text-white'
                        }`}
                      >
                        {w.title.replace('Sessão ', '')}
                      </div>
                    ))}
                    {dayWorkouts.length > 2 && (
                      <span className="text-[9px] font-mono text-neutral-500 block truncate">
                        +{dayWorkouts.length - 2} mais
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: WEEKLY TIMELINE (7 Columns) */
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((day) => {
            const dayWorkouts = calendarWorkouts.filter((w) => w.dateISO === day.dateISO);
            const isSelected = selectedDateISO === day.dateISO;

            return (
              <div
                key={day.dateISO}
                className={`rounded-3xl p-4 bg-neutral-950 border flex flex-col justify-between min-h-[380px] shadow-xl transition-all ${
                  day.isToday
                    ? 'border-white/30 bg-neutral-900/40'
                    : isSelected
                    ? 'border-neutral-700 bg-neutral-950'
                    : 'border-neutral-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-900 mb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-neutral-500 block">
                        {day.short}
                      </span>
                      <span className="text-sm font-bold font-display text-white">{day.name}</span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        day.isToday
                          ? 'w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-[11px]'
                          : 'text-neutral-400'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>

                  {/* Scheduled items */}
                  <div className="space-y-2">
                    {dayWorkouts.length === 0 ? (
                      <div className="p-3 rounded-2xl bg-neutral-900/30 border border-neutral-900 text-center">
                        <span className="text-[11px] font-mono text-neutral-600">Sem treinos</span>
                      </div>
                    ) : (
                      dayWorkouts.map((w) => (
                        <div
                          key={w.id}
                          className={`p-3 rounded-2xl border text-xs space-y-1.5 ${
                            w.status === 'concluido'
                              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                              : w.status === 'descanso'
                              ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                              : 'bg-neutral-900/80 border-neutral-700 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-black/40">
                              {w.status}
                            </span>
                            {w.durationMinutes && (
                              <span className="text-[10px] font-mono opacity-70">
                                {w.durationMinutes} min
                              </span>
                            )}
                          </div>
                          <p className="font-bold font-display leading-tight">{w.title}</p>
                          <div className="flex items-center justify-between pt-1">
                            <button
                              onClick={() => toggleCalendarWorkoutStatus(w.id)}
                              className="text-[10px] font-mono underline opacity-80 hover:opacity-100 cursor-pointer"
                            >
                              {w.status === 'concluido' ? 'Reabrir' : 'Concluir'}
                            </button>
                            <button
                              onClick={() => handleStartWorkoutFromCalendar(w)}
                              className="p-1 rounded-md bg-white text-black hover:bg-neutral-200"
                              title="Iniciar este treino ao vivo"
                            >
                              <Play className="w-2.5 h-2.5 fill-black" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDayModal(day.dateISO)}
                  className="w-full mt-3 py-2 px-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Gerenciar Dia</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Habits & Daily Systems Integration Bar */}
      <div className="rounded-3xl bg-neutral-950 border border-neutral-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Rotina Diária de Alta Performance
            </span>
            <h3 className="text-lg font-bold font-display text-white">Hábitos & Recuperação do Dia</h3>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            {habits.filter((h) => h.completed).length}/{habits.length} Concluídos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => toggleHabit(habit.id)}
              className={`p-3.5 rounded-2xl border text-left flex items-start justify-between transition-all cursor-pointer ${
                habit.completed
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-neutral-900/60 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div>
                <span className="font-bold text-xs block mb-0.5">{habit.title}</span>
                <span className="text-[10px] font-mono text-neutral-500 block">{habit.target}</span>
              </div>
              <CheckCircle2
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  habit.completed ? 'text-emerald-400 fill-emerald-500/20' : 'text-neutral-600'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* DAY INSPECTOR MODAL */}
      {isDayModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative my-8">
            <button
              onClick={() => {
                setIsDayModalOpen(false);
                setIsAddWorkoutFormOpen(false);
              }}
              className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300">
                Inspetor de Sessão
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-display text-white">
              {formatDisplayDate(selectedDateISO)}
            </h2>
            <p className="text-neutral-400 text-xs mt-1">
              Gerencie treinos agendados ou registre uma nova sessão específica para esta data.
            </p>

            {/* List of existing workouts on this day */}
            <div className="mt-5 space-y-3">
              {selectedDayWorkouts.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80">
                  <p className="text-xs font-mono text-neutral-400">Nenhum treino programado para este dia.</p>
                </div>
              ) : (
                selectedDayWorkouts.map((w) => (
                  <div
                    key={w.id}
                    className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                            w.status === 'concluido'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : w.status === 'descanso'
                              ? 'bg-neutral-800 text-neutral-400'
                              : 'bg-white/10 text-white border border-white/20'
                          }`}
                        >
                          {w.status.toUpperCase()}
                        </span>
                        <span className="text-xs font-mono text-neutral-500">
                          {w.durationMinutes || 60} min
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleCalendarWorkoutStatus(w.id)}
                          className={`text-xs font-mono px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                            w.status === 'concluido'
                              ? 'bg-neutral-800 text-neutral-300 hover:text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {w.status === 'concluido' ? 'Reabrir' : 'Concluir'}
                        </button>
                        <button
                          onClick={() => deleteCalendarWorkout(w.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 cursor-pointer"
                          title="Excluir treino"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold font-display text-white">{w.title}</h4>

                    {w.exercises.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                          Exercícios Programados:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs font-mono text-neutral-300">
                          {w.exercises.map((ex, i) => (
                            <div key={i} className="p-1.5 rounded-lg bg-neutral-950 border border-neutral-800/80">
                              • {ex.name} ({ex.sets}x{ex.reps})
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {w.notes && (
                      <p className="text-[11px] text-neutral-400 italic">"{w.notes}"</p>
                    )}

                    <div className="pt-2 border-t border-neutral-800 flex justify-end">
                      <button
                        onClick={() => handleStartWorkoutFromCalendar(w)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
                      >
                        <Play className="w-3.5 h-3.5 fill-black" />
                        <span>Iniciar Este Treino Agora</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Toggle Add Workout Form */}
            {!isAddWorkoutFormOpen ? (
              <button
                onClick={() => setIsAddWorkoutFormOpen(true)}
                className="w-full mt-4 py-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-2xl text-xs font-bold text-neutral-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Treino Nesta Data</span>
              </button>
            ) : (
              <form onSubmit={handleCreateWorkout} className="mt-5 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-xs font-bold font-display text-white">Novo Treino para {selectedDateISO}</span>
                  <button
                    type="button"
                    onClick={() => setIsAddWorkoutFormOpen(false)}
                    className="text-xs text-neutral-500 hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Título da Sessão</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Sessão A — Peitoral & Tríceps Pesado"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Tipo de Treino</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="hipertrofia">Hipertrofia</option>
                      <option value="forca">Força Pura</option>
                      <option value="cardio">Cardio / Condicionamento</option>
                      <option value="mobilidade">Mobilidade</option>
                      <option value="descanso">Descanso Ativo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-1">Duração Estimada (min)</label>
                    <input
                      type="number"
                      value={newDuration}
                      onChange={(e) => setNewDuration(parseInt(e.target.value, 10) || 60)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">
                    Exercícios (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={newExercisesText}
                    onChange={(e) => setNewExercisesText(e.target.value)}
                    placeholder="Ex: Supino Reto, Crucifixo, Tríceps Testa"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-neutral-400 block mb-1">Observações / Metas</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ex: Carga alvo 80kg no supino, 90s de descanso"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddWorkoutFormOpen(false)}
                    className="px-4 py-2 rounded-full border border-neutral-800 text-xs text-neutral-400"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
                  >
                    Salvar no Calendário
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
