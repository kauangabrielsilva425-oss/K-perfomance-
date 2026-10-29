import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Check,
  CheckCircle2,
  Circle,
  Copy,
  Plus,
  RefreshCw,
  Share2,
  ShoppingCart,
  Trash2,
  Utensils,
} from 'lucide-react';
import { ShoppingItem } from '../types';

const CATEGORY_LABELS: Record<ShoppingItem['category'], string> = {
  hortifruti: 'Hortifrúti (Frutas & Legumes)',
  carnes_ovos: 'Açougue, Ovos & Pescados',
  graos_mercearia: 'Grãos, Cereais & Mercearia',
  laticinios_bebidas: 'Laticínios, Ovos & Bebidas',
  suplementos_outros: 'Suplementação & Especiais',
};

export const ShoppingList: React.FC = () => {
  const {
    shoppingList,
    toggleShoppingItem,
    addShoppingItem,
    deleteShoppingItem,
    clearBoughtItems,
    generateShoppingListFromMealPlan,
  } = useApp();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCat, setNewItemCat] = useState<ShoppingItem['category']>('hortifruti');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  const totalItems = shoppingList.length;
  const completedItems = shoppingList.filter((i) => i.checked).length;
  const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    addShoppingItem({
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1 unid',
      category: newItemCat,
      fromMealPlanner: false,
    });

    setNewItemName('');
    setNewItemQty('');
    setIsAddingItem(false);
  };

  const handleCopyFormattedList = () => {
    let text = `🛒 *K PERFORMANCE — LISTA DE COMPRAS*\n\n`;

    const categories = Object.keys(CATEGORY_LABELS) as ShoppingItem['category'][];
    categories.forEach((cat) => {
      const itemsInCat = shoppingList.filter((i) => i.category === cat);
      if (itemsInCat.length > 0) {
        text += `*${CATEGORY_LABELS[cat]}*\n`;
        itemsInCat.forEach((i) => {
          text += `[${i.checked ? 'X' : ' '}] ${i.name} — ${i.quantity}\n`;
        });
        text += `\n`;
      }
    });

    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/10">
            Logística & Mercado // Otimizado para Celular
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight text-white mt-2">
            Lista de Compras
          </h1>
          <p className="text-neutral-400 text-sm max-w-xl mt-1">
            Organize sua ida ao mercado com base no planejamento semanal de refeições. Marque os itens no carrinho sem complicações.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={generateShoppingListFromMealPlan}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-800 bg-neutral-900 text-neutral-300 hover:text-white text-xs font-semibold hover:border-neutral-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar do Cardápio</span>
          </button>
          <button
            onClick={handleCopyFormattedList}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-all cursor-pointer shadow-md"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Copiar p/ WhatsApp</span>
          </button>
        </div>
      </div>

      {copiedToast && (
        <div className="p-3 bg-neutral-900 border border-emerald-500/40 rounded-2xl text-xs font-mono text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Lista formatada copiada para a área de transferência!</span>
        </div>
      )}

      {/* Shopping Progress Summary */}
      <div className="p-6 rounded-3xl bg-neutral-950 border border-white/10 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block mb-1">
            ITENS NO CARRINHO
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">
              {completedItems} de {totalItems}
            </span>
            <span className="text-xs font-mono text-neutral-400">({progressPercent}% concluído)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddingItem(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Item Manual</span>
          </button>

          {completedItems > 0 && (
            <button
              onClick={clearBoughtItems}
              className="text-xs text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              Limpar itens marcados
            </button>
          )}
        </div>
      </div>

      {/* Manual Item Add Form Modal */}
      {isAddingItem && (
        <form
          onSubmit={handleAddNewItem}
          className="p-5 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-3 shadow-xl"
        >
          <h3 className="text-sm font-bold font-display text-white">Adicionar Item à Lista</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1">Nome do Produto</label>
              <input
                type="text"
                placeholder="Ex: Canela em pó, Castanhas, Iogurte"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white"
                required
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Quantidade Estimada</label>
              <input
                type="text"
                placeholder="Ex: 500g, 2 potes, 1 dúzia"
                value={newItemQty}
                onChange={(e) => setNewItemQty(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="text-neutral-400 block mb-1">Categoria de Mercado</label>
              <select
                value={newItemCat}
                onChange={(e) => setNewItemCat(e.target.value as any)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-2.5 text-white"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200"
            >
              Salvar Item
            </button>
          </div>
        </form>
      )}

      {/* Grouped Shopping Categories */}
      <div className="space-y-6">
        {(Object.keys(CATEGORY_LABELS) as ShoppingItem['category'][]).map((catKey) => {
          const items = shoppingList.filter((item) => item.category === catKey);
          if (items.length === 0) return null;

          return (
            <div
              key={catKey}
              className="rounded-3xl bg-neutral-950 border border-white/10 p-5 md:p-6 shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
                <h3 className="text-base font-bold font-display text-white">{CATEGORY_LABELS[catKey]}</h3>
                <span className="text-xs font-mono text-neutral-500">
                  {items.filter((i) => i.checked).length} / {items.length} itens
                </span>
              </div>

              <div className="divide-y divide-white/5">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleShoppingItem(item.id)}
                    className="py-3 px-2 flex items-center justify-between cursor-pointer hover:bg-neutral-900/40 rounded-xl transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 text-neutral-400 group-hover:text-white">
                        {item.checked ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5 text-neutral-600" />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-sm font-medium block transition-all ${
                            item.checked ? 'line-through text-neutral-600' : 'text-white'
                          }`}
                        >
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">
                          Quantidade: <strong className="text-neutral-300 font-normal">{item.quantity}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteShoppingItem(item.id);
                      }}
                      className="p-1.5 text-neutral-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Excluir item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {totalItems === 0 && (
        <div className="p-12 text-center rounded-3xl bg-neutral-950 border border-neutral-800">
          <ShoppingCart className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">Sua lista de compras está vazia</h3>
          <p className="text-xs text-neutral-500 mb-4 max-w-sm mx-auto">
            Clique em "Atualizar do Cardápio" para gerar automaticamente com os alimentos da sua dieta planejada.
          </p>
          <button
            onClick={generateShoppingListFromMealPlan}
            className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-full hover:bg-neutral-200"
          >
            Gerar a partir do Planejador de Refeições
          </button>
        </div>
      )}
    </div>
  );
};
