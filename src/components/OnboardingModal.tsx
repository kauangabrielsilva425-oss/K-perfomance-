import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ChevronRight, Dumbbell, Sparkles, X, Zap } from 'lucide-react';
import { FitnessGoal, ExperienceLevel, EquipmentAccess, DietPreference } from '../types';

export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { userProfile, updateUserProfile, generateSuggestedRoutine, setCurrentTab } = useApp();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<FitnessGoal>(userProfile.goal);
  const [experience, setExperience] = useState<ExperienceLevel>(userProfile.experience);
  const [days, setDays] = useState<number>(userProfile.daysPerWeek);
  const [time, setTime] = useState<number>(userProfile.timePerSessionMin);
  const [equipment, setEquipment] = useState<EquipmentAccess>(userProfile.equipment);
  const [diet, setDiet] = useState<DietPreference>(userProfile.dietPreference);

  if (!isOpen) return null;

  const handleFinish = () => {
    updateUserProfile({
      goal,
      experience,
      daysPerWeek: days,
      timePerSessionMin: time,
      equipment,
      dietPreference: diet,
      onboardingCompleted: true,
    });

    generateSuggestedRoutine({
      days,
      experience,
      goal,
      time,
      equipment,
    });

    onClose();
    setCurrentTab('desempenho');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-white text-black font-display font-black text-xs flex items-center justify-center">
              K
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
              PASSO {step} DE 3 // PERSONALIZAÇÃO
            </span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {step === 1 && 'Qual é o seu objetivo prioritário?'}
            {step === 2 && 'Qual a sua experiência e tempo disponível?'}
            {step === 3 && 'Onde você treina e como se alimenta?'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            {step === 1 && 'Configuraremos o volume mecânico e divisão de acordo com sua meta.'}
            {step === 2 && 'Evitamos volumes excessivos ou subdosados para sua capacidade de recuperação.'}
            {step === 3 && 'Adaptamos os exercícios aos seus equipamentos e sua dieta.'}
          </p>
        </div>

        {/* Step 1: Goals */}
        {step === 1 && (
          <div className="space-y-2.5 my-6">
            {[
              { id: 'hipertrofia', title: 'Hipertrofia Muscular', desc: 'Ganho de massa magra, definição e densidade muscular.' },
              { id: 'forca', title: 'Força Máxima', desc: 'Aumento de carga nos grandes levantamentos e potência neural.' },
              { id: 'recomposicao', title: 'Recomposição Corporal', desc: 'Queima de gordura preservando o tecido contrátil.' },
              { id: 'saude_geral', title: 'Saúde & Longevidade', desc: 'Preservação de articulações, postura e mobilidade sustentável.' },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setGoal(item.id as FitnessGoal)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                  goal === item.id
                    ? 'bg-neutral-900 border-white text-white'
                    : 'bg-neutral-900/40 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <div>
                  <strong className="block text-sm text-white">{item.title}</strong>
                  <span className="text-neutral-400 text-[11px]">{item.desc}</span>
                </div>
                {goal === item.id && <Check className="w-4 h-4 text-white shrink-0" />}
              </div>
            ))}
          </div>
        )}

        {/* Step 2: Experience & Days */}
        {step === 2 && (
          <div className="space-y-5 my-6 text-xs">
            <div>
              <label className="text-neutral-300 block mb-2 font-medium">Nível com musculação:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'iniciante', label: 'Iniciante', sub: '< 1 ano' },
                  { id: 'intermediario', label: 'Intermediário', sub: '1-3 anos' },
                  { id: 'avancado', label: 'Avançado', sub: '3+ anos' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setExperience(item.id as ExperienceLevel)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      experience === item.id
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className="block font-semibold text-white">{item.label}</span>
                    <span className="text-[10px] text-neutral-500">{item.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-neutral-300 block mb-2 font-medium">Dias disponíveis por semana:</label>
              <div className="grid grid-cols-5 gap-2 font-mono">
                {[2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setDays(num)}
                    className={`py-2 rounded-xl border text-center text-sm font-bold transition-all ${
                      days === num
                        ? 'bg-white text-black border-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-neutral-300 block mb-2 font-medium">Tempo por sessão:</label>
              <div className="grid grid-cols-4 gap-2 font-mono">
                {[45, 60, 75, 90].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTime(mins)}
                    className={`py-2 rounded-xl border text-center text-xs font-semibold transition-all ${
                      time === mins
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Equipment & Diet */}
        {step === 3 && (
          <div className="space-y-5 my-6 text-xs">
            <div>
              <label className="text-neutral-300 block mb-2 font-medium">Equipamentos acessíveis:</label>
              <div className="space-y-2">
                {[
                  { id: 'academia_completa', title: 'Academia Completa', desc: 'Gaiolas, barras, máquinas articuladas e polias.' },
                  { id: 'halteres_banco', title: 'Halteres & Banco', desc: 'Espaço em casa ou condomínio com halteres ajustáveis.' },
                  { id: 'peso_corporal', title: 'Calistenia & Peso Corporal', desc: 'Barras fixas, paralelas e elásticos.' },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setEquipment(item.id as EquipmentAccess)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      equipment === item.id
                        ? 'bg-neutral-900 border-white text-white'
                        : 'bg-neutral-900/40 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div>
                      <strong className="block text-white">{item.title}</strong>
                      <span className="text-[11px] text-neutral-500">{item.desc}</span>
                    </div>
                    {equipment === item.id && <Check className="w-4 h-4 text-white" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-neutral-300 block mb-2 font-medium">Estilo Alimentar Preferido:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'onivora', label: 'Onívora' },
                  { id: 'vegetariana', label: 'Vegetariana' },
                  { id: 'vegana', label: 'Vegana' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDiet(item.id as DietPreference)}
                    className={`py-2 px-3 rounded-xl border text-center font-medium transition-all ${
                      diet === item.id
                        ? 'bg-neutral-800 border-white text-white'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ← Voltar
            </button>
          ) : (
            <button onClick={onClose} className="text-xs text-neutral-500 hover:text-neutral-300">
              Pular e explorar livremente
            </button>
          )}

          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 flex items-center gap-1 cursor-pointer"
            >
              <span>Avançar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-neutral-200 flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-black" />
              <span>Gerar Minha Plataforma</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
