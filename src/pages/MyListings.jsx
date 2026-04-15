import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";
import { Plus, Trash2, Eye, Package, Crown, Loader2, Clock } from "lucide-react";
import { CATEGORIES } from "../components/NigerianCampuses";
import { useAuth } from "@/lib/AuthContext";
import { listings as listingsApi } from "@/api/supabaseApi";

export default function MyListings() {
  const navigate = useNavigate();
  const { user, rawUser, isAuthenticated, isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) navigate(createPageUrl("Auth"));
  }, [isLoadingAuth, isAuthenticated]);

  const { data: myListings = [], isLoading } = useQuery({
    queryKey: ['myListings', rawUser?.id],
    queryFn: () => listingsApi.getMyListings(rawUser.id),
    enabled: !!rawUser?.id
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => listingsApi.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['myListings'])
  });

  const deleteMutation = useMutation({
    mutationFn: id => listingsApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries(['myListings']); setDeleteId(null); }
  });

  const fmt = price => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(price);
  const daysLeft = (expiresAt) => {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt) - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const plan = user?.subscription_plan || 'free';
  const maxListings = plan === 'free' ? 1 : plan === 'basic' ? 3 : Infinity;
  const activeCount = myListings.filter(l => l.is_active).length;
  const canCreate = activeCount < maxListings;

  if (isLoadingAuth || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" /><Skeleton className="h-10 w-32" />
          </div>
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl mb-4" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600">{activeCount} of {maxListings === Infinity ? '∞' : maxListings} active listings</p>
          </div>
          <div className="flex gap-3">
            {plan !== 'premium' && (
              <Link to={createPageUrl("Pricing")}>
                <Button variant="outline"><Crown className="w-4 h-4 mr-2" />Upgrade</Button>
              </Link>
            )}
            <Link to={createPageUrl("CreateListing")}>
              <Button className="bg-purple-600 hover:bg-purple-700" disabled={!canCreate}>
                <Plus className="w-4 h-4 mr-2" />New Listing
              </Button>
            </Link>
          </div>
        </div>

        {myListings.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-600 mb-6">Create your first listing and start selling on campus!</p>
              <Link to={createPageUrl("CreateListing")}>
                <Button className="bg-purple-600 hover:bg-purple-700"><Plus className="w-4 h-4 mr-2" />Create First Listing</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myListings.map((listing, index) => {
              const cat = CATEGORIES.find(c => c.value === listing.category);
              const days = daysLeft(listing.expires_at);
              return (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="w-full sm:w-40 h-32 sm:h-auto overflow-hidden flex-shrink-0">
                          <img src={listing.images?.[0] || "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&h=150&fit=crop"}
                            alt={listing.title} className="w-full h-full object-cover"
                            onError={e => { e.target.src = "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=200&h=150&fit=crop"; }} />
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                                <Badge className={listing.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}>
                                  {listing.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                <Badge className={
                                  listing.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                                  listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }>
                                  {listing.status?.charAt(0).toUpperCase() + listing.status?.slice(1)}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-500 mb-1">{cat?.icon} {cat?.label} • {listing.campus}</p>
                              <p className="text-xl font-bold text-purple-600 mb-1">{fmt(listing.price)}</p>
                              {days !== null && (
                                <p className={`text-xs flex items-center gap-1 ${days <= 3 ? 'text-red-500' : 'text-gray-400'}`}>
                                  <Clock className="w-3 h-3" />{days > 0 ? `Expires in ${days} days` : 'Expired'}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">{listing.is_active ? 'On' : 'Off'}</span>
                              <Switch checked={listing.is_active}
                                onCheckedChange={checked => toggleMutation.mutate({ id: listing.id, is_active: checked })}
                                disabled={!listing.is_active && activeCount >= maxListings} />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Link to={`${createPageUrl("Browse")}?search=${encodeURIComponent(listing.title)}`}>
                              <Button size="sm" variant="outline"><Eye className="w-4 h-4 mr-1" />View</Button>
                            </Link>
                            {!listing.is_featured && listing.status === 'approved' && (
                              <Link to={`${createPageUrl("FeatureListing")}?listing=${listing.id}`}>
                                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-purple-600 text-white">
                                  <Crown className="w-4 h-4 mr-1" />Feature
                                </Button>
                              </Link>
                            )}
                            <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50"
                              onClick={() => setDeleteId(listing.id)}>
                              <Trash2 className="w-4 h-4 mr-1" />Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate(deleteId)} className="bg-red-600 hover:bg-red-700">
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
