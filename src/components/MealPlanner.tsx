import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Copy,
  Edit2,
  Flame,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { FoodItem, MealFoodEntry, DayMealPlan } from '../types';

const DAYS_OF_WEEK: { key: DayMealPlan['dayOfWeek']; label: string }[] = [
  { key: 'seg', label: 'Segunda' },
  { key: 'ter', label: 'Terça' },
  { key: 'qua', label: 'Quarta' },
  { key: 'qui', label: 'Quinta' },
  { key: 'sex', label: 'Sexta' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
];

const MEAL_TYPES = [
  { type: 'cafe', title: 'Café da Manhã' },
  { type: 'almoco', title: 'Almoço' },
  { type: 'lanche', title: 'Lanche da Tarde' },
  { type: 'pre_treino', title: 'Pré-Treino' },
  { type: 'pos_treino', title: 'Pós-Treino' },
  { type: 'jantar', title: 'Jantar' },
  { type: 'ceia', title: 'Ceia Noturna' },
];

export const MealPlanner: React.FC = () => {
  const {
    mealPlan,
    foodDatabase,
    addFoodToMeal,
    removeFoodFromMeal,
    updateMealFoodGrams,
    duplicateMealsToDay,
    generateShoppingListFromMealPlan,
    userProfile,
    setCurrentTab,
  } = useApp();

  const [activeDay, setActiveDay] = useState<DayMealPlan['dayOfWeek']>('seg');

  // Add Food Modal state
  const [addFoodModal, setAddFoodModal] = useState<{ mealType: string } | null>(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [customGrams, setCustomGrams] = useState(100);

  // Duplicate Day Modal state
  const [duplicateModal, setDuplicateModal] = useState(false);
  const [targetDay, setTargetDay] = useState<DayMealPlan['dayOfWeek']>('ter');

  // Toast feedback
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Find current day plan
  const currentDayPlan = mealPlan.find((d) => d.dayOfWeek === activeDay) || {
    dayOfWeek: activeDay,
    meals: [],
  };

  // Calculate day macros
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  let totalFiber = 0;

  currentDayPlan.meals.forEach((m) => {
    m.items.forEach((item) => {
      totalCalories += item.calories;
      totalProtein += item.protein;
      totalCarbs += item.carbs;
      totalFats += item.fats;
      totalFiber += item.fiber;
    });
  });

  const handleConfirmAddFood = () => {
    if (!addFoodModal || !selectedFood) return;
    addFoodToMeal(activeDay, addFoodModal.mealType, selectedFood, customGrams);
    showToast(`${selectedFood.name} adicionado ao plano.`);
    setAddFoodModal(null);
    setSelectedFood(null);
    setFoodSearchQuery('');
  };

  const handleDuplicate = () => {
    duplicateMealsToDay(activeDay, targetDay);
    showToast(`Refeições de ${activeDay.toUpperCase()} duplicadas para ${targetDay.toUpperCase()}.`);
    setDuplicateModal(false);
  };

  const handleGenerateShopping = () => {
    generateShoppingListFromMealPlan();
    showToast('Lista de compras gerada a partir do seu cardápio!');
    setCurrentTab('compras');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
            Nutrição de Precisão // TACO & USDA
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mt-2">
            Minha Alimentação
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1">
            Organize suas refeições diárias de maneira prática e equilibrada, sem dietas extremas ou restrições desnecessárias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setDuplicateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold hover:border-neutral-700 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicar Dia</span>
          </button>
          <button
            onClick={handleGenerateShopping}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Gerar Lista de Compras</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-neutral-900 border border-emerald-500/40 rounded-2xl text-xs font-mono text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Days of Week Tab Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = activeDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-black shadow-lg scale-105'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* Daily Total Summary Card */}
      <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block">
              Totais Diários Estimados ({activeDay.toUpperCase()})
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl md:text-4xl font-extrabold font-mono text-white">
                {totalCalories}
              </span>
              <span className="text-sm font-mono text-neutral-400">
                / {userProfile.targetDailyCalories} kcal planejadas
              </span>
            </div>
          </div>

          {/* Allergy Alert Reminder */}
          {userProfile.allergies.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Filtro de alergias ativo: <strong>{userProfile.allergies.join(', ')}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Macro Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Proteína</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {Math.round(totalProtein)}g
            </span>
            <span className="text-[10px] text-neutral-500">
              Meta: {userProfile.targetProteinGrams}g ({Math.round((totalProtein / userProfile.targetProteinGrams) * 100)}%)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Carboidratos</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {Math.round(totalCarbs)}g
            </span>
            <span className="text-[10px] text-neutral-500">
              Meta: {userProfile.targetCarbsGrams}g ({Math.round((totalCarbs / userProfile.targetCarbsGrams) * 100)}%)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Gorduras</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {Math.round(totalFats)}g
            </span>
            <span className="text-[10px] text-neutral-500">
              Meta: {userProfile.targetFatsGrams}g ({Math.round((totalFats / userProfile.targetFatsGrams) * 100)}%)
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block">Fibras</span>
            <span className="text-xl font-bold font-mono text-white mt-1 block">
              {Math.round(totalFiber)}g
            </span>
            <span className="text-[10px] text-neutral-500">Saúde Intestinal & Saciedade</span>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-6">
        {MEAL_TYPES.map((mType) => {
          const meal = currentDayPlan.meals.find((m) => m.type === mType.type);
          const items = meal?.items || [];

          let mealCalories = 0;
          let mealProtein = 0;
          let mealCarbs = 0;
          let mealFats = 0;

          items.forEach((item) => {
            mealCalories += item.calories;
            mealProtein += item.protein;
            mealCarbs += item.carbs;
            mealFats += item.fats;
          });

          return (
            <div
              key={mType.type}
              className="rounded-3xl bg-neutral-950 border border-white/10 p-5 md:p-6 shadow-xl space-y-4"
            >
              {/* Meal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white text-xs">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{mType.title}</h3>
                    <span className="text-xs text-neutral-400 font-mono">
                      {mealCalories} kcal • {Math.round(mealProtein)}g P • {Math.round(mealCarbs)}g C • {Math.round(mealFats)}g G
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setAddFoodModal({ mealType: mType.type })}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold border border-neutral-800 transition-colors cursor-pointer self-start sm:self-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Alimento</span>
                </button>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <p className="text-xs text-neutral-500 py-3 text-center">
                  Nenhum item adicionado a esta refeição ainda.
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 hover:border-neutral-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white block text-sm">{item.foodName}</span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {item.calories} kcal • {item.protein}g proteína • {item.carbs}g carbo • {item.fats}g gordura
                        </span>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="5"
                            value={item.portionGrams}
                            onChange={(e) =>
                              updateMealFoodGrams(
                                activeDay,
                                mType.type,
                                item.id,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg py-1 px-2 text-center font-mono font-bold text-white text-xs"
                          />
                          <span className="font-mono text-neutral-400 text-xs">g</span>
                        </div>

                        <button
                          onClick={() => removeFoodFromMeal(activeDay, mType.type, item.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                          title="Remover alimento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Food Modal */}
      {addFoodModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold font-display text-white">
                Adicionar Alimento // TACO / USDA
              </h3>
              <button
                onClick={() => setAddFoodModal(null)}
                className="p-1 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Pesquisar alimento (ex: frango, arroz, ovos, aveia)..."
                value={foodSearchQuery}
                onChange={(e) => setFoodSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
              />
            </div>

            {/* Food Selection List */}
            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 text-xs">
              {foodDatabase
                .filter((f) =>
                  f.name.toLowerCase().includes(foodSearchQuery.toLowerCase()) ||
                  f.category.toLowerCase().includes(foodSearchQuery.toLowerCase())
                )
                .map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  const hasAllergyWarning = food.allergens.some((alg) =>
                    userProfile.allergies.some((userAlg) =>
                      alg.toLowerCase().includes(userAlg.toLowerCase())
                    )
                  );

                  return (
                    <div
                      key={food.id}
                      onClick={() => {
                        setSelectedFood(food);
                        setCustomGrams(food.referenceGrams);
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 border-white text-white'
                          : 'bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-bold text-sm block text-white">{food.name}</span>
                          <span className="text-[11px] font-mono text-neutral-400">
                            {food.calories} kcal / {food.referenceGrams}g • {food.protein}g P • {food.carbs}g C • {food.fats}g G
                          </span>
                        </div>

                        {hasAllergyWarning && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/80 border border-red-500/40 text-red-300">
                            Alérgeno registrado!
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Portion Adjuster */}
            {selectedFood && (
              <div className="mt-4 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs">
                <span className="text-neutral-400 block mb-2 font-medium">
                  Ajustar Porção para {selectedFood.name}:
                </span>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="10"
                    value={customGrams}
                    onChange={(e) => setCustomGrams(parseFloat(e.target.value) || 0)}
                    className="w-24 bg-neutral-950 border border-neutral-700 rounded-xl py-2 px-3 text-white font-mono font-bold text-center"
                  />
                  <span className="text-neutral-400 font-mono">gramas</span>

                  <div className="ml-auto text-right font-mono text-neutral-300">
                    <strong>{Math.round((selectedFood.calories * customGrams) / selectedFood.referenceGrams)}</strong> kcal •{' '}
                    <strong>{((selectedFood.protein * customGrams) / selectedFood.referenceGrams).toFixed(1)}</strong>g proteína
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setAddFoodModal(null)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!selectedFood}
                onClick={handleConfirmAddFood}
                className="px-6 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 disabled:opacity-40 cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Duplicate Day Modal */}
      {duplicateModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold font-display text-white mb-2">
              Duplicar Cardápio
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Copiar todas as refeições de <strong className="text-white">{activeDay.toUpperCase()}</strong> para:
            </p>

            <select
              value={targetDay}
              onChange={(e) => setTargetDay(e.target.value as any)}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white mb-6"
            >
              {DAYS_OF_WEEK.filter((d) => d.key !== activeDay).map((d) => (
                <option key={d.key} value={d.key}>
                  {d.label}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDuplicateModal(false)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleDuplicate}
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200"
              >
                Duplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
