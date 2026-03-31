import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Instagram, 
  Music2, 
  ExternalLink,
  Calendar,
  MoreVertical
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import { cn } from '../lib/utils';

const OrderHistory = () => {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.uid) return;

    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', auth.currentUser?.uid),
          orderBy('createdAt', 'desc')
        );
        
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.LIST, 'orders');
          return;
        }

        const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(ordersData);
      } catch (err) {
        console.error("Error fetching order history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [profile?.uid]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Histórico de Pedidos</h2>
          <p className="text-zinc-500">Acompanhe o status de todos os seus pedidos.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-full sm:w-64"
            />
          </div>
          <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-[32px] overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
            <p className="text-zinc-500 font-medium">Carregando seus pedidos...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/50">
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Serviço</th>
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Link / Alvo</th>
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Quantidade</th>
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Preço</th>
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Data</th>
                  <th className="px-8 py-5 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border",
                          order.platform === 'Instagram' ? "bg-pink-500/10 text-pink-500 border-pink-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {order.platform === 'Instagram' ? <Instagram className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-100">{order.serviceName}</p>
                          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{order.platform}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <a 
                        href={order.targetUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors max-w-[150px] truncate"
                      >
                        {order.targetUrl}
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-zinc-300">{order.quantity.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-black text-white">{order.totalPrice.toLocaleString()} Kz</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        order.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        order.status === 'processing' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {order.status === 'completed' ? 'Concluído' :
                         order.status === 'pending' ? 'Pendente' :
                         order.status === 'processing' ? 'Processando' : 'Cancelado'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-zinc-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum pedido encontrado</h3>
            <p className="text-zinc-500 mb-8">Você ainda não realizou nenhum pedido em nossa plataforma.</p>
            <button 
              onClick={() => window.location.href = '/dashboard/new-order'}
              className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all"
            >
              Fazer meu primeiro pedido
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
