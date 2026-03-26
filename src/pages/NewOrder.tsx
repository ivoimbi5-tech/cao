import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Instagram, 
  Music2, 
  Link as LinkIcon, 
  Hash, 
  CreditCard, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { INITIAL_SERVICES } from '../constants';
import { Service, Order } from '../types';
import { cn } from '../lib/utils';

const NewOrder = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const totalPrice = selectedService ? selectedService.pricePerUnit * (quantity / 100) : 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedService) return;

    if (profile.balance < totalPrice) {
      setError('Saldo insuficiente. Por favor, adicione saldo à sua conta.');
      return;
    }

    if (quantity < selectedService.minQuantity || quantity > selectedService.maxQuantity) {
      setError(`Quantidade inválida. Mínimo: ${selectedService.minQuantity}, Máximo: ${selectedService.maxQuantity}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.uid,
          serviceId: selectedService.id,
          providerServiceId: selectedService.providerServiceId,
          targetUrl,
          quantity,
          totalPrice
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao processar pedido');
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/history'), 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao processar seu pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Pedido Realizado!</h2>
        <p className="text-zinc-500 mb-8">Seu pedido foi processado com sucesso e começará em breve.</p>
        <p className="text-sm text-zinc-600">Redirecionando para o histórico...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-white mb-2">Novo Pedido</h2>
        <p className="text-zinc-500">Escolha o serviço e impulsione seu perfil agora.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 p-8 rounded-[32px] shadow-2xl">
        <form onSubmit={handleOrder} className="space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Service Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-400 ml-1 uppercase tracking-widest">Selecione o Serviço</label>
            <div className="grid sm:grid-cols-2 gap-4">
              {INITIAL_SERVICES.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setSelectedService(service)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all text-left group relative overflow-hidden",
                    selectedService?.id === service.id 
                      ? "bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/50" 
                      : "bg-zinc-800/50 border-white/5 hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center",
                      service.platform === 'Instagram' ? "bg-pink-500/10 text-pink-500" : "bg-emerald-500/10 text-emerald-500"
                    )}>
                      {service.platform === 'Instagram' ? <Instagram className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{service.platform}</span>
                  </div>
                  <h4 className="font-bold text-zinc-100 mb-1">{service.name}</h4>
                  <p className="text-xs text-zinc-500">
                    {service.id.includes('follower') 
                      ? `${service.pricePerUnit} Kz / 100 un` 
                      : `${service.pricePerUnit / 100} Kz / un`}
                  </p>
                  
                  {selectedService?.id === service.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Target URL */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 ml-1 uppercase tracking-widest">Link do Perfil ou Post</label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="url"
                required
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                placeholder="https://instagram.com/seu-perfil"
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-zinc-400 ml-1 uppercase tracking-widest">Quantidade</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <input
                type="number"
                required
                min={selectedService?.minQuantity || 10}
                max={selectedService?.maxQuantity || 10000}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full bg-zinc-800/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
            </div>
            {selectedService && (
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-2 ml-1">
                Mínimo: {selectedService.minQuantity} | Máximo: {selectedService.maxQuantity}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="p-6 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500 font-medium">Preço Total</span>
              <span className="text-2xl font-black text-emerald-500">{totalPrice.toLocaleString()} Kz</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-zinc-800/50">
              <span className="text-sm text-zinc-500 font-medium">Seu Saldo</span>
              <span className={cn(
                "text-sm font-bold",
                (profile?.balance || 0) < totalPrice ? "text-red-500" : "text-zinc-300"
              )}>
                {profile?.balance.toLocaleString()} Kz
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedService || (profile?.balance || 0) < totalPrice}
            className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Confirmar Pedido
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewOrder;
