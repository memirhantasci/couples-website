"use client";

import { useActionState } from "react";
import { loginAction, changePasswordAction, type LoginState } from "@/actions/auth";
import { Heart, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

const initialState: LoginState = {};

function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [forgotState, forgotAction, isForgotPending] = useActionState(changePasswordAction, initialState);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      toast.error("Oturum süreniz doldu, lütfen tekrar giriş yapın.");
      
      // Optional: remove the query param so it doesn't show again on refresh
      const url = new URL(window.location.href);
      url.searchParams.delete("expired");
      window.history.replaceState({}, "", url);
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/couple-bg.jpg')", backgroundColor: "var(--dark-950)" }}
    >
      {/* Background Overlay to ensure readability */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "rgba(8, 8, 17, 0.75)" }} />
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute rounded-full blur-3xl animate-float opacity-30"
          style={{
            width: 600,
            height: 600,
            top: -200,
            right: -150,
            background: "radial-gradient(circle, rgba(232,0,45,0.5) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl animate-float opacity-20"
          style={{
            width: 500,
            height: 500,
            bottom: -100,
            left: -150,
            background: "radial-gradient(circle, rgba(255,215,0,0.4) 0%, transparent 70%)",
            animationDelay: "-3s",
          }}
        />
        {/* Floating hearts */}
        {["❤️", "💕", "💫", "✨"].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl animate-float select-none"
            style={{
              top: `${20 + i * 20}%`,
              left: `${5 + i * 25}%`,
              animationDelay: `${-i * 1.5}s`,
              opacity: 0.15,
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Login / Forgot Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="glass-card relative w-full mx-4 overflow-hidden"
        style={{ maxWidth: 420, padding: "40px 32px" }}
      >
        <AnimatePresence mode="wait">
          {!isForgotPassword ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Logo / Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center glow-red"
                  style={{
                    background: "linear-gradient(135deg, var(--gs-red) 0%, #B5001F 100%)",
                  }}
                >
                  <Heart size={36} fill="white" color="white" />
                </motion.div>

                <h1 className="font-display text-gradient text-3xl font-bold mb-2">
                  Emirhan & Öykü
                </h1>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
                  Özel platformunuza hoş geldiniz 💕
                </p>
              </div>

              {/* Form */}
              <form action={formAction} className="flex flex-col gap-4">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="username"
                    className="text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <User size={17} />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="kullanıcı adınız"
                      required
                      className="input-glass"
                      style={{ paddingLeft: 44 }}
                      autoComplete="username"
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    Şifre
                  </label>
                  <div className="relative">
                    <div
                      className="absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: "rgba(255,255,255,0.3)" }}
                    >
                      <Lock size={17} />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="input-glass"
                      style={{ paddingLeft: 44, paddingRight: 48 }}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(232,0,45,0.9)", color: "#ffffff" }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {state?.error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(232, 0, 45, 0.1)",
                      border: "1px solid rgba(232, 0, 45, 0.25)",
                      color: "#FF4D6D",
                    }}
                  >
                    <span>⚠️</span>
                    <span>{state.error}</span>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary w-full mt-2"
                  whileHover={{ scale: isPending ? 1 : 1.02 }}
                  whileTap={{ scale: isPending ? 1 : 0.98 }}
                >
                  {isPending ? (
                    <>
                      <div
                        className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"
                      />
                      Giriş yapılıyor...
                    </>
                  ) : (
                    <>
                      <Heart size={16} />
                      Giriş Yap
                    </>
                  )}
                </motion.button>
                
                {/* Forgot Password Link Below Login Button */}
                <div className="flex flex-col gap-3 mt-3">
                  <Link
                    href="/register"
                    className="btn-gold w-full flex items-center justify-center text-sm font-bold py-2.5 rounded-xl transition-all"
                  >
                    Hesabın yok mu? Kayıt Ol
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs font-bold px-4 py-2 rounded-xl transition-all self-center"
                    style={{ background: "rgba(232,0,45,0.9)", color: "#ffffff" }}
                    tabIndex={-1}
                  >
                    Şifremi Unuttum
                  </button>
                </div>
              </form>

              {/* Footer note */}
              <p
                className="text-center mt-6 text-xs"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >
                Sadece Emirhan & Öykü için 💕
              </p>
            </motion.div>
          ) : forgotState?.success ? (
            /* Success state for forgot password */
            <motion.div
              key="forgot-success"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center glow-gold"
                style={{
                  background: "linear-gradient(135deg, var(--gs-gold) 0%, #E6A800 100%)",
                }}
              >
                <Heart size={36} fill="#080811" color="#080811" />
              </div>
              <h2 className="text-2xl font-bold mb-3 text-gradient-gold">Şifre Değiştirildi</h2>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)" }}>
                Yeni şifreniz başarıyla kaydedildi. Artık giriş yapabilirsiniz.
              </p>
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  // Refresh the page or simply allow login with the new credentials
                }}
                className="btn-gold w-full"
              >
                Giriş Ekranına Dön
              </button>
            </motion.div>
          ) : (
            /* Forgot Password Form */
            <motion.div
              key="forgot-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={() => setIsForgotPassword(false)}
                className="flex items-center gap-2 mb-6 text-sm hover:opacity-70 transition-opacity"
                style={{ color: "rgba(255,255,255,0.5)" }}
              >
                <ArrowLeft size={16} /> Geri Dön
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Şifremi Unuttum</h2>
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  Kullanıcı adınızı ve yeni şifrenizi girerek şifrenizi sıfırlayabilirsiniz.
                </p>
              </div>

              <form action={forgotAction} className="flex flex-col gap-4">
                {/* Username */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="forgot-username" className="text-sm font-semibold text-white/70">
                    Kullanıcı Adı
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <User size={17} />
                    </div>
                    <input
                      id="forgot-username"
                      name="username"
                      type="text"
                      placeholder="kullanıcı adınız"
                      required
                      className="input-glass"
                      style={{ paddingLeft: 44 }}
                      autoComplete="username"
                      autoCapitalize="none"
                    />
                  </div>
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="new-password" className="text-sm font-semibold text-white/70">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock size={17} />
                    </div>
                    <input
                      id="new-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="yeni şifreniz"
                      required
                      className="input-glass"
                      style={{ paddingLeft: 44, paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(232,0,45,0.9)", color: "#ffffff" }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                {forgotState?.error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: "rgba(232, 0, 45, 0.1)",
                      border: "1px solid rgba(232, 0, 45, 0.25)",
                      color: "#FF4D6D",
                    }}
                  >
                    <span>⚠️</span>
                    <span>{forgotState.error}</span>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isForgotPending}
                  className="btn-primary w-full mt-2"
                  whileHover={{ scale: isForgotPending ? 1 : 1.02 }}
                  whileTap={{ scale: isForgotPending ? 1 : 0.98 }}
                >
                  {isForgotPending ? "Şifre Güncelleniyor..." : "Şifreyi Değiştir"}
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh flex items-center justify-center" style={{ backgroundColor: "var(--dark-950)" }}>Yükleniyor...</div>}>
      <LoginForm />
    </Suspense>
  );
}
