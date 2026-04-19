import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Crown, TrendingUp, Eye, Zap, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi, featuredListings as featuredApi } from "@/api/supabaseApi";
import { supabase } from "@/lib/supabase";

const FEATURED_PLANS = [
  { id: "3days", days: 3, price: 500, name: "3 Days", description: "Quick boost", popular: false },
  { id: "7days", days: 7, price: 1000, name: "1 Week", description: "Standard boost", popular: true },
  { id: "14days", days: 14, price: 1800, name: "2 Weeks", description: "Extended boost", popular: false },
  { id: "30days", days: 30, price: 3000, name: "1 Month", description: "Maximum visibility", popular: false }
];

export default function FeatureListing() {
  const navigate = useNavigate();
  const { rawUser, user, isAuthenticated, isLoadingAuth } = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const listingId = urlParams.get('listing');
  const [selectedPlan, setSelectedPlan] = useState("7days");

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
  }, [isLoadingAuth, isAuthenticated]);

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const { data, error } = await supabase.from('listings').select('*').eq('id', listingId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!listingId && !!rawUser
  });

  const featureMutation = useMutation({
    mutationFn: async (plan) => {
      const endsAt = new Date(Date.now() + plan.days * 24 * 60 * 60 * 1000).toISOString();
      await featuredApi.create({
        listing_id: listingId,
        seller_id: rawUser.id,
        plan_days: plan.days,
        price_paid: plan.price,
        ends_at: endsAt
      });
      await listingsApi.update(listingId, {
        is_featured: true,
        featured_until: endsAt
      });
    },
    onSuccess: () => navigate(createPageUrl("MyListings"))
  });

  const handlePurchase = () => {
    const plan = FEATURED_PLANS.find(p => p.id === selectedPlan);
    if (window.confirm(`Feature "${listing?.title}" for ₦${plan.price.toLocaleString()}?\n\n(Payment integration can be added — this demo activates featuring directly.)`)) {
      featureMutation.mutate(plan);
    }
  };

  if (isLoadingAuth || !listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
    </div>
  );

  const plan = FEATURED_PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Feature Your Listing</h1>
            <p className="text-gray-600">Get more visibility and sell faster</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[{ icon: TrendingUp, text: "Top of search results", color: "text-purple-600" }, { icon: Eye, text: "10x more visibility", color: "text-orange-600" }, { icon: Zap, text: "Sell 3x faster", color: "text-green-600" }].map((b, i) => (
              <Card key={i} className="text-center p-4">
                <b.icon className={`w-8 h-8 ${b.color} mx-auto mb-2`} />
                <p className="text-sm font-medium text-gray-700">{b.text}</p>
              </Card>
            ))}
          </div>

          <Card className="mb-8">
            <CardHeader><CardTitle className="text-lg">Listing to Feature</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=100&h=100&fit=crop"}
                  alt={listing.title} className="w-20 h-20 object-cover rounded-lg" />
                <div>
                  <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                  <p className="text-lg font-bold text-purple-600">₦{listing.price?.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Choose Featured Duration</CardTitle>
              <CardDescription>Select how long you want your listing featured</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="space-y-3">
                  {FEATURED_PLANS.map(p => (
                    <Label key={p.id} htmlFor={p.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedPlan === p.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-4">
                        <RadioGroupItem value={p.id} id={p.id} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{p.name}</span>
                            {p.popular && <Badge className="bg-orange-500">Most Popular</Badge>}
                          </div>
                          <p className="text-sm text-gray-500">{p.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">₦{p.price.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">₦{Math.round(p.price / p.days)}/day</p>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900 mb-1">What you get:</p>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>• Priority placement in search results</li>
                      <li>• Featured badge on your listing</li>
                      <li>• Shown first on browse page</li>
                      <li>• Higher visibility across campus</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white h-12"
                onClick={handlePurchase} disabled={featureMutation.isPending}>
                {featureMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <><Crown className="w-5 h-5 mr-2" />Feature for ₦{plan.price.toLocaleString()}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
