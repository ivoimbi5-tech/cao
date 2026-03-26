import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { TrendingUp, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { auth } from '../firebase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas ou erro de configuração do Firebase. Verifique se o seu email e senha estão corretos e se o domínio está autorizado no console do Firebase.');
      } else if (err.code === 'auth/user-not-found') {
        setError('Usuário não encontrado. Por favor, crie uma conta.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Senha incorreta. Por favor, tente novamente.');
      } else {
        setError('Erro ao entrar na conta. Por favor, tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-md w-full relative">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Seguidores<span className="text-emerald-500">Express</span></span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">Bem-vindo de volta</h1>
          <p className="text-zinc-500">Entre na sua conta para gerenciar seus pedidos.</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/5 p-6 sm:p-8 rounded-[32px] backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-5 sm:space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-zinc-400">Senha</label>
                <a href="#" className="text-xs font-bold text-emerald-500 hover:text-emerald-400">Esqueceu a senha?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Entrar na conta
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-zinc-500 text-sm">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-emerald-500 font-bold hover:text-emerald-400">Criar conta agora</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
