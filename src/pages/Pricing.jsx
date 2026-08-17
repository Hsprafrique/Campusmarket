import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { CheckCircle, Store, Gift, Users, TrendingUp, ShieldCheck, Loader2, Banknote, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { supabase } from "@/lib/supabase";

const FREE_FEATURES = [
  "Unlimited free listings",
  "List on any Nigerian campus",
  "Admin-approved listings go live",
  "Direct WhatsApp contact with buyers",
  "4 photos per listing",
  "Browse all marketplace listings",
  "Message sellers directly",
];

const STORE_FEATURES = [
  "Everything in Free",
  "Your own branded store page",
  "Custom store logo & banner",
  "Store name searchable by buyers",
  "Instagram & WhatsApp links on store",
  "Featured in 'Campus Stores' section",
  "Early Investor badge permanently",
  "Priority listing visibility",
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, refreshProfile } = useAuth();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [paySuccess, setPaySuccess] = useState(false);

  const hasStore = user?.has_store === true;
  const isSeller = user?.user_type === 'seller';

  // ── FLUTTERWAVE CONFIG ──────────────────────────────────────────────
  const flwConfig = {
    public_key: import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `cm-store-${rawUser?.id}-${Date.now()}`,
    amount: 5000,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer,account',
    customer: {
      email: user?.email || '',
      name: user?.full_name || '',
      phone_number: user?.whatsapp_number || '',
    },
    customizations: {
      title: 'Campus Marketplace',
      description: 'Campus Store — One-time activation fee',
      logo: 'https://www.campusmarket.cc/logo.png',
    },
    meta: {
      user_id: rawUser?.id,
      store_payment: true,
    }
  };

  const handleFlutterPayment = useFlutterwave(flwConfig);

  const handlePayNaira = () => {
    if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
    if (!isSeller) { navigate(createPageUrl("Auth")); return; }
    setPayError('');
    setPaying(true);

    handleFlutterPayment({
      callback: async (response) => {
        closePaymentModal();
        setPaying(false);

        if (response.status === 'successful' || response.status === 'completed') {
          try {
            // Activate the store for this user
            const { error } = await supabase
              .from('profiles')
              .update({
                has_store: true,
                store_activated_at: new Date().toISOString(),
                store_payment_ref: response.transaction_id?.toString() || response.flw_ref || '',
              })
              .eq('id', rawUser.id);

            if (error) throw error;

            await refreshProfile();
            setPaySuccess(true);
          } catch (err) {
            setPayError('Payment was received but store activation failed. Contact support with your payment reference: ' + (response.flw_ref || ''));
          }
        } else {
          setPayError('Payment was not completed. Please try again.');
        }
      },
      onClose: () => {
        setPaying(false);
      },
    });
  };

  return (
    <div className="min-h-screen py-12" style={{ background: 'var(--brand-cream)' }}>
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: 'var(--brand-gold)' }}>Simple Pricing</p>
          <h1 className="text-4xl font-black mb-4" style={{ color: 'var(--brand-navy)' }}>
            Free to buy & sell.<br />
            <span style={{ color: 'var(--brand-gold)' }}>Pay only for your Store.</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Every student can list and buy for free. Want a branded storefront? That's a one-time ₦5,000 payment.
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Gift, label: "Free listings", value: "Unlimited", color: "#16A34A" },
            { icon: Users, label: "Campus stores", value: "Early access", color: "var(--brand-gold)" },
            { icon: TrendingUp, label: "Nigerian campuses", value: "200+", color: "var(--brand-navy)" },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="text-center p-5 border-gray-100">
                <Icon className="w-7 h-7 mx-auto mb-2" style={{ color }} />
                <p className="text-2xl font-black" style={{ color: 'var(--brand-navy)' }}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">

          {/* FREE PLAN */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card className="h-full border-2 border-gray-100">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Gift className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Free</CardTitle>
                    <CardDescription>For all students</CardDescription>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-black" style={{ color: 'var(--brand-navy)' }}>₦0</span>
                  <span className="text-gray-400 ml-2 text-sm">forever</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {FREE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full border-gray-200 text-sm" variant="outline"
                  onClick={() => navigate(isAuthenticated ? createPageUrl("Browse") : createPageUrl("Auth"))}>
                  {isAuthenticated ? "You're on this plan ✓" : "Get Started Free"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* STORE PLAN */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card className="h-full relative overflow-hidden" style={{ borderWidth: 2, borderColor: 'var(--brand-gold)' }}>
              <div className="absolute top-4 right-4">
                <Badge className="text-xs font-semibold text-white" style={{ background: 'var(--brand-gold)' }}>
                  Early Investor
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-gold-light)' }}>
                    <Store className="w-5 h-5" style={{ color: 'var(--brand-gold)' }} />
                  </div>
                  <div>
                    <CardTitle>Campus Store</CardTitle>
                    <CardDescription>Your own storefront</CardDescription>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-4xl font-black" style={{ color: 'var(--brand-navy)' }}>₦5,000</span>
                  <span className="text-gray-400 ml-2 text-sm">one-time</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {STORE_FEATURES.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--brand-gold)' }} />
                      <span className="text-gray-600 text-sm">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* Payment feedback */}
                {payError && (
                  <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-xs">{payError}</AlertDescription>
                  </Alert>
                )}

                {paySuccess || hasStore ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--brand-gold-light)' }}>
                      <CheckCircle className="w-7 h-7" style={{ color: 'var(--brand-gold)' }} />
                    </div>
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--brand-navy)' }}>
                      {paySuccess ? 'Store Activated! 🎉' : 'Store Already Active ✓'}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">Your store is ready to set up.</p>
                    <Button className="w-full text-white text-sm" style={{ background: 'var(--brand-navy)' }}
                      onClick={() => navigate(createPageUrl("MyStore"))}>
                      Set Up My Store →
                    </Button>
                  </div>
                ) : !isAuthenticated ? (
                  <Button className="w-full h-12 text-white font-semibold" style={{ background: 'var(--brand-navy)' }}
                    onClick={() => navigate(createPageUrl("Auth"))}>
                    Sign in to get started
                  </Button>
                ) : !isSeller ? (
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-3">You need a seller account to create a store.</p>
                    <Button className="w-full h-12 text-white font-semibold" style={{ background: 'var(--brand-navy)' }}
                      onClick={() => navigate(createPageUrl("Auth"))}>
                      Sign up as a Seller
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full h-12 font-semibold text-white flex items-center justify-center gap-2"
                    style={{ background: paying ? '#ccc' : 'var(--brand-navy)' }}
                    onClick={handlePayNaira}
                    disabled={paying}>
                    {paying
                      ? <><Loader2 className="w-4 h-4 animate-spin" />Opening payment...</>
                      : <><Banknote className="w-5 h-5" />Pay ₦5,000 with Flutterwave</>}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Early investor section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="mt-12 rounded-2xl p-8 text-white text-center max-w-3xl mx-auto" style={{ background: 'var(--brand-navy)' }}>
          <ShieldCheck className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--brand-gold)' }} />
          <h3 className="text-2xl font-bold mb-2">Early Investor Stores</h3>
          <p className="text-white/70 mb-4 text-sm leading-relaxed">
            Be among the first sellers to own a branded store on Campus Marketplace. Early store owners get a permanent <strong className="text-white">Early Investor</strong> badge — even after prices go up.
          </p>
          <p className="text-xs" style={{ color: 'var(--brand-gold)' }}>Store slots are limited. First come, first served.</p>
        </motion.div>

        {/* FAQ */}
        <div className="mt-12 max-w-2xl mx-auto space-y-3">
          <h3 className="text-xl font-bold text-center mb-6" style={{ color: 'var(--brand-navy)' }}>Common Questions</h3>
          {[
            { q: "Is selling really free?", a: "Yes — unlimited listings, no fees. Listings just need admin approval before going live." },
            { q: "What's the difference between a listing and a store?", a: "A listing is a single product. A store is your own branded page inside the marketplace — like a mini-shop under your name." },
            { q: "Can I sell on any campus?", a: "Yes! You choose which campus each listing is for. You can list on multiple campuses." },
            { q: "How does Flutterwave payment work?", a: "Pay securely with card, bank transfer, or USSD. Your store is activated instantly after successful payment." },
            { q: "How do buyers pay me?", a: "Buyers contact you on WhatsApp and sort out payment directly with you — cash, transfer, whatever works." },
          ].map(({ q, a }) => (
            <Card key={q} className="p-5 border-gray-100">
              <p className="font-semibold text-sm mb-1" style={{ color: 'var(--brand-navy)' }}>{q}</p>
              <p className="text-gray-500 text-sm">{a}</p>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
