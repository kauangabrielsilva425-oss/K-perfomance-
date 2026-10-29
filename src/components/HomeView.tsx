import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThreeKScene } from './ThreeKScene';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Database,
  Download,
  Dumbbell,
  FileText,
  Flame,
  Pill,
  Play,
  RotateCcw,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Upload,
  Utensils,
  Zap,
} from 'lucide-react';

export const HomeView: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const {
    setCurrentTab,
    activeRoutine,
    startWorkout,
    activeWorkout,
    exportDataJSON,
    importDataJSON,
    userProfile,
  } = useApp();

  const [importText, setImportText] = useState('');
  const [showDataModal, setShowDataModal] = useState(false);
  const [dataMessage, setDataMessage] = useState<string | null>(null);

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `k_performance_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setDataMessage('Backup baixado com sucesso!');
    setTimeout(() => setDataMessage(null), 3000);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJSON(importText);
    if (ok) {
      setDataMessage('Dados restaurados com sucesso!');
      setImportText('');
      setTimeout(() => {
        setDataMessage(null);
        setShowDataModal(false);
      }, 1500);
    } else {
      setDataMessage('Erro: JSON de backup inválido.');
    }
  };

  const currentSession = activeRoutine.sessions[0];

  return (
    <div className="w-full space-y-16 pb-16">
      {/* 3D Hero Section with Metallic K Emblem */}
      <ThreeKScene
        onExploreClick={() => {
          const el = document.getElementById('ferramentas-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onRoutineClick={onOpenOnboarding}
      />

      {/* Editorial Pillars Section */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-neutral-400">
              01 // PILARES DO SISTEMA
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white mt-1">
              Engenharia Corporal Sem Ruídos
            </h2>
          </div>
          <p className="text-neutral-400 text-xs md:text-sm max-w-md">
            Ciência do treinamento e precisão alimentar em ferramentas práticas para o dia a dia.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => setCurrentTab('rotina')}
            className="p-6 rounded-3xl bg-neutral-950 border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between h-64 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-neutral-500 font-mono text-xs mb-4">
                <span>/ 01</span>
                <Dumbbell className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold font-display text-white group-hover:translate-x-1 transition-transform">
                Minha Rotina
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Divisões científicas (PPL, Upper/Lower, Full Body) ajustadas ao seu nível.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-semibold pt-3 border-t border-white/5">
              <span>Montar Rotina</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('treino_vivo')}
            className="p-6 rounded-3xl bg-neutral-950 border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between h-64 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-neutral-500 font-mono text-xs mb-4">
                <span>/ 02</span>
                <Activity className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold font-display text-white group-hover:translate-x-1 transition-transform">
                Treino ao Vivo
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Cronômetro de descanso sonoro e anotação tátil série a série com cálculo de volume.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-semibold pt-3 border-t border-white/5">
              <span>{activeWorkout ? 'Retomar Sessão' : 'Iniciar Agora'}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('alimentacao')}
            className="p-6 rounded-3xl bg-neutral-950 border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between h-64 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-neutral-500 font-mono text-xs mb-4">
                <span>/ 03</span>
                <Utensils className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold font-display text-white group-hover:translate-x-1 transition-transform">
                Alimentação & TACO
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Planejador semanal de refeições com base auditada de alimentos brasileiros.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-semibold pt-3 border-t border-white/5">
              <span>Organizar Cardápio</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => setCurrentTab('suplementacao')}
            className="p-6 rounded-3xl bg-neutral-950 border border-white/10 hover:border-white/30 transition-all cursor-pointer group flex flex-col justify-between h-64 shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between text-neutral-500 font-mono text-xs mb-4">
                <span>/ 04</span>
                <Pill className="w-4 h-4 text-neutral-400 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-lg font-bold font-display text-white group-hover:translate-x-1 transition-transform">
                Suplementos & Rankings
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Rankings transparentes com laudos laboratoriais e custo por dose ativa.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-white font-semibold pt-3 border-t border-white/5">
              <span>Ver Rankings</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: ECOSSISTEMA NUTRICIONAL */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8 space-y-6">
        <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-neutral-800 shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                  02 // CATÁLOGO EXPANDIDO
                </span>
                <span className="text-[10px] font-mono text-neutral-500">+100 Itens Registrados</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                Biblioteca Nutricional para Treino
              </h2>
              <p className="text-neutral-400 text-xs md:text-sm max-w-2xl mt-1 leading-relaxed">
                Fontes de proteína nobre, carboidratos limpos e gorduras boas com dados por 100g e porção.
              </p>
            </div>

            <button
              onClick={() => setCurrentTab('catalogo')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-lg self-start md:self-auto shrink-0"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Interactive Showcase Cards of Key Staples */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Peito de Frango Grelhado',
                category: 'Proteína Nobre',
                cal: '159 kcal',
                prot: '32.0g',
                carb: '0.0g',
                fat: '2.5g',
                timing: 'Almoço / Jantar',
                tip: 'Padrão ouro de digestibilidade e síntese proteica miofibrilar.',
              },
              {
                name: 'Arroz Branco Cozido',
                category: 'Carboidrato Limpo',
                cal: '128 kcal',
                prot: '2.5g',
                carb: '28.1g',
                fat: '0.2g',
                timing: 'Pós-Treino / Almoço',
                tip: 'Restauração rápida de glicogênio sem resíduo gastrointestinal pesado.',
              },
              {
                name: 'Ovos Caipiras Inteiros',
                category: 'Proteína & Colina',
                cal: '143 kcal',
                prot: '13.0g',
                carb: '1.6g',
                fat: '9.5g',
                timing: 'Café / Ceia',
                tip: 'Biodisponibilidade biológica de 100 com colina e micronutrientes na gema.',
              },
              {
                name: 'Aveia em Flocos Finos',
                category: 'Carbo Complexo',
                cal: '197 kcal',
                prot: '6.9g',
                carb: '33.3g',
                fat: '3.6g',
                timing: 'Café / Pré-Treino',
                tip: 'Betaglucanas de liberação lenta e saciedade sustentada.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => setCurrentTab('catalogo')}
                className="p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-600 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                    <span className="text-neutral-400 uppercase tracking-wider">{item.category}</span>
                    <span className="text-white font-semibold">{item.cal}</span>
                  </div>
                  <h4 className="text-sm font-bold font-display text-white group-hover:text-neutral-200 transition-colors">
                    {item.name}
                  </h4>

                  {/* Micro Macro Badges */}
                  <div className="grid grid-cols-3 gap-1 my-3 text-center text-[10px] font-mono">
                    <div className="p-1 rounded-lg bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">PROT</span>
                      <span className="font-bold text-white">{item.prot}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">CARB</span>
                      <span className="font-bold text-white">{item.carb}</span>
                    </div>
                    <div className="p-1 rounded-lg bg-neutral-950 border border-neutral-800">
                      <span className="text-neutral-500 block text-[8px]">GORD</span>
                      <span className="font-bold text-white">{item.fat}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    {item.tip}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-400 mt-3">
                  <span>{item.timing}</span>
                  <span className="text-white group-hover:translate-x-0.5 transition-transform">Ver Dossiê →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Central Interactive Hub Section (id for scroll) */}
      <section id="ferramentas-section" className="w-full max-w-7xl mx-auto px-4 md:px-8 space-y-8">
        <div className="rounded-3xl p-6 md:p-10 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                Acesso Rápido de Alta Performance
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white leading-tight">
                Tudo o Que Seu Físico Exige em Um Único Lugar
              </h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Desde o timer de descanso no banco de supino até a lista no supermercado para o meal prep de domingo.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-4">
                {currentSession && (
                  <button
                    onClick={() => startWorkout(currentSession)}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-lg active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Iniciar Treino do Dia ({currentSession.name.split('—')[0].trim()})</span>
                  </button>
                )}
                <button
                  onClick={() => setCurrentTab('desempenho')}
                  className="px-6 py-3 border border-neutral-700 hover:border-white text-white font-semibold text-xs rounded-full transition-all cursor-pointer"
                >
                  Abrir Meu Desempenho
                </button>
              </div>
            </div>

            {/* Quick Metrics Showcase */}
            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
              <div
                onClick={() => setCurrentTab('evolucao')}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <TrendingUp className="w-5 h-5 text-neutral-400 mb-2" />
                <span className="text-white font-bold text-base block font-mono">Curvas 1RM</span>
                <span className="text-neutral-500 text-[11px]">Sobrecarga progressiva</span>
              </div>

              <div
                onClick={() => setCurrentTab('compras')}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5 text-neutral-400 mb-2" />
                <span className="text-white font-bold text-base block font-mono">Compras</span>
                <span className="text-neutral-500 text-[11px]">Lista automática</span>
              </div>

              <div
                onClick={() => setCurrentTab('catalogo')}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <Flame className="w-5 h-5 text-neutral-400 mb-2" />
                <span className="text-white font-bold text-base block font-mono">Alimentos</span>
                <span className="text-neutral-500 text-[11px]">Tabela TACO auditada</span>
              </div>

              <div
                onClick={() => setCurrentTab('calendario')}
                className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 hover:border-neutral-600 transition-all cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-neutral-400 mb-2" />
                <span className="text-white font-bold text-base block font-mono">Calendário</span>
                <span className="text-neutral-500 text-[11px]">Hábitos & rotina</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Management & Backup Bar */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-8">
        <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-neutral-400" />
            <div>
              <span className="font-semibold text-white block">Armazenamento Local Seguro</span>
              <span className="text-neutral-400 text-[11px]">
                Seus treinos, rotinas, histórico e refeições são persistidos no seu navegador.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar Backup (JSON)</span>
            </button>
            <button
              onClick={() => setShowDataModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Restaurar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Data Import Modal */}
      {showDataModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-lg font-bold font-display text-white">Restaurar Dados de Backup</h3>
            <p className="text-neutral-400">
              Cole o conteúdo do arquivo JSON exportado anteriormente para recuperar seus dados salvos.
            </p>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Cole o código JSON aqui..."
              rows={6}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 font-mono text-[11px] text-white focus:outline-none focus:border-white"
            />

            {dataMessage && (
              <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-700 text-neutral-300 font-mono text-[11px]">
                {dataMessage}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDataModal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-neutral-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleImport}
                className="px-5 py-2 bg-white text-black font-semibold rounded-full hover:bg-neutral-200"
              >
                Importar Dados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-12 border-t border-white/5 text-xs text-neutral-500 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-white text-black font-display font-black text-[10px] flex items-center justify-center">
            K
          </div>
          <span className="font-display font-semibold text-neutral-300">
            K PERFORMANCE © 2026
          </span>
          <span>— Treinamento, Nutrição & Ciência</span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span>HIGH IMPACT FITNESS PLATFORM</span>
          <span>•</span>
          <span>DESIGN EDITORIAL</span>
        </div>
      </footer>
    </div>
  );
};
