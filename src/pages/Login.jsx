import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import loginBg from '../assets/outdoor_living_login.png';

export default function Login() {
  const { login } = useAuth();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const DEMO_USERS = {
    'admin@vanuitambacht.nl': { password: 'admin123', role: 'admin', name: 'Admin User' },
    'partner@vanuitambacht.nl': { password: 'partner123', role: 'partner', name: 'Sven Hoek' },
    'customer@vanuitambacht.nl': { password: 'customer123', role: 'customer', name: 'Customer User' },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (isForgotPassword) {
      if (!email) {
        setError('Please enter your email address.');
        return;
      }
      setResetSent(true);
      return;
    }

    const inputEmail = (email || '').trim().toLowerCase();
    
    // 1. Check static demo accounts
    let user = DEMO_USERS[inputEmail];
    
    // 2. Check dynamic system users created in User Management
    if (!user) {
      try {
        const savedUsers = JSON.parse(localStorage.getItem('app_system_users') || '[]');
        const found = savedUsers.find(u => (u.email || '').trim().toLowerCase() === inputEmail && u.status === 'Actief');
        if (found) {
          user = {
            password: found.password || '123456',
            role: found.role || 'customer',
            name: found.name || 'User'
          };
        }
      } catch (err) {}
    }

    if (user && (user.password === password || (!password && user.password === ''))) {
      login(user.role, user.name);
    } else {
      setError(language === 'EN' ? 'Invalid credentials. Please check your email and password.' : 'Ongeldige inloggegevens. Controleer uw e-mailadres en wachtwoord.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-body relative overflow-hidden">
      {/* Full Background Image */}
      <img
        src={loginBg}
        alt="Vanuit Ambacht Outdoor Kitchen"
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />
      {/* Very light dark overlay so text remains readable, but NO BLUR so image is crystal clear */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Floating Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[420px] bg-[#D6CFC2] rounded-3xl overflow-hidden shadow-2xl border border-white/40 relative z-10"
      >
        <div className="p-6 sm:p-8 flex flex-col items-center">
          <div className="space-y-2.5 flex flex-col items-center text-center w-full mb-6">
            <img 
              src="/logo_brand.png" 
              alt="Vanuit Ambacht Logo" 
              className="h-14 object-contain w-auto mix-blend-multiply mb-2" 
            />
            <div>
              <h2 className="text-xl font-heading font-bold text-primary leading-tight">
                {isForgotPassword ? t('auth.resetPassword') || "Reset Password" : t('auth.loginTitle') || "Welcome back"}
              </h2>
              <p className="text-dark/50 font-body text-xs mt-1">
                {isForgotPassword 
                  ? t('auth.resetInstructions') || "Enter your email to receive a reset link."
                  : t('auth.loginSub') || "Log in to continue to your account."}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <AnimatePresence mode="wait">
              {resetSent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center"
                >
                  <h3 className="font-bold text-sm font-heading">{t('auth.resetSuccessTitle') || "Check your email"}</h3>
                  <p className="text-xs font-body mt-1">{t('auth.resetSuccessDesc') || "If an account exists, a link was sent."}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-4 w-full"
                >
                  {/* Email Field */}
                  <div>
                    <label className="block text-[10px] font-bold font-body text-dark/60 uppercase tracking-wider mb-1">
                      {t('auth.emailLabel') || "Email address"}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('auth.emailPlaceholder') || "name@ambacht.nl"}
                      className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/30 text-dark transition-all duration-300"
                      required
                    />
                  </div>

                  {/* Password Field (Only if NOT forgot password) */}
                  {!isForgotPassword && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[10px] font-bold font-body text-dark/60 uppercase tracking-wider">
                          {t('auth.passwordLabel') || "Password"}
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-[10px] font-bold text-primary hover:text-primary/70 transition-colors font-body"
                        >
                          {t('auth.forgotPassword') || "Forgot Password?"}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder={t('auth.passwordPlaceholder') || "••••••••"}
                          className="w-full px-3 py-2 bg-white border border-[#D6CFC2] rounded-xl text-xs font-body focus:outline-none focus:ring-2 focus:ring-primary/30 text-dark pr-10 transition-all duration-300"
                          required={!isForgotPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark/70 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-[11px] font-body text-center">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-primary text-cream py-2.5 rounded-xl font-body font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 tracking-wide text-sm mt-2"
                  >
                    {isForgotPassword ? (t('auth.sendResetLink') || "Send Reset Link") : (t('auth.signInButton') || "Log In")}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Back to Login Button */}
            {(isForgotPassword || resetSent) && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setResetSent(false);
                  setError('');
                  setPassword('');
                }}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold text-dark/60 hover:text-primary transition-colors mt-4"
              >
                <ArrowLeft className="w-3 h-3" />
                {t('auth.backToLogin') || "Back to Login"}
              </button>
            )}
          </form>

          {/* Quick Demo Login (Will be removed in production per client requirement) */}
          {!isForgotPassword && !resetSent && (
            <div className="w-full pt-5 mt-5 border-t border-[#C4BEB3]/40">
              <p className="text-[9px] font-bold text-dark/40 uppercase tracking-widest mb-3 text-center font-body">Quick Demo Login</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { email: 'admin@vanuitambacht.nl', pass: 'admin123', name: 'Admin', initials: 'AD' },
                  { email: 'partner@vanuitambacht.nl', pass: 'partner123', name: 'Partner', initials: 'SH' },
                  { email: 'customer@vanuitambacht.nl', pass: 'customer123', name: language === 'EN' ? 'Customer' : 'Klant', initials: language === 'EN' ? 'CU' : 'KL' },
                ].map((u, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setEmail(u.email); setPassword(u.pass); }}
                    className="flex flex-row items-center justify-center p-2 gap-1.5 bg-white border border-[#D6CFC2] rounded-xl hover:border-primary/30 hover:bg-[#F8F7F4] transition-all shadow-sm cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[8px] flex-shrink-0">
                      {u.initials}
                    </div>
                    <p className="text-[10px] font-bold text-dark leading-none">{u.name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
