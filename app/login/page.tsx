'use client'
import { LoginScreen } from '../../src/screens/LoginScreen'

export default function LoginPage() {
  const handleLogin = () => {
    // This will be handled by the LoginScreen component
  }

  return <LoginScreen onLogin={handleLogin} />
}