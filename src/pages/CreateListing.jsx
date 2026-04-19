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
import { X, Loader2, ImagePlus, AlertCircle, Crown, Clock } from "lucide-react";
import { CATEGORIES, NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi, storage } from "@/api/supabaseApi";

const MAX_IMAGES = 4;
const FREE_PLAN_LIMIT = 3;

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeListingCount, setActiveListingCount] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '', description: '', price: '', category: '',
    campus: '', whatsapp_number: '', images: []
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user?.user_type === 'buyer') { navigate(createPageUrl("Browse")); return; }
      setFormData(prev => ({
        ...prev,
        campus: user?.campus || '',
        whatsapp_number: user?.whatsapp_number || ''
      }));
      if (rawUser?.id) {
        listingsApi.countActive(rawUser.id).then(setActiveListingCount);
      }
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const plan = user?.subscription_plan || 'free';
  const maxListings = plan === 'free' ? FREE_PLAN_LIMIT : plan === 'basic' ? 10 : Infinity;
  const canCreate = activeListingCount < maxListings;
  const listingsLeft = maxListings === Infinity ? '∞' : Math.max(0, maxListings - activeListingCount);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const remaining = MAX_IMAGES - formData.images.length;
    if (remaining <= 0) return;
    setUploadingImage(true);
    try {
      for (const file of files.slice(0, remaining)) {
        const url = await storage.uploadListingImage(file, rawUser.id);
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
      }
    } catch (err) {
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
        is_active: false,       // inactive until admin approves
        status: 'pending',      // must be approved by admin
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      setSubmitted(true);
    } catch (err) {
      alert("Failed to create listing: " + err.message);
    }
    setSaving(false);
  };

  if (isLoadingAuth) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
  );

  if (submitted) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Listing Submitted!</h2>
        <p className="text-gray-600 mb-2">Your listing is now <strong>pending review</strong> by our admin team.</p>
        <p className="text-gray-500 text-sm mb-8">You'll see it go live on the marketplace once it's approved. This usually takes a short while.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate(createPageUrl("MyListings"))} className="bg-purple-600 hover:bg-purple-700">View My Listings</Button>
          <Button variant="outline" onClick={() => { setSubmitted(false); setFormData({ title: '', description: '', price: '', category: '', campus: user?.campus || '', whatsapp_number: user?.whatsapp_number || '', images: [] }); }}>
            Create Another
          </Button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Listing</h1>
          <p className="text-gray-600 mb-6">List your product or service for students on your campus</p>

          {/* Plan + listings left banner */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-800 font-medium">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
              </p>
              <p className="text-xs text-purple-600 mt-0.5">
                {activeListingCount} used · <strong>{listingsLeft} listing{listingsLeft === 1 ? '' : 's'} remaining</strong>
                {plan === 'free' && ` (free limit: ${FREE_PLAN_LIMIT})`}
              </p>
            </div>
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
                You've used all {FREE_PLAN_LIMIT} free listings. <Link to={createPageUrl("Pricing")} className="underline font-medium">Upgrade your plan</Link> to create more.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Your listing will be reviewed by admin before going live on the marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Images - max 4 */}
                <div className="space-y-2">
                  <Label>Photos <span className="text-gray-400 font-normal">(up to {MAX_IMAGES})</span></Label>
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
                    {formData.images.length < MAX_IMAGES && (
                      <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        {uploadingImage
                          ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                          : <><ImagePlus className="w-6 h-6 text-gray-400" /><span className="text-xs text-gray-500 mt-1">Add Photo</span></>}
                        <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{formData.images.length}/{MAX_IMAGES} photos added</p>
                </div>

                <div className="space-y-2">
                  <Label>Title <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g., Fresh Jollof Rice, iPhone 12, Typing Services"
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required disabled={!canCreate} />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your product or service in detail..." value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} disabled={!canCreate} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₦) <span className="text-red-500">*</span></Label>
                    <Input type="number" placeholder="0" value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })} required disabled={!canCreate} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })} disabled={!canCreate}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat.value} value={cat.value}>{cat.icon} {cat.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Campus <span className="text-red-500">*</span></Label>
                  <Select value={formData.campus} onValueChange={v => setFormData({ ...formData, campus: v })} disabled={!canCreate}>
                    <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>WhatsApp Number <span className="text-red-500">*</span></Label>
                  <Input placeholder="e.g., 2348012345678" value={formData.whatsapp_number}
                    onChange={e => setFormData({ ...formData, whatsapp_number: e.target.value })} required disabled={!canCreate} />
                  <p className="text-xs text-gray-500">Buyers will contact you on this number</p>
                </div>

                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                  disabled={saving || !canCreate || !formData.title || !formData.price || !formData.category || !formData.campus || !formData.whatsapp_number}>
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for Approval"}
                </Button>
                <p className="text-xs text-gray-400 text-center">
                  Your listing will go live after admin review ✓
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
