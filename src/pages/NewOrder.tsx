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
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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

    if (
      quantity < selectedService.minQuantity ||
      quantity > selectedService.maxQuantity
    ) {
      setError(`Quantidade inválida.`);
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

      let data: any = null;

      // 🔥 Correção principal aqui
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || "Erro inesperado no servidor");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Erro ao processar pedido");
      }

      setSuccess(true);
      setTimeout(() => navigate('/dashboard/history'), 2000);

    } catch (err: any) {
      console.error("ORDER ERROR:", err);
      setError(err.message || "Erro ao processar pedido");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
        <h2 className="text-2xl text-white font-bold">Pedido realizado!</h2>
        <p className="text-zinc-500">Redirecionando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl text-white mb-6">Novo Pedido</h2>

      <form onSubmit={handleOrder} className="space-y-6">

        {error && (
          <div className="text-red-500 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Serviços */}
        {fetchingServices ? (
          <Loader2 className="animate-spin text-white" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedService(service)}
                className={cn(
                  "p-4 border rounded-xl",
                  selectedService?.id === service.id
                    ? "border-emerald-500"
                    : "border-zinc-700"
                )}
              >
                <div className="flex gap-2 items-center">
                  {service.platform === 'Instagram'
                    ? <Instagram />
                    : <Music2 />}
                  <span>{service.name}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* URL */}
        <input
          type="url"
          placeholder="Link"
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          className="w-full p-3 bg-zinc-800 text-white rounded"
          required
        />

        {/* Quantidade */}
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="w-full p-3 bg-zinc-800 text-white rounded"
        />

        {/* Total */}
        <div className="text-white">
          Total: {totalPrice} Kz
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-500 p-3 rounded text-black font-bold"
        >
          {loading ? "Processando..." : "Confirmar Pedido"}
        </button>

      </form>
    </div>
  );
};

export default NewOrder;
