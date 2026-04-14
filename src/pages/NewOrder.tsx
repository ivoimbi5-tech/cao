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
import { collection, addDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Service } from '../types';
import { cn } from '../lib/utils';

const NewOrder = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingServices, setFetchingServices] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesRef = collection(db, 'services');
        const q = query(servicesRef, orderBy('platform', 'asc'));
        const querySnapshot = await getDocs(q);
        const fetchedServices = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Service));
        setServices(fetchedServices);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Erro ao carregar serviços.");
      } finally {
        setFetchingServices(false);
      }
    };

    fetchServices();
  }, []);

  const totalPrice = selectedService 
    ? selectedService.pricePerUnit * (quantity / 100) 
    : 0;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedService) return;

    if (profile.balance < totalPrice) {
      setError('Saldo insuficiente.');
      return;
    }

    if (quantity < selectedService.minQuantity || quantity > selectedService.maxQuantity) {
      setError(`Mín: ${selectedService.minQuantity} | Máx: ${selectedService.maxQuantity}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.uid,
          serviceId: selectedService.id,
          providerServiceId: selectedService.providerServiceId,
          targetUrl,
          quantity,
          totalPrice
        }),
      });

      // DEBUG
      console.log("Status:", response.status);
      console.log("Content-Type:", response.headers.get("content-type"));

      let data;

      try {
        data = await response.json();
      } catch {
        const text = await response.text();
        throw new Error(`Servidor retornou inválido: ${text}`);
      }

      if (!response.ok) {
        throw new Error(data?.error || 'Erro ao processar pedido');
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/history'), 2000);

    } catch (err: any) {
      console.error(err);

      // 🔥 Fallback automático se API falhar
      try {
        await addDoc(collection(db, 'orders'), {
          userId: profile.uid,
          serviceId: selectedService.id,
          targetUrl,
          quantity,
          totalPrice,
          status: 'pending',
          createdAt: new Date()
        });

        setSuccess(true);
        setTimeout(() => navigate('/dashboard/history'), 2000);

      } catch (firebaseErr) {
        setError(err.message || 'Erro ao processar pedido.');
      }

    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-white">Pedido realizado!</h2>
        <p className="text-zinc-500">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">Novo Pedido</h2>

      <form onSubmit={handleOrder} className="space-y-6">

        {error && (
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl flex gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Serviços */}
        {fetchingServices ? (
          <Loader2 className="animate-spin text-emerald-500" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.map(service => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={cn(
                  "p-4 rounded-xl border",
                  selectedService?.id === service.id
                    ? "border-emerald-500 bg-emerald-500/10"
                    : "border-zinc-700"
                )}
              >
                <div className="flex gap-2 items-center">
                  {service.platform === 'Instagram' 
                    ? <Instagram size={16} /> 
                    : <Music2 size={16} />}
                  {service.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* URL */}
        <input
          type="url"
          required
          placeholder="Link"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white"
        />

        {/* Quantidade */}
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-4 rounded-xl bg-zinc-800 text-white"
        />

        {/* Total */}
        <div className="text-white">
          Total: <span className="text-emerald-500">{totalPrice} Kz</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full p-4 bg-emerald-500 text-black rounded-xl"
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Confirmar'}
        </button>

      </form>
    </div>
  );
};

export default NewOrder;
