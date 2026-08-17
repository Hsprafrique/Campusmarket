import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Users, TrendingUp } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";

function AnimatedCounter({ end, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime, animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);
  return <>{count}{suffix}</>;
}

export default function HeroSection() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoadingAuth } = useAuth();

  return (
    <section className="relative overflow-hidden" style={{ background: 'var(--brand-navy)' }}>
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: 'var(--brand-gold)', filter: 'blur(120px)', transform: 'translate(30%, -30%)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/70 text-xs font-medium tracking-wide">Nigeria's Campus Marketplace</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-5">
              Buy & Sell<br />
              <span className="font-display italic" style={{ color: 'var(--brand-gold)' }}>Across Every</span><br />
              Nigerian Campus
            </h1>

            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-lg">
              Connect with students and sellers across 200+ Nigerian campuses. Food, gadgets, books, services — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={createPageUrl("Browse")}>
                <Button size="lg" className="w-full sm:w-auto px-7 h-12 text-sm font-semibold text-[var(--brand-navy)] hover:opacity-90" style={{ background: 'var(--brand-gold)' }}>
                  Browse Listings <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              {!isLoadingAuth && !isAuthenticated && (
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 h-12 text-sm font-semibold text-white border-white/20 bg-white/5 hover:bg-white/10"
                  onClick={() => navigate(createPageUrl("Auth"))}>
                  Sign Up Free
                </Button>
              )}
              {!isLoadingAuth && isAuthenticated && user?.user_type === 'seller' && (
                <Link to={createPageUrl("CreateListing")}>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto px-7 h-12 text-sm font-semibold text-white border-white/20 bg-white/5 hover:bg-white/10">
                    Post a Listing
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/10">
              {[
                { value: 200, suffix: "+", label: "Campuses" },
                { value: 5000, suffix: "+", label: "Students" },
                { value: "Free", label: "To List", raw: true }
              ].map((s, i) => (
                <div key={i}>
                  <p className="text-2xl sm:text-3xl font-black text-white mb-0.5">
                    {s.raw ? s.value : <AnimatedCounter end={s.value} suffix={s.suffix} />}
                  </p>
                  <p className="text-white/40 text-xs font-medium tracking-wide uppercase">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, delay: 0.15 }} className="hidden lg:block">
            <div className="relative">
              {/* ── HERO IMAGE ── Replace this URL with your own image path e.g. "/hero.jpg" ── */}
              <img src="/Hero.jpg"
                alt="Students" className="w-full rounded-2xl object-cover aspect-[5/4]"
                style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }} />

              {/* Floating cards */}
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-6 bg-white rounded-xl p-3.5 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-gold-light)' }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: 'var(--brand-gold)' }} />
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: 'var(--brand-navy)' }}>New Sale!</p>
                  <p className="text-xs text-gray-400">Physics Textbook</p>
                </div>
              </motion.div>

              <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl p-3.5 shadow-2xl flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#EFF6FF' }}>
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: 'var(--brand-navy)' }}>+120 listings</p>
                  <p className="text-xs text-gray-400">This week</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
