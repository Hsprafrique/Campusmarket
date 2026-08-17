import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { ShoppingBag, Store, ArrowRight, Loader2, CheckCircle, AlertCircle, Shield } from "lucide-react";
import { NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth, getPostLoginRoute } from "@/lib/AuthContext";
import { auth } from "@/api/supabaseApi";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, rawUser, isLoadingAuth, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    matric_number: '', campus: '', user_type: '', whatsapp_number: '', nin: ''
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!rawUser) { navigate(createPageUrl("Auth")); return; }
      // Admins never go through onboarding
      if (user?.role === 'admin') { navigate(createPageUrl("AdminListings")); return; }
      setFormData(prev => ({
        ...prev,
        whatsapp_number: prev.whatsapp_number || user?.whatsapp_number || '',
        campus: prev.campus || user?.campus || '',
        matric_number: prev.matric_number || user?.matric_number || '',
        user_type: prev.user_type || user?.user_type || '',
        nin: prev.nin || user?.nin || '',
      }));
      if (user?.campus && user?.matric_number && user?.user_type) {
        navigate(getPostLoginRoute(user)); return;
      }
    }
  }, [isLoadingAuth, rawUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Seller-specific validation
    if (formData.user_type === 'seller') {
      if (!formData.whatsapp_number.trim()) { setError('WhatsApp number is required for sellers'); return; }
      if (!formData.nin.trim()) { setError('NIN (National Identity Number) is required for sellers'); return; }
      if (formData.nin.trim().length !== 11) { setError('NIN must be exactly 11 digits'); return; }
      if (!/^\d{11}$/.test(formData.nin.trim())) { setError('NIN must contain digits only'); return; }
    }

    setSaving(true);
    try {
      await auth.updateProfile(rawUser.id, {
        matric_number: formData.matric_number,
        campus: formData.campus,
        user_type: formData.user_type,
        whatsapp_number: formData.whatsapp_number,
        nin: formData.nin,
        subscription_plan: user?.subscription_plan || 'free',
      });
      const updatedProfile = await refreshProfile();
      navigate(getPostLoginRoute(updatedProfile || { ...formData }));
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  };

  if (isLoadingAuth) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-orange-600">
      <Loader2 className="w-8 h-8 animate-spin text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-orange-600 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="Campus Marketplace" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-lg" />
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-white/80">Just a few details to get you started</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>This connects you with students on your campus</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {/* Buyer / Seller */}
              <div className="space-y-3">
                <Label>I want to... <span className="text-red-500">*</span></Label>
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

              {/* Campus */}
              <div className="space-y-2">
                <Label>Your Campus / University <span className="text-red-500">*</span></Label>
                <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose your campus" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.user_type === 'seller'
                    ? "You can list items for any campus when posting — this is just your home campus"
                    : "You'll see listings from this campus first"}
                </p>
              </div>

              {/* Matric Number */}
              <div className="space-y-2">
                <Label>Matric Number <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., 20/52HJ001" value={formData.matric_number}
                  onChange={e => setFormData({ ...formData, matric_number: e.target.value })} required />
              </div>

              {/* WhatsApp — required for all but enforced for sellers */}
              <div className="space-y-2">
                <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g., 2348012345678" value={formData.whatsapp_number}
                  onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  required={formData.user_type === 'seller'} />
                <p className="text-xs text-gray-500">Include country code — 234 for Nigeria</p>
              </div>

              {/* NIN — sellers only */}
              {formData.user_type === 'seller' && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    NIN (National Identity Number) <span className="text-red-500">*</span>
                  </Label>
                  <Input placeholder="11-digit NIN" value={formData.nin}
                    onChange={e => setFormData({ ...formData, nin: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                    required maxLength={11} />
                  <p className="text-xs text-gray-500">Required for seller verification. Your NIN is kept private and secure.</p>
                </div>
              )}

              {formData.user_type === 'seller' && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-1">
                  <p className="text-sm font-semibold text-orange-800">🎉 Selling is 100% free!</p>
                  <p className="text-xs text-orange-700">List as many items as you want. Every listing goes live after admin approval. Want your own store page? You can create one from your dashboard.</p>
                </div>
              )}

              {formData.user_type === 'buyer' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800">
                    <strong>🛍️ Free to browse!</strong> Find items from students across all Nigerian campuses and contact sellers directly on WhatsApp.
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
