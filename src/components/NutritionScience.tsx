import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertCircle,
  Apple,
  Award,
  BookOpen,
  Calculator,
  ChevronDown,
  ChevronUp,
  Droplets,
  Heart,
  Moon,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

interface GuideSection {
  id: string;
  title: string;
  category: string;
  icon: React.ElementType;
  summary: string;
  scientificTakeaways: string[];
  practicalApplication: string;
  literatureSource: string;
}

const SCIENCE_GUIDES: GuideSection[] = [
  {
    id: 'proteinas',
    title: 'Proteínas & Síntese Proteica Muscular (MPS)',
    category: 'Macronutriente Construtor',
    icon: Sparkles,
    summary:
      'As proteínas fornecem os aminoácidos essenciais, especialmente a L-leucina, que ativam a via anabólica intracelular mTOR, iniciando o reparo e a hipertrofia do tecido muscular.',
    scientificTakeaways: [
      'Ingestão ótima para praticantes de musculação: 1.6g a 2.2g por kg de peso corporal ao dia (JISSN, Morton et al., 2018).',
      'Limiar de leucina: cerca de 2.5g a 3g de leucina por refeição é suficiente para deflagrar a síntese proteica máxima.',
      'Fracionamento ideal: distribuir a proteína em 3 a 5 refeições ao longo do dia com intervalos de 3 a 5 horas.',
    ],
    practicalApplication:
      'Priorize fontes completas de alto valor biológico: ovos caipiras, peito de frango, carne bovina magra, tilápia, laticínios de qualidade ou combinações vegetais densas (arroz integral + leguminosas/ervilha).',
    literatureSource: 'International Society of Sports Nutrition (JISSN) & British Journal of Sports Medicine',
  },
  {
    id: 'carboidratos',
    title: 'Carboidratos & Energia Glicogênica',
    category: 'Substrato Energético Primário',
    icon: Zap,
    summary:
      'A contração muscular de alta intensidade na musculação depende diretamente da via glicolítica anaeróbia. Carboidratos repõem o glicogênio muscular e hepático, preservando o rendimento.',
    scientificTakeaways: [
      'Dietas com privação severa de carboidratos reduzem o volume sustentável de treino em treinos de alta densidade.',
      'A ingestão adequada atenua a elevação crônica do cortisol e previne a proteólise muscular durante treinos intensos.',
    ],
    practicalApplication:
      'Concentre carboidratos complexos e de fácil digestão (arroz, aveia, batata-doce, frutas) nas refeições pré e pós-treino para maximizar o influxo de glicose.',
    literatureSource: 'American College of Sports Medicine (ACSM) Joint Position Statement',
  },
  {
    id: 'gorduras',
    title: 'Gorduras Essenciais & Homeostase Hormonal',
    category: 'Regulação Endócrina & Celular',
    icon: Heart,
    summary:
      'Gorduras alimentares são indispensáveis para a integridade das membranas celulares, a síntese de hormônios esteroides (como a testosterona) e a absorção das vitaminas lipossolúveis (A, D, E, K).',
    scientificTakeaways: [
      'Evite reduzir a gordura total abaixo de 15% a 20% das calorias totais, pois isso correlaciona-se com queda nos níveis basais de testosterona circulante.',
      'Ácidos graxos poli-insaturados Ômega-3 (EPA/DHA) auxiliam na modulação de processos inflamatórios induzidos pelo esforço físico.',
    ],
    practicalApplication:
      'Adicione azeite de oliva extra virgem cru, castanhas-do-pará (ricas em selênio), sementes de chia e gemas de ovos com moderação controlada.',
    literatureSource: 'The Journal of Clinical Endocrinology & Metabolism',
  },
  {
    id: 'fibras',
    title: 'Fibras Alimentares & Microbiota Intestinal',
    category: 'Saúde Digestiva & Saciedade',
    icon: Apple,
    summary:
      'Fibras solúveis e insolúveis regulam o trânsito intestinal, previnem picos glicêmicos abruptos e alimentam bactérias benéficas que produzem ácidos graxos de cadeia curta (AGCCs).',
    scientificTakeaways: [
      'Recomendação diária: 25g a 35g de fibras totais provenientes de alimentos reais integrais.',
      'A beta-glucana presente na aveia é comprovadamente eficaz na regulação do perfil lipídico sérico.',
    ],
    practicalApplication:
      'Consuma vegetais fibrosos (brócolis, folhas verdes escuras, cenoura) e frutas com casca ao longo das refeições principais.',
    literatureSource: 'European Journal of Clinical Nutrition',
  },
  {
    id: 'hidratacao',
    title: 'Hidratação & Equilíbrio Hidroeletrolítico',
    category: 'Fisiologia Celular Básica',
    icon: Droplets,
    summary:
      'Uma desidratação de meros 2% do peso corporal já é suficiente para reduzir a força isométrica, aumentar a percepção subjetiva de esforço (RPE) e diminuir o tempo até a exaustão.',
    scientificTakeaways: [
      'Cálculo padrão para atletas: 35ml a 45ml de água por quilo de peso corporal ao dia + reposição hídrica pós-sudorese.',
      'A hidratação otimiza o volume celular, atuando como estímulo mecânico favorável ao anabolismo.',
    ],
    practicalApplication:
      'Distribua o consumo de água de forma constante durante a vigília. Não espere a sensação de sede para ingerir líquidos.',
    literatureSource: 'Sports Medicine Review & ACSM Hydration Guidelines',
  },
  {
    id: 'sono_nutricao',
    title: 'Sinergia entre Sono, Nutrição & Recuperação',
    category: 'Regeneração Neuroendócrina',
    icon: Moon,
    summary:
      'A musculação gera o estímulo de microlesão tecidual, mas a síntese proteica e a adaptação neural ocorrem predominantemente durante os estágios de sono de ondas lentas (N3/Delta).',
    scientificTakeaways: [
      'Privação crônica de sono (< 6h) eleva a grelina (fome descontrolada), reduz a leptina e diminui a taxa de síntese proteica em até 18%.',
      'Refeições muito pesadas ricas em gorduras saturadas logo antes de deitar podem fragmentar a arquitetura do sono.',
    ],
    practicalApplication:
      'Realize a última refeição cerca de 90 a 120 minutos antes de dormir, preferindo proteínas magras de fácil digestão associadas a carboidratos de absorção lenta.',
    literatureSource: 'Sleep Medicine Reviews & Frontiers in Physiology',
  },
];

