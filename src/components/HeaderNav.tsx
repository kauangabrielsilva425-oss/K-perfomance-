import React, { useState, useRef, useEffect } from 'react';
import { useApp, AppTab } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Calendar,
  Compass,
  Dumbbell,
  Flame,
  LayoutDashboard,
  Menu,
  Pill,
  Play,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  Utensils,
  X,
  BookOpen,
  Cloud,
  RefreshCw,
  Shield,
  LogOut,
  LogIn,
} from 'lucide-react';

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Início', icon: Compass },
  { id: 'desempenho', label: 'Meu Desempenho', icon: LayoutDashboard },
  { id: 'rotina', label: 'Minha Rotina', icon: Dumbbell },
  { id: 'treino_vivo', label: 'Treino ao Vivo', icon: Activity },
  { id: 'alimentacao', label: 'Alimentação', icon: Utensils },
  { id: 'nutricao_guia', label: 'Guias Nutricionais', icon: BookOpen },
  { id: 'catalogo', label: 'Catálogo de Alimentos', icon: Flame },
  { id: 'compras', label: 'Lista de Compras', icon: ShoppingCart },
  { id: 'suplementacao', label: 'Suplementos & Rankings', icon: Pill },
  { id: 'evolucao', label: 'Evolução Física', icon: TrendingUp },
  { id: 'calendario', label: 'Calendário & Hábitos', icon: Calendar },
];

