import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Instagram, 
  Music2, 
  Zap, 
  Star, 
  ShieldCheck, 
  Headphones, 
  ArrowRight,
  CheckCircle2,
  Users,
  Eye
} from 'lucide-react';

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TrendingUp className="text-white w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-base sm:text-xl font-bold tracking-tight text-white">Seguidores<span className="text-emerald-500">Express</span></span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#servicos" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Serviços</a>
        <a href="#como-funciona" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Como funciona</a>
        <a href="#beneficios" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Benefícios</a>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link to="/login" className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors px-2 sm:px-4 py-2">Login</Link>
        <Link 
          to="/register" 
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap"
        >
          Criar conta
        </Link>
      </div>
    </div>
  </nav>
);

const ServiceCard = ({ icon: Icon, title, price, platform, color, unit = "un", per = "100" }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-zinc-900/50 border border-white/5 p-8 rounded-3xl relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/20 transition-colors`} />
    
    <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 flex items-center justify-center mb-6 border border-${color}-500/20`}>
      <Icon className={`w-7 h-7 text-${color}-500`} />
    </div>

    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">{platform}</span>
    <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
    <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
      Impulsione seu perfil com resultados reais e ativos de forma instantânea.
    </p>

    <div className="flex items-end gap-1 mb-8">
      <span className="text-3xl font-bold text-white">{price} Kz</span>
      <span className="text-zinc-500 text-sm mb-1">/ {per === "1" ? "" : per} {unit}</span>
    </div>

    <Link 
      to="/register" 
      className={`w-full py-4 rounded-2xl bg-zinc-800 hover:bg-${color}-500 hover:text-black font-bold transition-all flex items-center justify-center gap-2 group/btn`}
    >
      Comprar agora
      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
    </Link>
  </motion.div>
);

const Step = ({ number, title, description }: any) => (
  <div className="flex flex-col items-center text-center">
    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl font-bold text-emerald-500 mb-6 relative">
      {number}
      {number !== 4 && (
        <div className="hidden lg:block absolute left-full w-full h-px bg-zinc-800 top-1/2 -translate-y-1/2 ml-8" />
      )}
    </div>
    <h4 className="text-xl font-bold text-white mb-3">{title}</h4>
    <p className="text-zinc-400 text-sm leading-relaxed max-w-[200px]">{description}</p>
  </div>
);

const Home = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-8"
            >
              <Zap className="w-3 h-3 fill-current" />
              Crescimento Instantâneo em Angola
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8"
            >
              IMPULSIONE SUAS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">REDES SOCIAIS</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-zinc-400 mb-12 leading-relaxed max-w-xl"
            >
              Aumente seguidores, curtidas e visualizações de forma rápida, segura e 100% acessível para o mercado angolano.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a 
                href="#servicos" 
                className="w-full sm:w-auto px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10"
              >
                Ver Serviços
              </a>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-16 flex items-center gap-8"
            >
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-black bg-zinc-800 overflow-hidden">
                    <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-white">+5.000 Clientes</p>
                <p className="text-xs text-zinc-500">Satisfeitos em toda Angola</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicos" className="py-32 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Nossos Serviços</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Escolha o pacote ideal para o seu crescimento e veja os resultados em minutos.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              icon={Instagram} 
              title="Seguidores Instagram" 
              price="300" 
              platform="Instagram" 
              color="pink" 
              unit="seguidores"
              per="100"
            />
            <ServiceCard 
              icon={Music2} 
              title="Seguidores TikTok" 
              price="500" 
              platform="TikTok" 
              color="emerald" 
              unit="seguidores"
              per="100"
            />
            <ServiceCard 
              icon={Instagram} 
              title="Curtidas Instagram" 
              price="1.5" 
              platform="Instagram" 
              color="blue" 
              unit="curtida"
              per="1"
            />
            <ServiceCard 
              icon={Eye} 
              title="Visualizações TikTok" 
              price="0.5" 
              platform="TikTok" 
              color="purple" 
              unit="visualização"
              per="1"
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="como-funciona" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Como Funciona?</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">Processo simples e direto para você começar a crescer hoje mesmo.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <Step number="1" title="Criar conta" description="Faça seu cadastro rápido e gratuito na plataforma." />
            <Step number="2" title="Adicionar saldo" description="Faça um depósito via referência bancária." />
            <Step number="3" title="Escolher serviço" description="Selecione o pacote que melhor atende suas necessidades." />
            <Step number="4" title="Receber resultados" description="Veja seus números crescerem em tempo real." />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-32 bg-zinc-950/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Por que escolher a <br /> <span className="text-emerald-500">SeguidoresExpress?</span></h2>
              <div className="space-y-6">
                {[
                  { icon: Zap, title: "Entrega Ultra Rápida", desc: "Seus pedidos começam a ser processados imediatamente após a compra." },
                  { icon: ShieldCheck, title: "Segurança Total", desc: "Não precisamos da sua senha. Apenas o link do perfil ou post." },
                  { icon: Star, title: "Alta Qualidade", desc: "Seguidores com perfis reais e ativos para garantir credibilidade." },
                  { icon: Headphones, title: "Suporte 24/7", desc: "Nossa equipe está sempre pronta para ajudar você em qualquer dúvida." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center">
                      <item.icon className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-zinc-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-[40px] bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                <motion.div 
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-zinc-900 border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10 w-72"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <span className="font-bold">Pedido Concluído</span>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2, delay: 1 }}
                        className="h-full bg-emerald-500" 
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-zinc-500">
                      <span>1.000 SEGUIDORES</span>
                      <span className="text-emerald-500">100%</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Seguidores<span className="text-emerald-500">Express</span></span>
          </div>
          <p className="text-zinc-500 text-sm">© 2026 SeguidoresExpress Angola. Todos os direitos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-zinc-500 hover:text-white transition-colors"><Music2 className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
