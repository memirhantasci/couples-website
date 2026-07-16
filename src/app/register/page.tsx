"use client";

import { useActionState } from "react";
import { registerAction, type LoginState } from "@/actions/auth";
import { Heart, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const initialState: LoginState = {};

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-dvh flex items-center justify-center relative overflow-hidden bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/couple-bg.jpg')", backgroundColor: "var(--dark-950)" }}
    >
      {/* Background Overlay */}
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="card relative w-full mx-4 overflow-hidden"
        style={{ maxWidth: 420, padding: "40px 32px" }}
      >
        {/* Header */}
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
            Kayıt Ol
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>
            Sisteme katılmak için hesap oluşturun 💕
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="flex flex-col gap-4">
          {/* Display Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="displayName"
              className="text-sm font-semibold"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              İsim (Takvimde Gözükecek Ad)
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <Heart size={17} />
              </div>
              <input
                id="displayName"
                name="displayName"
                type="text"
                placeholder="Örn: Emirhan"
                required
                className="input-glass"
                style={{ paddingLeft: 44 }}
              />
            </div>
          </div>

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
                placeholder="istediğiniz kullanıcı adı"
                required
                className="input-glass"
                style={{ paddingLeft: 44 }}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>
          </div>

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
                autoComplete="new-password"
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

          <motion.button
            type="submit"
            disabled={isPending}
            className="btn-primary w-full mt-2"
            whileHover={{ scale: isPending ? 1 : 1.02 }}
            whileTap={{ scale: isPending ? 1 : 0.98 }}
          >
            {isPending ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Kayıt Yapılıyor...
              </>
            ) : (
              <>
                <User size={16} />
                Kayıt Ol
              </>
            )}
          </motion.button>
          
          <div className="text-center mt-3">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm hover:opacity-70 transition-opacity"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              <ArrowLeft size={16} /> Zaten hesabın var mı? Giriş yap
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
