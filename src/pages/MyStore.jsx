import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Store, Save, Loader2, Plus, ImagePlus, Instagram, Phone, MapPin, Package, Trash2 } from "lucide-react";
import { NIGERIAN_CAMPUSES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { stores as storesApi, listings as listingsApi, storage } from "@/api/supabaseApi";
import { useToast } from "@/components/ui/use-toast";
import ListingCard from "../components/listings/ListingCard";

export default function MyStore() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const [form, setForm] = useState({
    name: '', description: '', campus: '', whatsapp_number: '',
    instagram_handle: '', logo_url: '', banner_url: ''
  });

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user?.user_type === 'buyer') { navigate(createPageUrl("Browse")); return; }
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['myStore', rawUser?.id],
    queryFn: () => storesApi.getByOwner(rawUser.id),
    enabled: !!rawUser?.id,
  });

  // Initialize form when store data loads (replaces onSuccess)
  useEffect(() => {
    if (!formInitialized) {
      if (store) {
        setForm({
          name: store.name || '', description: store.description || '',
          campus: store.campus || '', whatsapp_number: store.whatsapp_number || '',
          instagram_handle: store.instagram_handle || '',
          logo_url: store.logo_url || '', banner_url: store.banner_url || ''
        });
        setFormInitialized(true);
      } else if (!storeLoading && user) {
        setForm(prev => ({
          ...prev,
          campus: prev.campus || user.campus || '',
          whatsapp_number: prev.whatsapp_number || user.whatsapp_number || ''
        }));
        setFormInitialized(true);
      }
    }
  }, [store, storeLoading, user, formInitialized]);

  const { data: storeListings = [] } = useQuery({
    queryKey: ['storeListings', rawUser?.id],
    queryFn: () => listingsApi.getMyListings(rawUser.id),
    enabled: !!rawUser?.id
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (store) return storesApi.update(store.id, formData);
      return storesApi.create({ ...formData, owner_id: rawUser.id, owner_email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStore', rawUser?.id] });
      toast({ title: store ? "Store updated!" : "Store created successfully!" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const deleteMutation = useMutation({
    mutationFn: () => storesApi.delete(store.id),
    onSuccess: () => {
      setFormInitialized(false);
      queryClient.invalidateQueries({ queryKey: ['myStore', rawUser?.id] });
      toast({ title: "Store deleted" });
    }
  });

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await storage.uploadStoreAsset(file, rawUser.id, 'logo');
      setForm(prev => ({ ...prev, logo_url: url }));
    } catch (err) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    setUploadingLogo(false);
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingBanner(true);
    try {
      const url = await storage.uploadStoreAsset(file, rawUser.id, 'banner');
      setForm(prev => ({ ...prev, banner_url: url }));
    } catch (err) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
    setUploadingBanner(false);
  };

  if (isLoadingAuth || storeLoading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{store ? 'My Store' : 'Create Your Store'}</h1>
              <p className="text-gray-600">{store ? 'Manage your store profile' : 'Set up your campus store'}</p>
            </div>
          </div>

          {store && (
            <div className="relative mb-8 rounded-2xl overflow-hidden shadow-lg">
              {store.banner_url
                ? <img src={store.banner_url} alt="banner" className="w-full h-40 object-cover" />
                : <div className="w-full h-40 bg-gradient-to-r from-purple-600 to-orange-500" />}
              <div className="absolute bottom-4 left-6 flex items-end gap-4">
                {store.logo_url
                  ? <img src={store.logo_url} alt="logo" className="w-20 h-20 rounded-xl object-cover border-4 border-white shadow-md" />
                  : <div className="w-20 h-20 rounded-xl bg-white border-4 border-white shadow-md flex items-center justify-center"><Store className="w-8 h-8 text-purple-600" /></div>}
                <div className="mb-1">
                  <h2 className="text-white text-xl font-bold drop-shadow">{store.name}</h2>
                  {store.is_verified && <Badge className="bg-blue-500 text-white text-xs">✓ Verified</Badge>}
                </div>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>{store ? 'Update your store details' : 'Fill in your store info'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Store Name *</Label>
                    <Input placeholder="e.g., Tunde's Tech Store" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Tell buyers what you sell..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><MapPin className="w-4 h-4" />Campus</Label>
                    <Select value={form.campus} onValueChange={v => setForm({ ...form, campus: v })}>
                      <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {NIGERIAN_CAMPUSES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Phone className="w-4 h-4" />WhatsApp Number</Label>
                    <Input placeholder="2348012345678" value={form.whatsapp_number} onChange={e => setForm({ ...form, whatsapp_number: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1"><Instagram className="w-4 h-4" />Instagram Handle</Label>
                    <Input placeholder="@yourstore" value={form.instagram_handle} onChange={e => setForm({ ...form, instagram_handle: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Store Logo</Label>
                    <div className="flex items-center gap-3">
                      {form.logo_url && <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-xl object-cover" />}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        {uploadingLogo ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <><ImagePlus className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-gray-500">Upload logo</span></>}
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Store Banner</Label>
                    <div className="flex items-center gap-3">
                      {form.banner_url && <img src={form.banner_url} alt="Banner" className="w-24 h-16 rounded-lg object-cover" />}
                      <label className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                        {uploadingBanner ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" /> : <><ImagePlus className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-gray-500">Upload banner</span></>}
                        <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploadingBanner} />
                      </label>
                    </div>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 h-12"
                    onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending || !form.name}>
                    {saveMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />{store ? 'Update Store' : 'Create Store'}</>}
                  </Button>
                  {store && (
                    <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => { if (window.confirm('Delete your store?')) deleteMutation.mutate(); }}
                      disabled={deleteMutation.isPending}>
                      <Trash2 className="w-4 h-4 mr-2" />Delete Store
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Your Listings ({storeListings.length})</h2>
                <Link to={createPageUrl("CreateListing")}>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-1" />Add</Button>
                </Link>
              </div>
              {storeListings.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No listings yet</p>
                    <Link to={createPageUrl("CreateListing")}>
                      <Button size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">Create First Listing</Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {storeListings.slice(0, 6).map(l => <ListingCard key={l.id} listing={l} compact />)}
                  {storeListings.length > 6 && (
                    <Link to={createPageUrl("MyListings")}>
                      <Button variant="outline" className="w-full">View all {storeListings.length} listings</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
