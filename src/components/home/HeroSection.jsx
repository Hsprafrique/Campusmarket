import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, ShoppingBag, Users } from "lucide-react";
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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600" />
      <div className="absolute inset-0 overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Nigeria's #1 Campus Marketplace
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Buy & Sell on Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300">Campus</span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Connect with fellow students to buy food, gadgets, books, services and more.
              Your one-stop marketplace for all Nigerian campuses.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
              <Link to={createPageUrl("Browse")}>
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-orange-500/30">
                  Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              {!isLoadingAuth && !isAuthenticated && (
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-2xl shadow-lg shadow-purple-500/30"
                  onClick={() => navigate(createPageUrl("Auth"))}>
                  Sign Up Free
                </Button>
              )}
              {!isLoadingAuth && isAuthenticated && user?.user_type === 'seller' && (
                <Link to={createPageUrl("CreateListing")}>
                  <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-6 text-lg rounded-2xl shadow-lg">
                    Post a Listing
                  </Button>
                </Link>
              )}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20">
              {[{ value: 50, suffix: "+", label: "Campuses" }, { value: 1000, suffix: "+", label: "Students" }, { value: "24/7", label: "Support", raw: true }].map((s, i) => (
                <div key={i} className="text-center sm:text-left">
                  <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 mb-2 drop-shadow-lg">
                    {s.raw ? s.value : <AnimatedCounter end={s.value} suffix={s.suffix} />}
                  </p>
                  <p className="text-white/90 text-sm font-semibold tracking-wide">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-500 rounded-3xl blur-2xl opacity-30" />
              {/* ── HERO IMAGE ── Change this URL to your own image ── */}
              <img src="/camphero"
                alt="Students" className="relative rounded-3xl shadow-2xl w-full object-cover" />
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">New Order!</p>
                    <p className="text-sm text-gray-500">Physics Textbook</p>
                  </div>
                </div>
              </motion.div>
              <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">+50</p>
                    <p className="text-sm text-gray-500">New sellers today</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
