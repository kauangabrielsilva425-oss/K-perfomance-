import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  ChevronRight,
  ExternalLink,
  Eye,
  Filter,
  Info,
  Layers,
  Pill,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { SUPPLEMENT_RANKINGS_DATA } from '../data/supplementRankingsData';
import { INITIAL_SUPPLEMENT_PROFILES } from '../data/initialData';
import { SupplementRankedProduct, SupplementCategory, SupplementProfile } from '../types';

const CATEGORY_TABS: { key: SupplementCategory | 'todas'; label: string }[] = [
  { key: 'todas', label: 'Todas as Categorias' },
  { key: 'creatina', label: 'Creatina' },
  { key: 'whey', label: 'Whey Protein' },
  { key: 'proteina_vegetal', label: 'Proteína Vegetal' },
  { key: 'cafeina', label: 'Cafeína' },
  { key: 'beta_alanina', label: 'Beta-Alanina' },
  { key: 'bcaa', label: 'BCAA' },
  { key: 'glutamina', label: 'Glutamina' },
  { key: 'multivitaminico', label: 'Multivitamínicos' },
  { key: 'omega_3', label: 'Ômega-3' },
  { key: 'eletrolitos', label: 'Eletrólitos' },
  { key: 'pre_treino', label: 'Pré-Treino' },
  { key: 'hipercalorico', label: 'Hipercalórico' },
];

