import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Loader2, Save, Crown, User, Mail, GraduationCap, Phone, MapPin } from "lucide-react";
import { NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { auth as authApi } from "@/api/supabaseApi";
import { useToast } from "@/components/ui/use-toast";

export default function Profile() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    matric_number: user?.matric_number || '',
    campus: user?.campus || '',
    whatsapp_number: user?.whatsapp_number || '',
  });

  React.useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
    if (user) {
      setFormData({
        matric_number: user.matric_number || '',
        campus: user.campus || '',
        whatsapp_number: user.whatsapp_number || '',
      });
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile(rawUser.id, formData);
      await refreshProfile();
      toast({ title: "Profile updated successfully!" });
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
    setSaving(false);
  };

  if (isLoadingAuth) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;

  const plan = user?.subscription_plan || 'free';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl p-8 mb-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold">{user?.full_name?.[0]?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                <p className="text-white/80">{user?.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${plan === 'premium' ? 'bg-orange-400' : plan === 'basic' ? 'bg-purple-400' : 'bg-white/20'} text-white`}>
                    <Crown className="w-3 h-3 mr-1" />{plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {plan !== 'premium' && (
            <Card className="mb-8 border-purple-200 bg-purple-50">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Upgrade your plan</h3>
                  <p className="text-sm text-gray-600">Get more listings and features</p>
                </div>
                <Link to={createPageUrl("Pricing")}>
                  <Button className="bg-purple-600 hover:bg-purple-700"><Crown className="w-4 h-4 mr-2" />Upgrade</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>Update your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" />Full Name</Label>
                  <Input value={user?.full_name || ''} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500">Name cannot be changed here</p>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" />Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-gray-400" />Matric Number</Label>
                  <Input value={formData.matric_number} onChange={e => setFormData({ ...formData, matric_number: e.target.value })} placeholder="e.g., 20/52HJ001" />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />Campus</Label>
                  <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })}>
                    <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" />WhatsApp Number</Label>
                  <Input value={formData.whatsapp_number} onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} placeholder="e.g., 2348012345678" />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={saving}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
