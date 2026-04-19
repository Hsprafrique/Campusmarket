import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShoppingBag, Store, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { auth } from "@/api/supabaseApi";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, rawUser, isLoadingAuth, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    matric_number: '', campus: '', user_type: '', whatsapp_number: ''
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!rawUser) { navigate(createPageUrl("Auth")); return; }

      // Pre-fill from what we already know
      setFormData(prev => ({
        ...prev,
        whatsapp_number: prev.whatsapp_number || user?.whatsapp_number || '',
        campus: prev.campus || user?.campus || '',
        matric_number: prev.matric_number || user?.matric_number || '',
        // Pre-select user_type if they chose it on sign up screen
        user_type: prev.user_type || user?.user_type || '',
      }));

      // Skip onboarding if already fully set up
      if (user?.campus && user?.matric_number && user?.user_type) {
        if (user.user_type === 'seller') navigate(createPageUrl("MyListings"));
        else navigate(createPageUrl("Browse"));
      }
    }
  }, [isLoadingAuth, rawUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await auth.updateProfile(rawUser.id, {
        ...formData,
        subscription_plan: user?.subscription_plan || 'free',
      });
      await refreshProfile();
      // Sellers go to their dashboard, buyers go to browse
      if (formData.user_type === 'seller') navigate(createPageUrl("MyListings"));
      else navigate(createPageUrl("Browse"));
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-orange-600">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src="/logo.jpeg" alt="Campus Marketplace" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-white/80">Just a few details to set up your account</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>This helps connect you with students on your campus</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Matric Number */}
              <div className="space-y-2">
                <Label htmlFor="matric">Matric Number</Label>
                <Input id="matric" placeholder="e.g., 20/52HJ001" value={formData.matric_number}
                  onChange={e => setFormData({ ...formData, matric_number: e.target.value })} required />
              </div>

              {/* Campus - REQUIRED so listings show for correct school */}
              <div className="space-y-2">
                <Label>Your Campus / University <span className="text-red-500">*</span></Label>
                <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })} required>
                  <SelectTrigger><SelectValue placeholder="Choose your campus" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.user_type === 'seller'
                    ? "Your listings will appear to buyers searching this campus"
                    : "You'll see listings from this campus first"}
                </p>
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., 2348012345678" value={formData.whatsapp_number}
                  onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} required />
                <p className="text-xs text-gray-500">Include country code — 234 for Nigeria</p>
              </div>

              {/* Buyer / Seller choice — only show if not already set from signup */}
              <div className="space-y-3">
                <Label>I want to...</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: 'buyer', icon: ShoppingBag, label: 'Buy', sub: 'Browse & shop', color: 'purple' },
                    { value: 'seller', icon: Store, label: 'Sell', sub: 'List products', color: 'orange' },
                  ].map(({ value, icon: Icon, label, sub, color }) => (
                    <button key={value} type="button" onClick={() => setFormData({ ...formData, user_type: value })}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all relative
                        ${formData.user_type === value
                          ? color === 'purple' ? 'border-purple-500 bg-purple-50' : 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'}`}>
                      {formData.user_type === value && (
                        <CheckCircle className={`absolute top-2 right-2 w-4 h-4 ${color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
                      )}
                      <Icon className={`w-8 h-8 mb-2 ${formData.user_type === value ? (color === 'purple' ? 'text-purple-600' : 'text-orange-600') : 'text-gray-400'}`} />
                      <span className="font-medium">{label}</span>
                      <span className="text-xs text-gray-500">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formData.user_type === 'seller' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <p className="text-sm text-orange-800">
                    <strong>🎉 Free plan:</strong> Post up to <strong>3 listings free</strong>. Your listings go live after admin approval. Upgrade anytime for more.
                  </p>
                </div>
              )}

              {formData.user_type === 'buyer' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>🛍️ Browse freely:</strong> You'll see listings from <strong>{formData.campus || 'your campus'}</strong> and can contact sellers directly on WhatsApp.
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={saving || !formData.matric_number || !formData.campus || !formData.user_type || !formData.whatsapp_number}>
                {saving
                  ? <Loader2 className="w-5 h-5 animate-spin" />
                  : <><span>{formData.user_type === 'seller' ? 'Go to My Dashboard' : 'Start Browsing'}</span><ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
