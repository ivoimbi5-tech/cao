import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const PaymentProcessing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const amount = searchParams.get('amount');
  const txId = searchParams.get('txId');
  const processedRef = useRef(false);

  useEffect(() => {
    if (!profile || !amount) {
      navigate('/dashboard/add-balance');
      return;
    }

    if (processedRef.current) return;
    processedRef.current = true;

    const processPayment = async () => {
      try {
        // Wait 3 seconds as requested
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Call backend to update balance
        const response = await fetch('/api/payments/simulate-success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: profile.uid,
            amount: Number(amount),
            transactionId: txId
          }),
        });

        if (response.ok) {
          setStatus('success');
          // Wait 2 more seconds to show success message before redirecting
          setTimeout(() => {
            navigate('/dashboard?payment=success');
          }, 2000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to process simulated payment:', errorData);
          navigate(`/dashboard/add-balance?error=${encodeURIComponent(errorData.message || 'simulation_failed')}`);
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        navigate('/dashboard/add-balance?error=internal_error');
      }
    };

    processPayment();
  }, [profile, amount, navigate]);

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-zinc-900/50 border border-white/5 p-10 rounded-[40px] backdrop-blur-xl shadow-2xl text-center relative z-10"
      >
        {status === 'processing' ? (
          <>
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 mx-auto border border-emerald-500/20">
              <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Processando <span className="text-emerald-500">Pagamento</span></h2>
            <p className="text-zinc-400 mb-6">Aguarde um momento enquanto confirmamos sua recarga de:</p>
            <div className="text-4xl font-black text-white mb-8">
              {Number(amount).toLocaleString('pt-AO')} <span className="text-emerald-500">Kz</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-zinc-500 text-sm font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4 text-emerald-500" />
              Seguro & Instantâneo
            </div>
          </>
        ) : (
          <>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="w-10 h-10 text-black" />
            </motion.div>
            <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Carregamento <span className="text-emerald-500">Feito!</span></h2>
            <p className="text-zinc-400 mb-8">Seu saldo foi atualizado com sucesso. Redirecionando...</p>
            <div className="text-2xl font-black text-emerald-500">
              + {Number(amount).toLocaleString('pt-AO')} Kz
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PaymentProcessing;