export const HeaderNav: React.FC = () => {
  const { currentTab, setCurrentTab, activeWorkout, activeRoutine, startWorkout, isCloudSyncing } = useApp();
  const { user, isAdmin, setIsAuthModalOpen, setIsWhitelistModalOpen, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const formatElapsed = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickStart = () => {
    if (activeWorkout) {
      setCurrentTab('treino_vivo');
    } else if (activeRoutine && activeRoutine.sessions.length > 0) {
      startWorkout(activeRoutine.sessions[0]);
    } else {
      setCurrentTab('rotina');
    }
  };

  return (
    <>
      <header className="sticky top-3 z-50 px-3 md:px-6 w-full max-w-7xl mx-auto">
        <nav
          className="flex items-center justify-between bg-neutral-950/90 border border-white/10 rounded-full px-3 py-2 md:px-4 md:py-2.5 shadow-2xl backdrop-blur-xl transition-all"
          aria-label="Navegação Principal"
        >
          {/* Brand Logo Minimalist */}
          <button
            onClick={() => {
              setCurrentTab('home');
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
            aria-label="Ir para a Página Inicial K Performance"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-700 flex items-center justify-center font-display font-black text-black text-sm shadow-[0_0_12px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform">
              K
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-display font-bold text-xs tracking-wider text-white leading-tight">
                K PERFORMANCE
              </span>
              <span className="text-[9px] font-mono tracking-widest text-neutral-400 uppercase">
                Systems & Science
              </span>
            </div>
          </button>

          {/* Center Pill Desktop Navigation: ONLY ICONS with Tooltips */}
          <div className="hidden md:flex items-center gap-1 bg-black/70 border border-white/10 rounded-full px-2 py-1 shadow-inner">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <div key={item.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsUserMenuOpen(false);
                    }}
                    aria-label={item.label}
                    title={item.label}
                    className={`w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isActive
                        ? 'bg-white text-black shadow-[0_0_14px_rgba(255,255,255,0.3)] scale-105 font-bold'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/90'
                    }`}
                  >
                    <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                    {isActive && <span className="sr-only">(Seção ativa)</span>}
                  </button>

                  {/* Elegant Floating Tooltip on Hover */}
                  <div
                    role="tooltip"
                    className="absolute -bottom-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-95 group-hover:scale-100 bg-neutral-950/98 border border-neutral-700 text-white text-[10px] font-mono tracking-wider px-2.5 py-1 rounded-md shadow-2xl whitespace-nowrap z-50"
                  >
                    {item.label}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-neutral-950 border-t border-l border-neutral-700 rotate-45" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Action Bar: Quick Start + Sync/Auth + Mobile Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Active Workout Pill OR Minimalist Treinar Button */}
            {activeWorkout ? (
              <button
                onClick={() => setCurrentTab('treino_vivo')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 border border-emerald-500/50 rounded-full text-xs font-mono text-emerald-400 hover:bg-neutral-800 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer"
                title="Sessão em andamento. Clique para retornar ao treino."
                aria-label="Retornar ao treino em andamento"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold">{formatElapsed(activeWorkout.elapsedSeconds)}</span>
                <span className="hidden sm:inline text-neutral-300 text-[10px]">Ao Vivo</span>
              </button>
            ) : (
              <div className="relative group">
                <button
                  onClick={handleQuickStart}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-full text-xs font-bold tracking-wider uppercase hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer shadow-sm"
                  aria-label="Iniciar treino agora"
                  title="Iniciar treino agora"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span className="hidden sm:inline text-[11px]">Treinar</span>
                </button>
                <div
                  role="tooltip"
                  className="absolute -bottom-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-95 group-hover:scale-100 bg-neutral-950/98 border border-neutral-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50"
                >
                  Iniciar Treino do Dia
                </div>
              </div>
            )}

            {/* Cloud Sync & User Profile Control */}
            <div className="relative" ref={userMenuRef}>
              {user ? (
                <div>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                    className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 cursor-pointer transition-colors"
                    title={`Conectado como ${user.email}`}
                    aria-label="Menu do Usuário"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-500 text-black font-bold text-xs flex items-center justify-center">
                      {(user.email?.[0] || 'K').toUpperCase()}
                    </div>
                    {isCloudSyncing ? (
                      <RefreshCw className="w-3 h-3 text-neutral-400 animate-spin" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-neutral-950/98 border border-neutral-800 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="pb-2.5 border-b border-neutral-800">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                          Conta Autenticada
                        </span>
                        <span className="text-xs font-bold text-white break-all">{user.email}</span>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Firestore Cloud Sync Ativo</span>
                        </div>
                      </div>

                      <div className="py-2 space-y-1">
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsWhitelistModalOpen(true);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-200 hover:bg-neutral-900 transition-colors cursor-pointer text-left"
                          >
                            <Shield className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Gerenciar Acessos (Whitelist)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Desconectar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                    aria-label="Entrar na conta"
                    title="Entrar na conta para sincronização em nuvem"
                  >
                    <LogIn className="w-3.5 h-3.5 text-neutral-400" />
                    <span className="hidden sm:inline">Entrar</span>
                  </button>
                  <div
                    role="tooltip"
                    className="absolute -bottom-9 right-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 transform scale-95 group-hover:scale-100 bg-neutral-950/98 border border-neutral-700 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xl whitespace-nowrap z-50"
                  >
                    Sincronização em Nuvem
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Drawer Trigger */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-neutral-300 hover:text-white rounded-full hover:bg-neutral-900 border border-neutral-800 cursor-pointer"
                aria-label="Abrir Menu com Todas as Seções"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Navigation Modal: Full labeled list for mobile clarity */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex justify-end animate-in fade-in duration-150">
          <div className="w-[88%] max-w-sm h-full bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-display font-black text-black text-xs">
                    K
                  </div>
                  <span className="font-display font-bold text-sm tracking-wider text-white">
                    K PERFORMANCE
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 border border-neutral-800 cursor-pointer"
                  aria-label="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Auth Status Card */}
              <div className="mt-4 p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800">
                {user ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-white text-black font-bold text-xs flex items-center justify-center shrink-0">
                          {(user.email?.[0] || 'U').toUpperCase()}
                        </div>
                        <span className="text-xs font-mono text-white truncate">{user.email}</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Sincronizado" />
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setIsWhitelistModalOpen(true);
                        }}
                        className="w-full text-left py-1.5 px-2 text-[11px] font-medium text-neutral-300 hover:text-white flex items-center gap-2 rounded-lg hover:bg-neutral-800 cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Gerenciar Acessos (Whitelist)</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-1 px-2 text-[11px] font-medium text-red-400 hover:text-red-300 flex items-center gap-2 rounded-lg hover:bg-red-950/20 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair da conta</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full py-2 px-3 bg-white text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-neutral-200"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Entrar / Sincronizar Nuvem</span>
                  </button>
                )}
              </div>

              {/* Workout Alert if Running */}
              {activeWorkout && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                      Sessão em Andamento
                    </span>
                    <span className="text-xs font-medium text-white">{activeWorkout.sessionName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setCurrentTab('treino_vivo');
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1 bg-emerald-600 text-white text-xs font-mono rounded-lg hover:bg-emerald-500"
                  >
                    {formatElapsed(activeWorkout.elapsedSeconds)}
                  </button>
                </div>
              )}

              {/* Complete Section List with Icons & Labels */}
              <div className="mt-5 space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-2 block mb-2">
                  Seções da Plataforma
                </span>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-neutral-800 text-white font-semibold border border-neutral-700 shadow-sm'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-neutral-900 text-[11px] font-mono text-neutral-500 flex flex-col gap-1">
              <span>K PERFORMANCE PLATFORM</span>
              <span className="text-neutral-600">Engenharia corporal & alta precisão</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
