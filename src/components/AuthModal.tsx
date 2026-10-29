import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    signInGoogle,
    signInEmail,
    signUpEmail,
    resetPassword,
    logout,
    authError,
    clearAuthError,
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAuthError();
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await signInEmail(email, password);
        onClose();
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('As senhas não coincidem.');
        }
        await signUpEmail(email, password);
        setSuccessMessage('Conta criada com sucesso! Você já está autenticado.');
        setTimeout(() => onClose(), 1200);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMessage('E-mail de redefinição enviado! Verifique sua caixa de entrada.');
      }
    } catch (err: any) {
      // Handled by context state or local error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    clearAuthError();
    setIsSubmitting(true);
    try {
      await signInGoogle();
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center font-display font-black text-black text-xs">
            K
          </div>
          <span className="font-display font-bold text-sm tracking-wider text-white">
            K PERFORMANCE
          </span>
        </div>

        <h2 className="text-2xl font-bold font-display text-white">
          {mode === 'login' && 'Entrar na Plataforma'}
          {mode === 'signup' && 'Criar Nova Conta'}
          {mode === 'reset' && 'Redefinir Senha'}
        </h2>
        <p className="text-neutral-400 text-xs mt-1">
          {mode === 'login' && 'Acesse seus treinos, planos alimentares e histórico seguro.'}
          {mode === 'signup' && 'Cadastre suas credenciais para sincronização em nuvem.'}
          {mode === 'reset' && 'Informe seu e-mail para receber as instruções de recuperação.'}
        </p>

        {/* Google Authentication Button */}
        {mode !== 'reset' && (
          <div className="mt-5">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 rounded-2xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm active:scale-98 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-neutral-800 flex-1" />
              <span className="text-[10px] font-mono uppercase text-neutral-500">ou com e-mail</span>
              <div className="h-px bg-neutral-800 flex-1" />
            </div>
          </div>
        )}

        {/* Error / Success Alerts */}
        {authError && (
          <div className="my-3 p-3 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {successMessage && (
          <div className="my-3 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-[11px] font-mono text-neutral-400 block mb-1">E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@exemplo.com"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-neutral-400">Senha</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      clearAuthError();
                    }}
                    className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-mono text-neutral-400 block mb-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita sua senha"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-neutral-200 transition-all cursor-pointer shadow-md disabled:opacity-50 active:scale-98 mt-2"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Processando...</span>
              </span>
            ) : mode === 'login' ? (
              'Entrar'
            ) : mode === 'signup' ? (
              'Criar Minha Conta'
            ) : (
              'Enviar Link de Redefinição'
            )}
          </button>
        </form>

        {/* Footer Mode Switchers */}
        <div className="pt-4 mt-4 border-t border-neutral-900 text-center text-xs">
          {mode === 'login' ? (
            <p className="text-neutral-400">
              Não possui uma conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  clearAuthError();
                }}
                className="text-white font-semibold underline underline-offset-2 cursor-pointer ml-1"
              >
                Cadastre-se gratuitamente
              </button>
            </p>
          ) : (
            <p className="text-neutral-400">
              Já possui conta?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  clearAuthError();
                }}
                className="text-white font-semibold underline underline-offset-2 cursor-pointer ml-1"
              >
                Fazer login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Access Restriction Barrier Component
export const UnauthorizedBarrier: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-neutral-950 border border-neutral-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 px-2 py-0.5 rounded-full bg-white/5">
            Ambiente Privado // Acesso Restrito
          </span>
          <h2 className="text-2xl font-bold font-display text-white mt-2">
            Conta Não Autorizada
          </h2>
          <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
            A plataforma <strong>K PERFORMANCE</strong> está configurada em modo de uso pessoal e restrito aos e-mails autorizados.
          </p>
        </div>

        <div className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-300">
          <span className="text-[10px] text-neutral-500 block">E-mail autenticado:</span>
          <span className="font-bold text-white break-all">{user?.email}</span>
        </div>

        <p className="text-[11px] text-neutral-500">
          Caso você seja o proprietário ou o convidado autorizado, certifique-se de entrar com o e-mail cadastrado na lista de permissões.
        </p>

        <div className="pt-2">
          <button
            onClick={() => logout()}
            className="w-full py-2.5 px-4 bg-white text-black font-bold text-xs uppercase tracking-wider rounded-full hover:bg-neutral-200 transition-all cursor-pointer"
          >
            Sair e Trocar de Conta
          </button>
        </div>
      </div>
    </div>
  );
};
