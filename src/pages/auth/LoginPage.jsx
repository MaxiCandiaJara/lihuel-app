import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react'
import { signIn } from '../../services/supabase'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/FormElements'
import { showToast } from '../../components/ui/Toast'
import { ToastContainer } from '../../components/ui/Toast'
import useAuthStore from '../../store/authStore'

const LoginPage = () => {
  const navigate     = useNavigate()
  const { profile }  = useAuthStore()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)

  // Redirect if already logged in
  if (profile) {
    const routes = { maestro: '/maestro/obras', supervisor: '/supervisor/obras', gerencia: '/gerencia/dashboard' }
    navigate(routes[profile.role] || '/login', { replace: true })
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { showToast('Ingresá email y contraseña', 'warning'); return }
    setLoading(true)
    try {
      const { error } = await signIn(email, password)
      if (error) throw error
      // Auth listener will handle redirect
    } catch (err) {
      showToast(err.message || 'Error al iniciar sesión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const demoLogins = [
    { label: 'Gerencia',    email: 'gerencia@lihuel.com',    role: 'gerencia',    color: 'text-accent-DEFAULT' },
    { label: 'Supervisor',  email: 'supervisor@lihuel.com',  role: 'supervisor',  color: 'text-warning' },
    { label: 'Maestro',     email: 'maestro@lihuel.com',     role: 'maestro',     color: 'text-success' },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-DEFAULT/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-700/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-700/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-DEFAULT to-warning
                          flex items-center justify-center mb-5 shadow-2xl shadow-accent-DEFAULT/30">
            <Building2 size={36} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">LIHUEL APP</h1>
          <p className="text-muted text-sm mt-1">Gestión de obras prefabricadas</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-base font-bold text-textPrimary">Iniciar sesión</h2>

            <Input
              id="login-email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoCapitalize="none"
            />

            <div className="relative">
              <Input
                id="login-password"
                type={showPwd ? 'text' : 'password'}
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 bottom-3 text-muted hover:text-textPrimary"
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
              id="btn-login"
            >
              <LogIn size={20} />
              Ingresar
            </Button>
          </div>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 card p-4">
          <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-3">Demo — credenciales de prueba</p>
          <div className="space-y-2">
            {demoLogins.map(d => (
              <button
                key={d.role}
                type="button"
                onClick={() => { setEmail(d.email); setPassword('demo1234') }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                           hover:bg-surface transition-colors text-sm"
                id={`demo-${d.role}`}
              >
                <span className={`font-bold ${d.color}`}>{d.label}</span>
                <span className="text-muted font-mono text-xs">{d.email}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-2 text-center">Contraseña: <code className="text-accent-DEFAULT">demo1234</code></p>
        </div>

        <p className="text-center text-xs text-muted mt-6">
          © 2026 LIHUEL Construcciones Prefabricadas
        </p>
      </div>

      <ToastContainer />
    </div>
  )
}

export default LoginPage
