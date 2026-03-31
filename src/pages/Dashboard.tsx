import React, { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Instagram,
  Music2
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Order, Notification } from '../types';
import { cn } from '../lib/utils';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-500/10 flex items-center justify-center border border-${color}-500/20`}>
        <Icon className={`w-6 h-6 text-${color}-500`} />
      </div>
      <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg text-xs font-bold">
        <ArrowUpRight className="w-3 h-3" />
        <span>+12%</span>
      </div>
    </div>
    <p className="text-zinc-500 text-sm font-medium mb-1">{label}</p>
    <p className="text-3xl font-bold text-white">{value}</p>
  </div>
);

const Dashboard = () => {
  const { profile, isAuthReady } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });

  const markAsRead = async (id: string) => {
    try {
      const notifRef = doc(db, 'notifications', id);
      await updateDoc(notifRef, { read: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  useEffect(() => {
    if (!isAuthReady || !profile?.uid) return;

    // Real-time notifications
    const notifRef = collection(db, 'notifications');
    const nq = query(
      notifRef,
      where('userId', '==', auth.currentUser?.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc'),
      limit(3)
    );

    const unsubNotifs = onSnapshot(nq, (snapshot) => {
      if (!isAuthReady) return;
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(notifs);
    }, (error) => {
      if (!auth.currentUser) return;
      handleFirestoreError(error, OperationType.LIST, 'notifications');
    });

    const fetchData = async () => {
      try {
        // Fetch Orders
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef, 
          where('userId', '==', auth.currentUser?.uid),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.LIST, 'orders');
          return;
        }

        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setRecentOrders(orders);

        // Simple count for stats
        const allOrdersQ = query(ordersRef, where('userId', '==', auth.currentUser?.uid));
        let allSnapshot;
        try {
          allSnapshot = await getDocs(allOrdersQ);
        } catch (error) {
          if (!auth.currentUser) return;
          handleFirestoreError(error, OperationType.LIST, 'orders');
          return;
        }

        const all = allSnapshot.docs.map(d => d.data() as Order);
        
        setStats({
          total: all.length,
          active: all.filter(o => o.status === 'pending' || o.status === 'processing').length,
          completed: all.filter(o => o.status === 'completed').length
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      }
    };

    fetchData();

    return () => {
      unsubNotifs();
    };
  }, [profile?.uid, isAuthReady]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Olá, {profile?.displayName}! 👋</h2>
          <p className="text-zinc-500">Bem-vindo ao seu painel de controle.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <TrendingUp className="text-black w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-emerald-500/70 uppercase font-bold tracking-wider">Saldo Disponível</p>
            <p className="text-xl font-black text-emerald-500">{profile?.balance.toLocaleString()} Kz</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard label="Total de Pedidos" value={stats.total} icon={ShoppingBag} color="blue" />
        <StatCard label="Pedidos Ativos" value={stats.active} icon={Clock} color="amber" />
        <StatCard label="Concluídos" value={stats.completed} icon={CheckCircle2} color="emerald" />
      </div>

      {notifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-500" />
            <h3 className="text-xl font-bold text-white">Notificações</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-5 rounded-2xl border backdrop-blur-md relative group transition-all",
                  notif.type === 'abandoned_purchase' ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"
                )}
              >
                <button 
                  onClick={() => markAsRead(notif.id!)}
                  className="absolute top-4 right-4 text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Fechar
                </button>
                <div className="flex gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    notif.type === 'abandoned_purchase' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  )}>
                    {notif.type === 'abandoned_purchase' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{notif.title}</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">{notif.message}</p>
                    {notif.type === 'abandoned_purchase' && (
                      <button className="mt-3 text-[10px] font-black text-amber-500 uppercase tracking-widest hover:text-amber-400 transition-colors">
                        Concluir Agora →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Pedidos Recentes</h3>
            <button className="text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors">Ver todos</button>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl overflow-hidden">
            {recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800/50">
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Serviço</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Preço</th>
                      <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center",
                              order.platform === 'Instagram' ? "bg-pink-500/10 text-pink-500" : "bg-emerald-500/10 text-emerald-500"
                            )}>
                              {order.platform === 'Instagram' ? <Instagram className="w-4 h-4" /> : <Music2 className="w-4 h-4" />}
                            </div>
                            <span className="text-sm font-medium text-zinc-200">{order.serviceName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-zinc-400">{order.quantity.toLocaleString()}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-zinc-200">{order.totalPrice.toLocaleString()} Kz</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                            order.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                            order.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                            order.status === 'processing' ? "bg-blue-500/10 text-blue-500" :
                            "bg-red-500/10 text-red-500"
                          )}>
                            {order.status === 'completed' ? 'Concluído' :
                             order.status === 'pending' ? 'Pendente' :
                             order.status === 'processing' ? 'Processando' : 'Cancelado'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-medium">Você ainda não fez nenhum pedido.</p>
                <button className="mt-4 text-emerald-500 font-bold text-sm">Fazer meu primeiro pedido</button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Dicas de Crescimento</h3>
          <div className="space-y-4">
            {[
              { title: "Melhor horário para postar", desc: "Poste entre 18h e 21h para maior engajamento em Angola." },
              { title: "Use Reels e TikToks curtos", desc: "Vídeos de 15-30 segundos têm 3x mais chance de viralizar." },
              { title: "Consistência é a chave", desc: "Tente postar pelo menos 3 vezes por semana." }
            ].map((tip, i) => (
              <div key={i} className="p-5 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl hover:border-emerald-500/30 transition-colors">
                <h4 className="text-sm font-bold text-zinc-200 mb-2">{tip.title}</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
