import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, MessageCircle, Zap, Loader2, CreditCard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AddBalance = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulatedPayment = async () => {
    if (!profile) return;
    
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 100) {
      setError('O valor mínimo para depósito é 100 Kz');
      return;
    }

    setLoading(true);
    setError(null);

    // Generate a unique transaction ID
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Redirect to simulation page
    navigate(`/payment-processing?amount=${numAmount}&txId=${transactionId}`);
  };

  const handleWhatsAppSupport = () => {
    if (!profile) return;
    const message = `Olá! Preciso de ajuda com uma recarga de saldo.%0A%0A*Detalhes:*%0A- Cliente: ${profile.displayName || profile.email}%0A- ID: ${profile.uid}`;
    const whatsappUrl = `https://wa.me/244923000000?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-zinc-900/50 p-6 sm:p-10 rounded-[40px] border border-white/5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 border border-emerald-500/20">
            <Wallet className="w-8 h-8 text-emerald-500" />
          </div>
          
          <h2 className="text-4xl font-black text-white mb-3 tracking-tight">Recarregar <span className="text-emerald-500">Saldo</span></h2>
          <p className="text-zinc-500 font-bold mb-10 uppercase tracking-[0.2em] text-[11px]">Pagamento Instantâneo via Multicaixa</p>
          
          <div className="space-y-8 mb-10">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Selecione o Valor do Depósito</label>
              <div className="grid grid-cols-3 gap-4">
                {[300, 500, 1000].map((val) => (
                  <button
                    key={val}
                    onClick={() => {
                      setAmount(val.toString());
                      setError(null);
                    }}
                    className={`py-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                      amount === val.toString()
                        ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/10 hover:bg-zinc-900/50'
                    }`}
                  >
                    <span className={`text-2xl font-black ${amount === val.toString() ? 'text-emerald-500' : 'text-zinc-300'}`}>
                      {val}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Kwanza</span>
                  </button>
                ))}
              </div>
              
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                  <p className="text-red-500 text-xs font-bold leading-relaxed">{error}</p>
                </div>
              )}
            </div>

            <button
              onClick={handleSimulatedPayment}
              disabled={loading || !amount}
              className="w-full py-6 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-3xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10"
            >
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <CreditCard className="w-6 h-6" />
                  PAGAR {amount ? `${amount} Kz` : ''} AGORA
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
          
          <div className="pt-8 border-t border-white/5">
            <button 
              onClick={handleWhatsAppSupport}
              className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all group"
            >
              <MessageCircle className="w-5 h-5 text-emerald-500" />
              OUTROS VALORES / SUPORTE
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform opacity-50" />
            </button>
          </div>

          <div className="mt-10 p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
            <h4 className="text-emerald-500 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
              <Zap className="w-4 h-4" />
              Instruções
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-4 text-xs text-zinc-400 leading-relaxed">
                <span className="w-6 h-6 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5">1</span>
                Selecione um dos valores fixos disponíveis (300, 500 ou 1000 Kz).
              </li>
              <li className="flex gap-4 text-xs text-zinc-400 leading-relaxed">
                <span className="w-6 h-6 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5">2</span>
                Clique em "PAGAR AGORA" para processar sua recarga.
              </li>
              <li className="flex gap-4 text-xs text-zinc-400 leading-relaxed">
                <span className="w-6 h-6 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5">3</span>
                O saldo será adicionado automaticamente à sua conta após a confirmação.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBalance;
