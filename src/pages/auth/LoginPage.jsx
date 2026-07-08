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
    } catch (err) {
      showToast(err.message || 'Error al iniciar sesión', 'error')
    } finally {
      setLoading(false)
    }
  }

  const demoLogins = [
    { label: 'Gerencia',    email: 'gerencia@lihuel.com',    color: 'text-accent-DEFAULT' },
    { label: 'Supervisor',  email: 'supervisor@lihuel.com',  color: 'text-warning' },
    { label: 'Maestro',     email: 'maestro@lihuel.com',     color: 'text-success' },
  ]

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-accent-DEFAULT/15
                          flex items-center justify-center mb-4">
            <Building2 size={28} className="text-accent-DEFAULT" />
          </div>
          <h1 className="text-2xl font-bold text-textPrimary tracking-tight">LIHUEL</h1>
          <p className="text-muted text-xs mt-1">Gestión de obras prefabricadas</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="card p-6 space-y-4">
            <h2 className="text-sm font-semibold text-textPrimary">Iniciar sesión</h2>

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
                className="absolute right-3 bottom-3 text-muted hover:text-textPrimary transition-colors"
                aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
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
              <LogIn size={18} />
              Ingresar
            </Button>
          </div>
        </form>

        {/* Demo credentials */}
        <div className="mt-6 card p-4">
          <p className="text-[10px] text-muted font-medium uppercase tracking-wider mb-3">Credenciales de prueba</p>
          <div className="space-y-1">
            {demoLogins.map(d => (
              <button
                key={d.label}
                type="button"
                onClick={() => { setEmail(d.email); setPassword('demo1234') }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                           hover:bg-white/5 transition-colors text-sm"
                id={`demo-${d.label.toLowerCase()}`}
              >
                <span className={`font-medium ${d.color}`}>{d.label}</span>
                <span className="text-muted font-mono text-[10px]">{d.email}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-2 text-center">
            Contraseña: <code className="text-accent-DEFAULT">demo1234</code>
          </p>
        </div>

        <p className="text-center text-[10px] text-muted/60 mt-8">
          © 2026 LIHUEL Construcciones Prefabricadas
        </p>
      </div>

      <ToastContainer />
    </div>
  )
}

export default LoginPage
