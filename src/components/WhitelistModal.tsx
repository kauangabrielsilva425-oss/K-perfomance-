import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Check, Shield, UserPlus, X, Trash2 } from 'lucide-react';

interface WhitelistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhitelistModal: React.FC<WhitelistModalProps> = ({ isOpen, onClose }) => {
  const { authorizedEmails, updateWhitelistEmails, isAdmin } = useAuth();
  const [emails, setEmails] = useState<string[]>(authorizedEmails);
  const [newEmail, setNewEmail] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const clean = newEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) {
      setErrorMessage('Digite um endereço de e-mail válido.');
      return;
    }
    if (emails.includes(clean)) {
      setErrorMessage('Este e-mail já está na lista autorizada.');
      return;
    }
    if (emails.length >= 5) {
      setErrorMessage('Limite da lista privada atingido.');
      return;
    }
    const updated = [...emails, clean];
    setEmails(updated);
    setNewEmail('');
  };

  const handleRemove = (emailToRemove: string) => {
    if (emailToRemove === 'kauangabrielsilva777@gmail.com') {
      setErrorMessage('O e-mail do proprietário principal não pode ser removido.');
      return;
    }
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  const handleSave = async () => {
    setErrorMessage(null);
    try {
      await updateWhitelistEmails(emails);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage('Erro ao salvar no Firestore: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-neutral-950 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">
            Segurança & Controle de Acesso
          </span>
        </div>

        <h2 className="text-xl font-bold font-display text-white">
          E-mails com Permissão de Acesso
        </h2>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Configure os e-mails autorizados a acessar a plataforma privada K PERFORMANCE (você e seu amigo).
        </p>

        {errorMessage && (
          <div className="my-3 p-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        {saveSuccess && (
          <div className="my-3 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Permissões atualizadas com sucesso!</span>
          </div>
        )}

        {/* Existing List */}
        <div className="mt-4 space-y-2">
          <span className="text-[10px] font-mono uppercase text-neutral-500 block">
            E-mails Atualmente Autorizados ({emails.length}):
          </span>
          {emails.map((em, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center justify-between text-xs"
            >
              <span className="font-mono text-white truncate max-w-[240px]">{em}</span>
              {em === 'kauangabrielsilva777@gmail.com' ? (
                <span className="text-[10px] font-mono text-emerald-400 uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                  Proprietário
                </span>
              ) : (
                <button
                  onClick={() => handleRemove(em)}
                  className="p-1 text-neutral-500 hover:text-red-400 cursor-pointer"
                  title="Remover e-mail"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleAddEmail} className="mt-4 pt-3 border-t border-neutral-900 flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="email.amigo@exemplo.com"
            className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-mono flex items-center gap-1 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        </form>

        <div className="mt-6 pt-3 border-t border-neutral-900 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-neutral-800 rounded-full text-xs text-neutral-400 hover:text-white cursor-pointer"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-neutral-200 cursor-pointer shadow-sm"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};
