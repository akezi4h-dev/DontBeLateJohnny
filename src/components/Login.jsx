import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // signin | signup
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    if (mode === 'signin') {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else setInfo('Check your email to confirm your account.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1
            className="text-5xl font-black text-white mb-2 tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Shift Stack
          </h1>
          <p className="text-white/35 text-sm">All your shifts, one screen.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            autoComplete="email"
            className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            className="w-full bg-[#1a1a1a] rounded-xl px-4 py-3.5 text-white placeholder-white/25 outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm"
          />

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          {info && <p className="text-green-400 text-sm text-center">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold rounded-xl py-4 transition-all active:scale-95 disabled:opacity-50 text-sm"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-white/30 text-sm mt-6">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo('') }}
            className="text-white/70 underline underline-offset-2"
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}
