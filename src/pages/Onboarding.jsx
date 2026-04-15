import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ShoppingBag, Store, ArrowRight, Loader2 } from "lucide-react";
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
      if (!rawUser) {
        navigate(createPageUrl("Auth")); return;
      }
      if (user?.campus && user?.matric_number && user?.user_type) {
        if (user.user_type === 'seller') navigate(createPageUrl("CreateListing"));
        else navigate(`${createPageUrl("Browse")}?campus=${encodeURIComponent(user.campus)}`);
      }
      if (user?.whatsapp_number) setFormData(prev => ({ ...prev, whatsapp_number: user.whatsapp_number }));
    }
  }, [isLoadingAuth, user, rawUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await auth.updateProfile(rawUser.id, {
        ...formData,
        subscription_plan: 'free',
      });
      await refreshProfile();
      if (formData.user_type === 'seller') navigate(createPageUrl("CreateListing"));
      else navigate(`${createPageUrl("Browse")}?campus=${encodeURIComponent(formData.campus)}`);
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
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-purple-600 font-bold text-3xl">C</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.full_name?.split(' ')[0] || 'there'}!</h1>
          <p className="text-white/80">Let's set up your Campus Marketplace account</p>
        </div>

        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>This info helps connect you with students on your campus</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="matric">Matric Number</Label>
                <Input id="matric" placeholder="e.g., 20/52HJ001" value={formData.matric_number}
                  onChange={e => setFormData({ ...formData, matric_number: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Select Your Campus</Label>
                <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })} required>
                  <SelectTrigger><SelectValue placeholder="Choose your campus" /></SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Number</Label>
                <Input placeholder="e.g., 2348012345678" value={formData.whatsapp_number}
                  onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} required />
                <p className="text-xs text-gray-500">Include country code (234 for Nigeria)</p>
              </div>
              <div className="space-y-3">
                <Label>I want to...</Label>
                <RadioGroup value={formData.user_type} onValueChange={v => setFormData({ ...formData, user_type: v })} className="grid grid-cols-2 gap-4">
                  <Label htmlFor="buyer" className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.user_type === 'buyer' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <RadioGroupItem value="buyer" id="buyer" className="sr-only" />
                    <ShoppingBag className={`w-8 h-8 mb-2 ${formData.user_type === 'buyer' ? 'text-purple-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Buy</span>
                    <span className="text-xs text-gray-500">Browse & shop</span>
                  </Label>
                  <Label htmlFor="seller" className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.user_type === 'seller' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <RadioGroupItem value="seller" id="seller" className="sr-only" />
                    <Store className={`w-8 h-8 mb-2 ${formData.user_type === 'seller' ? 'text-orange-600' : 'text-gray-400'}`} />
                    <span className="font-medium">Sell</span>
                    <span className="text-xs text-gray-500">List products</span>
                  </Label>
                </RadioGroup>
              </div>
              {formData.user_type === 'seller' && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-sm text-purple-800"><strong>🎉 Free tier:</strong> Your first listing is free! Need more? Upgrade anytime from ₦1,999/month.</p>
                </div>
              )}
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                disabled={saving || !formData.matric_number || !formData.campus || !formData.user_type || !formData.whatsapp_number}>
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Continue</span><ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
