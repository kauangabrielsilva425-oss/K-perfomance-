import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Eye,
  Filter,
  Flame,
  Heart,
  Info,
  Layers,
  Plus,
  Search,
  ShoppingCart,
  Sparkles,
  Star,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { FoodItem, DayMealPlan } from '../types';

const CATEGORY_TABS = [
  { key: 'todos', label: 'Todos os Alimentos' },
  { key: 'favoritos', label: '★ Meus Favoritos' },
  { key: 'proteina', label: 'Proteínas' },
  { key: 'carboidratos', label: 'Carboidratos' },
  { key: 'frutas', label: 'Frutas' },
  { key: 'legumes_verduras', label: 'Legumes & Verduras' },
  { key: 'gorduras_oleaginosas', label: 'Gorduras & Oleaginosas' },
  { key: 'lanches_praticos', label: 'Lanches & Práticos' },
  { key: 'outros_variados', label: 'Outras Opções' },
];

export const FoodCatalog: React.FC = () => {
  const {
    foodDatabase,
    addFoodToMeal,
    userProfile,
    favoriteFoodIds,
    toggleFavoriteFood,
    addShoppingItem,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('todos');
  const [dietFilter, setDietFilter] = useState<string>('todos');
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  // Modals state
  const [detailedModalFood, setDetailedModalFood] = useState<FoodItem | null>(null);
  const [addToMealFood, setAddToMealFood] = useState<FoodItem | null>(null);
  const [targetDay, setTargetDay] = useState<DayMealPlan['dayOfWeek']>('seg');
  const [targetMeal, setTargetMeal] = useState<string>('almoco');
  const [portionGrams, setPortionGrams] = useState<number>(100);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleExpand = (foodId: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [foodId]: !prev[foodId],
    }));
  };

  const filteredFoods = foodDatabase.filter((food) => {
    const matchesSearch =
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.combinationTips.toLowerCase().includes(searchQuery.toLowerCase());

    const isFav = favoriteFoodIds.includes(food.id);

    let matchesCategory = true;
    if (activeTab === 'favoritos') {
      matchesCategory = isFav;
    } else if (activeTab !== 'todos') {
      matchesCategory = food.category === activeTab;
    }

    const matchesDiet =
      dietFilter === 'todos' ||
      (dietFilter === 'vegano' && food.dietaryTags.includes('vegano')) ||
      (dietFilter === 'vegetariano' && food.dietaryTags.includes('vegetariano')) ||
      (dietFilter === 'sem_gluten' && food.dietaryTags.includes('sem_gluten')) ||
      (dietFilter === 'sem_lactose' && food.dietaryTags.includes('sem_lactose')) ||
      (dietFilter === 'rico_proteina' && food.dietaryTags.includes('rico_proteina'));

    return matchesSearch && matchesCategory && matchesDiet;
  });

  const handleOpenAddModal = (food: FoodItem) => {
    setAddToMealFood(food);
    setPortionGrams(food.referenceGrams);
  };

  const handleConfirmAddMeal = () => {
    if (!addToMealFood) return;
    addFoodToMeal(targetDay, targetMeal, addToMealFood, portionGrams);
    showToast(`Adicionado ${portionGrams}g de "${addToMealFood.name}" ao seu plano de ${targetDay.toUpperCase()}!`);
    setAddToMealFood(null);
  };

  const handleQuickAddShopping = (food: FoodItem) => {
    let cat: any = 'graos_mercearia';
    if (food.category === 'proteina') cat = 'carnes_ovos';
    else if (food.category === 'frutas' || food.category === 'legumes_verduras') cat = 'hortifruti';
    else if (food.category === 'gorduras_oleaginosas') cat = 'graos_mercearia';

    addShoppingItem({
      name: food.name,
      category: cat,
      quantity: `${food.referenceGrams}g`,
      notes: `Alimento selecionado do catálogo (${food.portionUnit})`,
      fromMealPlanner: false,
    });
    showToast(`"${food.name}" adicionado à sua Lista de Compras!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono text-white max-w-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
              Biblioteca Nutricional // +100 Alimentos de Alta Performance
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Auditado TACO & USDA</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Catálogo de Alimentos & Macros
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
            Consulte alimentos populares para hipertrofia e definição. Veja tabelas por 100g e porção, combinações estratégicas, sugestões de preparo e transfira para seu cardápio com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 bg-neutral-950 border border-neutral-800/80 rounded-2xl px-4 py-2.5">
          <Utensils className="w-4 h-4 text-neutral-300" />
          <span>
            Mostrando <strong className="text-white">{filteredFoods.length}</strong> de {foodDatabase.length} alimentos
          </span>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="p-5 md:p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar frango, aveia, batata-doce, salmão, whey, iogurte, castanhas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-mono"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-mono hidden sm:inline">Dieta:</span>
            <select
              value={dietFilter}
              onChange={(e) => setDietFilter(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-neutral-500 cursor-pointer"
            >
              <option value="todos">Todos os Perfis Alimentares</option>
              <option value="rico_proteina">Altamente Proteico (High Protein)</option>
              <option value="vegano">100% Vegano</option>
              <option value="vegetariano">Vegetariano</option>
              <option value="sem_gluten">Sem Glúten (Gluten-Free)</option>
              <option value="sem_lactose">Sem Lactose (Lactose-Free)</option>
            </select>
          </div>
        </div>

        {/* Categories Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/5'
                    : 'bg-neutral-900/80 text-neutral-400 border border-neutral-800/80 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Foods Grid */}
      {filteredFoods.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-950 border border-neutral-900 space-y-3">
          <p className="text-sm font-mono text-neutral-400">Nenhum alimento encontrado com os filtros atuais.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('todos');
              setDietFilter('todos');
            }}
            className="px-4 py-2 bg-neutral-900 text-white rounded-full text-xs font-mono hover:bg-neutral-800 cursor-pointer"
          >
            Limpar filtros e ver todos (+100)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => {
            const isFav = favoriteFoodIds.includes(food.id);
            const isExpanded = !!expandedCardIds[food.id];
            const hasAllergyWarning = food.allergens.some((alg) =>
              userProfile.allergies.some((uAlg) => alg.toLowerCase().includes(uAlg.toLowerCase()))
            );

            return (
              <div
                key={food.id}
                className="rounded-3xl bg-neutral-950 border border-neutral-800/90 p-5 shadow-xl hover:border-neutral-600 transition-all flex flex-col justify-between group relative"
              >
                {/* Top card bar: Category badge + Calories + Favorite button */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                      {food.category.replace('_', ' ')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-neutral-300 font-semibold">
                        {food.calories} kcal <span className="text-neutral-500 font-normal">/ {food.portionUnit}</span>
                      </span>
                      <button
                        onClick={() => toggleFavoriteFood(food.id)}
                        className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                          isFav
                            ? 'text-amber-400 bg-amber-400/10'
                            : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-900'
                        }`}
                        title={isFav ? 'Remover dos favoritos' : 'Salvar como favorito'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Food Name */}
                  <h3 className="text-base font-bold font-display text-white mb-2 group-hover:text-neutral-200 transition-colors">
                    {food.name}
                  </h3>

                  {/* 4 Macros indicators */}
                  <div className="grid grid-cols-4 gap-1.5 my-3 text-center text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[9px] uppercase">Prot</span>
                      <span className="font-bold text-white">{food.protein}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[9px] uppercase">Carb</span>
                      <span className="font-bold text-white">{food.carbs}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[9px] uppercase">Gord</span>
                      <span className="font-bold text-white">{food.fats}g</span>
                    </div>
                    <div className="p-2 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
                      <span className="text-neutral-500 block text-[9px] uppercase">Fibra</span>
                      <span className="font-bold text-white">{food.fiber}g</span>
                    </div>
                  </div>

                  {/* Allergen alert */}
                  {hasAllergyWarning && (
                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] mb-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span>Alerta de alérgeno cadastrado: {food.allergens.join(', ')}</span>
                    </div>
                  )}

                  {/* Short combination quote */}
                  <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2 mb-2">
                    <strong className="text-neutral-300">Sinergia:</strong> {food.combinationTips}
                  </p>

                  {/* Inline Collapsible Peek (The user requested "os dois") */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-neutral-900 text-[11px] space-y-2 animate-in fade-in duration-150">
                      <div>
                        <span className="text-neutral-500 font-mono block text-[10px] uppercase">
                          Preparo Recomendado
                        </span>
                        <ul className="text-neutral-300 list-disc list-inside space-y-0.5 mt-0.5">
                          {food.preparationSuggestions.map((prep, idx) => (
                            <li key={idx}>{prep}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <span className="text-neutral-500 font-mono block text-[10px] uppercase">
                          Melhor Momento de Consumo
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {food.mealTimingSuggestions.map((time, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                            >
                              {time}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                        <span>Base 100g: {food.caloriesPer100g} kcal</span>
                        <span>{food.proteinPer100g}g P • {food.carbsPer100g}g C • {food.fatsPer100g}g G</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions: Toggle Peek, Full Dossier Modal, Add to Day, Add to List */}
                <div className="pt-4 border-t border-neutral-900 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => toggleExpand(food.id)}
                      className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Recolher</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Dicas Rápidas</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setDetailedModalFood(food)}
                      className="flex items-center gap-1 text-[11px] font-mono text-neutral-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Ver Dossiê Completo</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickAddShopping(food)}
                      className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                      title="Adicionar à Lista de Compras"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenAddModal(food)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white text-black font-bold rounded-xl text-xs hover:bg-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar ao Dia</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL DETAILED DOSSIER MODAL (User Clarification: "os dois") */}
      {detailedModalFood && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <button
              onClick={() => setDetailedModalFood(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                {detailedModalFood.category.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">Fonte: {detailedModalFood.source}</span>
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                {detailedModalFood.name}
              </h2>
              <button
                onClick={() => toggleFavoriteFood(detailedModalFood.id)}
                className={`p-2 rounded-full border cursor-pointer ${
                  favoriteFoodIds.includes(detailedModalFood.id)
                    ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                    : 'border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Star className={`w-4 h-4 ${favoriteFoodIds.includes(detailedModalFood.id) ? 'fill-amber-400' : ''}`} />
              </button>
            </div>

            <p className="text-neutral-400 text-xs mt-1">
              Porção de referência calculada: <strong className="text-white">{detailedModalFood.portionUnit} ({detailedModalFood.referenceGrams}g)</strong>
            </p>

            {/* COMPARATIVE MACRO TABLE: Por Porção vs Por 100g */}
            <div className="mt-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-hidden">
              <div className="p-3 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Informação Nutricional Comparativa</span>
                <span className="text-[10px] text-neutral-500">Valores aproximados auditados</span>
              </div>
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-neutral-800/60 text-neutral-500 text-[10px] uppercase">
                    <th className="py-2.5 px-4">Nutriente</th>
                    <th className="py-2.5 px-4 text-center">Por Porção ({detailedModalFood.portionUnit})</th>
                    <th className="py-2.5 px-4 text-center">Por 100g</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/40 text-neutral-200">
                  <tr>
                    <td className="py-2 px-4 font-semibold text-white">Calorias (Energia)</td>
                    <td className="py-2 px-4 text-center font-bold text-white">{detailedModalFood.calories} kcal</td>
                    <td className="py-2 px-4 text-center font-semibold text-neutral-300">{detailedModalFood.caloriesPer100g} kcal</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Proteínas</td>
                    <td className="py-2 px-4 text-center font-bold text-emerald-400">{detailedModalFood.protein}g</td>
                    <td className="py-2 px-4 text-center font-medium text-emerald-300/80">{detailedModalFood.proteinPer100g}g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Carboidratos</td>
                    <td className="py-2 px-4 text-center font-bold text-blue-400">{detailedModalFood.carbs}g</td>
                    <td className="py-2 px-4 text-center font-medium text-blue-300/80">{detailedModalFood.carbsPer100g}g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Gorduras Totais</td>
                    <td className="py-2 px-4 text-center font-bold text-amber-400">{detailedModalFood.fats}g</td>
                    <td className="py-2 px-4 text-center font-medium text-amber-300/80">{detailedModalFood.fatsPer100g}g</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4">Fibras Alimentares</td>
                    <td className="py-2 px-4 text-center font-bold text-neutral-200">{detailedModalFood.fiber}g</td>
                    <td className="py-2 px-4 text-center text-neutral-400">
                      {((detailedModalFood.fiber * 100) / detailedModalFood.referenceGrams).toFixed(1)}g
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Preparation Suggestions & Timing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  Sugestões de Preparo Saudável
                </span>
                <ul className="text-xs text-neutral-300 space-y-1.5 list-disc list-inside">
                  {detailedModalFood.preparationSuggestions.map((prep, i) => (
                    <li key={i} className="leading-relaxed">{prep}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  Momentos Estratégicos de Consumo
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {detailedModalFood.mealTimingSuggestions.map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono text-neutral-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-neutral-400 pt-1 leading-relaxed">
                  <strong className="text-neutral-300">Dica:</strong> {detailedModalFood.combinationTips}
                </p>
              </div>
            </div>

            {/* Dietary Tags & Allergens */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-neutral-900/30 border border-neutral-800/60 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-neutral-500 font-mono text-[10px]">TAGS:</span>
                {detailedModalFood.dietaryTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-neutral-900 text-neutral-400 font-mono text-[10px] border border-neutral-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {detailedModalFood.allergens.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-amber-300 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Alérgenos: {detailedModalFood.allergens.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  handleQuickAddShopping(detailedModalFood);
                  setDetailedModalFood(null);
                }}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs rounded-full border border-neutral-700 flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Salvar nas Compras</span>
              </button>

              <button
                onClick={() => {
                  const f = detailedModalFood;
                  setDetailedModalFood(null);
                  handleOpenAddModal(f);
                }}
                className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Incluir no Meu Planejamento</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TO MEAL PLANNER MODAL */}
      {addToMealFood && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold font-display text-white">Adicionar à Refeição</h3>
              <button
                onClick={() => setAddToMealFood(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-neutral-400 block mb-1">Alimento Selecionado</span>
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <span className="font-bold text-sm text-white block">{addToMealFood.name}</span>
                  <span className="font-mono text-neutral-400 text-[11px]">
                    {addToMealFood.calories} kcal por {addToMealFood.portionUnit} ({addToMealFood.referenceGrams}g)
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Dia da Semana</label>
                  <select
                    value={targetDay}
                    onChange={(e) => setTargetDay(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    <option value="seg">Segunda-feira</option>
                    <option value="ter">Terça-feira</option>
                    <option value="qua">Quarta-feira</option>
                    <option value="qui">Quinta-feira</option>
                    <option value="sex">Sexta-feira</option>
                    <option value="sab">Sábado</option>
                    <option value="dom">Domingo</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-400 block mb-1">Refeição Alvo</label>
                  <select
                    value={targetMeal}
                    onChange={(e) => setTargetMeal(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white cursor-pointer"
                  >
                    <option value="cafe">Café da Manhã</option>
                    <option value="almoco">Almoço</option>
                    <option value="lanche">Lanche da Tarde</option>
                    <option value="pre_treino">Pré-Treino</option>
                    <option value="pos_treino">Pós-Treino</option>
                    <option value="jantar">Jantar</option>
                    <option value="ceia">Ceia Noturna</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-neutral-400">Quantidade em Gramas (g)</label>
                  <span className="text-[10px] font-mono text-neutral-500">
                    Sugerido: {addToMealFood.referenceGrams}g
                  </span>
                </div>
                <input
                  type="number"
                  step="5"
                  min="5"
                  max="2000"
                  value={portionGrams}
                  onChange={(e) => setPortionGrams(parseFloat(e.target.value) || 0)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white font-mono text-base font-bold text-center focus:border-white focus:outline-none"
                />
              </div>

              {/* Instant calculation summary */}
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 font-mono text-center text-xs text-neutral-300">
                Resultado:{' '}
                <strong className="text-white">
                  {Math.round((addToMealFood.calories * portionGrams) / addToMealFood.referenceGrams)} kcal
                </strong>{' '}
                •{' '}
                <strong className="text-emerald-400">
                  {((addToMealFood.protein * portionGrams) / addToMealFood.referenceGrams).toFixed(1)}g Prot
                </strong>{' '}
                •{' '}
                <strong className="text-blue-400">
                  {((addToMealFood.carbs * portionGrams) / addToMealFood.referenceGrams).toFixed(1)}g Carb
                </strong>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAddToMealFood(null)}
                className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAddMeal}
                className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm active:scale-95"
              >
                Incluir no Planejamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
