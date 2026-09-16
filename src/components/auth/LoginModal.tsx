import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/db';
import { LutherRoseIcon } from '../common/LutherRoseIcon';
import {
  X,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  Church,
  KeyRound,
  CheckCircle2,
  Sparkles,
  Award,
  BookOpen,
} from 'lucide-react';

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onOpenRegister: () => void;
  onOpenForgot?: () => void;
  onOpenForgotPassword?: () => void;
  initialRole?: 'admin' | 'student';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  onClose,
  onOpenRegister,
  onOpenForgot,
  onOpenForgotPassword,
  initialRole = 'admin',
}) => {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<'admin' | 'student'>(initialRole);

  // Admin credentials state
  const [adminEmail, setAdminEmail] = useState('evertonfigur75@gmail.com');
  const [adminPassword, setAdminPassword] = useState('pastor123');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Student credentials state
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (isOpen === false) return null;

  const handleForgot = () => {
    if (onOpenForgot) onOpenForgot();
    else if (onOpenForgotPassword) onOpenForgotPassword();
  };

  const handleAdminSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(adminEmail.trim(), adminPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'Credenciais de administrador incorretas.');
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await login(studentEmail.trim(), studentPassword);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setError(res.message || 'E-mail ou senha de aluno incorretos.');
    }
  };

  const handleQuickStudentLogin = (email: string, pass: string) => {
    setStudentEmail(email);
    setStudentPassword(pass);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 border border-slate-200/80 my-8">
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1e3a5f] to-slate-900 text-white p-6 relative">
          <button
            id="btn-close-login-modal"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <LutherRoseIcon size={46} />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold mb-1">
                <Church className="w-3 h-3" />
                <span>Paróquia Evangélica Luterana</span>
              </div>
              <h2 className="text-xl font-bold font-display tracking-wide">
                Entrar no Sistema
              </h2>
              <p className="text-xs text-amber-100/80">
                Acesso ao Ensino Confirmatório & Profissão de Fé
              </p>
            </div>
          </div>

          {/* Profile Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 bg-slate-950/40 p-1 rounded-2xl border border-white/10">
            <button
              id="tab-login-admin"
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Pastor / Administrador</span>
            </button>

            <button
              id="tab-login-student"
              type="button"
              onClick={() => {
                setActiveTab('student');
                setError(null);
              }}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                activeTab === 'student'
                  ? 'bg-white text-[#1e3a5f] shadow-md scale-[1.02]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Aluno / Estudante</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: PERFIL DO ADMINISTRADOR (PASTOR EVERTON FIGUR) */}
          {activeTab === 'admin' && (
            <div className="space-y-5 animate-in fade-in">
              {/* Administrator Profile Card */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-amber-50 via-amber-50/50 to-orange-50 border border-amber-200/80 shadow-xs relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80"
                      alt="Pastor Everton Figur"
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500 shadow-sm"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs"
                      title="Administrador Verificado"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-900 text-[10px] font-extrabold uppercase tracking-wide">
                      <Sparkles className="w-3 h-3 text-amber-700" />
                      <span>Perfil de Administrador</span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display truncate">
                      Pastor Everton Figur
                    </h3>

                    <p className="text-xs font-semibold text-amber-800">
                      Pastor da Paróquia Evangélica Luterana
                    </p>

                    <p className="text-[11px] text-slate-600 truncate">
                      evertonfigur75@gmail.com • (55) 99999-0000
                    </p>
                  </div>
                </div>

                {/* Pastor Privileges */}
                <div className="mt-3 pt-3 border-t border-amber-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-700 font-medium">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Homologar Matrículas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Validar 24 Cultos</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Catecismo Menor</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Relatórios Paroquiais</span>
                  </div>
                </div>
              </div>

              {/* Login Form for Pastor Everton Figur */}
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    E-mail do Administrador
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <input
                      id="input-admin-email"
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Senha de Acesso
                    </label>
                    <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-full">
                      Credencial pré-configurada
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-amber-700 absolute left-3 top-3.5" />
                    <input
                      id="input-admin-password"
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-slate-300 text-sm font-medium text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Senha padrão configurada: <span className="font-mono font-bold text-slate-700">pastor123</span>
                  </p>
                </div>

                {/* Main Action Button */}
                <button
                  id="btn-login-as-pastor"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 font-bold text-sm hover:from-amber-600 hover:to-amber-600 active:scale-98 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {loading ? 'Autenticando Pastor...' : 'Entrar como Pastor Everton Figur'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: PERFIL DO ALUNO (ESTUDANTE) */}
          {activeTab === 'student' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200 text-xs text-sky-900 flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-sky-700 shrink-0" />
                <span>
                  Área exclusiva para alunos matriculados no Ensino Confirmatório ou Profissão de Fé.
                </span>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    E-mail do Aluno
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="input-student-email"
                      type="email"
                      required
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="aluno@exemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-xs font-medium text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="input-student-password"
                      type={showStudentPassword ? 'text' : 'password'}
                      required
                      value={studentPassword}
                      onChange={(e) => setStudentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStudentPassword(!showStudentPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700 p-0.5"
                    >
                      {showStudentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="btn-login-student-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#162a45] active:scale-98 transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{loading ? 'Acessando...' : 'Entrar como Aluno'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Fast Demo Students Switcher */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
                  Acesso Rápido para Alunos de Demonstração
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickStudentLogin('mateus.confirmando@exemplo.com', 'aluno123')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      studentEmail === 'mateus.confirmando@exemplo.com'
                        ? 'bg-amber-50 border-amber-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800">Mateus Silva</div>
                    <div className="text-[10px] text-amber-700 font-semibold">Ensino Confirmatório</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">aluno123</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickStudentLogin('ana.profissao@exemplo.com', 'aluno123')}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      studentEmail === 'ana.profissao@exemplo.com'
                        ? 'bg-sky-50 border-sky-300'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-800">Ana Paula Santos</div>
                    <div className="text-[10px] text-sky-700 font-semibold">Profissão de Fé</div>
                    <div className="text-[9px] text-slate-400 font-mono mt-0.5">aluno123</div>
                  </button>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-600">
                  Ainda não tem cadastro?{' '}
                  <button
                    type="button"
                    onClick={onOpenRegister}
                    className="font-bold text-amber-700 hover:underline"
                  >
                    Criar cadastro de aluno
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