export const SupplementsGuide: React.FC = () => {
  const { addShoppingItem } = useApp();

  const [mainView, setMainView] = useState<'ranking' | 'comparador' | 'ciencia'>('ranking');
  const [selectedCategory, setSelectedCategory] = useState<SupplementCategory | 'todas'>('creatina');
  const [selectedBrand, setSelectedBrand] = useState<string>('todas');
  const [sortOption, setSortOption] = useState<'score' | 'preco' | 'laudo'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected product for full dossier modal
  const [dossierProduct, setDossierProduct] = useState<SupplementRankedProduct | null>(null);

  // Selected products for side-by-side comparison (max 3)
  const [compareIds, setCompareIds] = useState<string[]>([
    'supp_creatina_growth',
    'supp_creatina_dux_creapure',
  ]);

  // Scientific profile selected
  const [selectedProfileId, setSelectedProfileId] = useState<string>('supp_creatina');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Distinct brands list for filter
  const brandsList = useMemo(() => {
    const set = new Set<string>();
    SUPPLEMENT_RANKINGS_DATA.forEach((p) => set.add(p.brand));
    return ['todas', ...Array.from(set).sort()];
  }, []);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return SUPPLEMENT_RANKINGS_DATA.filter((p) => {
      const matchCat = selectedCategory === 'todas' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'todas' || p.brand === selectedBrand;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeIngredientAmount.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchBrand && matchSearch;
    }).sort((a, b) => {
      if (sortOption === 'score') return b.overallScore - a.overallScore;
      if (sortOption === 'preco') return a.costPerServingBRL - b.costPerServingBRL;
      if (sortOption === 'laudo') {
        if (a.verifiedLabTested === b.verifiedLabTested) return b.overallScore - a.overallScore;
        return a.verifiedLabTested ? -1 : 1;
      }
      return 0;
    });
  }, [selectedCategory, selectedBrand, sortOption, searchQuery]);

  const comparedProducts = useMemo(() => {
    return SUPPLEMENT_RANKINGS_DATA.filter((p) => compareIds.includes(p.id));
  }, [compareIds]);

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      if (compareIds.length > 1) {
        setCompareIds((prev) => prev.filter((item) => item !== id));
      } else {
        showToast('Mantenha ao menos 1 produto para comparação.');
      }
    } else {
      if (compareIds.length >= 3) {
        setCompareIds([compareIds[1], compareIds[2], id]);
        showToast('Substituído o primeiro produto (máximo de 3).');
      } else {
        setCompareIds([...compareIds, id]);
        showToast('Produto adicionado ao comparador!');
      }
    }
  };

  const activeProfile =
    INITIAL_SUPPLEMENT_PROFILES.find((p) => p.id === selectedProfileId) ||
    INITIAL_SUPPLEMENT_PROFILES[0];

  const handleAddProductToShopping = (product: SupplementRankedProduct) => {
    addShoppingItem({
      name: `${product.brand} - ${product.name}`,
      category: 'suplementos_outros',
      quantity: product.packageSize,
      notes: `Avaliado com nota ${product.overallScore}/100 no catálogo (${product.costPerServingBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/dose)`,
      fromMealPlanner: false,
    });
    showToast(`"${product.name}" adicionado à sua lista de compras!`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-mono text-white max-w-md animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-neutral-900">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
              Guia Farmacológico & Auditoria de Mercado // Brasil 2026
            </span>
            <span className="text-[10px] font-mono text-neutral-500">Critérios Transparentes (0 a 100)</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold font-display tracking-tight text-white">
            Catálogo & Ranking de Suplementos
          </h1>
          <p className="text-neutral-400 text-sm max-w-2xl mt-1.5 leading-relaxed">
            Avaliações auditadas de produtos consagrados no mercado nacional (Growth, Max Titanium, DUX, Soldiers, Integralmedica, Dark Lab). Laudos laboratoriais, pureza e custo real por dose ativa.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-2xl p-1 text-xs font-semibold self-start md:self-auto shrink-0">
          <button
            onClick={() => setMainView('ranking')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              mainView === 'ranking' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Rankings de Mercado
          </button>
          <button
            onClick={() => setMainView('comparador')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              mainView === 'comparador' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Comparador ({compareIds.length})
          </button>
          <button
            onClick={() => setMainView('ciencia')}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              mainView === 'ciencia' ? 'bg-white text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Dossiês Científicos
          </button>
        </div>
      </div>

      {/* Health & Responsibility Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 flex items-start gap-3 text-xs text-neutral-400 leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-neutral-200">Aviso de Responsabilidade e Saúde:</strong> O catálogo K PERFORMANCE é uma curadoria editorial comparativa baseada em laudos analíticos públicos (ABENUTRI, certificados de fabricantes e rótulos oficiais da Anvisa). A suplementação não substitui uma alimentação equilibrada nem a orientação de médico ou nutricionista. Doses elevadas de cafeína ou estimulantes são contraindicadas para cardiopatas e hipertensos.
        </div>
      </div>

      {/* VIEW 1: RANKINGS DE MERCADO */}
      {mainView === 'ranking' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="p-5 md:p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar produto por nome, marca (Growth, Max, DUX, Soldiers...) ou ingrediente..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">Marca:</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    {brandsList.map((b) => (
                      <option key={b} value={b}>
                        {b === 'todas' ? 'Todas as Marcas' : b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400 font-mono hidden sm:inline">Ordenar:</span>
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white cursor-pointer"
                  >
                    <option value="score">Maior Nota Geral (0-100)</option>
                    <option value="preco">Menor Custo por Dose</option>
                    <option value="laudo">Laudo Aprovado Primeiro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedCategory(tab.key)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-md'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scoring Methodology Briefing */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-neutral-400">
            <span>Critérios da Nota (0-100): Pureza e Matéria-prima (35%) • Transparência de Rótulo (25%) • Custo/Dose (25%) • Histórico/Laudos (15%)</span>
            <span className="text-neutral-500">Mostrando {filteredProducts.length} produtos auditados</span>
          </div>

          {/* Product Listing Cards */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-950 border border-neutral-900 text-neutral-500 font-mono text-xs">
              Nenhum produto encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isCompared = compareIds.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="rounded-3xl bg-neutral-950 border border-neutral-800/90 p-5 shadow-xl hover:border-neutral-700 transition-all flex flex-col justify-between group relative"
                  >
                    <div>
                      {/* Top Bar: Rank Position + Overall Score Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-white font-bold">
                            #{product.rankPosition} na Categoria
                          </span>
                          {product.isBestValue && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[9px] font-mono text-emerald-300 font-semibold">
                              Melhor Custo-Benefício
                            </span>
                          )}
                        </div>

                        {/* Overall Score Pill */}
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-neutral-900 border border-neutral-700 text-xs font-mono">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="font-extrabold text-white">{product.overallScore}</span>
                          <span className="text-neutral-500 text-[10px]">/100</span>
                        </div>
                      </div>

                      {/* Brand & Product Name */}
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-1">
                        {product.brand} • {product.categoryLabel}
                      </span>
                      <h3 className="text-base font-bold font-display text-white mb-2 leading-snug group-hover:text-neutral-200 transition-colors">
                        {product.name}
                      </h3>

                      {/* Cost per Serving and Package Size */}
                      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 text-xs font-mono">
                        <div>
                          <span className="text-neutral-500 text-[10px] block uppercase">Custo por Dose</span>
                          <span className="font-bold text-emerald-400 text-sm">
                            {product.costPerServingBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-500 text-[10px] block uppercase">Preço / Embalagem</span>
                          <span className="font-semibold text-white">
                            {product.approxPriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{' '}
                            <span className="text-[10px] text-neutral-400">({product.packageSize})</span>
                          </span>
                        </div>
                      </div>

                      {/* Key Ingredient Spec */}
                      <div className="text-xs text-neutral-300 mb-2">
                        <strong className="text-white font-mono text-[11px] block text-neutral-400">Ativo por Porção:</strong>
                        <span className="font-medium">{product.activeIngredientAmount}</span>
                      </div>

                      {/* Lab verification badge */}
                      {product.verifiedLabTested && (
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 font-mono mb-3">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate">{product.labDetails || 'Laudo Laboratorial Conforme'}</span>
                        </div>
                      )}

                      {/* Summary rationale snippet */}
                      <p className="text-[11px] text-neutral-400 leading-relaxed line-clamp-2 mb-3">
                        {product.rankingRationale}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-neutral-900 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => toggleCompare(product.id)}
                        className={`px-3 py-1.5 rounded-xl border font-mono text-[11px] transition-colors cursor-pointer ${
                          isCompared
                            ? 'bg-neutral-800 text-white border-neutral-600'
                            : 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'
                        }`}
                        title="Adicionar ao comparador de rótulos"
                      >
                        {isCompared ? '✓ Comparando' : '+ Comparar'}
                      </button>

                      <button
                        onClick={() => setDossierProduct(product)}
                        className="flex items-center gap-1 px-4 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver Análise Completa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: SIDE-BY-SIDE COMPARATOR (2-3 PRODUCTS) */}
      {mainView === 'comparador' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold font-display text-white">Comparador Direto de Rótulos</h3>
                <p className="text-xs text-neutral-400">
                  Compare lado a lado até 3 produtos da mesma ou de diferentes marcas com análise de pureza e custo.
                </p>
              </div>

              <div className="text-xs font-mono text-neutral-400">
                <span>{comparedProducts.length} de 3 selecionados</span>
              </div>
            </div>
          </div>

          {comparedProducts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-neutral-950 border border-neutral-900 text-neutral-500 font-mono text-xs">
              Nenhum produto selecionado para comparação. Clique em "+ Comparar" nos produtos da lista.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-neutral-950 border border-neutral-800 p-6 shadow-2xl flex flex-col justify-between space-y-5 relative"
                >
                  <button
                    onClick={() => toggleCompare(prod.id)}
                    className="absolute top-5 right-5 p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
                    title="Remover do comparador"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-neutral-900 text-neutral-300 border border-neutral-800">
                        #{prod.rankPosition} {prod.categoryLabel}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        ★ {prod.overallScore}/100
                      </span>
                    </div>

                    <h4 className="text-base font-bold font-display text-white">{prod.name}</h4>
                    <span className="text-xs font-mono text-neutral-400 block mt-0.5">{prod.brand}</span>

                    {/* Cost & Size Metrics */}
                    <div className="mt-4 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Custo por Dose:</span>
                        <strong className="text-emerald-400 text-sm">
                          {prod.costPerServingBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Preço Estimado:</span>
                        <span className="text-white">
                          {prod.approxPriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Rendimento Total:</span>
                        <span className="text-white">{prod.servingsPerContainer} doses</span>
                      </div>
                    </div>

                    {/* Active Amount */}
                    <div className="mt-4 space-y-1 text-xs">
                      <span className="text-neutral-400 font-mono text-[10px] uppercase block">
                        Ingrediente Ativo por Porção:
                      </span>
                      <p className="font-semibold text-white font-mono bg-neutral-900/40 p-2 rounded-xl border border-neutral-800">
                        {prod.activeIngredientAmount}
                      </p>
                    </div>

                    {/* Positives */}
                    <div className="mt-4 space-y-1.5 text-xs">
                      <span className="text-neutral-400 font-mono text-[10px] uppercase block">
                        Pontos Fortes:
                      </span>
                      <ul className="space-y-1 text-neutral-300">
                        {prod.positives.slice(0, 2).map((pos, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{pos}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Limitations */}
                    <div className="mt-3 space-y-1.5 text-xs">
                      <span className="text-neutral-400 font-mono text-[10px] uppercase block">
                        Atenção / Limitações:
                      </span>
                      <ul className="space-y-1 text-neutral-400">
                        {prod.limitations.slice(0, 1).map((lim, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 leading-snug">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                            <span>{lim}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-900 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleAddProductToShopping(prod)}
                      className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
                      title="Salvar na lista de compras"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDossierProduct(prod)}
                      className="flex-1 py-2 px-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-neutral-200 transition-all text-center cursor-pointer shadow-sm"
                    >
                      Ver Ficha Completa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: CIÊNCIA & DOSSIÊS DA SUBSTÂNCIA */}
      {mainView === 'ciencia' && (
        <div className="space-y-6">
          {/* Substance selector pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {INITIAL_SUPPLEMENT_PROFILES.map((prof) => {
              const isSelected = selectedProfileId === prof.id;
              return (
                <button
                  key={prof.id}
                  onClick={() => setSelectedProfileId(prof.id)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-lg scale-105'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {prof.name}
                </button>
              );
            })}
          </div>

          {/* Substance Dossier Card */}
          <div className="rounded-3xl p-6 md:p-8 bg-neutral-950 border border-neutral-800 shadow-2xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-6 border-b border-neutral-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                    {activeProfile.category.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-semibold">
                    {activeProfile.evidenceLevel}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold font-display text-white">
                  {activeProfile.name}
                </h3>
                <span className="text-xs font-mono text-neutral-400 italic">
                  {activeProfile.scientificName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <strong className="text-white text-sm block font-display">Mecanismo Fisiológico de Ação</strong>
                  <p className="text-neutral-300">{activeProfile.howItWorks}</p>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <strong className="text-white text-sm block font-display">Momento Ideal de Consumo</strong>
                  <p className="text-neutral-300 font-mono">{activeProfile.recommendedTiming}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <strong className="text-white text-sm block font-display">Evidências e Consenso Científico</strong>
                  <ul className="space-y-1.5 list-disc list-inside text-neutral-300">
                    {activeProfile.evidenceDetails.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
                  <strong className="text-white text-sm block font-display">Como Ler o Rótulo Corretamente</strong>
                  <ul className="space-y-1.5 list-disc list-inside text-neutral-400">
                    {activeProfile.labelReadingGuide.map((guide, i) => (
                      <li key={i}>{guide}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL PRODUCT DOSSIER MODAL */}
      {dossierProduct && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl relative my-8">
            <button
              onClick={() => setDossierProduct(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
                Ficha Técnica Auditada // {dossierProduct.categoryLabel}
              </span>
              <span className="text-[10px] font-mono text-neutral-500">
                Consulta: {dossierProduct.priceDateConsulted}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {dossierProduct.brand}
                </span>
                <h2 className="text-2xl font-bold font-display text-white">
                  {dossierProduct.name}
                </h2>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-700 self-start sm:self-auto">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <div>
                  <span className="text-xs font-mono text-neutral-400 block uppercase text-[10px]">Nota Geral</span>
                  <span className="text-lg font-extrabold text-white font-mono">{dossierProduct.overallScore}/100</span>
                </div>
              </div>
            </div>

            {/* Why this rank position */}
            <div className="mt-4 p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-1">
              <span className="text-[10px] font-mono uppercase text-neutral-400 font-bold block">
                Avaliação Comparativa & Posição #{dossierProduct.rankPosition}
              </span>
              <p className="text-xs text-neutral-300 leading-relaxed">
                {dossierProduct.rankingRationale}
              </p>
            </div>

            {/* Numerical Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 text-[10px] block uppercase">Custo por Dose</span>
                <span className="font-bold text-emerald-400 text-sm">
                  {dossierProduct.costPerServingBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 text-[10px] block uppercase">Preço Estimado</span>
                <span className="font-bold text-white text-sm">
                  {dossierProduct.approxPriceBRL.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 text-[10px] block uppercase">Porção</span>
                <span className="font-semibold text-white">{dossierProduct.servingSize}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <span className="text-neutral-500 text-[10px] block uppercase">Rendimento</span>
                <span className="font-semibold text-white">{dossierProduct.servingsPerContainer} doses</span>
              </div>
            </div>

            {/* Active Component Details */}
            <div className="p-3.5 rounded-2xl bg-neutral-900/50 border border-neutral-800 text-xs">
              <strong className="text-white block font-mono text-[11px] uppercase mb-1">
                Concentração Ativa do Ingrediente Principal
              </strong>
              <p className="text-neutral-200 font-mono font-medium">{dossierProduct.activeIngredientAmount}</p>
            </div>

            {/* Lab Test Verification */}
            {dossierProduct.verifiedLabTested && (
              <div className="mt-3 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-white font-mono text-[11px]">Controle de Qualidade & Laudos Independentes</strong>
                  <p className="text-emerald-300/90 text-[11px] mt-0.5">{dossierProduct.labDetails}</p>
                </div>
              </div>
            )}

            {/* Positives vs Limitations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <strong className="text-emerald-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  Pontos Positivos Comprovados
                </strong>
                <ul className="space-y-1.5 text-neutral-300">
                  {dossierProduct.positives.map((pos, i) => (
                    <li key={i} className="leading-relaxed">• {pos}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-2">
                <strong className="text-amber-400 font-mono text-[11px] uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Pontos de Atenção & Limitações
                </strong>
                <ul className="space-y-1.5 text-neutral-400">
                  {dossierProduct.limitations.map((lim, i) => (
                    <li key={i} className="leading-relaxed">• {lim}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sources & Official Link */}
            <div className="mt-4 pt-3 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-500">
              <span>Fonte: {dossierProduct.source}</span>
              {dossierProduct.officialUrl && (
                <a
                  href={dossierProduct.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-neutral-300 hover:text-white underline cursor-pointer"
                >
                  <span>Página Oficial da Marca</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
              <button
                onClick={() => handleAddProductToShopping(dossierProduct)}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white rounded-full text-xs font-mono flex items-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Salvar nas Compras</span>
              </button>
              <button
                onClick={() => setDossierProduct(null)}
                className="px-5 py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
              >
                Concluir Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
