import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'
import api from '../../lib/axios'

export default function LoginPage() {
  const { setUser } = useAuthStore()
  const navigate = useNavigate()
  const { register, handleSubmit } = useForm()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: { email: string; password: string }) => {
    setError('')
    setLoading(true)
    try {
      await api.get('/sanctum/csrf-cookie')
      await api.post('/api/login', { email: data.email, password: data.password })
      const { data: userData } = await api.get('/api/me')
      setUser(userData.user)
      if (userData.user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/member/dashboard')
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } }
      setError(error.response?.data?.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center px-6 relative overflow-hidden">

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
        .pill { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); }
      `}</style>

      {/* Background */}
      <div className="mesh-bg fixed inset-0 pointer-events-none" />

      {/* Cercles décoratifs */}
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
            Bon retour !
          </h1>
          <p className="text-white/30 text-sm">
            Connectez-vous pour accéder à votre espace
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm text-white/50 mb-2">
                Adresse email
              </label>
              <input
                {...register('email')}
                type="email"
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-white/50 mb-2">
                Mot de passe
              </label>
              <input
                {...register('password')}
                type="password"
                className="input-field w-full rounded-xl px-4 py-3 text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-white py-3.5 rounded-xl text-sm font-medium disabled:opacity-50 mt-2"
            >
              {loading ? 'Connexion en cours...' : 'Se connecter →'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
            <span className="text-white/20 text-xs">ou</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          </div>

          <p className="text-center text-sm text-white/30">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
            >
              Créer un compte
            </Link>
          </p>
        </div>

        {/* Hint admin */}
        <div className="mt-4 text-center animate-fadeup-2">
          <span className="pill px-3 py-1.5 rounded-full text-xs text-indigo-300/60">
            Admin : Alassane DIAGNE
          </span>
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