import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { X, Loader2, ImagePlus, AlertCircle, Crown } from "lucide-react";
import { CATEGORIES, NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi, storage } from "@/api/supabaseApi";

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeListingCount, setActiveListingCount] = useState(0);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '',
    campus: '', whatsapp_number: '', images: []
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user?.user_type === 'buyer') { navigate(createPageUrl("Browse")); return; }
      if (!user?.campus || !user?.matric_number) { navigate(createPageUrl("Onboarding")); return; }
      setFormData(prev => ({
        ...prev,
        campus: user.campus || '',
        whatsapp_number: user.whatsapp_number || ''
      }));
      if (rawUser?.id) {
        listingsApi.countActive(rawUser.id).then(setActiveListingCount);
      }
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const plan = user?.subscription_plan || 'free';
  const maxListings = plan === 'free' ? 1 : plan === 'basic' ? 3 : Infinity;
  const canCreate = activeListingCount < maxListings;

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      for (const file of files) {
        if (formData.images.length >= 5) break;
        const url = await storage.uploadListingImage(file, rawUser.id);
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image. Check your Supabase storage bucket 'listing-images' is public.");
    }
    setUploadingImage(false);
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canCreate) return;
    setSaving(true);
    try {
      await listingsApi.create({
        ...formData,
        price: parseFloat(formData.price),
        seller_id: rawUser.id,
        seller_name: user.full_name,
        seller_email: user.email,
        is_active: true,
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      navigate(createPageUrl("MyListings"));
    } catch (err) {
      console.error(err);
      alert("Failed to create listing: " + err.message);
    }
    setSaving(false);
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Listing</h1>
          <p className="text-gray-600 mb-6">List your product or service for students on your campus</p>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-sm text-purple-800">
              <strong>Plan:</strong> {plan.charAt(0).toUpperCase() + plan.slice(1)} ({activeListingCount}/{maxListings === Infinity ? '∞' : maxListings} listings used)
            </p>
            {plan === 'free' && (
              <Link to={createPageUrl("Pricing")}>
                <Button size="sm" variant="outline" className="text-purple-600 border-purple-300">
                  <Crown className="w-4 h-4 mr-1" />Upgrade
                </Button>
              </Link>
            )}
          </div>

          {!canCreate && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                You've reached your listing limit. <Link to={createPageUrl("Pricing")} className="underline font-medium">Upgrade your plan</Link> to create more.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Fill in the details about what you're selling</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Images (up to 5)</Label>
                  <div className="flex flex-wrap gap-3">
                    {formData.images.map((img, index) => (
                      <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 5 && (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : (
                          <><ImagePlus className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-500 mt-1">Add</span></>
                        )}
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input placeholder="e.g., Fresh Jollof Rice, iPhone 12, Typing Services"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required disabled={!canCreate} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your product or service..." value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} disabled={!canCreate} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₦)</Label>
                    <Input type="number" placeholder="0" value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })} required disabled={!canCreate} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })} disabled={!canCreate}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Campus</Label>
                  <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })} disabled={!canCreate}>
                    <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp Number</Label>
                  <Input placeholder="e.g., 2348012345678" value={formData.whatsapp_number}
                    onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} required disabled={!canCreate} />
                  <p className="text-xs text-gray-500">Buyers will contact you on this number</p>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  disabled={saving || !canCreate || !formData.title || !formData.price || !formData.category || !formData.campus || !formData.whatsapp_number}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
