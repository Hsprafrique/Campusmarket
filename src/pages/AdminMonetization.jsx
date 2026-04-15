import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Crown, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { featuredListings as featuredApi } from "@/api/supabaseApi";
import { supabase } from "@/lib/supabase";

export default function AdminMonetization() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user && user.role !== 'admin') navigate(createPageUrl("Home"));
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ['featuredAll'],
    queryFn: () => featuredApi.getAll(),
    enabled: !!rawUser && user?.role === 'admin'
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!rawUser && user?.role === 'admin'
  });

  const totalRevenue = featured.reduce((sum, f) => sum + (f.price_paid || 0), 0);
  const activeFeatured = featured.filter(f => new Date(f.ends_at) > new Date()).length;
  const sellers = profiles.filter(p => p.user_type === 'seller').length;
  const buyers = profiles.filter(p => p.user_type === 'buyer').length;

  const fmt = p => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoadingAuth || isLoading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin: Revenue</h1>
            <p className="text-gray-600">Monitor monetization and user statistics</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
            { label: 'Active Featured', value: activeFeatured, icon: Crown, color: 'text-orange-600', bg: 'bg-orange-100' },
            { label: 'Total Sellers', value: sellers, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'Total Buyers', value: buyers, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center`}>
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-sm text-gray-500">{s.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader><CardTitle>Featured Listings History</CardTitle></CardHeader>
            <CardContent>
              {featured.length === 0 ? <p className="text-gray-500 text-center py-8">No featured listings yet</p> : (
                <div className="space-y-3">
                  {featured.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{f.listings?.title || 'Listing'}</p>
                        <p className="text-xs text-gray-500">{fmtDate(f.created_at)} • {f.plan_days} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{fmt(f.price_paid)}</p>
                        <Badge className={new Date(f.ends_at) > new Date() ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'} variant="secondary">
                          {new Date(f.ends_at) > new Date() ? 'Active' : 'Expired'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Users</CardTitle></CardHeader>
            <CardContent>
              {profiles.length === 0 ? <p className="text-gray-500 text-center py-8">No users yet</p> : (
                <div className="space-y-3">
                  {profiles.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold text-sm">{p.full_name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{p.full_name || 'No name'}</p>
                          <p className="text-xs text-gray-500">{p.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">{p.user_type || 'unset'}</Badge>
                        <p className="text-xs text-gray-400 mt-1">{p.subscription_plan || 'free'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
