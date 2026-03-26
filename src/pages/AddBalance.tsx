import React from 'react';
import { Wallet, ArrowRight, MessageCircle, ExternalLink, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AddBalance = () => {
  const { profile } = useAuth();

  const paymentOptions = [
    {
      amount: 300,
      url: 'https://pay.kuenha.com/3b1deb3a-8860-40f8-9702-b0f8c44214da',
      color: 'blue'
    },
    {
      amount: 500,
      url: 'https://pay.kuenha.com/6df52cf0-d50a-453c-a785-cce012dfb1a7',
      color: 'emerald'
    },
    {
      amount: 1000,
      url: 'https://pay.kuenha.com/f6fb3780-0be1-4e8a-ad80-17877533aaa9',
      color: 'purple'
    }
  ];

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
          <p className="text-zinc-500 font-bold mb-10 uppercase tracking-[0.2em] text-[11px]">Pagamento via Multicaixa Express</p>
          
          <div className="grid grid-cols-1 gap-4 mb-10">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1 mb-2">Selecione um valor:</p>
            {paymentOptions.map((option) => (
              <a 
                key={option.amount}
                href={option.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-zinc-950/50 hover:bg-zinc-900 border border-white/5 hover:border-emerald-500/50 p-6 rounded-3xl flex items-center justify-between transition-all duration-300"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-${option.color}-500/10 flex items-center justify-center border border-${option.color}-500/20`}>
                    <Zap className={`w-6 h-6 text-${option.color}-400`} />
                  </div>
                  <div>
                    <span className="text-2xl font-black text-white block leading-none">{option.amount.toLocaleString('pt-AO')} Kz</span>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Recarga Instantânea</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-emerald-500 flex items-center justify-center transition-all">
                  <ExternalLink className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                </div>
              </a>
            ))}
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
                Clique no valor desejado para abrir o link de pagamento da Kuenha.
              </li>
              <li className="flex gap-4 text-xs text-zinc-400 leading-relaxed">
                <span className="w-6 h-6 rounded-xl bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-white shrink-0 border border-white/5">2</span>
                Realize o pagamento via Multicaixa Express ou Referência.
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
