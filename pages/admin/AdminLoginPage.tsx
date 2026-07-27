
import React, { useState } from 'react';
import { Lock, Mail, LoaderCircle, AlertCircle, ChevronLeft, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { useAppStore } from '../../store';

const AdminLoginPage: React.FC = () => {
  const { login, resetAdminPassword } = useAppStore(state => ({
    login: state.login,
    resetAdminPassword: state.resetAdminPassword
  }));
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isReseting, setIsReseting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    await login(email, password);
    setIsLoggingIn(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (isReseting) return;
    
    const confirm = window.confirm("Are you sure you want to retrieve your access credentials? Your current email and password will be sent to your registered email.");
    if (!confirm) return;

    setIsReseting(true);
    const success = await resetAdminPassword(email);
    if (success) setIsResetMode(false);
    setIsReseting(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#E7E7E7] p-4 relative overflow-hidden font-admin">
      {/* Minimalist Background Accents */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-stone-100 rounded-none -mr-64 -mt-64 blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-stone-50 rounded-none -ml-32 -mb-32 blur-[100px]"></div>

      <div className="w-full max-w-sm p-10 space-y-8 bg-white border border-stone-200 rounded-none shadow-[0_30px_100px_rgba(0,0,0,0.04)] relative z-10 overflow-hidden">
        
        <div className="text-center relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-none bg-stone-900 text-white font-black text-xl mb-6 shadow-xl shadow-stone-200 font-admin">
            SZ
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight font-admin">
            {isResetMode ? 'Retrieve Access' : 'SAZO Admin'}
          </h1>
          <p className="mt-2 text-[9px] font-black text-stone-500 uppercase tracking-[0.4em]">
            {isResetMode ? 'Retrieve Credentials via Email' : 'Administrative Logistics Terminal'}
          </p>
        </div>

        <form onSubmit={isResetMode ? handleReset : handleSubmit} className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-300 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sazo.com"
                className="w-full bg-stone-50 border border-stone-200 p-4 pl-12 rounded-none text-stone-900 placeholder:text-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 transition-all duration-300 outline-none text-xs font-bold"
                required
              />
            </div>
          </div>

          {!isResetMode && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-stone-500 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-300 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-200 p-4 pl-12 pr-12 rounded-none text-stone-900 placeholder:text-stone-300 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 transition-all duration-300 outline-none text-xs font-bold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-300 hover:text-stone-900 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {isResetMode && (
            <div className="p-4 bg-stone-50 border border-stone-100 rounded-none flex gap-3 items-start animate-fadeIn">
                <ShieldAlert className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                <p className="text-[9px] font-bold text-stone-500 leading-relaxed uppercase tracking-tight">
                    Your current email and password will be sent to your primary registered email address.
                </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || isReseting}
            className={`w-full py-5 rounded-none font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95 flex justify-center items-center gap-2 disabled:opacity-50
              ${isResetMode 
                ? 'bg-stone-500 hover:bg-stone-600 text-white' 
                : 'bg-stone-900 hover:bg-black text-white shadow-xl shadow-stone-200'}
            `}
          >
            {isLoggingIn || isReseting ? (
              <LoaderCircle className="w-5 h-5 animate-spin" />
            ) : (
              isResetMode ? 'Retrieve Credentials' : 'Authenticate'
            )}
          </button>
        </form>

        <div className="pt-2 text-center relative z-10">
          <button 
            type="button" 
            onClick={() => setIsResetMode(!isResetMode)}
            className="group inline-flex items-center gap-2 text-[9px] font-black text-stone-500 hover:text-stone-950 transition-all uppercase tracking-widest p-2"
          >
            {isResetMode ? (
              <>
                <ChevronLeft className="w-3.5 h-3.5" />
                Back to Login
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                Forgot Access? Retrieve
              </>
            )}
          </button>
        </div>

        <div className="text-center pt-4">
            <p className="text-[8px] font-black text-stone-300 uppercase tracking-[0.4em]">
                Secure Manager Terminal © 2026 SAZO
            </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
