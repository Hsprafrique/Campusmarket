import React, { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Check, X, Loader2, Shield, ExternalLink } from "lucide-react";
import { CATEGORIES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi } from "@/api/supabaseApi";

export default function AdminListings() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoadingAuth) {
      if (!isAuthenticated) { navigate(createPageUrl("Auth")); return; }
      if (user && user.role !== 'admin') navigate(createPageUrl("Home"));
    }
  }, [isLoadingAuth, isAuthenticated, user]);

  const { data: allListings = [], isLoading } = useQuery({
    queryKey: ['adminListings'],
    queryFn: () => listingsApi.getAll(),
    enabled: !!rawUser && user?.role === 'admin'
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }) => listingsApi.updateStatus(id, status, user.email),
    onSuccess: () => queryClient.invalidateQueries(['adminListings'])
  });

  const fmt = p => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(p);
  const fmtDate = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const pending = allListings.filter(l => l.status === 'pending');
  const approved = allListings.filter(l => l.status === 'approved');
  const rejected = allListings.filter(l => l.status === 'rejected');

  if (isLoadingAuth || isLoading) return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
      </div>
    </div>
  );

  const ListingItem = ({ listing }) => {
    const cat = CATEGORIES.find(c => c.value === listing.category);
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-32 h-24 overflow-hidden flex-shrink-0">
              <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&h=150&fit=crop"}
                alt={listing.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 p-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{cat?.icon} {cat?.label} • {listing.campus}</p>
                  <p className="text-sm text-gray-500">By: {listing.seller_name} ({listing.seller_email})</p>
                  <p className="font-bold text-purple-600">{fmt(listing.price)}</p>
                  <p className="text-xs text-gray-400">Submitted: {fmtDate(listing.created_at)}</p>
                  {listing.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{listing.description}</p>}
                </div>
                {listing.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button size="sm" onClick={() => approveMutation.mutate({ id: listing.id, status: 'approved' })}
                      className="bg-green-600 hover:bg-green-700" disabled={approveMutation.isPending}>
                      <Check className="w-4 h-4 mr-1" />Approve
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => approveMutation.mutate({ id: listing.id, status: 'rejected' })}
                      disabled={approveMutation.isPending}>
                      <X className="w-4 h-4 mr-1" />Reject
                    </Button>
                  </div>
                )}
                {listing.status !== 'pending' && (
                  <Badge className={listing.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin: Listings</h1>
            <p className="text-gray-600">Review and approve seller listings</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[{ label: 'Pending', count: pending.length, color: 'yellow' }, { label: 'Approved', count: approved.length, color: 'green' }, { label: 'Rejected', count: rejected.length, color: 'red' }].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{s.count}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            {pending.length === 0 ? <p className="text-gray-500 text-center py-12">No pending listings</p> : (
              <div className="space-y-4">{pending.map(l => <ListingItem key={l.id} listing={l} />)}</div>
            )}
          </TabsContent>
          <TabsContent value="approved">
            <div className="space-y-4">{approved.map(l => <ListingItem key={l.id} listing={l} />)}</div>
          </TabsContent>
          <TabsContent value="rejected">
            <div className="space-y-4">{rejected.map(l => <ListingItem key={l.id} listing={l} />)}</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