export const NutritionScience: React.FC = () => {
  const { userProfile, updateUserProfile } = useApp();
  const [expandedGuideId, setExpandedGuideId] = useState<string>('proteinas');

  // Interactive Energy Estimator State
  const [calcWeight, setCalcWeight] = useState(userProfile.weightKg);
  const [calcHeight, setCalcHeight] = useState(userProfile.heightCm);
  const [calcAge, setCalcAge] = useState(userProfile.age);
  const [calcGender, setCalcGender] = useState(userProfile.gender);
  const [activityFactor, setActivityFactor] = useState(1.55); // moderate activity (3-5x gym)
  const [goalStrategy, setGoalStrategy] = useState<'manutencao' | 'superavit_leve' | 'deficit_moderado'>('superavit_leve');

  // Mifflin-St Jeor Equation for BMR
  const bmr =
    calcGender === 'feminino'
      ? 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge - 161
      : 10 * calcWeight + 6.25 * calcHeight - 5 * calcAge + 5;

  const tdee = Math.round(bmr * activityFactor);

  let targetCalories = tdee;
  if (goalStrategy === 'superavit_leve') targetCalories = Math.round(tdee * 1.1); // +10%
  else if (goalStrategy === 'deficit_moderado') targetCalories = Math.round(tdee * 0.85); // -15%

  // Recommended protein based on 2.0g/kg
  const recProtein = Math.round(calcWeight * 2.0);
  const proteinCals = recProtein * 4;

  // Recommended fats based on 0.9g/kg
  const recFats = Math.round(calcWeight * 0.9);
  const fatCals = recFats * 9;

  // Remainder in carbs
  const remainingCals = Math.max(0, targetCalories - proteinCals - fatCals);
  const recCarbs = Math.round(remainingCals / 4);

  const handleApplyToProfile = () => {
    updateUserProfile({
      targetDailyCalories: targetCalories,
      targetProteinGrams: recProtein,
      targetCarbsGrams: recCarbs,
      targetFatsGrams: recFats,
      targetWaterMl: Math.round(calcWeight * 40),
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
          Base Baseada em Evidências // Fisiologia Humana
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mt-2">
          Nutrição Científica & Educação
        </h1>
        <p className="text-neutral-400 text-sm max-w-2xl mt-1">
          Compreenda os fundamentos biológicos da alimentação para o treinamento físico sem modismos, restrições punitivas ou mitos ultrapassados.
        </p>
      </div>

      {/* Interactive Estimator Tool */}
      <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-neutral-400" />
              <span>Estimador de Necessidades Energéticas (Mifflin-St Jeor)</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Fórmula científica amplamente validada para estimar Taxa Metabólica Basal e Gasto Diário.
            </p>
          </div>

          <button
            onClick={handleApplyToProfile}
            className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-md self-start md:self-center"
          >
            Aplicar Metas ao Meu Perfil
          </button>
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs mb-6">
          <div>
            <label className="text-neutral-400 block mb-1">Peso (kg)</label>
            <input
              type="number"
              step="0.5"
              value={calcWeight}
              onChange={(e) => setCalcWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Altura (cm)</label>
            <input
              type="number"
              value={calcHeight}
              onChange={(e) => setCalcHeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Idade (anos)</label>
            <input
              type="number"
              value={calcAge}
              onChange={(e) => setCalcAge(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Sexo Biológico</label>
            <select
              value={calcGender}
              onChange={(e) => setCalcGender(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white"
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Nível de Atividade</label>
            <select
              value={activityFactor}
              onChange={(e) => setActivityFactor(parseFloat(e.target.value))}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-[11px]"
            >
              <option value="1.375">Leve (1-2x/sem)</option>
              <option value="1.55">Moderado (3-5x/sem)</option>
              <option value="1.725">Intenso (6-7x/sem)</option>
            </select>
          </div>

          <div>
            <label className="text-neutral-400 block mb-1">Estratégia</label>
            <select
              value={goalStrategy}
              onChange={(e) => setGoalStrategy(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white text-[11px]"
            >
              <option value="superavit_leve">Hipertrofia (+10%)</option>
              <option value="manutencao">Manutenção (Normocalórica)</option>
              <option value="deficit_moderado">Definição Moderada (-15%)</option>
            </select>
          </div>
        </div>

        {/* Calculated Results */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Metabolismo Basal (BMR)</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{Math.round(bmr)} kcal</span>
            <span className="text-[10px] text-neutral-500">Energia mínima vital em repouso</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Gasto Total (TDEE)</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">{tdee} kcal</span>
            <span className="text-[10px] text-neutral-500">Com base nos treinos semanais</span>
          </div>

          <div className="p-4 rounded-2xl bg-white text-black border border-white">
            <span className="text-[10px] font-mono font-bold uppercase block text-neutral-700">Meta Sugerida</span>
            <span className="text-xl font-extrabold font-mono mt-1 block">{targetCalories} kcal</span>
            <span className="text-[10px] font-semibold text-neutral-800">Estimativa individual</span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 uppercase block">Macros Sugeridos</span>
            <span className="text-xs font-mono font-bold text-white mt-1.5 block">
              {recProtein}g P • {recCarbs}g C • {recFats}g G
            </span>
            <span className="text-[10px] text-neutral-500">2.0g/kg P • 0.9g/kg G</span>
          </div>
        </div>
      </div>

      {/* Science Educational Guides Accordion */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold font-display text-white">Componentes Essenciais de Nutrição</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SCIENCE_GUIDES.map((guide) => {
            const isExpanded = expandedGuideId === guide.id;
            const Icon = guide.icon;

            return (
              <div
                key={guide.id}
                className="rounded-3xl bg-neutral-950 border border-white/10 p-6 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                        {guide.category}
                      </span>
                    </div>

                    <button
                      onClick={() => setExpandedGuideId(isExpanded ? '' : guide.id)}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Recolher' : 'Detalhes'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="text-lg font-bold font-display text-white mb-2">{guide.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">{guide.summary}</p>

                  {isExpanded && (
                    <div className="space-y-3 pt-3 border-t border-white/5 text-xs animate-fadeIn">
                      <div>
                        <strong className="text-white block mb-1">Evidências Principais:</strong>
                        <ul className="space-y-1 text-neutral-300">
                          {guide.scientificTakeaways.map((takeaway, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                              <span className="text-neutral-500">•</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <strong className="text-white block mb-1">Aplicação Prática no Dia a Dia:</strong>
                        <p className="text-neutral-300 text-[11px] leading-relaxed">
                          {guide.practicalApplication}
                        </p>
                      </div>

                      <div className="text-[10px] font-mono text-neutral-500 pt-1">
                        Fonte: {guide.literatureSource}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ethical Medical Disclaimer */}
      <div className="rounded-3xl p-6 bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-white font-semibold text-sm mb-1">
            Aviso de Responsabilidade Médica & Nutricional
          </h4>
          <p>
            As ferramentas de cálculo e diretrizes educativas apresentadas pela plataforma K Performance
            são exclusivamente estimativas matemáticas e pedagógicas. Elas não constituem prescrição dietética
            individualizada, diagnóstico médico ou intervenção terapêutica.
          </p>
          <p className="mt-1">
            Indivíduos com histórico de doenças renais, hepáticas, distúrbios alimentares, diabetes ou alergias severas
            devem obrigatoriamente ser acompanhados por um Nutricionista registrado no CRN e médico especialista.
          </p>
        </div>
      </div>
    </div>
  );
};
