import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    company: '', password: '', password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.password_confirmation) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/register', form)
      await api.post('/api/login', {
        email: form.email,
        password: form.password,
      })
      const { data } = await api.get('/api/me')
      setUser(data.user)
      navigate('/member/dashboard')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } }
      const errors = e.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0] as string[]
        setError(first[0])
      } else {
        setError(e.response?.data?.message || 'Erreur lors de l\'inscription')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6 py-12 relative overflow-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .font-display { font-family: 'Syne', sans-serif; }
        .mesh-bg {
          background:
            radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99,102,241,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 80%, rgba(16,185,129,0.08) 0%, transparent 60%);
        }
        .border-subtle { border: 1px solid rgba(255,255,255,0.06); }
        .btn-primary {
          background: linear-gradient(135deg, #6366f1, #4f46e5);
          transition: all 0.2s ease;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(99,102,241,0.4);
        }
        .accent-gradient {
          background: linear-gradient(135deg, #6366f1, #10b981);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .input-field {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: white;
          transition: all 0.2s ease;
        }
        .input-field:focus {
          outline: none;
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeup { animation: fadeUp 0.6s ease both; }
        .animate-fadeup-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .animate-fadeup-2 { animation: fadeUp 0.6s 0.2s ease both; }
      `}</style>

      {/* Background */}
      <div className="mesh-bg fixed inset-0 pointer-events-none" />
      <div className="fixed top-20 right-20 w-64 h-64 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
      <div className="fixed bottom-20 left-20 w-48 h-48 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-8 animate-fadeup">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-xl btn-primary flex items-center justify-center text-sm font-bold text-white">
              C
            </div>
            <span className="font-display font-semibold text-white text-lg">
              CoWork<span className="accent-gradient">Space</span>
            </span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-white/30 text-sm">
            Rejoignez notre communauté de professionnels
          </p>
        </div>

        {/* Carte */}
        <div className="border-subtle rounded-3xl p-8 animate-fadeup-1"
          style={{ background: 'rgba(255,255,255,0.02)' }}>

          {error && (
            <div className="mb-6 p-4 rounded-2xl text-sm text-red-400"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/50 mb-2">
                  Nom complet
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Votre nom"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm text-white/50 mb-2">
                  Adresse email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Téléphone
                </label>
                <input
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="+221 77 000 00 00"
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Entreprise
                </label>
                <input
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Votre startup"
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Min. 8 caractères"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm text-white/50 mb-2">
                  Confirmer
                </label>
                <input
                  type="password"
                  value={form.password_confirmation}
                  onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                  className="input-field w-full rounded-xl px-4 py-3 text-sm"
                  placeholder="Répéter"
                  required
                />
              </div>
            </div>

            {/* Avantages */}
            <div className="rounded-2xl p-4 mt-2"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
              <p className="text-xs text-indigo-300/60 mb-2">En rejoignant CoWorkSpace :</p>
              <div className="space-y-1">
                {[
                  'Accès immédiat à tous nos espaces',
                  'Réservation en ligne 24h/24',
                  'Paiement sécurisé en ligne',
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/30">
                    <span className="text-emerald-400">✓</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte →'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-white/20 text-xs">ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <p className="text-center text-sm text-white/30">
            Déjà un compte ?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Se connecter
            </Link>
          </p>
        </div>

        {/* Retour */}
        <div className="text-center mt-6 animate-fadeup-2">
          <Link
            to="/"
            className="text-white/20 hover:text-white/50 transition-colors text-xs"
          >
            ← Retour à l'accueil
          </Link>
        </div>

      </div>
    </div>
  )
}