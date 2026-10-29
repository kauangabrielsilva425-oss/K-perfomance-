import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  Award,
  Camera,
  Calendar,
  ChevronRight,
  Dumbbell,
  Flame,
  Image as ImageIcon,
  LineChart,
  Plus,
  Ruler,
  Search,
  Sparkles,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react';
import { INITIAL_STRENGTH_METRICS } from '../data/initialData';
import { StrengthMetric, BodyMeasurementEntry, ProgressPhoto } from '../types';

export const EvolutionTracker: React.FC = () => {
  const {
    workoutHistory,
    deleteWorkoutHistoryItem,
    userProfile,
    calendarWorkouts,
    bodyMeasurements,
    addBodyMeasurement,
    deleteBodyMeasurement,
    progressPhotos,
    addProgressPhoto,
    deleteProgressPhoto,
  } = useApp();

  const [activeSection, setActiveSection] = useState<'geral' | 'medidas' | 'fotos'>('geral');
  const [selectedExercise, setSelectedExercise] = useState<string>('Supino Reto com Barra');
  const [historySearch, setHistorySearch] = useState('');

  // Strength PR Form
  const [isAddRecordModal, setIsAddRecordModal] = useState(false);
  const [newRecDate, setNewRecDate] = useState(`Semana 5`);
  const [newRecEx, setNewRecEx] = useState('Supino Reto com Barra');
  const [newRecWeight, setNewRecWeight] = useState(85);
  const [newRecReps, setNewRecReps] = useState(8);

  const [strengthMetrics, setStrengthMetrics] = useState<StrengthMetric[]>(
    INITIAL_STRENGTH_METRICS
  );

  // Body Measurement Modal
  const [isAddMeasurementModal, setIsAddMeasurementModal] = useState(false);
  const [mDate, setMDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mWeight, setMWeight] = useState(userProfile.weightKg);
  const [mBf, setMBf] = useState(13.5);
  const [mChest, setMChest] = useState(106);
  const [mArms, setMArms] = useState(38.5);
  const [mWaist, setMWaist] = useState(81);
  const [mHips, setMHips] = useState(98.5);
  const [mThighs, setMThighs] = useState(61);
  const [mCalves, setMCalves] = useState(38.2);
  const [mNotes, setMNotes] = useState('');

  // Progress Photo Upload
  const [isAddPhotoModal, setIsAddPhotoModal] = useState(false);
  const [photoDate, setPhotoDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [photoLabel, setPhotoLabel] = useState('Frontal — Relaxado');
  const [photoNotes, setPhotoNotes] = useState('');
  const [previewPhotoData, setPreviewPhotoData] = useState<string | null>(null);

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    // Brzycki 1RM formula: Weight * (36 / (37 - Reps))
    const e1rm = Math.round(newRecWeight * (36 / (37 - Math.min(newRecReps, 36))));
    const newMetric: StrengthMetric = {
      date: newRecDate,
      exercise: newRecEx,
      weightKg: newRecWeight,
      reps: newRecReps,
      estimated1RM: e1rm,
    };
    setStrengthMetrics((prev) => [...prev, newMetric]);
    setIsAddRecordModal(false);
  };

  const handleSaveMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    addBodyMeasurement({
      dateISO: mDate,
      weightKg: mWeight,
      bodyFatPercent: mBf || undefined,
      chestCm: mChest || undefined,
      armsCm: mArms || undefined,
      waistCm: mWaist || undefined,
      hipsCm: mHips || undefined,
      thighsCm: mThighs || undefined,
      calvesCm: mCalves || undefined,
      notes: mNotes || undefined,
    });
    setIsAddMeasurementModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewPhotoData(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewPhotoData) return;
    addProgressPhoto({
      dateISO: photoDate,
      photoUrl: previewPhotoData,
      label: photoLabel,
      notes: photoNotes,
    });
    setPreviewPhotoData(null);
    setIsAddPhotoModal(false);
  };

  const exerciseMetrics = strengthMetrics.filter((m) => m.exercise === selectedExercise);

  // SVG Chart Calculation
  const maxWeight = Math.max(...exerciseMetrics.map((m) => m.weightKg), 120);
  const minWeight = Math.min(...exerciseMetrics.map((m) => m.weightKg), 50) * 0.9;

  const chartPoints = exerciseMetrics.map((metric, index) => {
    const x = (index / Math.max(1, exerciseMetrics.length - 1)) * 400 + 40;
    const y = 180 - ((metric.weightKg - minWeight) / (maxWeight - minWeight)) * 140;
    return { x, y, ...metric };
  });

  const svgPolyline = chartPoints.map((p) => `${p.x},${p.y}`).join(' ');

  const filteredHistory = workoutHistory.filter((h) =>
    h.sessionName.toLowerCase().includes(historySearch.toLowerCase()) ||
    h.date.includes(historySearch)
  );

  // Calculation of completed workouts from real data
  const totalCompletedWorkouts = calendarWorkouts.filter((w) => w.status === 'concluido').length + workoutHistory.length;

  // Comparison between first and latest measurement
  const sortedMeasurements = [...bodyMeasurements].sort((a, b) => a.dateISO.localeCompare(b.dateISO));
  const firstMeas = sortedMeasurements[0];
  const latestMeas = sortedMeasurements[sortedMeasurements.length - 1];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-900">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
            Acompanhamento de Desempenho // Métricas Longitudinais
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white mt-2">
            Minha Evolução & Métricas
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1 leading-relaxed">
            Consulte a progressão de cargas nos exercícios fundamentais, histórico de medidas corporais e galeria privada de fotos de evolução física.
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 text-xs font-semibold">
            <button
              onClick={() => setActiveSection('geral')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === 'geral' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Cargas & Força
            </button>
            <button
              onClick={() => setActiveSection('medidas')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === 'medidas' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Medidas Corporais ({bodyMeasurements.length})
            </button>
            <button
              onClick={() => setActiveSection('fotos')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeSection === 'fotos' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Fotos de Progresso ({progressPhotos.length})
            </button>
          </div>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
            Sessões Concluídas Totais
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {totalCompletedWorkouts}
            </span>
            <span className="text-xs font-mono text-neutral-400">treinos registrados</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-2 block">
            ✓ Consistência semanal ativa no calendário
          </span>
        </div>

        <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
            Peso Corporal Atual
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {latestMeas ? latestMeas.weightKg : userProfile.weightKg}
            </span>
            <span className="text-xs font-mono text-neutral-400">kg ({latestMeas?.bodyFatPercent || 13.5}% BF)</span>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono mt-2 block">
            {firstMeas && latestMeas ? (
              <span className="text-neutral-300">
                Delta desde início: {(latestMeas.weightKg - firstMeas.weightKg).toFixed(1)} kg
              </span>
            ) : (
              'Meta de hipertrofia com recomposição'
            )}
          </span>
        </div>

        <div className="rounded-3xl p-6 bg-neutral-950 border border-white/10 shadow-xl">
          <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
            Recorde Estimado 1RM
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {exerciseMetrics[exerciseMetrics.length - 1]?.estimated1RM || 99}
            </span>
            <span className="text-xs font-mono text-neutral-400">kg no {selectedExercise.split(' ')[0]}</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono mt-2 block">
            Sobrecarga progressiva comprovada
          </span>
        </div>
      </div>

      {/* SECTION 1: STRENGTH PROGRESSION & WORKOUT HISTORY */}
      {activeSection === 'geral' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* Interactive Strength Progression Graph Card */}
          <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neutral-300" />
                  <span>Curva de Progressão de Carga (Sobrecarga Progressiva)</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Acompanhamento de carga máxima para séries de trabalho ao longo das semanas.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Exercise Filter */}
                <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-800 rounded-full p-1 text-xs">
                  {[
                    'Supino Reto com Barra',
                    'Agachamento Livre com Barra',
                    'Levantamento Terra Romeno (RDL)',
                  ].map((exName) => {
                    const isSelected = selectedExercise === exName;
                    return (
                      <button
                        key={exName}
                        onClick={() => setSelectedExercise(exName)}
                        className={`px-3 py-1 rounded-full font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-neutral-800 text-white shadow-sm'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {exName.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsAddRecordModal(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Novo PR</span>
                </button>
              </div>
            </div>

            {/* Clean SVG Line Chart */}
            <div className="p-4 rounded-2xl bg-black/60 border border-neutral-900 overflow-x-auto">
              <div className="min-w-[480px]">
                <svg viewBox="0 0 480 220" className="w-full h-56">
                  {/* Background horizontal grid lines */}
                  <line x1="40" y1="40" x2="440" y2="40" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="40" y1="90" x2="440" y2="90" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="40" y1="140" x2="440" y2="140" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="40" y1="180" x2="440" y2="180" stroke="#3f3f46" />

                  {/* Gradient Area under line */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {chartPoints.length > 1 && (
                    <polygon
                      points={`40,180 ${svgPolyline} ${chartPoints[chartPoints.length - 1].x},180`}
                      fill="url(#chartGrad)"
                    />
                  )}

                  {/* Polyline */}
                  {chartPoints.length > 1 && (
                    <polyline
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={svgPolyline}
                    />
                  )}

                  {/* Data points */}
                  {chartPoints.map((pt, idx) => (
                    <g key={idx}>
                      <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" />
                      <circle cx={pt.x} cy={pt.y} r="8" fill="#ffffff" opacity="0.15" />
                      <text
                        x={pt.x}
                        y={pt.y - 12}
                        fill="#ffffff"
                        fontSize="11"
                        fontFamily="monospace"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {pt.weightKg}kg
                      </text>
                      <text
                        x={pt.x}
                        y="205"
                        fill="#a1a1aa"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {pt.date}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* 1RM Estimation Pill */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400 pt-2">
              <span>
                Última marca:{' '}
                <strong className="text-white">
                  {exerciseMetrics[exerciseMetrics.length - 1]?.weightKg}kg para{' '}
                  {exerciseMetrics[exerciseMetrics.length - 1]?.reps} reps
                </strong>
              </span>
              <span className="text-neutral-300 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-full">
                1RM Estimada (Fórmula Brzycki): ~{exerciseMetrics[exerciseMetrics.length - 1]?.estimated1RM} kg
              </span>
            </div>
          </div>

          {/* Workout History Archive with Search */}
          <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-white/10 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Histórico de Treinos Salvos</h3>
                <span className="text-xs text-neutral-400">
                  Registros detalhados de sessões finalizadas com carga e repetições
                </span>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar por data ou sessão..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            {filteredHistory.length === 0 ? (
              <p className="text-xs text-neutral-500 py-8 text-center font-mono">Nenhum treino encontrado no histórico.</p>
            ) : (
              <div className="space-y-3">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700 transition-all space-y-3 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-white text-sm">{item.sessionName}</h4>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {item.date} • {item.durationMinutes} minutos de sessão
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <span className="font-bold text-white block">{item.totalVolumeKg.toLocaleString()} kg</span>
                          <span className="text-[10px] text-neutral-500 uppercase">Volume Total</span>
                        </div>

                        <button
                          onClick={() => deleteWorkoutHistoryItem(item.id)}
                          className="p-2 text-neutral-500 hover:text-red-400 rounded-xl hover:bg-neutral-800"
                          title="Excluir do histórico"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {item.details && item.details.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2 border-t border-neutral-900">
                        {item.details.map((det, i) => (
                          <div key={i} className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono">
                            <span className="text-neutral-300 font-semibold block truncate">{det.exerciseName}</span>
                            <span className="text-neutral-500">
                              {det.sets.map((s) => `${s.weightKg}kg×${s.reps}`).join(' | ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-neutral-400 italic">"{item.notes}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 2: BODY MEASUREMENTS (MEDIDAS CORPORAIS) */}
      {activeSection === 'medidas' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-900">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Histórico de Medidas Corporais</h2>
              <p className="text-neutral-400 text-xs">
                Acompanhe a circunferência corporal para garantir que os ganhos de peso correspondam a tecido magro.
              </p>
            </div>
            <button
              onClick={() => setIsAddMeasurementModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Registrar Nova Medição</span>
            </button>
          </div>

          {/* Measurements Table Card */}
          <div className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/80 text-neutral-400 text-[10px] uppercase tracking-wider">
                    <th className="py-3 px-4">Data</th>
                    <th className="py-3 px-3">Peso</th>
                    <th className="py-3 px-3">BF %</th>
                    <th className="py-3 px-3">Tórax</th>
                    <th className="py-3 px-3">Braço</th>
                    <th className="py-3 px-3">Cintura</th>
                    <th className="py-3 px-3">Quadril</th>
                    <th className="py-3 px-3">Coxa</th>
                    <th className="py-3 px-3">Panturrilha</th>
                    <th className="py-3 px-3">Anotações</th>
                    <th className="py-3 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900 text-neutral-200">
                  {bodyMeasurements.map((entry) => (
                    <tr key={entry.id} className="hover:bg-neutral-900/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{entry.dateISO}</td>
                      <td className="py-3 px-3 font-semibold text-emerald-400">{entry.weightKg} kg</td>
                      <td className="py-3 px-3 text-neutral-300">{entry.bodyFatPercent ? `${entry.bodyFatPercent}%` : '—'}</td>
                      <td className="py-3 px-3">{entry.chestCm ? `${entry.chestCm} cm` : '—'}</td>
                      <td className="py-3 px-3 font-bold text-white">{entry.armsCm ? `${entry.armsCm} cm` : '—'}</td>
                      <td className="py-3 px-3 text-amber-300">{entry.waistCm ? `${entry.waistCm} cm` : '—'}</td>
                      <td className="py-3 px-3">{entry.hipsCm ? `${entry.hipsCm} cm` : '—'}</td>
                      <td className="py-3 px-3">{entry.thighsCm ? `${entry.thighsCm} cm` : '—'}</td>
                      <td className="py-3 px-3">{entry.calvesCm ? `${entry.calvesCm} cm` : '—'}</td>
                      <td className="py-3 px-3 text-neutral-400 max-w-xs truncate">{entry.notes || '—'}</td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => deleteBodyMeasurement(entry.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg hover:bg-neutral-800 cursor-pointer"
                          title="Remover medição"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PROGRESS PHOTOS GALLERY (User Clarification: "os dois") */}
      {activeSection === 'fotos' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-900">
            <div>
              <h2 className="text-xl font-bold font-display text-white">Galeria Privada de Fotos de Progresso</h2>
              <p className="text-neutral-400 text-xs">
                Seus registros visuais são salvos localmente e com total privacidade no seu navegador.
              </p>
            </div>
            <button
              onClick={() => setIsAddPhotoModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-md"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Adicionar Foto de Evolução</span>
            </button>
          </div>

          {progressPhotos.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-950 border border-neutral-900 space-y-3">
              <Camera className="w-8 h-8 text-neutral-600 mx-auto" />
              <p className="text-sm font-mono text-neutral-400">Nenhuma foto adicionada ainda.</p>
              <p className="text-xs text-neutral-600 max-w-md mx-auto">
                Tire fotos consistentes nas mesmas condições de luz e horário (ex: pela manhã em jejum) para registrar sua transformação visual.
              </p>
              <button
                onClick={() => setIsAddPhotoModal(true)}
                className="mt-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-mono border border-neutral-800 cursor-pointer"
              >
                Fazer primeiro upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {progressPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="rounded-3xl bg-neutral-950 border border-neutral-800 overflow-hidden shadow-xl flex flex-col justify-between group"
                >
                  <div className="aspect-[3/4] w-full bg-neutral-900 relative overflow-hidden">
                    <img
                      src={photo.photoUrl}
                      alt={photo.label || 'Foto de progresso'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-[10px] font-mono text-white border border-white/10">
                      {photo.dateISO}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs font-display text-white">{photo.label || 'Registro Físico'}</span>
                      <button
                        onClick={() => deleteProgressPhoto(photo.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                        title="Remover foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {photo.notes && (
                      <p className="text-[11px] text-neutral-400 line-clamp-2 italic">"{photo.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD STRENGTH PR */}
      {isAddRecordModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleAddMetric}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold font-display text-white">Registrar Carga / Recorde Pessoal</h3>
              <button
                type="button"
                onClick={() => setIsAddRecordModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Exercício Alvo</label>
              <select
                value={newRecEx}
                onChange={(e) => setNewRecEx(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="Supino Reto com Barra">Supino Reto com Barra</option>
                <option value="Agachamento Livre com Barra">Agachamento Livre com Barra</option>
                <option value="Levantamento Terra Romeno (RDL)">Levantamento Terra Romeno (RDL)</option>
                <option value="Desenvolvimento Militar com Halteres">Desenvolvimento Militar com Halteres</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Carga em Kg</label>
                <input
                  type="number"
                  step="0.5"
                  value={newRecWeight}
                  onChange={(e) => setNewRecWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-center font-bold"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Repetições Válidas</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={newRecReps}
                  onChange={(e) => setNewRecReps(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-center font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Rótulo / Período</label>
              <input
                type="text"
                value={newRecDate}
                onChange={(e) => setNewRecDate(e.target.value)}
                placeholder="Ex: Semana 5, Outubro 2026"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddRecordModal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
              >
                Salvar Marca
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD BODY MEASUREMENT */}
      {isAddMeasurementModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveMeasurement}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold font-display text-white">Registrar Medidas Corporais</h3>
              <button
                type="button"
                onClick={() => setIsAddMeasurementModal(false)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Data</label>
                <input
                  type="date"
                  value={mDate}
                  onChange={(e) => setMDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Peso (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mWeight}
                  onChange={(e) => setMWeight(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Gordura Corporal (% BF)</label>
                <input
                  type="number"
                  step="0.1"
                  value={mBf}
                  onChange={(e) => setMBf(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Braço Contraído (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mArms}
                  onChange={(e) => setMArms(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Cintura Linha Umbilical (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mWaist}
                  onChange={(e) => setMWaist(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Tórax / Peitoral (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mChest}
                  onChange={(e) => setMChest(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Coxa Medial (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mThighs}
                  onChange={(e) => setMThighs(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Panturrilha (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  value={mCalves}
                  onChange={(e) => setMCalves(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Observações da Avaliação</label>
              <input
                type="text"
                value={mNotes}
                onChange={(e) => setMNotes(e.target.value)}
                placeholder="Ex: Medido em jejum pela manhã"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddMeasurementModal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
              >
                Salvar Medições
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: UPLOAD PROGRESS PHOTO */}
      {isAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePhoto}
            className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-lg font-bold font-display text-white">Adicionar Foto de Evolução</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddPhotoModal(false);
                  setPreviewPhotoData(null);
                }}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Selecione o Arquivo de Imagem</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-black cursor-pointer"
              />
            </div>

            {previewPhotoData && (
              <div className="aspect-[4/3] w-full rounded-2xl bg-neutral-900 overflow-hidden border border-neutral-800">
                <img src={previewPhotoData} alt="Prévia" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 block mb-1">Data</label>
                <input
                  type="date"
                  value={photoDate}
                  onChange={(e) => setPhotoDate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Ângulo / Posição</label>
                <select
                  value={photoLabel}
                  onChange={(e) => setPhotoLabel(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                >
                  <option value="Frontal — Relaxado">Frontal — Relaxado</option>
                  <option value="Frontal — Duplo Bíceps">Frontal — Duplo Bíceps</option>
                  <option value="Perfil / Lateral">Perfil / Lateral</option>
                  <option value="Costas — Duplo Bíceps">Costas — Duplo Bíceps</option>
                  <option value="Costas — Expansão Dorsal">Costas — Expansão Dorsal</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Anotações do Físico (opcional)</label>
              <input
                type="text"
                value={photoNotes}
                onChange={(e) => setPhotoNotes(e.target.value)}
                placeholder="Ex: Em jejum, 78.5kg, melhor definição no abdômen"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2 text-xs text-white"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddPhotoModal(false);
                  setPreviewPhotoData(null);
                }}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!previewPhotoData}
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 cursor-pointer disabled:opacity-50"
              >
                Salvar Foto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
