import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Crown, BarChart3, Users, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { featuredListings as featuredApi, visits as visitsApi } from "@/api/supabaseApi";
import { supabase } from "@/lib/supabase";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function AdminMonetization() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user && user.role !== 'admin') navigate(createPageUrl("Home"));
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const adminReady = !!rawUser && user?.role === 'admin';

  const { data: featured = [], isLoading } = useQuery({
    queryKey: ['featuredAll'],
    queryFn: () => featuredApi.getAll(),
    enabled: adminReady
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: adminReady
  });

  const { data: totalVisits = 0 } = useQuery({
    queryKey: ['totalVisits'],
    queryFn: () => visitsApi.getTotalCount(),
    enabled: adminReady
  });

  const { data: uniqueVisitors = 0 } = useQuery({
    queryKey: ['uniqueVisitors'],
    queryFn: () => visitsApi.getUniqueVisitorCount(),
    enabled: adminReady
  });

  const { data: visitsToday = 0 } = useQuery({
    queryKey: ['visitsToday'],
    queryFn: () => visitsApi.getRecentCount(1),
    enabled: adminReady
  });

  const { data: dailyVisits = [] } = useQuery({
    queryKey: ['dailyVisits'],
    queryFn: () => visitsApi.getDailyBreakdown(14),
    enabled: adminReady
  });

  const totalRevenue = featured.reduce((sum, f) => sum + (f.price_paid || 0), 0);
  const activeFeatured = featured.filter(f => new Date(f.ends_at) > new Date()).length;
  const sellers = profiles.filter(p => p.user_type === 'seller').length;
  const buyers = profiles.filter(p => p.user_type === 'buyer').length;

  const fmt = p => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoadingAuth || isLoading) return (
    <div className="min-h-screen py-8" style={{ background: 'var(--brand-cream)' }}>
      <div className="max-w-6xl mx-auto px-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--brand-cream)' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--brand-gold-light)' }}>
            <BarChart3 className="w-5 h-5" style={{ color: 'var(--brand-gold)' }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>Admin: Revenue & Traffic</h1>
            <p className="text-gray-500 text-sm">Monitor monetization, users, and site visitors</p>
          </div>
        </div>

        {/* Visitor stats */}
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Site Traffic</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Visits', value: totalVisits.toLocaleString(), icon: Eye, color: '#0F172A' },
            { label: 'Unique Visitors', value: uniqueVisitors.toLocaleString(), icon: Users, color: '#D4A843' },
            { label: 'Visits Today', value: visitsToday.toLocaleString(), icon: TrendingUp, color: '#16A34A' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-gray-100">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-2xl font-black" style={{ color: 'var(--brand-navy)' }}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Visits chart */}
        {dailyVisits.length > 0 && (
          <Card className="border-gray-100 mb-8">
            <CardHeader><CardTitle className="text-base">Visits — Last 14 Days</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dailyVisits}>
                  <defs>
                    <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A843" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#D4A843" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #f1f1f1', fontSize: 12 }} />
                  <Area type="monotone" dataKey="count" stroke="#D4A843" strokeWidth={2} fill="url(#visitFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Revenue stats */}
        <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-3">Monetization & Users</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Revenue', value: fmt(totalRevenue), icon: DollarSign, color: '#16A34A' },
            { label: 'Active Featured', value: activeFeatured, icon: Crown, color: '#D4A843' },
            { label: 'Total Sellers', value: sellers, icon: TrendingUp, color: '#0F172A' },
            { label: 'Total Buyers', value: buyers, icon: Users, color: '#2563EB' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="border-gray-100">
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-black" style={{ color: 'var(--brand-navy)' }}>{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="border-gray-100">
            <CardHeader><CardTitle className="text-base">Featured Listings History</CardTitle></CardHeader>
            <CardContent>
              {featured.length === 0 ? <p className="text-gray-400 text-center py-8 text-sm">No featured listings yet</p> : (
                <div className="space-y-3">
                  {featured.map(f => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'var(--brand-navy)' }}>{f.listings?.title || 'Listing'}</p>
                        <p className="text-xs text-gray-400">{fmtDate(f.created_at)} • {f.plan_days} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-green-600">{fmt(f.price_paid)}</p>
                        <Badge className={new Date(f.ends_at) > new Date() ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} variant="secondary">
                          {new Date(f.ends_at) > new Date() ? 'Active' : 'Expired'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-100">
            <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
            <CardContent>
              {profiles.length === 0 ? <p className="text-gray-400 text-center py-8 text-sm">No users yet</p> : (
                <div className="space-y-3">
                  {profiles.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--brand-navy)' }}>
                          <span className="text-white font-semibold text-sm">{p.full_name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color: 'var(--brand-navy)' }}>{p.full_name || 'No name'}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">{p.user_type || 'unset'}</Badge>
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
