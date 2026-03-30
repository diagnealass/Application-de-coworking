import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../../lib/axios'

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false)
  const [count, setCount] = useState({ espaces: 23, membres: 135, reservations: 432 })

  const { data: spaces } = useQuery({
    queryKey: ['public-spaces'],
    queryFn: async () => {
      const res = await api.get('/api/public/spaces')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) ?? []
    },
  })

  const { data: membersCount } = useQuery({
    queryKey: ['public-members-count'],
    queryFn: async () => {
      const res = await api.get('/api/public/members/count')
      return res.data.count ?? 0
    },
  })

  const { data: reservationsCount } = useQuery({
    queryKey: ['public-reservations-count'],
    queryFn: async () => {
      const res = await api.get('/api/public/reservations/count')
      return res.data.count ?? 0
    },
  })

  const { data: equipments } = useQuery({
    queryKey: ['public-equipments'],
    queryFn: async () => {
      const res = await api.get('/api/public/equipments')
      const result = res.data
      return (Array.isArray(result) ? result : result.data) ?? []
    },
  })

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (spaces && membersCount !== undefined && reservationsCount !== undefined) {
      const targets = { espaces: spaces.length, membres: membersCount, reservations: reservationsCount }
      const duration = 1500
      const steps = 40
      const interval = duration / steps
      let step = 0
      const timer = setInterval(() => {
        step++
        const progress = step / steps
        setCount({
          espaces:      Math.round(targets.espaces * progress),
          membres:      Math.round(targets.membres * progress),
          reservations: Math.round(targets.reservations * progress),
        })
        if (step >= steps) clearInterval(timer)
      }, interval)
      return () => clearInterval(timer)
    }
  }, [spaces, membersCount, reservationsCount])
  

  const features = [
    {
      icon: '◈',
      title: 'Espaces flexibles',
      desc: 'Des bureaux privés, salles de réunion et open spaces adaptés à chaque besoin, réservables à l\'heure.',
    },
    {
      icon: '◎',
      title: 'Équipements premium',
      desc: 'Projecteurs, visioconférence, impression — tout ce qu\'il faut pour travailler efficacement.',
    },
    {
      icon: '◐',
      title: 'Réservation instantanée',
      desc: 'Réservez en quelques clics, payez en ligne et recevez une confirmation immédiate.',
    },
    {
      icon: '◉',
      title: 'Communauté startup',
      desc: 'Rejoignez un écosystème de entrepreneurs, freelances et innovateurs qui grandissent ensemble.',
    },
  ]

  const testimonials = [
    {
      name: 'Aminata Diallo',
      role: 'CEO, TechDakar',
      text: 'Un espace qui a transformé notre façon de travailler. L\'ambiance et les équipements sont au top.',
    },
    {
      name: 'Moussa Sarr',
      role: 'Freelance Designer',
      text: 'Je réserve mes espaces en 2 minutes. Simple, rapide, professionnel. Exactement ce dont j\'avais besoin.',
    },
    {
      name: 'Fatou Ndiaye',
      role: 'Fondatrice, AgriTech SN',
      text: 'Les salles de réunion sont parfaites pour nos pitchs clients. On revient chaque semaine.',
    },
  ]

  const statusColor: Record<string, string> = {
    available:   'bg-emerald-500',
    unavailable: 'bg-red-500',
    maintenance: 'bg-amber-500',
  }

  const statusLabel: Record<string, string> = {
    available:   'Disponible',
    unavailable: 'Indisponible',
    maintenance: 'Maintenance',
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white overflow-x-hidden">

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .grain {
          position: fixed; inset: 0; pointer-events: none; z-index: 100; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }
        .glow { box-shadow: 0 0 60px rgba(99, 102, 241, 0.15); }
        .card-hover { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.3); }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-fadeup { animation: fadeUp 0.8s ease forwards; }
        .animate-fadeup-delay-1 { animation: fadeUp 0.8s 0.15s ease both; }
        .animate-fadeup-delay-2 { animation: fadeUp 0.8s 0.3s ease both; }
        .animate-fadeup-delay-3 { animation: fadeUp 0.8s 0.45s ease both; }
        .mesh {
          background:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16,185,129,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 40% 60% at 60% 40%, rgba(245,158,11,0.05) 0%, transparent 50%);
        }
        .border-subtle { border: 1px solid rgba(255,255,255,0.06); }
        .text-gradient {
          background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .accent-gradient {
          background: linear-gradient(135deg, #6366f1, #10b981);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          transition: all 0.2s ease;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 25px rgba(99,102,241,0.4); }
        .pill { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
      `}</style>

      {/* Grain overlay */}
      <div className="grain" />

      {/* Background mesh */}
      <div className="mesh fixed inset-0 pointer-events-none" />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0A0A0F]/90 backdrop-blur-md border-b border-white/5'
          : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg btn-primary flex items-center justify-center text-sm font-bold">
              C
            </div>
            <span className="font-display font-700 text-white text-lg">
              CoWork<span className="accent-gradient">Space</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/50">
            <a href="#espaces" className="hover:text-white transition-colors">Espaces</a>
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#temoignages" className="hover:text-white transition-colors">Témoignages</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="btn-primary text-sm text-white px-5 py-2.5 rounded-xl font-medium"
            >
              Commencer
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-5xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 pill px-4 py-2 rounded-full text-sm text-indigo-300 mb-8 animate-fadeup">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Dakar, Sénégal — Espaces disponibles maintenant
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-800 leading-none mb-6 animate-fadeup-delay-1">
            <span className="text-gradient">L'espace de travail</span>
            <br />
            <span className="accent-gradient">qu'attendent</span>
            <br />
            <span className="text-gradient">vos ambitions</span>
          </h1>

          <p className="text-white/40 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeup-delay-2">
            Des espaces flexibles et inspirants pour startups, freelances et équipes
            qui veulent aller plus loin. Réservez en ligne, travaillez librement.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fadeup-delay-3">
            <Link
    to="/register"
    className="btn-primary text-white px-8 py-4 rounded-2xl font-medium text-base inline-block"
  >
    Réserver un espace →
  </Link>

  {/* 2. Pour une ancre (scroll) sur la MÊME page (#espaces) */}
  <a
    href="#espaces"
    className="text-white/50 hover:text-white transition-colors text-sm px-6 py-4 border border-white/10 rounded-2xl hover:border-white/20 inline-block"
  >
    Voir les espaces
  </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-20 animate-fadeup-delay-3">
            {[
              { value: count.espaces,      label: 'Espaces',      suffix: '+'  },
              { value: count.membres,      label: 'Membres',      suffix: '+'  },
              { value: count.reservations, label: 'Réservations', suffix: '+'  },
            ].map(({ value, label, suffix }) => (
              <div key={label} className="text-center">
                <p className="font-display text-3xl font-700 text-white">
                  {value}{suffix}
                </p>
                <p className="text-white/30 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section id="fonctionnalites" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">
              Pourquoi nous choisir
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-700 text-gradient">
              Tout ce qu'il vous faut
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div
                key={i}
                className="border-subtle rounded-2xl p-6 bg-white/[0.02] card-hover"
              >
                <div className="text-3xl mb-4 text-indigo-400">{f.icon}</div>
                <h3 className="font-display font-600 text-white text-lg mb-2">
                  {f.title}
                </h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Espaces */}
      <section id="espaces" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">
                Nos espaces
              </p>
              <h2 className="font-display text-4xl md:text-5xl font-700 text-gradient">
                Trouvez votre lieu
              </h2>
            </div>
            <Link
              to="/register"
              className="hidden md:block text-sm text-white/40 hover:text-white transition-colors border-subtle px-4 py-2 rounded-xl hover:border-white/20"
            >
              Tout voir →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {spaces?.slice(0, 6).map((space: any) => (
              <div
                key={space.id}
                className="border-subtle rounded-2xl p-6 bg-white/[0.02] card-hover group"
              >
                {/* Disponibilité */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-display font-700 text-white ${
                      space.is_currently_reserved ? 'bg-red-500/20' : 'bg-emerald-500/20'
                    }`}
                  >
                    {space.name.charAt(0)}
                  </div>
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-white ${
                      space.is_currently_reserved
                        ? 'bg-red-500/20 text-red-400'
                        : statusColor[space.status]
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                      space.is_currently_reserved ? 'bg-red-400' : 'bg-emerald-400'
                    }`} />
                    {space.is_currently_reserved ? 'Réservé' : statusLabel[space.status]}
                  </span>
                </div>

                <h3 className="font-display font-600 text-white text-lg mb-1">
                  {space.name}
                </h3>
                <p className="text-white/30 text-sm mb-4 line-clamp-2">
                  {space.description}
                </p>

                {/* Info réservation en cours */}
                {space.is_currently_reserved && space.active_reservation && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-xs text-red-400 mb-4">
                    Occupé jusqu'au {space.active_reservation.end_at}
                  </div>
                )}

                {/* Prochaine réservation */}
                {!space.is_currently_reserved && space.next_reservation && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 text-xs text-amber-400 mb-4">
                    Prochaine réservation : {space.next_reservation.start_at}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-white/30 mb-4">
                  <span>{space.capacity} personnes</span>
                  <span>{space.location}</span>
                </div>

                {/* Équipements */}
                {space.equipments?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {space.equipments.slice(0, 3).map((eq: any) => (
                      <span
                        key={eq.id}
                        className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40 border border-white/5"
                      >
                        {eq.name}
                      </span>
                    ))}
                    {space.equipments.length > 3 && (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 text-white/40">
                        +{space.equipments.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div>
                    <span className="font-display font-700 text-white text-lg">
                      {Number(space.price_per_hour).toLocaleString()}
                    </span>
                    <span className="text-white/30 text-xs ml-1">FCFA/h</span>
                  </div>
                  <Link
                    to="/register"
                    className={`text-sm px-4 py-2 rounded-xl font-medium transition-all ${
                      space.is_currently_reserved || space.status !== 'available'
                        ? 'text-white/20 cursor-not-allowed'
                        : 'btn-primary text-white'
                    }`}
                  >
                    {space.is_currently_reserved ? 'Indisponible' : 'Réserver'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipements */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">
              Équipements
            </p>
            <h2 className="font-display text-4xl font-700 text-gradient">
              Tout est inclus
            </h2>
            <p className="text-white/30 mt-4 max-w-md mx-auto text-sm">
              Chaque espace est équipé pour vous permettre de travailler
              sans interruption dès votre arrivée.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {equipments?.map((eq: any) => (
              <div
                key={eq.id}
                className="border-subtle rounded-2xl p-5 text-center bg-white/[0.02] card-hover"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-indigo-400 font-display font-700">
                    {eq.name.charAt(0)}
                  </span>
                </div>
                <p className="text-white/70 text-sm font-medium">{eq.name}</p>
                <p className="text-white/20 text-xs mt-1">Qté : {eq.quantity}</p>
                <span className={`inline-block mt-2 w-1.5 h-1.5 rounded-full ${
                  eq.status === 'available' ? 'bg-emerald-400' : 'bg-red-400'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour les startups */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="border-subtle rounded-3xl p-10 md:p-16 bg-white/[0.02] glow relative overflow-hidden">
            <div className="absolute inset-0 mesh opacity-50 pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-4">
                  Pour les startups
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-700 text-gradient leading-tight mb-6">
                  Grandissez sans contraintes
                </h2>
                <p className="text-white/40 leading-relaxed mb-8 text-sm">
                  Que vous soyez 1 ou 20, nos espaces s'adaptent à votre croissance.
                  Pas de bail longue durée, pas d'investissement en équipement —
                  concentrez-vous sur votre produit, on s'occupe du reste.
                </p>
                <div className="space-y-3">
                  {[
                    'Réservation flexible à l\'heure ou à la journée',
                    'Accès immédiat sans engagement',
                    'Équipements inclus sans surcoût',
                    'Communauté d\'entrepreneurs disponible',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-white/50">
                      <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs flex-shrink-0">
                        ✓
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <Link
                  to="/register"
                  className="inline-block btn-primary text-white px-8 py-4 rounded-2xl font-medium mt-8 text-sm"
                >
                  Rejoindre la communauté →
                </Link>
              </div>

              <div className="space-y-3">
                {[
                  { label: 'Économies vs bureau traditionnel', value: '70%', color: 'text-emerald-400' },
                  { label: 'Temps moyen de réservation',       value: '2 min', color: 'text-indigo-400' },
                  { label: 'Satisfaction membres',             value: '98%',  color: 'text-amber-400'  },
                ].map(({ label, value, color }) => (
                  <div
                    key={label}
                    className="border-subtle rounded-2xl p-5 bg-white/[0.03] flex items-center justify-between"
                  >
                    <span className="text-white/40 text-sm">{label}</span>
                    <span className={`font-display font-700 text-2xl ${color}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoignages" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-medium tracking-widest uppercase mb-3">
              Témoignages
            </p>
            <h2 className="font-display text-4xl font-700 text-gradient">
              Ils nous font confiance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="border-subtle rounded-2xl p-6 bg-white/[0.02] card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, s) => (
                    <span key={s} className="text-amber-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-display font-700">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">{t.name}</p>
                    <p className="text-white/30 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-6xl font-700 text-gradient mb-6">
            Prêt à commencer ?
          </h2>
          <p className="text-white/30 text-lg mb-10">
            Rejoignez des centaines d'entrepreneurs qui ont choisi
            CoWorkSpace pour développer leur activité.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              to="/register"
              className="btn-primary text-white px-10 py-4 rounded-2xl font-medium text-base"
            >
              Créer mon compte gratuitement
            </Link>
            <Link
              to="/login"
              className="text-white/40 hover:text-white transition-colors text-sm px-6 py-4 border-subtle rounded-2xl hover:border-white/20"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg btn-primary flex items-center justify-center text-xs font-bold">
              C
            </div>
            <span className="font-display font-600 text-white/60 text-sm">
              CoWorkSpace
            </span>
          </div>
          <p className="text-white/20 text-xs">
            © 2026 CoWorkSpace — Dakar, Sénégal. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-white/20">
            <Link to="/login" className="hover:text-white/50 transition-colors">
              Connexion
            </Link>
            <Link to="/register" className="hover:text-white/50 transition-colors">
              Inscription
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}